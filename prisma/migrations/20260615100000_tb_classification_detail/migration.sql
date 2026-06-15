-- Phase 4 — Explainable TB classification (Trust + Evidence snapshot)
ALTER TABLE "TBClassificationHistory" ADD COLUMN IF NOT EXISTS "classificationDetail" JSONB;
