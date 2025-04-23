import type { Context } from 'hono'
import type { PrismaInstance } from '../db'
import type { ContextProps } from './types'
import { getPrismaClientInstance } from '../db'
import { createHeartbeatService } from '../service'

let prismaClient: PrismaInstance | null = null

export function getContextProps(c: Context): ContextProps {
  try {
    const ctx = c.executionCtx
    return ctx.props
  }
  catch {
    return {
      services: c.get('services'),
    }
  }
}

export function initServices(env: Env) {
  if (!prismaClient) {
    prismaClient = getPrismaClientInstance(env.DATABASE_URL || env.DIRECT_DATABASE_URL)
  }
  const heartbeatService = createHeartbeatService(prismaClient)
  return {
    heartbeat: heartbeatService,
  }
}
