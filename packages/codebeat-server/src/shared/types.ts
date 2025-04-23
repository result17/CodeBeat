import type { getHeartbeatManager, getPrismaClientInstance } from '../db'
import type { createHeartbeatService } from '../service'

interface Services {
  heartbeat: ReturnType<typeof createHeartbeatService>
}
export interface DBProps {
  prisma: ReturnType<typeof getPrismaClientInstance>
  db: {
    heartbeat: ReturnType<typeof getHeartbeatManager>
  }
  services: Services
}

declare module 'hono' {
  interface ExecutionContext {
    props: DBProps
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
