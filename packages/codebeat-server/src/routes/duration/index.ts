import { handZodError } from '@/lib'
import { OpenAPIHono } from '@hono/zod-openapi'
import { registerGetSpecDateDuration, registerGetTodayDuration } from './get'

export const durationAPI = new OpenAPIHono({
  defaultHook: handZodError,
})
registerGetTodayDuration(durationAPI)
registerGetSpecDateDuration(durationAPI)
