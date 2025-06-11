import type { BaseChartStore } from './base'
import { chartStoreMap, UnknownChart } from './base'
import { DurationChartStore } from './duration'
import { TimelineChartStore } from './timeline'

export type ChartID = 'Durations' | 'Timeline' | 'Metric_project' | 'Metric_language'

// Map each chart ID to its specific store type
interface ChartStateMap {
  Durations: DurationChartStore
  Timeline: TimelineChartStore
  Metric_project: UnknownChart
  Metric_language: UnknownChart
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
    default:
      store = new UnknownChart(id)
  } chartStoreMap.set(id, store)
  return store as ChartStateMap[T]
}
