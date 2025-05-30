import { z } from 'zod'
import { UnixMillisSchema } from '@/lib/verify'
import { createTRPCRouter, t } from '../trpc'

const durationRouter = createTRPCRouter({
  getDuration: t.procedure
    .query(() => {
      return { duration: 120 }
    }),
  getDashboardRangeDurations: t.procedure
    .input(z.object({
      schedule: z.array(z.object({
        start: UnixMillisSchema,
        end: UnixMillisSchema,
      })),
    }))
    .query(async ({ input: { schedule }, ctx }) => {
      const dateList = schedule.map(({ start, end }) => ({ startDate: new Date(start), endDate: new Date(end) }))
      console.log('env is ', ctx.runtimeEnv)
      const res = await ctx.services.duration.getMultiRangeDurations(dateList)

      return res
    }),
})

export { durationRouter }
