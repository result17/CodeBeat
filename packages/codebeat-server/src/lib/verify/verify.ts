import type { Context } from 'hono'
import { ApiError } from '@/lib'
import { z } from '@hono/zod-openapi'

export const UnixMillisSchema = z.number()
  .int()
  .min(0)
  .refine(v => v.toString().length >= 13)
  .refine(v => v < 253402300799000)

export enum StartAndDateErrorMsg {
  NoneDate = 'Missing start or end date parameter',
  StarDatetLater = 'Start date must be before end date',
  InvalidDate = 'Invalid date format',
}

export function verifyStartAndEndDate(c: Context) {
  const startDateStr = c.req.query('start')
  const endDateStr = c.req.query('end')

  if (!startDateStr || !endDateStr) {
    throw new ApiError({
      code: 'BAD_REQUEST',
      message: StartAndDateErrorMsg.NoneDate,
    })
  }

  try {
    const startDate = UnixMillisSchema.parse(Number(startDateStr))
    const endDate = UnixMillisSchema.parse(Number(endDateStr))

    if (startDate > endDate) {
      throw new ApiError({
        code: 'BAD_REQUEST',
        message: StartAndDateErrorMsg.StarDatetLater,
      })
    }
    return {
      start: startDate,
      end: endDate,
    }
  }
  catch (err) {
    if (err instanceof z.ZodError) {
      throw new ApiError({
        code: 'BAD_REQUEST',
        message: StartAndDateErrorMsg.InvalidDate,
      })
    }
    throw err
  }
}
