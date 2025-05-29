import { durationRouter } from './dashboard'
import { baseRouter, createTRPCRouter } from './trpc'

const mergedRouter = createTRPCRouter({
  base: baseRouter,
  duration: durationRouter,
})

export type AppRouter = typeof mergedRouter
export default mergedRouter
