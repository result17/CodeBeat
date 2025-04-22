import type { HeartbeatRecordResponse } from '../../db/heartbeat'
import { formatMilliseconds } from '../../shared'

/**
 * Heartbeat duration summary data
 */
interface GrandTotal {
  /** Hours */
  hours: number
  /** Minutes */
  minutes: number
  /** Seconds */
  seconds: number
  /** Formatted time string */
  text: string
  /** Total milliseconds */
  total_milliseconds: number
}

/**
 * Heartbeat time range data
 */
interface HeartbeatRangeData {
  /** First heartbeat record */
  start: HeartbeatRecordResponse
  /** Last heartbeat record */
  end: HeartbeatRecordResponse
  /** Duration summary */
  grandTotal: GrandTotal
  /** Grouped heartbeat records */
  ranges: HeartbeatRecordResponse[][]
}

/** Maximum keepalive interval in milliseconds */
const KEEPALIVE_MILLISECONDS = 10 * 1000

/**
 * 将总毫秒数转换为小时、分钟、秒的格式
 */
function millisecondsToTimeComponents(totalMs: number): {
  hours: number
  minutes: number
  seconds: number
} {
  const totalSeconds = totalMs / 1000
  const seconds = Math.floor(totalSeconds) % 60
  const minutes = Math.floor(totalSeconds / 60) % 60
  const hours = Math.floor(totalSeconds / 3600)
  
  return { hours, minutes, seconds }
}

/**
 * 处理心跳记录数据，计算持续时间段
 */
export function getRangerData(records: HeartbeatRecordResponse[]): HeartbeatRangeData | null {
  // Validate input parameters
  if (!Array.isArray(records) || records.length === 0) {
    return null
  }

  // Create array copy to avoid modifying original data
  const sortedRecords = [...records].sort(
    (a, b) => a.sendAt.getTime() - b.sendAt.getTime()
  )

  const start = sortedRecords[0]
  const end = sortedRecords[sortedRecords.length - 1]
  
  // Handle single record case
  if (sortedRecords.length === 1) {
    const total_milliseconds = KEEPALIVE_MILLISECONDS
    const { hours, minutes, seconds } = millisecondsToTimeComponents(total_milliseconds)
    
    return {
      start,
      end,
      ranges: [[start]],
      grandTotal: {
        hours,
        minutes,
        seconds,
        text: formatMilliseconds(total_milliseconds),
        total_milliseconds,
      }
    }
  }

  const ranges: HeartbeatRecordResponse[][] = [[start]]

  // Group consecutive heartbeat records with improved algorithm
  for (let i = 1; i < sortedRecords.length; i++) {
    const current = sortedRecords[i]
    const lastRange = ranges[ranges.length - 1]
    const lastRecord = lastRange[lastRange.length - 1]
    
    const lastAliveTime = lastRecord.sendAt.getTime() + KEEPALIVE_MILLISECONDS
    const currentTime = current.sendAt.getTime()

    if (currentTime <= lastAliveTime) {
      lastRange.push(current)
    } else {
      ranges.push([current])
    }
  }

  // Calculate total active duration more precisely
  const total_milliseconds = ranges.reduce((total, range) => {
    const rangeStart = range[0].sendAt
    const rangeEnd = range[range.length - 1].sendAt
    const rangeDuration = rangeEnd.getTime() - rangeStart.getTime()
    
    // Only add keepalive for the last record in range
    return total + rangeDuration + KEEPALIVE_MILLISECONDS
  }, 0)

  const { hours, minutes, seconds } = millisecondsToTimeComponents(total_milliseconds)

  return {
    start,
    end,
    ranges,
    grandTotal: {
      hours,
      minutes,
      seconds,
      text: formatMilliseconds(total_milliseconds),
      total_milliseconds,
    },
  }
}