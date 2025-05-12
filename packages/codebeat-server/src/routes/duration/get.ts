import type { durationAPI } from './index'
import { getContextProps, openApiErrorResponses, queryStartAndEndTimeStampSchema } from '@/lib'
import { createRoute } from '@hono/zod-openapi'
import { GrandTotalSchema } from './schema'

const todayDurationRoute = createRoute({
  method: 'get',
  tags: ['duration'],
  summary: 'Get heartbeats duration of today',
  path: '/today',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: GrandTotalSchema,
        },
      },
      description: 'return today\'s heartbeat duration and formatted text',
    },
    ...openApiErrorResponses,
  },
})

const specDurationRoute = createRoute({
  method: 'get',
  tags: ['duration'],
  summary: 'Get heartbeats duration of spec date',
  path: '/',
  query: queryStartAndEndTimeStampSchema,
  responses: {
    200: {
      content: {
        'application/json': {
          schema: GrandTotalSchema,
        },
      },
      description: 'return spec date\'s heartbeat duration and formatted text',
    },
    ...openApiErrorResponses,
  },
})

export function registerGetTodayDuration(api: typeof durationAPI) {
  return api.openapi(todayDurationRoute, async (c) => {
    const res = await getContextProps(c).services.duration.getTodayDuration()
    return c.json(res.grandTotal, 200)
  })
}

export function registerGetSpecDateDuration(api: typeof durationAPI) {
  return api.openapi(specDurationRoute, async (c) => {
    const { start, end } = queryStartAndEndTimeStampSchema.parse(c.req.query)
    const res = await getContextProps(c).services.duration.getSpecDateDuration(new Date(start), new Date(end))
    return c.json(res.grandTotal, 200)
  })
}
