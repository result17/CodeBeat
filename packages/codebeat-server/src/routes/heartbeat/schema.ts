import { z } from '@hono/zod-openapi'

const BaseHeartbeatSchema = z.object({
  entity: z.string().nonempty().openapi({
    param: {
      description: 'Absolute path to file for the heartbeat',
      example: '/usr/testdata/main.go',
    },
  }),
  language: z.string().nonempty().nullable().openapi({
    param: {
      description: 'Optional language name',
      example: 'Go',
    },
  }),
  cursorpos: z.number().int().min(0).nullable().openapi({
    param: {
      description: 'Optional cursor postion',
      example: 3,
    },
  }),
  lineno: z.number().int().min(0).nullable().openapi({
    param: {
      description: 'Optional line number',
      example: 18,
    },
  }),
  lines: z.number().int().min(0).nullable().openapi({
    param: {
      description: 'Optional line in the file',
      example: 67,
    },
  }),
  project: z.string().nonempty().nullable().openapi({
    param: {
      description: 'Optional project name',
      example: '/user/testdata',
    },
  }),
  projectPath: z.string().nonempty().nullable().openapi({
    param: {
      description: 'Optional project path',
      example: '/user/testdata',
    },
  }),
  time: z.number().gt(0).refine(
    (value) => {
      return /^\d+\.\d+$/.test(String(value))
    },
    { message: 'The timestamp must be a decimal with at least one fractional digit.' },
  ).openapi({
    param: {
      description: 'When cli send heartbeat',
      example: 1585598059.1,
    },
  }),
  userAgent: z.string().nonempty().nullable().openapi({
    param: {
      description: 'Optional project name',
      example: 'vscode_codebeat_0.0.1',
    },
  }),
})

export const HeartbeatSchema = BaseHeartbeatSchema.refine(data => {
  if (data.lineno !== null && data.lines !== null && data.lines < data.lineno) {
    return false
  }
  return true
}, { message: 'lines must be greater than or equal to lineno', path: ['lines'] })

export const HeartbeatsSchema = z.array(HeartbeatSchema)

export const HeartbeatResultSchema = z.object({
  data: BaseHeartbeatSchema.extend({
    id: z.string().nonempty().openapi({
      description: "Heartbeat record id (Using string takes place of bigInt)",
      example: "418"
    })
  }).refine(data => {
    if (data.lineno !== null && data.lines !== null && data.lines < data.lineno) {
      return false
    }
    return true
  }, { message: 'lines must be greater than or equal to lineno', path: ['lines'] }),
  status: z.number().int().min(100).max(599),
})

export const HeartbeatResultsSchema = z.array(HeartbeatResultSchema)
