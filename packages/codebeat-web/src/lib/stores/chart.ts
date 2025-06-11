import type { BaseChartStore } from './base'
import { chartStoreMap, UnknownChart } from './base'
import { DurationChartStore } from './duration'
import { MetricChartStore } from './metric'
import { TimelineChartStore } from './timeline'

export type ChartID = 'Durations' | 'Timeline' | 'Metric_project' | 'Metric_language'

// Map each chart ID to its specific store type
interface ChartStateMap {
  Durations: DurationChartStore
  Timeline: TimelineChartStore
  Metric_project: MetricChartStore<'project'>
  Metric_language: MetricChartStore<'language'>
}

export function useChartState<T extends ChartID>(id: T): ChartStateMap[T] {
  if (chartStoreMap.has(id)) {
    return chartStoreMap.get(id)! as ChartStateMap[T]
  }
  let store: BaseChartStore
  switch (id) {
    case 'Durations':
      store = new DurationChartStore(id)
      break
    case 'Timeline':
      store = new TimelineChartStore(id)
      break
    case 'Metric_project':
      store = new MetricChartStore(id, 'project')
      break
    case 'Metric_language':
      store = new MetricChartStore(id, 'language')
      break
    default:
      store = new UnknownChart(id)
  } chartStoreMap.set(id, store)
  return store as ChartStateMap[T]
}
