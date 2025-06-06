import type { Heartbeat } from '@prisma/client'
import type { HeartbeatManager, PrismaInstance } from '@/db'
import { beforeAll, describe, expect, it } from 'vitest'
import { getHeartbeatManager, getPrismaClientInstance } from '@/db'
import { getDayPreviousToToday } from '@/shared'

const DATABASE_URL = process.env.DATABASE_URL
const DIRECT_DATABASE_URL = process.env.DIRECT_DATABASE_URL

describe('heartbeat datetime test', () => {
  let prismaClient: PrismaInstance
  let heartbeatManager: HeartbeatManager
  beforeAll(async () => {
    prismaClient = getPrismaClientInstance(DATABASE_URL || DIRECT_DATABASE_URL || '', false)
    heartbeatManager = getHeartbeatManager(prismaClient)
  })
  it('should return same heartbeat count', async () => {
    const res = await heartbeatManager.queryRecordsFilterSendAt(getDayPreviousToToday(3), getDayPreviousToToday(2))
    const origin = await prismaClient.$queryRaw<Heartbeat[]>`SELECT * FROM "Heartbeat"  WHERE 
        "sendAt" BETWEEN 
        (CURRENT_DATE - INTERVAL '3 day')::timestamp AND 
        (CURRENT_DATE - INTERVAL '2 day')::timestamp`
    expect(res.length).equal(origin.length)
  })
})
