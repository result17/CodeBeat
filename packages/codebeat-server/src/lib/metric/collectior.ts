import type { HeartbeatRecordResponse } from '@/db'
import { HeartbeatTimeline } from '../duration'

type HeartbeatMetrics = keyof HeartbeatRecordResponse

export class HeartbeatMetricCollector extends HeartbeatTimeline {
  private readonly metric: HeartbeatMetrics | undefined = undefined

  constructor(list: HeartbeatRecordResponse[], metric: HeartbeatMetrics) {
    super(list)
    this.metric = metric
  }

  public getMetric() {
    return this.metric
  }
}
