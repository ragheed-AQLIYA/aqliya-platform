-- Phase 28.2 — Release provenance persistence and binding release timestamps
ALTER TABLE "KnowledgeFoundationVersionCandidate" ADD COLUMN "releasedAt" TIMESTAMP(3);

ALTER TABLE "KnowledgeFoundationRelease" ADD COLUMN "manifestPath" TEXT;
ALTER TABLE "KnowledgeFoundationRelease" ADD COLUMN "manifestSha256" TEXT;
ALTER TABLE "KnowledgeFoundationRelease" ADD COLUMN "provenanceSnapshot" JSONB;
