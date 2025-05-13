import type { Context } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { getContextProps } from '../context'
import { createErrorResponse, statusToCode } from './utils'

interface ErrorHandlerOptions {
  /**
   * Whether to hide detailed error information in production environment
   */
  hideDetailsInProduction?: boolean
  /**
   * Whether to log detailed error information
   */
  logging?: boolean
}

/**
 * Create a common error handler with configurable options
 */
export function createCommonErrorHandler(options: ErrorHandlerOptions = {}) {
  const {
    hideDetailsInProduction = true,
    logging = true,
  } = options

  return function errorHandler(err: Error, c: Context): Response {
    // Log error details if logging is enabled
    if (logging) {
      console.error('[Error]', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        cause: err.cause,
      })
    }

    try { // 1. Handle validation errors from Zod
      if (err instanceof ZodError) {
        return c.json(
          createErrorResponse(
            'VALIDATION_ERROR',
            'Validation failed',
            {
              errors: err.issues.map(issue => ({
                path: issue.path,
                code: issue.code,
                message: issue.message,
              })),
            },
          ),
          400,
        )
      }

      // 2. Handle custom API errors and HTTP exceptions
      if (err instanceof HTTPException) {
        const code = statusToCode(err.status as StatusCode)
        const response = createErrorResponse(
          code,
          err.message,
        )

        return c.json(response, err.status)
      }

      // 3. Handle all other errors
      const isProduction = getContextProps(c).env === 'production'
      const response = createErrorResponse(
        'INTERNAL_SERVER_ERROR',
        isProduction && hideDetailsInProduction
          ? 'An internal server error occurred'
          : err.message || 'Unknown error',
        !isProduction || !hideDetailsInProduction
          ? {
              name: err.name,
              stack: err.stack,
              cause: err.cause,
            }
          : undefined,
      )

      return c.json(response, 500)
    }
    catch (handlerError) { // Ensure errors in the error handler itself are handled gracefully
      console.error('[ErrorHandler Failed]', handlerError)
      return c.json(
        createErrorResponse(
          'INTERNAL_SERVER_ERROR',
          'Error handler failed',
        ),
        500,
      )
    }
  }
}
