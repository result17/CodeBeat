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

export function logResJSONBody(): MiddlewareHandler {
  return async (c, next) => {
    await next()
    if (c.req.header('Accept')?.includes('application/json')) {
      try {
        console.log('JSON response body:', JSON.stringify(await c.res.clone().json(), null, 2))
      }
      catch (e) {
        console.error('Fail to parse JSON:', e)
      }
    }
  }
}
