import type { ErrorSchema } from '@/lib'
import type { HeartbeatResults } from './schema'
import { statusToCode } from '@/lib'
import app from '@/local/app'
import { describe, expect, it } from 'vitest'
import { HeartbeatErrorMsg } from './errorMsg'

describe('get heartbeat endpoint', () => {
  it(HeartbeatErrorMsg.NoneDate, async () => {
    const res = await app.request('/api/heartbeat', {
      method: 'GET',
    })
    const body = await res.json<ErrorSchema>()
    expect(res.status).toBe(400)
    expect(body.code).toEqual(statusToCode(400))
    expect(body.message).toEqual(HeartbeatErrorMsg.NoneDate)
  }, 10000)

  it(HeartbeatErrorMsg.StarDatetLater, async () => {
    const res = await app.request('/api/heartbeat?start=1745108632000&end=1745100782000', {
      method: 'GET',
    })
    const body = await res.json<ErrorSchema>()
    expect(res.status).toBe(400)
    expect(body.code).toEqual(statusToCode(400))
    expect(body.message).toEqual(HeartbeatErrorMsg.StarDatetLater)
  }, 10000)

  it(HeartbeatErrorMsg.InvalidDate, async () => {
    const res = await app.request('/api/heartbeat?start=1745108632&end=1745100782', {
      method: 'GET',
    })
    const body = await res.json<ErrorSchema>()
    expect(res.status).toBe(400)
    expect(body.code).toEqual(statusToCode(400))
    expect(body.message).toEqual(HeartbeatErrorMsg.InvalidDate)
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
