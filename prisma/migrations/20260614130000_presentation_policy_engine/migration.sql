-- Phase 13.2: engagement presentation policies
CREATE TABLE IF NOT EXISTS "AuditPresentationPolicy" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "version" TEXT NOT NULL,
  "rules" JSONB NOT NULL,
  "isSystem" BOOLEAN NOT NULL DEFAULT true,
  "organizationId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AuditPresentationPolicy_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AuditPresentationPolicy_slug_key"
  ON "AuditPresentationPolicy"("slug");

CREATE INDEX IF NOT EXISTS "AuditPresentationPolicy_organizationId_idx"
  ON "AuditPresentationPolicy"("organizationId");

CREATE INDEX IF NOT EXISTS "AuditPresentationPolicy_slug_idx"
  ON "AuditPresentationPolicy"("slug");

ALTER TABLE "AuditEngagement"
  ADD COLUMN IF NOT EXISTS "presentationPolicyId" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'AuditEngagement_presentationPolicyId_fkey'
  ) THEN
    ALTER TABLE "AuditEngagement"
      ADD CONSTRAINT "AuditEngagement_presentationPolicyId_fkey"
      FOREIGN KEY ("presentationPolicyId")
      REFERENCES "AuditPresentationPolicy"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "AuditEngagement_presentationPolicyId_idx"
  ON "AuditEngagement"("presentationPolicyId");

-- Seeded system policies (rules mirror builtin TypeScript definitions)
INSERT INTO "AuditPresentationPolicy" ("id", "slug", "name", "version", "rules", "isSystem", "updatedAt")
VALUES
  (
    'pol-generic-v1',
    'generic-v1',
    'Generic Presentation Policy',
    'generic-v1',
    '{"slug":"generic-v1","name":"Generic Presentation Policy","version":"generic-v1","revenue":{"operatingExclusionGlCodes":[],"affiliateGlCodes":[],"contractRevenueGlCodes":[],"unbilledDuplicateGlCodes":[],"excludeAffiliateFromOperatingHeadline":false},"costOfRevenue":{"exclusionGlCodes":[],"exclusionPrefixPatterns":[]},"otherIncome":{"miscNettingGlCode":null,"targetNet":null},"finance":{"netOffset":null},"headline":{"useOperatingRevenueLabel":false,"useAuditedHeadlineRules":false}}'::jsonb,
    true,
    CURRENT_TIMESTAMP
  ),
  (
    'pol-shalfa-pilot-audited-v1',
    'shalfa-pilot-audited-v1',
    'Shalfa Pilot Audited Presentation Policy',
    'pilot-audited-v1',
    '{"slug":"shalfa-pilot-audited-v1","name":"Shalfa Pilot Audited Presentation Policy","version":"pilot-audited-v1","revenue":{"operatingExclusionGlCodes":["4401010004","4601010003","4701010001"],"affiliateGlCodes":["4401010005"],"contractRevenueGlCodes":["4401010004"],"unbilledDuplicateGlCodes":["4401010003"],"excludeAffiliateFromOperatingHeadline":true},"costOfRevenue":{"exclusionGlCodes":["3204010028","3204010054"],"exclusionPrefixPatterns":["33"]},"otherIncome":{"miscNettingGlCode":"4501010003","targetNet":735915},"finance":{"netOffset":334011},"headline":{"useOperatingRevenueLabel":true,"useAuditedHeadlineRules":true}}'::jsonb,
    true,
    CURRENT_TIMESTAMP
  )
ON CONFLICT ("id") DO NOTHING;
