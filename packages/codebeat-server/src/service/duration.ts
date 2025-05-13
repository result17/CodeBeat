import type { DurationManager } from '@/db/duration'
import type { HeartbeatManager } from '@/db/heartbeat'
import type { SummaryData } from '@/shared'
import { getRangerData } from '@/lib'
import { getEndOfTodayDay, getGrandTotalWithMS, getStartOfTodayDay } from '@/shared'

export interface DurationService {
  getTodayDuration: () => Promise<Pick<SummaryData, 'grandTotal'>>
  getSpecDateDuration: (startDate: Date, endDate: Date) => Promise<Pick<SummaryData, 'grandTotal'>>
  getTodaySummary: () => Promise<SummaryData>
  getSpecDateSummary: (startDate: Date, endDate: Date) => Promise<SummaryData>
}

export function createDurationService(heartbeatManager: HeartbeatManager): DurationService {
  return {
    async getTodayDuration() {
      return this.getSpecDateDuration(getStartOfTodayDay(), getEndOfTodayDay())
    },
    async getSpecDateDuration(startDate: Date, endDate: Date) {
      return { grandTotal: (await this.getSpecDateSummary(startDate, endDate)).grandTotal }
    },
    async getSpecDateSummary(startDate: Date, endDate: Date) {
      const records = (await heartbeatManager.queryRecordsFilterRecvAt(startDate, endDate))
      return getRangerData(records)
    },
    async getTodaySummary() {
      return this.getSpecDateSummary(getStartOfTodayDay(), getEndOfTodayDay())
    },
  }
}

export function createDurationNativeSQLService(duration: DurationManager): DurationService {
  return {
    async getTodayDuration() {
      return this.getSpecDateDuration(getStartOfTodayDay(), getEndOfTodayDay())
    },
    async getSpecDateDuration(startDate: Date, endDate: Date) {
      return { grandTotal: getGrandTotalWithMS(await duration.getSendAtDuration(startDate, endDate)) }
    },
    async getSpecDateSummary(startDate: Date, endDate: Date) {
      return duration.getSummary(startDate, endDate)
    },
    async getTodaySummary() {
      return this.getSpecDateSummary(getStartOfTodayDay(), getEndOfTodayDay())
    },
  }
}
