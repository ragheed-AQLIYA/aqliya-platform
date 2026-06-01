# Agent 02 — Prisma Schema Patch

**Status:** Applied

## Models added to `prisma/schema.prisma`

- ContentStudioProject
- ContentStudioCampaign
- ContentStudioSource
- ContentStudioItem
- ContentStudioReview
- ContentStudioApproval
- ContentStudioOutput

## Design notes

- Additive only; no compliance model renames
- Cascade deletes on project → campaign → item/review/approval/output chain
- SetNull on optional source → campaign/item FKs
- String status fields (matches file store enum strings)
- `createdAt` / `updatedAt` on all except ContentStudioApproval (domain type has `createdAt` only)

## Migration file

`prisma/migrations/20260601120000_localcontentos_content_studio/migration.sql`
