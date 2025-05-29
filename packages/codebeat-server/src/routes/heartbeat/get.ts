import type { heartbeatApi } from './index'
import { createRoute } from '@hono/zod-openapi'
import { getContextProps, openApiErrorResponses, queryStartAndEndTimeStampSchema } from '@/lib'
import { HeartbeatResultsSchema } from './schema'

const heartbeatsRoute = createRoute({
  method: 'get',
  tags: ['heartbeat'],
  summary: 'get a heartbeat record',
  path: '/',
  request: {
    query: queryStartAndEndTimeStampSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: HeartbeatResultsSchema,
        },
      },
      description: 'Get a heartbeat record',
    },
    ...openApiErrorResponses,
  },
})

export function registerGetHeartbeats(api: typeof heartbeatApi) {
  return api.openapi(heartbeatsRoute, async (c) => {
    const { start, end } = c.req.valid('query')
    const res = await getContextProps(c).services.heartbeat.getHeartbeats(
      new Date(start),
      new Date(end),
    )
    return c.json(res, 200)
  })
}
