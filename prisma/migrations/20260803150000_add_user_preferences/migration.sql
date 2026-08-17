-- Add preferences column to User (schema drift fix)
-- This column exists in schema.prisma but was never added by a migration
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "preferences" JSONB;
