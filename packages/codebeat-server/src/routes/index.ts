import { OpenAPIHono } from '@hono/zod-openapi'
import { durationAPI } from './duration'
import { heartbeatApi } from './heartbeat'

export const api = new OpenAPIHono()

api.route('/heartbeat', heartbeatApi)
api.route('/duration', durationAPI)
