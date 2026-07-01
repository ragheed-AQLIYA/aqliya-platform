# Content Studio Schema Drift (R-03)

**Status:** Tech Debt — Documented  
**Date:** 2026-07-01  
**Owner:** Platform Architecture  
**Related:** R-03 (Security Hardening Pass, 2026-06-17)

## What Models Are Involved

Two parallel model groups exist in `prisma/schema.prisma`:

### Group A — Original (Campaign/Media Project)

Defined at lines 2224–2377:

- `ContentStudioProject` — `ar:status "draft"`
- `ContentStudioCampaign` — `ar:status "draft"`
- `ContentStudioSource` — `ar:status "proposed"`
- `ContentStudioItem` — `ar:status "idea"`
- `ContentStudioReview` — `ar:status "pending"`
- `ContentStudioApproval`
- `ContentStudioOutput` — `ar:status "draft"`

### Group B — Standalone Workspace Layer (Newer)

Defined at lines 5478–5560:

- `ContentWorkspace` — `ar:isActive Boolean default(true)`
- `ContentItem` — `ar:status "DRAFT"`
- `ContentVersion`
- `ContentTemplate`

The service layer at `src/lib/platform/content-studio/content-studio-service.ts` operates exclusively on **Group B** models via a hand-crafted `ContentStudioDb` interface delegate.

## What the Divergence Is

1. **Two separate model families** serve overlapping use cases (content authoring/governance) with no shared base, no foreign keys between them, and different naming conventions.
2. **Group B models** (`ContentWorkspace`, `ContentItem`, `ContentVersion`, `ContentTemplate`) were added 2026-06-17 as a "standalone content authoring" layer. They are **not yet recognized by the Prisma generated client** at the time of writing — the service file uses an explicit `as unknown as ContentStudioDb` cast to satisfy TypeScript.
3. `ContentStudioItem.status` uses lowercase values (`"idea"`, `"draft"`, `"in_review"`, `"approved"`, `"published"`, `"archived"`) while `ContentItem.status` uses uppercase (`"DRAFT"`, `"IN_REVIEW"`, `"APPROVED"`, `"PUBLISHED"`, `"ARCHIVED"`).
4. The route layer (`src/app/content-studio/actions.ts`) uses Group B service functions but the route path `/content-studio` serves the UI for both campaign projects and the newer workspace system.

## Why It Exists (Historical)

- **Group A** was the original Content Studio design focused on campaign/media project workflows with structured campaigns, sources, items, reviews, and approvals.
- **Group B** was added later (2026-06-17) to support a lighter standalone authoring workspace without the full campaign pipeline, reusing the `/content-studio` route namespace.
- The two groups were developed in parallel without consolidation because the Group A campaign workflow was already in use while Group B was needed for a separate authoring feature under the same product umbrella.
- `npx prisma generate` had not been re-run after Group B models were added, so the service layer uses the delegate interface as a workaround.

## Current Workaround

In `src/lib/platform/content-studio/content-studio-service.ts`:

```typescript
interface ContentStudioDb {
  contentWorkspace: { ... }
  contentItem: { ... }
  contentVersion: { ... }
  contentTemplate: { ... }
}

const p = prisma as unknown as ContentStudioDb
```

This bypasses TypeScript's strict type checking of Prisma client methods. The interface manually mirrors the expected Prisma API for the four Group B models. Any mismatch between the interface and the actual Prisma generated client will not be caught at compile time.

## Plan to Fix

| Step | Action | Priority |
|------|--------|----------|
| 1 | Run `npx prisma generate` and verify Group B models appear in generated client | Immediate |
| 2 | Remove the hand-crafted `ContentStudioDb` interface and replace `as unknown` cast with proper typed `prisma.contentWorkspace` etc. | High |
| 3 | Decide whether Group A and Group B should be consolidated (preferred) or kept separate with clear boundaries | Medium |
| 4 | If consolidating: unify status enums, create a shared base, migrate data, deprecate Group A models | Medium |
| 5 | If keeping separate: rename Group B route/namespace to avoid confusion (e.g., `/content-studio/workspace`) | Low |
| 6 | Update `ROUTE_STRATEGY.md` and `PRODUCT_STATUS_MATRIX.md` after resolution | After steps 3-5 |
| 7 | Delete obsolete `content-studio-actions.test.ts` mocks if interfaces change | After step 2 |

## Risk

- **False negatives**: The `as unknown` cast means a `prisma generate` that changes model fields will not produce TypeScript errors in the service layer.
- **Runtime errors**: If Prisma generates different method signatures than the delegate interface expects, calls will fail at runtime.
- **Confusion**: Developers may not know which model group to extend for new features.
