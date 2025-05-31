import { describe, expect, it } from 'vitest'
import { GrandTotalSchemaMsg } from './errorMsg'
import { GrandTotalSchema } from './schema'

// Helper function for validation assertions
function assertValidationFailed(
  success: boolean,
  error: any,
  expectedMessage: string,
) {
  expect(success).toBeFalsy()
  expect(error?.issues[0].message).toBe(expectedMessage)
}

describe('grandTotalSchema validation tests', () => {
  // Shared test data factory
  const createDemoData = (
    hours: number,
    minutes: number,
    seconds: number,
    text: string,
  ) => ({
    hours,
    minutes,
    seconds,
    text,
    totalMs: hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000,
  })

  describe('invalid data scenarios', () => {
    it('should fail when totalMs does not match calculated value', () => {
      const demo = createDemoData(0, 14, 34, '14 mins')
      demo.totalMs = 5400 // Incorrect totalMs

      const { success, error } = GrandTotalSchema.safeParse(demo)
      assertValidationFailed(success, error, GrandTotalSchemaMsg.InvalidTotalMs)
    })

    it('should fail when minutes use singular form', () => {
      const demo = createDemoData(0, 14, 34, '14 min') // Invalid singular form

      const { success, error } = GrandTotalSchema.safeParse(demo)
      assertValidationFailed(success, error, GrandTotalSchemaMsg.InvalidText)
    })

    it('should fail when minutes exceed 60', () => {
      const demo = createDemoData(1, 14, 34, '74 mins') // Invalid minutes format
      const { success, error } = GrandTotalSchema.safeParse(demo)
      assertValidationFailed(success, error, GrandTotalSchemaMsg.InvalidText)
    })

    it('should fail when hours use singular form', () => {
      const demo = createDemoData(2, 14, 34, '2 hr 14 mins') // Invalid singular hour form
      const { success, error } = GrandTotalSchema.safeParse(demo)
      assertValidationFailed(success, error, GrandTotalSchemaMsg.InvalidText)
    })

    // Additional edge case tests
    it('should fail when duration is zero', () => {
      const demo = createDemoData(0, 0, 0, '0 mins')
      const { success, error } = GrandTotalSchema.safeParse(demo)
      assertValidationFailed(success, error, GrandTotalSchemaMsg.InvalidText)
    })

    it('should fail with completely invalid text format', () => {
      const demo = createDemoData(1, 30, 0, '1 hour thirty minutes')
      const { success, error } = GrandTotalSchema.safeParse(demo)
      assertValidationFailed(success, error, GrandTotalSchemaMsg.InvalidText)
    })
  })

  describe('valid data scenarios', () => {
    it('should pass when duration is less than 1 hour', () => {
      const demo = createDemoData(0, 14, 34, '14 mins')
      const { success } = GrandTotalSchema.safeParse(demo)
      expect(success).toBeTruthy()
    })

    it('should pass with 1 hour duration', () => {
      const demo = createDemoData(1, 14, 34, '1 hr 14 mins')
      const { success } = GrandTotalSchema.safeParse(demo)
      expect(success).toBeTruthy()
    })

    it('should pass with plural hours duration', () => {
      const demo = createDemoData(2, 14, 34, '2 hrs 14 mins')
      const { success } = GrandTotalSchema.safeParse(demo)
      expect(success).toBeTruthy()
    })

    // Edge case tests
    it('should pass when duration is exactly 60 minutes', () => {
      const demo = createDemoData(1, 0, 0, '1 hr')
      const result = GrandTotalSchema.safeParse(demo)
      expect(result.success).toBeTruthy()
    })

    it('should pass when duration exceeds 24 hours', () => {
      const demo = createDemoData(25, 0, 0, '25 hrs')
      const result = GrandTotalSchema.safeParse(demo)
      expect(result.success).toBeTruthy()
    })
  })
})
