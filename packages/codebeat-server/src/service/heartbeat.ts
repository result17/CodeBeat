import type { HeartbeatManager } from '@/db'
import type { HeartbeatData, HeartbeatResult, HeartbeatResults } from '@/routes/heartbeat/schema'

export interface HeartbeatService {
  getHeartbeats: (startDate: Date, endDate: Date) => Promise<HeartbeatResults>
  createHeartbeatRecord: (data: HeartbeatData) => Promise<HeartbeatResult['data']>
  createHeartbeatRecords: (data: HeartbeatData[]) => Promise<HeartbeatResult['data'][]>
}

export function createHeartbeatService(heartbeatManager: HeartbeatManager): HeartbeatService {
  return {
    async getHeartbeats(startDate: Date, endDate: Date) {
      const records = (await heartbeatManager.queryRecordsFilterSendAt(startDate, endDate)).map(({ sendAt, id, ...rest }) => ({
        ...rest,
        time: sendAt.getTime(),
        id: id.toString(),
      }))
      return records.map(record => ({
        data: record,
        status: 200,
      }))
    },
    async createHeartbeatRecord({ time, ...rest }) {
      const { sendAt, id, ...restRecord } = (await heartbeatManager.create({
        sendAt: new Date(time),
        ...rest,
      }))
      return {
        ...restRecord,
        time: sendAt.getTime(),
        id: id.toString(),
      }
    },
    async createHeartbeatRecords(data) {
      const list = data.map(({ time, ...rest }) => ({
        sendAt: new Date(time),
        ...rest,
      }))

      const records = (await heartbeatManager.createMany(list)).map(({ sendAt, id, ...restRecord }) => ({
        ...restRecord,
        time: sendAt.getTime(),
        id: id.toString(),
      }))

      return records
    },
  }
}
