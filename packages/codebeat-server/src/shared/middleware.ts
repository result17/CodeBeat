import type { MiddlewareHandler } from 'hono'

export function logReqJSONBody(): MiddlewareHandler {
  return async (c, next) => {
    if (c.req.header('Content-Type')?.includes('application/json')) {
      try {
        const body = await c.req.json()
        console.log('JSON request body:', JSON.stringify(body, null, 2))
      }
      catch (e) {
        console.error('Fail to parse JSON:', e)
      }
    }
    await next()
  }
}
