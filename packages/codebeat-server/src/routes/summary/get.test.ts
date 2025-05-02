import app from '@/test/app'
import { describe, expect, it } from 'vitest'

describe('get summary endpoint', () => {
  it('should return spec date\'s heartbeat summary', async () => {
    const res = await app.request('/api/summary?start=1745380802000&end=1745413201000', {
      method: 'GET',
    })
    expect(res.status).toBe(200)
  })
  it('should return today\'s heartbeat summary', async () => {
    const res = await app.request('/api/summary/today', {
      method: 'GET',
    })
    expect(res.status).toBe(200)
  })
})
