import { describe, expect, it } from 'vitest'
import app from '../../test/app'

describe('get heartbeat Endpoint', () => {
  it('get all heartbeat record', async () => {
    const res = await app.request('/api/heartbeat', {
      method: 'GET',
    })
    expect(res.status).toBe(200)
  }, 10000)
})
