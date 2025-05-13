import type { SummaryData } from '@/shared'
import type { PrismaInstance } from './prisma'
import { getGrandTotalWithMS } from '@/shared/duration'

export interface DurationManager {
  // return the duration in milliseconds
  getSendAtDuration: (startDate: Date, endDate: Date) => Promise<bigint>
  getSummary: (startDate: Date, endDate: Date) => Promise<SummaryData>
}

export function getDurationManager(prisma: PrismaInstance): DurationManager {
  return {
    async getSendAtDuration(startDate, endDate) {
      try {
        const result = await prisma.$queryRaw<[{ total_duration_ms: bigint }]>`
        WITH TimeRanges AS (
          -- Step 1: Identify time range boundaries
          SELECT 
            "project",
            "sendAt",
            CASE WHEN 
              LAG("sendAt") OVER (PARTITION BY "project" ORDER BY "sendAt") IS NULL OR
              "project" != LAG("project") OVER (ORDER BY "sendAt") OR
              EXTRACT(EPOCH FROM ("sendAt" - LAG("sendAt") OVER (PARTITION BY "project" ORDER BY "sendAt"))) > 15 * 60
            THEN 1 ELSE 0 END as is_new_range
          FROM "Heartbeat"
          WHERE "sendAt" >= ${startDate}
            AND "sendAt" < ${endDate}
        ),
        RangeDurations AS (
          -- Step 2: Calculate duration for each time range
          SELECT 
            CAST(EXTRACT(EPOCH FROM (MAX("sendAt") - MIN("sendAt"))) * 1000 AS BIGINT) as duration_ms
          FROM (
            SELECT 
              *,
              SUM(is_new_range) OVER (ORDER BY "sendAt") as range_group
            FROM TimeRanges
          ) grouped
          GROUP BY "project", range_group
        )        -- Step 3: Sum all durations
        SELECT COALESCE(CAST(SUM(duration_ms) AS BIGINT), CAST(0 AS BIGINT)) as total_duration_ms
        FROM RangeDurations
        `
        return result[0]?.total_duration_ms || 0n
      }
      catch (error) {
        throw new Error(`Failed to get duration: ${error instanceof Error ? error.message : String(error)}`)
      }
    },
    async getSummary(startDate, endDate) {
      try {
        const result = await prisma.$queryRaw<Array<{
          project: string
          start_timestamp: bigint
          duration: bigint
          total_duration_ms: bigint
        }>>`
        WITH TimeRanges AS (
          -- Step 1: Identify time range boundaries
          SELECT 
            "project",
            "sendAt",
            CASE WHEN 
              LAG("sendAt") OVER (PARTITION BY "project" ORDER BY "sendAt") IS NULL OR
              "project" != LAG("project") OVER (ORDER BY "sendAt") OR
              EXTRACT(EPOCH FROM ("sendAt" - LAG("sendAt") OVER (PARTITION BY "project" ORDER BY "sendAt"))) > 15 * 60
            THEN 1 ELSE 0 END as is_new_range
          FROM "Heartbeat"
          WHERE "sendAt" >= ${startDate}
            AND "sendAt" < ${endDate}
        ),
        RangeDurations AS (
          -- Step 2: Calculate duration for each time range
          SELECT 
            "project",
            MIN("sendAt") as range_start,
            MAX("sendAt") as range_end,
            CAST(EXTRACT(EPOCH FROM (MAX("sendAt") - MIN("sendAt"))) * 1000 AS BIGINT) as duration_ms
          FROM (
            SELECT 
              *,
              SUM(is_new_range) OVER (ORDER BY "sendAt") as range_group
            FROM TimeRanges
          ) grouped
          GROUP BY "project", range_group
        )
        -- Step 3: Format final results with timeline
        SELECT 
          "project",
          CAST(EXTRACT(EPOCH FROM range_start) * 1000 AS BIGINT) as start_timestamp,
          CAST(duration_ms AS BIGINT) as duration,
          CAST(SUM(duration_ms) OVER () AS BIGINT) as total_duration_ms
        FROM RangeDurations
        ORDER BY range_start
        `

        if (result.length === 0) {
          return {
            grandTotal: getGrandTotalWithMS(0),
            timeline: [],
          }
        }
        console.log('result', result[0])
        return {
          grandTotal: getGrandTotalWithMS(result[0].total_duration_ms),
          timeline: result.map(item => ({
            project: item.project,
            start: Number(item.start_timestamp),
            duration: Number(item.duration),
          })),
        }
      }
      catch (error) {
        throw new Error(`Failed to get summary: ${error instanceof Error ? error.message : String(error)}`)
      }
    },
  }
}
