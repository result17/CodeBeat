import type { Heartbeat, Prisma } from '@prisma/client'
import { prisma } from './prisma'

interface HeartbeatManager {
  create: (data: Prisma.HeartbeatCreateInput) => Promise<Omit<Heartbeat, 'id' | 'recvAt' | 'createdAt'>>
}

function getHeartbeatManager(): HeartbeatManager {
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
  }
}

export const heartbeatManager = getHeartbeatManager()
