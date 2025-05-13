import type { HeartbeatRecordResponse } from '@/db/heartbeat'
import type { SummaryData } from '@/shared/types'
import { HeartbeatSummaryData } from './timeline'

export function getRangerData(records: HeartbeatRecordResponse[]): SummaryData {
  const invalidRet = {
    grandTotal: {
      hours: 0,
      minutes: 0,
      seconds: 0,
      text: '0 min',
      total_ms: 0,
    },
    timeline: [],
  }

  // Validate input parameters
  if (!Array.isArray(records) || records.length < 1) {
    return invalidRet
  }
  const timeline = new HeartbeatSummaryData(records)
  return timeline.getFormattedSummary()
}
