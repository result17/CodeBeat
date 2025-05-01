import { z } from '@hono/zod-openapi'
import { GrandTotalSchema } from '../duration/schema'

export const TimelineItemSchema = z.object({
  start: z.number().int().min(0).openapi({
    param: {
      description: 'The Beginning timestamp of heartbeat',
      example: 1746115062594,
    },
  }),
  duration: z.number().int().min(0).openapi({
    param: {
      description: 'The duration between heartbeat range',
      example: 10340,
    },
  }),
  project: z.string().nonempty().openapi({
    param: {
      description: 'Project name',
      example: 'codebeat',
    },
  }),
})

export const SummarySchema = z.object({
  grandTotal: GrandTotalSchema,
  timeline: z.array(TimelineItemSchema),
})

export type Summary = z.infer<typeof SummarySchema>
