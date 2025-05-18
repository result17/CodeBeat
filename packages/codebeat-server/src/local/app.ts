import type { ContextProps } from '@/types'
import { handleError, logReqJSONBody, logResJSONBody } from '@/lib'
import { serviceMiddleWare } from '@/lib/middleware/node_middleware'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { api } from '../routes'

const app = new Hono<{ Variables: ContextProps }>()
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', logReqJSONBody())

app.use('/api/*', logResJSONBody())

app.use('/api/*', serviceMiddleWare())

app.onError(handleError)
app.route('/api', api)

export default app
