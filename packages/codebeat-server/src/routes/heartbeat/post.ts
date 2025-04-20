import type { heartbeatApi } from './index'
import { createRoute } from '@hono/zod-openapi'
import { getDBProps } from '../../shared/context'
import { HeartbeatResultSchema, HeartbeatResultsSchema, HeartbeatSchema, HeartbeatsSchema } from './schema'

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
          schema: HeartbeatResultSchema,
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
          schema: HeartbeatResultsSchema,
        },
      },
      description: 'Get heartbeat records',
    },
  },
})

export function registerPostHeartbeat(api: typeof heartbeatApi) {
  return api.openapi(heartbeatRoute, async (c) => {
    const { time, ...rest } = c.req.valid('json')
    const { sendAt, id, ...restRecord } = await getDBProps(c).db.heartbeat.create({
      sendAt: new Date(time * 1000),
      ...rest,
    })
    return c.json({
      data: {
        ...restRecord,
        time: sendAt.getTime() / 1000,
        id: id.toString(),
      },
      status: 201,
    }, 200)
  })
}

export function registerPostHeartbeats(api: typeof heartbeatApi) {
  return api.openapi(heartbeatsRouter, async (c) => {
    const list = c.req.valid('json').map(({ time, ...rest }) => ({
      sendAt: new Date(time * 1000),
      ...rest,
    }))

    const records = (await getDBProps(c).db.heartbeat.createMany(list)).map(({ sendAt, id, ...restRecord }) => ({
      ...restRecord,
      time: sendAt.getTime() / 1000,
      id: id.toString(),
    }))

    return c.json(records.map((record) => ({
      data: record,
      status: 200
    })), 200)
  })
}
