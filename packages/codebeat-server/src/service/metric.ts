import type { HeartbeatManager } from '@/db'
import type { HeartbeatMetrics } from '../lib'
import type { MetricDurationData } from '../shared/types'
import { HeartbeatMetricCollector } from '../lib'

export interface MetricService {
  getSpecDateMetricDurationRatioData: <T extends HeartbeatMetrics>(metric: T, startDate: Date, endDate: Date) => Promise<MetricDurationData<T>>
}

export function createMetricService(heartbeatManager: HeartbeatManager): MetricService {
  return {
    getSpecDateMetricDurationRatioData: async <T extends HeartbeatMetrics>(metric: T, startDate: Date, endDate: Date) => {
      const heartbeatRecords = await heartbeatManager.queryRecordsFilterSendAt(startDate, endDate)
      const collector = new HeartbeatMetricCollector(heartbeatRecords, metric)
      return collector.getMetricData()
    },
  }
}
