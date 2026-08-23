-- LCGPA Regulatory Intelligence Engine
--
-- Generated with: prisma migrate diff --from-config-datasource --to-schema --script
-- Reviewed 2026-08-22. See docs/regulatory/LCGPA_SCHEMA_AUDIT.md
--
-- Verified properties of this migration:
--   * 19 CREATE TABLE, 77 CREATE INDEX, 6 CREATE UNIQUE INDEX, 22 ADD CONSTRAINT
--   * ZERO DROP TABLE, DROP COLUMN or TRUNCATE - it is purely additive
--   * All 15 LcRegulatory* foreign keys are ON DELETE RESTRICT (no CASCADE)
--   * LcCalculationRun.regulatoryDatasetVersion -> LcRegulatoryDataset RESTRICT:
--     a dataset that produced a calculation can never be deleted
--   * The 3 ALTER TABLEs on populated tables (LcWorkbook, LocalContentProject,
--     LocalContentSupplier) are ADD COLUMN only, all nullable or defaulted
--
-- Promoted 2026-08-22 by the procedure in docs/regulatory/LCGPA_RUNBOOK.md §18:
-- the chain was repaired, the development database was baselined, and this
-- migration was then applied by `prisma migrate deploy` in the normal way.
-- Rehearsed first on a data-carrying clone: schema equality confirmed by
-- `prisma migrate diff`, zero rows lost.
-- AlterTable
ALTER TABLE "LcWorkbook" ADD COLUMN     "calculationMethod" TEXT DEFAULT 'iktva_v1',
ADD COLUMN     "lcgpaComputedAt" TIMESTAMP(3),
ADD COLUMN     "lcgpaOverallLcPct" DOUBLE PRECISION,
ADD COLUMN     "lcgpaPillars" JSONB,
ADD COLUMN     "ruleVersion" TEXT DEFAULT '2026-01';

-- AlterTable
ALTER TABLE "LocalContentProject" ADD COLUMN     "baselineDate" TIMESTAMP(3),
ADD COLUMN     "baselineLcPct" DOUBLE PRECISION,
ADD COLUMN     "calculationMethod" TEXT DEFAULT 'iktva_v1',
ADD COLUMN     "gradualPlanStatus" TEXT DEFAULT 'none',
ADD COLUMN     "listedCompanyStatus" TEXT DEFAULT 'not_listed',
ADD COLUMN     "ruleVersion" TEXT DEFAULT '2026-01',
ADD COLUMN     "targetDate" TIMESTAMP(3),
ADD COLUMN     "targetedLcPct" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "LocalContentSupplier" ADD COLUMN     "isSme" BOOLEAN DEFAULT false,
ADD COLUMN     "ownershipEvidenceUrl" TEXT,
ADD COLUMN     "saudiOwnershipPct" DOUBLE PRECISION,
ADD COLUMN     "smeEvidenceUrl" TEXT;

-- CreateTable
CREATE TABLE "LcCalculationRun" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "workbookId" TEXT,
    "method" TEXT NOT NULL,
    "ruleVersion" TEXT NOT NULL,
    "inputs" JSONB NOT NULL,
    "result" JSONB NOT NULL,
    "lcPillars" JSONB NOT NULL,
    "overallLcPct" DOUBLE PRECISION NOT NULL,
    "totalCosts" DOUBLE PRECISION NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "computedById" TEXT,
    "evidence" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "regulatoryDatasetVersion" TEXT,
    "regulatoryProductVersions" JSONB,
    "regulatoryArtifactSha256" TEXT,
    "regulatoryParserVersion" TEXT,
    "regulatorySchemaVersion" TEXT,
    "regulatoryAsOf" TIMESTAMP(3),
    "regulatoryResolution" JSONB,

    CONSTRAINT "LcCalculationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcMandatoryList" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "productCount" INTEGER NOT NULL,
    "sectorCount" INTEGER NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "importedById" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LcMandatoryList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcMandatoryListItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "productNameAr" TEXT NOT NULL,
    "productNameEn" TEXT,
    "sectorCode" TEXT NOT NULL,
    "sectorNameAr" TEXT NOT NULL,
    "sectorNameEn" TEXT,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LcMandatoryListItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcGradualPlan" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "baselineLcPct" DOUBLE PRECISION NOT NULL,
    "targetLcPct" DOUBLE PRECISION NOT NULL,
    "awardDate" TIMESTAMP(3) NOT NULL,
    "submissionDeadline" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcGradualPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcGradualPlanMilestone" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "targetLcPct" DOUBLE PRECISION NOT NULL,
    "actualLcPct" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "evidenceUrl" TEXT,
    "notes" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcGradualPlanMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcPenaltyAssessment" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "contractValue" DOUBLE PRECISION NOT NULL,
    "targetLcPct" DOUBLE PRECISION NOT NULL,
    "actualLcPct" DOUBLE PRECISION NOT NULL,
    "variance" DOUBLE PRECISION NOT NULL,
    "exceedsThreshold" BOOLEAN NOT NULL,
    "maxPenaltyPct" DOUBLE PRECISION NOT NULL,
    "maxPenaltyAmount" DOUBLE PRECISION NOT NULL,
    "assessmentBasis" TEXT,
    "status" TEXT NOT NULL DEFAULT 'calculated',
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assessedById" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcPenaltyAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcFinancialEvaluation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "tenderReference" TEXT,
    "supplierId" TEXT,
    "lowestBidPrice" DOUBLE PRECISION NOT NULL,
    "evaluatedBidPrice" DOUBLE PRECISION NOT NULL,
    "baselineLcPct" DOUBLE PRECISION NOT NULL,
    "targetedLcPct" DOUBLE PRECISION NOT NULL,
    "isListedCompany" BOOLEAN NOT NULL DEFAULT false,
    "listedCompanyBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priceScore" DOUBLE PRECISION NOT NULL,
    "lcScore" DOUBLE PRECISION NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'calculated',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "calculatedById" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcFinancialEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcRegulatorySource" (
    "id" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "authorityTier" INTEGER NOT NULL,
    "monitoringMethod" TEXT NOT NULL,
    "checkFrequency" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "lastCheckedAt" TIMESTAMP(3),
    "lastSuccessfulCheckAt" TIMESTAMP(3),
    "lastFailedAt" TIMESTAMP(3),
    "lastArtifactHash" TEXT,
    "lastKnownVersion" TEXT,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verificationEvidence" TEXT,
    "verifiedUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcRegulatorySource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcRegulatoryCheck" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL,
    "outcome" TEXT NOT NULL,
    "httpStatus" INTEGER,
    "observedSha256" TEXT,
    "previousSha256" TEXT,
    "metadata" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "nextCheckAt" TIMESTAMP(3),
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "correlationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LcRegulatoryCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcRegulatoryArtifact" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "directUrl" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL,
    "acquiredBy" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "version" TEXT,
    "status" TEXT NOT NULL,
    "blockedReason" TEXT,
    "integrity" JSONB NOT NULL,
    "rawStorageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LcRegulatoryArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcRegulatoryDataset" (
    "id" TEXT NOT NULL,
    "datasetVersion" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "artifactId" TEXT NOT NULL,
    "artifactSha256" TEXT NOT NULL,
    "documentVersionId" TEXT NOT NULL,
    "documentVersion" TEXT NOT NULL,
    "documentTitleAr" TEXT,
    "documentTitleEn" TEXT,
    "documentType" TEXT,
    "parserVersion" TEXT NOT NULL,
    "schemaVersion" TEXT NOT NULL,
    "ruleVersion" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "deactivatedAt" TIMESTAMP(3),
    "productCount" INTEGER NOT NULL DEFAULT 0,
    "provenance" JSONB NOT NULL,
    "fingerprint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcRegulatoryDataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcRegulatoryProduct" (
    "id" TEXT NOT NULL,
    "productVersionId" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "productCodeRaw" TEXT,
    "productNameAr" TEXT NOT NULL,
    "productNameEn" TEXT,
    "sectorCode" TEXT,
    "sectorNameAr" TEXT,
    "sectorNameEn" TEXT,
    "category" TEXT,
    "hsCode" TEXT,
    "descriptionAr" TEXT,
    "descriptionEn" TEXT,
    "minimumLcPct" DOUBLE PRECISION,
    "minimumLcSchedule" JSONB,
    "priceCeilingRaw" DOUBLE PRECISION,
    "manufacturerBaseline" TEXT,
    "requirements" JSONB,
    "applicability" TEXT,
    "regulatoryStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LcRegulatoryProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcRegulatoryChange" (
    "id" TEXT NOT NULL,
    "datasetBeforeId" TEXT,
    "datasetAfterId" TEXT NOT NULL,
    "diffId" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "changeType" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "effectiveFrom" TIMESTAMP(3),
    "sourceArtifactBefore" TEXT,
    "sourceArtifactAfter" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "severityRationale" TEXT NOT NULL,
    "isBaseline" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LcRegulatoryChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcRegulatoryCase" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "artifactSha256" TEXT NOT NULL,
    "datasetVersion" TEXT NOT NULL,
    "diffId" TEXT,
    "impactId" TEXT,
    "state" TEXT NOT NULL,
    "history" JSONB NOT NULL,
    "impact" JSONB,
    "approvedById" TEXT,
    "approvedByName" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvalAutomatic" BOOLEAN NOT NULL DEFAULT false,
    "approvalPolicyId" TEXT,
    "approvalNote" TEXT,
    "rejectedById" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "correlationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcRegulatoryCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcRegulatoryAlert" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "changeId" TEXT,
    "summary" TEXT NOT NULL,
    "evidence" JSONB NOT NULL,
    "effectiveDate" TIMESTAMP(3),
    "impactLevel" TEXT,
    "recommendedAction" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "acknowledgedById" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcRegulatoryAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcRegulatoryChangeEvent" (
    "id" TEXT NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "artifactFilename" TEXT NOT NULL,
    "artifactSha256" TEXT NOT NULL,
    "datasetVersion" TEXT NOT NULL,
    "changeIds" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3),
    "impactLevel" TEXT,
    "governanceState" TEXT NOT NULL,
    "activatedAt" TIMESTAMP(3),
    "correlationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcRegulatoryChangeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcRegulatoryConflict" (
    "id" TEXT NOT NULL,
    "sourceAId" TEXT NOT NULL,
    "sourceBId" TEXT NOT NULL,
    "artifactAHash" TEXT NOT NULL,
    "artifactBHash" TEXT NOT NULL,
    "productCode" TEXT NOT NULL,
    "conflictingFields" JSONB NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL,
    "resolution" TEXT NOT NULL DEFAULT 'PENDING_HUMAN_REVIEW',
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LcRegulatoryConflict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcRegulatoryImpactAssessment" (
    "id" TEXT NOT NULL,
    "diffId" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "impactLevel" TEXT NOT NULL,
    "affectedProducts" JSONB NOT NULL,
    "changeIds" JSONB NOT NULL,
    "affected" JSONB NOT NULL,
    "calculationCount" INTEGER NOT NULL DEFAULT 0,
    "projectCount" INTEGER NOT NULL DEFAULT 0,
    "tenderCount" INTEGER NOT NULL DEFAULT 0,
    "supplierCount" INTEGER NOT NULL DEFAULT 0,
    "contractCount" INTEGER NOT NULL DEFAULT 0,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "complianceCount" INTEGER NOT NULL DEFAULT 0,
    "requiresReview" BOOLEAN NOT NULL DEFAULT true,
    "rationale" TEXT NOT NULL,
    "unresolvableEntities" JSONB NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LcRegulatoryImpactAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcRegulatoryEffectiveDateEvidence" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "artifactSha256" TEXT,
    "datasetId" TEXT,
    "dateKind" TEXT NOT NULL,
    "regime" TEXT NOT NULL DEFAULT 'ALL',
    "scope" TEXT NOT NULL,
    "cohortLabel" TEXT,
    "productCodes" JSONB,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "confidence" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "note" TEXT,
    "recordedById" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "supersededById" TEXT,
    "supersededAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LcRegulatoryEffectiveDateEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LcCalculationRun_regulatoryDatasetVersion_idx" ON "LcCalculationRun"("regulatoryDatasetVersion");

-- CreateIndex
CREATE INDEX "LcCalculationRun_regulatoryArtifactSha256_idx" ON "LcCalculationRun"("regulatoryArtifactSha256");

-- CreateIndex
CREATE INDEX "LcCalculationRun_projectId_computedAt_idx" ON "LcCalculationRun"("projectId", "computedAt");

-- CreateIndex
CREATE INDEX "LcCalculationRun_projectId_method_idx" ON "LcCalculationRun"("projectId", "method");

-- CreateIndex
CREATE INDEX "LcCalculationRun_workbookId_idx" ON "LcCalculationRun"("workbookId");

-- CreateIndex
CREATE INDEX "LcCalculationRun_method_idx" ON "LcCalculationRun"("method");

-- CreateIndex
CREATE INDEX "LcCalculationRun_createdAt_idx" ON "LcCalculationRun"("createdAt");

-- CreateIndex
CREATE INDEX "LcMandatoryList_status_idx" ON "LcMandatoryList"("status");

-- CreateIndex
CREATE INDEX "LcMandatoryList_effectiveDate_idx" ON "LcMandatoryList"("effectiveDate");

-- CreateIndex
CREATE INDEX "LcMandatoryList_createdAt_idx" ON "LcMandatoryList"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LcMandatoryList_version_key" ON "LcMandatoryList"("version");

-- CreateIndex
CREATE INDEX "LcMandatoryListItem_listId_idx" ON "LcMandatoryListItem"("listId");

-- CreateIndex
CREATE INDEX "LcMandatoryListItem_productCode_idx" ON "LcMandatoryListItem"("productCode");

-- CreateIndex
CREATE INDEX "LcMandatoryListItem_sectorCode_idx" ON "LcMandatoryListItem"("sectorCode");

-- CreateIndex
CREATE INDEX "LcMandatoryListItem_productNameAr_idx" ON "LcMandatoryListItem"("productNameAr");

-- CreateIndex
CREATE UNIQUE INDEX "LcMandatoryListItem_listId_productCode_key" ON "LcMandatoryListItem"("listId", "productCode");

-- CreateIndex
CREATE INDEX "LcGradualPlan_projectId_idx" ON "LcGradualPlan"("projectId");

-- CreateIndex
CREATE INDEX "LcGradualPlan_projectId_status_idx" ON "LcGradualPlan"("projectId", "status");

-- CreateIndex
CREATE INDEX "LcGradualPlan_status_idx" ON "LcGradualPlan"("status");

-- CreateIndex
CREATE INDEX "LcGradualPlan_submissionDeadline_idx" ON "LcGradualPlan"("submissionDeadline");

-- CreateIndex
CREATE INDEX "LcGradualPlan_createdAt_idx" ON "LcGradualPlan"("createdAt");

-- CreateIndex
CREATE INDEX "LcGradualPlanMilestone_planId_idx" ON "LcGradualPlanMilestone"("planId");

-- CreateIndex
CREATE INDEX "LcGradualPlanMilestone_planId_status_idx" ON "LcGradualPlanMilestone"("planId", "status");

-- CreateIndex
CREATE INDEX "LcGradualPlanMilestone_targetDate_idx" ON "LcGradualPlanMilestone"("targetDate");

-- CreateIndex
CREATE INDEX "LcGradualPlanMilestone_createdAt_idx" ON "LcGradualPlanMilestone"("createdAt");

-- CreateIndex
CREATE INDEX "LcPenaltyAssessment_projectId_idx" ON "LcPenaltyAssessment"("projectId");

-- CreateIndex
CREATE INDEX "LcPenaltyAssessment_projectId_exceedsThreshold_idx" ON "LcPenaltyAssessment"("projectId", "exceedsThreshold");

-- CreateIndex
CREATE INDEX "LcPenaltyAssessment_status_idx" ON "LcPenaltyAssessment"("status");

-- CreateIndex
CREATE INDEX "LcPenaltyAssessment_createdAt_idx" ON "LcPenaltyAssessment"("createdAt");

-- CreateIndex
CREATE INDEX "LcFinancialEvaluation_projectId_idx" ON "LcFinancialEvaluation"("projectId");

-- CreateIndex
CREATE INDEX "LcFinancialEvaluation_projectId_tenderReference_idx" ON "LcFinancialEvaluation"("projectId", "tenderReference");

-- CreateIndex
CREATE INDEX "LcFinancialEvaluation_projectId_overallScore_idx" ON "LcFinancialEvaluation"("projectId", "overallScore");

-- CreateIndex
CREATE INDEX "LcFinancialEvaluation_supplierId_idx" ON "LcFinancialEvaluation"("supplierId");

-- CreateIndex
CREATE INDEX "LcFinancialEvaluation_rank_idx" ON "LcFinancialEvaluation"("rank");

-- CreateIndex
CREATE INDEX "LcFinancialEvaluation_createdAt_idx" ON "LcFinancialEvaluation"("createdAt");

-- CreateIndex
CREATE INDEX "LcRegulatorySource_authorityTier_enabled_idx" ON "LcRegulatorySource"("authorityTier", "enabled");

-- CreateIndex
CREATE INDEX "LcRegulatorySource_status_idx" ON "LcRegulatorySource"("status");

-- CreateIndex
CREATE INDEX "LcRegulatorySource_lastCheckedAt_idx" ON "LcRegulatorySource"("lastCheckedAt");

-- CreateIndex
CREATE INDEX "LcRegulatoryCheck_sourceId_checkedAt_idx" ON "LcRegulatoryCheck"("sourceId", "checkedAt");

-- CreateIndex
CREATE INDEX "LcRegulatoryCheck_outcome_idx" ON "LcRegulatoryCheck"("outcome");

-- CreateIndex
CREATE INDEX "LcRegulatoryCheck_correlationId_idx" ON "LcRegulatoryCheck"("correlationId");

-- CreateIndex
CREATE INDEX "LcRegulatoryArtifact_sourceId_acquiredAt_idx" ON "LcRegulatoryArtifact"("sourceId", "acquiredAt");

-- CreateIndex
CREATE INDEX "LcRegulatoryArtifact_sha256_idx" ON "LcRegulatoryArtifact"("sha256");

-- CreateIndex
CREATE INDEX "LcRegulatoryArtifact_status_idx" ON "LcRegulatoryArtifact"("status");

-- CreateIndex
CREATE UNIQUE INDEX "LcRegulatoryArtifact_sourceId_sha256_key" ON "LcRegulatoryArtifact"("sourceId", "sha256");

-- CreateIndex
CREATE UNIQUE INDEX "LcRegulatoryDataset_datasetVersion_key" ON "LcRegulatoryDataset"("datasetVersion");

-- CreateIndex
CREATE INDEX "LcRegulatoryDataset_sourceId_status_idx" ON "LcRegulatoryDataset"("sourceId", "status");

-- CreateIndex
CREATE INDEX "LcRegulatoryDataset_status_effectiveFrom_idx" ON "LcRegulatoryDataset"("status", "effectiveFrom");

-- CreateIndex
CREATE INDEX "LcRegulatoryDataset_artifactSha256_idx" ON "LcRegulatoryDataset"("artifactSha256");

-- CreateIndex
CREATE INDEX "LcRegulatoryDataset_ruleVersion_idx" ON "LcRegulatoryDataset"("ruleVersion");

-- CreateIndex
CREATE INDEX "LcRegulatoryProduct_productCode_idx" ON "LcRegulatoryProduct"("productCode");

-- CreateIndex
CREATE INDEX "LcRegulatoryProduct_productVersionId_idx" ON "LcRegulatoryProduct"("productVersionId");

-- CreateIndex
CREATE INDEX "LcRegulatoryProduct_productCode_effectiveFrom_idx" ON "LcRegulatoryProduct"("productCode", "effectiveFrom");

-- CreateIndex
CREATE INDEX "LcRegulatoryProduct_datasetId_sectorNameAr_idx" ON "LcRegulatoryProduct"("datasetId", "sectorNameAr");

-- CreateIndex
CREATE INDEX "LcRegulatoryProduct_effectiveFrom_idx" ON "LcRegulatoryProduct"("effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "LcRegulatoryProduct_datasetId_productCode_key" ON "LcRegulatoryProduct"("datasetId", "productCode");

-- CreateIndex
CREATE INDEX "LcRegulatoryChange_diffId_idx" ON "LcRegulatoryChange"("diffId");

-- CreateIndex
CREATE INDEX "LcRegulatoryChange_productCode_idx" ON "LcRegulatoryChange"("productCode");

-- CreateIndex
CREATE INDEX "LcRegulatoryChange_changeType_severity_idx" ON "LcRegulatoryChange"("changeType", "severity");

-- CreateIndex
CREATE INDEX "LcRegulatoryChange_effectiveFrom_idx" ON "LcRegulatoryChange"("effectiveFrom");

-- CreateIndex
CREATE INDEX "LcRegulatoryChange_datasetAfterId_idx" ON "LcRegulatoryChange"("datasetAfterId");

-- CreateIndex
CREATE INDEX "LcRegulatoryCase_sourceId_state_idx" ON "LcRegulatoryCase"("sourceId", "state");

-- CreateIndex
CREATE INDEX "LcRegulatoryCase_state_createdAt_idx" ON "LcRegulatoryCase"("state", "createdAt");

-- CreateIndex
CREATE INDEX "LcRegulatoryCase_datasetVersion_idx" ON "LcRegulatoryCase"("datasetVersion");

-- CreateIndex
CREATE INDEX "LcRegulatoryAlert_status_severity_idx" ON "LcRegulatoryAlert"("status", "severity");

-- CreateIndex
CREATE INDEX "LcRegulatoryAlert_sourceId_createdAt_idx" ON "LcRegulatoryAlert"("sourceId", "createdAt");

-- CreateIndex
CREATE INDEX "LcRegulatoryAlert_category_idx" ON "LcRegulatoryAlert"("category");

-- CreateIndex
CREATE INDEX "LcRegulatoryChangeEvent_sourceId_detectedAt_idx" ON "LcRegulatoryChangeEvent"("sourceId", "detectedAt");

-- CreateIndex
CREATE INDEX "LcRegulatoryChangeEvent_effectiveFrom_idx" ON "LcRegulatoryChangeEvent"("effectiveFrom");

-- CreateIndex
CREATE INDEX "LcRegulatoryChangeEvent_impactLevel_idx" ON "LcRegulatoryChangeEvent"("impactLevel");

-- CreateIndex
CREATE UNIQUE INDEX "LcRegulatoryChangeEvent_artifactSha256_datasetVersion_key" ON "LcRegulatoryChangeEvent"("artifactSha256", "datasetVersion");

-- CreateIndex
CREATE INDEX "LcRegulatoryConflict_productCode_idx" ON "LcRegulatoryConflict"("productCode");

-- CreateIndex
CREATE INDEX "LcRegulatoryConflict_resolution_idx" ON "LcRegulatoryConflict"("resolution");

-- CreateIndex
CREATE INDEX "LcRegulatoryConflict_detectedAt_idx" ON "LcRegulatoryConflict"("detectedAt");

-- CreateIndex
CREATE INDEX "LcRegulatoryImpactAssessment_diffId_idx" ON "LcRegulatoryImpactAssessment"("diffId");

-- CreateIndex
CREATE INDEX "LcRegulatoryImpactAssessment_impactLevel_idx" ON "LcRegulatoryImpactAssessment"("impactLevel");

-- CreateIndex
CREATE INDEX "LcRegulatoryImpactAssessment_datasetId_idx" ON "LcRegulatoryImpactAssessment"("datasetId");

-- CreateIndex
CREATE INDEX "LcRegulatoryImpactAssessment_computedAt_idx" ON "LcRegulatoryImpactAssessment"("computedAt");

-- CreateIndex
CREATE INDEX "LcRegulatoryEffectiveDateEvidence_sourceId_effectiveFrom_idx" ON "LcRegulatoryEffectiveDateEvidence"("sourceId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "LcRegulatoryEffectiveDateEvidence_dateKind_regime_effective_idx" ON "LcRegulatoryEffectiveDateEvidence"("dateKind", "regime", "effectiveFrom");

-- CreateIndex
CREATE INDEX "LcRegulatoryEffectiveDateEvidence_scope_confidence_idx" ON "LcRegulatoryEffectiveDateEvidence"("scope", "confidence");

-- CreateIndex
CREATE INDEX "LcRegulatoryEffectiveDateEvidence_datasetId_idx" ON "LcRegulatoryEffectiveDateEvidence"("datasetId");

-- CreateIndex
CREATE INDEX "LcRegulatoryEffectiveDateEvidence_effectiveFrom_idx" ON "LcRegulatoryEffectiveDateEvidence"("effectiveFrom");

-- AddForeignKey
ALTER TABLE "LcCalculationRun" ADD CONSTRAINT "LcCalculationRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LocalContentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcCalculationRun" ADD CONSTRAINT "LcCalculationRun_regulatoryDatasetVersion_fkey" FOREIGN KEY ("regulatoryDatasetVersion") REFERENCES "LcRegulatoryDataset"("datasetVersion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcMandatoryListItem" ADD CONSTRAINT "LcMandatoryListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "LcMandatoryList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcGradualPlan" ADD CONSTRAINT "LcGradualPlan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LocalContentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcGradualPlanMilestone" ADD CONSTRAINT "LcGradualPlanMilestone_planId_fkey" FOREIGN KEY ("planId") REFERENCES "LcGradualPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcPenaltyAssessment" ADD CONSTRAINT "LcPenaltyAssessment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LocalContentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcFinancialEvaluation" ADD CONSTRAINT "LcFinancialEvaluation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LocalContentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcRegulatoryCheck" ADD CONSTRAINT "LcRegulatoryCheck_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "LcRegulatorySource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcRegulatoryArtifact" ADD CONSTRAINT "LcRegulatoryArtifact_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "LcRegulatorySource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcRegulatoryDataset" ADD CONSTRAINT "LcRegulatoryDataset_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "LcRegulatorySource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcRegulatoryDataset" ADD CONSTRAINT "LcRegulatoryDataset_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "LcRegulatoryArtifact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcRegulatoryProduct" ADD CONSTRAINT "LcRegulatoryProduct_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "LcRegulatoryDataset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcRegulatoryChange" ADD CONSTRAINT "LcRegulatoryChange_datasetBeforeId_fkey" FOREIGN KEY ("datasetBeforeId") REFERENCES "LcRegulatoryDataset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcRegulatoryChange" ADD CONSTRAINT "LcRegulatoryChange_datasetAfterId_fkey" FOREIGN KEY ("datasetAfterId") REFERENCES "LcRegulatoryDataset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcRegulatoryCase" ADD CONSTRAINT "LcRegulatoryCase_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "LcRegulatorySource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcRegulatoryAlert" ADD CONSTRAINT "LcRegulatoryAlert_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "LcRegulatorySource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcRegulatoryChangeEvent" ADD CONSTRAINT "LcRegulatoryChangeEvent_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "LcRegulatorySource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcRegulatoryConflict" ADD CONSTRAINT "LcRegulatoryConflict_sourceAId_fkey" FOREIGN KEY ("sourceAId") REFERENCES "LcRegulatorySource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcRegulatoryConflict" ADD CONSTRAINT "LcRegulatoryConflict_sourceBId_fkey" FOREIGN KEY ("sourceBId") REFERENCES "LcRegulatorySource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcRegulatoryImpactAssessment" ADD CONSTRAINT "LcRegulatoryImpactAssessment_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "LcRegulatoryDataset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcRegulatoryEffectiveDateEvidence" ADD CONSTRAINT "LcRegulatoryEffectiveDateEvidence_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "LcRegulatorySource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcRegulatoryEffectiveDateEvidence" ADD CONSTRAINT "LcRegulatoryEffectiveDateEvidence_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "LcRegulatoryDataset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

