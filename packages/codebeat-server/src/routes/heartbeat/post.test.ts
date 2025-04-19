import { describe, expect, it } from 'vitest' // Or your preferred test runner
import app from '../../test/app'

describe('heartbeat Endpoint', () => {
  const heartbeatData = {
    cursorpos: 125,
    entity: '/usr/test_data/main.go',
    language: 'Go',
    lineno: 19,
    lines: 38,
    project: 'test-cli',
    projectPath: null,
    time: 1585598059.1,
    userAgent: 'vscode_codebeat_0.0.1',
  }
  it('should throw an zod error', async () => {
    const res = await app.request('/api/heartbeat', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...heartbeatData,
        time: '2025-04-18T02:48:44.149Z',
      }),
    })
    expect(res.status).toBe(400)
    expect(await res.json()).toHaveProperty('code')
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
    // expect(await res.json()).toEqual(heartbeatData)
  }, {
    timeout: 8000,
  })
})
