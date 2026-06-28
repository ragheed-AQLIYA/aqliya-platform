# B2A-4: Query Diff — Before → After

## File: `ai-auto-review.ts:86`

```diff
- const workbook = await prisma.lcWorkbook.findUnique({
-   where: { id: workbookId },
+ const workbook = await prisma.lcWorkbook.findFirst({
+   where: { id: workbookId, project: { organizationId } },
    select: { projectId: true },
  });
```

## File: `ai-advisor.ts:136` (suggestPatternImprovements)

```diff
- const workbook = await prisma.lcWorkbook.findUnique({
-   where: { id: workbookId },
+ const workbook = await prisma.lcWorkbook.findFirst({
+   where: { id: workbookId, project: { organizationId } },
    include: { lines: { orderBy: { displayOrder: "asc" } } },
  });
```

## File: `ai-advisor.ts:380` (explainAccountMatches)

```diff
- const workbook = await prisma.lcWorkbook.findUnique({
-   where: { id: workbookId },
+ const workbook = await prisma.lcWorkbook.findFirst({
+   where: { id: workbookId, project: { organizationId } },
    include: { lines: { orderBy: { displayOrder: "asc" } } },
  });
```

## File: `ai-advisor.ts:591` (reviewFalsePositive)

```diff
- export async function reviewFalsePositive(
-   matchReviewId: string,
+ export async function reviewFalsePositive(
+   organizationId: string,
+   matchReviewId: string,
    decision: "confirmed" | "rejected",
    reviewNotes: string,
    reviewerId: string,
  ): Promise<AdvisorResult<unknown>> {

-   const existing = await prisma.lcMatchReview.findUnique({
-     where: { id: matchReviewId },
+   const existing = await prisma.lcMatchReview.findFirst({
+     where: { id: matchReviewId, organizationId },
    });
```

## File: `ai-advisor.ts:684` (batchReviewFalsePositives → internal call)

```diff
- const result = await reviewFalsePositive(id, decision, reviewNotes, reviewerId);
+ const result = await reviewFalsePositive(organizationId, id, decision, reviewNotes, reviewerId);
```

## File: `ai-advisor.ts:896` (calibrateWorkbookConfidence)

```diff
- const workbook = await prisma.lcWorkbook.findUnique({
-   where: { id: workbookId },
+ const workbook = await prisma.lcWorkbook.findFirst({
+   where: { id: workbookId, project: { organizationId } },
    include: { lines: { orderBy: { displayOrder: "asc" } } },
  });
```

## File: `ai-advisor.ts:1083` (reviewPatternSuggestion)

```diff
- export async function reviewPatternSuggestion(
-   suggestionId: string,
+ export async function reviewPatternSuggestion(
+   organizationId: string,
+   suggestionId: string,
    decision: "approved" | "rejected",
    reviewNotes: string,
    reviewerId: string,
  ): Promise<AdvisorResult<unknown>> {

-   const suggestion = await prisma.lcPatternSuggestion.findUnique({
-     where: { id: suggestionId },
+   const suggestion = await prisma.lcPatternSuggestion.findFirst({
+     where: { id: suggestionId, organizationId },
    });
```

## File: `recommendation-engine.ts:642` (reviewRecommendation)

```diff
- export async function reviewRecommendation(
-   recommendationId: string,
+ export async function reviewRecommendation(
+   organizationId: string,
+   recommendationId: string,
    decision: "accepted" | "rejected" | "implemented",
    reviewNotes: string,
    reviewerId: string,
  ): Promise<void> {

-   const rec = await prisma.lcRecommendation.findUnique({
-     where: { id: recommendationId },
+   const rec = await prisma.lcRecommendation.findFirst({
+     where: { id: recommendationId, organizationId },
    });
```

## Caller Changes

All action callers updated to pass `organizationId` as the new first parameter to:
- `reviewFalsePositive` (5 callers in 2 action files)
- `reviewPatternSuggestion` (3 callers in 2 action files)
- `reviewRecommendation` (1 caller in v3 action file)

## Summary
- **7 `findUnique` → `findFirst` migrations**
- **3 function signatures changed** (added `organizationId` param)
- **9 caller sites updated**
- **0 additional DB round-trips** (all changes are query-scoping only)
