import type { durationAPI } from './index'
import { openApiErrorResponses } from '@/lib'
import { getContextProps } from '@/shared'
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
      description: 'Created a heartbeat record',
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
