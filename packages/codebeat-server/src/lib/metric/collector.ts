import type { HeartbeatRecordResponse } from '@/db'
import type { MetricDurationData } from '@/shared/types'
import { formatMilliseconds } from '@/shared'
import { HeartbeatTimeline } from '../duration'

export type HeartbeatMetrics = keyof HeartbeatRecordResponse

// Helper type to get the correct value type for a metric
type MetricValueType<T extends HeartbeatMetrics> = NonNullable<HeartbeatRecordResponse[T]>

// Generic interface for metric ratio with proper type inference
export interface MetricValueDurationRatio<T extends HeartbeatMetrics> {
  value: MetricValueType<T>
  duration: number
  ratio: number
  durationText: string
}

/**
 * A collector that processes heartbeat records and calculates duration ratios for a specific metric.
 * Uses generics to ensure type safety and proper inference of metric value types.
 * @template T - The type of metric to collect, must be a key of HeartbeatRecordResponse
 */
export class HeartbeatMetricCollector<T extends HeartbeatMetrics> extends HeartbeatTimeline {
  protected readonly metric: T
  protected readonly metricMapper: Map<MetricValueType<T>, MetricValueDurationRatio<T>> = new Map()

  constructor(list: HeartbeatRecordResponse[], metric: T) {
    super(list)
    this.metric = metric
    this.traversalTimeline()
  }

  public getMetric(): T {
    return this.metric
  }

  private traversalTimeline() {
    // calc time range list
    super.calcTimeRangeList()
    if (this.timeRanges.length === 0) {
      console.warn('No timeline data available')
    }

    for (const range of this.timeRanges) {
      const rawValue = range[this.metric]
      if (!rawValue) {
        continue
      } // Safe type assertion since we've verified the value exists
      const value = rawValue as MetricValueType<T>
      const metricValue = this.metricMapper.get(value)
      if (metricValue) {
        metricValue.duration += range.duration
      }
      else {
        // Handle missing value
        this.metricMapper.set(value, {
          value,
          duration: range.duration,
          ratio: 0,
          durationText: '',
        })
      }
    }

    // Calculate ratios and format durations
    for (const metricValue of this.metricMapper.values()) {
      metricValue.ratio = metricValue.duration / this.totalMs
      metricValue.durationText = formatMilliseconds(metricValue.duration)
    }
  }

  public getMetricRatios(): MetricValueDurationRatio<T>[] {
    this.traversalTimeline()
    return Array.from(this.metricMapper.values())
  }

  public getMetricData(): MetricDurationData<T> {
    return {
      grandTotal: this.getGrandTotal(),
      metricRatios: this.getMetricRatios(),
    }
  }

  public override dispose() {
    super.dispose()
    this.metricMapper.clear()
    this.timeRanges.length = 0
    this.totalMs = 0
  }
}
