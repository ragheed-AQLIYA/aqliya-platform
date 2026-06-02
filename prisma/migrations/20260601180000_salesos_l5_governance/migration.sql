-- SalesOS L5 — governed proposal / review / approval (relational)
-- Apply: npx prisma migrate deploy

CREATE TABLE "SalesProposal" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "dealId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "title" TEXT,
    "draft" TEXT NOT NULL DEFAULT '',
    "pilotCriteria" TEXT NOT NULL DEFAULT '',
    "evidenceRefs" JSONB,
    "exportReady" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdById" TEXT,
    "updatedById" TEXT,
    "submittedAt" TIMESTAMP(3),
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesProposal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesReview" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "reviewType" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "dealId" TEXT,
    "proposalId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reason" TEXT NOT NULL,
    "stageSlug" TEXT,
    "reviewerId" TEXT NOT NULL,
    "reviewerName" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesReview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesApproval" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "reviewId" TEXT NOT NULL,
    "proposalId" TEXT,
    "dealId" TEXT,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "approverId" TEXT NOT NULL,
    "approverName" TEXT,
    "note" TEXT,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesApproval_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SalesProposal_organizationId_dealId_idx" ON "SalesProposal"("organizationId", "dealId");
CREATE INDEX "SalesProposal_organizationId_status_idx" ON "SalesProposal"("organizationId", "status");
CREATE INDEX "SalesProposal_platformOrganizationId_updatedAt_idx" ON "SalesProposal"("platformOrganizationId", "updatedAt");

CREATE INDEX "SalesReview_organizationId_createdAt_idx" ON "SalesReview"("organizationId", "createdAt");
CREATE INDEX "SalesReview_organizationId_status_idx" ON "SalesReview"("organizationId", "status");
CREATE INDEX "SalesReview_targetType_targetId_idx" ON "SalesReview"("targetType", "targetId");
CREATE INDEX "SalesReview_dealId_idx" ON "SalesReview"("dealId");
CREATE INDEX "SalesReview_proposalId_idx" ON "SalesReview"("proposalId");

CREATE INDEX "SalesApproval_organizationId_createdAt_idx" ON "SalesApproval"("organizationId", "createdAt");
CREATE INDEX "SalesApproval_reviewId_idx" ON "SalesApproval"("reviewId");
CREATE INDEX "SalesApproval_dealId_idx" ON "SalesApproval"("dealId");
CREATE INDEX "SalesApproval_proposalId_idx" ON "SalesApproval"("proposalId");

ALTER TABLE "SalesProposal" ADD CONSTRAINT "SalesProposal_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "SalesDeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesReview" ADD CONSTRAINT "SalesReview_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "SalesDeal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SalesReview" ADD CONSTRAINT "SalesReview_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "SalesProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SalesApproval" ADD CONSTRAINT "SalesApproval_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "SalesReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesApproval" ADD CONSTRAINT "SalesApproval_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "SalesProposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SalesApproval" ADD CONSTRAINT "SalesApproval_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "SalesDeal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
