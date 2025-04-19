import type { Context } from 'hono'
import type { DBProps } from './types'

export function getDBProps(c: Context): DBProps {
  try {
    const ctx = c.executionCtx
    return ctx.props
  }
  catch (error) {
    console.error(`exec error: ${error}`)
    return {
      prisma: c.get('prisma'),
      db: c.get('db'),
    }
  }
}
