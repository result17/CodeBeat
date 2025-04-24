import type { Context } from 'hono'
import type { ZodIssue } from 'zod'
import { codeToStatus, statusToCode } from '@/shared/error'
import { z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'

// Props to cal.com: https://github.com/calcom/cal.com/blob/5d325495a9c30c5a9d89fc2adfa620b8fde9346e/packages/lib/server/getServerErrorFromUnknown.ts#L17
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

function errorMessageFromZod({ issues }: ZodError) {
  return parseZodErrorIssues(issues)
}

export class ApiError extends HTTPException {
  public readonly code: ErrorCode

  constructor({
    code,
    message,
  }: {
    code: ErrorCode
    message: HTTPException['message']
  }) {
    const status = codeToStatus(code)
    super(status, { message })
    this.code = code
  }
}

export function handleError(err: Error, c: Context): Response {
  if (err instanceof ZodError) {
    return c.json<ErrorSchema>(
      {
        code: 'BAD_REQUEST',
        message: errorMessageFromZod(err),
      },
      { status: 400 },
    )
  }

  /**
   * This is a custom error that we throw in our code so we can handle it
   */
  if (err instanceof ApiError) {
    const code = statusToCode(err.status)

    return c.json<ErrorSchema>(
      {
        code,
        message: err.message,
      },
      { status: err.status },
    )
  }

  if (err instanceof HTTPException) {
    const code = statusToCode(err.status)
    return c.json<ErrorSchema>(
      {
        code,
        message: err.message,
      },
      { status: err.status },
    )
  }

  return c.json<ErrorSchema>(
    {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message ?? 'Something went wrong',
    },

    { status: 500 },
  )
}

export const ErrorCodes = [
  'BAD_REQUEST',
  'INTERNAL_SERVER_ERROR',
] as const

export const ErrorCodeEnum = z.enum(ErrorCodes)

export type ErrorCode = z.infer<typeof ErrorCodeEnum>

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
  })
}

export type ErrorSchema = z.infer<ReturnType<typeof createErrorSchema>>
