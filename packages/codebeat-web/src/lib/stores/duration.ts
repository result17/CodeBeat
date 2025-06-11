import type { GrandTotal } from 'codebeat-server'
import type { Writable } from 'svelte/store'
import type { ChartState } from './base'
import { client } from '$lib/trpc'
import {
  getDayPreviousToToday,
  getEndOfTodayDay,
  getStartOfTodayDay,
} from 'codebeat-server'
import { derived, writable } from 'svelte/store'
import { BaseChartStore } from './base'

interface DateParams {
  start: number
  end: number
}

export const defaultRanges = [{ days: 0 }, { days: 7 }, { days: 30 }]

// Type definition for the combined state
interface DurationChartState extends ChartState {
  data: GrandTotal[]
}

export class DurationChartStore extends BaseChartStore {
  // Store for the duration data
  private readonly dataStore: Writable<GrandTotal[]> = writable([])

  // Create a persistent derived store that combines base state and data
  private readonly derivedStore = derived(
    [this.store, this.dataStore],
    ([state, data]): DurationChartState => ({
      ...state,
      data,
    }),
  )

  private ranges: { days: number }[] = defaultRanges

  public setRanges(ranges: { days: number }[]) {
    this.ranges = ranges
  }

  private getEndOfDay() {
    return getEndOfTodayDay().getTime()
  }

  private queryParams() {
    const endOfToday = this.getEndOfDay()
    const getMultDateRanges = () =>
      this.ranges.map(({ days }) => ({
        start: days === 0 ? getStartOfTodayDay().getTime() : getDayPreviousToToday(days).getTime(),
        end: endOfToday,
      })) satisfies DateParams[]

    return { schedule: getMultDateRanges() }
  }

  protected async innerQuery() {
    this.dataStore.set(await client.duration.getDashboardRangeDurations.query(
      this.queryParams(),
    ))
  }

  // Implement the dispose method to clean up resources
  protected disposeData(): void {
    this.dataStore.set([])
  }

  // Override subscribe to use the derived store with proper typing
  public subscribe(run: (value: DurationChartState) => void) {
    return this.derivedStore.subscribe(run)
  }
}
