# Phase 8.1 — Knowledge Review Governance Dashboard

**Date:** 2026-06-22  
**Status:** ✅ Delivered  
**Product:** AQLIYA Core — Knowledge Foundation  
**Type:** Product completion (governance layer)  
**Completion level:** L4 (Usable v0.1)

---

## Summary

Phase 8.1 adds a governance dashboard for reviewing knowledge candidates before they are promoted. It builds exclusively on existing services (`knowledge-candidate-service`, `review-workflow`, `promotion-service`, `kpis`) — no new database models, no changes to synonyms.ts, no auto-promotion.

### What was built

| Capability | Description |
|---|---|
| **Candidate Queue** (`/knowledge-review`) | Full list with status filter chips, search, sort, and paginated table |
| **Candidate Detail** (`/knowledge-review/[id]`) | Detail panel with metadata, evidence list, promotion history, sidebar emerging patterns |
| **Review Actions** | Submit-for-review, Approve, Reject, Promote with safety-rule visibility |
| **KPI Widgets** | 8 metric cards reusing `getKnowledgeMiningKPIs()` |
| **Notifications Foundation** | Typed event system (`KnowledgeReviewEvent`) with pub/sub extensibility hooks |
| **Event Wiring** | `emitReviewEvent` calls wired into `review-workflow.ts` (submit/approve/reject) and `promotion-service.ts` (promote/batch promote) |
| **Safety Rules** | Promote only from APPROVED, Reject hidden after PROMOTED, server-side enforcement verified |
| **Sidebar Navigation** | "مراجعة المعرفة" added to main dashboard sidebar |

### What was NOT changed

- ❌ No new Prisma models or migrations
- ❌ No changes to `knowledge-candidate-service.ts`, `kpis.ts`, `synonyms.ts`, or production classification
- ❌ No auto-promotion logic
- ❌ No email or queue implementation
- ❌ No changes to the knowledge-mining architecture — only additive event emissions at terminal action points

---

## Architecture

```
Client                        Server                         Existing Services              Events
──────────────────────────────────────────────────────────────────────────────────────────────────
/knowledge-review/page.tsx →  getCandidates(), getKPIs() →   listCandidates(), getKnowledgeMiningKPIs()
                              getCurrentUser(), RBAC check
                              
/knowledge-review/[id]    →  getCandidateDetail(), getKPIs() → getCandidate() + evidence + promotions
                              getCurrentUser(), RBAC check
                              
ReviewActions (client)    →  approveCandidate()             → applyReviewDecision(APPROVED)    → emit "knowledge.candidate.approved"
                              rejectCandidate()              → applyReviewDecision(REJECTED)    → emit "knowledge.candidate.rejected"
                              promoteCandidate()             → promoteCandidates()             → emit "knowledge.candidate.promoted"
                              submitCandidateForReview()     → submitForReview()               → emit "knowledge.candidate.submitted"
```

### File Map

| File | Role |
|---|---|
| `src/app/(dashboard)/knowledge-review/page.tsx` | Server page — queue + KPI dashboard |
| `src/app/(dashboard)/knowledge-review/[id]/page.tsx` | Server page — candidate detail |
| `src/components/knowledge-review/kpi-cards.tsx` | KPI widget — pure rendering |
| `src/components/knowledge-review/candidate-detail.tsx` | Client detail panel — evidence, history, sidebar |
| `src/components/knowledge-review/review-actions.tsx` | Client action buttons + notes prompt |
| `src/lib/knowledge-review/events.ts` | Event types + pub/sub foundation |
| `src/__tests__/unit/knowledge-review-events.test.ts` | Event unit tests (9 tests) |
| `src/lib/tb-intelligence/knowledge-mining/review-workflow.ts` | Wired: emit `knowledge.candidate.submitted`, `.approved`, `.rejected` |
| `src/lib/tb-intelligence/knowledge-mining/promotion-service.ts` | Wired: emit `knowledge.candidate.promoted` (single + batch) |

---

## Safety Rules

### Client-side (UI visibility)

| Current Status | Available Buttons | Rationale |
|---|---|---|
| CANDIDATE | Submit, Approve, Reject | Submit opens review cycle |
| UNDER_REVIEW | Approve, Reject | Under active review |
| APPROVED | Promote, Reject | Ready for promotion; can still reject |
| REJECTED | (none) | Server blocks re-review |
| PROMOTED | (none) | Terminal state |

### Server-side (existing — unchanged)

- `review-workflow.ts`: Blocks review of PROMOTED or REJECTED candidates
- `promotion-service.ts`: Only APPROVED candidates may be promoted

---

## Validation

| Command | Result |
|---|---|---|
| `npx tsc --noEmit` | ✅ Pass (0 errors) |
| `npx jest src/__tests__/unit/knowledge-review-events.test.ts` | ✅ Pass (9/9) |
| `npm run test` (full suite) | ✅ Pass (288 suites, 2756 tests) |
| `npm run build` | ✅ Compiled successfully, 138 pages generated |

---

## Next Recommendations

1. ✅ **Connect events to audit log** — `emitReviewEvent` is now wired into review-workflow and promotion-service (Step 11)
2. **Wire events into AuditEngine** — register `onReviewEvent` handlers that call `writePlatformAuditLog` for each event
3. **Add batch operations** — multi-select candidates for batch approve/reject/promote
4. **Email/queue integration** — use `onReviewEvent` to trigger notifications when candidates need review
5. **Candidate diff view** — show what changed since last mining cycle
