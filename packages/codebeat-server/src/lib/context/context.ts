import type { HeartbeatManager, PrismaInstance } from '@/db'
import type { ContextProps } from '@/types'
import type { Context } from 'hono'
import { getHeartbeatManager, getPrismaClientInstance } from '@/db'
import { createDurationService, createHeartbeatService } from '@/service'

let prismaClient: PrismaInstance | null = null
let heartbeatManager: HeartbeatManager | null = null

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
  if (!heartbeatManager) {
    heartbeatManager = getHeartbeatManager(prismaClient)
  }
  const heartbeatService = createHeartbeatService(heartbeatManager)
  const durationService = createDurationService(heartbeatManager)
  return {
    heartbeat: heartbeatService,
    duration: durationService,
  }
}
