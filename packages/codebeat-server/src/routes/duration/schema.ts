import { z } from '@hono/zod-openapi'
import { GrandTotalSchemaMsg } from './errorMsg'

export const GrandTotalSchema = z.object({
  hours: z.number().int().min(0).openapi({
    param: {
      description: 'The hour of duration',
      example: 0,
    },
  }),
  minutes: z.number().int().min(0).max(59).openapi({
    param: {
      description: 'The minutes of duration',
      example: 12,
    },
  }),
  seconds: z.number().int().min(0).max(59).openapi({
    param: {
      description: 'The seconds of duration',
      example: 59,
    },
  }),
  total_ms: z.number().int().min(0).openapi({
    param: {
      description: 'The total millionsends of duration',
      example: 4952332,
    },
  }),
  text: z.string().nonempty().regex(
    /^(1 hr|[2-9] hrs|[1-9]\d+ hrs)? ?(0 min|1 min|([2-9]|[1-5]\d) mins)?$/i,
    {
      message: GrandTotalSchemaMsg.InvalidText,
    },
  ).openapi({
    param: {
      description: 'Formated duration text',
      example: '36 mins',
    },
  }),
}).refine(({ total_ms, hours, minutes, seconds }) => {
  return total_ms >= hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000
}, {
  message: GrandTotalSchemaMsg.InvalidTotalMs,
  path: ['hours', 'minutes', 'seconds', 'total_ms'],
})

export type GrandTotal = z.infer<typeof GrandTotalSchema>
