import type { GrandTotal, SummaryData } from 'codebeat-server'

import type { ChartState } from './base'
import { client } from '$lib/trpc'
import { derived, writable } from 'svelte/store'
import { BaseChartStore } from './base'

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
  data: TimelineData | null
}
export class TimelineChartStore extends BaseChartStore {
  private readonly dataStore = writable<TimelineData | null>(null)

  private readonly derivedStore = derived(
    [this.store, this.dataStore],
    ([state, data]): TimelineState => ({
      ...state,
      data,
    }),
  )

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
    this.dataStore.set(null)
  }

  public subscribe(run: (value: TimelineState) => void) {
    return this.derivedStore.subscribe(run)
  }
}
