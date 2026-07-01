-- Phase 28.1 — Knowledge Foundation version ↔ candidate binding bridge
CREATE TABLE "KnowledgeFoundationVersionCandidate" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "boundById" TEXT NOT NULL,
    "boundAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "includedInRelease" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "KnowledgeFoundationVersionCandidate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "KnowledgeFoundationVersionCandidate_versionId_candidateId_key" ON "KnowledgeFoundationVersionCandidate"("versionId", "candidateId");
CREATE UNIQUE INDEX "KnowledgeFoundationVersionCandidate_candidateId_key" ON "KnowledgeFoundationVersionCandidate"("candidateId");
CREATE INDEX "KnowledgeFoundationVersionCandidate_versionId_idx" ON "KnowledgeFoundationVersionCandidate"("versionId");
CREATE INDEX "KnowledgeFoundationVersionCandidate_candidateId_idx" ON "KnowledgeFoundationVersionCandidate"("candidateId");
CREATE INDEX "KnowledgeFoundationVersionCandidate_boundById_idx" ON "KnowledgeFoundationVersionCandidate"("boundById");

ALTER TABLE "KnowledgeFoundationVersionCandidate" ADD CONSTRAINT "KnowledgeFoundationVersionCandidate_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "KnowledgeFoundationVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KnowledgeFoundationVersionCandidate" ADD CONSTRAINT "KnowledgeFoundationVersionCandidate_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "KnowledgeCandidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KnowledgeFoundationVersionCandidate" ADD CONSTRAINT "KnowledgeFoundationVersionCandidate_boundById_fkey" FOREIGN KEY ("boundById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
