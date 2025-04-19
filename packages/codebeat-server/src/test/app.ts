import type { DBProps } from '../shared/types'
import path from 'node:path'
import process from 'node:process'
import * as dotenv from 'dotenv'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { getHeartbeatManager, getPrismaClientInstance } from '../db'

import { api } from '../routes'

const envPath = path.resolve('./.dev.vars')
dotenv.config({ path: envPath })

const app = new Hono<{ Variables: DBProps }>()
app.use('*', logger())
app.use('*', prettyJSON())

app.use('*', async (c, next) => {
  const prismaClient = getPrismaClientInstance(process.env.DATABASE_URL)
  const heartbeatManger = getHeartbeatManager(prismaClient)
  c.set('prisma', prismaClient)
  c.set('db', {
    heartbeat: heartbeatManger,
  })
  await next()
})

app.route('/api', api)

export default app
