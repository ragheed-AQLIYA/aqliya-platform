-- AuditOS 2.0 Phase 2: Add LeadSchedule and WorkingPaperIndex tables
-- Required by LeadScheduleLine FK which was created in 20260613100000_reporting_graph_foundation
-- but without the parent table, causing migration failure on fresh DB deployments.

CREATE TABLE "WorkingPaperIndex" (
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

CREATE TABLE "LeadSchedule" (
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

CREATE INDEX "WorkingPaperIndex_engagementId_idx" ON "WorkingPaperIndex"("engagementId");
CREATE INDEX "WorkingPaperIndex_engagementId_indexType_idx" ON "WorkingPaperIndex"("engagementId", "indexType");

CREATE UNIQUE INDEX "LeadSchedule_workingPaperIndexId_key" ON "LeadSchedule"("workingPaperIndexId");
CREATE INDEX "LeadSchedule_engagementId_idx" ON "LeadSchedule"("engagementId");
CREATE INDEX "LeadSchedule_workingPaperIndexId_idx" ON "LeadSchedule"("workingPaperIndexId");

ALTER TABLE "LeadSchedule" ADD CONSTRAINT "LeadSchedule_workingPaperIndexId_fkey" FOREIGN KEY ("workingPaperIndexId") REFERENCES "WorkingPaperIndex"("id") ON DELETE CASCADE ON UPDATE CASCADE;
