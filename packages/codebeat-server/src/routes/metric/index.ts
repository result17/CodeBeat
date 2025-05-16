import { handZodError } from '@/lib'
import { OpenAPIHono } from '@hono/zod-openapi'
import { registerGetDurationMetric, registerGetTodayDurationMetric } from './get'

export const metricAPI = new OpenAPIHono({
  defaultHook: handZodError,
})

registerGetDurationMetric(metricAPI)
registerGetTodayDurationMetric(metricAPI)
