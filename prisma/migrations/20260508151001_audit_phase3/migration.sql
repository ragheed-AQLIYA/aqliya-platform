-- CreateTable
CREATE TABLE "AuditOrganization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "jurisdiction" TEXT NOT NULL,
    "regulatoryFramework" TEXT NOT NULL,
    "governanceRules" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AuditOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditUser" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'operator',
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditClient" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "registrationNumber" TEXT,
    "industry" TEXT NOT NULL,
    "reportingFramework" TEXT NOT NULL DEFAULT 'ifrs_for_smes',
    "fiscalPeriodEnd" TEXT NOT NULL DEFAULT '12-31',
    "currencyCode" TEXT NOT NULL DEFAULT 'SAR',
    "status" TEXT NOT NULL DEFAULT 'active',
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "AuditClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEngagement" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "fiscalPeriod" TEXT NOT NULL,
    "engagementType" TEXT NOT NULL DEFAULT 'full_audit',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "team" JSONB,
    "alerts" JSONB,
    "governanceRules" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditEngagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditTrialBalance" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "importTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sourceFile" TEXT NOT NULL,
    "fileHash" TEXT,
    "trustState" TEXT NOT NULL DEFAULT 'pending',
    "totalDebits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "variance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditTrialBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditTrialBalanceLine" (
    "id" TEXT NOT NULL,
    "trialBalanceId" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "debitAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "accountType" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'SAR',

    CONSTRAINT "AuditTrialBalanceLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditCanonicalAccount" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "statementType" TEXT NOT NULL,
    "reportingFramework" TEXT NOT NULL DEFAULT 'ifrs_for_smes',
    "version" TEXT NOT NULL DEFAULT '1.0',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditCanonicalAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditAccountMapping" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "sourceAccountId" TEXT NOT NULL,
    "sourceAccountCode" TEXT NOT NULL,
    "sourceAccountName" TEXT NOT NULL,
    "debitAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "canonicalAccountId" TEXT,
    "confidence" DOUBLE PRECISION,
    "mappingType" TEXT NOT NULL DEFAULT 'ai_suggested',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "statementClassification" TEXT,
    "mappedBy" TEXT,
    "mappedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditAccountMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditFinancialStatement" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "statementType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "lines" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditFinancialStatement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditDisclosureNote" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "noteNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "noteType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "linkedStatementLine" TEXT,
    "missingInformation" JSONB,
    "aiDrafted" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditDisclosureNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvidence" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "fileHash" TEXT,
    "storageKey" TEXT,
    "uploadedBy" TEXT,
    "uploadedAt" TIMESTAMP(3),
    "state" TEXT NOT NULL DEFAULT 'missing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvidenceLink" (
    "id" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "linkType" TEXT NOT NULL DEFAULT 'supports',
    "context" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvidenceLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditFinding" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "findingType" TEXT NOT NULL DEFAULT 'observation',
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "materiality" TEXT NOT NULL DEFAULT 'immaterial',
    "description" TEXT NOT NULL,
    "rootCause" TEXT,
    "impact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "relatedAccountIds" JSONB,
    "relatedEvidenceIds" JSONB,
    "aiSuggested" BOOLEAN NOT NULL DEFAULT false,
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditRecommendation" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "findingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "impactAssessment" TEXT,
    "riskLevel" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'suggested',
    "aiContributed" BOOLEAN NOT NULL DEFAULT false,
    "aiSuggestionId" TEXT,
    "reviewerDecision" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditReviewComment" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewerName" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "requiredAction" TEXT NOT NULL DEFAULT 'none',
    "resolution" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "AuditReviewComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditApprovalRecord" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "approverName" TEXT NOT NULL,
    "approverRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "rationale" TEXT,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditApprovalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditPublicationPackage" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "publishedBy" TEXT,
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditPublicationPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "previousState" TEXT NOT NULL DEFAULT '',
    "newState" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "aiRelated" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditAiOutput" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "suggestionType" TEXT NOT NULL,
    "inputContext" TEXT,
    "outputContent" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION,
    "modelVersion" TEXT,
    "status" TEXT NOT NULL DEFAULT 'suggested',
    "acceptedBy" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "rejectedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditAiOutput_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuditOrganization_slug_key" ON "AuditOrganization"("slug");

-- CreateIndex
CREATE INDEX "AuditUser_organizationId_status_idx" ON "AuditUser"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AuditUser_organizationId_email_key" ON "AuditUser"("organizationId", "email");

-- CreateIndex
CREATE INDEX "AuditClient_organizationId_status_idx" ON "AuditClient"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AuditCanonicalAccount_code_key" ON "AuditCanonicalAccount"("code");

-- CreateIndex
CREATE INDEX "AuditEvent_engagementId_eventType_timestamp_idx" ON "AuditEvent"("engagementId", "eventType", "timestamp");

-- AddForeignKey
ALTER TABLE "AuditUser" ADD CONSTRAINT "AuditUser_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "AuditOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditClient" ADD CONSTRAINT "AuditClient_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "AuditOrganization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEngagement" ADD CONSTRAINT "AuditEngagement_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "AuditClient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditTrialBalance" ADD CONSTRAINT "AuditTrialBalance_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditTrialBalanceLine" ADD CONSTRAINT "AuditTrialBalanceLine_trialBalanceId_fkey" FOREIGN KEY ("trialBalanceId") REFERENCES "AuditTrialBalance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAccountMapping" ADD CONSTRAINT "AuditAccountMapping_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAccountMapping" ADD CONSTRAINT "AuditAccountMapping_canonicalAccountId_fkey" FOREIGN KEY ("canonicalAccountId") REFERENCES "AuditCanonicalAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvidence" ADD CONSTRAINT "AuditEvidence_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvidenceLink" ADD CONSTRAINT "AuditEvidenceLink_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "AuditEvidence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditFinding" ADD CONSTRAINT "AuditFinding_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecommendation" ADD CONSTRAINT "AuditRecommendation_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecommendation" ADD CONSTRAINT "AuditRecommendation_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "AuditFinding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditReviewComment" ADD CONSTRAINT "AuditReviewComment_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditApprovalRecord" ADD CONSTRAINT "AuditApprovalRecord_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditPublicationPackage" ADD CONSTRAINT "AuditPublicationPackage_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditAiOutput" ADD CONSTRAINT "AuditAiOutput_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "AuditEngagement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
