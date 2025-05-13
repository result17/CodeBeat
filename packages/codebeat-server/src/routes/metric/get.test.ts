import type { ErrorSchema } from '@/lib'
import type { BaseMetric } from './schema'
import { StartAndDateErrorMsg, statusToCode } from '@/lib'
import app from '@/local/app'
import { describe, expect, it } from 'vitest'
import { baseMetricSchema } from './schema'

describe('[GET] /metric/:metric', () => {
  const validStartTime = '1745380802000' // 2025-04-22
  const validEndTime = '1745413201000' // 2025-04-23

  describe('error scenarios', () => {
    it('should return 400 when start time is missing', async () => {
      const res = await app.request(`/api/metric/duration/project?end=${validEndTime}`, {
        method: 'GET',
      })
      const body = await res.json<ErrorSchema>()
      console.log(body)
      expect(res.status).toBe(400)
      expect(body.code).toEqual(statusToCode(400))
      expect(body.message).toBe(StartAndDateErrorMsg.startRequired)
    })

    it('should return 400 when end time is missing', async () => {
      const res = await app.request(`/api/metric/duration/project?start=${validStartTime}`, {
        method: 'GET',
      })
      const body = await res.json<ErrorSchema>()
      expect(res.status).toBe(400)
      expect(body.code).toEqual(statusToCode(400))
      expect(body.message).toBe(StartAndDateErrorMsg.endRequired)
    })

    it('should return 400 when timestamp is invalid format', async () => {
      const res = await app.request(`/api/metric/duration/project?start=123&end=${validEndTime}`, {
        method: 'GET',
      })
      expect(res.status).toBe(400)
      const body = await res.json<ErrorSchema>()
      expect(body.code).toEqual(statusToCode(400))
      expect(body.message).toContain(StartAndDateErrorMsg.dateTypeError)
    })

    it('should return 400 when start time is after end time', async () => {
      const res = await app.request(
        `/api/metric/duration/project?start=${validEndTime}&end=${validStartTime}`,
        { method: 'GET' },
      )
      const body = await res.json<ErrorSchema>()
      expect(res.status).toBe(400)
      expect(body.code).toEqual(statusToCode(400))
      expect(body.message).toContain(StartAndDateErrorMsg.startLessThanEnd)
    })

    it('should return 400 when metric is invalid', async () => {
      const res = await app.request(
        `/api/metric/duration/invalid_metric?start=${validStartTime}&end=${validEndTime}`,
        { method: 'GET' },
      )
      expect(res.status).toBe(400)
    })
  })

  describe('success scenarios', () => {
    it('should return metric data for project metric', async () => {
      const res = await app.request(
        `/api/metric/duration/project?start=${validStartTime}&end=${validEndTime}`,
        { method: 'GET' },
      )
      expect(res.status).toBe(200)

      const data = await res.json<BaseMetric>()
      if (data.ratios.length > 0) {
        expect(data).toMatchObject({
          metric: 'project',
          ratios: expect.arrayContaining([
            expect.objectContaining({
              value: expect.any(String),
              duration: expect.any(Number),
              ratio: expect.any(Number),
              durationText: expect.any(String),
            }),
          ]),
        })
      } expect(baseMetricSchema.safeParse(data).success).toBe(true)
    })

    it('should return metric data for language metric', async () => {
      const res = await app.request(
        `/api/metric/duration/language?start=${validStartTime}&end=${validEndTime}`,
        { method: 'GET' },
      )
      expect(res.status).toBe(200)

      const data = await res.json<BaseMetric>()
      if (data.ratios.length > 0) {
        expect(data).toMatchObject({
          metric: 'language',
          ratios: expect.arrayContaining([
            expect.objectContaining({
              value: expect.any(String),
              duration: expect.any(Number),
              ratio: expect.any(Number),
              durationText: expect.any(String),
            }),
          ]),
        })
      }
      expect(baseMetricSchema.safeParse(data).success).toBe(true)
    })

    it('should handle empty time range gracefully', async () => {
      // Using a very small time range that likely has no data
      const start = '1745380802000'
      const end = '1745380802001'

      const res = await app.request(
        `/api/metric/duration/project?start=${start}&end=${end}`,
        { method: 'GET' },
      )
      expect(res.status).toBe(200)

      const data = await res.json<BaseMetric>()
      expect(data).toMatchObject({
        metric: 'project',
        ratios: [],
      })
      expect(baseMetricSchema.safeParse(data).success).toBe(true)
    })
  })
})
