-- Phase 28.2 hardening — release artifact write status
CREATE TYPE "KnowledgeFoundationReleaseArtifactStatus" AS ENUM ('PENDING', 'COMPLETE', 'FAILED');

ALTER TABLE "KnowledgeFoundationRelease" ADD COLUMN "artifactStatus" "KnowledgeFoundationReleaseArtifactStatus" NOT NULL DEFAULT 'PENDING';
