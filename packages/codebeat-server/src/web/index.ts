import { durationRouter, metricRatioRouter } from './dashboard'
import { baseRouter, createTRPCRouter } from './trpc'

const mergedRouter = createTRPCRouter({
  base: baseRouter,
  duration: durationRouter,
  metricRatio: metricRatioRouter,
})

export type AppRouter = typeof mergedRouter
export default mergedRouter
