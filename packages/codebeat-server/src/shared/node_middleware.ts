import type { MiddlewareHandler } from 'hono'
import type { ContextProps } from './types'
import path from 'node:path'
import process from 'node:process'
import * as dotenv from 'dotenv'
import { getPrismaClientInstance } from '../db'
import { createHeartbeatService } from '../service'

export function serviceMiddleWare(): MiddlewareHandler<{ Variables: ContextProps }> {
  const envPath = path.resolve('.local.vars')
  dotenv.config({ path: envPath })
  const { DIRECT_DATABASE_URL, DATABASE_URL } = process.env
  return async (c, next) => {
    const prismaClient = getPrismaClientInstance(DATABASE_URL || DIRECT_DATABASE_URL, false)
    const heartbeatService = createHeartbeatService(prismaClient)
    c.set('services', {
      heartbeat: heartbeatService,
    })
    return await next()
  }
}
