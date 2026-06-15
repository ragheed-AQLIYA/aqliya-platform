-- Phase 3D — Governed Firm Memory (status, reviewers, aging, client/ERP context)

CREATE TYPE "TBMappingPatternStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'TRUSTED', 'DEPRECATED');

ALTER TABLE "TBMappingPattern" ADD COLUMN IF NOT EXISTS "status" "TBMappingPatternStatus" NOT NULL DEFAULT 'CONFIRMED';
ALTER TABLE "TBMappingPattern" ADD COLUMN IF NOT EXISTS "lastConfirmedAt" TIMESTAMP(3);
ALTER TABLE "TBMappingPattern" ADD COLUMN IF NOT EXISTS "confirmedReviewerIds" JSONB NOT NULL DEFAULT '[]';
ALTER TABLE "TBMappingPattern" ADD COLUMN IF NOT EXISTS "auditClientId" TEXT;
ALTER TABLE "TBMappingPattern" ADD COLUMN IF NOT EXISTS "erpChartKey" TEXT;
ALTER TABLE "TBMappingPattern" ADD COLUMN IF NOT EXISTS "memoryVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "TBMappingPattern" ADD COLUMN IF NOT EXISTS "deprecatedAt" TIMESTAMP(3);
ALTER TABLE "TBMappingPattern" ADD COLUMN IF NOT EXISTS "deprecatedReason" TEXT;

CREATE INDEX IF NOT EXISTS "TBMappingPattern_organizationId_status_idx"
  ON "TBMappingPattern"("organizationId", "status");

CREATE INDEX IF NOT EXISTS "TBMappingPattern_auditClientId_idx"
  ON "TBMappingPattern"("auditClientId");
