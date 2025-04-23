import { describe, expect, it } from 'vitest'
import { getRangerData } from './index'
import { heartbeats as records } from './testData/today_heartbeat'

describe('heartbeat duration calculation', () => {
  it('should return duration data', () => {
    const data = getRangerData(records)
    console.log(data)
    expect(data).toHaveProperty('start')
  })
})
