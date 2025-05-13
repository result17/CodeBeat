import type { HeartbeatManager } from '@/db'
import type { HeartbeatMetrics, MetricValueDurationRatio } from '../lib'
import { HeartbeatMetricCollector } from '../lib'
import { } from './duration'

export interface MetricService {
  getSpecDateMetricDurationRatio: <T extends HeartbeatMetrics>(metric: T, startDate: Date, endDate: Date) => Promise<MetricValueDurationRatio<T>[]>
}

export function createMetricService(heartbeatManager: HeartbeatManager): MetricService {
  return {
    getSpecDateMetricDurationRatio: async <T extends HeartbeatMetrics>(metric: T, startDate: Date, endDate: Date) => {
      const heartbeatRecords = await heartbeatManager.queryRecordsFilterSendAt(startDate, endDate)
      const collector = new HeartbeatMetricCollector(heartbeatRecords, metric)
      return collector.getMetricRatios()
    },
  }
}
