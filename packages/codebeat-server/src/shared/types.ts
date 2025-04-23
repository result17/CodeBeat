import type { createHeartbeatService } from '../service'

interface Services {
  heartbeat: ReturnType<typeof createHeartbeatService>
}
export interface ContextProps {
  services: Services
}

declare module 'hono' {
  interface ExecutionContext {
    props: ContextProps
  }
}

export interface AcceleratedFindManyArgs {
  where?: {
    recvAt?: {
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
