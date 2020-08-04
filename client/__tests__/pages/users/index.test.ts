import {
  createLocalVue,
  mount,
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils'
import Buefy from 'buefy'

import UserListPage from '~/pages/users/index.vue'
import { UserListData } from '~/types/api/user'

const localVue = createLocalVue()
localVue.use(Buefy)

const users: UserListData[] = [
  {
    id: 'user1',
    name: 'User 1',
    area: 1,
  },
  {
    id: 'user2',
    name: 'User 2',
    area: 2,
    code: 10000000,
  },
  {
    id: 'user3',
    name: 'User 3',
    area: 0,
  },
  {
    id: 'user4',
    name: 'User 4',
    area: 106,
    code: 20000000,
  },
]

describe('pages/users/index.vue', () => {
  test('renders correctly', () => {
    const wrapper = mount(UserListPage, {
      localVue,
      data: () => ({ users }),
      stubs: { NuxtLink: RouterLinkStub },
    })
    expect(wrapper).toMatchSnapshot()
  })
  describe('search()', () => {
    test('calls /api/v1/users API', async () => {
      // Arrange
      const $http = { $get: jest.fn() }
      const wrapper = shallowMount(UserListPage, { localVue, mocks: { $http } })

      // Act
      // @ts-ignore
      await wrapper.vm.search()

      // Assert
      expect($http.$get.mock.calls.length).toBe(1)
      expect($http.$get.mock.calls[0][0]).toBe('/api/v1/users')
    })
    test('calls /api/v1/users API with searchParams', async () => {
      // Arrange
      const name = 'foo'
      const area = 13
      const code = 20000000
      const $http = { $get: jest.fn() }
      const wrapper = shallowMount(UserListPage, {
        localVue,
        mocks: { $http },
        data: () => ({ name, area, code }),
      })

      // Act
      // @ts-ignore
      await wrapper.vm.search()

      // Assert
      expect($http.$get.mock.calls.length).toBe(1)
      expect($http.$get.mock.calls[0][0]).toBe('/api/v1/users')
      expect($http.$get.mock.calls[0][1].searchParams.get('name')).toBe(name)
      expect($http.$get.mock.calls[0][1].searchParams.get('area')).toBe(
        `${area}`
      )
      expect($http.$get.mock.calls[0][1].searchParams.get('code')).toBe(
        `${code}`
      )
    })
    test('shows error message if /api/v1/users API throws error', async () => {
      // Arrange
      const $http = { $get: jest.fn() }
      const $buefy = { notification: { open: jest.fn() } }
      $http.$get.mockRejectedValue(new Error('Error'))
      const wrapper = shallowMount(UserListPage, {
        localVue,
        mocks: { $buefy, $http },
      })

      // Act
      // @ts-ignore
      await wrapper.vm.search()

      // Assert
      expect($buefy.notification.open.mock.calls.length).toBe(1)
      expect($buefy.notification.open.mock.calls[0][0]).toStrictEqual({
        message: 'Error',
        type: 'is-danger',
        position: 'is-top',
        hasIcon: true,
      })
    })
  })
})
