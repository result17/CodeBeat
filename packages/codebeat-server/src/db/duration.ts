import type { PrismaInstance } from './prisma'
import type { SummaryData } from '@/shared'
import { Prisma } from '@prisma/client'
import { getGrandTotalWithMS } from '@/shared/duration'

export interface DurationManager {
  // return the duration in milliseconds
  getSendAtDuration: (startDate: Date, endDate: Date) => Promise<bigint>
  getSummary: (startDate: Date, endDate: Date) => Promise<SummaryData>
  // return durations for multiple date ranges in milliseconds
  getMultiRangeDurations: (ranges: Array<{ startDate: Date, endDate: Date }>) => Promise<Array<bigint>>
}

export function getDurationManager(prisma: PrismaInstance): DurationManager {
  return {
    async getMultiRangeDurations(ranges) {
      try {
        const result = await prisma.$queryRaw<Array<{ range_index: number, duration_ms: bigint }>>(Prisma.sql`
        WITH RecordDiffs AS (
          SELECT 
            h."project",
            h."sendAt",
            r.idx as range_index,
            LAG(h."sendAt") OVER (PARTITION BY r.idx ORDER BY h."sendAt") as prev_sendAt,
            LAG(h."project") OVER (PARTITION BY r.idx ORDER BY h."sendAt") as prev_project
          FROM "Heartbeat" h
          CROSS JOIN (
            VALUES ${Prisma.join(
              ranges.map((range, i) =>
                Prisma.sql`(${i}, ${range.startDate}, ${range.endDate})`,
              ),
              ',',
            )}
          ) AS r(idx, start_date, end_date)
          WHERE h."sendAt" >= r.start_date 
            AND h."sendAt" < r.end_date
        ),
        ValidDurations AS (
          SELECT
            range_index,
            -- Assign time difference to previous project
            CASE
              WHEN prev_project IS NOT NULL THEN prev_project
              ELSE "project"  -- First record
            END as assigned_project,
            CASE
              -- First record doesn't count
              WHEN prev_sendAt IS NULL THEN 0
              -- Time intervals >15 minutes don't count
              WHEN EXTRACT(EPOCH FROM ("sendAt" - prev_sendAt)) > 15 * 60 THEN 0
              -- Normal case: calculate time difference
              ELSE EXTRACT(EPOCH FROM ("sendAt" - prev_sendAt)) * 1000
            END as duration_ms
          FROM RecordDiffs
          -- Exclude first record (no previous record)
          WHERE prev_sendAt IS NOT NULL
        )
        SELECT 
          range_index,
          COALESCE(CAST(SUM(duration_ms) AS BIGINT), CAST(0 AS BIGINT)) as duration_ms
        FROM ValidDurations
        GROUP BY range_index
        ORDER BY range_index
        `)

        const durations = ranges.map(() => 0n)
        result.forEach((row) => {
          if (row.range_index >= 0 && row.range_index < durations.length) {
            durations[row.range_index] = row.duration_ms
          }
        })
        return durations
      }
      catch (error) {
        throw new Error(`Failed to get multi-range durations: ${error instanceof Error ? error.message : String(error)}`)
      }
    },
    async getSendAtDuration(startDate, endDate) {
      try {
        const result = await prisma.$queryRaw<[{ total_duration_ms: bigint }]>`
          WITH RecordDiffs AS (
            SELECT 
              "project",
              "sendAt",
              LAG("sendAt") OVER (ORDER BY "sendAt") as prev_sendAt,
              LAG("project") OVER (ORDER BY "sendAt") as prev_project
            FROM "Heartbeat"
            WHERE "sendAt" >= ${startDate}
              AND "sendAt" < ${endDate}
          ),
          ValidDurations AS (
            SELECT
              -- Assign time difference to previous project
              CASE
                WHEN prev_project IS NOT NULL THEN prev_project
                ELSE "project"  -- First record
              END as assigned_project,
              CASE
                -- First record doesn't count
                WHEN prev_sendAt IS NULL THEN 0
                -- Time intervals >15 minutes don't count
                WHEN EXTRACT(EPOCH FROM ("sendAt" - prev_sendAt)) > 15 * 60 THEN 0
                -- Normal case: calculate time difference
                ELSE EXTRACT(EPOCH FROM ("sendAt" - prev_sendAt)) * 1000
              END as duration_ms
            FROM RecordDiffs
            WHERE prev_sendAt IS NOT NULL
          )
          SELECT COALESCE(CAST(SUM(duration_ms) AS BIGINT), CAST(0 AS BIGINT)) as total_duration_ms
          FROM ValidDurations
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
          period_id: bigint
          project: string
          period_start: bigint
          duration_ms: bigint
          period_end: bigint
          total_duration_ms: bigint
          total_heartbeat_count: number
          heartbeat_count: number
        }>>`
          WITH HeartbeatData AS (
            SELECT 
                id,
                "project",
                "sendAt",
                LAG("project") OVER (ORDER BY "sendAt") as prev_project,
                LAG("sendAt") OVER (ORDER BY "sendAt") as prev_send_at,
                LEAD("project") OVER (ORDER BY "sendAt") as next_project,
                LEAD("sendAt") OVER (ORDER BY "sendAt") as next_send_at,
                EXTRACT(EPOCH FROM ("sendAt" - LAG("sendAt") OVER (ORDER BY "sendAt"))) AS prev_time_diff,
                EXTRACT(EPOCH FROM (LEAD("sendAt") OVER (ORDER BY "sendAt") - "sendAt")) AS next_time_diff
            FROM "Heartbeat"
            WHERE "sendAt" >= ${startDate} AND "sendAt" < ${endDate}
        ),
      PeriodStarts AS (
          SELECT 
              *,
              CASE 
                  WHEN prev_project IS NULL THEN 1 -- First record
                  WHEN prev_project != "project" THEN 1 -- Project changed
                  WHEN prev_time_diff IS NULL OR prev_time_diff > 15 * 60 THEN 1 -- Gap >15 minutes
                  ELSE 0
              END AS is_period_start
          FROM HeartbeatData
      ),
  PeriodGroups AS (
      SELECT 
          *,
          SUM(is_period_start) OVER (ORDER BY "sendAt") AS period_id
      FROM PeriodStarts
  ),
  PeriodBoundaries AS (
      SELECT 
          period_id,
          "project",
          MIN("sendAt") AS period_start,
          MAX("sendAt") AS period_end_raw,
          MIN(CASE 
              WHEN next_project != "project" AND next_time_diff <= 15 * 60 
              THEN next_send_at 
              ELSE NULL 
          END) AS next_period_start
      FROM PeriodGroups
      GROUP BY period_id, "project"
  ),
  FinalPeriods AS (
      SELECT 
          pb.period_id,
          pb."project",
          pb.period_start,
          COALESCE(pb.next_period_start, pb.period_end_raw) AS period_end,
          EXTRACT(EPOCH FROM (COALESCE(pb.next_period_start, pb.period_end_raw) - pb.period_start)) * 1000 AS duration_ms,
          COUNT(*) AS heartbeat_count
      FROM PeriodBoundaries pb
      JOIN PeriodGroups pg ON pb.period_id = pg.period_id
      GROUP BY pb.period_id, pb."project", pb.period_start, pb.period_end_raw, pb.next_period_start
  )
          SELECT 
              period_id,
              "project",
              period_start,
              period_end,
              duration_ms,
              heartbeat_count,
              SUM(duration_ms) OVER() AS total_duration_ms,
              SUM(heartbeat_count) OVER() AS total_heartbeat_count
          FROM FinalPeriods
          WHERE period_end > period_start
          ORDER BY period_start;
          `
        if (result.length === 0) {
          return {
            grandTotal: getGrandTotalWithMS(0),
            timeline: [],
          }
        }
        return {
          grandTotal: getGrandTotalWithMS(
            Number(result[0].total_duration_ms),
          ),
          timeline: result.map(item => ({
            project: item.project,
            start: Number(item.period_start),
            duration: Number(item.duration_ms),
          })),
        }
      }
      catch (error) {
        throw new Error(`Failed to get summary: ${error instanceof Error ? error.message : String(error)}`)
      }
    },
  }
}
