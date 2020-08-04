import { createLocalVue, mount } from '@vue/test-utils'
import Buefy from 'buefy'

import ScoreBadge from '~/components/pages/ScoreBadge.vue'
import { ClearLamp } from '~/types/api/score'

const localVue = createLocalVue()
localVue.use(Buefy)

describe('/components/pages/ScoreBadge.vue', () => {
  test.each([
    [7, 1000000] as const,
    [6, 999800] as const,
    [5, 938400] as const,
    [4, 877800] as const,
    [3, 923400] as const,
    [2, 690000] as const,
    [1, 450000] as const,
    [0, 32340] as const,
  ])(
    'renders correctly if props are { lamp: %i, score: %i }',
    (lamp: ClearLamp, score: number) => {
      // Arrange
      const wrapper = mount(ScoreBadge, {
        localVue,
        propsData: { lamp, score },
      })

      // Act - Assert
      expect(wrapper).toMatchSnapshot()
    }
  )
})
