import type z from 'zod'
import type { PrismaInstance } from '../db/prisma'
import type { HeartbeatData, HeartbeatResult, HeartbeatResults } from '../routes/heartbeat/schema'
import { getHeartbeatManager } from '../db/heartbeat'

interface HeartbeatService {
  getHeartbeats: () => Promise<HeartbeatResults>
  createHeartbeatRecord: (data: HeartbeatData) => Promise<HeartbeatResult['data']>
  createHeartbeatRecords: (data: HeartbeatData[]) => Promise<HeartbeatResult['data'][]>
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
    async createHeartbeatRecord({ time, ...rest }) {
      const { sendAt, id, ...restRecord } = (await heartbeatManager.create({
        sendAt: new Date(time * 1000),
        ...rest,
      }))
      return {
        ...restRecord,
        time: sendAt.getTime() / 1000,
        id: id.toString(),
      }
    },
    async createHeartbeatRecords(data) {
      const list = data.map(({ time, ...rest }) => ({
        sendAt: new Date(time * 1000),
        ...rest,
      }))

      const records = (await heartbeatManager.createMany(list)).map(({ sendAt, id, ...restRecord }) => ({
        ...restRecord,
        time: sendAt.getTime() / 1000,
        id: id.toString(),
      }))

      return records
    },
  }
}
