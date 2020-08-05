import { Context } from '@nuxt/types'
import { createLocalVue, mount, shallowMount } from '@vue/test-utils'
import Buefy from 'buefy'

import SongPage from '~/pages/songs/_id/_chart.vue'
import type { SongInfo, StepChart } from '~/types/api/song'

const localVue = createLocalVue()
localVue.use(Buefy)

const song: SongInfo = {
  id: '8Il6980di8P89lil1PDIqqIbiq1QO8lQ',
  name: 'MAKE IT BETTER',
  nameKana: 'MAKE IT BETTER',
  nameIndex: 22,
  artist: 'mitsu-O!',
  series: 'DDR 1st',
  minBPM: 119,
  maxBPM: 119,
  charts: [
    {
      playStyle: 1,
      difficulty: 0,
      level: 3,
      notes: 67,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 14,
      voltage: 14,
      air: 9,
      freeze: 0,
      chaos: 0,
    },
    {
      playStyle: 1,
      difficulty: 1,
      level: 7,
      notes: 143,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 31,
      voltage: 29,
      air: 47,
      freeze: 0,
      chaos: 3,
    },
    {
      playStyle: 1,
      difficulty: 2,
      level: 9,
      notes: 188,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 41,
      voltage: 39,
      air: 27,
      freeze: 0,
      chaos: 13,
    },
    {
      playStyle: 1,
      difficulty: 3,
      level: 12,
      notes: 212,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 46,
      voltage: 39,
      air: 54,
      freeze: 0,
      chaos: 19,
    },
    {
      playStyle: 2,
      difficulty: 1,
      level: 7,
      notes: 130,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 28,
      voltage: 29,
      air: 61,
      freeze: 0,
      chaos: 1,
    },
    {
      playStyle: 2,
      difficulty: 2,
      level: 9,
      notes: 181,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 40,
      voltage: 39,
      air: 30,
      freeze: 0,
      chaos: 11,
    },
    {
      playStyle: 2,
      difficulty: 3,
      level: 11,
      notes: 220,
      freezeArrow: 0,
      shockArrow: 0,
      stream: 48,
      voltage: 54,
      air: 27,
      freeze: 0,
      chaos: 41,
    },
  ],
}

describe('pages/songs/:id/:chart', () => {
  test('rendars correctly', () => {
    const wrapper = mount(SongPage, {
      localVue,
      data: () => ({ song, playStyle: 1, difficulty: 0 }),
    })
    expect(wrapper).toMatchSnapshot()
  })
  describe('get singleCharts()', () => {
    test('returns [] if song is null', () => {
      // Arrange
      const wrapper = shallowMount(SongPage, { localVue })

      // Act
      // @ts-ignore
      const charts: StepChart[] = wrapper.vm.singleCharts

      // Assert
      expect(charts).toHaveLength(0)
    })
    test('returns StepCharts that playStyle: 1', () => {
      // Arrange
      const wrapper = shallowMount(SongPage, {
        localVue,
        data: () => ({ song }),
      })

      // Act
      // @ts-ignore
      const charts: StepChart[] = wrapper.vm.singleCharts

      // Assert
      expect(charts).toHaveLength(4)
    })
  })
  describe('get doubleCharts()', () => {
    test('returns [] if song is null', () => {
      // Arrange
      const wrapper = shallowMount(SongPage, { localVue })

      // Act
      // @ts-ignore
      const charts: StepChart[] = wrapper.vm.doubleCharts

      // Assert
      expect(charts).toHaveLength(0)
    })
    test('returns StepCharts that playStyle: 2', () => {
      // Arrange
      const wrapper = shallowMount(SongPage, {
        localVue,
        data: () => ({ song }),
      })

      // Act
      // @ts-ignore
      const charts: StepChart[] = wrapper.vm.doubleCharts

      // Assert
      expect(charts).toHaveLength(3)
    })
  })
  describe('get displayedBPM()', () => {
    test('returns ??? if song is null', () => {
      // Arrange
      const wrapper = shallowMount(SongPage, { localVue })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.displayedBPM).toBe('???')
    })
    test('returns ??? if song BPM is undefined', () => {
      // Arrange
      const wrapper = shallowMount(SongPage, {
        localVue,
        data: () => ({
          song: { ...song, minBPM: undefined, maxBPM: undefined },
        }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.displayedBPM).toBe('???')
    })
    test('returns 000 if song minBPM = maxBPM', () => {
      // Arrange
      const wrapper = shallowMount(SongPage, {
        localVue,
        data: () => ({ song }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.displayedBPM).toBe(`${song.minBPM}`)
    })
    test('returns 000-000 if song minBPM != maxBPM', () => {
      // Arrange
      const wrapper = shallowMount(SongPage, {
        localVue,
        data: () => ({ song: { ...song, minBPM: 100, maxBPM: 400 } }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.displayedBPM).toBe('100-400')
    })
  })
  describe('validate()', () => {
    test.each(['', 'foo', '000000000000000000000000000000000'])(
      '/songs/%s returns false',
      id => {
        // Arrange
        const wrapper = shallowMount(SongPage, { localVue })
        const ctx = ({ params: { id } } as unknown) as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate(ctx)).toBe(false)
      }
    )
    test.each(['00000000000000000000000000000000', song.id])(
      '/songs/%s returns true',
      id => {
        // Arrange
        const wrapper = shallowMount(SongPage, { localVue })
        const ctx = ({ params: { id } } as unknown) as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate(ctx)).toBe(true)
      }
    )
    test.each(['foo', '0', '30', '25', '111'])(
      `/songs/${song.id}/%s returns false`,
      chart => {
        // Arrange
        const wrapper = shallowMount(SongPage, { localVue })
        const ctx = ({ params: { id: song.id, chart } } as unknown) as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate(ctx)).toBe(false)
      }
    )
    test.each(['', '10', '21', '14'])(
      `/songs/${song.id}/%s returns true`,
      chart => {
        // Arrange
        const wrapper = shallowMount(SongPage, { localVue })
        const ctx = ({ params: { id: song.id, chart } } as unknown) as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate(ctx)).toBe(true)
      }
    )
  })
  describe('asyncData()', () => {
    const $http = { $get: jest.fn(_ => Promise.resolve(song)) }
    beforeEach(() => {
      $http.$get.mockClear()
    })
    test(`/songs/${song.id} returns { song }`, async () => {
      // Arrange
      const wrapper = shallowMount(SongPage, { localVue })
      const ctx = ({ params: { id: song.id }, $http } as unknown) as Context

      // Act
      const result = await wrapper.vm.$options.asyncData(ctx)

      // @ts-ignore
      expect(result.song).toStrictEqual(song)
      expect(result).not.toHaveProperty('playStyle')
      expect(result).not.toHaveProperty('difficulty')
    })
    test.each([
      ['10', 1, 0],
      ['11', 1, 1],
      ['12', 1, 2],
      ['13', 1, 3],
      ['14', 1, 4],
      ['21', 2, 1],
      ['22', 2, 2],
      ['23', 2, 3],
      ['24', 2, 4],
    ])(
      `/songs/${song.id}/%s returns { song, playStyle: %i, difficulty: %i }`,
      async (chart, playStyle, difficulty) => {
        // Arrange
        const wrapper = shallowMount(SongPage, { localVue })
        const ctx = ({
          params: { id: song.id, chart },
          $http,
        } as unknown) as Context

        // Act
        const result: any = await wrapper.vm.$options.asyncData(ctx)

        // @ts-ignore
        expect(result.song).toStrictEqual(song)
        expect(result.playStyle).toBe(playStyle)
        expect(result.difficulty).toBe(difficulty)
      }
    )
  })
})
