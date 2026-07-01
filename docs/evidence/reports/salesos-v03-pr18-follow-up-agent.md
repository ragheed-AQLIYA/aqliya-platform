# SalesOS v0.3 PR-18 — Follow-up Agent Stub

**Workstream:** L6 PR-18 — governed follow-up drafting from interactions  
**Date:** 2026-06-01  
**Validation:** light validated (Jest unit tests on follow-up agent module)

---

## Goal

From meeting/interaction notes → follow-up draft in `deal.metadata.followUpDrafts[]` — **NO auto-send**. Human approve copies `suggestedNextAction` to `deal.metadata.nextAction` only.

---

## Changes

### 1. `src/lib/sales/agents/follow-up.ts`

| Export | Role |
|--------|------|
| `FollowUpDraft` | Draft shape stored in deal metadata |
| `readFollowUpDrafts(metadata)` | Parse `followUpDrafts[]` |
| `draftFollowUpStub(scope, dealId, input, actor)` | Template from last interaction + `nextAction` |
| `approveFollowUpDraft(...)` | Human confirm → copy to `nextAction` |
| `rejectFollowUpDraft(...)` | Mark rejected — no metadata side effects |
| `listFollowUpDraftsForDeal(...)` | Org-scoped list |
| `assertNoFollowUpSend()` / `assertNoSend` | Outreach-pattern guard — send API does not exist |

### 2. `src/components/sales/deal-follow-up-panel.tsx`

- Deal detail panel: list drafts, generate stub, approve/reject.
- Approve requires browser `confirm()` before copying to nextAction.

### 3. `src/actions/sales-actions.ts`

- `listFollowUpDraftsForDealAction`
- `draftFollowUpAction(dealId, interactionId?)`
- `approveFollowUpDraftAction`
- `rejectFollowUpDraftAction`

### 4. Audit

| Event | When |
|-------|------|
| `sales.agent.followup_drafted` | Stub draft created |
| `sales.deal.next_action_set` | Human approved draft (metadata `source: follow_up_draft_approved`) |

### 5. `src/app/sales/deals/[id]/page.tsx`

- Card **مسودات متابعة (PR-18)** with `DealFollowUpPanel`.

---

## Not changed (per constraints)

- `src/lib/sales/agents/deal-risk.ts`
- `src/lib/sales/agents/objection-analysis.ts`
- Outreach send path (still `assertNoOutreachSend` only)

---

## Validation

| Check | Result |
|-------|--------|
| `src/lib/sales/__tests__/sales-follow-up.test.ts` | **9 tests pass** |
| Prisma migration required | **No** — JSON metadata only |
| Full build / browser | **Not run** (low-load protocol) |

---

## Arabic one-liner

**مسودة متابعة من آخر تفاعل — لا إرسال؛ الاعتماد ينسخ الإجراء التالي فقط بعد تأكيد بشري.**
