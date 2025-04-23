import type { HeartbeatResult } from './schema'
import { describe, expect, it } from 'vitest'
import app from '../../test/app'

describe('post heartbeat Endpoint', () => {
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
        'accept': 'application/json',
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
        'accept': 'application/json',
      },
      body: JSON.stringify(heartbeatData),
    })
    expect(res.status).toBe(201)
    const resData = (await res.json()) as HeartbeatResult
    expect(resData).toMatchObject({
      status: 201,
      data: heartbeatData,
    })
  }, 10000)
})
