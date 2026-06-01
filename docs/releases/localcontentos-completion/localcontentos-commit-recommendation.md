# LocalContentOS v0.1 — Commit Recommendation (DRAFT)

**Status:** NOT COMMITTED — awaiting user approval and smoke 3–6 PASS  
**Date:** 2026-06-01

## Suggested commit message

```
feat(localcontentos): add L4 Content Studio workflow with governed review

Introduces Content Studio (project → campaign → source → item → review →
output) alongside existing compliance workspace. Includes server actions,
Prisma schema/migration SQL, UI routes, unit tests, and completion docs.
Browser workflow steps 3–6 remain for human smoke sign-off.
```

## Files to stage (LocalContentOS scope)

### Core implementation
- `src/lib/local-content/content/**`
- `src/lib/local-content/index.ts`, `registry.ts`
- `src/actions/local-content-workspace-actions.ts`
- `src/app/local-content/**` (campaigns, review, outputs, page updates)
- `src/components/local-content/content-studio-nav.tsx`
- `src/components/local-content/create-*-form.tsx`
- `src/components/local-content/campaign-content-*-form.tsx`
- `src/components/local-content/content-item-studio-actions.tsx`
- `src/lib/platform/product-registry.ts`
- `prisma/schema.prisma` (ContentStudio models only — review diff carefully)
- `prisma/migrations/20260601120000_localcontentos_content_studio/`

### Docs
- `docs/releases/localcontentos-completion/**`

## Exclude from commit

- `tmp-*.ts`, `tmp-*.cjs`, `tmp-*.mjs` (smoke query scratch files)
- SalesOS WIP unless explicitly bundled (`src/lib/sales/**`, sales migration)
- `.env` / secrets

## Pre-commit gates (when approved)

1. Human smoke steps 3–6 PASS
2. `npx tsc --noEmit` clean OR documented exception list
3. `npm test -- content-studio.test.ts` PASS
4. User explicit "commit" instruction
