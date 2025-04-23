import type { Heartbeat, Prisma } from '@prisma/client'
import type { AcceleratedFindManyArgs } from '../shared/types'
import type { PrismaInstance } from './prisma'
import { getEndOfTodayDay, getStartOfTodayDay } from '../shared'

export type HeartbeatRecordResponse = Omit<Heartbeat, 'recvAt' | 'createdAt'>

interface HeartbeatManager {
  create: (data: Prisma.HeartbeatCreateInput) => Promise<HeartbeatRecordResponse>
  createMany: (data: Prisma.HeartbeatCreateInput[]) => Promise<HeartbeatRecordResponse[]>
  queryRecords: (startDate?: Date, endDate?: Date) => Promise<HeartbeatRecordResponse[]>
}

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
    async queryRecords(startDate = getStartOfTodayDay(), endDate = getEndOfTodayDay()) {
      try {
        const args: AcceleratedFindManyArgs = {
          where: {
            recvAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          omit: {
            recvAt: true,
            createdAt: true,
          },
          // only works in cloudflare workers
          // cacheStrategy: {
          //   ttl: 60, // 60 seconds cache
          // },
        }
        const records = await (prisma.heartbeat.findMany as (args?: AcceleratedFindManyArgs) => Promise<HeartbeatRecordResponse[]>)(args)
        return records
      }
      catch (error) {
        throw new Error(`Failed to query heartbeats: ${error instanceof Error ? error.message : String(error)}`)
      }
    },
  }
}
