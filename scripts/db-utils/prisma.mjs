// ─── Shared Prisma Client for Scripts ───
// No `import "server-only"` — safe to use outside Next.js bundler.
// Usage in any script:
//   import { prisma, ORG_ID } from "../../scripts/db-utils/prisma.mjs";
//   const users = await prisma.user.findMany();
//
// IMPORTANT: This is ONLY for scripts (npm run seed, migrations, data ops).
// DO NOT import from src/ app code. Use @/lib/prisma there.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";
const adapter = new PrismaPg(DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const ORG_ID = "cmqhcenx40000fopq7rpt4o31";

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export { prisma, ORG_ID };
export default prisma;
