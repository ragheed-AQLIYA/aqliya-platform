-- Create KnowledgeFoundationVersion model
CREATE TABLE "KnowledgeFoundationVersion" (
    "id" TEXT NOT NULL,
    "versionNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "artifactPath" TEXT,
    "candidateCount" INTEGER NOT NULL DEFAULT 0,
    "rollbackVersionId" TEXT,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "activatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    CONSTRAINT "KnowledgeFoundationVersion_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "KnowledgeFoundationVersion_versionNumber_key" UNIQUE ("versionNumber")
);

-- Create KnowledgeFoundationRelease model
CREATE TABLE "KnowledgeFoundationRelease" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "releaseNotes" TEXT,
    "changeSummary" JSONB,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "KnowledgeFoundationRelease_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "KnowledgeFoundationRelease_versionId_key" UNIQUE ("versionId")
);

-- Create KnowledgeFoundationDiff model
CREATE TABLE "KnowledgeFoundationDiff" (
    "id" TEXT NOT NULL,
    "fromVersionId" TEXT NOT NULL,
    "toVersionId" TEXT NOT NULL,
    "addedRules" JSONB NOT NULL DEFAULT '[]',
    "modifiedRules" JSONB NOT NULL DEFAULT '[]',
    "removedRules" JSONB NOT NULL DEFAULT '[]',
    "riskScore" REAL NOT NULL DEFAULT 0.0,
    "breakingChange" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "KnowledgeFoundationDiff_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "KnowledgeFoundationDiff_fromVersionId_toVersionId_key" UNIQUE ("fromVersionId", "toVersionId")
);

-- Create indexes for KnowledgeFoundation tables
CREATE INDEX "KnowledgeFoundationVersion_status_idx" ON "KnowledgeFoundationVersion"("status");
CREATE INDEX "KnowledgeFoundationVersion_versionNumber_idx" ON "KnowledgeFoundationVersion"("versionNumber");
CREATE INDEX "KnowledgeFoundationVersion_createdById_idx" ON "KnowledgeFoundationVersion"("createdById");
CREATE INDEX "KnowledgeFoundationVersion_approvedById_idx" ON "KnowledgeFoundationVersion"("approvedById");

CREATE INDEX "KnowledgeFoundationRelease_versionId_idx" ON "KnowledgeFoundationRelease"("versionId");
CREATE INDEX "KnowledgeFoundationRelease_createdById_idx" ON "KnowledgeFoundationRelease"("createdById");
CREATE INDEX "KnowledgeFoundationRelease_approvedById_idx" ON "KnowledgeFoundationRelease"("approvedById");

CREATE INDEX "KnowledgeFoundationDiff_fromVersionId_toVersionId_idx" ON "KnowledgeFoundationDiff"("fromVersionId", "toVersionId");