import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg("postgresql://postgres:postgres@localhost:5432/aqliya?schema=public");
const prisma = new PrismaClient({ adapter });

// Drop all constraints blocking db push
const constraints = [
  '"KnowledgeFoundationRelease_versionId_key"',
  '"KnowledgeFoundationVersion_versionNumber_key"',
];

for (const c of constraints) {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "KnowledgeFoundationRelease" DROP CONSTRAINT IF EXISTS ${c}`);
  } catch {}
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "KnowledgeFoundationVersion" DROP CONSTRAINT IF EXISTS ${c}`);
  } catch {}
}

console.log("✅ Constraints dropped");
await prisma.$disconnect();
