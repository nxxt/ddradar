import {
  getNotificationInfo,
  getNotificationList,
  Notification,
} from '~/api/notification'

describe('/api/notification.ts', () => {
  const $http = { $get: jest.fn<Promise<any>, [string]>() }
  beforeEach(() => $http.$get.mockClear())

  describe('getNotificationList', () => {
    const notificationList: Omit<Notification, 'sender' | 'pinned'>[] = []
    beforeEach(() => $http.$get.mockResolvedValue(notificationList))
    test.each([
      [true, '/api/v1/notification?scope=top'],
      [false, '/api/v1/notification'],
      [undefined, '/api/v1/notification'],
    ])('($http, %p) calls GET "%s"', async (topOnly, uri) => {
      // Arrange - Act
      const val = await getNotificationList($http, topOnly)

      // Assert
      expect(val).toBe(notificationList)
      expect($http.$get).toBeCalledTimes(1)
      expect($http.$get).lastCalledWith(uri)
    })
  })
  describe('getNotificationInfo', () => {
    const id = 'notification-id'
    const notification: Omit<Notification, '_ts'> = {
      id,
      sender: 'SYSTEM',
      pinned: true,
      type: 'is-info',
      icon: 'account',
      title: 'Title',
      body: 'Message Body',
    } as const
    beforeEach(() => $http.$get.mockResolvedValue(notification))
    test(`($http, ${id}) calls GET "/api/v1/notification/${id}"`, async () => {
      // Arrange - Act
      const val = await getNotificationInfo($http, id)

      // Assert
      expect(val).toBe(notification)
      expect($http.$get).toBeCalledTimes(1)
      expect($http.$get).lastCalledWith(`/api/v1/notification/${id}`)
    })
  })
})
