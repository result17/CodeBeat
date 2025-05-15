import type { HeartbeatManager } from '@/db'
import type { HeartbeatMetrics } from '../lib'
import type { MetricDurationData } from '../shared/types'
import { getEndOfTodayDay, getStartOfTodayDay } from '@/shared'
import { HeartbeatMetricCollector } from '../lib'

export interface MetricService {
  getSpecDateMetricDurationRatioData: <T extends HeartbeatMetrics>(metric: T, startDate: Date, endDate: Date) => Promise<MetricDurationData<T>>
  getTodayMetricDurationRatioData: <T extends HeartbeatMetrics>(metric: T) => Promise<MetricDurationData<T>>
}

export function createMetricService(heartbeatManager: HeartbeatManager): MetricService {
  return {
    async getSpecDateMetricDurationRatioData <T extends HeartbeatMetrics>(metric: T, startDate: Date, endDate: Date) {
      const heartbeatRecords = await heartbeatManager.queryRecordsFilterSendAt(startDate, endDate)
      const collector = new HeartbeatMetricCollector(heartbeatRecords, metric)
      return collector.getMetricData()
    },
    async getTodayMetricDurationRatioData<T extends HeartbeatMetrics>(metric: T) {
      return await this.getSpecDateMetricDurationRatioData(metric, getStartOfTodayDay(), getEndOfTodayDay())
    },
  }
}
