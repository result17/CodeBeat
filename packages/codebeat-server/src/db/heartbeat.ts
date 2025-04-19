import type { Heartbeat, Prisma } from '@prisma/client'
import type { PrismaInstance } from './prisma'

type HeartbeatRecordResponse = Omit<Heartbeat, 'id' | 'recvAt' | 'createdAt'>

interface HeartbeatManager {
  create: (data: Prisma.HeartbeatCreateInput) => Promise<HeartbeatRecordResponse>
  createMany: (data: Prisma.HeartbeatCreateInput[]) => Promise<HeartbeatRecordResponse[]>
}

export function getHeartbeatManager(prisma: PrismaInstance): HeartbeatManager {
  return {
    async create(data) {
      try {
        return await prisma.heartbeat.create({
          data,
          select: {
            entity: true,
            lineno: true,
            language: true,
            lines: true,
            project: true,
            projectPath: true,
            sendAt: true,
            userAgent: true,
          },
        })
      }
      catch (error) {
        throw new Error(`Failed to create heartbeat: ${error instanceof Error ? error.message : String(error)}`)
      }
    },
    async createMany(data) {
      try {
        const records = await prisma.heartbeat.createManyAndReturn({
          data,
          select: {
            entity: true,
            lineno: true,
            language: true,
            lines: true,
            project: true,
            projectPath: true,
            sendAt: true,
            userAgent: true,
          },
        })
        return records
      }
      catch (error) {
        throw new Error(`Failed to create heartbeats: ${error instanceof Error ? error.message : String(error)}`)
      }
    },
  }
}
