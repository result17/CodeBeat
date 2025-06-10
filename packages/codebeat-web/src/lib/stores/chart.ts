import type { Readable, Writable } from 'svelte/store'
import { writable } from 'svelte/store'

export interface ChartState {
  loading: boolean
  action: string
  error: Error | null
}

export interface ChartStateManager extends Readable<ChartState> {
  setLoading: (value: boolean) => void
  setAction: (value: string) => void
  setError: (value: Error | null) => void
  dispose: () => void
}

const chartStates = new Map<string, Writable<ChartState>>()

function createChartState() {
  return writable<ChartState>({
    loading: false,
    action: '',
    error: null,
  })
}

export function useChartState(id: string): ChartStateManager {
  const store = chartStates.get(id) ?? createChartState()
  chartStates.set(id, store)

  const dispose = () => {
    store.set({
      loading: false,
      action: '',
      error: null,
    })
    chartStates.delete(id)
  }

  return {
    subscribe: store.subscribe,
    setLoading: value => store.update(state => ({ ...state, loading: value })),
    setAction: value => store.update(state => ({ ...state, action: value })),
    setError: value => store.update(state => ({ ...state, error: value })),
    dispose,
  }
}
