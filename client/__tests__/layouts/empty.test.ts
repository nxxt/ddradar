import { createLocalVue, shallowMount } from '@vue/test-utils'

import EmptyLayout from '~/layouts/empty.vue'

const localVue = createLocalVue()

describe('layouts/empty.vue', () => {
  test('renders correctly', () => {
    const wrapper = shallowMount(EmptyLayout, {
      localVue,
      stubs: { Nuxt: true },
    })
    expect(wrapper).toMatchSnapshot()
  })
})
