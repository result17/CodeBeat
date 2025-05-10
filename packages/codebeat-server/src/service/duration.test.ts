import type { PrismaInstance } from '@/db'
import type { DurationService } from '@/service'
import { getHeartbeatManager, getPrismaClientInstance } from '@/db'
import { getDurationManager } from '@/db/duration'
import { createDurationNativeSQLService, createDurationService } from '@/service'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const DATABASE_URL = process.env.DATABASE_URL
const DIRECT_DATABASE_URL = process.env.DIRECT_DATABASE_URL

describe('heartbeat duration calculation', () => {
  let prismaClient: PrismaInstance
  let yesterday: Date
  let today: Date
  let durationService: DurationService
  let durationSQLService: DurationService

  beforeAll(async () => {
    prismaClient = getPrismaClientInstance(DATABASE_URL || DIRECT_DATABASE_URL, false)
    yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    today = new Date()
    const heartbeatManager = getHeartbeatManager(prismaClient)
    durationService = createDurationService(heartbeatManager)
    const durationManager = getDurationManager(prismaClient)
    durationSQLService = createDurationNativeSQLService(durationManager)
  })

  afterAll(async () => {
    await prismaClient.$disconnect()
  })

  it('should return duration data', async () => {
    const res = await durationService.getSpecDateDuration(yesterday, today)
    expect(res).toBeDefined()
    expect(res.grandTotal).toBeDefined()

    const sqlRes = await durationSQLService.getSpecDateDuration(yesterday, today)
    expect(sqlRes).toBeDefined()
    expect(sqlRes.grandTotal).toBeDefined()

    expect(res.grandTotal.text).equal(sqlRes.grandTotal.text)
    expect(res.grandTotal.total_ms).equal(sqlRes.grandTotal.total_ms)
  })

  it('should return summary data', async () => {
    if (!DATABASE_URL && !DIRECT_DATABASE_URL) {
      throw new Error('DATABASE_URL or DIRECT_DATABASE_URL must be set in environment')
    }

    prismaClient = getPrismaClientInstance(DATABASE_URL || DIRECT_DATABASE_URL, false)

    const summary = await durationService.getSpecDateSummary(yesterday, today)
    expect(summary).toBeDefined()
    expect(summary.grandTotal).toBeDefined()

    const sqlSummary = await durationSQLService.getSpecDateSummary(yesterday, today)

    expect(sqlSummary).toBeDefined()
    expect(sqlSummary.timeline).toBeDefined()
    expect(summary.grandTotal).toBeDefined()

    expect(summary.grandTotal.total_ms).equal(sqlSummary.grandTotal.total_ms)
    expect(summary.timeline.length).equal(sqlSummary.timeline.length)
  })
})
