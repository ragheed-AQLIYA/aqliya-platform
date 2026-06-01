# Agent 04 — PrismaContentStudioRepository

**File:** `src/lib/local-content/content/prisma-repository.ts`

## Implementation summary

- Full `ContentStudioRepository` implementation using `@/lib/prisma`
- Organization-scoped reads via `findFirst({ where: { id, organizationId } })` → `null` on cross-org
- ID generation uses shared `newId()` prefixes (`cproj_`, `camp_`, etc.) for parity with file backend
- Workflow transitions reuse `workflow.ts` assertions (campaign, item, source, output)
- `createReview` / `createApproval` use `$transaction` for item status side-effects
- JSON mappers for `channels`, `sourceRefIds`, `dimensions`, `includes`, metadata fields
- AI fields preserved: `aiGenerated`, `reviewRequired`, `draftAssistMetadata`

## Boundary

No service module imports Prisma directly for Content Studio — only this repository adapter.
