import type { GrandTotal, SummaryData } from 'codebeat-server'

import type { ChartState } from './base'
import { client } from '$lib/trpc'
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
    const data = this.processTimelineData(await client.duration.getTodaySummary.query())
    this.setHasContent(data.timeline.length > 0)
    this.dataStore.set(data)
  }

  protected disposeData(): void {
    this.dataStore.set(undefined)
  }

  public getDataStore() {
    return this.dataStore
  }
}
