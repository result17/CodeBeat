import { z } from 'zod'
import { baseIntStartAndEndSchema, StartAndDateErrorMsg } from '@/lib/verify'
import { metricSchema } from '@/routes/metric/schema'
import { createTRPCRouter, t } from '../trpc'

const metricRatioRouter = createTRPCRouter({
  getMetricRatio: t.procedure
    .input(
      z.object({ metric: metricSchema })
        .merge(baseIntStartAndEndSchema)
        .superRefine((val, ctx) => {
          if (val.start >= val.end) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: StartAndDateErrorMsg.startLessThanEnd,
            })
          }
        }),
    )
    .query(async ({ input: { metric, start, end }, ctx }) => {
      return await ctx.services.metric.getSpecDateMetricDurationRatioData(metric, new Date(start), new Date(end))
    }),
})

export { metricRatioRouter }
