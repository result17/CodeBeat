import type { ExecutionContext } from '@cloudflare/workers-types'
import { initServices, logReqJSONBody } from '@/lib'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { handleError } from './lib'
import { api } from './routes'

const app = new Hono()
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', logReqJSONBody())
app.route('/api', api)

app.onError(handleError)

app.get('/hello', (c) => {
  return c.html('<p>Hello from codebeat-server</p>')
})

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
