import { handZodError } from '@/lib'
import { OpenAPIHono } from '@hono/zod-openapi'
import { registerGetSpecSummary, registerGetTodaySummary } from './get'

export const summaryAPI = new OpenAPIHono({
  defaultHook: handZodError,
})

registerGetSpecSummary(summaryAPI)
registerGetTodaySummary(summaryAPI)
