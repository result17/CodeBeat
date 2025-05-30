import type { ErrorSchema } from '@/lib'
import type { HeartbeatResults } from './schema'
import { statusToCode } from '@/lib'
import app from '@/local/app'
import { describe, expect, it } from 'vitest'
import { HeartbeatErrorMsg } from './errorMsg'

describe('get heartbeat endpoint', () => {
  it('should return 400 for invalid dates', async () => {
    const datesErrorMsg = `${HeartbeatErrorMsg.startRequired}; ${HeartbeatErrorMsg.endRequired}`
    const res = await app.request('/api/heartbeat', {
      method: 'GET',
    })
    const body = await res.json<ErrorSchema>()
    expect(res.status).toBe(400)
    expect(body.code).toEqual(statusToCode(400))
    expect(body.message).toContain(datesErrorMsg)
  }, 10000)

  it('should return 400 for start date later than end date', async () => {
    const res = await app.request('/api/heartbeat?start=1745108632000&end=1745100782000', {
      method: 'GET',
    })
    const body = await res.json<ErrorSchema>()
    expect(res.status).toBe(400)
    expect(body.code).toEqual(statusToCode(400))
    expect(body.message).toContain(HeartbeatErrorMsg.startLessThanEnd)
  }, 10000)

  it('should return 400 for invalid start and end dates', async () => {
    const res = await app.request('/api/heartbeat?start=1745108632&end=1745100782', {
      method: 'GET',
    })
    const body = await res.json<ErrorSchema>()
    expect(res.status).toBe(400)
    expect(body.code).toEqual(statusToCode(400))
    expect(body.message).toContain(HeartbeatErrorMsg.dateTypeError)
  }, 10000)
})

it('should return records that meet the conditions.', async () => {
  const res = await app.request('/api/heartbeat?start=1745380802000&end=1745413201000', {
    method: 'GET',
  })
  const body = await res.json<HeartbeatResults>()
  expect(res.status).toBe(200)
  expect(Array.isArray(body)).toBeTruthy()
}, 10000)
