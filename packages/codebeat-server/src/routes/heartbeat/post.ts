import type { heartbeatApi } from './index'
import { createRoute } from '@hono/zod-openapi'
import { HeartbeatSchema, HeartbeatsSchema } from './schema'

const heartbeatRoute = createRoute({
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

const heartbeatsRouter = createRoute({
  method: 'post',
  tags: ['heartbeat'],
  summary: 'Create some heartbeat records',
  path: '/list',
  request: {
    body: {
      description: 'Heartbeat records to create',
      content: {
        'application/json': {
          schema: HeartbeatsSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: HeartbeatsSchema,
        },
      },
      description: 'Get heartbeat records',
    },
  },
})

export function registerPostHeartbeat(api: typeof heartbeatApi) {
  return api.openapi(heartbeatRoute, async (c) => {
    const { time, ...rest } = c.req.valid('json')

    const { sendAt, ...restRecord } = await c.executionCtx.props.db.heartbeat.create({
      sendAt: new Date(time * 1000),
      ...rest,
    })
    return c.json({
      time: sendAt.getTime() / 1000,
      ...restRecord,
    }, 200)
  })
}

export function registerPostHeartbeats(api: typeof heartbeatApi) {
  return api.openapi(heartbeatsRouter, async (c) => {
    const list = c.req.valid('json').map(({ time, ...rest }) => ({
      sendAt: new Date(time * 1000),
      ...rest,
    }))
    
    const records = (await c.executionCtx.props.db.heartbeat.createMany(list)).map(({ sendAt, ...restRecord }) => ({
      time: sendAt.getTime() / 1000,
      ...restRecord,
    }))

    return c.json(records, 200)
  })
}
