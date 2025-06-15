import type { GrandTotal, SummaryData } from 'codebeat-server'
import type { ChartState } from './base'
import { client } from '$lib/trpc'
import { getDayPreviousToToday, getEndOfDay } from 'codebeat-server'
import { DataChartStore } from './base'

export interface TimelineItem {
  start: number
  end: number
  duration: number
  project: string
}

export interface TimelineData {
  timeline: TimelineItem[]
  projects: Set<string>
  totalInfo: GrandTotal
}

export interface TimelineState extends ChartState {
  data: TimelineData | undefined
}
export class TimelineChartStore extends DataChartStore<TimelineData> {
  private dayBeforeToday: number = 0

  public setDayBeforeToday(n: number) {
    if (n < 0 || !Number.isInteger(n)) {
      throw new Error('day must be positive int')
    }
    this.dayBeforeToday = n
  }

  private processTimelineData(data: SummaryData): TimelineData {
    const projectSet = new Set<string>()
    const timeline = data.timeline.map(({ start, duration, project }) => {
      projectSet.add(project)
      return {
        start,
        end: start + duration,
        duration,
        project,
      }
    })

    return {
      timeline,
      projects: projectSet,
      totalInfo: data.grandTotal,
    }
  }

  protected async innerQuery(): Promise<void> {
    const dayStart = getDayPreviousToToday(this.dayBeforeToday)
    const dayEnd = getEndOfDay(dayStart)
    const data = this.processTimelineData(await client.duration.getSpecSummary.query({
      start: dayStart.getTime(),
      end: dayEnd.getTime(),
    }))
    this.setHasContent(data.timeline.length > 0)
    this.dataStore.set(data)
  }

  public getDataStore() {
    return this.dataStore
  }
}
