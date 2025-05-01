import type { HeartbeatManager } from '@/db/heartbeat'
import type { SummaryData } from '@/shared'
import { getEndOfTodayDay, getRangerData, getStartOfTodayDay } from '@/shared'

interface DurationService {
  getTodayDuration: () => Promise<Pick<SummaryData, 'grandTotal'>>
  getSpecDateDuration: (startDate: Date, endDate: Date) => Promise<Pick<SummaryData, 'grandTotal'>>
  getSpecDataSummary: (startDate: Date, endDate: Date) => Promise<SummaryData>
}

export function createDurationService(heartbeatManager: HeartbeatManager): DurationService {
  return {
    async getTodayDuration() {
      return this.getSpecDateDuration(getStartOfTodayDay(), getEndOfTodayDay())
    },
    async getSpecDateDuration(startDate: Date, endDate: Date) {
      return { grandTotal: (await this.getSpecDataSummary(startDate, endDate)).grandTotal }
    },
    async getSpecDataSummary(startDate: Date, endDate: Date) {
      const records = (await heartbeatManager.queryRecordsFilterRecvAt(startDate, endDate))
      return getRangerData(records)
    },
  }
}
