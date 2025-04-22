import type { heartbeatApi } from './index'
import { createRoute } from '@hono/zod-openapi'
import { getDBProps } from '../../shared'
import { HeartbeatResultsSchema } from './schema'

const heartbeatsRoute = createRoute({
  method: 'get',
  tags: ['heartbeat'],
  summary: 'get a heartbeat record',
  path: '/',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: HeartbeatResultsSchema,
        },
      },
      description: 'Get a heartbeat record',
    },
  },
})

export function registerGetHeartbeats(api: typeof heartbeatApi) {
  return api.openapi(heartbeatsRoute, async (c) => {
    const records = (await getDBProps(c).db.heartbeat.queryRecords()).map(({ sendAt, id, ...restRecord }) => ({
      ...restRecord,
      time: sendAt.getTime() / 1000,
      id: id.toString(),
    }))
    return c.json(records.map(record => ({
      data: record,
      status: 200,
    })), 200)
  })
}
