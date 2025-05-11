import type { HeartbeatRecordResponse } from '@/db'
import { formatMilliseconds } from '@/shared'
import { HeartbeatTimeline } from '../duration'

type HeartbeatMetrics = keyof HeartbeatRecordResponse
type HeartbeatMetricType = HeartbeatRecordResponse[HeartbeatMetrics]
interface MetricValueDurationRatio {
  value: HeartbeatMetricType
  duration: number
  ratio: number
  durationText: string
}

export class HeartbeatMetricCollector extends HeartbeatTimeline {
  protected readonly metric: HeartbeatMetrics | undefined = undefined
  protected readonly metricMapper: Map<HeartbeatMetricType, MetricValueDurationRatio> = new Map()
  constructor(list: HeartbeatRecordResponse[], metric: HeartbeatMetrics) {
    super(list)
    this.metric = metric
    this.traversalTimeline()
  }

  public getMetric() {
    return this.metric
  }

  private traversalTimeline() {
    if (!this.metric || this.timeRanges.length === 0) {
      throw new Error('No metric or timeline data available')
    }
    for (const range of this.timeRanges) {
      const value = range[this.metric]
      if (!value) {
        continue
      }
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

    for (const metricValue of this.metricMapper.values()) {
      metricValue.ratio = metricValue.duration / this.totalMs
      metricValue.durationText = formatMilliseconds(metricValue.duration)
    }
  }
}
