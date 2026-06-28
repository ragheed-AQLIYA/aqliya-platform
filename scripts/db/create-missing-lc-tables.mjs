import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg("postgresql://postgres:postgres@localhost:5432/aqliya?schema=public");
const prisma = new PrismaClient({ adapter });

const TABLES = [
  `CREATE TABLE IF NOT EXISTS "LcWorkbook" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reportingPeriod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "totalLines" INTEGER NOT NULL DEFAULT 0,
    "autoFilledLines" INTEGER NOT NULL DEFAULT 0,
    "missingLines" INTEGER NOT NULL DEFAULT 0,
    "completionPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exportedAt" TIMESTAMP(3),
    "lcScore" DOUBLE PRECISION,
    "lcScoreComputedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LcWorkbook_pkey" PRIMARY KEY ("id")
  )`,
  
  `CREATE TABLE IF NOT EXISTS "LcWorkbookLine" (
    "id" TEXT NOT NULL,
    "workbookId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "autoFillable" BOOLEAN NOT NULL DEFAULT false,
    "autoFilled" BOOLEAN NOT NULL DEFAULT false,
    "autoFillValue" DOUBLE PRECISION,
    "autoFillSource" TEXT,
    "manualValue" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'tb',
    "confidence" TEXT NOT NULL DEFAULT 'high',
    "evidenceRequired" BOOLEAN NOT NULL DEFAULT false,
    "evidenceTypes" TEXT,
    "notes" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LcWorkbookLine_pkey" PRIMARY KEY ("id")
  )`,
  
  `CREATE TABLE IF NOT EXISTS "LcPatternSuggestion" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workbookLineCode" TEXT NOT NULL,
    "currentPattern" TEXT NOT NULL,
    "suggestedPattern" TEXT NOT NULL,
    "reasoning" TEXT,
    "falsePositiveAccounts" JSONB,
    "unmatchedAccounts" JSONB,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'ai',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acceptanceScore" DOUBLE PRECISION,
    "successScore" DOUBLE PRECISION,
    "falsePositiveRate" DOUBLE PRECISION,
    "decayScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "appliedAt" TIMESTAMP(3),
    "healthScore" DOUBLE PRECISION,
    CONSTRAINT "LcPatternSuggestion_pkey" PRIMARY KEY ("id")
  )`,
  
  `CREATE TABLE IF NOT EXISTS "LcMatchReview" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workbookLineId" TEXT,
    "workbookLineCode" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "patternUsed" TEXT,
    "matchType" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL DEFAULT 'low',
    "riskReason" TEXT,
    "evidence" JSONB,
    "isFalsePositive" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LcMatchReview_pkey" PRIMARY KEY ("id")
  )`,
  
  `CREATE TABLE IF NOT EXISTS "LcRecommendation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workbookId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "impactScore" DOUBLE PRECISION NOT NULL,
    "priority" TEXT NOT NULL,
    "estimatedValue" DOUBLE PRECISION,
    "effort" TEXT,
    "evidenceRefs" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT,
    "rationale" TEXT,
    "groundingConfidence" DOUBLE PRECISION,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LcRecommendation_pkey" PRIMARY KEY ("id")
  )`,
];

let success = 0;
let skip = 0;

for (const sql of TABLES) {
  const tableName = sql.match(/CREATE TABLE.*?"(.+?)"/)[1];
  try {
    await prisma.$executeRawUnsafe(sql);
    console.log(`✅ Created table: ${tableName}`);
    success++;
  } catch (err) {
    if (err.message.includes("already exists")) {
      console.log(`⏭️  Already exists: ${tableName}`);
      skip++;
    } else {
      console.log(`❌ Failed: ${tableName}: ${err.message.substring(0, 100)}`);
    }
  }
}

console.log(`\nDone: ${success} created, ${skip} skipped`);
await prisma.$disconnect();
