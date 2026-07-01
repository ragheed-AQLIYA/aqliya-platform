-- Core Evidence Platform (Phase 5B)
-- Backward compatible: product evidence tables unchanged; CoreEvidence is additive registry.

CREATE TABLE "CoreEvidence" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "productSlug" TEXT NOT NULL,
    "productEvidenceId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "storageKey" TEXT,
    "fileHash" TEXT,
    "evidenceType" TEXT,
    "lifecycleStatus" TEXT NOT NULL DEFAULT 'created',
    "sensitivity" TEXT NOT NULL DEFAULT 'standard',
    "uploadedById" TEXT,
    "graphNodeId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoreEvidence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EvidenceLink" (
    "id" TEXT NOT NULL,
    "coreEvidenceId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "linkType" TEXT NOT NULL DEFAULT 'supports',
    "productSlug" TEXT NOT NULL,
    "context" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceLink_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EvidenceRelation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sourceEvidenceId" TEXT NOT NULL,
    "targetEvidenceId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceRelation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EvidenceLifecycle" (
    "id" TEXT NOT NULL,
    "coreEvidenceId" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT NOT NULL,
    "actorId" TEXT,
    "reason" TEXT,
    "provenance" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceLifecycle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CoreEvidence_productSlug_productEvidenceId_key" ON "CoreEvidence"("productSlug", "productEvidenceId");
CREATE INDEX "CoreEvidence_organizationId_lifecycleStatus_idx" ON "CoreEvidence"("organizationId", "lifecycleStatus");
CREATE INDEX "CoreEvidence_organizationId_resourceType_resourceId_idx" ON "CoreEvidence"("organizationId", "resourceType", "resourceId");
CREATE INDEX "CoreEvidence_platformOrganizationId_createdAt_idx" ON "CoreEvidence"("platformOrganizationId", "createdAt");
CREATE INDEX "CoreEvidence_fileHash_idx" ON "CoreEvidence"("fileHash");

CREATE INDEX "EvidenceLink_coreEvidenceId_idx" ON "EvidenceLink"("coreEvidenceId");
CREATE INDEX "EvidenceLink_targetType_targetId_idx" ON "EvidenceLink"("targetType", "targetId");
CREATE INDEX "EvidenceLink_productSlug_targetType_targetId_idx" ON "EvidenceLink"("productSlug", "targetType", "targetId");

CREATE UNIQUE INDEX "EvidenceRelation_sourceEvidenceId_targetEvidenceId_relationType_key" ON "EvidenceRelation"("sourceEvidenceId", "targetEvidenceId", "relationType");
CREATE INDEX "EvidenceRelation_organizationId_relationType_idx" ON "EvidenceRelation"("organizationId", "relationType");
CREATE INDEX "EvidenceRelation_targetEvidenceId_idx" ON "EvidenceRelation"("targetEvidenceId");

CREATE INDEX "EvidenceLifecycle_coreEvidenceId_createdAt_idx" ON "EvidenceLifecycle"("coreEvidenceId", "createdAt");

ALTER TABLE "EvidenceLink" ADD CONSTRAINT "EvidenceLink_coreEvidenceId_fkey" FOREIGN KEY ("coreEvidenceId") REFERENCES "CoreEvidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EvidenceRelation" ADD CONSTRAINT "EvidenceRelation_sourceEvidenceId_fkey" FOREIGN KEY ("sourceEvidenceId") REFERENCES "CoreEvidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EvidenceRelation" ADD CONSTRAINT "EvidenceRelation_targetEvidenceId_fkey" FOREIGN KEY ("targetEvidenceId") REFERENCES "CoreEvidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EvidenceLifecycle" ADD CONSTRAINT "EvidenceLifecycle_coreEvidenceId_fkey" FOREIGN KEY ("coreEvidenceId") REFERENCES "CoreEvidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;
