import type { createDurationService, createHeartbeatService, createMetricService } from '../service'

export interface Services {
  heartbeat: ReturnType<typeof createHeartbeatService>
  duration: ReturnType<typeof createDurationService>
  metric: ReturnType<typeof createMetricService>
}

export interface AcceleratedFindManyArgs {
  where?: {
    sendAt?: {
      gte?: Date
      lte?: Date
    }
  }
  omit?: {
    recvAt?: boolean
    createdAt?: boolean
  }
  cacheStrategy?: {
    ttl?: number
    swr?: number
  }
}
