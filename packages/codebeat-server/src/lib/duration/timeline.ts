import type { HeartbeatRecordResponse } from '@/db'
import type { SummaryData, TimeRange } from '@/shared'
import { getGrandTotalWithMS } from '@/shared/duration'
import { HeartbeatCollection } from '../heartbeat'

export interface HeartbeatRecordRange extends HeartbeatRecordResponse {
  duration: number
  start: number
}

/**
 * Summary data for heartbeat records serves subclass.
 */
export class HeartbeatTimeline extends HeartbeatCollection {
  protected prevHeartbeat: HeartbeatRecordResponse | null = null
  /** In this time range, heartbeat record will be merged */
  protected prevIndex: number = -1
  protected totalMs: number = 0
  protected timeRanges: HeartbeatRecordRange[] = []
  protected summaryData: ReturnType<typeof HeartbeatTimeline.prototype.summary> | undefined = undefined

  constructor(list: HeartbeatRecordResponse[]) {
    super(list)
  }

  protected prev(curTime: number) {
    if (this.prevHeartbeat) {
      const diff = curTime - this.prevHeartbeat.sendAt.getTime()
      if (diff > HeartbeatTimeline.HEARTBEAT_RANGE_TIME) {
        this.prevHeartbeat = null
      }
    }
    return this.prevHeartbeat
  }

  protected move() {
    if (this.prevIndex < this.timeline.length - 1) {
      this.prevHeartbeat = this.timeline[++this.prevIndex]
    }
  }

  protected addNewRange(item: HeartbeatRecordResponse, sendTime: number) {
    this.increaseTotalMs()
    this.timeRanges.push({
      ...item,
      duration: 0,
      start: sendTime,
    })
  }

  protected get lastRange() {
    return this.timeRanges[this.timeRanges.length - 1]
  }

  protected calcTimeRangeList() {
    if (this.timeline.length === 0) {
      return []
    }
    for (const item of this.timeline) {
      const { sendAt, project } = item
      const sendTime = sendAt.getTime()
      const prev = this.prev(sendTime)
      if (!prev) {
        this.addNewRange(item, sendTime)
      }
      else {
        this.lastRange.duration = sendTime - this.lastRange.start
        // if both are same project
        if (project !== prev.project) {
          this.addNewRange(item, sendTime)
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

  protected getGrandTotal() {
    return getGrandTotalWithMS(this.totalMs)
  }

  protected summary() {
    this.calcTimeRangeList()
    const grandTotal = this.getGrandTotal()
    return {
      grandTotal,
      timeline: this.timeRanges,
    }
  }

  protected getSummary() {
    if (!this.summaryData) {
      this.summaryData = this.summary()
    }
    return this.summaryData
  }

  public dispose() {
    this.summaryData = undefined
    this.timeRanges.length = 0
    this.totalMs = 0
  }
}

/**
 * Summary data for heartbeat records serves api.
 */
export class HeartbeatSummaryData extends HeartbeatTimeline {
  public getFormattedSummary(): SummaryData {
    const ret = super.getSummary()
    const timeline = ret.timeline.filter(range => range.duration > 0).map(range => ({
      project: range.project ?? HeartbeatSummaryData.UNKNOWN_PROJECT_NAME,
      start: range.start,
      duration: range.duration,
    })) satisfies TimeRange[]
    return {
      ...ret,
      timeline,
    }
  }
}
