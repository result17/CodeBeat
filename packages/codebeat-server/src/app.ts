import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { api } from './routes'

const app = new Hono()
app.use('*', logger())
app.use('*', prettyJSON())

app.route('/api', api)
export default app