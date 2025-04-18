import { z } from '@hono/zod-openapi'

export const HeartbeatSchema = z.object({
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
      return /^\d+\.\d$/.test(String(value))
    },
    { message: 'The timestamp must be a decimal with one fractional digit.' },
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

export const HeartbeatsSchema = z.array(HeartbeatSchema)