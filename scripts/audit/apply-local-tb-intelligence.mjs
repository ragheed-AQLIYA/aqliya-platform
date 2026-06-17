/**
 * Apply TB intelligence tables to the active local DATABASE_URL (Windows PG drift fix).
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";

const { PrismaClient } = await import("@prisma/client");
const { PrismaPg } = await import("@prisma/adapter-pg");
const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL) });

const statements = [
  `CREATE TABLE IF NOT EXISTS "TBMappingPattern" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientAccountCode" TEXT NOT NULL,
    "clientAccountName" TEXT,
    "canonicalAccountId" TEXT NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 1,
    "lastConfidence" DOUBLE PRECISION,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TBMappingPattern_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "TBMappingPattern_organizationId_clientAccountCode_key"
    ON "TBMappingPattern"("organizationId", "clientAccountCode")`,
  `CREATE INDEX IF NOT EXISTS "TBMappingPattern_organizationId_idx"
    ON "TBMappingPattern"("organizationId")`,
  `CREATE TABLE IF NOT EXISTS "TBMappingFeedback" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "engagementId" TEXT,
    "clientAccountCode" TEXT NOT NULL,
    "suggestedCanonicalId" TEXT,
    "acceptedCanonicalId" TEXT NOT NULL,
    "wasAccepted" BOOLEAN NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TBMappingFeedback_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "TBMappingFeedback_organizationId_idx"
    ON "TBMappingFeedback"("organizationId")`,
  `CREATE INDEX IF NOT EXISTS "TBMappingFeedback_engagementId_idx"
    ON "TBMappingFeedback"("engagementId")`,
  `CREATE TABLE IF NOT EXISTS "TBClassificationHistory" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "engagementId" TEXT,
    "accountCode" TEXT NOT NULL,
    "accountName" TEXT,
    "resultCategory" TEXT NOT NULL,
    "canonicalCode" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "providerId" TEXT,
    "mappingHints" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TBClassificationHistory_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "TBClassificationHistory_organizationId_idx"
    ON "TBClassificationHistory"("organizationId")`,
  `CREATE INDEX IF NOT EXISTS "TBClassificationHistory_engagementId_idx"
    ON "TBClassificationHistory"("engagementId")`,
  `CREATE INDEX IF NOT EXISTS "TBClassificationHistory_accountCode_idx"
    ON "TBClassificationHistory"("accountCode")`,
  `ALTER TABLE "TBClassificationHistory" ADD COLUMN IF NOT EXISTS "mappingHints" JSONB`,
];

for (const sql of statements) {
  try {
    await prisma.$executeRawUnsafe(sql);
    console.log("OK:", sql.slice(0, 60).replace(/\s+/g, " "));
  } catch (e) {
    console.warn("SKIP:", e.message?.slice(0, 100));
  }
}

const count = await prisma.tBMappingPattern.count();
console.log("TBMappingPattern count:", count);
await prisma.$disconnect();
