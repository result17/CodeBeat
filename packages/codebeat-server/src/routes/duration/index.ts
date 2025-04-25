import { OpenAPIHono } from '@hono/zod-openapi'
import { registerGetSpecDateDuration, registerGetTodayDuration } from './get'

export const durationAPI = new OpenAPIHono()
registerGetTodayDuration(durationAPI)
registerGetSpecDateDuration(durationAPI)
