import type { HeartbeatManager } from '@/db/heartbeat'
import type { HeartbeatRangeData } from '@/shared'
import { getEndOfTodayDay, getRangerData, getStartOfTodayDay } from '@/shared'

interface DurationService {
  getTodayDuration: () => Promise<void>
  getSpecDuration?: (startDate: Date, endDate: Date) => Promise<HeartbeatRangeData>
}

export function createDurationService(heartbeatManager: HeartbeatManager): DurationService {
  return {
    async getTodayDuration() {
      const records = (await heartbeatManager.queryRecordsFilterRecvAt(getStartOfTodayDay(), getEndOfTodayDay()))
    },
    async getSpecDuration(startDate: Date, endDate: Date) {
      const records = (await heartbeatManager.queryRecordsFilterRecvAt(startDate, endDate))
      const rangerData = getRangerData(records)
      return rangerData
    },
  }
}
