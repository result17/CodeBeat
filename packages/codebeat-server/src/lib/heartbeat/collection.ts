import type { HeartbeatRecordResponse } from '@/db/heartbeat'

export type HeartbeatTimeItem = Pick<HeartbeatRecordResponse, 'id' | 'project' | 'sendAt'>

export abstract class HeartbeatCollection {
  /** In this time range, heartbeat record will be merged */
  static readonly HEARTBEAT_RANGE_TIME: number = 15 * 60 * 1000
  protected readonly timeline: HeartbeatTimeItem[] = []
  static readonly UNKNOWN_PROJECT_NAME: string = 'UNKNOWN'

  constructor(list: HeartbeatRecordResponse[]) {
    this.timeline = list.map(({ id, project, sendAt }) => ({ id, project, sendAt })).sort((a, b) => a.sendAt.getTime() - b.sendAt.getTime())
  }
}
