import type { GrandTotal } from './schema'
import app from '@/test/app'
import { describe, expect, it } from 'vitest'

describe('get duration endpoint', () => {
  it('should return today heartbeat duaration', async () => {
    const res = await app.request('/api/duration/today', {
      method: 'GET',
    })
    expect(res.status).toBe(200)
    const body = await res.json<GrandTotal>()
    expect(body.text).toBeDefined()
    expect(body.text).toEqual('')
  })
})
