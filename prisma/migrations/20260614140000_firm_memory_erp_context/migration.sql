-- Phase 3C — Firm Memory Engine: ERP context (Map1/Map2/name fingerprint)

ALTER TABLE "TBMappingPattern" ADD COLUMN IF NOT EXISTS "erpMap1Label" TEXT;
ALTER TABLE "TBMappingPattern" ADD COLUMN IF NOT EXISTS "erpMap2Label" TEXT;
ALTER TABLE "TBMappingPattern" ADD COLUMN IF NOT EXISTS "nameFingerprint" TEXT;
ALTER TABLE "TBMappingPattern" ADD COLUMN IF NOT EXISTS "lastConfirmedById" TEXT;
ALTER TABLE "TBMappingPattern" ADD COLUMN IF NOT EXISTS "lastEngagementId" TEXT;

CREATE INDEX IF NOT EXISTS "TBMappingPattern_organizationId_nameFingerprint_idx"
  ON "TBMappingPattern"("organizationId", "nameFingerprint");

CREATE INDEX IF NOT EXISTS "TBMappingPattern_organizationId_erpMap_idx"
  ON "TBMappingPattern"("organizationId", "erpMap1Label", "erpMap2Label");

ALTER TABLE "TBMappingFeedback" ADD COLUMN IF NOT EXISTS "erpMap1Label" TEXT;
ALTER TABLE "TBMappingFeedback" ADD COLUMN IF NOT EXISTS "erpMap2Label" TEXT;
