import { PrismaClient as NodePrisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

export function getPrismaClientInstance(datasourceUrl: string, accelerated: boolean = true) {
  return accelerated ? new PrismaClient({ datasourceUrl }).$extends(withAccelerate()) : new NodePrisma({ datasourceUrl })
}
export type PrismaInstance = ReturnType<typeof getPrismaClientInstance>
