import type { HeartbeatMetrics, MetricDurationData, TimeRange } from 'codebeat-server'

export interface DaytimeRangeChartViewProps {
  data: TimeRange[]
}

export interface MetricPieChartViewProps<T extends HeartbeatMetrics> {
  data: MetricDurationData<T>
  metric: T
}
