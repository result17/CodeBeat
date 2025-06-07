import type { Writable } from 'svelte/store'

export interface BaseChartContext {
  action: Writable<string>
  isFetching: Writable<boolean>
}
