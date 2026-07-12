-- CreateEnum
CREATE TYPE "EngagementType" AS ENUM ('full_audit', 'review', 'compilation', 'other');

-- CreateEnum
CREATE TYPE "ClassificationConfidence" AS ENUM ('high', 'medium', 'low', 'unverified');

-- CreateEnum
CREATE TYPE "ClassificationReviewStatus" AS ENUM ('draft', 'reviewed', 'confirmed', 'disputed');

-- CreateEnum
CREATE TYPE "ClassificationBasis" AS ENUM ('certificate', 'self_declaration', 'contract_term', 'analyst_estimate');

-- CreateEnum
CREATE TYPE "HealthRecordSource" AS ENUM ('pattern_mining', 'manual', 'import');

-- CreateEnum
CREATE TYPE "WorkbookLineSource" AS ENUM ('tb', 'manual', 'formula');

-- CreateEnum
CREATE TYPE "WorkbookLineConfidence" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "FindingSource" AS ENUM ('ai', 'manual');

-- CreateEnum
CREATE TYPE "KnowledgeFoundationVersionStatus" AS ENUM ('DRAFT', 'APPROVED', 'RELEASED', 'ACTIVE', 'DEPRECATED');

-- DropForeignKey
ALTER TABLE "Alternative" DROP CONSTRAINT "Alternative_decisionId_fkey";

-- DropForeignKey
ALTER TABLE "Assumption" DROP CONSTRAINT "Assumption_decisionId_fkey";

-- DropForeignKey
ALTER TABLE "AuditAccountMapping" DROP CONSTRAINT "AuditAccountMapping_engagementId_fkey";

-- DropForeignKey
ALTER TABLE "AuditAiOutput" DROP CONSTRAINT "AuditAiOutput_engagementId_fkey";

-- DropForeignKey
ALTER TABLE "AuditApprovalRecord" DROP CONSTRAINT "AuditApprovalRecord_engagementId_fkey";

-- DropForeignKey
ALTER TABLE "AuditEvent" DROP CONSTRAINT "AuditEvent_engagementId_fkey";

-- DropForeignKey
ALTER TABLE "AuditEvidence" DROP CONSTRAINT "AuditEvidence_engagementId_fkey";

-- DropForeignKey
ALTER TABLE "AuditEvidenceLink" DROP CONSTRAINT "AuditEvidenceLink_evidenceId_fkey";

-- DropForeignKey
ALTER TABLE "AuditEvidenceVersion" DROP CONSTRAINT "AuditEvidenceVersion_evidenceId_fkey";

-- DropForeignKey
ALTER TABLE "AuditFinding" DROP CONSTRAINT "AuditFinding_engagementId_fkey";

-- DropForeignKey
ALTER TABLE "AuditPublicationPackage" DROP CONSTRAINT "AuditPublicationPackage_engagementId_fkey";

-- DropForeignKey
ALTER TABLE "AuditRecommendation" DROP CONSTRAINT "AuditRecommendation_engagementId_fkey";

-- DropForeignKey
ALTER TABLE "AuditRecommendation" DROP CONSTRAINT "AuditRecommendation_findingId_fkey";

-- DropForeignKey
ALTER TABLE "AuditReviewComment" DROP CONSTRAINT "AuditReviewComment_engagementId_fkey";

-- DropForeignKey
ALTER TABLE "AuditTrialBalance" DROP CONSTRAINT "AuditTrialBalance_engagementId_fkey";

-- DropForeignKey
ALTER TABLE "AuditTrialBalanceLine" DROP CONSTRAINT "AuditTrialBalanceLine_trialBalanceId_fkey";

-- DropForeignKey
ALTER TABLE "AuditValidationDisposition" DROP CONSTRAINT "AuditValidationDisposition_engagementId_fkey";

-- DropForeignKey
ALTER TABLE "AuditValidationIssue" DROP CONSTRAINT "AuditValidationIssue_engagementId_fkey";

-- DropForeignKey
ALTER TABLE "AuditValidationRun" DROP CONSTRAINT "AuditValidationRun_engagementId_fkey";

-- DropForeignKey
ALTER TABLE "Constraint" DROP CONSTRAINT "Constraint_decisionId_fkey";

-- DropForeignKey
ALTER TABLE "DecisionFramework" DROP CONSTRAINT "DecisionFramework_decisionId_fkey";

-- DropForeignKey
ALTER TABLE "DecisionRiskAnalysis" DROP CONSTRAINT "DecisionRiskAnalysis_decisionId_fkey";

-- DropForeignKey
ALTER TABLE "DecisionScenario" DROP CONSTRAINT "DecisionScenario_decisionId_fkey";

-- DropForeignKey
ALTER TABLE "Objective" DROP CONSTRAINT "Objective_decisionId_fkey";

-- DropForeignKey
ALTER TABLE "PilotFeedback" DROP CONSTRAINT "PilotFeedback_engagementId_fkey";

-- DropForeignKey
ALTER TABLE "PilotSignoff" DROP CONSTRAINT "PilotSignoff_engagementId_fkey";

-- DropForeignKey
ALTER TABLE "Risk" DROP CONSTRAINT "Risk_decisionId_fkey";

-- DropForeignKey
ALTER TABLE "TenderProfile" DROP CONSTRAINT "TenderProfile_decisionId_fkey";

-- DropForeignKey
ALTER TABLE "institutional_memory_collections" DROP CONSTRAINT "institutional_memory_collections_createdById_fkey";

-- DropForeignKey
ALTER TABLE "institutional_memory_collections" DROP CONSTRAINT "institutional_memory_collections_updatedById_fkey";

-- DropIndex
DROP INDEX "KnowledgeCandidate_createdById_idx";

-- DropIndex
DROP INDEX "KnowledgeFoundationRelease_versionId_key";

-- DropIndex
DROP INDEX "KnowledgeFoundationVersion_versionNumber_key";

-- AlterTable
ALTER TABLE "AuditEngagement" DROP COLUMN "engagementType",
ADD COLUMN     "engagementType" "EngagementType" NOT NULL DEFAULT 'full_audit';

-- AlterTable
ALTER TABLE "AuditEvidence" DROP COLUMN "uploadedBy",
ADD COLUMN     "uploadedById" TEXT;

-- AlterTable
ALTER TABLE "AuditValidationDisposition" DROP COLUMN "disposedBy",
ADD COLUMN     "disposedById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "KnowledgeCandidate" DROP COLUMN "source",
ADD COLUMN     "source" "HealthRecordSource" NOT NULL DEFAULT 'pattern_mining';

-- AlterTable
ALTER TABLE "KnowledgeFoundationDiff" ALTER COLUMN "riskScore" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "KnowledgeFoundationVersion" DROP COLUMN "status",
ADD COLUMN     "status" "KnowledgeFoundationVersionStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "LcPatternSuggestion" DROP COLUMN "source",
ADD COLUMN     "source" "FindingSource" NOT NULL DEFAULT 'ai';

-- AlterTable
ALTER TABLE "LcWorkbookLine" DROP COLUMN "source",
ADD COLUMN     "source" "WorkbookLineSource" NOT NULL DEFAULT 'tb',
DROP COLUMN "confidence",
ADD COLUMN     "confidence" "WorkbookLineConfidence" NOT NULL DEFAULT 'high';

-- AlterTable
ALTER TABLE "LocalContentClassification" DROP COLUMN "classificationBasis",
ADD COLUMN     "classificationBasis" "ClassificationBasis" NOT NULL,
DROP COLUMN "confidence",
ADD COLUMN     "confidence" "ClassificationConfidence" NOT NULL DEFAULT 'unverified',
DROP COLUMN "reviewStatus",
ADD COLUMN     "reviewStatus" "ClassificationReviewStatus" NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "SunbulClient" ADD COLUMN     "createdById" TEXT;

-- AlterTable
ALTER TABLE "institutional_memory_collections" ADD COLUMN     "color" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "createdById" DROP NOT NULL,
ALTER COLUMN "updatedById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "institutional_memory_events" ADD COLUMN     "action" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "nodeId" TEXT,
ADD COLUMN     "performedBy" TEXT;

-- CreateTable
CREATE TABLE "audit_bridge_rules" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "eventTypeFilter" TEXT NOT NULL DEFAULT '*',
    "fieldMappings" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "retryIntervalMs" INTEGER NOT NULL DEFAULT 5000,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_bridge_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bridge_log_entries" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sourceEventId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "targetLogId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "errorMessage" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastRetryAt" TIMESTAMP(3),

    CONSTRAINT "bridge_log_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_ai_workflow_templates" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "workflowType" TEXT NOT NULL DEFAULT 'document_review',
    "steps" JSONB,
    "promptTemplate" TEXT NOT NULL DEFAULT '',
    "outputFormat" TEXT NOT NULL DEFAULT 'markdown',
    "parameters" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "office_ai_workflow_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_ai_schedules" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "templateId" TEXT,
    "name" TEXT NOT NULL,
    "cronExpression" TEXT,
    "inputs" JSONB,
    "taskConfig" JSONB,
    "recurrence" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRunAt" TIMESTAMP(3),
    "lastRunStatus" TEXT,
    "nextRunAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "office_ai_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_ai_role_configs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "roleSlug" TEXT NOT NULL,
    "maxTasksPerDay" INTEGER NOT NULL DEFAULT 10,
    "allowedTaskTypes" JSONB NOT NULL DEFAULT '[]',
    "requireApproval" BOOLEAN NOT NULL DEFAULT true,
    "autoAssignThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "responseStyle" TEXT NOT NULL DEFAULT 'formal',
    "confidenceThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "office_ai_role_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_hierarchy_nodes" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "parentOrgId" TEXT,
    "nodeType" TEXT,
    "name" TEXT,
    "code" TEXT,
    "headUserId" TEXT,
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_hierarchy_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_settings" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "valueType" TEXT NOT NULL DEFAULT 'string',
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_lifecycle_events" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_lifecycle_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewNoteSLA" (
    "id" TEXT NOT NULL,
    "reviewNoteId" TEXT NOT NULL,
    "slaTargetHours" INTEGER NOT NULL,
    "slaWarningThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "slaEscalationThreshold" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "slaBreached" BOOLEAN NOT NULL DEFAULT false,
    "slaBreachedAt" TIMESTAMP(3),
    "escalatedToId" TEXT,
    "escalatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewNoteSLA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentEvidence" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "fileHash" TEXT,
    "storageKey" TEXT,
    "uploadedById" TEXT,
    "description" TEXT,
    "evidenceType" TEXT NOT NULL DEFAULT 'attachment',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComponentMateriality" (
    "id" TEXT NOT NULL,
    "groupEngagementId" TEXT NOT NULL,
    "componentEntityName" TEXT NOT NULL,
    "componentType" TEXT NOT NULL,
    "planningMaterialityId" TEXT NOT NULL,
    "planningMaterialityAmount" DOUBLE PRECISION NOT NULL,
    "performanceMaterialityAmount" DOUBLE PRECISION,
    "trivialThresholdAmount" DOUBLE PRECISION,
    "allocationBasis" TEXT,
    "consolidationNote" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComponentMateriality_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_bridge_rules_organizationId_idx" ON "audit_bridge_rules"("organizationId");

-- CreateIndex
CREATE INDEX "audit_bridge_rules_organizationId_source_idx" ON "audit_bridge_rules"("organizationId", "source");

-- CreateIndex
CREATE INDEX "audit_bridge_rules_organizationId_isActive_idx" ON "audit_bridge_rules"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "bridge_log_entries_ruleId_createdAt_idx" ON "bridge_log_entries"("ruleId", "createdAt");

-- CreateIndex
CREATE INDEX "bridge_log_entries_organizationId_createdAt_idx" ON "bridge_log_entries"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "bridge_log_entries_status_createdAt_idx" ON "bridge_log_entries"("status", "createdAt");

-- CreateIndex
CREATE INDEX "bridge_log_entries_sourceEventId_idx" ON "bridge_log_entries"("sourceEventId");

-- CreateIndex
CREATE INDEX "office_ai_workflow_templates_organizationId_idx" ON "office_ai_workflow_templates"("organizationId");

-- CreateIndex
CREATE INDEX "office_ai_workflow_templates_organizationId_isActive_idx" ON "office_ai_workflow_templates"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "office_ai_workflow_templates_organizationId_workflowType_idx" ON "office_ai_workflow_templates"("organizationId", "workflowType");

-- CreateIndex
CREATE INDEX "office_ai_schedules_organizationId_idx" ON "office_ai_schedules"("organizationId");

-- CreateIndex
CREATE INDEX "office_ai_schedules_templateId_idx" ON "office_ai_schedules"("templateId");

-- CreateIndex
CREATE INDEX "office_ai_schedules_status_nextRunAt_idx" ON "office_ai_schedules"("status", "nextRunAt");

-- CreateIndex
CREATE INDEX "office_ai_role_configs_organizationId_idx" ON "office_ai_role_configs"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "office_ai_role_configs_organizationId_roleSlug_key" ON "office_ai_role_configs"("organizationId", "roleSlug");

-- CreateIndex
CREATE INDEX "org_hierarchy_nodes_organizationId_parentOrgId_idx" ON "org_hierarchy_nodes"("organizationId", "parentOrgId");

-- CreateIndex
CREATE INDEX "org_hierarchy_nodes_organizationId_isActive_idx" ON "org_hierarchy_nodes"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "org_settings_organizationId_isActive_idx" ON "org_settings"("organizationId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "org_settings_organizationId_key_key" ON "org_settings"("organizationId", "key");

-- CreateIndex
CREATE INDEX "org_lifecycle_events_organizationId_createdAt_idx" ON "org_lifecycle_events"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "org_lifecycle_events_organizationId_eventType_idx" ON "org_lifecycle_events"("organizationId", "eventType");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewNoteSLA_reviewNoteId_key" ON "ReviewNoteSLA"("reviewNoteId");

-- CreateIndex
CREATE INDEX "ReviewNoteSLA_reviewNoteId_idx" ON "ReviewNoteSLA"("reviewNoteId");

-- CreateIndex
CREATE INDEX "ContentEvidence_contentId_idx" ON "ContentEvidence"("contentId");

-- CreateIndex
CREATE INDEX "ContentEvidence_organizationId_idx" ON "ContentEvidence"("organizationId");

-- CreateIndex
CREATE INDEX "ContentEvidence_createdAt_idx" ON "ContentEvidence"("createdAt");

-- CreateIndex
CREATE INDEX "ComponentMateriality_groupEngagementId_idx" ON "ComponentMateriality"("groupEngagementId");

-- CreateIndex
CREATE INDEX "ComponentMateriality_planningMaterialityId_idx" ON "ComponentMateriality"("planningMaterialityId");

-- CreateIndex
CREATE INDEX "AuditLog_decisionId_idx" ON "AuditLog"("decisionId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "DecisionMonitoringSignal_decisionId_idx" ON "DecisionMonitoringSignal"("decisionId");

-- CreateIndex
CREATE INDEX "DecisionRiskAlert_decisionId_idx" ON "DecisionRiskAlert"("decisionId");

-- CreateIndex
CREATE INDEX "KnowledgeFoundationVersion_status_idx" ON "KnowledgeFoundationVersion"("status");

-- CreateIndex
CREATE INDEX "LcWorkbookLine_workbookId_confidence_idx" ON "LcWorkbookLine"("workbookId", "confidence");

-- CreateIndex
CREATE INDEX "LocalContentClassification_reviewStatus_idx" ON "LocalContentClassification"("reviewStatus");

-- AddForeignKey
ALTER TABLE "bridge_log_entries" ADD CONSTRAINT "bridge_log_entries_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "audit_bridge_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_ai_schedules" ADD CONSTRAINT "office_ai_schedules_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "office_ai_workflow_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_hierarchy_nodes" ADD CONSTRAINT "org_hierarchy_nodes_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_hierarchy_nodes" ADD CONSTRAINT "org_hierarchy_nodes_parentOrgId_fkey" FOREIGN KEY ("parentOrgId") REFERENCES "org_hierarchy_nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_settings" ADD CONSTRAINT "org_settings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_lifecycle_events" ADD CONSTRAINT "org_lifecycle_events_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionFramework" ADD CONSTRAINT "DecisionFramework_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionScenario" ADD CONSTRAINT "DecisionScenario_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionRiskAnalysis" ADD CONSTRAINT "DecisionRiskAnalysis_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objective" ADD CONSTRAINT "Objective_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Constraint" ADD CONSTRAINT "Constraint_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assumption" ADD CONSTRAINT "Assumption_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alternative" ADD CONSTRAINT "Alternative_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenderProfile" ADD CONSTRAINT "TenderProfile_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditTrialBalance" ADD CONSTRAINT "AuditTrialBalance_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditTrialBalanceLine" ADD CONSTRAINT "AuditTrialBalanceLine_trialBalanceId_fkey" FOREIGN KEY ("trialBalanceId") REFERENCES "AuditTrialBalance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAccountMapping" ADD CONSTRAINT "AuditAccountMapping_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvidence" ADD CONSTRAINT "AuditEvidence_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvidenceLink" ADD CONSTRAINT "AuditEvidenceLink_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "AuditEvidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvidenceVersion" ADD CONSTRAINT "AuditEvidenceVersion_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "AuditEvidence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditFinding" ADD CONSTRAINT "AuditFinding_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecommendation" ADD CONSTRAINT "AuditRecommendation_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecommendation" ADD CONSTRAINT "AuditRecommendation_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "AuditFinding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditReviewComment" ADD CONSTRAINT "AuditReviewComment_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditApprovalRecord" ADD CONSTRAINT "AuditApprovalRecord_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditPublicationPackage" ADD CONSTRAINT "AuditPublicationPackage_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAiOutput" ADD CONSTRAINT "AuditAiOutput_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PilotFeedback" ADD CONSTRAINT "PilotFeedback_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PilotSignoff" ADD CONSTRAINT "PilotSignoff_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditValidationRun" ADD CONSTRAINT "AuditValidationRun_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditValidationIssue" ADD CONSTRAINT "AuditValidationIssue_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditValidationDisposition" ADD CONSTRAINT "AuditValidationDisposition_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SunbulClient" ADD CONSTRAINT "SunbulClient_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutional_memory_collections" ADD CONSTRAINT "institutional_memory_collections_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutional_memory_collections" ADD CONSTRAINT "institutional_memory_collections_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewNoteSLA" ADD CONSTRAINT "ReviewNoteSLA_reviewNoteId_fkey" FOREIGN KEY ("reviewNoteId") REFERENCES "ReviewNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentEvidence" ADD CONSTRAINT "ContentEvidence_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeFoundationVersion" ADD CONSTRAINT "KnowledgeFoundationVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeFoundationVersion" ADD CONSTRAINT "KnowledgeFoundationVersion_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeFoundationVersion" ADD CONSTRAINT "KnowledgeFoundationVersion_rollbackVersionId_fkey" FOREIGN KEY ("rollbackVersionId") REFERENCES "KnowledgeFoundationVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeFoundationRelease" ADD CONSTRAINT "KnowledgeFoundationRelease_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "KnowledgeFoundationVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeFoundationRelease" ADD CONSTRAINT "KnowledgeFoundationRelease_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeFoundationRelease" ADD CONSTRAINT "KnowledgeFoundationRelease_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeFoundationDiff" ADD CONSTRAINT "KnowledgeFoundationDiff_fromVersionId_fkey" FOREIGN KEY ("fromVersionId") REFERENCES "KnowledgeFoundationVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeFoundationDiff" ADD CONSTRAINT "KnowledgeFoundationDiff_toVersionId_fkey" FOREIGN KEY ("toVersionId") REFERENCES "KnowledgeFoundationVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComponentMateriality" ADD CONSTRAINT "ComponentMateriality_planningMaterialityId_fkey" FOREIGN KEY ("planningMaterialityId") REFERENCES "PlanningMateriality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "EvidenceRelation_sourceEvidenceId_targetEvidenceId_relationType" RENAME TO "EvidenceRelation_sourceEvidenceId_targetEvidenceId_relation_key";
