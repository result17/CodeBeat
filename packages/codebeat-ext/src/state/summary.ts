import type { MetricDurationData, SummaryData } from 'codebeat-server'
import { shallowRef } from 'reactive-vscode'

export const todaySummaryData = shallowRef<SummaryData>()
export const todayMetricData = shallowRef<Record<string, MetricDurationData<any>>>({})
