import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

let client: PrismaClient | undefined

export function getPrismaClientInstance(datasourceUrl: string, accelerated: boolean = true) {
  if (client) {
    return client
  }
  return accelerated ? new PrismaClient({ datasourceUrl }).$extends(withAccelerate()) : new PrismaClient({ datasourceUrl })
}
export type PrismaInstance = ReturnType<typeof getPrismaClientInstance>
