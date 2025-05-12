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

export const queryStartAndEndTimeStampSchema = z.object({
  start: z.string()
    .regex(/^\d{13}$/, { message: '13-digit Unix timestamp in milliseconds required' })
    .transform(val => Number(val))
    .pipe(z.number().int()
      .refine(v => v < 253402300799000, {
        message: 'Start time must be before year 9999',
      }))
    .openapi({
      param: {
        name: 'start',
        in: 'query',
        description: 'Start time in Unix milliseconds (13 digits)',
        example: '1714435200000', // 2024-05-01T00:00:00.000Z
      },
    }),
  end: z.string()
    .regex(/^\d{13}$/, { message: '13-digit Unix timestamp in milliseconds required' })
    .transform(val => Number(val))
    .pipe(z.number().int()
      .refine(v => v < 253402300799000, {
        message: 'End time must be before year 9999',
      }))
    .openapi({
      param: {
        name: 'end',
        in: 'query',
        description: 'End time in Unix milliseconds',
        example: '1714521599999', // 2024-05-01T23:59:59.999Z
      },
    }),
}).refine(
  ({ start, end }) => start <= end,
  {
    message: 'Start time must be before or equal to end time',
    path: ['start'],
  },
)
