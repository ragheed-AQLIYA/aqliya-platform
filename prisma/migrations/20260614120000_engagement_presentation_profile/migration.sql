-- Phase 13.1: engagement-level IS presentation profile (nullable; app resolves null → generic)
ALTER TABLE "AuditEngagement" ADD COLUMN IF NOT EXISTS "presentationProfile" TEXT;
ALTER TABLE "AuditEngagement" ADD COLUMN IF NOT EXISTS "presentationProfileVersion" TEXT;
