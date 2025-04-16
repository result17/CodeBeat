import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

async function listTables() {
  // PostgreSQL 示例
  const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
  console.log(tables);

  // MySQL 示例
  // const tables = await prisma.$queryRaw`SHOW TABLES`;
}

listTables();