import type { DBProps } from '../shared'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { api } from '../routes'
import { prismaMiddleWare } from '../shared'

const app = new Hono<{ Variables: DBProps }>()
app.use('*', logger())
app.use('*', prettyJSON())

app.use('*', prismaMiddleWare())

app.route('/api', api)

export default app
