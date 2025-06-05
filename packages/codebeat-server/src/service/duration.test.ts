import type { PrismaInstance } from '@/db'
import type { DurationService } from '@/service'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getHeartbeatManager, getPrismaClientInstance } from '@/db'
import { getDurationManager } from '@/db/duration'
import { createDurationNativeSQLService, createDurationService } from '@/service'
import { getDayPreviousToToday, getEndOfTodayDay, getStartOfTodayDay } from '@/shared'

const DATABASE_URL = process.env.DATABASE_URL
const DIRECT_DATABASE_URL = process.env.DIRECT_DATABASE_URL

describe('heartbeat duration calculation', () => {
  let prismaClient: PrismaInstance
  let yesterday: Date
  let today: Date
  let durationService: DurationService
  let durationSQLService: DurationService

  beforeAll(async () => {
    prismaClient = getPrismaClientInstance(DATABASE_URL || DIRECT_DATABASE_URL || '', false)
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
    expect(res.grandTotal.totalMs).equal(sqlRes.grandTotal.totalMs)
  })

  it('should return summary data', async () => {
    if (!DATABASE_URL && !DIRECT_DATABASE_URL) {
      throw new Error('DATABASE_URL or DIRECT_DATABASE_URL must be set in environment')
    }

    const summary = await durationService.getSpecDateSummary(yesterday, today)
    expect(summary).toBeDefined()
    expect(summary.grandTotal).toBeDefined()

    const sqlSummary = await durationSQLService.getSpecDateSummary(yesterday, today)

    expect(sqlSummary).toBeDefined()
    expect(sqlSummary.timeline).toBeDefined()
    expect(summary.grandTotal).toBeDefined()

    expect(summary.grandTotal.totalMs).equal(sqlSummary.grandTotal.totalMs)
    expect(summary.timeline.length).equal(sqlSummary.timeline.length)
  })

  it('should return multiple range durations', async () => {
    const endOfToday = getEndOfTodayDay()
    const list = [{
      startDate: getDayPreviousToToday(1),
      endDate: getStartOfTodayDay(),
    }, {
      startDate: getDayPreviousToToday(7),
      endDate: endOfToday,
    }, {
      startDate: getDayPreviousToToday(30),
      endDate: endOfToday,
    }]

    const res = await durationService.getMultiRangeDurations(list)

    expect(res).toBeDefined()
    expect(res.length).toBe(list.length)

    const sqlRes = await durationSQLService.getMultiRangeDurations(list)

    expect(sqlRes).toBeDefined()
    expect(sqlRes.length).toBe(list.length)

    for (let i = 0; i < list.length; i++) {
      expect(sqlRes[i].text).equal(res[i].text)
    }
  })

  it('both calculation methods should return the same duration', async () => {
    const res = await durationService.getSpecDateDuration(getDayPreviousToToday(1), getStartOfTodayDay())
    expect(res).toBeDefined()
    expect(res.grandTotal).toBeDefined()

    const sqlRes = await durationSQLService.getSpecDateDuration(getDayPreviousToToday(1), getStartOfTodayDay())
    expect(sqlRes).toBeDefined()
    expect(sqlRes.grandTotal).toBeDefined()

    expect(sqlRes.grandTotal.text).equal(res.grandTotal.text)

    expect(sqlRes.grandTotal.totalMs).equal(res.grandTotal.totalMs)
  })

  it('bulk and unit calculations must return the same duration', async () => {
    const res = await durationService.getSpecDateDuration(getDayPreviousToToday(1), getStartOfTodayDay())
    expect(res.grandTotal).toBeDefined()

    const list = [{
      startDate: getDayPreviousToToday(1),
      endDate: getStartOfTodayDay(),
    }]

    const bulkRes = await durationService.getMultiRangeDurations(list)
    expect(res).toBeDefined()
    expect(bulkRes.length).toBe(list.length)

    expect(bulkRes[0].text).equal(res.grandTotal.text)
    expect(bulkRes[0].totalMs).equal(res.grandTotal.totalMs)
  })

  it('summary and unit calculations must return the same duration', async () => {
    const summary = await durationSQLService.getSpecDateSummary(getDayPreviousToToday(2), getDayPreviousToToday(1))
    expect(summary.grandTotal).toBeDefined()
    expect(summary.timeline).toBeDefined()

    const res = await durationSQLService.getSpecDateDuration(getDayPreviousToToday(2), getDayPreviousToToday(1))
    expect(res.grandTotal).toBeDefined()

    expect(summary.grandTotal.text).equal(res.grandTotal.text)
    expect(summary.grandTotal.totalMs).equal(res.grandTotal.totalMs)
  })

  it('both calculation methods should return the same summmary', async () => {
    const summary = await durationService.getSpecDateSummary(getDayPreviousToToday(2), getDayPreviousToToday(1))
    expect(summary.grandTotal).toBeDefined()
    expect(summary.timeline).toBeDefined()

    const sqlSummary = await durationSQLService.getSpecDateSummary(getDayPreviousToToday(2), getDayPreviousToToday(1))
    expect(sqlSummary.grandTotal).toBeDefined()
    expect(sqlSummary.timeline).toBeDefined()

    expect(sqlSummary.grandTotal.text).equal(summary.grandTotal.text)
    expect(sqlSummary.grandTotal.totalMs).equal(summary.grandTotal.totalMs)
    expect(sqlSummary.timeline.length).equal(summary.timeline.length)
  })
})
