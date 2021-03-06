import type { Context, HttpRequest } from '@azure/functions'

import { getClientPrincipal, getLoginUserInfo } from '../auth'
import { getContainer } from '../cosmos'
import type { ScoreSchema, SongSchema, UserSchema } from '../db'
import type { StepChartSchema } from '../db/songs'
import type {
  BadRequestResult,
  NotFoundResult,
  SuccessResult,
  UnauthenticatedResult,
} from '../function'
import {
  getDanceLevel,
  isScore,
  isValidScore,
  mergeScore,
  Score,
} from '../score'
import { hasIntegerProperty, hasProperty } from '../type-assert'

type ScoreBody = Score &
  Pick<ScoreSchema, 'playStyle' | 'difficulty'> & { topScore?: number }

type ChartInfo = Pick<
  StepChartSchema,
  'playStyle' | 'difficulty' | 'notes' | 'freezeArrow' | 'shockArrow'
> &
  Pick<SongSchema, 'name'>

/** Add or update score that match the specified chart. */
export default async function (
  context: Pick<Context, 'bindingData'>,
  req: Pick<HttpRequest, 'headers' | 'body'>
): Promise<
  | BadRequestResult
  | UnauthenticatedResult
  | NotFoundResult
  | SuccessResult<ScoreSchema[]>
> {
  const clientPrincipal = getClientPrincipal(req)
  if (!clientPrincipal) return { status: 401 }

  const songId: string = context.bindingData.songId

  // In Azure Functions, this function will only be invoked if a valid route.
  // So this check is only used to unit tests.
  if (!/^[01689bdiloqDIOPQ]{32}$/.test(songId)) {
    return { status: 404 }
  }

  if (!isValidBody(req.body)) {
    return { status: 400, body: 'body is not Score[]' }
  }

  const user = await getLoginUserInfo(clientPrincipal)
  if (!user) {
    return {
      status: 404,
      body: `Unregistered user: { platform: ${clientPrincipal.identityProvider}, id: ${clientPrincipal.userDetails} }`,
    }
  }

  // Get chart info
  const container = getContainer('Songs', true)
  const { resources: charts } = await container.items
    .query<ChartInfo>({
      query:
        'SELECT s.name, c.playStyle, c.difficulty, c.notes, c.freezeArrow, c.shockArrow ' +
        'FROM s JOIN c IN s.charts ' +
        'WHERE s.id = @songId',
      parameters: [{ name: '@songId', value: songId }],
    })
    .fetchAll()
  if (charts.length === 0) return { status: 404 }

  const topScores: ScoreSchema[] = []
  const body: ScoreSchema[] = []
  for (let i = 0; i < req.body.length; i++) {
    const score = req.body[i]
    const chart = charts.find(
      c => c.playStyle === score.playStyle && c.difficulty === score.difficulty
    )
    if (!chart) return { status: 404 }
    if (!isValidScore(chart, score))
      return { status: 400, body: `body[${i}] is invalid Score` }

    body.push(createSchema(chart, user, score))

    // World Record
    if (score.topScore) {
      const clearLamp =
        score.topScore === 1000000 ? 7 : score.topScore > 999500 ? 6 : 2
      const topScore: Score = {
        score: score.topScore,
        clearLamp,
        rank: getDanceLevel(score.topScore),
      }
      topScores.push(
        createSchema(chart, { id: '0', name: '0', isPublic: false }, topScore)
      )
    } else if (user.isPublic) {
      topScores.push(
        createSchema(chart, { id: '0', name: '0', isPublic: false }, score)
      )
    }

    // Area Top
    if (user.isPublic && user.area) {
      const area = `${user.area}`
      topScores.push(
        createSchema(chart, { id: area, name: area, isPublic: false }, score)
      )
    }
  }

  await Promise.all(body.map(s => upsertScore(s)))
  await Promise.all(topScores.map(s => upsertScore(s)))

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body,
  }

  /** Assert request body is valid schema. */
  function isValidBody(body: unknown): body is ScoreBody[] {
    return (
      Array.isArray(body) && body.length > 0 && body.every(d => isScoreBody(d))
    )

    function isScoreBody(obj: unknown): obj is ScoreBody {
      return (
        isScore(obj) &&
        hasIntegerProperty(obj, 'playStyle', 'difficulty') &&
        [1, 2].includes(obj.playStyle) &&
        [0, 1, 2, 3, 4].includes(obj.difficulty) &&
        (!hasProperty(obj, 'topScore') || hasIntegerProperty(obj, 'topScore'))
      )
    }
  }

  /**
   * Create ScoreSchema from chart, User and score.
   * Also complement exScore and maxCombo.
   */
  function createSchema(
    chart: ChartInfo,
    user: Pick<UserSchema, 'id' | 'name' | 'isPublic'>,
    score: Score
  ) {
    const scoreSchema: ScoreSchema = {
      id: `${user.id}-${songId}-${chart.playStyle}-${chart.difficulty}`,
      userId: user.id,
      userName: user.name,
      isPublic: user.isPublic,
      songId,
      songName: charts[0].name,
      playStyle: chart.playStyle,
      difficulty: chart.difficulty,
      score: score.score,
      clearLamp: score.clearLamp,
      rank: score.rank,
    }
    if (score.exScore) scoreSchema.exScore = score.exScore
    if (score.maxCombo) scoreSchema.maxCombo = score.maxCombo
    if (!scoreSchema.exScore && score.clearLamp >= 6) {
      const exScore = (chart.notes + chart.freezeArrow + chart.shockArrow) * 3
      scoreSchema.exScore = exScore - (1000000 - score.score) / 10
    }
    if (score.clearLamp >= 4) {
      scoreSchema.maxCombo = chart.notes + chart.shockArrow
    }
    return scoreSchema
  }

  /** Upsert ScoreSchema. Score is merged old one. */
  async function upsertScore(score: ScoreSchema): Promise<void> {
    const container = getContainer('Scores')

    // Get previous score
    const { resources } = await container.items
      .query<ScoreSchema>({
        query: 'SELECT * FROM c WHERE c.id = @id',
        parameters: [{ name: '@id', value: score.id }],
      })
      .fetchAll()
    const oldScore = resources[0] ?? {
      score: 0,
      rank: 'E',
      clearLamp: 0,
    }

    const mergedScore = {
      ...mergeScore(oldScore, score),
      id: score.id,
      userId: score.userId,
      userName: score.userName,
      isPublic: score.isPublic,
      songId: score.songId,
      songName: score.songName,
      playStyle: score.playStyle,
      difficulty: score.difficulty,
    }
    if (
      mergedScore.score === oldScore.score &&
      mergedScore.clearLamp === oldScore.clearLamp &&
      mergedScore.exScore === oldScore.exScore &&
      mergedScore.maxCombo === oldScore.maxCombo &&
      mergedScore.rank === oldScore.rank
    ) {
      return
    }
    await container.items.upsert(mergedScore)
  }
}
