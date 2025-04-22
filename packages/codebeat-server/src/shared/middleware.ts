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

export function logReqJSONBody(): MiddlewareHandler {
  return async (c, next) => {
    if (c.req.header('Content-Type')?.includes('application/json')) {
      try {
        const body = await c.req.json()
        console.log('JSON request body:', JSON.stringify(body, null, 2))
      }
      catch (e) {
        console.error('Fail to parse JSON:', e)
      }
    }
    await next()
  }
}
