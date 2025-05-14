import type { metricAPI } from '.'
import { getContextProps, openApiErrorResponses, queryStartAndEndTimeStampSchema } from '@/lib'
import { createRoute } from '@hono/zod-openapi'
import { z } from 'zod'
import { baseMetricSchema, METRIC_TYPES } from './schema'

const metricParamsSchema = z.object({
  metric: z.enum(METRIC_TYPES.ALL_METRICS)
    .openapi({
      description: 'The metric to analyze',
      example: 'project',
    }),
})

export const durationMetricRoute = createRoute({
  method: 'get',
  tags: ['metric'],
  summary: 'get a heartbeat record\'s duration metric',
  path: '/duration/{metric}',
  request: {
    params: metricParamsSchema,
    query: queryStartAndEndTimeStampSchema,
  },
  responses: {
    200: {
      description: 'Get a heartbeat record\'s duration metric',
      content: {
        'application/json': {
          schema: baseMetricSchema,
        },
      },
    },
    ...openApiErrorResponses,
  },
})

export function registerGetDurationMetric(api: typeof metricAPI) {
  return api.openapi(durationMetricRoute, async (c) => {
    const { start, end } = c.req.valid('query')
    const metric = c.req.valid('param').metric
    const res = await getContextProps(c)
      .services
      .metric
      .getSpecDateMetricDurationRatioData(metric, new Date(start), new Date(end))

    return c.json({
      metric,
      ratios: res.metricRatios,
      grandTotal: res.grandTotal,
    }, 200)
  })
}
