import type { MiddlewareHandler } from 'hono'
import type { ContextProps } from '../../types'
import process from 'node:process'
import { getDurationManager } from '@/db/duration'
import { createDurationNativeSQLService } from '@/service/duration'
import { getHeartbeatManager, getPrismaClientInstance } from '../../db'
import { createHeartbeatService, createMetricService } from '../../service'

export function serviceMiddleWare(): MiddlewareHandler<{ Variables: ContextProps }> {
  const { DIRECT_DATABASE_URL, DATABASE_URL, RUNTIME_ENV } = process.env
  const databaseUrl = DIRECT_DATABASE_URL || DATABASE_URL
  console.log('Database url: ', databaseUrl)

  return async (c, next) => {
    const prismaClient = getPrismaClientInstance(databaseUrl, false)
    const heartbeatManager = getHeartbeatManager(prismaClient)
    const durationManage = getDurationManager(prismaClient)
    const heartbeatService = createHeartbeatService(heartbeatManager)
    const durationService = createDurationNativeSQLService(durationManage)
    const metricService = createMetricService(heartbeatManager)

    c.set('services', {
      heartbeat: heartbeatService,
      duration: durationService,
      metric: metricService,
    })
    c.set('env', RUNTIME_ENV)
    return await next()
  }
}
