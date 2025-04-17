import { OpenAPIHono } from '@hono/zod-openapi'
import { registerPostHeartbeat } from './post'

export const heartbeatApi = new OpenAPIHono({
  defaultHook: result => console.log(result),
})

registerPostHeartbeat(heartbeatApi)
