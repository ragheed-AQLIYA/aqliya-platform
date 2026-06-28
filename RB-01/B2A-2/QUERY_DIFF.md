# B2A-2: Review/V3 Actions — Query Diff Analysis

**Date:** 2026-06-28

---

## 1. New Prisma Queries Added by Guards

### Guard: `requireOrganizationAccess`

No Prisma query — performs in-memory string comparison:
```typescript
if (organizationId !== user.organizationId) {
  throw new Error("Access denied: organization mismatch");
}
```

**Performance impact:** Zero (no DB round-trip)

---

### Guard: `requirePatternSuggestionAccess`

```typescript
// BEFORE: No guard — direct findUnique with only id
prisma.lcPatternSuggestion.findUnique({ where: { id: suggestionId } })

// AFTER: Guard uses findFirst with orgId filter
prisma.lcPatternSuggestion.findFirst({
  where: { id: suggestionId, organizationId: user.organizationId },
  select: { id: true },
})
// Followed by the original findUnique inside lib function
prisma.lcPatternSuggestion.findUnique({ where: { id: suggestionId } })
```

**Performance impact:** +1 DB read per call (findFirst → select id only, lightweight)

---

### Guard: `requireMatchReviewAccess`

```typescript
// BEFORE: No guard — direct findUnique with only id
prisma.lcMatchReview.findUnique({ where: { id: matchReviewId } })

// AFTER: Guard uses findFirst with orgId filter
prisma.lcMatchReview.findFirst({
  where: { id: matchReviewId, organizationId: user.organizationId },
  select: { id: true },
})
// Followed by the original findUnique inside lib function
prisma.lcMatchReview.findUnique({ where: { id: matchReviewId } })
```

**Performance impact:** +1 DB read per call (findFirst → select id only, lightweight)

---

### Guard: `requireWorkbookAccess` (reused from B2A-1)

Applied to all 5 v3 actions (E16-E20):
```typescript
prisma.lcWorkbook.findFirst({
  where: {
    id: workbookId,
    project: { organizationId: user.organizationId },
  },
  select: { id: true },
})
```

**Performance impact:** +1 DB read per v3 action (2-table JOIN, indexed)

---

## 2. Summary of Query Changes

| Action | Before (unscoped queries) | After (guard queries) | Net change |
|--------|--------------------------|----------------------|------------|
| E13: reviewSuggestionAction | 2 (findUnique + update on lcPatternSuggestion) | +1 findFirst guard | **3** (now scoped) |
| E14: reviewExplanationAction | 2 (findUnique + update on lcMatchReview) | +1 findFirst guard | **3** (now scoped) |
| E15: batchReviewAction | 2n (findUnique + update for each ID) | +1n findFirst guards | **3n** (now scoped) |
| E16: runWorkbookAiReviewAction | 0 (lib has internal queries) | +2 guards (orgAccess + wbAccess) | **2** (now scoped) |
| E17: getWorkbookReviewStatusAction | 0 | +2 guards | **2** (now scoped) |
| E18: generateRecommendationsAction | 0 | +2 guards | **2** (now scoped) |
| E19: runSimulationAction | 0 | +2 guards | **2** (now scoped) |
| E20: getWorkbookAiDashboardDataAction | 0 | +2 guards | **2** (now scoped) |
| E21: getReviewQueueAction | 6 Prisma reads (unscoped by orgId) | +1 orgAccess guard | **7** (now scoped) |

**Total new queries per action:** 1-2 lightweight `findFirst` calls, all backed by indexed `organizationId` or chain fields.

## 3. Latency Impact

Guard queries are:
- `findFirst` with `select: { id: true }` — returns only the primary key
- Indexed on `organizationId` (direct field or through chain)
- Independent of main business logic (can be parallelized using `Promise.all` in future)

**Estimated overhead per action:** < 5ms for indexed lookups

## 4. Query Pattern Differences from B2A-1

| Aspect | B2A-1 (Workbook Actions) | B2A-2 (Review/V3 Actions) |
|--------|-------------------------|---------------------------|
| Entity chain depth | 1-3 JOINs (line→workbook→project) | Direct field or 2 JOINs |
| New guard pattern | Entity→workbook→project→org | Direct orgId or orgAccess+wbAccess |
| Guard reuse | 5 guards for 18 actions | 3 new + 2 reused for 10 actions |
