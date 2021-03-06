import { DanceLevel, DanceLevelList, ScoreSchema } from './db/scores'
import type { StepChartSchema } from './db/songs'
import { hasIntegerProperty, hasStringProperty } from './type-assert'

export type Score = Pick<
  ScoreSchema,
  'score' | 'clearLamp' | 'exScore' | 'maxCombo' | 'rank'
>

export function isScore(obj: unknown): obj is Score {
  return (
    hasIntegerProperty(obj, 'score', 'clearLamp') &&
    obj.score >= 0 &&
    obj.score <= 1000000 &&
    obj.clearLamp >= 0 &&
    obj.clearLamp <= 7 &&
    (hasIntegerProperty(obj, 'exScore') ||
      (obj as Record<string, unknown>).exScore === undefined) &&
    (hasIntegerProperty(obj, 'maxCombo') ||
      (obj as Record<string, unknown>).maxCombo === undefined) &&
    hasStringProperty(obj, 'rank') &&
    (DanceLevelList as string[]).includes(obj.rank)
  )
}

export function mergeScore(
  left: Readonly<Score>,
  right: Readonly<Score>
): Score {
  const result: Score = {
    score: left.score > right.score ? left.score : right.score,
    clearLamp:
      left.clearLamp > right.clearLamp ? left.clearLamp : right.clearLamp,
    rank: left.score > right.score ? left.rank : right.rank,
  }
  const exScore =
    (left.exScore ?? 0) > (right.exScore ?? 0) ? left.exScore : right.exScore
  if (exScore !== undefined) result.exScore = exScore
  const maxCombo =
    (left.maxCombo ?? 0) > (right.maxCombo ?? 0)
      ? left.maxCombo
      : right.maxCombo
  if (maxCombo !== undefined) result.maxCombo = maxCombo
  return result
}

export function isValidScore(
  {
    notes,
    freezeArrow,
    shockArrow,
  }: Readonly<Pick<StepChartSchema, 'notes' | 'freezeArrow' | 'shockArrow'>>,
  { clearLamp, exScore, maxCombo }: Readonly<Omit<Score, 'score' | 'rank'>>
): boolean {
  const maxExScore = (notes + freezeArrow + shockArrow) * 3
  const fullCombo = notes + shockArrow

  if (exScore) {
    if (
      !isPositiveInteger(exScore) ||
      exScore > maxExScore ||
      (clearLamp !== 7 && exScore === maxExScore) || // EX SCORE is MAX, but not MFC
      (clearLamp !== 6 && exScore === maxExScore - 1) || // EX SCORE is P1, but not PFC
      (clearLamp < 5 && exScore === maxExScore - 2) // EX SCORE is Gr1 or P2, but not Great FC or PFC
    )
      return false
  }

  // Do not check maxCombo because "MAX COMBO is fullCombo, but not FC" pattern is exists.
  // ex. missed last Freeze Arrow
  return !maxCombo || (isPositiveInteger(maxCombo) && maxCombo <= fullCombo)
}

export function getDanceLevel(score: number): Exclude<DanceLevel, 'E'> {
  if (!isPositiveInteger(score))
    throw new RangeError(
      `Invalid parameter: score(${score}) should be positive integer or 0.`
    )
  if (score > 1000000)
    throw new RangeError(
      `Invalid parameter: score(${score}) should be less than or equal to 1000000.`
    )
  const rankList = [
    { border: 990000, rank: 'AAA' },
    { border: 950000, rank: 'AA+' },
    { border: 900000, rank: 'AA' },
    { border: 890000, rank: 'AA-' },
    { border: 850000, rank: 'A+' },
    { border: 800000, rank: 'A' },
    { border: 790000, rank: 'A-' },
    { border: 750000, rank: 'B+' },
    { border: 700000, rank: 'B' },
    { border: 690000, rank: 'B-' },
    { border: 650000, rank: 'C+' },
    { border: 600000, rank: 'C' },
    { border: 590000, rank: 'C-' },
    { border: 550000, rank: 'D+' },
  ] as const
  for (const { border, rank } of rankList) {
    if (score >= border) return rank
  }
  return 'D'
}

const isPositiveInteger = (num: number) => Number.isInteger(num) && num >= 0
