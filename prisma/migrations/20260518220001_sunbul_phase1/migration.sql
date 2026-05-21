-- CreateEnum
CREATE TYPE "SunbulUserRole" AS ENUM ('PlatformAdmin', 'Operator', 'Reviewer');

-- CreateEnum
CREATE TYPE "SunbulMembershipStatus" AS ENUM ('Active', 'Suspended');

-- CreateEnum
CREATE TYPE "SunbulRecordStatus" AS ENUM ('Draft', 'UnderReview', 'Approved', 'Archived');

-- CreateEnum
CREATE TYPE "SunbulReviewStatus" AS ENUM ('Pending', 'Approved', 'Returned');

-- CreateEnum
CREATE TYPE "SunbulAuditAction" AS ENUM ('CLIENT_CREATED', 'CLIENT_UPDATED', 'MEMBERSHIP_CREATED', 'RECORD_CREATED', 'RECORD_UPDATED', 'RECORD_SUBMITTED', 'RECORD_APPROVED', 'RECORD_RETURNED', 'RECORD_ARCHIVED', 'REVIEW_CREATED', 'DOCUMENT_CREATED');

-- CreateTable
CREATE TABLE "SunbulClient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SunbulClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SunbulUserMembership" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "SunbulUserRole" NOT NULL DEFAULT 'Operator',
    "status" "SunbulMembershipStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SunbulUserMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SunbulRecord" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'CASE',
    "status" "SunbulRecordStatus" NOT NULL DEFAULT 'Draft',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "createdById" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SunbulRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SunbulDocument" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL DEFAULT 0,
    "storageKey" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SunbulDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SunbulReview" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "status" "SunbulReviewStatus" NOT NULL DEFAULT 'Pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SunbulReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SunbulAuditEvent" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "recordId" TEXT,
    "actorId" TEXT NOT NULL,
    "action" "SunbulAuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SunbulAuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SunbulClient_slug_key" ON "SunbulClient"("slug");

-- CreateIndex
CREATE INDEX "SunbulClient_status_idx" ON "SunbulClient"("status");

-- CreateIndex
CREATE INDEX "SunbulClient_createdAt_idx" ON "SunbulClient"("createdAt");

-- CreateIndex
CREATE INDEX "SunbulUserMembership_clientId_idx" ON "SunbulUserMembership"("clientId");

-- CreateIndex
CREATE INDEX "SunbulUserMembership_userId_idx" ON "SunbulUserMembership"("userId");

-- CreateIndex
CREATE INDEX "SunbulUserMembership_role_idx" ON "SunbulUserMembership"("role");

-- CreateIndex
CREATE UNIQUE INDEX "SunbulUserMembership_clientId_userId_key" ON "SunbulUserMembership"("clientId", "userId");

-- CreateIndex
CREATE INDEX "SunbulRecord_clientId_idx" ON "SunbulRecord"("clientId");

-- CreateIndex
CREATE INDEX "SunbulRecord_status_idx" ON "SunbulRecord"("status");

-- CreateIndex
CREATE INDEX "SunbulRecord_createdById_idx" ON "SunbulRecord"("createdById");

-- CreateIndex
CREATE INDEX "SunbulRecord_createdAt_idx" ON "SunbulRecord"("createdAt");

-- CreateIndex
CREATE INDEX "SunbulDocument_clientId_idx" ON "SunbulDocument"("clientId");

-- CreateIndex
CREATE INDEX "SunbulDocument_recordId_idx" ON "SunbulDocument"("recordId");

-- CreateIndex
CREATE INDEX "SunbulDocument_uploadedById_idx" ON "SunbulDocument"("uploadedById");

-- CreateIndex
CREATE INDEX "SunbulReview_clientId_idx" ON "SunbulReview"("clientId");

-- CreateIndex
CREATE INDEX "SunbulReview_recordId_idx" ON "SunbulReview"("recordId");

-- CreateIndex
CREATE INDEX "SunbulReview_reviewerId_idx" ON "SunbulReview"("reviewerId");

-- CreateIndex
CREATE INDEX "SunbulAuditEvent_clientId_idx" ON "SunbulAuditEvent"("clientId");

-- CreateIndex
CREATE INDEX "SunbulAuditEvent_recordId_idx" ON "SunbulAuditEvent"("recordId");

-- CreateIndex
CREATE INDEX "SunbulAuditEvent_actorId_idx" ON "SunbulAuditEvent"("actorId");

-- CreateIndex
CREATE INDEX "SunbulAuditEvent_action_idx" ON "SunbulAuditEvent"("action");

-- CreateIndex
CREATE INDEX "SunbulAuditEvent_createdAt_idx" ON "SunbulAuditEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "SunbulUserMembership" ADD CONSTRAINT "SunbulUserMembership_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "SunbulClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SunbulRecord" ADD CONSTRAINT "SunbulRecord_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "SunbulClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SunbulDocument" ADD CONSTRAINT "SunbulDocument_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "SunbulClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SunbulDocument" ADD CONSTRAINT "SunbulDocument_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "SunbulRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SunbulReview" ADD CONSTRAINT "SunbulReview_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "SunbulClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SunbulReview" ADD CONSTRAINT "SunbulReview_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "SunbulRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SunbulAuditEvent" ADD CONSTRAINT "SunbulAuditEvent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "SunbulClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
