-- CreateTable
CREATE TABLE "institutional_memory_events" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sourceProduct" TEXT NOT NULL,
    "sourceEntityId" TEXT NOT NULL,
    "sourceEntityType" TEXT NOT NULL,
    "targetProduct" TEXT NOT NULL,
    "targetEntityId" TEXT NOT NULL,
    "targetEntityType" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutional_memory_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institutional_memory_collections" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "filterCriteria" JSONB NOT NULL DEFAULT '{}',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutional_memory_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentWorkspace" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentItem" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "summary" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'ar',
    "tags" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "contentType" TEXT NOT NULL DEFAULT 'article',
    "version" INTEGER NOT NULL DEFAULT 1,
    "templateId" TEXT,
    "createdById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "approvedById" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "summary" TEXT,
    "tags" TEXT[],
    "metadata" JSONB,
    "changeSummary" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentTemplate" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "bodyTemplate" TEXT NOT NULL,
    "metadataTemplate" JSONB,
    "defaultReviewRoles" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "institutional_memory_events_organizationId_idx" ON "institutional_memory_events"("organizationId");

-- CreateIndex
CREATE INDEX "institutional_memory_events_sourceProduct_sourceEntityId_idx" ON "institutional_memory_events"("sourceProduct", "sourceEntityId");

-- CreateIndex
CREATE INDEX "institutional_memory_events_targetProduct_targetEntityId_idx" ON "institutional_memory_events"("targetProduct", "targetEntityId");

-- CreateIndex
CREATE INDEX "institutional_memory_events_organizationId_eventType_idx" ON "institutional_memory_events"("organizationId", "eventType");

-- CreateIndex
CREATE INDEX "institutional_memory_collections_organizationId_idx" ON "institutional_memory_collections"("organizationId");

-- CreateIndex
CREATE INDEX "institutional_memory_collections_organizationId_createdById_idx" ON "institutional_memory_collections"("organizationId", "createdById");

-- CreateIndex
CREATE INDEX "ContentWorkspace_organizationId_idx" ON "ContentWorkspace"("organizationId");

-- CreateIndex
CREATE INDEX "ContentWorkspace_organizationId_isActive_idx" ON "ContentWorkspace"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "ContentItem_organizationId_idx" ON "ContentItem"("organizationId");

-- CreateIndex
CREATE INDEX "ContentItem_workspaceId_status_idx" ON "ContentItem"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "ContentItem_organizationId_status_idx" ON "ContentItem"("organizationId", "status");

-- CreateIndex
CREATE INDEX "ContentItem_organizationId_contentType_idx" ON "ContentItem"("organizationId", "contentType");

-- CreateIndex
CREATE INDEX "ContentVersion_contentId_idx" ON "ContentVersion"("contentId");

-- CreateIndex
CREATE INDEX "ContentVersion_contentId_version_idx" ON "ContentVersion"("contentId", "version");

-- CreateIndex
CREATE INDEX "ContentTemplate_organizationId_idx" ON "ContentTemplate"("organizationId");

-- CreateIndex
CREATE INDEX "ContentTemplate_organizationId_isActive_idx" ON "ContentTemplate"("organizationId", "isActive");

-- AddForeignKey
ALTER TABLE "institutional_memory_events" ADD CONSTRAINT "institutional_memory_events_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutional_memory_events" ADD CONSTRAINT "institutional_memory_events_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutional_memory_collections" ADD CONSTRAINT "institutional_memory_collections_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutional_memory_collections" ADD CONSTRAINT "institutional_memory_collections_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "institutional_memory_collections" ADD CONSTRAINT "institutional_memory_collections_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "ContentWorkspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentVersion" ADD CONSTRAINT "ContentVersion_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
