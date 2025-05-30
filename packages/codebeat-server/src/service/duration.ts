import type { DurationManager } from '@/db/duration'
import type { HeartbeatManager } from '@/db/heartbeat'
import type { GrandTotal, SummaryData } from '@/shared'
import { getRangerData } from '@/lib'
import { getEndOfTodayDay, getGrandTotalWithMS, getStartOfTodayDay } from '@/shared'

export interface DurationService {
  getTodayDuration: () => Promise<Pick<SummaryData, 'grandTotal'>>
  getSpecDateDuration: (startDate: Date, endDate: Date) => Promise<Pick<SummaryData, 'grandTotal'>>
  getTodaySummary: () => Promise<SummaryData>
  getSpecDateSummary: (startDate: Date, endDate: Date) => Promise<SummaryData>
  getMultiRangeDurations: (ranges: Array<{ startDate: Date, endDate: Date }>) => Promise<Array<GrandTotal>>
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
      const records = (await heartbeatManager.queryRecordsFilterSendAt(startDate, endDate))
      return getRangerData(records)
    },
    async getTodaySummary() {
      return this.getSpecDateSummary(getStartOfTodayDay(), getEndOfTodayDay())
    },
    async getMultiRangeDurations(ranges: Array<{ startDate: Date, endDate: Date }>) {
      const grandTotals = []
      for (const range of ranges) {
        const { grandTotal } = await this.getSpecDateDuration(range.startDate, range.endDate)
        grandTotals.push(grandTotal)
      }
      return grandTotals
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
    async getMultiRangeDurations(ranges: Array<{ startDate: Date, endDate: Date }>) {
      const durations = await duration.getMultiRangeDurations(ranges)
      return durations.map(getGrandTotalWithMS)
    },
  }
}
