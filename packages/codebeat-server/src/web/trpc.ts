import type { ContextProps } from '@/lib/context'
import { initTRPC } from '@trpc/server'
import { z } from 'zod'

export const t = initTRPC.context<ContextProps>().create()

const appRouter = t.router({
  greeting: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `Hello ${input.name}`
    }),
})

const userRouter = t.router({
  getUser: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return { id: input.id, name: 'John Doe' }
    }),
})

const postRouter = t.router({
  getPosts: t.procedure
    .query(() => {
      return [{ id: 1, title: 'Hello tRPC' }]
    }),
})

export const baseRouter = t.router({
  app: appRouter,
  user: userRouter,
  post: postRouter,
})

export const createTRPCRouter = t.router
