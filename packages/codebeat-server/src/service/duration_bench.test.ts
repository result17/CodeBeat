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

  let startDate: Date
  let endDate: Date
  let prismaClient: PrismaInstance
  let heartbeatManager: HeartbeatManager
  let durationService: DurationService
  let durationSQLService: DurationService

  beforeAll(async () => {
    // Calculate first day of last month
    startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 1) // Previous month
    startDate.setDate(1) // First day
    startDate.setHours(0, 0, 0, 0) // Start of day

    // Calculate last day of current month
    endDate = new Date()
    endDate.setDate(1) // Set to first day of current month
    endDate.setMonth(endDate.getMonth() + 1) // Next month
    endDate.setDate(0) // Auto-adjust to last day of current month
    endDate.setHours(23, 59, 59, 999) // End of day

    prismaClient = getPrismaClientInstance(DATABASE_URL || DIRECT_DATABASE_URL, false)
    heartbeatManager = getHeartbeatManager(prismaClient)
    durationService = createDurationService(heartbeatManager)
    const durationManager = getDurationManager(prismaClient)
    durationSQLService = createDurationNativeSQLService(durationManager)
  })

  afterAll(async () => {
    await prismaClient.$disconnect()
  })

  it('duration calculation', {
    timeout: 5 * 60 * 1000, // 5 minutes
  }, async () => {
    const bench = new Bench({
      iterations: 5,
      warmupIterations: 1,
      warmupTime: 1000,
      time: 1000,
    })

    // Memory tracking for each task
    const taskMemory: Record<string, {
      beforeRun: ReturnType<typeof process.memoryUsage>
      afterRun: ReturnType<typeof process.memoryUsage>
    }> = {}

    // Record initial memory state
    const recordMemory = (task: string, type: 'before' | 'after') => {
      if (!taskMemory[task]) {
        taskMemory[task] = {
          beforeRun: process.memoryUsage(),
          afterRun: process.memoryUsage(),
        }
      }
      if (type === 'before') {
        taskMemory[task].beforeRun = process.memoryUsage()
      }
      else {
        taskMemory[task].afterRun = process.memoryUsage()
      }
    }

    // Test with duration service
    bench.add('javascript implementation', async () => {
      recordMemory('javascript implementation', 'before')
      const result = await durationService.getSpecDateSummary(startDate, endDate)
      recordMemory('javascript implementation', 'after')
      if (!result)
        throw new Error('No result returned')
    })

    // Test Raw SQL implementation performance
    bench.add('sql implementation', async () => {
      recordMemory('sql implementation', 'before')
      const result = await durationSQLService.getSpecDateSummary(startDate, endDate)
      recordMemory('sql implementation', 'after')
      if (!result)
        throw new Error('No result returned')
    })

    await bench.run()

    // Validate result consistency
    const jsResult = await durationService.getSpecDateSummary(startDate, endDate)
    const sqlResult = await durationSQLService.getSpecDateSummary(startDate, endDate)
    expect(jsResult.grandTotal.totalMs).toBe(sqlResult.grandTotal.totalMs)

    // Performance analysis summary
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
      console.log(`- Standard deviation: ${(jsTask.latency.sd * 1000).toFixed(2)}ms`)

      console.log(`\nSQL Implementation:`)
      console.log(`- Mean time: ${sqlMeanMs.toFixed(2)}ms`)
      console.log(`- Operations/sec: ${Math.floor(1 / sqlTask.latency.mean)}`)
      console.log(`- Standard deviation: ${(sqlTask.latency.sd * 1000).toFixed(2)}ms`)

      console.log('\nMemory Usage (MB):')
      console.log('----------------')
      console.log(`Heap Used: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`)
      console.log(`Heap Total: ${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`)
      console.log(`RSS: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`)
      console.log(`External: ${(process.memoryUsage().external / 1024 / 1024).toFixed(2)} MB`)

      console.log('\nMemory Usage per Implementation:')
      console.log('------------------------------')

      // Calculate and display memory usage for each task
      for (const [taskName, memory] of Object.entries(taskMemory)) {
        const diff = {
          heapUsed: (memory.afterRun.heapUsed - memory.beforeRun.heapUsed) / 1024 / 1024,
          heapTotal: (memory.afterRun.heapTotal - memory.beforeRun.heapTotal) / 1024 / 1024,
          rss: (memory.afterRun.rss - memory.beforeRun.rss) / 1024 / 1024,
          external: (memory.afterRun.external - memory.beforeRun.external) / 1024 / 1024,
        }

        console.log(`\n${taskName}:`)
        console.log('----------------')
        console.log(`Heap Used: ${diff.heapUsed.toFixed(2)} MB`)
        console.log(`Heap Total: ${diff.heapTotal.toFixed(2)} MB`)
        console.log(`RSS: ${diff.rss.toFixed(2)} MB`)
        console.log(`External: ${diff.external.toFixed(2)} MB`)

        // Also show peak memory usage
        console.log(`Peak Heap Used: ${(memory.afterRun.heapUsed / 1024 / 1024).toFixed(2)} MB`)
      }

      console.log('\nComparison:')
      console.log('------------')
      console.log(`Performance improvement: ${perfImprovement}%`)
      console.log(`SQL implementation is ${(jsMeanMs / sqlMeanMs).toFixed(4)}x faster`)

      console.log('\nValidation Results:')
      console.log('-----------------')
      expect(jsResult.timeline.length, 'Test timeline entries').toBe(sqlResult.timeline.length)
      expect(jsResult.grandTotal.totalMs, 'Test grandtotal totalMs').toBe(sqlResult.grandTotal.totalMs)
      expect(jsResult.grandTotal.text, 'Test grandtotal totalMs').toBe(sqlResult.grandTotal.text)

      console.table(bench.table())
    }
  })
})
