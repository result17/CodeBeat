import { OpenAPIHono } from '@hono/zod-openapi'
import { registerGetSpecSummary, registerGetTodaySummary } from './get'

export const summaryAPI = new OpenAPIHono()

registerGetSpecSummary(summaryAPI)
registerGetTodaySummary(summaryAPI)
