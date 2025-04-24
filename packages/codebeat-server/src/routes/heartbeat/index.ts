import { OpenAPIHono } from '@hono/zod-openapi'
import { registerGetHeartbeats } from './get'
import { registerPostHeartbeat, registerPostHeartbeats } from './post'

export const heartbeatApi = new OpenAPIHono()

registerPostHeartbeat(heartbeatApi)
registerPostHeartbeats(heartbeatApi)
registerGetHeartbeats(heartbeatApi)
