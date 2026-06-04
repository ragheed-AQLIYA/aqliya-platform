-- Add L5 models: WorkflowAuditEvent, WorkflowEvidence, ContactEvidence, ContactReview, ContactApproval

-- WorkflowOS Audit Events
CREATE TABLE "WorkflowAuditEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "recordId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT,
    "action" TEXT NOT NULL,
    "fromStatus" TEXT,
    "toStatus" TEXT,
    "comment" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkflowAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WorkflowAuditEvent_organizationId_recordId_createdAt_idx" ON "WorkflowAuditEvent"("organizationId", "recordId", "createdAt");
CREATE INDEX "WorkflowAuditEvent_organizationId_actorId_createdAt_idx" ON "WorkflowAuditEvent"("organizationId", "actorId", "createdAt");
CREATE INDEX "WorkflowAuditEvent_platformOrganizationId_createdAt_idx" ON "WorkflowAuditEvent"("platformOrganizationId", "createdAt");

-- WorkflowOS Evidence
CREATE TABLE "WorkflowEvidence" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "recordId" TEXT NOT NULL,
    "stepIndex" INTEGER,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "storageKey" TEXT,
    "fileHash" TEXT,
    "sizeBytes" INTEGER,
    "uploadedById" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkflowEvidence_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WorkflowEvidence_organizationId_recordId_createdAt_idx" ON "WorkflowEvidence"("organizationId", "recordId", "createdAt");
CREATE INDEX "WorkflowEvidence_platformOrganizationId_createdAt_idx" ON "WorkflowEvidence"("platformOrganizationId", "createdAt");

-- LocalContactOS Evidence
CREATE TABLE "ContactEvidence" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "contactId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "storageKey" TEXT,
    "fileHash" TEXT,
    "sizeBytes" INTEGER,
    "description" TEXT,
    "evidenceType" TEXT NOT NULL DEFAULT 'document',
    "uploadedById" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactEvidence_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContactEvidence_organizationId_contactId_createdAt_idx" ON "ContactEvidence"("organizationId", "contactId", "createdAt");
CREATE INDEX "ContactEvidence_platformOrganizationId_createdAt_idx" ON "ContactEvidence"("platformOrganizationId", "createdAt");

ALTER TABLE "ContactEvidence" ADD CONSTRAINT "ContactEvidence_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "LocalContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- LocalContactOS Review
CREATE TABLE "ContactReview" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "contactId" TEXT NOT NULL,
    "reviewType" TEXT NOT NULL DEFAULT 'sensitivity',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewerId" TEXT NOT NULL,
    "reviewerName" TEXT,
    "reason" TEXT,
    "findings" JSONB DEFAULT '[]',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ContactReview_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContactReview_organizationId_contactId_createdAt_idx" ON "ContactReview"("organizationId", "contactId", "createdAt");
CREATE INDEX "ContactReview_organizationId_status_createdAt_idx" ON "ContactReview"("organizationId", "status", "createdAt");
CREATE INDEX "ContactReview_reviewerId_status_idx" ON "ContactReview"("reviewerId", "status");

ALTER TABLE "ContactReview" ADD CONSTRAINT "ContactReview_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "LocalContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- LocalContactOS Approval
CREATE TABLE "ContactApproval" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "reviewId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "approverName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "note" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactApproval_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContactApproval_organizationId_reviewId_idx" ON "ContactApproval"("organizationId", "reviewId");
CREATE INDEX "ContactApproval_approverId_idx" ON "ContactApproval"("approverId");

ALTER TABLE "ContactApproval" ADD CONSTRAINT "ContactApproval_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ContactReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
