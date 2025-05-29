import type { ExecutionContext } from '@cloudflare/workers-types'
import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { initServices, logReqJSONBody } from '@/lib'
import { handleError } from './lib'
import { api } from './routes'
import trpcRouter from './web'

const app = new Hono()
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', logReqJSONBody())
app.route('/api', api)

app.onError(handleError)

app.get('/hello', (c) => {
  return c.html('<p>Hello from codebeat-server</p>')
})

app.use(
  '/trpc/*',
  trpcServer({
    router: trpcRouter,
    createContext: (_opts, c) => ({ ...c.executionCtx.props }),
  }),
)

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    try {
      const services = initServices(env)
      const runtimeEnv = env.RUNTIME_ENV || 'production'
      return app.fetch(request, env, {
        ...ctx,
        props: {
          services,
          env: runtimeEnv,
        },
      })
    }
    catch (error) {
      console.error('Database initialization failed:', error)
      return new Response('Service Unavailable', { status: 503 })
    }
  },
}
