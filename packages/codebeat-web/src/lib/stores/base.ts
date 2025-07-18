import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

type ChartAction = 'update' | 'none'

export interface ChartState {
  loading: boolean
  action: ChartAction
  error: Error | null
  hasContent: boolean
}

export const chartStoreMap = new Map<string, BaseChartStore>()

export abstract class BaseChartStore {
  protected readonly store: Writable<ChartState> = writable({
    loading: false,
    action: 'none',
    error: null,
    hasContent: false,
  })

  constructor(public readonly id: string) {
    chartStoreMap.set(id, this)
  }

  public subscribe(run: (value: ChartState) => void) {
    return this.store.subscribe(run)
  }

  public setLoading(val: boolean) {
    return this.store.update(state => ({ ...state, loading: val }))
  }

  public setAction(action: ChartAction) {
    return this.store.update(state => ({ ...state, action }))
  }

  public setError(err: Error) {
    return this.store.update(state => ({ ...state, error: err }))
  }

  public setHasContent(contentFlag: boolean) {
    return this.store.update(state => ({ ...state, hasContent: contentFlag }))
  }

  public dispose() {
    chartStoreMap.delete(this.id)
    this.store.set({ loading: false, action: 'none', error: null, hasContent: false })
    this.disposeData()
  }

  public async query(slower: boolean = true) {
    try {
      this.setLoading(true)
      await Promise.all(slower ? [this.innerQuery(), this.slower()] : [this.innerQuery])
    }
    catch (error) {
      console.error('Error querying:', error)
      this.setError(error as Error)
      this.setHasContent(false)
      throw error
    }
    finally {
      this.setLoading(false)
      this.setAction('none')
    }
  }

  private slower(ms: number = 500) {
    return new Promise(res => setTimeout(() => res(ms), 500))
  }

  protected abstract innerQuery(): Promise<void>
  protected abstract disposeData(): void
}

export class UnknownChart extends BaseChartStore {
  protected innerQuery(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  protected disposeData(): void {
    throw new Error('Method not implemented.')
  }
}

export abstract class DataChartStore<T> extends BaseChartStore {
  protected readonly dataStore: Writable<T | undefined> = writable()
  private intervalId: number | undefined
  private intervalVal: number = 1000 * 60 * 5

  protected setInterval(ms: number) {
    if (ms < 0) {
      throw new Error('interval must be positive')
    }
    this.clearInterVal()
    this.intervalVal = ms
  }

  private setInterValQuery() {
    this.intervalId = window.setInterval(() => this.query(), this.intervalVal)
  }

  public async query() {
    try {
      await super.query()
      if (!this.intervalId) {
        this.setInterValQuery()
      }
    }
    catch {
      this.clearInterVal()
    }
  }

  private clearInterVal() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId)
    }
  }

  protected disposeData(): void {
    this.clearInterVal()
    this.dataStore.set(undefined)
  }

  public getDataStore() {
    return this.dataStore
  }
}
