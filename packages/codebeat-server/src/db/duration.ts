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
          project: string
          start_timestamp: bigint
          duration: bigint
        }>>`
          WITH RecordDiffs AS (
            SELECT 
              "project",
              "sendAt",
              LAG("project") OVER (ORDER BY "sendAt") as prev_project,
              LAG("sendAt") OVER (ORDER BY "sendAt") as prev_send_at
            FROM "Heartbeat"
            WHERE "sendAt" >= ${startDate} AND "sendAt" < ${endDate}
          ),

          /* 
          ValidDurations CTE 作用：
          1. 从RecordDiffs中筛选有效时间段
          2. 计算每个时间段的duration_ms
          3. 处理项目切换和超时情况

          行数变化原因：
          - 过滤掉第一条记录(prev_send_at IS NULL)
          - 过滤掉间隔>15分钟的记录
          - 合并相同项目的时间段

          输出字段：
          - project: 归属项目
          - start_timestamp: 时间段开始时间  
          - duration_ms: 时间段长度(毫秒)
          */
          TimeGroups AS (
            SELECT *,
              SUM(CASE 
                WHEN prev_send_at IS NULL THEN 1
                WHEN prev_project != "project" THEN 1
                WHEN EXTRACT(EPOCH FROM ("sendAt" - prev_send_at)) > 15 * 60 THEN 1
                ELSE 0 
              END) OVER (ORDER BY "sendAt") as group_id
            FROM RecordDiffs
          ),
          ValidDurations AS (
            SELECT
              "project",
              MIN("sendAt") OVER (
                PARTITION BY group_id
              ) as start_timestamp,
              CASE
                WHEN prev_send_at IS NULL THEN 0
                WHEN EXTRACT(EPOCH FROM ("sendAt" - prev_send_at)) > 15 * 60 THEN 0
                ELSE EXTRACT(EPOCH FROM ("sendAt" - prev_send_at)) * 1000
              END as duration_ms
            FROM TimeGroups
          ),
          -- Calculate total duration for validation
          TotalDuration AS (
            SELECT SUM(duration_ms) as total_ms FROM ValidDurations
          )
          SELECT
            project,
            start_timestamp,
            CAST(duration_ms AS BIGINT) as duration
          FROM ValidDurations
          ORDER BY start_timestamp
          `

        if (result.length === 0) {
          return {
            grandTotal: getGrandTotalWithMS(0),
            timeline: [],
          }
        }
        return {
          grandTotal: getGrandTotalWithMS(
            result.reduce((sum, item) => sum + Number(item.duration), 0),
          ),
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
