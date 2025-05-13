import type { HeartbeatManager, PrismaInstance } from '@/db'
import type { DurationManager } from '@/db/duration'
import type { ContextProps } from '@/types'
import type { Context } from 'hono'
import { getHeartbeatManager, getPrismaClientInstance } from '@/db'
import { getDurationManager } from '@/db/duration'
import { createDurationNativeSQLService, createHeartbeatService, createMetricService } from '@/service'

let prismaClient: PrismaInstance | null = null
let heartbeatManager: HeartbeatManager | null = null
let durationManager: DurationManager | null = null

export function getContextProps(c: Context): ContextProps {
  try {
    const ctx = c.executionCtx
    return ctx.props
  }
  catch {
    return {
      services: c.get('services'),
      env: c.get('env'),
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
  if (!durationManager) {
    durationManager = getDurationManager(prismaClient)
  }
  const heartbeatService = createHeartbeatService(heartbeatManager)
  const durationService = createDurationNativeSQLService(durationManager)
  const metricService = createMetricService(heartbeatManager)
  return {
    heartbeat: heartbeatService,
    duration: durationService,
    metric: metricService,
  }
}
