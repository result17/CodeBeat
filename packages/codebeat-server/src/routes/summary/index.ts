import { OpenAPIHono } from '@hono/zod-openapi'
import { registerGetSpecSummary } from './get'

export const summaryAPI = new OpenAPIHono()

registerGetSpecSummary(summaryAPI)
