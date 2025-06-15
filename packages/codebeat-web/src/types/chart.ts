import type { Writable } from 'svelte/store'

export type ValidMetrics = 'project' | 'language'
export type MetricChartId = `Metric_${ValidMetrics}`

export interface BaseChartContext {
  action: Writable<string>
  isFetching: Writable<boolean>
}

export interface DateQueryBtn {
  text: string
  startPrevDay: number
  endPrevDay: number
}
