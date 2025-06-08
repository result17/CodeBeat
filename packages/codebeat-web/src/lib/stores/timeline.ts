import type { GrandTotal, SummaryData } from 'codebeat-server'
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
  loading: boolean
  error: Error | null
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

function createTimelineStore() {
  const { subscribe, update } = writable<TimelineState>({
    data: null,
    loading: false,
    error: null,
  })

  async function fetchData() {
    update(state => ({ ...state, loading: true, error: null }))
    try {
      const data = await client.duration.getTodaySummary.query()
      const processed = processTimelineData(data)
      update(state => ({
        ...state,
        data: processed,
        loading: false,
      }))
      return processed
    }
    catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      update(state => ({
        ...state,
        error,
        loading: false,
      }))
      throw error
    }
  }

  return {
    subscribe,
    refresh: fetchData,
  }
}

export const timelineStore = createTimelineStore()
