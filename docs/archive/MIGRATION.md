# AQLIYA — PostgreSQL Migration Guide#

## Prerequisites#

1. **PostgreSQL Server** (one of):
   - **Local:** Install + start PostgreSQL service
   - **Cloud:** Supabase, Neon, Railway, etc.

2. **DATABASE_URL** format:
   ```
   postgresql://user:password@host:port/database?schema=public
   ```

---

## Step 1: Update Prisma Config#

### prisma/schema.prisma
```prisma
datasource db {
  provider = "postgresql"
}
```

### prisma.config.ts
```typescript
import { defineConfig } from "@prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  db: {
    provider: "postgresql",
    url: process.env.DATABASE_URL!,
  },
})
```

### .env
```
DATABASE_URL="postgresql://user:password@localhost:5432/aqliya?schema=public"
```

---

## Step 2: Run Migration#

### Option A: Keep Data (Complex)
1. Export SQLite data: `sqlite3 prisma/dev.db .dump > backup.sql`
2. Set up PostgreSQL
3. Import data manually (may need transformation)

### Option B: Fresh Start (Recommended)
```bash
npx prisma db push --accept-data-loss
```

⚠️ **Warning:** This erases all existing data. Use for:
- Development environments
- New deployments
- When data can be re-seeded

---

## Step 3: Generate Client#
```bash
npx prisma generate
```

---

## Step 4: Seed Minimal Data#

Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Create default organization
  const org = await prisma.organization.create({
    data: {
      name: "Default Organization",
    },
  })

  // Create admin user
  await prisma.user.create({
    data: {
      id: "static-user-id",
      email: "admin@aqliya.local",
      name: "System Admin",
      role: "ADMIN",
      organizationId: org.id,
    },
  })

  // Create sample sector
  await prisma.sector.create({
    data: {
      name: "Sample Sector",
      code: "SAMPLE",
      description: "A sample sector for testing",
      isActive: true,
    },
  })

  console.log("✅ Seed data created")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run seed:
```bash
npx prisma db seed
```

---

## Step 5: Verify#
```bash
npx tsc --noEmit
npm run build
```

---

## Common Issues#

### 1. "Can't reach database server"
- **Fix:** Start PostgreSQL service:
  ```bash
  # Windows
  net start postgresql-x64-15
  
  # Or check if running:
  Get-Service postgresql*
  ```

### 2. "role does not exist"
- **Fix:** Create user in PostgreSQL:
  ```sql
  CREATE USER myuser WITH PASSWORD 'mypassword';
  CREATE DATABASE aqliya OWNER myuser;
  ```

### 3. "schema public does not exist"
- **Fix:** Remove `?schema=public` from URL or create schema:
  ```sql
  CREATE SCHEMA IF NOT EXISTS public;
  ```

---

## Current Status#

⚠️ **PostgreSQL not running locally**

**Next Steps:**
1. Install PostgreSQL OR use cloud service (Supabase/Neon)
2. Update `.env` with real `DATABASE_URL`
3. Run `npx prisma db push --accept-data-loss`
4. Run seed script
5. Verify build

---

*Last updated: 2026-05-05*
