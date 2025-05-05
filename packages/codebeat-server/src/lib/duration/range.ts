import type { HeartbeatRecordResponse } from '@/db/heartbeat'
import type { SummaryData } from '@/shared/types'
import { HeartbeatTimeline } from './timeline'

export function getRangerData(records: HeartbeatRecordResponse[]): SummaryData {
  // Validate input parameters
  if (!Array.isArray(records) || records.length < 1) {
    return {
      grandTotal: {
        hours: 0,
        minutes: 0,
        seconds: 0,
        text: '',
        total_ms: 0,
      },
      timeline: [],
    }
  }
  const timeline = new HeartbeatTimeline(records)
  const summary = timeline.summary()
  return summary
}
