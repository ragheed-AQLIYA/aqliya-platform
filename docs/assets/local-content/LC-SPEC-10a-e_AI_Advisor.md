# LC-SPEC-10a-e: AI Advisor — All Specs

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Parent:** `LC-PRD-10_AI_Advisor.md`
> **Template:** LC-SPEC-01a–01e (Golden Reference)
> **Epic:** LC-EPIC-10

---

## Domain Specification (LC-SPEC-10a)

### Key Interfaces
```typescript
interface AdvisorResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  reviewRequired: boolean; // Always true
}

interface PatternSuggestion {
  id: string;
  accountName: string;
  accountCode: string;
  matchedPattern: string;
  confidence: number; // 20–90%
  line: WorkbookTemplateLine;
  reviewed?: boolean;
  reviewedById?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

interface PatternOutcome {
  suggestionId: string;
  accepted: boolean;
  reviewerId: string;
  reviewNotes: string;
  timestamp: string;
}
```

### Domain Rules
| Rule | Enforcement |
|---|---|
| All AI outputs are suggestions | `reviewRequired: true` |
| No autonomous decisions | Code policy + governance layer |
| Learning metrics after review | `recordPatternOutcome()` |
| Confidence must be scored | `Math.min(100, pattern.length * 5)` |
| External provider routing controlled | `runGroundedLocalContentAI()` |

---

## API Specification (LC-SPEC-10b)

| Function | Purpose | Audit Event |
|---|---|---|
| `analysePatternMatch(org, line, accounts)` | Suggest pattern matches | `pattern_suggestion_generated` |
| `reviewFalsePositive(org, matchId, decision, notes)` | Review false positive | `false_positive_reviewed` |
| `batchReviewFalsePositives(org, ids, decision, notes)` | Batch review | `batch_false_positive_review` |
| `reviewPatternSuggestion(org, suggestionId, decision, notes)` | Review pattern suggestion | `pattern_suggestion_reviewed` |
| `getPendingFalsePositiveReviews(org)` | List pending | — |
| `checkWorkbookAIHealth(org)` | Health monitoring | — |

---

## Workflow Specification (LC-SPEC-10c)

### Pattern Suggestion Flow
```
1. Workbook categorized → AI Advisor analyses accounts against template patterns
2. For each account → finds matching pattern + confidence score + description
3. Suggestions stored as AI output with reviewRequired: true
4. Human reviewer evaluates suggestion:
   a. Accept → record outcome, update learning loop
   b. Reject (false positive) → update metrics, mark as overridden
5. Learning loop updates pattern accuracy metrics
```

### False Positive Review Flow
```
1. Matches with low confidence flagged as potential false positives
2. Reviewer reviews flagged match:
   a. Confirm (accept) → match promoted
   b. Reject → match overridden in score
3. Outcome recorded in audit trail
4. Learning metrics updated
```

---

## UX Specification (LC-SPEC-10d)

### AI Advisor Overview (`/local-content/[projectId]/ai-advisor`)

| Element | Behavior |
|---|---|
| Suggestions list | Pattern suggestion cards with confidence badge |
| Review action | Accept / Reject buttons per suggestion |
| False positive queue | Pending reviews with context |
| Health card | Acceptance rate, total suggestions, avg confidence |
| Batch actions | Batch approve / reject pending reviews |

### AI Governance Indicators
| Element | Purpose |
|---|---|
| "مراجعة مطلوبة" badge | Every AI suggestion marked as requiring review |
| Confidence badge | Color-coded (20% low → 90% high) |
| Source reference | Links to original account/pattern |

---

## Test Specification (LC-SPEC-10e)

| File | What It Tests |
|---|---|
| `workbook/__tests__/scoring.test.ts` | Scoring logic |
| `workbook/__tests__/population.test.ts` | Population logic |
| `workbook/__tests__/missing-data.test.ts` | Missing data inference |
| `workbook/__tests__/csv-parser.test.ts` | CSV parsing |

### Key Scenarios
```
✓ Pattern suggestion generates reviewRequired: true
✓ False positive review creates audit event
✓ Learning metrics update after human review
✓ Batch review processes all items with individual audit
✓ AI health returns acceptance rate
```

---

## Freeze Checklist — LC-EPIC-10

| Check | Status |
|---|---|
| All 5 Specs Frozen | ✅ LC-PRD-10 + LC-SPEC-10a–10e |
| Code Evidence Verified | ✅ workbook/ai-advisor.ts (1161 lines), learning loop, health, tests |
| Architecture Drift | None |
