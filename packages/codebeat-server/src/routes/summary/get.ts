import type { summaryAPI } from './index'
import { getContextProps, openApiErrorResponses, queryStartAndEndTimeStampSchema } from '@/lib'
import { createRoute } from '@hono/zod-openapi'
import { SummarySchema } from './schema'

const todaySummaryRoute = createRoute({
  method: 'get',
  tags: ['summary'],
  summary: 'Get summary of today',
  path: '/today',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SummarySchema,
        },
      },
      description: 'return today\'s summary',
    },
    ...openApiErrorResponses,
  },
})

const specSummaryRoute = createRoute({
  method: 'get',
  tags: ['summary'],
  summary: 'Get summary of spec date',
  path: '/',
  query: queryStartAndEndTimeStampSchema,
  responses: {
    200: {
      content: {
        'application/json': {
          schema: SummarySchema,
        },
      },
      description: 'return spec date\'s summary',
    },
    ...openApiErrorResponses,
  },
})

export function registerGetSpecSummary(api: typeof summaryAPI) {
  return api.openapi(specSummaryRoute, async (c) => {
    const { start, end } = queryStartAndEndTimeStampSchema.parse(c.req.query())
    const res = await getContextProps(c).services.duration.getSpecDateSummary(new Date(start), new Date(end))
    return c.json(res, 200)
  })
}

export function registerGetTodaySummary(api: typeof summaryAPI) {
  return api.openapi(todaySummaryRoute, async (c) => {
    const res = await getContextProps(c).services.duration.getTodaySummary()
    return c.json(res, 200)
  })
}
