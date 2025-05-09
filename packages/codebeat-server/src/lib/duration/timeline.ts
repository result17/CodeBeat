import type { HeartbeatRecordResponse } from '@/db/heartbeat'
import type { GrandTotal } from '@/routes/duration/schema'
import type { SummaryData, TimeRange } from '@/shared'
import { formatMilliseconds, millisecondsToTimeComponents } from '@/shared/duration'
import { HeartbeatCollection } from '../heartbeat'

export type HeartbeatTimeItem = Pick<HeartbeatRecordResponse, 'id' | 'project' | 'sendAt'>

export class HeartbeatTimeline extends HeartbeatCollection {
  private prevHeartbeat: HeartbeatTimeItem | null = null
  /** In this time range, heartbeat record will be merged */
  private prevIndex: number = -1
  private totalMs: number = 0
  private timeRanges: TimeRange[] = []

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
      this.prevHeartbeat = this.timeline[++this.prevIndex]
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
          this.lastRange.duration = sendTime - this.lastRange.start
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
