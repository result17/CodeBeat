import type z from 'zod'
import type { PrismaInstance } from '../db/prisma'
import type { HeartbeatResultsSchema } from '../routes/heartbeat/schema'
import { getHeartbeatManager } from '../db/heartbeat'

interface HeartbeatService {
  getHeartbeats: () => Promise<z.infer<typeof HeartbeatResultsSchema>>
}

export function createHeartbeatService(prisma: PrismaInstance): HeartbeatService {
  const heartbeatManager = getHeartbeatManager(prisma)

  return {
    async getHeartbeats() {
      const records = (await heartbeatManager.queryRecords()).map(({ sendAt, id, ...rest }) => ({
        ...rest,
        time: sendAt.getTime() / 1000,
        id: id.toString(),
      }))
      return records.map(record => ({
        data: record,
        status: 200,
      }))
    },
  }
}
