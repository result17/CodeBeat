import type { GrandTotal, SummaryData } from 'codebeat-server'
import type { ChartStateManager } from './chart'
import { writable } from 'svelte/store'
import { client } from '../trpc'

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

export interface TimelineState {
  data: TimelineData | null
}

function processTimelineData(data: SummaryData): TimelineData {
  const projects = new Set<string>()
  const timeline = data.timeline.map(({ start, duration, project }) => {
    projects.add(project)
    return {
      start,
      end: start + duration,
      duration,
      project,
    }
  })

  return {
    timeline,
    projects,
    totalInfo: data.grandTotal,
  }
}

export function createTimelineStore(chartState: ChartStateManager) {
  const { subscribe, update } = writable<TimelineState>({
    data: null,
  })

  chartState.subscribe(async (state) => {
    if (state.action === 'update') {
      await fetchData()
      chartState.setAction('')
    }
  })
  async function fetchData() {
    chartState.setLoading(true)

    try {
      const data = await client.duration.getTodaySummary.query()
      const processed = processTimelineData(data)
      update(state => ({
        ...state,
        data: processed,
      }))
      return processed
    }
    catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      chartState.setError(error)
      throw error
    }
    finally {
      chartState.setLoading(false)
    }
  }

  return {
    subscribe,
    refresh: fetchData,
  }
}
