import { getRangerData } from '@/shared'
import { describe, expect, it } from 'vitest'
import { heartbeats as records } from './testData/today_heartbeat'

describe('heartbeat duration calculation', () => {
  it('should return duration data', () => {
    const { grandTotal: { hours, minutes, seconds } } = getRangerData(records)
    expect(hours).toEqual(0)
    expect(minutes).toEqual(2)
    expect(seconds).toEqual(44)
  })
})
