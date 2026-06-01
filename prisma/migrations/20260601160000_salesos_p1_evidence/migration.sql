-- SalesOS P1 evidence link stub (PR-4)
-- Apply: npx prisma migrate deploy  OR  npx prisma migrate dev --name salesos_p1_evidence (human)

CREATE TABLE "SalesEvidenceLink" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "dealId" TEXT,
    "accountId" TEXT,
    "evidenceId" TEXT NOT NULL,
    "evidenceSource" TEXT NOT NULL DEFAULT 'platform',
    "label" TEXT,
    "evidenceType" TEXT,
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesEvidenceLink_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SalesEvidenceLink_targetType_targetId_evidenceId_key" ON "SalesEvidenceLink"("targetType", "targetId", "evidenceId");

CREATE INDEX "SalesEvidenceLink_organizationId_createdAt_idx" ON "SalesEvidenceLink"("organizationId", "createdAt");

CREATE INDEX "SalesEvidenceLink_platformOrganizationId_createdAt_idx" ON "SalesEvidenceLink"("platformOrganizationId", "createdAt");

CREATE INDEX "SalesEvidenceLink_dealId_idx" ON "SalesEvidenceLink"("dealId");

CREATE INDEX "SalesEvidenceLink_accountId_idx" ON "SalesEvidenceLink"("accountId");

CREATE INDEX "SalesEvidenceLink_evidenceId_idx" ON "SalesEvidenceLink"("evidenceId");

CREATE INDEX "SalesEvidenceLink_targetType_targetId_idx" ON "SalesEvidenceLink"("targetType", "targetId");

ALTER TABLE "SalesEvidenceLink" ADD CONSTRAINT "SalesEvidenceLink_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "SalesDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SalesEvidenceLink" ADD CONSTRAINT "SalesEvidenceLink_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SalesAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
