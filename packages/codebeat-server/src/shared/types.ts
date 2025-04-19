import { getHeartbeatManager, getPrismaClientInstance } from "../db"

declare module 'hono' {
  interface ExecutionContext {
    props: {
      prisma: ReturnType<typeof getPrismaClientInstance>,
      db: {
        heartbeat: ReturnType<typeof getHeartbeatManager>,
      }
    }
  }
}