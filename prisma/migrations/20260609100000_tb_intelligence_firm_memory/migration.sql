-- TB Intelligence Firm Memory + Tenant Integration registry (ADR-001 Pre-Cycle 0)

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('AI', 'CRM', 'ERP', 'STORAGE', 'EMAIL', 'WEBHOOK');
CREATE TYPE "IntegrationStatus" AS ENUM ('ACTIVE', 'ERROR', 'DISABLED', 'PENDING');

-- CreateTable TenantIntegration (if not exists via idempotent pattern)
CREATE TABLE IF NOT EXISTS "TenantIntegration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "provider" TEXT NOT NULL,
    "displayName" TEXT,
    "status" "IntegrationStatus" NOT NULL DEFAULT 'ACTIVE',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "vaultSecretId" TEXT,
    "configMetadata" JSONB,
    "lastHealthCheckAt" TIMESTAMP(3),
    "lastSuccessAt" TIMESTAMP(3),
    "lastFailureAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "failureCount" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantIntegration_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TenantIntegration_organizationId_type_idx" ON "TenantIntegration"("organizationId", "type");
CREATE INDEX IF NOT EXISTS "TenantIntegration_organizationId_type_provider_idx" ON "TenantIntegration"("organizationId", "type", "provider");
CREATE INDEX IF NOT EXISTS "TenantIntegration_status_idx" ON "TenantIntegration"("status");

DO $$ BEGIN
  ALTER TABLE "TenantIntegration" ADD CONSTRAINT "TenantIntegration_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Firm Memory tables
CREATE TABLE "TBMappingPattern" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientAccountCode" TEXT NOT NULL,
    "clientAccountName" TEXT,
    "canonicalAccountId" TEXT NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 1,
    "lastConfidence" DOUBLE PRECISION,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TBMappingPattern_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TBMappingFeedback" (
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
);

CREATE TABLE "TBClassificationHistory" (
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TBClassificationHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TBMappingPattern_organizationId_clientAccountCode_key" ON "TBMappingPattern"("organizationId", "clientAccountCode");
CREATE INDEX "TBMappingPattern_organizationId_idx" ON "TBMappingPattern"("organizationId");
CREATE INDEX "TBMappingFeedback_organizationId_idx" ON "TBMappingFeedback"("organizationId");
CREATE INDEX "TBMappingFeedback_engagementId_idx" ON "TBMappingFeedback"("engagementId");
CREATE INDEX "TBClassificationHistory_organizationId_idx" ON "TBClassificationHistory"("organizationId");
CREATE INDEX "TBClassificationHistory_engagementId_idx" ON "TBClassificationHistory"("engagementId");
CREATE INDEX "TBClassificationHistory_accountCode_idx" ON "TBClassificationHistory"("accountCode");

ALTER TABLE "TBMappingPattern" ADD CONSTRAINT "TBMappingPattern_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TBMappingFeedback" ADD CONSTRAINT "TBMappingFeedback_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TBClassificationHistory" ADD CONSTRAINT "TBClassificationHistory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
