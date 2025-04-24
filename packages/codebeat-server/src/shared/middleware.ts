import type { ErrorSchema } from '@/lib/errors'
import type { MiddlewareHandler } from 'hono'

interface LogOptions {
  level?: 'info' | 'warn' | 'error'
  timestamp?: boolean
}

function formatLog(message: string, data?: unknown, options: LogOptions = {}) {
  const { level = 'info', timestamp = true } = options
  const logData = data && typeof data === 'object'
    ? data
    : { value: data }

  const logEntry: Record<string, unknown> = {
    level,
    message,
    ...(timestamp && { timestamp: new Date().toISOString() }),
    ...logData,
  }

  if (level === 'error' && data instanceof Error) {
    logEntry.stack = data.stack
    logEntry.message = data.message
  }

  console[level](JSON.stringify(logEntry, null, 2))
}

export function logReqJSONBody(): MiddlewareHandler {
  return async (c, next) => {
    if (c.req.header('Content-Type')?.includes('application/json')) {
      try {
        const body = await c.req.json()
        formatLog('Request JSON body', {
          path: c.req.path,
          method: c.req.method,
          body,
        })
      }
      catch (e) {
        formatLog('Failed to parse request JSON', e, { level: 'error' })
      }
    }
    await next()
  }
}

export function logResJSONBody(): MiddlewareHandler {
  return async (c, next) => {
    await next()
    if (c.req.header('Accept')?.includes('application/json')) {
      try {
        const response = await c.res.clone().json<ErrorSchema>()
        const isError = response.code !== undefined && response.message !== undefined

        formatLog('Response JSON body', {
          path: c.req.path,
          method: c.req.method,
          status: c.res.status,
          response: isError ? formatErrorResponse(response) : response,
        }, {
          level: isError ? 'error' : 'info',
        })
      }
      catch (e) {
        formatLog('Failed to parse response JSON', e, { level: 'error' })
      }
    }
  }
}

function formatErrorResponse(error: ErrorSchema): Record<string, unknown> {
  return {
    error: {
      code: error.code,
      message: error.message
        .replace(/\\n/g, '\n') // replace newline character
        .replace(/\s+/g, ' ') // reduce spaces
        .trim(),
    },
  }
}
