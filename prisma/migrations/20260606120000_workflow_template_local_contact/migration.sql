-- WorkflowOS template/record layer + LocalContactOS v0.1 tables

CREATE TABLE "WorkflowTemplate" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "status" TEXT NOT NULL DEFAULT 'active',
    "steps" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WorkflowRecord" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "currentStep" INTEGER NOT NULL DEFAULT 0,
    "steps" JSONB NOT NULL DEFAULT '[]',
    "stepResults" JSONB NOT NULL DEFAULT '{}',
    "assignedToId" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkflowRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LocalContact" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" TEXT,
    "department" TEXT,
    "organizationName" TEXT,
    "sensitivityLevel" TEXT NOT NULL DEFAULT 'normal',
    "notes" TEXT,
    "tags" JSONB NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalContact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LocalContactRelation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "sourceContactId" TEXT NOT NULL,
    "targetContactId" TEXT NOT NULL,
    "relationType" TEXT NOT NULL,
    "description" TEXT,
    "strength" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalContactRelation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LocalContactInteraction" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "platformOrganizationId" TEXT,
    "contactId" TEXT NOT NULL,
    "interactionType" TEXT NOT NULL,
    "subject" TEXT,
    "summary" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocalContactInteraction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WorkflowTemplate_organizationId_category_createdAt_idx" ON "WorkflowTemplate"("organizationId", "category", "createdAt");
CREATE INDEX "WorkflowTemplate_platformOrganizationId_createdAt_idx" ON "WorkflowTemplate"("platformOrganizationId", "createdAt");
CREATE INDEX "WorkflowTemplate_status_idx" ON "WorkflowTemplate"("status");

CREATE INDEX "WorkflowRecord_organizationId_status_createdAt_idx" ON "WorkflowRecord"("organizationId", "status", "createdAt");
CREATE INDEX "WorkflowRecord_organizationId_templateId_createdAt_idx" ON "WorkflowRecord"("organizationId", "templateId", "createdAt");
CREATE INDEX "WorkflowRecord_platformOrganizationId_createdAt_idx" ON "WorkflowRecord"("platformOrganizationId", "createdAt");
CREATE INDEX "WorkflowRecord_assignedToId_status_idx" ON "WorkflowRecord"("assignedToId", "status");
CREATE INDEX "WorkflowRecord_dueDate_idx" ON "WorkflowRecord"("dueDate");

CREATE INDEX "LocalContact_organizationId_name_createdAt_idx" ON "LocalContact"("organizationId", "name", "createdAt");
CREATE INDEX "LocalContact_organizationId_sensitivityLevel_idx" ON "LocalContact"("organizationId", "sensitivityLevel");
CREATE INDEX "LocalContact_platformOrganizationId_createdAt_idx" ON "LocalContact"("platformOrganizationId", "createdAt");
CREATE INDEX "LocalContact_email_idx" ON "LocalContact"("email");
CREATE INDEX "LocalContact_isActive_idx" ON "LocalContact"("isActive");

CREATE INDEX "LocalContactRelation_organizationId_relationType_idx" ON "LocalContactRelation"("organizationId", "relationType");
CREATE INDEX "LocalContactRelation_sourceContactId_targetContactId_idx" ON "LocalContactRelation"("sourceContactId", "targetContactId");
CREATE INDEX "LocalContactRelation_platformOrganizationId_createdAt_idx" ON "LocalContactRelation"("platformOrganizationId", "createdAt");

CREATE INDEX "LocalContactInteraction_organizationId_contactId_occurredAt_idx" ON "LocalContactInteraction"("organizationId", "contactId", "occurredAt");
CREATE INDEX "LocalContactInteraction_organizationId_interactionType_occurredAt_idx" ON "LocalContactInteraction"("organizationId", "interactionType", "occurredAt");
CREATE INDEX "LocalContactInteraction_platformOrganizationId_createdAt_idx" ON "LocalContactInteraction"("platformOrganizationId", "createdAt");

ALTER TABLE "WorkflowRecord" ADD CONSTRAINT "WorkflowRecord_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WorkflowTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LocalContactRelation" ADD CONSTRAINT "LocalContactRelation_sourceContactId_fkey" FOREIGN KEY ("sourceContactId") REFERENCES "LocalContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LocalContactRelation" ADD CONSTRAINT "LocalContactRelation_targetContactId_fkey" FOREIGN KEY ("targetContactId") REFERENCES "LocalContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LocalContactInteraction" ADD CONSTRAINT "LocalContactInteraction_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "LocalContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
