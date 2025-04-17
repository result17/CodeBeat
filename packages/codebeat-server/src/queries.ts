import { prisma } from './db'

async function listTables() {
  const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `
  console.log(tables)
}

listTables()
