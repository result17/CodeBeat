import type { MiddlewareHandler } from 'hono'
import type { ContextProps } from '@/lib/context/context'
import process from 'node:process'
import { getHeartbeatManager, getPrismaClientInstance } from '@/db'
import { getDurationManager } from '@/db/duration'
import { createHeartbeatService, createMetricService } from '@/service'
import { createDurationNativeSQLService } from '@/service/duration'

export function serviceMiddleWare(): MiddlewareHandler<{ Variables: ContextProps }> {
  const { DIRECT_DATABASE_URL, DATABASE_URL, RUNTIME_ENV } = process.env
  const databaseUrl = DIRECT_DATABASE_URL || DATABASE_URL
  console.log('Database url: ', databaseUrl)

  const prismaClient = getPrismaClientInstance(databaseUrl, false)
  const heartbeatManager = getHeartbeatManager(prismaClient)
  const durationManage = getDurationManager(prismaClient)
  const heartbeatService = createHeartbeatService(heartbeatManager)
  const durationService = createDurationNativeSQLService(durationManage)
  const metricService = createMetricService(heartbeatManager)

  return async (c, next) => {
    c.set('services', {
      heartbeat: heartbeatService,
      duration: durationService,
      metric: metricService,
    })
    c.set('runtimeEnv', RUNTIME_ENV)
    return await next()
  }
}
