import type { MiddlewareHandler } from 'hono'
import type { DBProps } from './types'
import path from 'node:path'
import process from 'node:process'
import * as dotenv from 'dotenv'
import { getHeartbeatManager, getPrismaClientInstance } from '../db'

export function prismaMiddleWare(): MiddlewareHandler<{ Variables: DBProps }> {
  const envPath = path.resolve('.local.vars')
  dotenv.config({ path: envPath })
  const { DIRECT_DATABASE_URL, DATABASE_URL } = process.env

  return async (c, next) => {
    const prismaClient = getPrismaClientInstance(DATABASE_URL || DIRECT_DATABASE_URL, false)
    const heartbeatManger = getHeartbeatManager(prismaClient)
    c.set('prisma', prismaClient)
    c.set('db', {
      heartbeat: heartbeatManger,
    })
    return await next()
  }
}
