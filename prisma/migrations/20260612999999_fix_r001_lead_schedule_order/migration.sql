-- Fix R-001: Create LeadSchedule and WorkingPaperIndex before
-- 20260613100000 tries to FK LeadScheduleLine to LeadSchedule.
-- Uses IF NOT EXISTS for safety on existing databases.

CREATE TABLE IF NOT EXISTS "WorkingPaperIndex" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "indexType" TEXT NOT NULL,
    "paperNumber" TEXT NOT NULL,
    "paperTitle" TEXT NOT NULL,
    "preparedById" TEXT,
    "preparedDate" TIMESTAMP(3),
    "methodologyRef" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "conclusion" TEXT,
    "reviewedById" TEXT,
    "reviewedDate" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkingPaperIndex_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "LeadSchedule" (
    "id" TEXT NOT NULL,
    "workingPaperIndexId" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "priorYearBalance" DOUBLE PRECISION,
    "currentYearBalance" DOUBLE PRECISION,
    "adjustments" JSONB,
    "finalBalance" DOUBLE PRECISION,
    "assertionCoverage" JSONB,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadSchedule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WorkingPaperIndex_engagementId_idx" ON "WorkingPaperIndex"("engagementId");
CREATE INDEX IF NOT EXISTS "WorkingPaperIndex_engagementId_indexType_idx" ON "WorkingPaperIndex"("engagementId", "indexType");

CREATE UNIQUE INDEX IF NOT EXISTS "LeadSchedule_workingPaperIndexId_key" ON "LeadSchedule"("workingPaperIndexId");
CREATE INDEX IF NOT EXISTS "LeadSchedule_engagementId_idx" ON "LeadSchedule"("engagementId");
CREATE INDEX IF NOT EXISTS "LeadSchedule_workingPaperIndexId_idx" ON "LeadSchedule"("workingPaperIndexId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'LeadSchedule_workingPaperIndexId_fkey'
  ) THEN
    ALTER TABLE "LeadSchedule"
      ADD CONSTRAINT "LeadSchedule_workingPaperIndexId_fkey"
      FOREIGN KEY ("workingPaperIndexId") REFERENCES "WorkingPaperIndex"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END;
$$;
