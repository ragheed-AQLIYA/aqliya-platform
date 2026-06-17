-- CreateEnum
CREATE TYPE "ConflictLevel" AS ENUM ('HARD', 'SOFT');

-- CreateEnum
CREATE TYPE "AbacEffect" AS ENUM ('ALLOW', 'DENY');

-- CreateEnum
CREATE TYPE "AbacOperator" AS ENUM ('EQ', 'NEQ', 'GT', 'GTE', 'LT', 'LTE', 'IN', 'NOT_IN', 'CONTAINS', 'NOT_CONTAINS', 'STARTS_WITH', 'ENDS_WITH', 'EXISTS');

-- DropIndex
DROP INDEX "DocumentChunk_embedding_hnsw_idx";

-- AlterTable
ALTER TABLE "ContactReview" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "reviewDueDate" TIMESTAMP(3),
ADD COLUMN     "reviewerNotes" TEXT;

-- AlterTable
ALTER TABLE "LocalContact" ADD COLUMN     "exportStatus" TEXT NOT NULL DEFAULT 'none';

-- AlterTable
ALTER TABLE "TBClassificationHistory" ADD COLUMN     "mappingHints" JSONB;

-- AlterTable
ALTER TABLE "WorkflowRecord" ADD COLUMN     "escalatedAt" TIMESTAMP(3),
ADD COLUMN     "escalatedToId" TEXT,
ADD COLUMN     "exportApprovedAt" TIMESTAMP(3),
ADD COLUMN     "exportApprovedById" TEXT,
ADD COLUMN     "exportRejectedReason" TEXT,
ADD COLUMN     "exportRequestedAt" TIMESTAMP(3),
ADD COLUMN     "exportRequestedById" TEXT,
ADD COLUMN     "exportStatus" TEXT NOT NULL DEFAULT 'none';

-- CreateTable
CREATE TABLE "ContactExportRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "contactId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "requestedById" TEXT NOT NULL,
    "requestedByName" TEXT,
    "reason" TEXT,
    "reviewedById" TEXT,
    "reviewedByName" TEXT,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "requiresLegalReview" BOOLEAN NOT NULL DEFAULT false,
    "legalReviewStatus" TEXT,
    "exportedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactExportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntelligenceGraphNode" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "metadata" JSONB,
    "embedding" vector(1536),
    "embedding_json" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntelligenceGraphNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntelligenceGraphEdge" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntelligenceGraphEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntelligenceQuery" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "results" JSONB,
    "resultCount" INTEGER DEFAULT 0,
    "userId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntelligenceQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmConnection" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "apiEndpoint" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "apiKey" TEXT,
    "apiVersion" TEXT DEFAULT 'v1',
    "syncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "syncIntervalMin" INTEGER DEFAULT 60,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncStatus" TEXT,
    "lastSyncError" TEXT,
    "fieldMapping" JSONB,
    "conflictPolicy" TEXT DEFAULT 'crm_wins',
    "metadata" JSONB,
    "createdById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CrmConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmSyncLog" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "createdRecords" INTEGER NOT NULL DEFAULT 0,
    "updatedRecords" INTEGER NOT NULL DEFAULT 0,
    "failedRecords" INTEGER NOT NULL DEFAULT 0,
    "skippedRecords" INTEGER NOT NULL DEFAULT 0,
    "errorDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "CrmSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErpConnection" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "connectionType" TEXT NOT NULL DEFAULT 'api',
    "apiEndpoint" TEXT,
    "apiKey" TEXT,
    "apiSecret" TEXT,
    "sftpHost" TEXT,
    "sftpPort" INTEGER,
    "sftpUsername" TEXT,
    "sftpKey" TEXT,
    "syncEnabled" BOOLEAN NOT NULL DEFAULT false,
    "syncIntervalMin" INTEGER DEFAULT 1440,
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncStatus" TEXT,
    "fieldMapping" JSONB,
    "sourceSystem" TEXT,
    "defaultCurrency" TEXT DEFAULT 'SAR',
    "metadata" JSONB,
    "createdById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErpConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErpSyncLog" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "direction" TEXT NOT NULL DEFAULT 'import',
    "status" TEXT NOT NULL,
    "totalRecords" INTEGER NOT NULL DEFAULT 0,
    "importedRecords" INTEGER NOT NULL DEFAULT 0,
    "failedRecords" INTEGER NOT NULL DEFAULT 0,
    "skippedRecords" INTEGER NOT NULL DEFAULT 0,
    "sourceFile" TEXT,
    "fileHash" TEXT,
    "errorDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ErpSyncLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErpImportBatch" (
    "id" TEXT NOT NULL,
    "connectionId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "totalLines" INTEGER NOT NULL DEFAULT 0,
    "validLines" INTEGER NOT NULL DEFAULT 0,
    "errorLines" INTEGER NOT NULL DEFAULT 0,
    "fileHash" TEXT,
    "originalFile" TEXT,
    "reviewNotes" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErpImportBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SYSTEM',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "grantedById" TEXT,
    "reason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "revokedAt" TIMESTAMP(3),
    "revokedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeparationOfDutyRule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "description" TEXT,
    "roleAId" TEXT NOT NULL,
    "roleBId" TEXT NOT NULL,
    "conflictLevel" "ConflictLevel" NOT NULL DEFAULT 'HARD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeparationOfDutyRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoDConflict" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "roleAId" TEXT,
    "roleBId" TEXT,
    "description" TEXT,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoDConflict_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaultEntry" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "displayName" TEXT,
    "encryptedValue" TEXT NOT NULL,
    "keyIdentifier" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "environment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "version" INTEGER NOT NULL DEFAULT 1,
    "lastRotatedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3),
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "rotationPeriodDays" INTEGER NOT NULL DEFAULT 90,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "previousVersionId" TEXT,
    "createdById" TEXT,
    "organizationId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaultEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncryptionKey" (
    "id" TEXT NOT NULL,
    "keyId" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "description" TEXT,
    "createdBy" TEXT,
    "retiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EncryptionKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownloadTicket" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "filePath" TEXT,
    "storageKey" TEXT,
    "permissionCheck" TEXT,
    "createdById" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedById" TEXT,
    "revokeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DownloadTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HashChainEntry" (
    "id" TEXT NOT NULL,
    "auditLogId" TEXT NOT NULL,
    "previousHash" TEXT,
    "chainHash" TEXT NOT NULL,
    "nonce" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chainVerified" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),

    CONSTRAINT "HashChainEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbacPolicy" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "resourceType" TEXT NOT NULL,
    "effect" "AbacEffect" NOT NULL DEFAULT 'ALLOW',
    "priority" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AbacPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbacPolicyCondition" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "attribute" TEXT NOT NULL,
    "operator" "AbacOperator" NOT NULL,
    "value" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbacPolicyCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbacPolicyAssignment" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "roleId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AbacPolicyAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionEscalationRule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Escalation Rule',
    "description" TEXT,
    "triggerType" TEXT NOT NULL DEFAULT 'time',
    "triggerConfig" JSONB NOT NULL DEFAULT '{}',
    "escalationLevel" INTEGER NOT NULL DEFAULT 1,
    "targetRole" TEXT,
    "targetUserId" TEXT,
    "decisionTemplateId" TEXT,
    "escalateAfterHours" INTEGER NOT NULL DEFAULT 0,
    "targetRoleSlug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DecisionEscalationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionGovEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "decisionId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromStatus" TEXT NOT NULL,
    "toStatus" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT,
    "reviewNotes" TEXT,
    "escalationRuleId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionGovEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiActionRegistry" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "actionKey" TEXT NOT NULL,
    "productKey" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "promptTemplate" TEXT NOT NULL,
    "inputSchema" TEXT,
    "outputSchema" TEXT,
    "requiredContext" TEXT,
    "riskLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
    "requiresReview" BOOLEAN NOT NULL DEFAULT true,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiActionRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiCrossProductSession" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "userId" TEXT NOT NULL,
    "productContext" TEXT NOT NULL,
    "sourceAction" TEXT NOT NULL,
    "sourceRecordId" TEXT,
    "sourceRecordType" TEXT,
    "relatedProducts" TEXT,
    "requestText" TEXT NOT NULL,
    "responseText" TEXT,
    "modelUsed" TEXT NOT NULL DEFAULT 'deterministic',
    "tokensUsed" INTEGER,
    "confidenceScore" DOUBLE PRECISION,
    "requiresReview" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "metadata" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiCrossProductSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiContextBridge" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "sourceProduct" TEXT NOT NULL,
    "targetProduct" TEXT NOT NULL,
    "mappingName" TEXT NOT NULL,
    "mappingConfig" TEXT,
    "description" TEXT,
    "createdBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiContextBridge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiModelRegistry" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "modelType" TEXT NOT NULL,
    "description" TEXT,
    "useCase" TEXT,
    "riskLevel" TEXT NOT NULL DEFAULT 'low',
    "requiresReview" BOOLEAN NOT NULL DEFAULT false,
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "documentationUrl" TEXT,
    "ownerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewNotes" TEXT,
    "updatedBy" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "approvalNotes" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiModelRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiModelDeployment" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "endpointUrl" TEXT,
    "config" TEXT,
    "deployedById" TEXT,
    "deployedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "decommissionedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiModelDeployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiModelGovernanceReview" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL,
    "reviewerId" TEXT,
    "reviewerName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "findings" TEXT,
    "notes" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiModelGovernanceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProspect" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "source" TEXT,
    "companyName" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "jurisdiction" TEXT,
    "industry" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "estimatedFee" DOUBLE PRECISION,
    "estimatedFeeCurrency" TEXT,
    "referredBy" TEXT,
    "referralNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientProspect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KycPackage" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "completedById" TEXT,
    "completedAt" TIMESTAMP(3),
    "ownershipStructure" JSONB,
    "financialHealth" JSONB,
    "litigationHistory" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KycPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientRiskAssessment" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "clientId" TEXT,
    "assessmentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "overallRiskScore" INTEGER,
    "overallRiskLevel" TEXT NOT NULL,
    "entityRiskScore" INTEGER,
    "entityRiskLevel" TEXT,
    "industryRiskScore" INTEGER,
    "industryRiskLevel" TEXT,
    "financialRiskScore" INTEGER,
    "financialRiskLevel" TEXT,
    "governanceRiskScore" INTEGER,
    "governanceRiskLevel" TEXT,
    "regulatoryRiskScore" INTEGER,
    "regulatoryRiskLevel" TEXT,
    "riskFactors" JSONB,
    "mitigatingFactors" JSONB,
    "methodology" TEXT,
    "assessedById" TEXT,
    "assessedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientRiskAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcceptanceDecision" (
    "id" TEXT NOT NULL,
    "prospectId" TEXT NOT NULL,
    "clientId" TEXT,
    "decisionType" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "rationale" TEXT,
    "conditions" JSONB,
    "effectiveDate" TIMESTAMP(3),
    "expiryDate" TIMESTAMP(3),
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AcceptanceDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContinuanceReview" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "reviewYear" INTEGER NOT NULL,
    "engagementHistory" JSONB,
    "feeHistory" JSONB,
    "clientChanges" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "decision" TEXT,
    "rationale" TEXT,
    "riskReassessmentId" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContinuanceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualitySystemEvaluation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "systemEffectiveness" TEXT,
    "overallConclusion" TEXT,
    "summaryOfFindings" TEXT,
    "keyStrengths" TEXT,
    "keyWeaknesses" TEXT,
    "nextEvaluationDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualitySystemEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityObjective" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "objectiveType" TEXT NOT NULL,
    "category" TEXT,
    "reference" TEXT,
    "description" TEXT NOT NULL,
    "targetState" TEXT,
    "effectiveDate" TIMESTAMP(3),
    "reviewDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityRisk" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "riskDescription" TEXT NOT NULL,
    "riskCategory" TEXT,
    "inherentRisk" TEXT,
    "residualRisk" TEXT,
    "residualRiskAssessment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "lastAssessmentDate" TIMESTAMP(3),
    "nextAssessmentDate" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityRisk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityResponse" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "riskId" TEXT NOT NULL,
    "responseType" TEXT NOT NULL,
    "responseDescription" TEXT,
    "responsiblePersonId" TEXT,
    "createdById" TEXT,
    "implementationStatus" TEXT NOT NULL DEFAULT 'pending',
    "effectivenessEvaluation" TEXT,
    "evaluationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityFinding" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "monitoringActivityId" TEXT,
    "findingType" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "description" TEXT NOT NULL,
    "rootCause" TEXT,
    "rootCauseAnalysis" TEXT,
    "engagementId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityRemediation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "actionDescription" TEXT,
    "actionType" TEXT,
    "responsiblePersonId" TEXT,
    "targetDate" TIMESTAMP(3),
    "createdById" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "effectivenessResult" TEXT,
    "effectivenessCheckDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityRemediation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityMonitoringActivity" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "scope" TEXT,
    "frequency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduledDate" TIMESTAMP(3),
    "performedById" TEXT,
    "createdById" TEXT,
    "completedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualityMonitoringActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndependenceRegister" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityType" TEXT,
    "entityName" TEXT NOT NULL,
    "entityRole" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "joinDate" TIMESTAMP(3),
    "leaveDate" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndependenceRegister_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndependenceThreat" (
    "id" TEXT NOT NULL,
    "registerId" TEXT NOT NULL,
    "clientId" TEXT,
    "engagementId" TEXT,
    "threatCategory" TEXT NOT NULL,
    "threatDescription" TEXT,
    "threatLevel" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'open',
    "identifiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "identifiedById" TEXT,
    "assessedById" TEXT,
    "assessedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndependenceThreat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndependenceSafeguard" (
    "id" TEXT NOT NULL,
    "threatId" TEXT NOT NULL,
    "safeguardType" TEXT NOT NULL,
    "safeguardDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "implementedAt" TIMESTAMP(3),
    "effectivenessReview" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndependenceSafeguard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmploymentRelationship" (
    "id" TEXT NOT NULL,
    "registerId" TEXT NOT NULL,
    "relatedEntityName" TEXT NOT NULL,
    "relatedEntityType" TEXT,
    "relationshipType" TEXT NOT NULL,
    "relationshipDescription" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "selfDisclosed" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmploymentRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialInterest" (
    "id" TEXT NOT NULL,
    "registerId" TEXT NOT NULL,
    "interestType" TEXT NOT NULL,
    "issuerName" TEXT NOT NULL,
    "issuerTicker" TEXT,
    "amount" DOUBLE PRECISION,
    "currency" TEXT,
    "dateAcquired" TIMESTAMP(3),
    "selfDisclosed" BOOLEAN NOT NULL DEFAULT false,
    "dateDisposed" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialInterest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnnualIndependenceConfirmation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "registerId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "confirmedAt" TIMESTAMP(3),
    "interestsDeclared" JSONB,
    "relationshipsDeclared" JSONB,
    "signedById" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewedNotes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnnualIndependenceConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgePattern" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "patternType" TEXT NOT NULL,
    "patternKey" TEXT NOT NULL,
    "patternLabel" TEXT,
    "occurrenceCount" INTEGER NOT NULL DEFAULT 0,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "lastObservedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgePattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeRecommendation" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,
    "recommendationType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "context" TEXT,
    "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "acceptedById" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndustryBenchmark" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "benchmarkType" TEXT NOT NULL,
    "metricName" TEXT NOT NULL,
    "metricValue" DOUBLE PRECISION,
    "unit" TEXT,
    "sampleSize" INTEGER,
    "source" TEXT,
    "confidenceInterval" DOUBLE PRECISION,
    "confidenceLevel" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IndustryBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EngagementProfile" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "industryProfile" JSONB,
    "entityCharacteristics" JSONB,
    "riskProfileSummary" TEXT,
    "riskAreas" JSONB,
    "findingsSummary" JSONB,
    "keyAdjustments" JSONB,
    "priorYearEngagementId" TEXT,
    "knowledgeTags" JSONB,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngagementProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialityBenchmark" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "benchmarkType" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "methodologyRef" TEXT,
    "methodologyRule" TEXT,
    "status" TEXT NOT NULL DEFAULT 'preliminary',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialityBenchmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanningMateriality" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "benchmarkId" TEXT,
    "percentage" DOUBLE PRECISION NOT NULL,
    "percentageRule" TEXT,
    "computedAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "rationale" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanningMateriality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceMateriality" (
    "id" TEXT NOT NULL,
    "planningMaterialityId" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "computedAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceMateriality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrivialThreshold" (
    "id" TEXT NOT NULL,
    "planningMaterialityId" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "computedAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrivialThreshold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialityOverride" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "materialityType" TEXT NOT NULL,
    "materialityEntityId" TEXT NOT NULL,
    "overriddenAmount" DOUBLE PRECISION NOT NULL,
    "originalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialityOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewNote" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "reviewNoteNumber" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "targetLabel" TEXT,
    "reviewStage" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'raised',
    "raiserId" TEXT NOT NULL,
    "raiserName" TEXT,
    "comment" TEXT NOT NULL,
    "assignedToId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "slaTargetHours" INTEGER,
    "responseDescription" TEXT,
    "respondedAt" TIMESTAMP(3),
    "evidenceRef" JSONB,
    "reviewerConclusion" TEXT,
    "closureComment" TEXT,
    "closedById" TEXT,
    "closedAt" TIMESTAMP(3),
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewNoteEscalation" (
    "id" TEXT NOT NULL,
    "reviewNoteId" TEXT NOT NULL,
    "escalationLevel" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "escalatedById" TEXT,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewNoteEscalation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SamplingPlan" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "engagementId" TEXT,
    "title" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "populationSize" INTEGER NOT NULL,
    "sampleSize" INTEGER,
    "confidenceLevel" DOUBLE PRECISION NOT NULL DEFAULT 95,
    "materialityPct" DOUBLE PRECISION NOT NULL,
    "strataField" TEXT,
    "strataSizes" JSONB,
    "judgmentalItemIds" JSONB NOT NULL,
    "parameters" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SamplingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SamplingResult" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sampleIndices" JSONB NOT NULL,
    "sampleSize" INTEGER NOT NULL,
    "sampleErrors" INTEGER NOT NULL,
    "totalErrorAmount" DOUBLE PRECISION,
    "projectedError" DOUBLE PRECISION,
    "lowerBound" DOUBLE PRECISION,
    "upperBound" DOUBLE PRECISION,
    "confidenceLevel" DOUBLE PRECISION NOT NULL,
    "methodology" TEXT NOT NULL,
    "notes" TEXT,
    "executedById" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SamplingResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SamplingReview" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "resultId" TEXT,
    "reviewerId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL DEFAULT 'full',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "methodologyValid" BOOLEAN,
    "selectionValid" BOOLEAN,
    "conclusionValid" BOOLEAN,
    "comments" TEXT,
    "justification" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SamplingReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SamplingEvidence" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "resultId" TEXT,
    "itemIndex" INTEGER NOT NULL,
    "itemReference" TEXT,
    "itemDescription" TEXT,
    "evidenceType" TEXT NOT NULL DEFAULT 'document',
    "evidenceRef" TEXT,
    "evidenceDescription" TEXT,
    "conclusion" TEXT NOT NULL,
    "errorAmount" DOUBLE PRECISION,
    "errorDescription" TEXT,
    "testedById" TEXT NOT NULL,
    "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SamplingEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticalReviewPaper" (
    "id" TEXT NOT NULL,
    "workingPaperIndexId" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "procedureDescription" TEXT NOT NULL,
    "expectation" DOUBLE PRECISION,
    "expectationBasis" TEXT,
    "actualResult" DOUBLE PRECISION,
    "variance" DOUBLE PRECISION,
    "variancePercentage" DOUBLE PRECISION,
    "investigationRequired" BOOLEAN NOT NULL DEFAULT false,
    "investigationConclusion" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticalReviewPaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ControlTestingPaper" (
    "id" TEXT NOT NULL,
    "workingPaperIndexId" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "controlDescription" TEXT NOT NULL,
    "controlObjective" TEXT,
    "controlType" TEXT NOT NULL,
    "controlFrequency" TEXT,
    "sampleSize" INTEGER,
    "deviations" INTEGER,
    "deviationRate" DOUBLE PRECISION,
    "operatingEffectivenessConclusion" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ControlTestingPaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubstantiveTestingPaper" (
    "id" TEXT NOT NULL,
    "workingPaperIndexId" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "procedureDescription" TEXT NOT NULL,
    "assertionTested" TEXT,
    "populationReference" TEXT,
    "sampleReference" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubstantiveTestingPaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompletionPaper" (
    "id" TEXT NOT NULL,
    "workingPaperIndexId" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "checklistType" TEXT NOT NULL,
    "items" JSONB,
    "overallCompletionAssessment" TEXT,
    "createdById" TEXT,
    "engagementPartnerSignOffId" TEXT,
    "signOffDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompletionPaper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditRiskModel" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categories" JSONB,
    "thresholds" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditRiskModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditRiskAssessment" (
    "id" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "inherentScore" DOUBLE PRECISION,
    "inherentLevel" TEXT,
    "residualScore" DOUBLE PRECISION,
    "residualLevel" TEXT,
    "riskResponse" TEXT,
    "responseNotes" TEXT,
    "answers" JSONB,
    "categoryScores" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "assessedById" TEXT,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedById" TEXT,
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditRiskAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditRiskProcedure" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "procedureCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "riskCategory" TEXT NOT NULL,
    "procedureSteps" JSONB,
    "evidenceRequired" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditRiskProcedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcWorkbook" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "reportingPeriod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "totalLines" INTEGER NOT NULL DEFAULT 0,
    "autoFilledLines" INTEGER NOT NULL DEFAULT 0,
    "missingLines" INTEGER NOT NULL DEFAULT 0,
    "completionPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exportedAt" TIMESTAMP(3),
    "lcScore" DOUBLE PRECISION,
    "lcScoreComputedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcWorkbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcWorkbookLine" (
    "id" TEXT NOT NULL,
    "workbookId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "autoFillable" BOOLEAN NOT NULL DEFAULT false,
    "autoFilled" BOOLEAN NOT NULL DEFAULT false,
    "autoFillValue" DOUBLE PRECISION,
    "autoFillSource" TEXT,
    "manualValue" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'tb',
    "confidence" TEXT NOT NULL DEFAULT 'high',
    "evidenceRequired" BOOLEAN NOT NULL DEFAULT false,
    "evidenceTypes" TEXT,
    "notes" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcWorkbookLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcDataRequest" (
    "id" TEXT NOT NULL,
    "workbookId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sentAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcDataRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcDataRequestItem" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "lineId" TEXT,
    "fieldName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "evidenceRequired" BOOLEAN NOT NULL DEFAULT false,
    "evidenceTypes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "responseValue" TEXT,
    "responseFile" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcDataRequestItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcPatternSuggestion" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workbookLineCode" TEXT NOT NULL,
    "currentPattern" TEXT NOT NULL,
    "suggestedPattern" TEXT NOT NULL,
    "reasoning" TEXT,
    "falsePositiveAccounts" JSONB,
    "unmatchedAccounts" JSONB,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'ai',
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acceptanceScore" DOUBLE PRECISION,
    "successScore" DOUBLE PRECISION,
    "falsePositiveRate" DOUBLE PRECISION,
    "decayScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "appliedAt" TIMESTAMP(3),
    "healthScore" DOUBLE PRECISION,

    CONSTRAINT "LcPatternSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcMatchReview" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workbookLineId" TEXT,
    "workbookLineCode" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "patternUsed" TEXT,
    "matchType" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "riskLevel" TEXT NOT NULL DEFAULT 'low',
    "riskReason" TEXT,
    "evidence" JSONB,
    "isFalsePositive" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcMatchReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcIndustryPatternMemory" (
    "id" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "workbookLineCode" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "totalMatches" INTEGER NOT NULL DEFAULT 0,
    "correctMatches" INTEGER NOT NULL DEFAULT 0,
    "falsePositives" INTEGER NOT NULL DEFAULT 0,
    "effectivenessPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcIndustryPatternMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcOrganizationMatchMemory" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workbookLineCode" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "previousResult" TEXT NOT NULL,
    "currentPattern" TEXT,
    "manualOverride" BOOLEAN NOT NULL DEFAULT false,
    "overrideReason" TEXT,
    "classification" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcOrganizationMatchMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcAiAuditEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "projectId" TEXT,
    "workbookId" TEXT,
    "action" TEXT NOT NULL,
    "actorId" TEXT,
    "providerId" TEXT,
    "modelVersion" TEXT,
    "promptVersion" TEXT,
    "confidence" DOUBLE PRECISION,
    "status" TEXT NOT NULL,
    "inputSummary" JSONB,
    "outputSummary" JSONB,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LcAiAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcRecommendation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workbookId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "impactScore" DOUBLE PRECISION NOT NULL,
    "priority" TEXT NOT NULL,
    "estimatedValue" DOUBLE PRECISION,
    "effort" TEXT,
    "evidenceRefs" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT,
    "rationale" TEXT,
    "groundingConfidence" DOUBLE PRECISION,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcSimulationResult" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workbookId" TEXT NOT NULL,
    "scenarioType" TEXT NOT NULL,
    "scenarioLabel" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "currentScore" DOUBLE PRECISION,
    "projectedScore" DOUBLE PRECISION,
    "delta" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,
    "assumptions" JSONB,
    "drivers" JSONB,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LcSimulationResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcAiReviewRun" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workbookId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "explanationsGenerated" INTEGER NOT NULL DEFAULT 0,
    "patternSuggestions" INTEGER NOT NULL DEFAULT 0,
    "falsePositives" INTEGER NOT NULL DEFAULT 0,
    "confidenceCalibrated" BOOLEAN NOT NULL DEFAULT false,
    "recommendationsGenerated" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LcAiReviewRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcPatternHealthRecord" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "workbookLineCode" TEXT NOT NULL,
    "pattern" TEXT NOT NULL,
    "healthScore" DOUBLE PRECISION NOT NULL,
    "acceptanceRate" DOUBLE PRECISION,
    "successRate" DOUBLE PRECISION,
    "falsePositiveRate" DOUBLE PRECISION,
    "decayScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "totalSuggestions" INTEGER NOT NULL DEFAULT 0,
    "totalAccepted" INTEGER NOT NULL DEFAULT 0,
    "totalSuccessful" INTEGER NOT NULL DEFAULT 0,
    "lastSuggestedAt" TIMESTAMP(3),
    "lastAppliedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LcPatternHealthRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LcRecommendationOutcome" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "recommendationId" TEXT NOT NULL,
    "workbookId" TEXT NOT NULL,
    "scoreBefore" DOUBLE PRECISION,
    "scoreAfter" DOUBLE PRECISION,
    "realizedDelta" DOUBLE PRECISION,
    "expectedDelta" DOUBLE PRECISION,
    "accuracyScore" DOUBLE PRECISION,
    "timeToImplement" INTEGER,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LcRecommendationOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactExportRequest_organizationId_contactId_createdAt_idx" ON "ContactExportRequest"("organizationId", "contactId", "createdAt");

-- CreateIndex
CREATE INDEX "ContactExportRequest_organizationId_status_createdAt_idx" ON "ContactExportRequest"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ContactExportRequest_organizationId_requiresLegalReview_idx" ON "ContactExportRequest"("organizationId", "requiresLegalReview");

-- CreateIndex
CREATE INDEX "IntelligenceGraphNode_organizationId_type_idx" ON "IntelligenceGraphNode"("organizationId", "type");

-- CreateIndex
CREATE INDEX "IntelligenceGraphNode_organizationId_name_idx" ON "IntelligenceGraphNode"("organizationId", "name");

-- CreateIndex
CREATE INDEX "IntelligenceGraphEdge_organizationId_sourceId_relationType_idx" ON "IntelligenceGraphEdge"("organizationId", "sourceId", "relationType");

-- CreateIndex
CREATE INDEX "IntelligenceGraphEdge_organizationId_targetId_relationType_idx" ON "IntelligenceGraphEdge"("organizationId", "targetId", "relationType");

-- CreateIndex
CREATE INDEX "IntelligenceGraphEdge_organizationId_relationType_idx" ON "IntelligenceGraphEdge"("organizationId", "relationType");

-- CreateIndex
CREATE INDEX "IntelligenceQuery_organizationId_createdAt_idx" ON "IntelligenceQuery"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "IntelligenceQuery_organizationId_userId_createdAt_idx" ON "IntelligenceQuery"("organizationId", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "CrmConnection_organizationId_provider_idx" ON "CrmConnection"("organizationId", "provider");

-- CreateIndex
CREATE INDEX "CrmConnection_organizationId_syncEnabled_idx" ON "CrmConnection"("organizationId", "syncEnabled");

-- CreateIndex
CREATE INDEX "CrmSyncLog_connectionId_createdAt_idx" ON "CrmSyncLog"("connectionId", "createdAt");

-- CreateIndex
CREATE INDEX "CrmSyncLog_organizationId_status_createdAt_idx" ON "CrmSyncLog"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ErpConnection_organizationId_provider_idx" ON "ErpConnection"("organizationId", "provider");

-- CreateIndex
CREATE INDEX "ErpSyncLog_connectionId_createdAt_idx" ON "ErpSyncLog"("connectionId", "createdAt");

-- CreateIndex
CREATE INDEX "ErpSyncLog_organizationId_status_createdAt_idx" ON "ErpSyncLog"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ErpImportBatch_connectionId_status_createdAt_idx" ON "ErpImportBatch"("connectionId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ErpImportBatch_organizationId_status_idx" ON "ErpImportBatch"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_slug_key" ON "Permission"("slug");

-- CreateIndex
CREATE INDEX "Permission_group_idx" ON "Permission"("group");

-- CreateIndex
CREATE UNIQUE INDEX "Role_slug_key" ON "Role"("slug");

-- CreateIndex
CREATE INDEX "Role_type_idx" ON "Role"("type");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "UserRoleAssignment_userId_organizationId_isActive_idx" ON "UserRoleAssignment"("userId", "organizationId", "isActive");

-- CreateIndex
CREATE INDEX "UserRoleAssignment_roleId_idx" ON "UserRoleAssignment"("roleId");

-- CreateIndex
CREATE INDEX "UserRoleAssignment_grantedById_idx" ON "UserRoleAssignment"("grantedById");

-- CreateIndex
CREATE INDEX "SeparationOfDutyRule_organizationId_idx" ON "SeparationOfDutyRule"("organizationId");

-- CreateIndex
CREATE INDEX "SeparationOfDutyRule_isActive_idx" ON "SeparationOfDutyRule"("isActive");

-- CreateIndex
CREATE INDEX "SeparationOfDutyRule_roleAId_idx" ON "SeparationOfDutyRule"("roleAId");

-- CreateIndex
CREATE INDEX "SeparationOfDutyRule_roleBId_idx" ON "SeparationOfDutyRule"("roleBId");

-- CreateIndex
CREATE INDEX "SoDConflict_userId_organizationId_idx" ON "SoDConflict"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "SoDConflict_ruleId_idx" ON "SoDConflict"("ruleId");

-- CreateIndex
CREATE INDEX "SoDConflict_resolvedAt_idx" ON "SoDConflict"("resolvedAt");

-- CreateIndex
CREATE INDEX "VaultEntry_key_organizationId_idx" ON "VaultEntry"("key", "organizationId");

-- CreateIndex
CREATE INDEX "VaultEntry_organizationId_category_idx" ON "VaultEntry"("organizationId", "category");

-- CreateIndex
CREATE INDEX "VaultEntry_deletedAt_idx" ON "VaultEntry"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EncryptionKey_keyId_key" ON "EncryptionKey"("keyId");

-- CreateIndex
CREATE INDEX "EncryptionKey_status_idx" ON "EncryptionKey"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DownloadTicket_token_key" ON "DownloadTicket"("token");

-- CreateIndex
CREATE INDEX "DownloadTicket_token_idx" ON "DownloadTicket"("token");

-- CreateIndex
CREATE INDEX "DownloadTicket_createdById_createdAt_idx" ON "DownloadTicket"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "DownloadTicket_organizationId_expiresAt_idx" ON "DownloadTicket"("organizationId", "expiresAt");

-- CreateIndex
CREATE INDEX "DownloadTicket_expiresAt_idx" ON "DownloadTicket"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "HashChainEntry_auditLogId_key" ON "HashChainEntry"("auditLogId");

-- CreateIndex
CREATE INDEX "HashChainEntry_createdAt_idx" ON "HashChainEntry"("createdAt");

-- CreateIndex
CREATE INDEX "AbacPolicy_organizationId_resourceType_idx" ON "AbacPolicy"("organizationId", "resourceType");

-- CreateIndex
CREATE INDEX "AbacPolicy_isActive_idx" ON "AbacPolicy"("isActive");

-- CreateIndex
CREATE INDEX "AbacPolicyCondition_policyId_idx" ON "AbacPolicyCondition"("policyId");

-- CreateIndex
CREATE INDEX "AbacPolicyAssignment_policyId_idx" ON "AbacPolicyAssignment"("policyId");

-- CreateIndex
CREATE INDEX "AbacPolicyAssignment_roleId_userId_idx" ON "AbacPolicyAssignment"("roleId", "userId");

-- CreateIndex
CREATE INDEX "DecisionEscalationRule_organizationId_isActive_idx" ON "DecisionEscalationRule"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "DecisionGovEvent_organizationId_decisionId_idx" ON "DecisionGovEvent"("organizationId", "decisionId");

-- CreateIndex
CREATE INDEX "DecisionGovEvent_organizationId_action_createdAt_idx" ON "DecisionGovEvent"("organizationId", "action", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AiActionRegistry_actionKey_key" ON "AiActionRegistry"("actionKey");

-- CreateIndex
CREATE INDEX "AiActionRegistry_organizationId_actionKey_idx" ON "AiActionRegistry"("organizationId", "actionKey");

-- CreateIndex
CREATE INDEX "AiCrossProductSession_organizationId_createdAt_idx" ON "AiCrossProductSession"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AiCrossProductSession_organizationId_status_idx" ON "AiCrossProductSession"("organizationId", "status");

-- CreateIndex
CREATE INDEX "AiCrossProductSession_userId_idx" ON "AiCrossProductSession"("userId");

-- CreateIndex
CREATE INDEX "AiContextBridge_organizationId_isActive_idx" ON "AiContextBridge"("organizationId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "AiContextBridge_organizationId_sourceProduct_targetProduct_key" ON "AiContextBridge"("organizationId", "sourceProduct", "targetProduct");

-- CreateIndex
CREATE INDEX "AiModelRegistry_organizationId_status_idx" ON "AiModelRegistry"("organizationId", "status");

-- CreateIndex
CREATE INDEX "AiModelRegistry_organizationId_provider_idx" ON "AiModelRegistry"("organizationId", "provider");

-- CreateIndex
CREATE INDEX "AiModelDeployment_modelId_idx" ON "AiModelDeployment"("modelId");

-- CreateIndex
CREATE INDEX "AiModelDeployment_isActive_idx" ON "AiModelDeployment"("isActive");

-- CreateIndex
CREATE INDEX "AiModelGovernanceReview_modelId_idx" ON "AiModelGovernanceReview"("modelId");

-- CreateIndex
CREATE INDEX "AiModelGovernanceReview_reviewType_idx" ON "AiModelGovernanceReview"("reviewType");

-- CreateIndex
CREATE INDEX "ClientProspect_organizationId_status_idx" ON "ClientProspect"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ClientProspect_organizationId_companyName_idx" ON "ClientProspect"("organizationId", "companyName");

-- CreateIndex
CREATE UNIQUE INDEX "KycPackage_prospectId_key" ON "KycPackage"("prospectId");

-- CreateIndex
CREATE INDEX "KycPackage_prospectId_idx" ON "KycPackage"("prospectId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientRiskAssessment_prospectId_key" ON "ClientRiskAssessment"("prospectId");

-- CreateIndex
CREATE INDEX "ClientRiskAssessment_prospectId_idx" ON "ClientRiskAssessment"("prospectId");

-- CreateIndex
CREATE INDEX "ClientRiskAssessment_status_idx" ON "ClientRiskAssessment"("status");

-- CreateIndex
CREATE INDEX "AcceptanceDecision_prospectId_idx" ON "AcceptanceDecision"("prospectId");

-- CreateIndex
CREATE INDEX "ContinuanceReview_clientId_idx" ON "ContinuanceReview"("clientId");

-- CreateIndex
CREATE INDEX "ContinuanceReview_organizationId_status_idx" ON "ContinuanceReview"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ContinuanceReview_organizationId_reviewYear_idx" ON "ContinuanceReview"("organizationId", "reviewYear");

-- CreateIndex
CREATE INDEX "QualitySystemEvaluation_organizationId_year_idx" ON "QualitySystemEvaluation"("organizationId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "QualitySystemEvaluation_organizationId_year_key" ON "QualitySystemEvaluation"("organizationId", "year");

-- CreateIndex
CREATE INDEX "QualityObjective_organizationId_idx" ON "QualityObjective"("organizationId");

-- CreateIndex
CREATE INDEX "QualityObjective_status_idx" ON "QualityObjective"("status");

-- CreateIndex
CREATE INDEX "QualityRisk_organizationId_idx" ON "QualityRisk"("organizationId");

-- CreateIndex
CREATE INDEX "QualityRisk_objectiveId_idx" ON "QualityRisk"("objectiveId");

-- CreateIndex
CREATE INDEX "QualityRisk_riskCategory_status_idx" ON "QualityRisk"("riskCategory", "status");

-- CreateIndex
CREATE INDEX "QualityResponse_organizationId_idx" ON "QualityResponse"("organizationId");

-- CreateIndex
CREATE INDEX "QualityResponse_riskId_idx" ON "QualityResponse"("riskId");

-- CreateIndex
CREATE INDEX "QualityResponse_implementationStatus_idx" ON "QualityResponse"("implementationStatus");

-- CreateIndex
CREATE INDEX "QualityFinding_organizationId_idx" ON "QualityFinding"("organizationId");

-- CreateIndex
CREATE INDEX "QualityFinding_severity_status_idx" ON "QualityFinding"("severity", "status");

-- CreateIndex
CREATE UNIQUE INDEX "QualityRemediation_findingId_key" ON "QualityRemediation"("findingId");

-- CreateIndex
CREATE INDEX "QualityRemediation_organizationId_idx" ON "QualityRemediation"("organizationId");

-- CreateIndex
CREATE INDEX "QualityRemediation_findingId_idx" ON "QualityRemediation"("findingId");

-- CreateIndex
CREATE INDEX "QualityRemediation_status_idx" ON "QualityRemediation"("status");

-- CreateIndex
CREATE INDEX "QualityMonitoringActivity_organizationId_idx" ON "QualityMonitoringActivity"("organizationId");

-- CreateIndex
CREATE INDEX "QualityMonitoringActivity_activityType_status_idx" ON "QualityMonitoringActivity"("activityType", "status");

-- CreateIndex
CREATE INDEX "IndependenceRegister_organizationId_status_idx" ON "IndependenceRegister"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "IndependenceRegister_organizationId_entityId_key" ON "IndependenceRegister"("organizationId", "entityId");

-- CreateIndex
CREATE INDEX "IndependenceThreat_registerId_idx" ON "IndependenceThreat"("registerId");

-- CreateIndex
CREATE INDEX "IndependenceThreat_threatCategory_status_idx" ON "IndependenceThreat"("threatCategory", "status");

-- CreateIndex
CREATE INDEX "IndependenceSafeguard_threatId_idx" ON "IndependenceSafeguard"("threatId");

-- CreateIndex
CREATE INDEX "EmploymentRelationship_registerId_idx" ON "EmploymentRelationship"("registerId");

-- CreateIndex
CREATE INDEX "FinancialInterest_registerId_idx" ON "FinancialInterest"("registerId");

-- CreateIndex
CREATE INDEX "AnnualIndependenceConfirmation_organizationId_year_idx" ON "AnnualIndependenceConfirmation"("organizationId", "year");

-- CreateIndex
CREATE INDEX "AnnualIndependenceConfirmation_registerId_idx" ON "AnnualIndependenceConfirmation"("registerId");

-- CreateIndex
CREATE UNIQUE INDEX "AnnualIndependenceConfirmation_registerId_year_key" ON "AnnualIndependenceConfirmation"("registerId", "year");

-- CreateIndex
CREATE INDEX "KnowledgePattern_organizationId_patternType_isActive_idx" ON "KnowledgePattern"("organizationId", "patternType", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgePattern_organizationId_patternType_patternKey_key" ON "KnowledgePattern"("organizationId", "patternType", "patternKey");

-- CreateIndex
CREATE INDEX "KnowledgeRecommendation_engagementId_status_idx" ON "KnowledgeRecommendation"("engagementId", "status");

-- CreateIndex
CREATE INDEX "KnowledgeRecommendation_patternId_idx" ON "KnowledgeRecommendation"("patternId");

-- CreateIndex
CREATE INDEX "IndustryBenchmark_organizationId_industry_idx" ON "IndustryBenchmark"("organizationId", "industry");

-- CreateIndex
CREATE UNIQUE INDEX "IndustryBenchmark_organizationId_industry_benchmarkType_met_key" ON "IndustryBenchmark"("organizationId", "industry", "benchmarkType", "metricName");

-- CreateIndex
CREATE UNIQUE INDEX "EngagementProfile_organizationId_engagementId_key" ON "EngagementProfile"("organizationId", "engagementId");

-- CreateIndex
CREATE INDEX "MaterialityBenchmark_engagementId_idx" ON "MaterialityBenchmark"("engagementId");

-- CreateIndex
CREATE INDEX "PlanningMateriality_engagementId_idx" ON "PlanningMateriality"("engagementId");

-- CreateIndex
CREATE INDEX "PlanningMateriality_engagementId_version_idx" ON "PlanningMateriality"("engagementId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceMateriality_planningMaterialityId_key" ON "PerformanceMateriality"("planningMaterialityId");

-- CreateIndex
CREATE INDEX "PerformanceMateriality_engagementId_idx" ON "PerformanceMateriality"("engagementId");

-- CreateIndex
CREATE UNIQUE INDEX "TrivialThreshold_planningMaterialityId_key" ON "TrivialThreshold"("planningMaterialityId");

-- CreateIndex
CREATE INDEX "TrivialThreshold_planningMaterialityId_idx" ON "TrivialThreshold"("planningMaterialityId");

-- CreateIndex
CREATE INDEX "TrivialThreshold_engagementId_idx" ON "TrivialThreshold"("engagementId");

-- CreateIndex
CREATE INDEX "MaterialityOverride_engagementId_idx" ON "MaterialityOverride"("engagementId");

-- CreateIndex
CREATE INDEX "MaterialityOverride_organizationId_idx" ON "MaterialityOverride"("organizationId");

-- CreateIndex
CREATE INDEX "ReviewNote_engagementId_idx" ON "ReviewNote"("engagementId");

-- CreateIndex
CREATE INDEX "ReviewNote_engagementId_status_idx" ON "ReviewNote"("engagementId", "status");

-- CreateIndex
CREATE INDEX "ReviewNote_engagementId_priority_idx" ON "ReviewNote"("engagementId", "priority");

-- CreateIndex
CREATE INDEX "ReviewNoteEscalation_reviewNoteId_idx" ON "ReviewNoteEscalation"("reviewNoteId");

-- CreateIndex
CREATE INDEX "SamplingPlan_organizationId_engagementId_idx" ON "SamplingPlan"("organizationId", "engagementId");

-- CreateIndex
CREATE INDEX "SamplingPlan_organizationId_status_idx" ON "SamplingPlan"("organizationId", "status");

-- CreateIndex
CREATE INDEX "SamplingResult_planId_idx" ON "SamplingResult"("planId");

-- CreateIndex
CREATE INDEX "SamplingResult_organizationId_idx" ON "SamplingResult"("organizationId");

-- CreateIndex
CREATE INDEX "SamplingReview_planId_idx" ON "SamplingReview"("planId");

-- CreateIndex
CREATE INDEX "SamplingReview_planId_status_idx" ON "SamplingReview"("planId", "status");

-- CreateIndex
CREATE INDEX "SamplingReview_organizationId_idx" ON "SamplingReview"("organizationId");

-- CreateIndex
CREATE INDEX "SamplingEvidence_planId_itemIndex_idx" ON "SamplingEvidence"("planId", "itemIndex");

-- CreateIndex
CREATE INDEX "SamplingEvidence_planId_idx" ON "SamplingEvidence"("planId");

-- CreateIndex
CREATE INDEX "SamplingEvidence_organizationId_idx" ON "SamplingEvidence"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticalReviewPaper_workingPaperIndexId_key" ON "AnalyticalReviewPaper"("workingPaperIndexId");

-- CreateIndex
CREATE INDEX "AnalyticalReviewPaper_engagementId_idx" ON "AnalyticalReviewPaper"("engagementId");

-- CreateIndex
CREATE INDEX "AnalyticalReviewPaper_workingPaperIndexId_idx" ON "AnalyticalReviewPaper"("workingPaperIndexId");

-- CreateIndex
CREATE UNIQUE INDEX "ControlTestingPaper_workingPaperIndexId_key" ON "ControlTestingPaper"("workingPaperIndexId");

-- CreateIndex
CREATE INDEX "ControlTestingPaper_engagementId_idx" ON "ControlTestingPaper"("engagementId");

-- CreateIndex
CREATE INDEX "ControlTestingPaper_workingPaperIndexId_idx" ON "ControlTestingPaper"("workingPaperIndexId");

-- CreateIndex
CREATE UNIQUE INDEX "SubstantiveTestingPaper_workingPaperIndexId_key" ON "SubstantiveTestingPaper"("workingPaperIndexId");

-- CreateIndex
CREATE INDEX "SubstantiveTestingPaper_engagementId_idx" ON "SubstantiveTestingPaper"("engagementId");

-- CreateIndex
CREATE INDEX "SubstantiveTestingPaper_workingPaperIndexId_idx" ON "SubstantiveTestingPaper"("workingPaperIndexId");

-- CreateIndex
CREATE UNIQUE INDEX "CompletionPaper_workingPaperIndexId_key" ON "CompletionPaper"("workingPaperIndexId");

-- CreateIndex
CREATE INDEX "CompletionPaper_engagementId_idx" ON "CompletionPaper"("engagementId");

-- CreateIndex
CREATE INDEX "CompletionPaper_workingPaperIndexId_idx" ON "CompletionPaper"("workingPaperIndexId");

-- CreateIndex
CREATE INDEX "AuditRiskModel_organizationId_isActive_idx" ON "AuditRiskModel"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "AuditRiskAssessment_modelId_idx" ON "AuditRiskAssessment"("modelId");

-- CreateIndex
CREATE INDEX "AuditRiskAssessment_organizationId_engagementId_idx" ON "AuditRiskAssessment"("organizationId", "engagementId");

-- CreateIndex
CREATE INDEX "AuditRiskAssessment_organizationId_status_idx" ON "AuditRiskAssessment"("organizationId", "status");

-- CreateIndex
CREATE INDEX "AuditRiskProcedure_assessmentId_idx" ON "AuditRiskProcedure"("assessmentId");

-- CreateIndex
CREATE INDEX "AuditRiskProcedure_organizationId_status_idx" ON "AuditRiskProcedure"("organizationId", "status");

-- CreateIndex
CREATE INDEX "LcWorkbook_projectId_status_idx" ON "LcWorkbook"("projectId", "status");

-- CreateIndex
CREATE INDEX "LcWorkbook_projectId_createdAt_idx" ON "LcWorkbook"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "LcWorkbookLine_workbookId_section_idx" ON "LcWorkbookLine"("workbookId", "section");

-- CreateIndex
CREATE INDEX "LcWorkbookLine_workbookId_displayOrder_idx" ON "LcWorkbookLine"("workbookId", "displayOrder");

-- CreateIndex
CREATE INDEX "LcWorkbookLine_workbookId_autoFilled_idx" ON "LcWorkbookLine"("workbookId", "autoFilled");

-- CreateIndex
CREATE INDEX "LcWorkbookLine_workbookId_confidence_idx" ON "LcWorkbookLine"("workbookId", "confidence");

-- CreateIndex
CREATE INDEX "LcDataRequest_workbookId_status_idx" ON "LcDataRequest"("workbookId", "status");

-- CreateIndex
CREATE INDEX "LcDataRequest_workbookId_createdAt_idx" ON "LcDataRequest"("workbookId", "createdAt");

-- CreateIndex
CREATE INDEX "LcDataRequestItem_requestId_category_idx" ON "LcDataRequestItem"("requestId", "category");

-- CreateIndex
CREATE INDEX "LcDataRequestItem_requestId_status_idx" ON "LcDataRequestItem"("requestId", "status");

-- CreateIndex
CREATE INDEX "LcDataRequestItem_lineId_idx" ON "LcDataRequestItem"("lineId");

-- CreateIndex
CREATE INDEX "LcPatternSuggestion_organizationId_status_idx" ON "LcPatternSuggestion"("organizationId", "status");

-- CreateIndex
CREATE INDEX "LcPatternSuggestion_organizationId_workbookLineCode_idx" ON "LcPatternSuggestion"("organizationId", "workbookLineCode");

-- CreateIndex
CREATE INDEX "LcPatternSuggestion_organizationId_createdAt_idx" ON "LcPatternSuggestion"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "LcMatchReview_organizationId_riskLevel_idx" ON "LcMatchReview"("organizationId", "riskLevel");

-- CreateIndex
CREATE INDEX "LcMatchReview_organizationId_status_idx" ON "LcMatchReview"("organizationId", "status");

-- CreateIndex
CREATE INDEX "LcMatchReview_organizationId_workbookLineCode_idx" ON "LcMatchReview"("organizationId", "workbookLineCode");

-- CreateIndex
CREATE INDEX "LcMatchReview_organizationId_accountCode_idx" ON "LcMatchReview"("organizationId", "accountCode");

-- CreateIndex
CREATE INDEX "LcIndustryPatternMemory_industry_idx" ON "LcIndustryPatternMemory"("industry");

-- CreateIndex
CREATE INDEX "LcIndustryPatternMemory_workbookLineCode_idx" ON "LcIndustryPatternMemory"("workbookLineCode");

-- CreateIndex
CREATE UNIQUE INDEX "LcIndustryPatternMemory_industry_workbookLineCode_pattern_key" ON "LcIndustryPatternMemory"("industry", "workbookLineCode", "pattern");

-- CreateIndex
CREATE INDEX "LcOrganizationMatchMemory_organizationId_idx" ON "LcOrganizationMatchMemory"("organizationId");

-- CreateIndex
CREATE INDEX "LcOrganizationMatchMemory_organizationId_workbookLineCode_idx" ON "LcOrganizationMatchMemory"("organizationId", "workbookLineCode");

-- CreateIndex
CREATE UNIQUE INDEX "LcOrganizationMatchMemory_organizationId_workbookLineCode_a_key" ON "LcOrganizationMatchMemory"("organizationId", "workbookLineCode", "accountCode");

-- CreateIndex
CREATE INDEX "LcAiAuditEvent_organizationId_action_idx" ON "LcAiAuditEvent"("organizationId", "action");

-- CreateIndex
CREATE INDEX "LcAiAuditEvent_organizationId_workbookId_idx" ON "LcAiAuditEvent"("organizationId", "workbookId");

-- CreateIndex
CREATE INDEX "LcAiAuditEvent_organizationId_createdAt_idx" ON "LcAiAuditEvent"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "LcRecommendation_organizationId_workbookId_category_idx" ON "LcRecommendation"("organizationId", "workbookId", "category");

-- CreateIndex
CREATE INDEX "LcRecommendation_organizationId_workbookId_priority_idx" ON "LcRecommendation"("organizationId", "workbookId", "priority");

-- CreateIndex
CREATE INDEX "LcRecommendation_organizationId_workbookId_status_idx" ON "LcRecommendation"("organizationId", "workbookId", "status");

-- CreateIndex
CREATE INDEX "LcRecommendation_organizationId_source_idx" ON "LcRecommendation"("organizationId", "source");

-- CreateIndex
CREATE INDEX "LcSimulationResult_organizationId_workbookId_scenarioType_idx" ON "LcSimulationResult"("organizationId", "workbookId", "scenarioType");

-- CreateIndex
CREATE INDEX "LcSimulationResult_organizationId_workbookId_createdAt_idx" ON "LcSimulationResult"("organizationId", "workbookId", "createdAt");

-- CreateIndex
CREATE INDEX "LcAiReviewRun_organizationId_workbookId_idx" ON "LcAiReviewRun"("organizationId", "workbookId");

-- CreateIndex
CREATE INDEX "LcAiReviewRun_organizationId_workbookId_status_idx" ON "LcAiReviewRun"("organizationId", "workbookId", "status");

-- CreateIndex
CREATE INDEX "LcAiReviewRun_organizationId_createdAt_idx" ON "LcAiReviewRun"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "LcPatternHealthRecord_organizationId_workbookLineCode_idx" ON "LcPatternHealthRecord"("organizationId", "workbookLineCode");

-- CreateIndex
CREATE INDEX "LcPatternHealthRecord_organizationId_healthScore_idx" ON "LcPatternHealthRecord"("organizationId", "healthScore");

-- CreateIndex
CREATE INDEX "LcPatternHealthRecord_organizationId_status_idx" ON "LcPatternHealthRecord"("organizationId", "status");

-- CreateIndex
CREATE INDEX "LcPatternHealthRecord_organizationId_workbookLineCode_statu_idx" ON "LcPatternHealthRecord"("organizationId", "workbookLineCode", "status");

-- CreateIndex
CREATE INDEX "LcRecommendationOutcome_organizationId_recommendationId_idx" ON "LcRecommendationOutcome"("organizationId", "recommendationId");

-- CreateIndex
CREATE INDEX "LcRecommendationOutcome_organizationId_workbookId_idx" ON "LcRecommendationOutcome"("organizationId", "workbookId");

-- CreateIndex
CREATE INDEX "LcRecommendationOutcome_organizationId_accuracyScore_idx" ON "LcRecommendationOutcome"("organizationId", "accuracyScore");

-- CreateIndex
CREATE INDEX "LocalContact_organizationId_exportStatus_idx" ON "LocalContact"("organizationId", "exportStatus");

-- AddForeignKey
ALTER TABLE "ContactExportRequest" ADD CONSTRAINT "ContactExportRequest_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "LocalContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntelligenceGraphEdge" ADD CONSTRAINT "IntelligenceGraphEdge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "IntelligenceGraphNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntelligenceGraphEdge" ADD CONSTRAINT "IntelligenceGraphEdge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "IntelligenceGraphNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmConnection" ADD CONSTRAINT "CrmConnection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmSyncLog" ADD CONSTRAINT "CrmSyncLog_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "CrmConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErpConnection" ADD CONSTRAINT "ErpConnection_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErpSyncLog" ADD CONSTRAINT "ErpSyncLog_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "ErpConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErpImportBatch" ADD CONSTRAINT "ErpImportBatch_connectionId_fkey" FOREIGN KEY ("connectionId") REFERENCES "ErpConnection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErpImportBatch" ADD CONSTRAINT "ErpImportBatch_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErpImportBatch" ADD CONSTRAINT "ErpImportBatch_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeparationOfDutyRule" ADD CONSTRAINT "SeparationOfDutyRule_roleAId_fkey" FOREIGN KEY ("roleAId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeparationOfDutyRule" ADD CONSTRAINT "SeparationOfDutyRule_roleBId_fkey" FOREIGN KEY ("roleBId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoDConflict" ADD CONSTRAINT "SoDConflict_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "SeparationOfDutyRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HashChainEntry" ADD CONSTRAINT "HashChainEntry_auditLogId_fkey" FOREIGN KEY ("auditLogId") REFERENCES "PlatformAuditLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbacPolicy" ADD CONSTRAINT "AbacPolicy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbacPolicyCondition" ADD CONSTRAINT "AbacPolicyCondition_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "AbacPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbacPolicyAssignment" ADD CONSTRAINT "AbacPolicyAssignment_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "AbacPolicy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionEscalationRule" ADD CONSTRAINT "DecisionEscalationRule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiCrossProductSession" ADD CONSTRAINT "AiCrossProductSession_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiModelRegistry" ADD CONSTRAINT "AiModelRegistry_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiModelDeployment" ADD CONSTRAINT "AiModelDeployment_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModelRegistry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiModelGovernanceReview" ADD CONSTRAINT "AiModelGovernanceReview_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AiModelRegistry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProspect" ADD CONSTRAINT "ClientProspect_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KycPackage" ADD CONSTRAINT "KycPackage_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "ClientProspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientRiskAssessment" ADD CONSTRAINT "ClientRiskAssessment_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "ClientProspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AcceptanceDecision" ADD CONSTRAINT "AcceptanceDecision_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "ClientProspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualitySystemEvaluation" ADD CONSTRAINT "QualitySystemEvaluation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityRisk" ADD CONSTRAINT "QualityRisk_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "QualityObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityResponse" ADD CONSTRAINT "QualityResponse_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "QualityRisk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityFinding" ADD CONSTRAINT "QualityFinding_monitoringActivityId_fkey" FOREIGN KEY ("monitoringActivityId") REFERENCES "QualityMonitoringActivity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityRemediation" ADD CONSTRAINT "QualityRemediation_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "QualityFinding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndependenceRegister" ADD CONSTRAINT "IndependenceRegister_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndependenceThreat" ADD CONSTRAINT "IndependenceThreat_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "IndependenceRegister"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndependenceSafeguard" ADD CONSTRAINT "IndependenceSafeguard_threatId_fkey" FOREIGN KEY ("threatId") REFERENCES "IndependenceThreat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmploymentRelationship" ADD CONSTRAINT "EmploymentRelationship_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "IndependenceRegister"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialInterest" ADD CONSTRAINT "FinancialInterest_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "IndependenceRegister"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnnualIndependenceConfirmation" ADD CONSTRAINT "AnnualIndependenceConfirmation_registerId_fkey" FOREIGN KEY ("registerId") REFERENCES "IndependenceRegister"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgePattern" ADD CONSTRAINT "KnowledgePattern_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeRecommendation" ADD CONSTRAINT "KnowledgeRecommendation_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "KnowledgePattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndustryBenchmark" ADD CONSTRAINT "IndustryBenchmark_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngagementProfile" ADD CONSTRAINT "EngagementProfile_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanningMateriality" ADD CONSTRAINT "PlanningMateriality_benchmarkId_fkey" FOREIGN KEY ("benchmarkId") REFERENCES "MaterialityBenchmark"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceMateriality" ADD CONSTRAINT "PerformanceMateriality_planningMaterialityId_fkey" FOREIGN KEY ("planningMaterialityId") REFERENCES "PlanningMateriality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrivialThreshold" ADD CONSTRAINT "TrivialThreshold_planningMaterialityId_fkey" FOREIGN KEY ("planningMaterialityId") REFERENCES "PlanningMateriality"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewNoteEscalation" ADD CONSTRAINT "ReviewNoteEscalation_reviewNoteId_fkey" FOREIGN KEY ("reviewNoteId") REFERENCES "ReviewNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SamplingPlan" ADD CONSTRAINT "SamplingPlan_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SamplingResult" ADD CONSTRAINT "SamplingResult_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SamplingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticalReviewPaper" ADD CONSTRAINT "AnalyticalReviewPaper_workingPaperIndexId_fkey" FOREIGN KEY ("workingPaperIndexId") REFERENCES "WorkingPaperIndex"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ControlTestingPaper" ADD CONSTRAINT "ControlTestingPaper_workingPaperIndexId_fkey" FOREIGN KEY ("workingPaperIndexId") REFERENCES "WorkingPaperIndex"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubstantiveTestingPaper" ADD CONSTRAINT "SubstantiveTestingPaper_workingPaperIndexId_fkey" FOREIGN KEY ("workingPaperIndexId") REFERENCES "WorkingPaperIndex"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletionPaper" ADD CONSTRAINT "CompletionPaper_workingPaperIndexId_fkey" FOREIGN KEY ("workingPaperIndexId") REFERENCES "WorkingPaperIndex"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRiskModel" ADD CONSTRAINT "AuditRiskModel_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRiskAssessment" ADD CONSTRAINT "AuditRiskAssessment_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "AuditRiskModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRiskAssessment" ADD CONSTRAINT "AuditRiskAssessment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRiskProcedure" ADD CONSTRAINT "AuditRiskProcedure_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "AuditRiskAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRiskProcedure" ADD CONSTRAINT "AuditRiskProcedure_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcWorkbook" ADD CONSTRAINT "LcWorkbook_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "LocalContentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcWorkbookLine" ADD CONSTRAINT "LcWorkbookLine_workbookId_fkey" FOREIGN KEY ("workbookId") REFERENCES "LcWorkbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcDataRequest" ADD CONSTRAINT "LcDataRequest_workbookId_fkey" FOREIGN KEY ("workbookId") REFERENCES "LcWorkbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcDataRequestItem" ADD CONSTRAINT "LcDataRequestItem_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "LcDataRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LcDataRequestItem" ADD CONSTRAINT "LcDataRequestItem_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "LcWorkbookLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "LocalContactInteraction_organizationId_interactionType_occurred" RENAME TO "LocalContactInteraction_organizationId_interactionType_occu_idx";

-- RenameIndex
ALTER INDEX "ReportingGraphEdge_graphId_edgeType_sourceNodeId_targetNodeId_k" RENAME TO "ReportingGraphEdge_graphId_edgeType_sourceNodeId_targetNode_key";

-- RenameIndex
ALTER INDEX "TBMappingPattern_organizationId_erpMap_idx" RENAME TO "TBMappingPattern_organizationId_erpMap1Label_erpMap2Label_idx";
