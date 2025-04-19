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
