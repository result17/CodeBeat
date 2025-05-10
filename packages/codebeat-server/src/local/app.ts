import type { ContextProps } from '@/types'
import { handleError, logReqJSONBody, logResJSONBody } from '@/lib'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { serviceMiddleWare } from '../lib/middleware/node_middleware'
import { api } from '../routes'

const app = new Hono<{ Variables: ContextProps }>()
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', logReqJSONBody())

app.use('*', serviceMiddleWare())
app.use('/api/*', logResJSONBody())

app.onError(handleError)
app.route('/api', api)

export default app
