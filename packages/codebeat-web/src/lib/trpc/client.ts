import type { AppRouter } from 'codebeat-server'
import { createTRPCClient, httpBatchLink } from '@trpc/client'

export const client = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      headers: {
        'Content-Type': 'application/json',
      },
    }),
  ],
})
