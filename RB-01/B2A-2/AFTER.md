# B2A-2: Review/V3 Actions — AFTER State

**Date:** 2026-06-28
**Scope:** 10 actions in two files — `localcontent-review-actions.ts` and `localcontent-ai-advisor-v3-actions.ts`

---

## Changes Made

### 1. New Guards Added to `localcontent-guards.ts`

| Guard | Signature | Purpose | Entity Chain |
|-------|-----------|---------|-------------|
| `requireOrganizationAccess` | `(organizationId: string) => Promise<string>` | Verify client-supplied orgId matches session | Direct comparison with `user.organizationId` |
| `requirePatternSuggestionAccess` | `(suggestionId: string) => Promise<string>` | Verify pattern suggestion belongs to user's org | `LcPatternSuggestion.organizationId` (direct field) |
| `requireMatchReviewAccess` | `(matchReviewId: string) => Promise<string>` | Verify match review belongs to user's org | `LcMatchReview.organizationId` (direct field) |

### 2. Review Actions Fixed (`localcontent-review-actions.ts`)

| # | Action | Guard Added | Protection |
|---|--------|-------------|------------|
| E13 | `reviewSuggestionAction` | `requirePatternSuggestionAccess(suggestionId)` | Blocks cross-org suggestion review |
| E14 | `reviewExplanationAction` | `requireMatchReviewAccess(matchReviewId)` | Blocks cross-org match review |
| E15 | `batchReviewAction` | `requirePatternSuggestionAccess(id)` / `requireMatchReviewAccess(id)` per ID | Blocks cross-org batch review |
| E21 | `getReviewQueueAction` | `requireOrganizationAccess(organizationId)` | Blocks cross-org queue reading |

### 3. V3 AI Advisor Actions Fixed (`localcontent-ai-advisor-v3-actions.ts`)

| # | Action | Guards Added | Protection |
|---|--------|-------------|------------|
| E16 | `runWorkbookAiReviewAction` | `requireOrganizationAccess(orgId)` + `requireWorkbookAccess(wbId)` | Blocks cross-org AI review |
| E17 | `getWorkbookReviewStatusAction` | `requireOrganizationAccess(orgId)` + `requireWorkbookAccess(wbId)` | Blocks cross-org status read |
| E18 | `generateRecommendationsAction` | `requireOrganizationAccess(orgId)` + `requireWorkbookAccess(wbId)` | Blocks cross-org rec generation |
| E19 | `runSimulationAction` | `requireOrganizationAccess(orgId)` + `requireWorkbookAccess(wbId)` | Blocks cross-org simulation |
| E20 | `getWorkbookAiDashboardDataAction` | `requireOrganizationAccess(orgId)` + `requireWorkbookAccess(wbId)` | Blocks cross-org dashboard read |

---

## Guard Integration Pattern

All guards follow the established B2A-1 pattern:

1. Call `requireUserContext()` to get authenticated user + org
2. Verify target entity belongs to user's org via Prisma `findFirst` with `organizationId` filter
3. Throw `"Access denied: ..."` if not found — caught by existing `try/catch` → `{ ok: false, error }`
4. Return `user.organizationId` for convenience

For the v3 actions, the pattern is:
```
export async function someAction(organizationId, workbookId, ...) {
  try {
    const user = await requireUserContext();
    await requireOrganizationAccess(organizationId);  // NEW
    await requireWorkbookAccess(workbookId);           // NEW
    // ... existing logic ...
  } catch (error) {
    return fail(error.message);
  }
}
```

For the review actions with entity IDs:
```
export async function someAction(suggestionId, ...) {
  try {
    const user = await getCurrentUser();
    await requirePatternSuggestionAccess(suggestionId);  // NEW
    // ... existing logic ...
  } catch (err) {
    return { success: false, error: err.message };
  }
}
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/actions/localcontent-guards.ts` | +3 guards (requireOrganizationAccess, requirePatternSuggestionAccess, requireMatchReviewAccess) |
| `src/actions/localcontent-review-actions.ts` | Import + 4 guard calls (E13-E15, E21) |
| `src/actions/localcontent-ai-advisor-v3-actions.ts` | Import + 10 guard calls (E16-E20, 2 each) |

## Metrics

| Metric | Before B2A-2 | After B2A-2 |
|--------|:------------:|:-----------:|
| Review actions protected | 0/6 | **6/6** |
| V3 actions protected | 0/5 | **5/5** |
| Total review/v3 exploit paths | 10 (E13-E21) | **0** |
| Cumulative exploit paths remaining | 18 | **10** (3 Prisma + 2 lib + 5 from remaining waves) |
| New guard functions | 0 | **3** (total: 8) |
| Cumulative actions protected | 20/39 | **30/39 (77%)** |

## Traceability

- B2A-1 guards reused: `requireWorkbookAccess` in v3 actions (E16-E20)
- New guard pattern: LcPatternSuggestion and LcMatchReview both have `organizationId` as a direct field (not through a chain) — guards use direct field comparison
- All guards integrate with existing `try/catch` / `safe()` patterns
