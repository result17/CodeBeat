import type { MiddlewareHandler } from 'hono'
import type { ContextProps } from '../../types'
import process from 'node:process'
import { getDurationManager } from '@/db/duration'
import { createDurationNativeSQLService } from '@/service/duration'
import { getHeartbeatManager, getPrismaClientInstance } from '../../db'
import { createHeartbeatService } from '../../service'

export function serviceMiddleWare(): MiddlewareHandler<{ Variables: ContextProps }> {
  const { DIRECT_DATABASE_URL, DATABASE_URL } = process.env
  console.log('Database url: ', DATABASE_URL)

  return async (c, next) => {
    const prismaClient = getPrismaClientInstance(DATABASE_URL || DIRECT_DATABASE_URL, false)
    const heartbeatManager = getHeartbeatManager(prismaClient)
    const durationManage = getDurationManager(prismaClient)
    const heartbeatService = createHeartbeatService(heartbeatManager)
    const durationService = createDurationNativeSQLService(durationManage)

    c.set('services', {
      heartbeat: heartbeatService,
      duration: durationService,
    })
    return await next()
  }
}
