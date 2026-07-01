# P2 Agent 5 — Shared Workflow & Review Engine Report

> **Status:** Complete · **Date:** 2026-05-29 · **Branch:** `eid-sprint-stabilization-2026-05-29`

## 1. Scope Inspected

- `src/lib/governance/approval-state.ts`, `runtime-types.ts`
- `src/lib/audit/workflow-gating.ts`
- `src/actions/localcontent-actions.ts` (review/approval mutations)
- `src/lib/local-content/audit-events.ts`

## 2. Current Reality

- Review/approval status transitions duplicated per product (LocalContentOS inline maps).
- Governance `approval-state.ts` is AI/provenance-oriented, not resource workflow status.
- AuditOS tab gating is engagement-specific (`workflow-gating.ts`).

## 3. Gaps

- No shared platform module for review → status and approval → status transitions.
- No reusable approval/review gate helpers for new products.

## 4. Proposed Architecture / Plan

Additive `src/lib/platform/workflow/`:

| Module | Role |
| ------ | ---- |
| `types.ts` | Review/approval inputs, actors, transition results |
| `transitions.ts` | `statusAfterReview`, `statusAfterApproval` maps |
| `audit-vocabulary.ts` | `entity.verb` workflow audit constants |
| `runtime.ts` | `applyReviewTransition`, `applyApprovalTransition` (+ optional audit recorder) |
| `gating.ts` | Generic review/approval tab gates |
| `index.ts` | Barrel |

**Adoption (1 call site):** `localcontent-actions.ts` uses `statusAfterReview` / `statusAfterApproval` for project status updates.

## 5. Files Changed

| Path | Change |
| ---- | ------ |
| `src/lib/platform/workflow/*` | New shared workflow primitives |
| `src/actions/localcontent-actions.ts` | Adopt transition helpers |

## 6. Commands Run

| Command | Class |
| ------- | ----- |
| `npx tsc --noEmit` | Light |

## 7. Validation Result

| Command | Result |
| ------- | ------ |
| `npx tsc --noEmit` | Pass (coordinator) |

## 8. Risks

| Risk | Mitigation |
| ---- | ---------- |
| Products use different status strings | `WorkflowResourceStatus` allows extension; maps are explicit |
| Premature replacement of AuditOS gating | AuditOS unchanged; document migration path |
| Registry not yet exposing workflow | Optional Phase 3 wiring |

## 9. Next Lowest-Load Step

Incrementally adopt `applyReviewTransition` / `gateApprovalStep` in DecisionOS or AuditOS approval flows after product-owner review (no schema required).

### Adoption path (not yet done)

1. AuditOS: map engagement status updates through `transitions.ts` where statuses align.
2. DecisionOS: use `gateApprovalStep` on committee routes.
3. Registry: add `workflow` factory stub when integration boundary is agreed.
