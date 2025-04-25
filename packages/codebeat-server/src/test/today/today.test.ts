import { getRangerData } from '@/shared'
import { describe, expect, it } from 'vitest'
import { heartbeats as records } from './testData/today_heartbeat'

describe('heartbeat duration calculation', () => {
  it('should return duration data', () => {
    const data = getRangerData(records)
    expect(data).toHaveProperty('start')
  })
})
