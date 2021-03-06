<template>
  <section class="section">
    <h1 class="title">Add/Update Song</h1>
    <b-field label="Song ID">
      <b-field grouped>
        <b-input
          v-model="id"
          maxlength="32"
          required
          pattern="^[01689bdiloqDIOPQ]{32}$"
        />
        <div class="control">
          <b-button
            type="is-primary"
            :disabled="!isValidSongId"
            @click="loadSongInfo()"
          >
            Load
          </b-button>
          <b-button
            tag="a"
            type="is-info"
            :disabled="!isValidSongId"
            :href="`https://p.eagate.573.jp/game/ddr/ddra20/p/images/binary_jk.html?img=${id}`"
            target="_blank"
          >
            See Thumbnail
          </b-button>
        </div>
      </b-field>
    </b-field>

    <b-field label="Name">
      <b-input v-model="name" required />
    </b-field>

    <b-field label="Furigana">
      <b-input
        v-model="nameKana"
        required
        pattern="^[A-Z0-9 .ぁ-んー]+$"
        placeholder="A-Z 0-9 . あ-ん ー"
      />
    </b-field>

    <b-field label="Artist">
      <b-input v-model="artist" />
    </b-field>

    <b-field label="Series">
      <b-select v-model="series" placeholder="Series">
        <option v-for="name in seriesList" :key="name" :value="name">
          {{ name }}
        </option>
      </b-select>
    </b-field>

    <b-field label="BPM">
      <b-field grouped>
        <b-input v-model.number="minBPM" type="number" placeholder="min" />
        <span class="control">-</span>
        <b-input v-model.number="maxBPM" type="number" placeholder="max" />
      </b-field>
    </b-field>

    <b-field v-for="(chart, i) in charts" :key="i" :label="`Chart ${i + 1}`">
      <b-field grouped group-multiline>
        <b-field
          :type="{ 'is-danger': hasDuplicateKey(chart) }"
          :message="{
            'Duplicate PlayStyle and Difficulty': hasDuplicateKey(chart),
          }"
        >
          <b-select v-model.number="chart.playStyle" placeholder="PlayStyle">
            <option
              v-for="option in playStyleList"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </b-select>
          <b-select v-model.number="chart.difficulty" placeholder="Difficulty">
            <option
              v-for="option in difficultyList"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </b-select>
          <b-input
            v-model.number="chart.level"
            placeholder="Level"
            type="number"
            min="1"
            max="20"
            required
          />
        </b-field>
        <b-field>
          <b-input
            v-model.number="chart.notes"
            placeholder="Notes"
            type="number"
            min="0"
            max="9999"
            required
          />
          <b-input
            v-model.number="chart.freezeArrow"
            placeholder="FA"
            type="number"
            min="0"
            max="9999"
            required
          />
          <b-input
            v-model.number="chart.shockArrow"
            placeholder="SA"
            type="number"
            min="0"
            max="9999"
            required
          />
        </b-field>
        <b-field>
          <b-input
            v-model.number="chart.stream"
            placeholder="Str"
            type="number"
            min="0"
            max="300"
            required
          />
          <b-input
            v-model.number="chart.voltage"
            placeholder="Vol"
            type="number"
            min="0"
            max="300"
            required
          />
          <b-input
            v-model.number="chart.air"
            placeholder="Air"
            type="number"
            min="0"
            max="300"
            required
          />
          <b-input
            v-model.number="chart.freeze"
            placeholder="Fre"
            type="number"
            min="0"
            max="300"
            required
          />
          <b-input
            v-model.number="chart.chaos"
            placeholder="Cha"
            type="number"
            min="0"
            max="300"
            required
          />
        </b-field>
        <b-button type="is-danger" icon-left="delete" @click="removeChart(i)" />
      </b-field>
    </b-field>
    <b-field>
      <b-button type="is-info" icon-left="plus" @click="addChart()">
        Add Chart
      </b-button>
    </b-field>

    <b-field>
      <b-button type="is-success" :disabled="hasError" @click="saveSongInfo()">
        Save
      </b-button>
    </b-field>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

import { postSongInfo } from '~/api/admin'
import { getSongInfo, SeriesList, SongInfo, StepChart } from '~/api/song'
import * as popup from '~/utils/popup'

@Component
export default class SongEditorPage extends Vue implements SongInfo {
  id: string = ''
  name: string = ''
  nameKana: string = ''
  artist: string = ''
  series: string = ''
  minBPM: number | null = null
  maxBPM: number | null = null
  charts: StepChart[] = []

  readonly playStyleList = [
    { label: 'SINGLE', value: 1 } as const,
    { label: 'DOUBLE', value: 2 } as const,
  ]

  readonly difficultyList = [
    { label: 'BEGINNER', value: 0 },
    { label: 'BASIC', value: 1 },
    { label: 'DIFFICULT', value: 2 },
    { label: 'EXPERT', value: 3 },
    { label: 'CHALLENGE', value: 4 },
  ]

  readonly seriesList = SeriesList

  get nameIndex() {
    return /^[ぁ-お]/.test(this.nameKana)
      ? 0
      : /^[か-ご]/.test(this.nameKana)
      ? 1
      : /^[さ-ぞ]/.test(this.nameKana)
      ? 2
      : /^[た-ど]/.test(this.nameKana)
      ? 3
      : /^[な-の]/.test(this.nameKana)
      ? 4
      : /^[は-ぽ]/.test(this.nameKana)
      ? 5
      : /^[ま-も]/.test(this.nameKana)
      ? 6
      : /^[ゃ-よ]/.test(this.nameKana)
      ? 7
      : /^[ら-ろ]/.test(this.nameKana)
      ? 8
      : /^[ゎ-ん]/.test(this.nameKana)
      ? 9
      : this.nameKana[0] === 'A'
      ? 10
      : this.nameKana[0] === 'B'
      ? 11
      : this.nameKana[0] === 'C'
      ? 12
      : this.nameKana[0] === 'D'
      ? 13
      : this.nameKana[0] === 'E'
      ? 14
      : this.nameKana[0] === 'F'
      ? 15
      : this.nameKana[0] === 'G'
      ? 16
      : this.nameKana[0] === 'H'
      ? 17
      : this.nameKana[0] === 'I'
      ? 18
      : this.nameKana[0] === 'J'
      ? 19
      : this.nameKana[0] === 'K'
      ? 20
      : this.nameKana[0] === 'L'
      ? 21
      : this.nameKana[0] === 'M'
      ? 22
      : this.nameKana[0] === 'N'
      ? 23
      : this.nameKana[0] === 'O'
      ? 24
      : this.nameKana[0] === 'P'
      ? 25
      : this.nameKana[0] === 'Q'
      ? 26
      : this.nameKana[0] === 'R'
      ? 27
      : this.nameKana[0] === 'S'
      ? 28
      : this.nameKana[0] === 'T'
      ? 29
      : this.nameKana[0] === 'U'
      ? 30
      : this.nameKana[0] === 'V'
      ? 31
      : this.nameKana[0] === 'W'
      ? 32
      : this.nameKana[0] === 'X'
      ? 33
      : this.nameKana[0] === 'Y'
      ? 34
      : this.nameKana[0] === 'Z'
      ? 35
      : 36
  }

  get isValidSongId() {
    return /^[01689bdiloqDIOPQ]{32}$/.test(this.id)
  }

  get hasError() {
    return (
      !this.isValidSongId ||
      !this.name ||
      !/^[A-Z0-9 .ぁ-んー]+$/.test(this.nameKana) ||
      !this.artist ||
      !SeriesList.includes(this.series) ||
      !this.minBPM !== !this.maxBPM ||
      this.charts.length === 0 ||
      this.charts.some(c => this.hasDuplicateKey(c))
    )
  }

  addChart() {
    this.charts.push({
      playStyle: 1,
      difficulty: 0,
      level: 1,
      notes: 0,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 0,
      voltage: 0,
      air: 0,
      freeze: 0,
      chaos: 0,
    })
  }

  removeChart(index: number) {
    this.charts.splice(index, 1)
  }

  hasDuplicateKey(chart: StepChart) {
    return (
      this.charts.filter(
        c =>
          c.playStyle === chart.playStyle && c.difficulty === chart.difficulty
      ).length !== 1
    )
  }

  async loadSongInfo() {
    if (!this.isValidSongId) return
    try {
      const songInfo = await getSongInfo(this.$http, this.id)
      this.name = songInfo.name
      this.nameKana = songInfo.nameKana
      this.artist = songInfo.artist
      this.series = songInfo.series
      this.minBPM = songInfo.minBPM
      this.maxBPM = songInfo.maxBPM
      this.charts = songInfo.charts
    } catch (error) {
      popup.danger(this.$buefy, error.message ?? error)
    }
  }

  saveSongInfo() {
    this.$buefy.dialog.confirm({
      message: 'Add or update this?',
      onConfirm: async () => {
        try {
          await this.callPostAPI()
          popup.success(this.$buefy, 'Success!')
        } catch (error) {
          popup.danger(this.$buefy, error.message ?? error)
        }
      },
    })
  }

  private async callPostAPI() {
    const postData: SongInfo = {
      id: this.id,
      name: this.name,
      nameKana: this.nameKana,
      nameIndex: this.nameIndex,
      artist: this.artist,
      series: this.series,
      minBPM: this.minBPM ? this.minBPM : null,
      maxBPM: this.maxBPM ? this.maxBPM : null,
      charts: this.charts.sort((l, r) =>
        l.playStyle === r.playStyle
          ? l.difficulty - r.difficulty
          : l.playStyle - r.playStyle
      ),
    }
    const songInfo = await postSongInfo(this.$http, postData)
    this.name = songInfo.name
    this.nameKana = songInfo.nameKana
    this.artist = songInfo.artist
    this.series = songInfo.series
    this.minBPM = songInfo.minBPM
    this.maxBPM = songInfo.maxBPM
    this.charts = songInfo.charts
  }
}
</script>
