import type { ContextProps } from '@/lib/context/context'
import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { handleError, logReqJSONBody, logResJSONBody } from '@/lib'
import { serviceMiddleWare } from '@/lib/middleware/node_middleware'
import { api } from '../routes'
import trpcRouter from '../web'

const app = new Hono<{ Variables: ContextProps }>()
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', logReqJSONBody())

app.use('/api/*', logResJSONBody())

app.use('/api/*', serviceMiddleWare())
app.use('/trpc/*', cors())
app.use(
  '/trpc/*',
  trpcServer({
    router: trpcRouter,
  }),
)

app.onError(handleError)
app.route('/api', api)

export default app
