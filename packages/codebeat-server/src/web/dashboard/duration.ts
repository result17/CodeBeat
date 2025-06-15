import { z } from 'zod'
import { UnixMillisSchema } from '@/lib/verify'
import { createTRPCRouter, t } from '../trpc'

const durationRouter = createTRPCRouter({
  getTodaySummary: t.procedure
    .query(async ({ ctx }) => {
      return await ctx.services.duration.getTodaySummary()
    }),
  getSpecSummary: t.procedure
    .input(z.object({
      start: UnixMillisSchema,
      end: UnixMillisSchema,
    }))
    .query(async ({ input: { start, end }, ctx }) => {
      return await ctx.services.duration.getSpecDateSummary(new Date(start), new Date(end))
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

      const res = await ctx.services.duration.getMultiRangeDurations(dateList)

      return res
    }),
})

export { durationRouter }
