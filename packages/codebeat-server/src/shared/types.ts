import type { getHeartbeatManager, getPrismaClientInstance } from '../db'

export interface DBProps {
  prisma: ReturnType<typeof getPrismaClientInstance>
  db: {
    heartbeat: ReturnType<typeof getHeartbeatManager>
  }
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
