import type { HeartbeatMetrics, MetricValueDurationRatio } from '@/lib/metric'

export type { HeartbeatMetrics, MetricValueDurationRatio } from '@/lib/metric'

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

export interface TimeRange {
  /** Start timestamp */
  start: number
  /** heartbeat duration */
  duration: number
  /** project name */
  project: string
}

/**
 * Heartbeat time range data
 */
export interface SummaryData {
  /** Duration summary */
  grandTotal: GrandTotal
  /** heartbeat records timeline */
  timeline: TimeRange[]
}

export interface MetricDurationData<T extends HeartbeatMetrics> {
  grandTotal: GrandTotal
  ratios: MetricValueDurationRatio<T>[]
  metric: T
}
