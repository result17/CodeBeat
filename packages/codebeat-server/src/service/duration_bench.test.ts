import type { HeartbeatManager } from '@/db/heartbeat'
import type { PrismaInstance } from '@/db/prisma'
import type { DurationService } from '@/service'
import { getHeartbeatManager, getPrismaClientInstance } from '@/db'
import { getDurationManager } from '@/db/duration'
import { createDurationNativeSQLService, createDurationService } from '@/service'

import { Bench } from 'tinybench'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

describe('duration calculation performance benchmark', () => {
  // Test data setup
  const DATABASE_URL = process.env.DATABASE_URL
  const DIRECT_DATABASE_URL = process.env.DIRECT_DATABASE_URL

  if (!DATABASE_URL && !DIRECT_DATABASE_URL) {
    throw new Error('DATABASE_URL or DIRECT_DATABASE_URL must be set in environment')
  }

  let yesterday: Date
  let today: Date
  let prismaClient: PrismaInstance
  let heartbeatManager: HeartbeatManager
  let durationService: DurationService
  let durationSQLService: DurationService
  beforeAll(async () => {
    yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    today = new Date()
    prismaClient = getPrismaClientInstance(DATABASE_URL || DIRECT_DATABASE_URL, false)
    heartbeatManager = getHeartbeatManager(prismaClient)
    durationService = createDurationService(heartbeatManager)
    const durationManager = getDurationManager(prismaClient)
    durationSQLService = createDurationNativeSQLService(durationManager)
  })

  afterAll(async () => {
    await prismaClient.$disconnect()
  })

  it('duration calculation', async () => {
    const bench = new Bench({
      iterations: 100,
      warmupIterations: 5,
      warmupTime: 1000,
      time: 1000,
    })

    // Test with duration service
    bench.add('javascript implementation', async () => {
      const result = await durationService.getSpecDateSummary(yesterday, today)
      if (!result)
        throw new Error('No result returned')
    })

    // Test Raw SQL implementation performance
    bench.add('sql implementation', async () => {
      const result = await durationSQLService.getSpecDateSummary(yesterday, today)
      if (!result)
        throw new Error('No result returned')
    })

    await bench.run()

    // 验证结果一致性
    const jsResult = await durationService.getSpecDateSummary(yesterday, today)
    const sqlResult = await durationSQLService.getSpecDateSummary(yesterday, today)
    expect(jsResult.grandTotal.total_ms).toBe(sqlResult.grandTotal.total_ms)

    // 性能分析总结
    console.log('\nPerformance Analysis Summary')
    console.log('==========================')

    const jsTask = bench.tasks.find(t => t.name === 'javascript implementation')?.result
    const sqlTask = bench.tasks.find(t => t.name === 'sql implementation')?.result

    if (jsTask && sqlTask) {
      const jsMeanMs = jsTask.latency.mean * 1000
      const sqlMeanMs = sqlTask.latency.mean * 1000
      const perfImprovement = ((jsMeanMs - sqlMeanMs) / jsMeanMs * 100).toFixed(2)

      console.log('\nDetailed Metrics:')
      console.log('----------------')
      console.log(`JavaScript Implementation:`)
      console.log(`- Mean time: ${jsMeanMs.toFixed(2)}ms`)
      console.log(`- Operations/sec: ${Math.floor(1 / jsTask.latency.mean)}`)
      console.log(`- Standard deviation: ${(jsTask.sd * 1000).toFixed(2)}ms`)

      console.log(`\nSQL Implementation:`)
      console.log(`- Mean time: ${sqlMeanMs.toFixed(2)}ms`)
      console.log(`- Operations/sec: ${Math.floor(1 / sqlTask.latency.mean)}`)
      console.log(`- Standard deviation: ${(sqlTask.sd * 1000).toFixed(2)}ms`)

      console.log('\nComparison:')
      console.log('------------')
      console.log(`Performance improvement: ${perfImprovement}%`)
      console.log(`SQL implementation is ${(jsMeanMs / sqlMeanMs).toFixed(2)}x faster`)

      console.log('\nResults Validation:')
      console.log('-----------------')
      expect(jsResult.timeline.length, 'Test timeline entries').toBe(sqlResult.timeline.length)
      expect(jsResult.grandTotal.total_ms, 'Test grandtotal total_ms').toBe(sqlResult.grandTotal.total_ms)
      expect(jsResult.grandTotal.text, 'Test grandtotal total_ms').toBe(sqlResult.grandTotal.text)

      console.table(bench.table())
    }
  })
})
