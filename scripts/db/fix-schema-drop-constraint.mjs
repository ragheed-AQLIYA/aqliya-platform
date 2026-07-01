import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg("postgresql://postgres:postgres@localhost:5432/aqliya?schema=public");
const prisma = new PrismaClient({ adapter });

// Drop the constraint that blocks prisma db push
await prisma.$executeRawUnsafe(
  'ALTER TABLE "KnowledgeFoundationRelease" DROP CONSTRAINT IF EXISTS "KnowledgeFoundationRelease_versionId_key"'
);
console.log("✅ Constraint KnowledgeFoundationRelease_versionId_key dropped (if it existed)");

await prisma.$disconnect();
