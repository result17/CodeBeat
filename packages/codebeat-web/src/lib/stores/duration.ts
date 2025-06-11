import type { GrandTotal } from 'codebeat-server'
import { client } from '$lib/trpc'
import {
  getDayPreviousToToday,
  getEndOfTodayDay,
  getStartOfTodayDay,
} from 'codebeat-server'
import { DataChartStore } from './base'

interface DateParams {
  start: number
  end: number
}

export const defaultRanges = [{ days: 0 }, { days: 7 }, { days: 30 }]

export class DurationChartStore extends DataChartStore<GrandTotal[]> {
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
    const data = await client.duration.getDashboardRangeDurations.query(
      this.queryParams(),
    )
    this.dataStore.set(data)
    this.setHasContent(data.length > 0)
  }

  // Implement the dispose method to clean up resources
  protected disposeData(): void {
    this.dataStore.set([])
  }
}
