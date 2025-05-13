import { handZodError } from '@/lib'
import { OpenAPIHono } from '@hono/zod-openapi'
import { registerGetHeartbeats } from './get'
import { registerPostHeartbeat, registerPostHeartbeats } from './post'

export const heartbeatApi = new OpenAPIHono({
  defaultHook: handZodError,
})

registerPostHeartbeat(heartbeatApi)
registerPostHeartbeats(heartbeatApi)
registerGetHeartbeats(heartbeatApi)
