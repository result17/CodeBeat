import type { createDurationService, createHeartbeatService, createMetricService } from '../service'

interface Services {
  heartbeat: ReturnType<typeof createHeartbeatService>
  duration: ReturnType<typeof createDurationService>
  metric: ReturnType<typeof createMetricService>
}

// cloudflare context
export interface ContextProps {
  services: Services
  env: Env['RUNTIME_ENV']
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
