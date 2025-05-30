import type { GrandTotal } from './types'

const MILLISECONDS_PER_HOUR = 3_600_000
const MILLISECONDS_PER_MINUTE = 60_000

export function getDayPreviousToToday(prev: number) {
  const now = new Date()
  const previousDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() - prev)
  return previousDay
}

export function getStartOfTodayDay() {
  return getDayPreviousToToday(0)
}

export function getEndOfTodayDay() {
  const start = getStartOfTodayDay()
  start.setHours(23, 59, 59, 999)
  return start
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
  const intNum = Math.ceil(ms)
  const hours = Math.floor(intNum / MILLISECONDS_PER_HOUR)
  const minutes = Math.floor((intNum % MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE)

  if (hours > 0) {
    return `${hours} hr${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}`
  }
  return `${minutes} min${minutes > 1 ? 's' : ''}`
}
/**
 * formate duration
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

export function getGrandTotalWithMS(ms: number | bigint) {
  const msInt = typeof ms === 'bigint' ? Number(ms) : ms
  const grandTotal: GrandTotal = {
    ...millisecondsToTimeComponents(msInt),
    text: formatMilliseconds(msInt),
    total_ms: msInt,
  }
  return grandTotal
}
