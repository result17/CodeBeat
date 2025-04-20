import type { Heartbeat, Prisma } from '@prisma/client'
import type { PrismaInstance } from './prisma'

type HeartbeatRecordResponse = Omit<Heartbeat, 'recvAt' | 'createdAt'>

interface HeartbeatManager {
  create: (data: Prisma.HeartbeatCreateInput) => Promise<HeartbeatRecordResponse>
  createMany: (data: Prisma.HeartbeatCreateInput[]) => Promise<HeartbeatRecordResponse[]>
}

// TODO Using Type SelectSubset to pick 'select' or 'omit'
export function getHeartbeatManager(prisma: PrismaInstance): HeartbeatManager {
  return {
    async create(data) {
      try {
        return await prisma.heartbeat.create({
          data,
          omit: {
            recvAt: true,
            createdAt: true,
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
          omit: {
            recvAt: true,
            createdAt: true,
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
