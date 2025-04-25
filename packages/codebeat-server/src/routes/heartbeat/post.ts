import type { heartbeatApi } from './index'
import { openApiErrorResponses } from '@/lib'
import { createRoute } from '@hono/zod-openapi'
import { getContextProps } from '../../shared'
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
    201: {
      content: {
        'application/json': {
          schema: HeartbeatResultSchema,
        },
      },
      description: 'Created a heartbeat record',
    },
    ...openApiErrorResponses,
  },
})

const heartbeatsRouter = createRoute({
  method: 'post',
  tags: ['heartbeat'],
  summary: 'Create some heartbeat record(s)',
  path: '/list',
  request: {
    body: {
      description: 'Heartbeat record(s) to create',
      content: {
        'application/json': {
          schema: HeartbeatsSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: HeartbeatResultsSchema,
        },
      },
      description: 'Created heartbeat record(s)',
    },
  },
})

export function registerPostHeartbeat(api: typeof heartbeatApi) {
  return api.openapi(heartbeatRoute, async (c) => {
    const origin = c.req.valid('json')
    const data = (await getContextProps(c).services.heartbeat.createHeartbeatRecord(origin))
    return c.json({
      data,
      status: 201,
    }, 201)
  })
}

export function registerPostHeartbeats(api: typeof heartbeatApi) {
  return api.openapi(heartbeatsRouter, async (c) => {
    const origin = c.req.valid('json')
    const records = (await getContextProps(c).services.heartbeat.createHeartbeatRecords(origin))
    return c.json(records.map(record => ({
      data: record,
      status: 201,
    })), 201)
  })
}
