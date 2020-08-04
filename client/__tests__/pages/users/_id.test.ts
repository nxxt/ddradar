import { Context } from '@nuxt/types'
import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils'
import Buefy from 'buefy'

import UserDetailPage from '~/pages/users/_id.vue'
import { UserListData } from '~/types/api/user'

const localVue = createLocalVue()
localVue.use(Buefy)

const $accessor = { user: { id: 'my_user' } }
const $fetchState = { pending: false }
const user: UserListData = {
  id: 'user1',
  name: 'User 1',
  area: 1,
  code: 10000000,
}

describe('pages/users/_id.vue', () => {
  describe('snapshot test', () => {
    test('renders loading', () => {
      const wrapper = mount(UserDetailPage, {
        localVue,
        data: () => ({ user: null }),
        mocks: { $accessor, $fetchState: { pending: true } },
      })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders user info', () => {
      const wrapper = mount(UserDetailPage, {
        localVue,
        data: () => ({ user }),
        mocks: { $accessor, $fetchState },
      })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders my page', () => {
      const wrapper = mount(UserDetailPage, {
        localVue,
        data: () => ({ user: { ...user, id: $accessor.user.id } }),
        mocks: { $accessor, $fetchState },
        stubs: { NuxtLink: RouterLinkStub },
      })
      expect(wrapper).toMatchSnapshot()
    })
    test('renders not found', () => {
      const wrapper = mount(UserDetailPage, {
        localVue,
        data: () => ({ user: null }),
        mocks: { $fetchState },
      })
      expect(wrapper).toMatchSnapshot()
    })
  })
  describe('get areaName()', () => {
    test.each([
      ['未指定', 0],
      ['北海道', 1],
      ['東京都', 13],
      ['東京都', 13],
      ['海外', 53],
      ['フィリピン', 118],
    ])('returns %s if user.area is %i', (expected, area) => {
      // Arrange
      const wrapper = shallowMount(UserDetailPage, {
        localVue,
        mocks: { $accessor, $fetchState },
        data: () => ({ user: { ...user, area } }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.areaName).toBe(expected)
    })
    test('returns "" if user is null', () => {
      // Arrange
      const wrapper = shallowMount(UserDetailPage, {
        localVue,
        mocks: { $accessor, $fetchState },
        data: () => ({ user: null }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.areaName).toBe('')
    })
  })
  describe('get ddrCode()', () => {
    test.each([
      ['1000-0000', 10000000],
      ['1234-5678', 12345678],
      ['9999-9999', 99999999],
    ])('returns %s if user.code is %i', (expected, code) => {
      // Arrange
      const wrapper = shallowMount(UserDetailPage, {
        localVue,
        mocks: { $accessor, $fetchState },
        data: () => ({ user: { ...user, code } }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.ddrCode).toBe(expected)
    })
    test.each([undefined, 0])('returns "" if user.code is %p', code => {
      // Arrange
      const wrapper = shallowMount(UserDetailPage, {
        localVue,
        mocks: { $accessor, $fetchState },
        data: () => ({ user: { ...user, code } }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.ddrCode).toBe('')
    })
    test('returns "" if user is null', () => {
      // Arrange
      const wrapper = shallowMount(UserDetailPage, {
        localVue,
        mocks: { $accessor, $fetchState },
        data: () => ({ user: null }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.ddrCode).toBe('')
    })
  })
  describe('get isSelfPage()', () => {
    test('returns false if user is null', () => {
      // Arrange
      const wrapper = shallowMount(UserDetailPage, {
        localVue,
        mocks: { $accessor, $fetchState },
        data: () => ({ user: null }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.isSelfPage).toBe(false)
    })
    test('returns false if user.id is not equal login id', () => {
      // Arrange
      const wrapper = shallowMount(UserDetailPage, {
        localVue,
        mocks: { $accessor, $fetchState },
        data: () => ({ user }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.isSelfPage).toBe(false)
    })
    test('returns false if user.id is equal login id', () => {
      // Arrange
      const wrapper = shallowMount(UserDetailPage, {
        localVue,
        mocks: { $accessor, $fetchState },
        data: () => ({ user: { ...user, id: $accessor.user.id } }),
      })

      // Act - Assert
      // @ts-ignore
      expect(wrapper.vm.isSelfPage).toBe(true)
    })
  })
  describe('validate()', () => {
    test.each(['', 'FOO', 'user 1', 'ユーザー'])(
      '/users/%s returns false',
      id => {
        // Arrange
        const wrapper = shallowMount(UserDetailPage, {
          localVue,
          mocks: {
            $route: { params: { id } },
            $fetchState,
          },
        })
        const ctx = ({ params: { id } } as unknown) as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate(ctx)).toBe(false)
      }
    )
    test.each(['0', 'some_user', '---', '_-user000'])(
      '/users/%s returns true',
      id => {
        // Arrange
        const wrapper = shallowMount(UserDetailPage, {
          localVue,
          mocks: {
            $route: { params: { id } },
            $fetchState,
          },
        })
        const ctx = ({ params: { id } } as unknown) as Context

        // Act - Assert
        expect(wrapper.vm.$options.validate(ctx)).toBe(true)
      }
    )
  })
  describe('fetch()', () => {
    test('calls GET /api/v1/users/:id API', async () => {
      // Arrange
      const $http = { $get: jest.fn() }
      $http.$get.mockResolvedValue(user)
      const wrapper = shallowMount(UserDetailPage, {
        localVue,
        mocks: {
          $accessor,
          $route: { params: { id: user.id } },
          $fetchState,
          $http,
        },
      })

      // Act
      await wrapper.vm.$options.fetch.call(wrapper.vm)

      // Assert
      expect($http.$get.mock.calls.length).toBe(1)
      expect($http.$get.mock.calls[0][0]).toBe(`/api/v1/users/${user.id}`)
      expect(wrapper.vm.$data.user).toStrictEqual(user)
    })
    test('sets user null if /api/v1/users/:id throws error', async () => {
      // Arrange
      const $http = { $get: jest.fn() }
      $http.$get.mockRejectedValue(new Error('404'))
      const wrapper = shallowMount(UserDetailPage, {
        localVue,
        mocks: {
          $accessor,
          $route: { params: { id: user.id } },
          $fetchState,
          $http,
        },
      })

      // Act
      await wrapper.vm.$options.fetch.call(wrapper.vm)

      // Assert
      expect($http.$get.mock.calls.length).toBe(1)
      expect($http.$get.mock.calls[0][0]).toBe(`/api/v1/users/${user.id}`)
      expect(wrapper.vm.$data.user).toBeNull()
    })
  })
})
