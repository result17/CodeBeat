import type { heartbeatApi } from './index'
import { createRoute } from '@hono/zod-openapi'
import { heartbeatManager } from '../../db'
import { HeartbeatSchema } from './schema'

const postRouteConfig = createRoute({
  method: 'post',
  tags: ['heartbeat'],
  summary: 'Create a heartbeat record',
  path: '/',
  request: {
    body: {
      description: 'The heartbeat record to create',
      content: {
        'application/json': {
          schema: HeartbeatSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: HeartbeatSchema,
        },
      },
      description: 'Get a heartbeat record',
    },
  },
})

export function registerPostHeartbeat(api: typeof heartbeatApi) {
  return api.openapi(postRouteConfig, async (c) => {
    const { time, ...rest } = c.req.valid('json')

    const { sendAt, ...restRecord } = await heartbeatManager.create({
      sendAt: new Date(time * 1000),
      ...rest,
    })
    return c.json({
      time: sendAt.getTime() / 1000,
      ...restRecord,
    }, 200)
  })
}
