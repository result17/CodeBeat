import type { Context } from 'hono'
import type { ZodError } from 'zod'
import { OpenAPIHono } from '@hono/zod-openapi'
import { registerPostHeartbeat, registerPostHeartbeats } from './post'

export function handleZodError(
  result:
    | {
      success: true
      data: unknown
    }
    | {
      success: false
      error: ZodError
    },
  c: Context,
) {
  if (!result.success) {
    console.error(result.error.message)
    return c.json(
      {
        code: 'BAD_REQUEST',
        message: result.error.message,
      },
      { status: 400 },
    )
  }
}

export const heartbeatApi = new OpenAPIHono({
  defaultHook: handleZodError,
})

registerPostHeartbeat(heartbeatApi)
registerPostHeartbeats(heartbeatApi)
