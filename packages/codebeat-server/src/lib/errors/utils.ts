import type { Context } from 'hono'
import type { ClientErrorStatusCode, ServerErrorStatusCode } from 'hono/utils/http-status'
import type { ZodError, ZodIssue } from 'zod'
import { z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'

import { getContextProps } from '../context'

// Define all possible error codes for the application
export const ErrorCodes = [
  'BAD_REQUEST', // 400
  'UNAUTHORIZED', // 401
  'FORBIDDEN', // 403
  'NOT_FOUND', // 404
  'VALIDATION_ERROR', // 400
  'CONFLICT', // 409
  'INTERNAL_SERVER_ERROR', // 500
] as const

export const ErrorCodeEnum = z.enum(ErrorCodes)
export type ErrorCode = z.infer<typeof ErrorCodeEnum>

// Map HTTP status codes to error codes
export function statusToCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return 'BAD_REQUEST'
    case 401:
      return 'UNAUTHORIZED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 409:
      return 'CONFLICT'
    default:
      return 'INTERNAL_SERVER_ERROR'
  }
}

export function codeToStatus(code: ErrorCode): ClientErrorStatusCode | ServerErrorStatusCode {
  switch (code) {
    case 'BAD_REQUEST':
      return 400
    case 'UNAUTHORIZED':
      return 401
    case 'FORBIDDEN':
      return 403
    case 'NOT_FOUND':
      return 404
    case 'VALIDATION_ERROR':
      return 400
    case 'CONFLICT':
      return 409
    case 'INTERNAL_SERVER_ERROR':
      return 500
  }
}

// Zod error handler
export function parseZodErrorIssues(issues: ZodIssue[]): string {
  return issues
    .map(i =>
      i.code === 'invalid_union'
        ? i.unionErrors.map(ue => parseZodErrorIssues(ue.issues)).join('; ')
        : i.code === 'unrecognized_keys'
          ? i.message
          : `${i.path.length ? `${i.code} in '${i.path}': ` : ''}${i.message}`,
    )
    .join('; ')
}

// Custom API error class
export class ApiError extends HTTPException {
  public readonly code: ErrorCode

  constructor({
    code,
    message,
    cause,
  }: {
    code: ErrorCode
    message: string
    cause?: Error
  }) {
    const status = codeToStatus(code) as ClientErrorStatusCode
    super(status, { message, cause })
    this.code = code
  }
}

export function createErrorResponse(code: ErrorCode, message: string, details?: unknown) {
  const detailIsObject = typeof details === 'object' && details !== null
  const response: ErrorSchema = {
    code,
    message,
    ...(detailIsObject && { details }),
  }
  return response
}

export function handZodError(result:
  | {
    success: true
    data: unknown
  }
  | {
    success: false
    error: ZodError
  }, c: Context) {
  // Handle validation errors
  if (!result.success) {
    const { error } = result
    const message = parseZodErrorIssues(error.issues)
    const code = statusToCode(400)
    return c.json(
      createErrorResponse(code, message, error.flatten()),
      { status: 400 },
    )
  }
}

// Main error handler
export function handleError(err: Error, c: Context): Response {
  console.error('Handling error:', err)
  if (err instanceof ApiError) {
    console.error('An ApiError')
    return c.json(
      createErrorResponse(err.code, err.message),
      codeToStatus(err.code),
    )
  }

  if (err instanceof HTTPException) {
    console.error('An HTTPException Error')
    const code = statusToCode(err.status)
    return c.json(
      createErrorResponse(code, err.message),
      { status: err.status },
    )
  }

  console.error('Unhandled error:', err)

  const env = getContextProps(c).runtimeEnv

  const isProduction = env === 'production'
  const isDevelopment = env === 'development'

  return c.json(
    createErrorResponse(
      'INTERNAL_SERVER_ERROR',
      isProduction
        ? 'An unexpected error occurred'
        : err.message || 'Unknown error',
      isDevelopment
        ? {
            stack: err.stack,
            cause: err.cause,
          }
        : undefined,
    ),
    { status: 500 },
  )
}

export function createErrorSchema(code: ErrorCode) {
  return z.object({
    code: z.enum(ErrorCodes).openapi({
      example: code,
      description: 'The error code related to the status code.',
    }),
    message: z.string().openapi({
      description: 'A human readable message describing the issue.',
      example: '<string>',
    }),
    details: z.unknown().optional().openapi({
      description: 'Additional error details (validation errors, etc).',
    }),
  })
}

export type ErrorSchema = z.infer<ReturnType<typeof createErrorSchema>>
