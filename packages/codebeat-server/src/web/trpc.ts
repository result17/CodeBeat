import type { ContextProps } from '@/lib/context'
import { initTRPC } from '@trpc/server'
import { z } from 'zod'

export const t = initTRPC.context<ContextProps>().create()

const helloRouter = t.router({
  greeting: t.procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `Hello ${input.name} from codebeat-server!`
    }),
})

export const baseRouter = t.router({
  hello: helloRouter,
})

export const createTRPCRouter = t.router
