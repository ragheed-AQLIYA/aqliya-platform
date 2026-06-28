# B2A-2: Review/V3 Actions — BEFORE State

**Date:** 2026-06-28
**Commit (baseline):** `916144f` (B2A-1)
**Scope:** 10 actions in two files — `localcontent-review-actions.ts` and `localcontent-ai-advisor-v3-actions.ts`

---

## Exploit Paths Before Fix

### E13: `reviewSuggestionAction(suggestionId, decision, reviewNotes)`

| Layer | Status | Detail |
|-------|--------|--------|
| Auth | ✅ | `getCurrentUser()` returns user |
| Org check | ❌ | No verification that the lcPatternSuggestion belongs to user's org |
| Prisma | ❌ | `lcPatternSuggestion.findUnique({ where: { id } })` — no orgId filter |

**Impact:** Any authenticated user can approve/reject pattern suggestions from any organization by ID enumeration.

---

### E14: `reviewExplanationAction(matchReviewId, decision, reviewNotes)`

| Layer | Status | Detail |
|-------|--------|--------|
| Auth | ✅ | `getCurrentUser()` returns user |
| Org check | ❌ | No verification that the lcMatchReview belongs to user's org |
| Prisma | ❌ | `lcMatchReview.findUnique({ where: { id } })` — no orgId filter |

**Impact:** Any authenticated user can confirm/reject match reviews from any organization.

---

### E15: `batchReviewAction(type, ids, decision, reviewNotes)`

| Layer | Status | Detail |
|-------|--------|--------|
| Auth | ✅ | `getCurrentUser()` returns user |
| Org check | ❌ | No per-ID verification in the loop |
| Prisma | ❌ | Calls `reviewPatternSuggestion` / `reviewFalsePositive` with unchecked IDs |

**Impact:** Any authenticated user can batch-review items from any organization.

---

### E16: `runWorkbookAiReviewAction(organizationId, workbookId, tbLines)`

| Layer | Status | Detail |
|-------|--------|--------|
| Auth | ✅ | `requireUserContext()` returns user |
| Org check | ❌ | `organizationId` from client, never compared to `user.organizationId` |
| Workbook check | ❌ | No `requireWorkbookAccess()` — workbook ID not verified against org |

**Impact:** Client-supplied orgId allows cross-tenant AI review processing.

---

### E17: `getWorkbookReviewStatusAction(organizationId, workbookId)`

| Layer | Status | Detail |
|-------|--------|--------|
| Auth | ✅ | `requireUserContext()` |
| Org check | ❌ | orgId from client, unverified |
| Workbook check | ❌ | wbId from client, unverified |

**Impact:** Read any org's review status by manipulating orgId.

---

### E18: `generateRecommendationsAction(organizationId, workbookId)`

| Layer | Status | Detail |
|-------|--------|--------|
| Auth | ✅ | `requireUserContext()` |
| Org check | ❌ | orgId from client, unverified |
| Workbook check | ❌ | wbId from client, unverified |

**Impact:** Generate recommendations on wrong org's data.

---

### E19: `runSimulationAction(organizationId, workbookId, scenarioType, params)`

| Layer | Status | Detail |
|-------|--------|--------|
| Auth | ✅ | `requireUserContext()` |
| Org check | ❌ | orgId from client, unverified |
| Workbook check | ❌ | wbId from client, unverified |

**Impact:** Run simulations on wrong org's data.

---

### E20: `getWorkbookAiDashboardDataAction(organizationId, workbookId)`

| Layer | Status | Detail |
|-------|--------|--------|
| Auth | ✅ | `requireUserContext()` |
| Org check | ❌ | orgId from client, unverified |
| Workbook check | ❌ | wbId from client, unverified |

**Impact:** Read any org's AI dashboard data.

---

### E21: `getReviewQueueAction(organizationId, type?)`

| Layer | Status | Detail |
|-------|--------|--------|
| Auth | ❌ | No auth check (used server-side but exported) |
| Org check | ❌ | organizationId from client, unverified |
| Prisma | ❌ | Queries use client-supplied orgId directly |

**Impact:** Direct HTTP POST can read any org's complete review queue (pending suggestions, explanations, false positives, memory/health counts).

---

## Cumulative Metrics

| Metric | Before B2A-1 | After B2A-1 | Before B2A-2 |
|--------|:------------:|:-----------:|:------------:|
| Workbook actions protected | 0/18 | **18/18** | 18/18 |
| Review actions protected | 0/6 | 0/6 | **0/6** |
| V3 actions protected | 0/5 | 0/5 | **0/5** |
| Exploit paths remaining | 21 | **18** | **10** (E13-E21) |

## Traceability

- RB-01 Phase 3 Trust Boundary Audit: §4 (Review Actions), §3 (V3 Actions)
- RB-01 Phase 2 Tenant Isolation Matrix: §3.2 (review-actions.ts), §3.3 (v3-actions.ts)
- RB-01 Phase 5 Zero Tenant Leakage Gate: E13-E21 failures
- EXECUTION_BACKLOG.md: B2A-2 wave
