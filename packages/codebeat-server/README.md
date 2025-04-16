## Adding unsupported database features of prisma schema
1. Generate empty migration
```bash
npx prisma migrate dev --create-only
```
2. Add [unsupported database features](https://www.prisma.io/docs/orm/prisma-migrate/workflows/unsupported-database-features). For example:
```sql
ALTER TABLE "Heartbeats" ADD CONSTRAINT "Lines_non_negative" CHECK ("lines" IS NULL OR "lines" >= 0),
ADD CONSTRAINT "Lineno_valid_range" CHECK (
    "lineno" IS NULL OR
    ("lineno" >= 0 AND ("lines" IS NULL OR "lineno" <= "lines"))
),
ADD CONSTRAINT "Time_order" CHECK ("recvAt" >= "sendAt" AND "createdAt" >= "recvAt")
```
3. Apply the migration:
```bash
npx prisma migrate dev
```
