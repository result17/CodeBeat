import { OpenAPIHono } from '@hono/zod-openapi'
import { registerGetTodayDuration } from './get'

export const durationAPI = new OpenAPIHono()
registerGetTodayDuration(durationAPI)
