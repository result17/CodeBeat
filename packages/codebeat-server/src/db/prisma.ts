import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

let client: PrismaClient | undefined

export const getPrismaClientInstance = (datasourceUrl: string) => client ?? new PrismaClient({ datasourceUrl }).$extends(withAccelerate())
export type PrismaInstance = ReturnType<typeof getPrismaClientInstance>