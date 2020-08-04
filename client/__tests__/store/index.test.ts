import { actions, getters, mutations, RootState, state } from '~/store'
import type { ClientPrincipal } from '~/types/api/auth'
import type { User } from '~/types/api/user'

const auth: ClientPrincipal = {
  identityProvider: 'github',
  userId: 'auto-generated-id',
  userDetails: 'foo',
  userRoles: ['anonymous', 'authenticated'],
}
const user: User = {
  id: 'foo',
  name: 'Some User',
  area: 13,
  isPublic: true,
  code: 10000000,
} as const

describe('./store/index.ts', () => {
  describe('state', () => {
    test('returns { auth: null, user: null }', () => {
      expect(state()).toStrictEqual({ auth: null, user: null })
    })
  })
  describe('getters', () => {
    describe('name', () => {
      test('returns user.name', () => {
        // Arrange
        const state: RootState = {
          auth: null,
          user,
        }

        // Act - Assert
        expect(getters.name(state)).toBe(user.name)
      })
      test('returns undefined if user is null', () => {
        // Arrange
        const state: RootState = { auth: null, user: null }

        // Act - Assert
        expect(getters.name(state)).toBeUndefined()
      })
    })
  })
  describe('mutations', () => {
    test.each([
      [{ auth: null, user: null }, auth],
      [{ auth, user }, null],
    ])('setAuth(state, %p) changes state.auth', (state, auth) => {
      // Arrange - Act
      mutations.setAuth(state, auth)

      // Assert
      expect(state.auth).toStrictEqual(auth)
    })
    test.each([
      [{ auth: null, user: null }, user],
      [{ auth, user }, null],
    ])('setUser(state, %p) changes state.user', (state, user) => {
      // Arrange - Act
      mutations.setUser(state, user)

      // Assert
      expect(state.user).toStrictEqual(user)
    })
  })
  describe('actions', () => {
    describe('fetchUser', () => {
      test('calls GET /.auth/me API only if not loggedIn', async () => {
        // Arrange
        const commit = jest.fn()
        const $get = jest.fn()
        $get.mockResolvedValue({ clientPrincipal: null })
        // @ts-ignore
        actions.$http = { $get }

        // Act
        // @ts-ignore
        await actions.fetchUser({ commit })

        // Assert
        expect($get).toBeCalledWith('/.auth/me')
        expect(commit).toBeCalledWith('setAuth', null)
      })
      test('calls GET /.auth/me API and /api/v1/user API if loggedIn', async () => {
        // Arrange
        const commit = jest.fn()
        const $get = jest.fn()
        $get.mockImplementation(url =>
          Promise.resolve(
            url === '/.auth/me' ? { clientPrincipal: auth } : user
          )
        )
        // @ts-ignore
        actions.$http = { $get }

        // Act
        // @ts-ignore
        await actions.fetchUser({ commit })

        // Assert
        expect($get).toBeCalledWith('/.auth/me')
        expect($get).toBeCalledWith('/api/v1/user')
        expect(commit).toBeCalledWith('setAuth', auth)
        expect(commit).toBeCalledWith('setUser', user)
      })
      test('sets user null if not registered user', async () => {
        // Arrange
        const commit = jest.fn()
        const $get = jest.fn()
        $get.mockImplementation(url =>
          url === '/.auth/me'
            ? Promise.resolve({ clientPrincipal: auth })
            : Promise.reject(new Error('400'))
        )
        // @ts-ignore
        actions.$http = { $get }

        // Act
        // @ts-ignore
        await actions.fetchUser({ commit })

        // Assert
        expect($get).toBeCalledWith('/.auth/me')
        expect($get).toBeCalledWith('/api/v1/user')
        expect(commit).toBeCalledWith('setAuth', auth)
        expect(commit).toBeCalledWith('setUser', null)
      })
    })
    describe('logout', () => {
      test('calls setAuth(null) and setUser(null)', () => {
        const commit = jest.fn()

        // @ts-ignore
        actions.logout({ commit })

        expect(commit).toBeCalledWith('setAuth', null)
        expect(commit).toBeCalledWith('setUser', null)
      })
    })
    describe('saveUser', () => {
      test('calls POST /api/v1/user API', async () => {
        // Arrange
        const commit = jest.fn()
        const $post = jest.fn()
        const newUser = { ...user, name: 'New user' }
        $post.mockResolvedValue(newUser)
        // @ts-ignore
        actions.$http = { $post }

        // Act
        // @ts-ignore
        await actions.saveUser({ commit }, user)

        // Assert
        expect($post).toBeCalledWith('/api/v1/user', user)
        expect(commit).toBeCalledWith('setUser', newUser)
      })
    })
  })
})
