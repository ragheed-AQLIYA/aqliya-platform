-- SalesOS P0 core tables (PR-1 schema, PR-2 migration file)
-- Apply: npx prisma migrate deploy  OR  npx prisma migrate dev --name salesos_p0_core (human)

-- CreateTable
CREATE TABLE "SalesPipeline" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesPipeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesPipelineStage" (
    "id" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesPipelineStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesAccount" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "industry" TEXT,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesDeal" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "accountId" TEXT NOT NULL,
    "stageId" TEXT,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "amount" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "probability" DOUBLE PRECISION,
    "expectedCloseDate" TIMESTAMP(3),
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesAuditEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalesAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SalesPipeline_organizationId_slug_key" ON "SalesPipeline"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "SalesPipeline_organizationId_createdAt_idx" ON "SalesPipeline"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "SalesPipeline_platformOrganizationId_createdAt_idx" ON "SalesPipeline"("platformOrganizationId", "createdAt");

-- CreateIndex
CREATE INDEX "SalesPipeline_status_idx" ON "SalesPipeline"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SalesPipelineStage_pipelineId_slug_key" ON "SalesPipelineStage"("pipelineId", "slug");

-- CreateIndex
CREATE INDEX "SalesPipelineStage_pipelineId_sortOrder_idx" ON "SalesPipelineStage"("pipelineId", "sortOrder");

-- CreateIndex
CREATE INDEX "SalesPipelineStage_organizationId_idx" ON "SalesPipelineStage"("organizationId");

-- CreateIndex
CREATE INDEX "SalesPipelineStage_platformOrganizationId_idx" ON "SalesPipelineStage"("platformOrganizationId");

-- CreateIndex
CREATE INDEX "SalesAccount_organizationId_createdAt_idx" ON "SalesAccount"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "SalesAccount_platformOrganizationId_createdAt_idx" ON "SalesAccount"("platformOrganizationId", "createdAt");

-- CreateIndex
CREATE INDEX "SalesAccount_organizationId_isDemo_idx" ON "SalesAccount"("organizationId", "isDemo");

-- CreateIndex
CREATE INDEX "SalesAccount_status_idx" ON "SalesAccount"("status");

-- CreateIndex
CREATE INDEX "SalesDeal_organizationId_status_createdAt_idx" ON "SalesDeal"("organizationId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "SalesDeal_organizationId_updatedAt_idx" ON "SalesDeal"("organizationId", "updatedAt");

-- CreateIndex
CREATE INDEX "SalesDeal_accountId_idx" ON "SalesDeal"("accountId");

-- CreateIndex
CREATE INDEX "SalesDeal_stageId_idx" ON "SalesDeal"("stageId");

-- CreateIndex
CREATE INDEX "SalesDeal_platformOrganizationId_updatedAt_idx" ON "SalesDeal"("platformOrganizationId", "updatedAt");

-- CreateIndex
CREATE INDEX "SalesDeal_isDemo_idx" ON "SalesDeal"("isDemo");

-- CreateIndex
CREATE INDEX "SalesAuditEvent_organizationId_createdAt_idx" ON "SalesAuditEvent"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "SalesAuditEvent_platformOrganizationId_createdAt_idx" ON "SalesAuditEvent"("platformOrganizationId", "createdAt");

-- CreateIndex
CREATE INDEX "SalesAuditEvent_actorId_createdAt_idx" ON "SalesAuditEvent"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "SalesAuditEvent_action_idx" ON "SalesAuditEvent"("action");

-- CreateIndex
CREATE INDEX "SalesAuditEvent_targetType_targetId_idx" ON "SalesAuditEvent"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "SalesAuditEvent_createdAt_idx" ON "SalesAuditEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "SalesPipelineStage" ADD CONSTRAINT "SalesPipelineStage_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "SalesPipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDeal" ADD CONSTRAINT "SalesDeal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "SalesAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesDeal" ADD CONSTRAINT "SalesDeal_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "SalesPipelineStage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
