import type { metricAPI } from '.'
import { createRoute } from '@hono/zod-openapi'
import { getContextProps, openApiErrorResponses, queryStartAndEndTimeStampSchema } from '@/lib'

import { BaseMetricSchema, metricParamsSchema } from './schema'

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
          schema: BaseMetricSchema,
        },
      },
    },
    ...openApiErrorResponses,
  },
})

export const todayDurationMetricRoute = createRoute({
  method: 'get',
  tags: ['metric', 'today'],
  summary: 'get a heartbeat record\'s today duration metric',
  path: '/duration/today/{metric}',
  request: {
    params: metricParamsSchema,
  },
  responses: {
    200: {
      description: 'Get a heartbeat record\'s today duration metric',
      content: {
        'application/json': {
          schema: BaseMetricSchema,
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

    return c.json(res, 200)
  })
}

export function registerGetTodayDurationMetric(api: typeof metricAPI) {
  return api.openapi(todayDurationMetricRoute, async (c) => {
    const metric = c.req.valid('param').metric
    const res = await getContextProps(c)
      .services
      .metric
      .getTodayMetricDurationRatioData(metric)

    return c.json(res, 200)
  })
}
