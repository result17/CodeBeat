import type { HeartbeatRecordResponse } from '../db/heartbeat'

/** Maximum keepalive interval in milliseconds */
const KEEPALIVE_MILLISECONDS = 30 * 1000
const MILLISECONDS_PER_HOUR = 3_600_000
const MILLISECONDS_PER_MINUTE = 60_000

/**
 * Heartbeat duration summary data
 */
export interface GrandTotal {
  /** Hours */
  hours: number
  /** Minutes */
  minutes: number
  /** Seconds */
  seconds: number
  /** Formatted time string */
  text: string
  /** Total milliseconds */
  total_ms: number
}

/**
 * Heartbeat time range data
 */
export interface HeartbeatRangeData {
  /** Duration summary */
  grandTotal: GrandTotal
  /** Grouped heartbeat records */
  ranges: HeartbeatRecordResponse[][]
}

export function getStartOfTodayDay() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return startOfDay
}

export function getEndOfTodayDay() {
  const now = new Date()
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
  return endOfDay
}

/**
 * Format milliseconds to time string
 * @param ms - milliseconds
 * @returns formatted string:
 *   - "0 min" if less than 1 minute
 *   - "x min(s)" if less than 1 hour
 *   - "x hrs y mins" if 1 hour or more
 */
export function formatMilliseconds(ms: number): string {
  if (ms <= 0)
    return '0 min'

  // 使用命名常量提高可读性
  const hours = Math.floor(ms / MILLISECONDS_PER_HOUR)
  const minutes = Math.floor((ms % MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE)

  if (hours > 0) {
    return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes !== 1 ? 's' : ''}`
  }
  return `${minutes} min${minutes !== 1 ? 's' : ''}`
}
/**
 * fomateTime
 */
export function millisecondsToTimeComponents(totalMs: number): {
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
 * create heartbeat recors and calculate duration time
 */
export function getRangerData(records: HeartbeatRecordResponse[]): HeartbeatRangeData {
  // Validate input parameters
  if (!Array.isArray(records) || records.length > 2) {
    return {
      ranges: [],
      grandTotal: {
        hours: 0,
        minutes: 0,
        seconds: 0,
        text: '',
        total_ms: 0,
      },
    }
  }

  // Create array copy to avoid modifying original data
  const sortedRecords = [...records].sort(
    (a, b) => a.sendAt.getTime() - b.sendAt.getTime(),
  )

  const start = sortedRecords[0]

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
    }
    else {
      ranges.push([current])
    }
  }

  // signgle heartbeat is invalid
  const filterSignleRangeData = ranges.filter(range => range.length > 1)

  // Calculate total active duration more precisely
  const total_ms = filterSignleRangeData.reduce((total, range) => {
    const rangeStart = range[0].sendAt
    const rangeEnd = range[range.length - 1].sendAt
    const rangeDuration = rangeEnd.getTime() - rangeStart.getTime()

    // Only add keepalive for the last record in range
    return total + rangeDuration + KEEPALIVE_MILLISECONDS
  }, 0)

  const { hours, minutes, seconds } = millisecondsToTimeComponents(total_ms)

  return {
    ranges,
    grandTotal: {
      hours,
      minutes,
      seconds,
      text: formatMilliseconds(total_ms),
      total_ms,
    },
  }
}
