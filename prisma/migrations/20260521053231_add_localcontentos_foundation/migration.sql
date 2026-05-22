/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `AuditOrganization` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "OutcomeStatus" AS ENUM ('SUCCESS', 'PARTIAL_SUCCESS', 'FAILURE', 'UNKNOWN');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'SUBMITTED_FOR_REVIEW';
ALTER TYPE "AuditAction" ADD VALUE 'DECISION_APPROVED';
ALTER TYPE "AuditAction" ADD VALUE 'DECISION_APPROVED_WITH_CONDITIONS';
ALTER TYPE "AuditAction" ADD VALUE 'DECISION_REJECTED';
ALTER TYPE "AuditAction" ADD VALUE 'REVISION_REQUESTED';
ALTER TYPE "AuditAction" ADD VALUE 'SNAPSHOT_PUBLISHED';
ALTER TYPE "AuditAction" ADD VALUE 'CURRENT_PUBLISHED_WITHOUT_APPROVAL';
ALTER TYPE "AuditAction" ADD VALUE 'STALE_PUBLISH_BLOCKED';
ALTER TYPE "AuditAction" ADD VALUE 'STALE_PUBLISH_OVERRIDE';
ALTER TYPE "AuditAction" ADD VALUE 'OUTCOME_CREATED';
ALTER TYPE "AuditAction" ADD VALUE 'OUTCOME_UPDATED';
ALTER TYPE "AuditAction" ADD VALUE 'OUTCOME_REVIEWED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DecisionType" ADD VALUE 'INVESTMENT';
ALTER TYPE "DecisionType" ADD VALUE 'EXPANSION';
ALTER TYPE "DecisionType" ADD VALUE 'PROCUREMENT';
ALTER TYPE "DecisionType" ADD VALUE 'HIRING';
ALTER TYPE "DecisionType" ADD VALUE 'PARTNERSHIP';
ALTER TYPE "DecisionType" ADD VALUE 'PRICING';
ALTER TYPE "DecisionType" ADD VALUE 'STRATEGIC';
ALTER TYPE "DecisionType" ADD VALUE 'OPERATIONS';
ALTER TYPE "DecisionType" ADD VALUE 'CUSTOM';

-- AlterTable
ALTER TABLE "Approval" ADD COLUMN     "recommendationId" TEXT,
ADD COLUMN     "snapshotAction" TEXT,
ADD COLUMN     "snapshotAssumptionsUsed" TEXT,
ADD COLUMN     "snapshotConditions" TEXT,
ADD COLUMN     "snapshotConfidence" DOUBLE PRECISION,
ADD COLUMN     "snapshotCreatedAt" TIMESTAMP(3),
ADD COLUMN     "snapshotExpectedNextState" TEXT,
ADD COLUMN     "snapshotNextActions" JSONB,
ADD COLUMN     "snapshotOverrideReason" TEXT,
ADD COLUMN     "snapshotRationale" TEXT,
ADD COLUMN     "snapshotRisks" JSONB,
ADD COLUMN     "snapshotRisksAccepted" TEXT,
ADD COLUMN     "snapshotRisksRejected" TEXT,
ADD COLUMN     "snapshotScopeExclusions" TEXT,
ADD COLUMN     "snapshotScore" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "AuditClient" ADD COLUMN     "clientWorkspaceId" TEXT;

-- AlterTable
ALTER TABLE "AuditEngagement" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "AuditOrganization" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Decision" ADD COLUMN     "description" TEXT,
ADD COLUMN     "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "targetDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Recommendation" ADD COLUMN     "publishedApprovalId" TEXT,
ADD COLUMN     "publishedFromSnapshot" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ClientWorkspace" (
    "id" TEXT NOT NULL,
    "platformOrganizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "workspaceType" TEXT NOT NULL DEFAULT 'client',
    "status" TEXT NOT NULL DEFAULT 'active',
    "productAccess" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "team" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformAuditLog" (
    "id" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "clientWorkspaceId" TEXT,
    "projectId" TEXT,
    "productKey" TEXT NOT NULL,
    "environment" TEXT,
    "actorId" TEXT,
    "actorType" TEXT,
    "actorEmail" TEXT,
    "actorName" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "targetLabel" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'info',
    "status" TEXT NOT NULL DEFAULT 'recorded',
    "sourceSystem" TEXT,
    "sourceModel" TEXT,
    "sourceId" TEXT,
    "requestId" TEXT,
    "sessionId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "aiProvider" TEXT,
    "aiModel" TEXT,
    "aiPromptVersion" TEXT,
    "aiOutputReviewStatus" TEXT,
    "evidenceRefs" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeAiTask" (
    "id" TEXT NOT NULL,
    "platformOrganizationId" TEXT NOT NULL,
    "clientWorkspaceId" TEXT,
    "projectId" TEXT,
    "taskType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "language" TEXT NOT NULL DEFAULT 'ar',
    "title" TEXT,
    "instructions" TEXT,
    "createdById" TEXT,
    "createdByName" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficeAiTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeAiOutput" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'markdown',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "aiProvider" TEXT NOT NULL DEFAULT 'deterministic',
    "aiModel" TEXT,
    "aiPromptVersion" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficeAiOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficeAiFile" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "mimeType" TEXT,
    "storageKey" TEXT,
    "fileHash" TEXT,
    "sizeBytes" INTEGER,
    "uploadedById" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "extractedContent" TEXT,
    "extractionMeta" JSONB,
    "extractedAt" TIMESTAMP(3),
    "extractionStatus" TEXT,

    CONSTRAINT "OfficeAiFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionOutcome" (
    "id" TEXT NOT NULL,
    "decisionId" TEXT NOT NULL,
    "expectedOutcome" TEXT NOT NULL,
    "actualOutcome" TEXT,
    "outcomeStatus" "OutcomeStatus" NOT NULL DEFAULT 'UNKNOWN',
    "actualValue" DOUBLE PRECISION,
    "expectedValue" DOUBLE PRECISION,
    "variance" DOUBLE PRECISION,
    "lessonsLearned" TEXT,
    "followUpActions" JSONB,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DecisionOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditValidationRun" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "validationType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "trustState" TEXT NOT NULL DEFAULT 'conditional',
    "summary" TEXT,
    "issueCount" INTEGER NOT NULL DEFAULT 0,
    "criticalCount" INTEGER NOT NULL DEFAULT 0,
    "highCount" INTEGER NOT NULL DEFAULT 0,
    "mediumCount" INTEGER NOT NULL DEFAULT 0,
    "lowCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AuditValidationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditValidationIssue" (
    "id" TEXT NOT NULL,
    "validationRunId" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "checkType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "accountCode" TEXT,
    "accountName" TEXT,
    "expectedValue" DOUBLE PRECISION,
    "actualValue" DOUBLE PRECISION,
    "difference" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditValidationIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditValidationDisposition" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "rationale" TEXT,
    "disposedBy" TEXT NOT NULL,
    "disposedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditValidationDisposition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalContentProject" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "clientWorkspaceId" TEXT,
    "projectId" TEXT,
    "name" TEXT NOT NULL,
    "reportingPeriod" TEXT NOT NULL,
    "scopeDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "localContentScore" DOUBLE PRECISION,
    "createdById" TEXT,
    "createdByName" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalContentProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalContentSupplier" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "crNumber" TEXT,
    "localityClassification" TEXT,
    "localContentPercentage" DOUBLE PRECISION,
    "ownershipType" TEXT,
    "workforceLocalPct" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalContentSupplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalContentSpendRecord" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "category" TEXT NOT NULL,
    "contractReference" TEXT,
    "period" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalContentSpendRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalContentClassification" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "supplierId" TEXT,
    "spendRecordId" TEXT,
    "classifiedBy" TEXT,
    "localPercentage" DOUBLE PRECISION NOT NULL,
    "classificationBasis" TEXT NOT NULL,
    "confidence" TEXT NOT NULL DEFAULT 'unverified',
    "notes" TEXT,
    "reviewStatus" TEXT NOT NULL DEFAULT 'draft',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalContentClassification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalContentEvidence" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "supplierId" TEXT,
    "spendRecordId" TEXT,
    "findingId" TEXT,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "mimeType" TEXT,
    "storageKey" TEXT,
    "fileHash" TEXT,
    "sizeBytes" INTEGER,
    "evidenceType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalContentEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalContentFinding" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "linkedSupplierId" TEXT,
    "linkedSpendRecordId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdById" TEXT,
    "createdByName" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalContentFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalContentReview" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "comments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalContentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalContentApproval" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "approverName" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "comments" TEXT,
    "approvalSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalContentApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalContentReport" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'generated',
    "generatedById" TEXT,
    "generatedByName" TEXT,
    "storageKey" TEXT,
    "disclaimer" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalContentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalContentAuditEvent" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" TEXT,
    "after" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocalContentAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientWorkspace_platformOrganizationId_status_idx" ON "ClientWorkspace"("platformOrganizationId", "status");

-- CreateIndex
CREATE INDEX "ClientWorkspace_workspaceType_idx" ON "ClientWorkspace"("workspaceType");

-- CreateIndex
CREATE INDEX "ClientWorkspace_status_idx" ON "ClientWorkspace"("status");

-- CreateIndex
CREATE INDEX "ClientWorkspace_deletedAt_idx" ON "ClientWorkspace"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientWorkspace_platformOrganizationId_slug_key" ON "ClientWorkspace"("platformOrganizationId", "slug");

-- CreateIndex
CREATE INDEX "Project_workspaceId_status_idx" ON "Project"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Project_projectType_idx" ON "Project"("projectType");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_platformOrganizationId_createdAt_idx" ON "PlatformAuditLog"("platformOrganizationId", "createdAt");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_clientWorkspaceId_createdAt_idx" ON "PlatformAuditLog"("clientWorkspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_projectId_createdAt_idx" ON "PlatformAuditLog"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_productKey_createdAt_idx" ON "PlatformAuditLog"("productKey", "createdAt");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_actorId_createdAt_idx" ON "PlatformAuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_action_createdAt_idx" ON "PlatformAuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_targetType_targetId_idx" ON "PlatformAuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_sourceSystem_sourceId_idx" ON "PlatformAuditLog"("sourceSystem", "sourceId");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_createdAt_idx" ON "PlatformAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "OfficeAiTask_platformOrganizationId_createdAt_idx" ON "OfficeAiTask"("platformOrganizationId", "createdAt");

-- CreateIndex
CREATE INDEX "OfficeAiTask_clientWorkspaceId_createdAt_idx" ON "OfficeAiTask"("clientWorkspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "OfficeAiTask_projectId_createdAt_idx" ON "OfficeAiTask"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "OfficeAiTask_taskType_createdAt_idx" ON "OfficeAiTask"("taskType", "createdAt");

-- CreateIndex
CREATE INDEX "OfficeAiTask_status_createdAt_idx" ON "OfficeAiTask"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OfficeAiTask_createdById_createdAt_idx" ON "OfficeAiTask"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "OfficeAiOutput_taskId_createdAt_idx" ON "OfficeAiOutput"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "OfficeAiOutput_status_createdAt_idx" ON "OfficeAiOutput"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OfficeAiFile_taskId_createdAt_idx" ON "OfficeAiFile"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "OfficeAiFile_fileHash_idx" ON "OfficeAiFile"("fileHash");

-- CreateIndex
CREATE UNIQUE INDEX "DecisionOutcome_decisionId_key" ON "DecisionOutcome"("decisionId");

-- CreateIndex
CREATE INDEX "DecisionOutcome_outcomeStatus_idx" ON "DecisionOutcome"("outcomeStatus");

-- CreateIndex
CREATE INDEX "AuditValidationRun_engagementId_idx" ON "AuditValidationRun"("engagementId");

-- CreateIndex
CREATE INDEX "AuditValidationRun_status_idx" ON "AuditValidationRun"("status");

-- CreateIndex
CREATE INDEX "AuditValidationRun_createdAt_idx" ON "AuditValidationRun"("createdAt");

-- CreateIndex
CREATE INDEX "AuditValidationIssue_validationRunId_idx" ON "AuditValidationIssue"("validationRunId");

-- CreateIndex
CREATE INDEX "AuditValidationIssue_engagementId_idx" ON "AuditValidationIssue"("engagementId");

-- CreateIndex
CREATE INDEX "AuditValidationIssue_severity_idx" ON "AuditValidationIssue"("severity");

-- CreateIndex
CREATE INDEX "AuditValidationIssue_status_idx" ON "AuditValidationIssue"("status");

-- CreateIndex
CREATE INDEX "AuditValidationDisposition_issueId_idx" ON "AuditValidationDisposition"("issueId");

-- CreateIndex
CREATE INDEX "AuditValidationDisposition_engagementId_idx" ON "AuditValidationDisposition"("engagementId");

-- CreateIndex
CREATE INDEX "LocalContentProject_organizationId_createdAt_idx" ON "LocalContentProject"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentProject_platformOrganizationId_createdAt_idx" ON "LocalContentProject"("platformOrganizationId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentProject_clientWorkspaceId_createdAt_idx" ON "LocalContentProject"("clientWorkspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentProject_projectId_createdAt_idx" ON "LocalContentProject"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentProject_status_idx" ON "LocalContentProject"("status");

-- CreateIndex
CREATE INDEX "LocalContentProject_createdAt_idx" ON "LocalContentProject"("createdAt");

-- CreateIndex
CREATE INDEX "LocalContentSupplier_projectId_status_idx" ON "LocalContentSupplier"("projectId", "status");

-- CreateIndex
CREATE INDEX "LocalContentSupplier_status_idx" ON "LocalContentSupplier"("status");

-- CreateIndex
CREATE INDEX "LocalContentSupplier_createdAt_idx" ON "LocalContentSupplier"("createdAt");

-- CreateIndex
CREATE INDEX "LocalContentSpendRecord_projectId_createdAt_idx" ON "LocalContentSpendRecord"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentSpendRecord_supplierId_createdAt_idx" ON "LocalContentSpendRecord"("supplierId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentSpendRecord_category_idx" ON "LocalContentSpendRecord"("category");

-- CreateIndex
CREATE INDEX "LocalContentSpendRecord_createdAt_idx" ON "LocalContentSpendRecord"("createdAt");

-- CreateIndex
CREATE INDEX "LocalContentClassification_projectId_createdAt_idx" ON "LocalContentClassification"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentClassification_supplierId_createdAt_idx" ON "LocalContentClassification"("supplierId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentClassification_spendRecordId_createdAt_idx" ON "LocalContentClassification"("spendRecordId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentClassification_reviewStatus_idx" ON "LocalContentClassification"("reviewStatus");

-- CreateIndex
CREATE INDEX "LocalContentClassification_createdAt_idx" ON "LocalContentClassification"("createdAt");

-- CreateIndex
CREATE INDEX "LocalContentEvidence_projectId_status_createdAt_idx" ON "LocalContentEvidence"("projectId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentEvidence_supplierId_createdAt_idx" ON "LocalContentEvidence"("supplierId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentEvidence_spendRecordId_createdAt_idx" ON "LocalContentEvidence"("spendRecordId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentEvidence_findingId_createdAt_idx" ON "LocalContentEvidence"("findingId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentEvidence_fileHash_idx" ON "LocalContentEvidence"("fileHash");

-- CreateIndex
CREATE INDEX "LocalContentEvidence_createdAt_idx" ON "LocalContentEvidence"("createdAt");

-- CreateIndex
CREATE INDEX "LocalContentFinding_projectId_severity_status_idx" ON "LocalContentFinding"("projectId", "severity", "status");

-- CreateIndex
CREATE INDEX "LocalContentFinding_type_createdAt_idx" ON "LocalContentFinding"("type", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentFinding_status_idx" ON "LocalContentFinding"("status");

-- CreateIndex
CREATE INDEX "LocalContentFinding_createdAt_idx" ON "LocalContentFinding"("createdAt");

-- CreateIndex
CREATE INDEX "LocalContentReview_projectId_createdAt_idx" ON "LocalContentReview"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentReview_reviewerId_createdAt_idx" ON "LocalContentReview"("reviewerId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentReview_status_idx" ON "LocalContentReview"("status");

-- CreateIndex
CREATE INDEX "LocalContentReview_createdAt_idx" ON "LocalContentReview"("createdAt");

-- CreateIndex
CREATE INDEX "LocalContentApproval_projectId_createdAt_idx" ON "LocalContentApproval"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentApproval_approverId_createdAt_idx" ON "LocalContentApproval"("approverId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentApproval_decision_idx" ON "LocalContentApproval"("decision");

-- CreateIndex
CREATE INDEX "LocalContentApproval_createdAt_idx" ON "LocalContentApproval"("createdAt");

-- CreateIndex
CREATE INDEX "LocalContentReport_projectId_createdAt_idx" ON "LocalContentReport"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentReport_reportType_createdAt_idx" ON "LocalContentReport"("reportType", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentReport_status_idx" ON "LocalContentReport"("status");

-- CreateIndex
CREATE INDEX "LocalContentReport_createdAt_idx" ON "LocalContentReport"("createdAt");

-- CreateIndex
CREATE INDEX "LocalContentAuditEvent_projectId_createdAt_idx" ON "LocalContentAuditEvent"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentAuditEvent_actorId_createdAt_idx" ON "LocalContentAuditEvent"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "LocalContentAuditEvent_action_idx" ON "LocalContentAuditEvent"("action");

-- CreateIndex
CREATE INDEX "LocalContentAuditEvent_entityType_entityId_idx" ON "LocalContentAuditEvent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "LocalContentAuditEvent_createdAt_idx" ON "LocalContentAuditEvent"("createdAt");

-- CreateIndex
CREATE INDEX "Alternative_decisionId_idx" ON "Alternative"("decisionId");

-- CreateIndex
CREATE INDEX "Approval_decisionId_idx" ON "Approval"("decisionId");

-- CreateIndex
CREATE INDEX "Approval_approverId_idx" ON "Approval"("approverId");

-- CreateIndex
CREATE INDEX "Approval_status_idx" ON "Approval"("status");

-- CreateIndex
CREATE INDEX "Assumption_decisionId_idx" ON "Assumption"("decisionId");

-- CreateIndex
CREATE INDEX "AuditAccountMapping_engagementId_idx" ON "AuditAccountMapping"("engagementId");

-- CreateIndex
CREATE INDEX "AuditAccountMapping_status_idx" ON "AuditAccountMapping"("status");

-- CreateIndex
CREATE INDEX "AuditApprovalRecord_engagementId_idx" ON "AuditApprovalRecord"("engagementId");

-- CreateIndex
CREATE INDEX "AuditCanonicalAccount_reportingFramework_idx" ON "AuditCanonicalAccount"("reportingFramework");

-- CreateIndex
CREATE INDEX "AuditClient_clientWorkspaceId_idx" ON "AuditClient"("clientWorkspaceId");

-- CreateIndex
CREATE INDEX "AuditDisclosureNote_engagementId_idx" ON "AuditDisclosureNote"("engagementId");

-- CreateIndex
CREATE INDEX "AuditEngagement_organizationId_idx" ON "AuditEngagement"("organizationId");

-- CreateIndex
CREATE INDEX "AuditEngagement_clientId_idx" ON "AuditEngagement"("clientId");

-- CreateIndex
CREATE INDEX "AuditEngagement_status_idx" ON "AuditEngagement"("status");

-- CreateIndex
CREATE INDEX "AuditEngagement_createdAt_idx" ON "AuditEngagement"("createdAt");

-- CreateIndex
CREATE INDEX "AuditEngagement_projectId_idx" ON "AuditEngagement"("projectId");

-- CreateIndex
CREATE INDEX "AuditEvidence_engagementId_idx" ON "AuditEvidence"("engagementId");

-- CreateIndex
CREATE INDEX "AuditEvidenceLink_evidenceId_idx" ON "AuditEvidenceLink"("evidenceId");

-- CreateIndex
CREATE INDEX "AuditFinancialStatement_engagementId_idx" ON "AuditFinancialStatement"("engagementId");

-- CreateIndex
CREATE INDEX "AuditFinding_engagementId_idx" ON "AuditFinding"("engagementId");

-- CreateIndex
CREATE INDEX "AuditFinding_severity_idx" ON "AuditFinding"("severity");

-- CreateIndex
CREATE INDEX "AuditFinding_status_idx" ON "AuditFinding"("status");

-- CreateIndex
CREATE INDEX "AuditOrganization_status_idx" ON "AuditOrganization"("status");

-- CreateIndex
CREATE INDEX "AuditOrganization_createdAt_idx" ON "AuditOrganization"("createdAt");

-- CreateIndex
CREATE INDEX "AuditPublicationPackage_engagementId_idx" ON "AuditPublicationPackage"("engagementId");

-- CreateIndex
CREATE INDEX "AuditRecommendation_engagementId_idx" ON "AuditRecommendation"("engagementId");

-- CreateIndex
CREATE INDEX "AuditRecommendation_status_idx" ON "AuditRecommendation"("status");

-- CreateIndex
CREATE INDEX "AuditReviewComment_engagementId_idx" ON "AuditReviewComment"("engagementId");

-- CreateIndex
CREATE INDEX "AuditTrialBalance_engagementId_idx" ON "AuditTrialBalance"("engagementId");

-- CreateIndex
CREATE INDEX "AuditTrialBalanceLine_trialBalanceId_idx" ON "AuditTrialBalanceLine"("trialBalanceId");

-- CreateIndex
CREATE INDEX "Constraint_decisionId_idx" ON "Constraint"("decisionId");

-- CreateIndex
CREATE INDEX "Decision_organizationId_idx" ON "Decision"("organizationId");

-- CreateIndex
CREATE INDEX "Decision_status_idx" ON "Decision"("status");

-- CreateIndex
CREATE INDEX "Decision_ownerId_idx" ON "Decision"("ownerId");

-- CreateIndex
CREATE INDEX "Decision_createdAt_idx" ON "Decision"("createdAt");

-- CreateIndex
CREATE INDEX "Decision_type_idx" ON "Decision"("type");

-- CreateIndex
CREATE INDEX "DecisionRiskAnalysis_decisionId_idx" ON "DecisionRiskAnalysis"("decisionId");

-- CreateIndex
CREATE INDEX "DecisionScenario_decisionId_idx" ON "DecisionScenario"("decisionId");

-- CreateIndex
CREATE INDEX "Objective_decisionId_idx" ON "Objective"("decisionId");

-- CreateIndex
CREATE INDEX "Organization_createdAt_idx" ON "Organization"("createdAt");

-- CreateIndex
CREATE INDEX "PilotFeedback_engagementId_idx" ON "PilotFeedback"("engagementId");

-- CreateIndex
CREATE INDEX "PilotSignoff_engagementId_idx" ON "PilotSignoff"("engagementId");

-- CreateIndex
CREATE INDEX "ProductionBlocker_engagementId_idx" ON "ProductionBlocker"("engagementId");

-- CreateIndex
CREATE INDEX "Recommendation_publishedAt_idx" ON "Recommendation"("publishedAt");

-- CreateIndex
CREATE INDEX "Risk_decisionId_idx" ON "Risk"("decisionId");

-- CreateIndex
CREATE INDEX "Scenario_decisionId_idx" ON "Scenario"("decisionId");

-- CreateIndex
CREATE INDEX "Sector_isActive_idx" ON "Sector"("isActive");

-- CreateIndex
CREATE INDEX "SectorBenchmark_sectorId_idx" ON "SectorBenchmark"("sectorId");

-- CreateIndex
CREATE INDEX "SectorPattern_sectorId_idx" ON "SectorPattern"("sectorId");

-- CreateIndex
CREATE INDEX "SectorPlaybook_sectorId_idx" ON "SectorPlaybook"("sectorId");

-- CreateIndex
CREATE INDEX "SectorRule_sectorId_idx" ON "SectorRule"("sectorId");

-- CreateIndex
CREATE INDEX "SimulationResult_decisionId_idx" ON "SimulationResult"("decisionId");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "ClientWorkspace" ADD CONSTRAINT "ClientWorkspace_platformOrganizationId_fkey" FOREIGN KEY ("platformOrganizationId") REFERENCES "PlatformOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeAiOutput" ADD CONSTRAINT "OfficeAiOutput_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "OfficeAiTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeAiFile" ADD CONSTRAINT "OfficeAiFile_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "OfficeAiTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionOutcome" ADD CONSTRAINT "DecisionOutcome_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionOutcome" ADD CONSTRAINT "DecisionOutcome_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditClient" ADD CONSTRAINT "AuditClient_clientWorkspaceId_fkey" FOREIGN KEY ("clientWorkspaceId") REFERENCES "ClientWorkspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEngagement" ADD CONSTRAINT "AuditEngagement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditValidationRun" ADD CONSTRAINT "AuditValidationRun_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditValidationIssue" ADD CONSTRAINT "AuditValidationIssue_validationRunId_fkey" FOREIGN KEY ("validationRunId") REFERENCES "AuditValidationRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditValidationIssue" ADD CONSTRAINT "AuditValidationIssue_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditValidationDisposition" ADD CONSTRAINT "AuditValidationDisposition_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "AuditValidationIssue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditValidationDisposition" ADD CONSTRAINT "AuditValidationDisposition_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalContentSupplier" ADD CONSTRAINT "LocalContentSupplier_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LocalContentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalContentSpendRecord" ADD CONSTRAINT "LocalContentSpendRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LocalContentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalContentSpendRecord" ADD CONSTRAINT "LocalContentSpendRecord_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "LocalContentSupplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalContentClassification" ADD CONSTRAINT "LocalContentClassification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LocalContentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalContentClassification" ADD CONSTRAINT "LocalContentClassification_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "LocalContentSupplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalContentClassification" ADD CONSTRAINT "LocalContentClassification_spendRecordId_fkey" FOREIGN KEY ("spendRecordId") REFERENCES "LocalContentSpendRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalContentEvidence" ADD CONSTRAINT "LocalContentEvidence_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LocalContentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalContentEvidence" ADD CONSTRAINT "LocalContentEvidence_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "LocalContentSupplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalContentEvidence" ADD CONSTRAINT "LocalContentEvidence_spendRecordId_fkey" FOREIGN KEY ("spendRecordId") REFERENCES "LocalContentSpendRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalContentEvidence" ADD CONSTRAINT "LocalContentEvidence_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "LocalContentFinding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalContentFinding" ADD CONSTRAINT "LocalContentFinding_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LocalContentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalContentReview" ADD CONSTRAINT "LocalContentReview_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LocalContentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalContentApproval" ADD CONSTRAINT "LocalContentApproval_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LocalContentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalContentReport" ADD CONSTRAINT "LocalContentReport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LocalContentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalContentAuditEvent" ADD CONSTRAINT "LocalContentAuditEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LocalContentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
