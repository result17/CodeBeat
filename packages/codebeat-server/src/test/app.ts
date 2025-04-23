import type { DBProps } from '../shared'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { api } from '../routes'
import { logReqJSONBody } from '../shared'
import { prismaMiddleWare } from '../shared/node_middleware'

const app = new Hono<{ Variables: DBProps }>()
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', logReqJSONBody())

app.use('*', prismaMiddleWare())

app.route('/api', api)

serve({
  fetch: app.fetch,
  port: 3000,
})

export default app
