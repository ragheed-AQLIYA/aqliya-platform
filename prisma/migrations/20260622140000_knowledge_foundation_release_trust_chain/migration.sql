-- Phase 28.4 — Explicit release trust chain (previousReleaseId / previousReleaseHash)

ALTER TABLE "KnowledgeFoundationRelease"
  ADD COLUMN IF NOT EXISTS "previousReleaseId" TEXT,
  ADD COLUMN IF NOT EXISTS "previousReleaseHash" TEXT;

CREATE INDEX IF NOT EXISTS "KnowledgeFoundationRelease_previousReleaseId_idx"
  ON "KnowledgeFoundationRelease"("previousReleaseId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'KnowledgeFoundationRelease_previousReleaseId_fkey'
  ) THEN
    ALTER TABLE "KnowledgeFoundationRelease"
      ADD CONSTRAINT "KnowledgeFoundationRelease_previousReleaseId_fkey"
      FOREIGN KEY ("previousReleaseId")
      REFERENCES "KnowledgeFoundationRelease"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;
