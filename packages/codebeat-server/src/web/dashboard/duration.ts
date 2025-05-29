import { createTRPCRouter, t } from '../trpc'

const durationRouter = createTRPCRouter({
  getDuration: t.procedure
    .query(() => {
      return { duration: 120 }
    }),
})

export { durationRouter }
