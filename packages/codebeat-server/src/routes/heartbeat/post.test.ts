import { describe, expect, it } from 'vitest' // Or your preferred test runner
import app from '../../app'

describe('heartbeat Endpoint', () => {
  const heartbeatData = {
    cursorpos: 125,
    entity: '/usr/test_data/main.go',
    language: 'Go',
    lineno: 19,
    lines: 38,
    project: 'test-cli',
    time: 1585598059.1,
    userAgent: 'vscode_codebeat_0.0.1',
  }
  it('should throw an zod error', async () => {
    const invalid = structuredClone(heartbeatData) as unknown
    // @ts-expect-error - create inValid data
    invalid.entity = 1233
    const res = await app.request('/api/heartbeat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(heartbeatData),
    })
    expect(res.status).toBe(500)
    expect(await res.json()).toBeNull()
  })

  it('should return heartbeat record', async () => {
    const res = await app.request('/api/heartbeat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(heartbeatData),
    })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(heartbeatData)
  })
})
