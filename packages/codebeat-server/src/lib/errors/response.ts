// https://github.com/openstatusHQ/openstatus/blob/main/apps/server/src/libs/errors/openapi-error-responses.ts
import type { RouteConfig } from '@hono/zod-openapi'
import { createErrorSchema } from './utils'

export const openApiErrorResponses = {
  400: {
    description:
        'The server cannot or will not process the request due to something that is perceived to be a client error (e.g., malformed request syntax, invalid request message framing, or deceptive request routing).',
    content: {
      'application/json': {
        schema: createErrorSchema('BAD_REQUEST').openapi('ErrBadRequest'),
      },
    },
  },
  500: {
    description:
          'The server has encountered a situation it doesn\'t know how to handle.',
    content: {
      'application/json': {
        schema: createErrorSchema('INTERNAL_SERVER_ERROR').openapi(
          'ErrInternalServerError',
        ),
      },
    },
  },
} satisfies RouteConfig['responses']
