import type { Context } from 'hono'
import type { DBProps } from './types'

export function getDBProps(c: Context): DBProps {
  try {
    const ctx = c.executionCtx
    return ctx.props
  }
  catch {
    return {
      prisma: c.get('prisma'),
      db: c.get('db'),
      services: c.get('services'),
    }
  }
}
