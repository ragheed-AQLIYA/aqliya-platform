# Agent 06 — Targeted Tests

**File:** `src/lib/local-content/content/__tests__/content-studio.test.ts`

## Coverage (file backend — tests isolate via `resetContentRepositoryForTests`)

| Scenario | Test |
|----------|------|
| Create project persists | project → campaign → source → item flow |
| Campaign scoped by org | `campaign is scoped by organizationId` |
| Cross-org read denied | `scopes reads by organizationId` |
| Source links to campaign | `source links to campaign` |
| aiGenerated / reviewRequired | `persists reviewRequired after repository reinitialization` |
| Review persists | `submitContentReview records review dimensions` |
| Approval persists | `approval persists with item status transition` |
| Output metadata persists | `output metadata persists across reload` |

## Command

```
npm test -- src/lib/local-content/content/__tests__/content-studio.test.ts
```

## Result

**9/9 PASS** (light)

Note: Jest suite uses file backend by design; Prisma path validated via `tsc` + schema/migration + manual smoke checklist pending.
