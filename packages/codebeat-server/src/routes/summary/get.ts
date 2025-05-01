import type { summaryAPI } from './index'
import { openApiErrorResponses } from '@/lib'
import { getContextProps, verifyStartAndEndDate } from '@/shared'
import { createRoute } from '@hono/zod-openapi'
import { SummarySchema } from './schema'

const specSummaryRoute = createRoute({
  method: 'get',
  tags: ['summary'],
  summary: 'Get summary of spec date',
  path: '/',
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
    const { start, end } = verifyStartAndEndDate(c)
    const res = await getContextProps(c).services.duration.getSpecDataSummary(new Date(start), new Date(end))
    return c.json(res, 200)
  })
}
