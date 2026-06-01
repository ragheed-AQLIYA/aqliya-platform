-- CreateTable
CREATE TABLE "ContentStudioProject" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "title" TEXT NOT NULL,
    "objective" TEXT,
    "audience" TEXT,
    "language" TEXT NOT NULL DEFAULT 'ar',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentStudioProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentStudioCampaign" (
    "id" TEXT NOT NULL,
    "contentProjectId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "objective" TEXT,
    "audience" TEXT,
    "channels" JSONB NOT NULL DEFAULT '[]',
    "startDate" TEXT,
    "endDate" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentStudioCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentStudioSource" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "campaignId" TEXT,
    "contentItemId" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "note" TEXT,
    "fileRef" TEXT,
    "credibility" TEXT NOT NULL DEFAULT 'unverified',
    "status" TEXT NOT NULL DEFAULT 'proposed',
    "evidenceMetadata" JSONB,
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentStudioSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentStudioItem" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "body" TEXT,
    "sourceRefIds" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'idea',
    "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "reviewRequired" BOOLEAN NOT NULL DEFAULT false,
    "draftAssistMetadata" JSONB,
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentStudioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentStudioReview" (
    "id" TEXT NOT NULL,
    "contentItemId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "dimensions" JSONB NOT NULL DEFAULT '{}',
    "notes" TEXT,
    "reviewerId" TEXT,
    "reviewerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentStudioReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentStudioApproval" (
    "id" TEXT NOT NULL,
    "contentItemId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "notes" TEXT,
    "approverId" TEXT,
    "approverName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentStudioApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentStudioOutput" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "includes" JSONB NOT NULL,
    "exportMetadata" JSONB,
    "exportedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentStudioOutput_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentStudioProject_organizationId_idx" ON "ContentStudioProject"("organizationId");

-- CreateIndex
CREATE INDEX "ContentStudioProject_organizationId_status_idx" ON "ContentStudioProject"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ContentStudioProject_status_idx" ON "ContentStudioProject"("status");

-- CreateIndex
CREATE INDEX "ContentStudioCampaign_organizationId_idx" ON "ContentStudioCampaign"("organizationId");

-- CreateIndex
CREATE INDEX "ContentStudioCampaign_contentProjectId_idx" ON "ContentStudioCampaign"("contentProjectId");

-- CreateIndex
CREATE INDEX "ContentStudioCampaign_organizationId_status_idx" ON "ContentStudioCampaign"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ContentStudioCampaign_status_idx" ON "ContentStudioCampaign"("status");

-- CreateIndex
CREATE INDEX "ContentStudioSource_organizationId_idx" ON "ContentStudioSource"("organizationId");

-- CreateIndex
CREATE INDEX "ContentStudioSource_campaignId_idx" ON "ContentStudioSource"("campaignId");

-- CreateIndex
CREATE INDEX "ContentStudioSource_contentItemId_idx" ON "ContentStudioSource"("contentItemId");

-- CreateIndex
CREATE INDEX "ContentStudioSource_organizationId_status_idx" ON "ContentStudioSource"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ContentStudioSource_status_idx" ON "ContentStudioSource"("status");

-- CreateIndex
CREATE INDEX "ContentStudioItem_organizationId_idx" ON "ContentStudioItem"("organizationId");

-- CreateIndex
CREATE INDEX "ContentStudioItem_campaignId_idx" ON "ContentStudioItem"("campaignId");

-- CreateIndex
CREATE INDEX "ContentStudioItem_organizationId_status_idx" ON "ContentStudioItem"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ContentStudioItem_status_idx" ON "ContentStudioItem"("status");

-- CreateIndex
CREATE INDEX "ContentStudioReview_organizationId_idx" ON "ContentStudioReview"("organizationId");

-- CreateIndex
CREATE INDEX "ContentStudioReview_contentItemId_idx" ON "ContentStudioReview"("contentItemId");

-- CreateIndex
CREATE INDEX "ContentStudioReview_organizationId_status_idx" ON "ContentStudioReview"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ContentStudioReview_status_idx" ON "ContentStudioReview"("status");

-- CreateIndex
CREATE INDEX "ContentStudioApproval_organizationId_idx" ON "ContentStudioApproval"("organizationId");

-- CreateIndex
CREATE INDEX "ContentStudioApproval_contentItemId_idx" ON "ContentStudioApproval"("contentItemId");

-- CreateIndex
CREATE INDEX "ContentStudioOutput_organizationId_idx" ON "ContentStudioOutput"("organizationId");

-- CreateIndex
CREATE INDEX "ContentStudioOutput_campaignId_idx" ON "ContentStudioOutput"("campaignId");

-- CreateIndex
CREATE INDEX "ContentStudioOutput_organizationId_status_idx" ON "ContentStudioOutput"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ContentStudioOutput_status_idx" ON "ContentStudioOutput"("status");

-- AddForeignKey
ALTER TABLE "ContentStudioCampaign" ADD CONSTRAINT "ContentStudioCampaign_contentProjectId_fkey" FOREIGN KEY ("contentProjectId") REFERENCES "ContentStudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentStudioSource" ADD CONSTRAINT "ContentStudioSource_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ContentStudioCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentStudioSource" ADD CONSTRAINT "ContentStudioSource_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentStudioItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentStudioItem" ADD CONSTRAINT "ContentStudioItem_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ContentStudioCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentStudioReview" ADD CONSTRAINT "ContentStudioReview_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentStudioItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentStudioApproval" ADD CONSTRAINT "ContentStudioApproval_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentStudioItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentStudioOutput" ADD CONSTRAINT "ContentStudioOutput_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "ContentStudioCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
