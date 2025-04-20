import type { ExecutionContext } from '@cloudflare/workers-types'
import type { PrismaInstance } from './db'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { getHeartbeatManager, getPrismaClientInstance } from './db'
import { api } from './routes'

const app = new Hono()
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', async (c, next) => {
  if (c.req.header('Content-Type')?.includes('application/json')) {
    try {
      const body = await c.req.json(); 
      console.log('JSON request body:', JSON.stringify(body, null, 2)); 
    } catch (e) {
      console.error('Fail to parse JSON:', e);
    }
  }
  await next();
});
app.route('/api', api)

app.get('/hello', (c) => {
  return c.html('<p>Hello from codebeat-server</p>')
})

let prismaClient: PrismaInstance | null = null
let heartbeatManager: ReturnType<typeof getHeartbeatManager> | null = null

function initDatabaseServices(env: Env) {
  if (!prismaClient) {
    prismaClient = getPrismaClientInstance(env.DATABASE_URL)
  }
  if (!heartbeatManager) {
    heartbeatManager = getHeartbeatManager(prismaClient)
  }
  return { prismaClient, heartbeatManager }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    try {
      const { prismaClient, heartbeatManager } = initDatabaseServices(env)

      return app.fetch(request, env, {
        ...ctx,
        props: {
          ...ctx.props,
          prisma: prismaClient,
          db: {
            heartbeat: heartbeatManager,
          },
        },
      })
    }
    catch (error) {
      console.error('Database initialization failed:', error)
      return new Response('Service Unavailable', { status: 503 })
    }
  },
}
