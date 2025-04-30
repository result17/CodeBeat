import type { HeartbeatManager } from '@/db/heartbeat'
import type { HeartbeatRangeData } from '@/shared'
import { getEndOfTodayDay, getRangerData, getStartOfTodayDay } from '@/shared'

interface DurationService {
  getTodayDuration: () => Promise<HeartbeatRangeData>
  getSpecDateDuration: (startDate: Date, endDate: Date) => Promise<HeartbeatRangeData>
}

export function createDurationService(heartbeatManager: HeartbeatManager): DurationService {
  return {
    async getTodayDuration() {
      return this.getSpecDateDuration(getStartOfTodayDay(), getEndOfTodayDay())
    },
    async getSpecDateDuration(startDate: Date, endDate: Date) {
      const records = (await heartbeatManager.queryRecordsFilterRecvAt(startDate, endDate))
      const rangerData = getRangerData(records)
      return rangerData
    },
  }
}
