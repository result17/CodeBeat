import type { GrandTotal } from './schema'
import app from '@/test/app'
import { describe, expect, it } from 'vitest'

describe('get duration endpoint', () => {
  it('should return today\'s heartbeat duration', async () => {
    const res = await app.request('/api/duration/today', {
      method: 'GET',
    })
    expect(res.status).toBe(200)
    const body = await res.json<GrandTotal>()
    expect(body.text).toBeDefined()
  })

  it('should return spec date\'s heartbeat duration', async () => {
    const res = await app.request('/api/duration?start=1745380802000&end=1745413201000', {
      method: 'GET',
    })
    expect(res.status).toBe(200)
    const body = await res.json<GrandTotal>()
    expect(body.text).toBeDefined()
  })
})
