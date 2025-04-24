import type { ContextProps } from '../shared'
import { handleError } from '@/lib'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { api } from '../routes'
import { logReqJSONBody, logResJSONBody } from '../shared'
import { serviceMiddleWare } from '../shared/node_middleware'

const app = new Hono<{ Variables: ContextProps }>()
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', logReqJSONBody())

app.use('*', serviceMiddleWare())
app.use('/api/*', logResJSONBody())

app.onError(handleError)
app.route('/api', api)

export default app
