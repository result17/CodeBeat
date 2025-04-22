import type { MiddlewareHandler } from 'hono'
import type { DBProps } from './types'
import path from 'node:path'
import process from 'node:process'
import * as dotenv from 'dotenv'
import { getHeartbeatManager, getPrismaClientInstance } from '../db'

export function prismaMiddleWare(): MiddlewareHandler<{ Variables: DBProps }> {
  const envPath = path.resolve('.dev.vars')
  dotenv.config({ path: envPath })
  return async (c, next) => {
    const prismaClient = getPrismaClientInstance(process.env.DATABASE_URL)
    const heartbeatManger = getHeartbeatManager(prismaClient)
    c.set('prisma', prismaClient)
    c.set('db', {
      heartbeat: heartbeatManger,
    })
    return await next()
  }
}
