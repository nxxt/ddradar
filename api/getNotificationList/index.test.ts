import { describeIf } from '../__tests__/util'
import { getConnectionString, getContainer } from '../cosmos'
import type { NotificationSchema } from '../db'
import getNotification from '.'

describe('GET /api/v1/notification', () => {
  describeIf(() => !!getConnectionString())(
    'Cosmos DB integration test',
    () => {
      const notification: NotificationSchema[] = [
        {
          id: 'foo',
          sender: 'SYSTEM',
          pinned: false,
          type: 'is-info',
          icon: 'info',
          title: '新曲を追加しました',
          body: '新曲2曲の譜面情報を追加しました。',
          _ts: 1597028400,
        },
        {
          id: 'bar',
          sender: 'SYSTEM',
          pinned: true,
          type: 'is-warning',
          icon: 'warning',
          title: 'このサイトはベータ版です',
          body: 'このWebサイトはベータ版環境です。',
          _ts: 1596250800,
        },
        {
          id: 'baz',
          sender: 'SYSTEM',
          pinned: false,
          type: 'is-info',
          icon: 'info',
          title: 'v0.6.0をリリースしました',
          body: '変更点は以下を参照してください。',
          _ts: 1597114800,
        },
      ]
      beforeAll(async () => {
        await Promise.all(
          notification.map(d => getContainer('Notification').items.create(d))
        )
      })

      test('returns "200 OK" with all data', async () => {
        // Arrange
        const req = { query: {} }

        // Act
        const result = await getNotification(null, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toHaveLength(3)
      })
      test.each(['full', 'foo'])(
        '/scope=%s returns "200 OK" with all data',
        async scope => {
          // Arrange
          const req = { query: { scope } }

          // Act
          const result = await getNotification(null, req)

          // Assert
          expect(result.status).toBe(200)
          expect(result.body).toHaveLength(3)
        }
      )
      test('?scope=top returns "200 OK" with pinned data', async () => {
        // Arrange
        const req = { query: { scope: 'top' } }

        // Act
        const result = await getNotification(null, req)

        // Assert
        expect(result.status).toBe(200)
        expect(result.body).toHaveLength(1)
      })

      afterAll(async () => {
        await Promise.all(
          notification.map(d =>
            getContainer('Notification').item(d.id, d.sender).delete()
          )
        )
      })
    }
  )
})
