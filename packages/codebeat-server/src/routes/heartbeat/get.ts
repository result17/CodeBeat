import type { heartbeatApi } from './index'
import { ApiError } from '@/lib'
import { getContextProps } from '@/shared'
import { createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import { HeartbeatErrorMsg } from './errorMsg'
import { HeartbeatResultsSchema, UnixMillisSchema } from './schema'

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
    const startDateStr = c.req.query('start')
    const endDateStr = c.req.query('end')

    if (!startDateStr || !endDateStr) {
      throw new ApiError({
        code: 'BAD_REQUEST',
        message: HeartbeatErrorMsg.NoneDate,
      })
    }

    try {
      const startDate = UnixMillisSchema.parse(Number(startDateStr))
      const endDate = UnixMillisSchema.parse(Number(endDateStr))

      if (startDate > endDate) {
        throw new ApiError({
          code: 'BAD_REQUEST',
          message: HeartbeatErrorMsg.StarDatetLater,
        })
      }

      const res = await getContextProps(c).services.heartbeat.getHeartbeats(
        new Date(startDate),
        new Date(endDate),
      )
      return c.json(res, 200)
    }
    catch (err) {
      if (err instanceof z.ZodError) {
        throw new ApiError({
          code: 'BAD_REQUEST',
          message: HeartbeatErrorMsg.InvalidDate,
        })
      }
      throw err
    }
  })
}
