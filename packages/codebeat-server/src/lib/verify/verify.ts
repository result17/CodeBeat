import { z } from '@hono/zod-openapi'

export const UnixMillisSchema = z.number()
  .int()
  .min(0)
  .refine(v => v.toString().length >= 13)
  .refine(v => v < 253402300799000)

export const baseIntStartAndEndSchema = z.object({
  start: UnixMillisSchema
    .openapi({
      param: {
        name: 'start',
        in: 'query',
        description: 'Start time in Unix milliseconds (13 digits)',
        example: '1714435200000', // 2024-05-01T00:00:00.000Z
      },
    }),
  end: UnixMillisSchema
    .openapi({
      param: {
        name: 'end',
        in: 'query',
        description: 'End time in Unix milliseconds (13 digits)',
        example: '1714521599999', // 2024-05-01T23:59:59.999Z
      },
    }),
})
export enum StartAndDateErrorMsg {
  dateTypeError = '13-digit Unix timestamp in milliseconds required',
  startLessThanEnd = 'start date must be less than end date',
  startRequired = 'invalid_type in \'start\': Required',
  endRequired = 'invalid_type in \'end\': Required',
  startLessThan9999 = 'start time must be before year 9999',
  endLessThan9999 = 'end time must be before year 9999',
}

export const baseStartAndEndTimeStampSchema = z.object({
  start: z.string()
    .regex(/^\d{13}$/, { message: StartAndDateErrorMsg.dateTypeError })
    .transform(val => Number(val))
    .pipe(z.number().int()
      .refine(v => v < 253402300799000, {
        message: StartAndDateErrorMsg.startLessThan9999,
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
    .regex(/^\d{13}$/, { message: StartAndDateErrorMsg.dateTypeError })
    .transform(val => Number(val))
    .pipe(z.number().int()
      .refine(v => v < 253402300799000, {
        message: StartAndDateErrorMsg.endLessThan9999,
      }))
    .openapi({
      param: {
        name: 'end',
        in: 'query',
        description: 'End time in Unix milliseconds',
        example: '1714521599999', // 2024-05-01T23:59:59.999Z
      },
    }),
})

export const queryStartAndEndTimeStampSchema = baseStartAndEndTimeStampSchema.refine(
  ({ start, end }) => start <= end,
  {
    message: StartAndDateErrorMsg.startLessThanEnd,
    path: ['start'],
  },
)
