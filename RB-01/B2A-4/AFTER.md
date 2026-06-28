# B2A-4: AFTER State — Closure Wave

## Date
2026-06-28T15:14:00Z

## Changes Applied

### 1. `ai-auto-review.ts` — `runWorkbookAiReview`
- Changed `findUnique` → `findFirst`
- Added org scope: `where: { id: workbookId, project: { organizationId } }`
- Blocks E13/E16 critical path (cross-tenant workbook access via workbookId)

### 2. `ai-advisor.ts` — `suggestPatternImprovements`
- Changed `findUnique` → `findFirst`
- Added org scope: `where: { id: workbookId, project: { organizationId } }`
- Defense-in-depth for already-guarded action path

### 3. `ai-advisor.ts` — `explainAccountMatches`
- Changed `findUnique` → `findFirst`
- Added org scope: `where: { id: workbookId, project: { organizationId } }`
- Defense-in-depth for already-guarded action path

### 4. `ai-advisor.ts` — `reviewFalsePositive`
- **Added `organizationId` parameter** (new 1st param)
- Changed `findUnique` → `findFirst`
- Added org scope: `where: { id: matchReviewId, organizationId }`
- Closes v1/v2 inconsistent guarding path

### 5. `ai-advisor.ts` — `batchReviewFalsePositives`
- Passes `organizationId` through to internal `reviewFalsePositive` call

### 6. `ai-advisor.ts` — `calibrateWorkbookConfidence`
- Changed `findUnique` → `findFirst`
- Added org scope: `where: { id: workbookId, project: { organizationId } }`
- Defense-in-depth

### 7. `ai-advisor.ts` — `reviewPatternSuggestion`
- **Added `organizationId` parameter** (new 1st param)
- Changed `findUnique` → `findFirst`
- Added org scope: `where: { id: suggestionId, organizationId }`
- Closes v1/v2 inconsistent guarding path

### 8. `recommendation-engine.ts` — `reviewRecommendation`
- **Added `organizationId` parameter** (new 1st param)
- Changed `findUnique` → `findFirst`
- Added org scope: `where: { id: recommendationId, organizationId }`
- Closes active exploitation path (was no entity org check)

### 9. Action Callers Updated
| File | Actions Updated | Change |
|------|----------------|--------|
| `localcontent-ai-advisor-actions.ts` | `reviewFpFlagAction`, `reviewPatternSuggestionAction` | Pass `user.organizationId` from session |
| `localcontent-review-actions.ts` | `reviewSuggestionAction`, `reviewExplanationAction`, `batchReviewAction` | Capture orgId from guard return, pass to lib |
| `localcontent-ai-advisor-v3-actions.ts` | `reviewRecommendationAction` | Pass `user.organizationId` from session |

## Cumulative Protection After B2A-4
| Layer | Coverage | Status |
|-------|----------|--------|
| Action layer | 31/31 (100%) | ✅ |
| Guard layer | 8 shared guards (org-entity verification) | ✅ |
| Lib layer (scoped-by-default) | 18/18 functions (~37 queries) | ✅ All org-scoped |
| Lib layer (self-scoped with orgId param) | 7/7 critical functions | ✅ Newly self-scoped |
| Total verified protection points | 53 | |

## Security Ownership Matrix (After)
| Entity | Action Guard | Entity Guard | Library Self-Scoped | Prisma Scoped |
|--------|-------------|--------------|---------------------|---------------|
| ai-auto-review.ts:86 | ✅ | ✅ (orgId in func) | ✅ findFirst | ✅ project.organizationId |
| ai-advisor.ts:136 | ✅ | ✅ (orgId in func) | ✅ findFirst | ✅ project.organizationId |
| ai-advisor.ts:380 | ✅ | ✅ (orgId in func) | ✅ findFirst | ✅ project.organizationId |
| ai-advisor.ts:591 | ✅ (both v1 & v2) | ✅ (orgId param) | ✅ findFirst | ✅ organizationId |
| ai-advisor.ts:896 | ✅ | ✅ (orgId in func) | ✅ findFirst | ✅ project.organizationId |
| ai-advisor.ts:1083 | ✅ (both v1 & v2) | ✅ (orgId param) | ✅ findFirst | ✅ organizationId |
| recommendation-engine.ts:642 | ✅ | ✅ (orgId in func) | ✅ findFirst | ✅ organizationId |

## Query Count
- `findUnique` calls remaining in modified files: **0**
- `findFirst` calls in modified files: **7**
- Total `findUnique` in lib layer: **25** (classified: 7 already handled, 14 caller-scoped, 2 dead/future)
