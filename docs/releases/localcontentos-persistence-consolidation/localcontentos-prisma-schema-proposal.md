# LocalContentOS Content Studio Prisma Schema Proposal

**Status: PROPOSAL ONLY — not applied**

## New models (proposed)
ContentStudioProject, ContentStudioCampaign, ContentStudioSource, ContentStudioItem, ContentStudioReview, ContentStudioApproval, ContentStudioOutput

## Tenant isolation
organizationId indexed on all models

## Migration risk
Medium — additive tables only; compliance LocalContent* unchanged

## Rollback
Drop new tables; keep file repository as fallback

## Requires before migrate
Explicit user approval, then prisma migrate dev + generate
