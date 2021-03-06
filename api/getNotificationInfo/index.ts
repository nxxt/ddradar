import type { Context } from '@azure/functions'

import { getContainer } from '../cosmos'
import type { NotificationSchema } from '../db'
import type { NotFoundResult, SuccessResult } from '../function'

type Notification = Omit<NotificationSchema, '_ts'>

/** Get notification that match the specified ID. */
export default async function (
  context: Pick<Context, 'bindingData'>
): Promise<NotFoundResult | SuccessResult<Notification>> {
  const id = context.bindingData.id

  // In Azure Functions, this function will only be invoked if a valid `id` is passed.
  // So this check is only used to unit tests.
  if (!id) {
    return { status: 404 }
  }

  const columns: (keyof Notification)[] = [
    'id',
    'sender',
    'pinned',
    'type',
    'icon',
    'title',
    'body',
  ]
  const container = getContainer('Notification', true)
  const { resources } = await container.items
    .query<Notification>({
      query:
        'SELECT ' +
        `${columns.map(c => `c.${c}`).join(', ')} ` +
        'FROM c ' +
        'WHERE c.id = @id',
      parameters: [{ name: '@id', value: id }],
    })
    .fetchAll()

  if (resources.length === 0) {
    return { status: 404, body: `Not found course that id: "${id}"` }
  }

  return {
    status: 200,
    headers: { 'Content-type': 'application/json' },
    body: resources[0],
  }
}
