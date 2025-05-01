import type { GrandTotal } from '@/routes/duration/schema'
import type { HeartbeatRecordResponse } from '../db/heartbeat'
import type { SummaryData, TimeRange } from './duration'
import { formatMilliseconds, millisecondsToTimeComponents } from './duration'

export type HeartbeatTimeItem = Pick<HeartbeatRecordResponse, 'id' | 'project' | 'sendAt'>

export class HeartbeatTimeline {
  private prevHeartbeat: HeartbeatTimeItem | null = null
  /** In this time range, heartbeat record will be merged */
  static readonly HEARTBEAT_RANGE_TIME: number = 15 * 60 * 1000
  private readonly timeline: HeartbeatTimeItem[] = []
  static readonly UNKNOWN_PROJECT_NAME: string = 'UNKNOWN'
  private prevIndex: number = -1
  private totalMs: number = 0
  private timeRanges: TimeRange[] = []

  constructor(list: HeartbeatRecordResponse[]) {
    this.timeline = list.map(({ id, project, sendAt }) => ({ id, project, sendAt })).sort((a, b) => a.sendAt.getTime() - b.sendAt.getTime())
  }

  private prev(curTime: number) {
    if (this.prevHeartbeat) {
      const diff = curTime - this.prevHeartbeat.sendAt.getTime()
      if (diff > HeartbeatTimeline.HEARTBEAT_RANGE_TIME) {
        this.prevHeartbeat = null
      }
    }
    return this.prevHeartbeat
  }

  private move() {
    if (this.prevIndex < this.timeline.length - 1) {
      this.prevHeartbeat = this.timeline[this.prevIndex++]
    }
  }

  private addNewRange(project: string, start: number) {
    this.increaseTotalMs()
    this.timeRanges.push({
      start,
      project,
      duration: 0,
    })
  }

  private get lastRange() {
    return this.timeRanges[this.timeRanges.length - 1]
  }

  private calcTimeRangeList() {
    if (this.timeline.length === 0) {
      return []
    }
    for (const { project, sendAt } of this.timeline) {
      const sendTime = sendAt.getTime()
      const projectName = project ?? HeartbeatTimeline.UNKNOWN_PROJECT_NAME
      const prev = this.prev(sendTime)
      if (!prev) {
        this.addNewRange(projectName, sendTime)
      }
      else {
        // if both are same project
        if (project === prev.project) {
          this.lastRange.duration = sendTime - prev.sendAt.getTime()
        }
        else {
          // if they aren't same project, then add a new range
          this.addNewRange(projectName, sendTime)
        }
      }
      this.move()
    }
    this.increaseTotalMs()
  }

  private increaseTotalMs() {
    if (this.timeRanges.length === 0) {
      return
    }
    this.totalMs += this.lastRange.duration
  }

  public summary(): SummaryData {
    this.calcTimeRangeList()
    const grandTotal: GrandTotal = {
      ...millisecondsToTimeComponents(this.totalMs),
      text: formatMilliseconds(this.totalMs),
      total_ms: this.totalMs,
    }
    return {
      grandTotal,
      timeline: this.timeRanges,
    }
  }
}
