import { OpenAPIHono } from '@hono/zod-openapi'
import { durationAPI } from './duration'
import { heartbeatApi } from './heartbeat'
import { summaryAPI } from './summary'

export const api = new OpenAPIHono()

api.doc('/doc', {
  openapi: '3.0.0',
  info: {
    version: '1.0.0',
    title: 'CodeBeat',
    contact: {
      email: 'ping@openstatus.dev',
    },
    description:
        'Codebeat monitors your programming work',
  },
  tags: [
    {
      'name': 'monitor',
      'description': 'Monitor related endpoints',
      'x-displayName': 'Monitor',
    },
    {
      'name': 'status_report',
      'description': 'Status report related endpoints',
      'x-displayName': 'Status Report',
    },
  ],
  security: [
    {
      ApiKeyAuth: [],
    },
  ],
})

api.route('/heartbeat', heartbeatApi)
api.route('/duration', durationAPI)
api.route('/summary', summaryAPI)
