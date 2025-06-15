import type { HeartbeatMetrics, MetricDurationData } from 'codebeat-server'
import { getDayPreviousToToday, getEndOfDay } from 'codebeat-server'
import { client } from '../trpc'
import { DataChartStore } from './base'

export class MetricChartStore<T extends HeartbeatMetrics> extends DataChartStore<MetricDurationData<T>> {
  private startBeforeToday: number = 7
  private endBeforeToday: number = 0

  constructor(public readonly id: string, public readonly metric: T) {
    super(id)
  }

  public getStart() {
    return this.startBeforeToday
  }

  public getEnd() {
    return this.endBeforeToday
  }

  public setStart(n: number) {
    if (n < 0) {
      throw new Error(`start can't lower than zero`)
    }
    this.startBeforeToday = n
  }

  public setEnd(n: number) {
    if (n < 0 && n > this.startBeforeToday) {
      throw new Error(`start can't lower than zero or start(${this.startBeforeToday})`)
    }
    this.endBeforeToday = n
  }

  private getQueryParams() {
    return {
      metric: this.metric,
      start: getDayPreviousToToday(this.startBeforeToday).getTime(),
      end: getEndOfDay(getDayPreviousToToday(this.endBeforeToday)).getTime(),
    }
  }

  protected async innerQuery() {
    const data = await client.metricRatio.getMetricRatio.query(this.getQueryParams()) as MetricDurationData<T>
    this.dataStore.set(data)
    this.setHasContent(data.ratios.length > 0)
  }
}
