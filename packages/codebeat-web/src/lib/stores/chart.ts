import type { Readable, Writable } from 'svelte/store'
import { onDestroy } from 'svelte'
import { writable } from 'svelte/store'

type ChartAction = 'update' | 'none'

export interface ChartState {
  id: string
  loading: boolean
  action: ChartAction
  error: Error | null
}

export interface ChartStateManager extends Readable<ChartState> {
  setLoading: (value: boolean) => void
  setAction: (value: ChartAction) => void
  setError: (value: Error | null) => void
  dispose: () => void
}

const chartStates = new Map<string, Writable<ChartState>>()

function createChartState(id: string) {
  return writable<ChartState>({
    id,
    loading: false,
    action: 'none',
    error: null,
  })
}

export function useChartState(id: string): ChartStateManager {
  const store = chartStates.get(id) ?? createChartState(id)
  chartStates.set(id, store)

  const dispose = () => {
    store.set({
      id: '',
      loading: false,
      action: 'none',
      error: null,
    })
    chartStates.delete(id)
  }

  onDestroy(dispose)

  return {
    subscribe: store.subscribe,
    setLoading: value => store.update(state => ({ ...state, loading: value })),
    setAction: value => store.update(state => ({ ...state, action: value })),
    setError: value => store.update(state => ({ ...state, error: value })),
    dispose,
  }
}
