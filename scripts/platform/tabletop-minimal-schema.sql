-- Phase 29 Tabletop — minimal schema bootstrap (Knowledge Mining + KF alignment)
-- Safe for idempotent re-run on drifted local databases.

DO $$ BEGIN
  CREATE TYPE "KnowledgeCandidateStatus" AS ENUM ('CANDIDATE', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PROMOTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "KnowledgeFoundationVersionStatus" AS ENUM ('DRAFT', 'APPROVED', 'RELEASED', 'ACTIVE', 'DEPRECATED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "KnowledgeFoundationReleaseArtifactStatus" AS ENUM ('PENDING', 'COMPLETE', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "KnowledgeCandidate" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "candidatePhrase" TEXT NOT NULL,
    "canonicalAccountId" TEXT NOT NULL,
    "canonicalCode" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "supportCount" INTEGER NOT NULL DEFAULT 1,
    "organizationCount" INTEGER NOT NULL DEFAULT 1,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" "KnowledgeCandidateStatus" NOT NULL DEFAULT 'CANDIDATE',
    "source" TEXT NOT NULL DEFAULT 'pattern_mining',
    "createdById" TEXT,
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "KnowledgeCandidate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "KnowledgeCandidateEvidence" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "evidenceType" TEXT NOT NULL,
    "evidenceId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "accountName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KnowledgeCandidateEvidence_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "KnowledgePromotionHistory" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "promotedBy" TEXT NOT NULL,
    "promotedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "artifactType" TEXT NOT NULL,
    "artifactPath" TEXT,
    "artifactVersion" TEXT,
    "notes" TEXT,
    CONSTRAINT "KnowledgePromotionHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "KnowledgeCandidate_status_idx" ON "KnowledgeCandidate"("status");
CREATE INDEX IF NOT EXISTS "KnowledgeCandidate_canonicalCode_idx" ON "KnowledgeCandidate"("canonicalCode");
CREATE INDEX IF NOT EXISTS "KnowledgeCandidate_organizationId_idx" ON "KnowledgeCandidate"("organizationId");
CREATE INDEX IF NOT EXISTS "KnowledgeCandidate_supportCount_idx" ON "KnowledgeCandidate"("supportCount");
CREATE INDEX IF NOT EXISTS "KnowledgeCandidate_confidence_idx" ON "KnowledgeCandidate"("confidence");
CREATE INDEX IF NOT EXISTS "KnowledgeCandidate_createdById_idx" ON "KnowledgeCandidate"("createdById");

CREATE INDEX IF NOT EXISTS "KnowledgeCandidateEvidence_candidateId_idx" ON "KnowledgeCandidateEvidence"("candidateId");
CREATE INDEX IF NOT EXISTS "KnowledgeCandidateEvidence_evidenceType_evidenceId_idx" ON "KnowledgeCandidateEvidence"("evidenceType", "evidenceId");
CREATE INDEX IF NOT EXISTS "KnowledgePromotionHistory_candidateId_idx" ON "KnowledgePromotionHistory"("candidateId");
CREATE INDEX IF NOT EXISTS "KnowledgePromotionHistory_artifactType_idx" ON "KnowledgePromotionHistory"("artifactType");

-- KF tables (from migrations; IF NOT EXISTS for partial apply)
CREATE TABLE IF NOT EXISTS "KnowledgeFoundationVersion" (
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
    CONSTRAINT "KnowledgeFoundationVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "KnowledgeFoundationRelease" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "releaseNotes" TEXT,
    "changeSummary" JSONB,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KnowledgeFoundationRelease_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "KnowledgeFoundationDiff" (
    "id" TEXT NOT NULL,
    "fromVersionId" TEXT NOT NULL,
    "toVersionId" TEXT NOT NULL,
    "addedRules" JSONB NOT NULL DEFAULT '[]',
    "modifiedRules" JSONB NOT NULL DEFAULT '[]',
    "removedRules" JSONB NOT NULL DEFAULT '[]',
    "riskScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "breakingChange" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KnowledgeFoundationDiff_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "KnowledgeFoundationVersionCandidate" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "boundById" TEXT NOT NULL,
    "boundAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "includedInRelease" BOOLEAN NOT NULL DEFAULT false,
    "releasedAt" TIMESTAMP(3),
    "notes" TEXT,
    CONSTRAINT "KnowledgeFoundationVersionCandidate_pkey" PRIMARY KEY ("id")
);

-- KF column alignment
ALTER TABLE "KnowledgeFoundationRelease" ADD COLUMN IF NOT EXISTS "manifestPath" TEXT;
ALTER TABLE "KnowledgeFoundationRelease" ADD COLUMN IF NOT EXISTS "manifestSha256" TEXT;
ALTER TABLE "KnowledgeFoundationRelease" ADD COLUMN IF NOT EXISTS "provenanceSnapshot" JSONB;
ALTER TABLE "KnowledgeFoundationRelease" ADD COLUMN IF NOT EXISTS "artifactStatus" "KnowledgeFoundationReleaseArtifactStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "KnowledgeFoundationRelease" ADD COLUMN IF NOT EXISTS "previousReleaseId" TEXT;
ALTER TABLE "KnowledgeFoundationRelease" ADD COLUMN IF NOT EXISTS "previousReleaseHash" TEXT;
ALTER TABLE "KnowledgeFoundationVersionCandidate" ADD COLUMN IF NOT EXISTS "releasedAt" TIMESTAMP(3);

-- Align KF version status to enum (empty table safe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'KnowledgeFoundationVersion'
      AND column_name = 'status'
      AND udt_name <> 'KnowledgeFoundationVersionStatus'
  ) THEN
    ALTER TABLE "KnowledgeFoundationVersion" DROP COLUMN "status";
    ALTER TABLE "KnowledgeFoundationVersion" ADD COLUMN "status" "KnowledgeFoundationVersionStatus" NOT NULL DEFAULT 'DRAFT';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "KnowledgeFoundationVersion_status_idx" ON "KnowledgeFoundationVersion"("status");
CREATE INDEX IF NOT EXISTS "KnowledgeFoundationVersion_versionNumber_idx" ON "KnowledgeFoundationVersion"("versionNumber");
CREATE INDEX IF NOT EXISTS "KnowledgeFoundationVersion_createdById_idx" ON "KnowledgeFoundationVersion"("createdById");
CREATE INDEX IF NOT EXISTS "KnowledgeFoundationVersion_approvedById_idx" ON "KnowledgeFoundationVersion"("approvedById");
CREATE UNIQUE INDEX IF NOT EXISTS "KnowledgeFoundationVersion_versionNumber_key" ON "KnowledgeFoundationVersion"("versionNumber");

CREATE INDEX IF NOT EXISTS "KnowledgeFoundationRelease_versionId_idx" ON "KnowledgeFoundationRelease"("versionId");
CREATE INDEX IF NOT EXISTS "KnowledgeFoundationRelease_createdById_idx" ON "KnowledgeFoundationRelease"("createdById");
CREATE INDEX IF NOT EXISTS "KnowledgeFoundationRelease_approvedById_idx" ON "KnowledgeFoundationRelease"("approvedById");
CREATE INDEX IF NOT EXISTS "KnowledgeFoundationRelease_previousReleaseId_idx" ON "KnowledgeFoundationRelease"("previousReleaseId");
CREATE UNIQUE INDEX IF NOT EXISTS "KnowledgeFoundationRelease_versionId_key" ON "KnowledgeFoundationRelease"("versionId");

CREATE INDEX IF NOT EXISTS "KnowledgeFoundationDiff_fromVersionId_toVersionId_idx" ON "KnowledgeFoundationDiff"("fromVersionId", "toVersionId");
CREATE UNIQUE INDEX IF NOT EXISTS "KnowledgeFoundationDiff_fromVersionId_toVersionId_key" ON "KnowledgeFoundationDiff"("fromVersionId", "toVersionId");

CREATE UNIQUE INDEX IF NOT EXISTS "KnowledgeFoundationVersionCandidate_versionId_candidateId_key" ON "KnowledgeFoundationVersionCandidate"("versionId", "candidateId");
CREATE UNIQUE INDEX IF NOT EXISTS "KnowledgeFoundationVersionCandidate_candidateId_key" ON "KnowledgeFoundationVersionCandidate"("candidateId");
CREATE INDEX IF NOT EXISTS "KnowledgeFoundationVersionCandidate_versionId_idx" ON "KnowledgeFoundationVersionCandidate"("versionId");
CREATE INDEX IF NOT EXISTS "KnowledgeFoundationVersionCandidate_candidateId_idx" ON "KnowledgeFoundationVersionCandidate"("candidateId");
CREATE INDEX IF NOT EXISTS "KnowledgeFoundationVersionCandidate_boundById_idx" ON "KnowledgeFoundationVersionCandidate"("boundById");

-- Foreign keys (idempotent)
DO $$ BEGIN
  ALTER TABLE "KnowledgeCandidate" ADD CONSTRAINT "KnowledgeCandidate_canonicalAccountId_fkey"
    FOREIGN KEY ("canonicalAccountId") REFERENCES "AuditCanonicalAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "KnowledgeCandidateEvidence" ADD CONSTRAINT "KnowledgeCandidateEvidence_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "KnowledgeCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "KnowledgePromotionHistory" ADD CONSTRAINT "KnowledgePromotionHistory_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "KnowledgeCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "KnowledgeFoundationVersion" ADD CONSTRAINT "KnowledgeFoundationVersion_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "KnowledgeFoundationRelease" ADD CONSTRAINT "KnowledgeFoundationRelease_versionId_fkey"
    FOREIGN KEY ("versionId") REFERENCES "KnowledgeFoundationVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "KnowledgeFoundationVersionCandidate" ADD CONSTRAINT "KnowledgeFoundationVersionCandidate_versionId_fkey"
    FOREIGN KEY ("versionId") REFERENCES "KnowledgeFoundationVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "KnowledgeFoundationVersionCandidate" ADD CONSTRAINT "KnowledgeFoundationVersionCandidate_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "KnowledgeCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "KnowledgeFoundationVersionCandidate" ADD CONSTRAINT "KnowledgeFoundationVersionCandidate_boundById_fkey"
    FOREIGN KEY ("boundById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "KnowledgeFoundationRelease" ADD CONSTRAINT "KnowledgeFoundationRelease_previousReleaseId_fkey"
    FOREIGN KEY ("previousReleaseId") REFERENCES "KnowledgeFoundationRelease"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
