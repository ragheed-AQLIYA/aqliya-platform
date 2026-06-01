# Agent 01 — Schema Proposal Review

**Assessment:** APPROVED (additive cutover)

## Proposal vs repository interface

| Domain type | Proposed Prisma model | Maps to interface |
|-------------|----------------------|-------------------|
| ContentProject | ContentStudioProject | createProject, listProjects, getProject |
| Campaign | ContentStudioCampaign | createCampaign, listCampaigns, getCampaign, updateCampaignState |
| ContentSource | ContentStudioSource | createSource, listSources, verify/reject, etc. |
| ContentItem | ContentStudioItem | createContentItem, updateContentItem, queues |
| ContentReviewRecord | ContentStudioReview | createReview, listReviews* |
| ContentApprovalRecord | ContentStudioApproval | createApproval, listApprovals* |
| OutputPackage | ContentStudioOutput | createOutput, updateOutput, listOutputs |

## Tenant isolation

- `organizationId` on all seven models with indexes
- Actor fields: `createdById` / `createdByName`, `reviewerId` / `reviewerName`, `approverId` / `approverName`

## Indexes

- `organizationId` — all models
- `contentProjectId`, `campaignId`, `contentItemId` — relation lookups
- `status` and `(organizationId, status)` — workflow queries

## Compliance conflict check

Existing compliance models (`LocalContentProject`, `LocalContentReview`, etc.) are **unchanged**. Content Studio uses `ContentStudio*` prefix — no naming collision.

## JSON fields (minimal)

- `channels`, `sourceRefIds`, `dimensions`, `includes`, `evidenceMetadata`, `draftAssistMetadata`, `exportMetadata`
