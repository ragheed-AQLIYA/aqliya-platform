# B2A-4: BEFORE State — Closure Wave

## Date
2026-06-28T15:14:00Z

## Wave Scope
| # | Target | Issue | Production Risk |
|---|--------|-------|-----------------|
| 1 | `ai-auto-review.ts:86` | `findUnique` on `lcWorkbook` by id only — E13/E16 critical path | Active exploitation path |
| 2 | `ai-advisor.ts:136` | `findUnique` on `lcWorkbook` by id only in `suggestPatternImprovements` — E21 path | Reachable via guarded action |
| 3 | `ai-advisor.ts:380` | `findUnique` on `lcWorkbook` by id only in `explainAccountMatches` — E21 path | Reachable via guarded action |
| 4 | `ai-advisor.ts:591` | `findUnique` on `lcMatchReview` by id only in `reviewFalsePositive` — NO orgId parameter | Active exploitation path (v1 actions) |
| 5 | `ai-advisor.ts:684` | `batchReviewFalsePositives` calls `reviewFalsePositive` without orgId | Runtime error after (4) fixed |
| 6 | `ai-advisor.ts:896` | `findUnique` on `lcWorkbook` by id only in `calibrateWorkbookConfidence` — E21 path | Reachable via guarded action |
| 7 | `ai-advisor.ts:1083` | `findUnique` on `lcPatternSuggestion` by id only in `reviewPatternSuggestion` — NO orgId parameter | Active exploitation path (v1 actions) |
| 8 | `recommendation-engine.ts:642` | `findUnique` on `lcRecommendation` by id only in `reviewRecommendation` — NO orgId parameter | Active exploitation path (unscoped action) |
| 9 | `localcontent-ai-advisor-actions.ts` (x2) | `reviewFpFlagAction`, `reviewPatternSuggestionAction` pass no orgId | Inconsistent v1 guarding |
| 10 | `localcontent-review-actions.ts` (x3) | `reviewSuggestionAction`, `reviewExplanationAction`, `batchReviewAction` pass no orgId | Inconsistent v2 guarding |
| 11 | `localcontent-ai-advisor-v3-actions.ts` | `reviewRecommendationAction` passes no orgId | Missing org verification |

## Cumulative Protection Before B2A-4
| Layer | Coverage | Status |
|-------|----------|--------|
| Action layer | 31/31 (100%) | ✅ |
| Lib layer | 18/18 functions (~37 queries) | 🟡 Lacks defense-in-depth on 5 queries |
| Total verified points | 46 | |

## Live `findUnique` Calls in Scope
| File | Line | Model | Current Query |
|------|------|-------|---------------|
| ai-auto-review.ts | 86 | lcWorkbook | `findUnique({ where: { id: workbookId } })` |
| ai-advisor.ts | 136 | lcWorkbook | `findUnique({ where: { id: workbookId } })` |
| ai-advisor.ts | 380 | lcWorkbook | `findUnique({ where: { id: workbookId } })` |
| ai-advisor.ts | 591 | lcMatchReview | `findUnique({ where: { id: matchReviewId } })` |
| ai-advisor.ts | 896 | lcWorkbook | `findUnique({ where: { id: workbookId } })` |
| ai-advisor.ts | 1083 | lcPatternSuggestion | `findUnique({ where: { id: suggestionId } })` |
| recommendation-engine.ts | 642 | lcRecommendation | `findUnique({ where: { id: recommendationId } })` |

## Security Ownership Matrix (Before)
| Entity | Action Guard | Entity Guard | Library Scope | Prisma Scope |
|--------|-------------|--------------|---------------|--------------|
| ai-auto-review.ts:86 | ✅ (caller) | N/A | N/A | ✘ |
| ai-advisor.ts:136 | ✅ (caller) | N/A | N/A | ✘ |
| ai-advisor.ts:380 | ✅ (caller) | N/A | N/A | ✘ |
| ai-advisor.ts:591 | ✘ (v1) | ✘ | ✘ | ✘ |
| ai-advisor.ts:896 | ✅ (caller) | N/A | N/A | ✘ |
| ai-advisor.ts:1083 | ✘ (v1) | ✘ | ✘ | ✘ |
| recommendation-engine.ts:642 | ✘ | ✘ | ✘ | ✘ |
