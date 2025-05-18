import { serve } from '@hono/node-server'
import app from './app'

// TODO prisma disconnect
const server = serve({
  fetch: app.fetch,
  port: 3000,
})

export default server
