-- Create KnowledgeCandidateStatus enum (missing from migration lineage)
-- IF NOT EXISTS: supports databases originally created via db push
DO $$ BEGIN
    CREATE TYPE "KnowledgeCandidateStatus" AS ENUM ('CANDIDATE', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PROMOTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create KnowledgeCandidate table (originally created via db push, never in a migration)
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
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeCandidate_pkey" PRIMARY KEY ("id")
);

-- Create KnowledgeCandidateEvidence table
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

-- Create KnowledgePromotionHistory table
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

-- Create indexes for KnowledgeCandidate
CREATE INDEX IF NOT EXISTS "KnowledgeCandidate_status_idx" ON "KnowledgeCandidate"("status");
CREATE INDEX IF NOT EXISTS "KnowledgeCandidate_canonicalCode_idx" ON "KnowledgeCandidate"("canonicalCode");
CREATE INDEX IF NOT EXISTS "KnowledgeCandidate_organizationId_idx" ON "KnowledgeCandidate"("organizationId");
CREATE INDEX IF NOT EXISTS "KnowledgeCandidate_supportCount_idx" ON "KnowledgeCandidate"("supportCount");
CREATE INDEX IF NOT EXISTS "KnowledgeCandidate_confidence_idx" ON "KnowledgeCandidate"("confidence");

-- Create indexes for KnowledgeCandidateEvidence
CREATE INDEX IF NOT EXISTS "KnowledgeCandidateEvidence_candidateId_idx" ON "KnowledgeCandidateEvidence"("candidateId");
CREATE INDEX IF NOT EXISTS "KnowledgeCandidateEvidence_evidenceType_evidenceId_idx" ON "KnowledgeCandidateEvidence"("evidenceType", "evidenceId");

-- Create indexes for KnowledgePromotionHistory
CREATE INDEX IF NOT EXISTS "KnowledgePromotionHistory_candidateId_idx" ON "KnowledgePromotionHistory"("candidateId");
CREATE INDEX IF NOT EXISTS "KnowledgePromotionHistory_artifactType_idx" ON "KnowledgePromotionHistory"("artifactType");

-- Add foreign key: KnowledgeCandidate.canonicalAccountId -> AuditCanonicalAccount.id
-- Only add if not already present (supports db-push databases)
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'KnowledgeCandidate_canonicalAccountId_fkey'
    ) THEN
        ALTER TABLE "KnowledgeCandidate" ADD CONSTRAINT "KnowledgeCandidate_canonicalAccountId_fkey"
            FOREIGN KEY ("canonicalAccountId") REFERENCES "AuditCanonicalAccount"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- Add foreign key: KnowledgeCandidateEvidence.candidateId -> KnowledgeCandidate.id
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'KnowledgeCandidateEvidence_candidateId_fkey'
    ) THEN
        ALTER TABLE "KnowledgeCandidateEvidence" ADD CONSTRAINT "KnowledgeCandidateEvidence_candidateId_fkey"
            FOREIGN KEY ("candidateId") REFERENCES "KnowledgeCandidate"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Add foreign key: KnowledgePromotionHistory.candidateId -> KnowledgeCandidate.id
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'KnowledgePromotionHistory_candidateId_fkey'
    ) THEN
        ALTER TABLE "KnowledgePromotionHistory" ADD CONSTRAINT "KnowledgePromotionHistory_candidateId_fkey"
            FOREIGN KEY ("candidateId") REFERENCES "KnowledgeCandidate"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
