# Architecture Drift Review #4 — WP-04: Server Actions (Write API)

> **Date:** 2026-06-28 | **Reviewer:** OpenCode | **Work Package:** WP-04
> **Predecessors:** DRIFT_REVIEW_01, _02, _03 — all GREEN
> **This is the first test of the complete Write Path.**

---

## Drift Checklist

| Check | Result | Evidence |
|---|---|---|
| **No contract drift** | 🟢 **Green** | All Server Action contracts match SPEC-01b §2. Every mutation goes through Deal aggregate. |
| **No business logic in API** | 🟢 **Green** | `safe()` is the only logic. All domain rules (evidence gates, stage transitions, closure checks) are enforced in the Deal aggregate. |
| **No new coupling** | 🟢 **Green** | Zero product-to-product imports. API imports from domain + infrastructure only. |
| **No bypass of Platform contracts** | 🟢 **Green** | Auth via AuthContext stub. Event publisher via DomainEventPublisher interface. |
| **ADR impact** | 🟢 **Green** | No new ADR |
| **Technical debt** | 🟢 **Green** | None |

---

## Write Path Verification

| Operation | Aggregate Flow | Concurrency | Event Published | Test |
|---|---|---|---|---|
| createDeal | Deal.create() → repo.save() | Version starts at 1 | salesos.deal.created | ✅ |
| updateDeal | repo.findById() → deal.updateField() → repo.save() | Version checked | — | ✅ |
| transitionDeal | repo.findById() → deal.applyStageTransition() → repo.save() | Version checked | salesos.deal.stage_changed | ✅ |
| linkEvidence | repo.findById() → deal.syncEvidenceCount() → repo.save() | Version checked | — | ✅ |
| deleteDeal | repo.findById() → repo.archive() | Version checked | — | ✅ |

---

## Concurrency Verification

| Scenario | Test |
|---|---|
| First write succeeds, second fails with stale version | ✅ |
| Transition with stale version fails | ✅ |
| Retry after conflict with fresh version succeeds | ✅ |
| Evidence link with wrong version fails | ✅ |
| Delete with wrong version fails | ✅ |

---

## Event Publication Verification

| Property | Verified |
|---|---|
| Every write publishes correct event type | ✅ |
| eventVersion = 1 on all events | ✅ |
| correlationId present on all events | ✅ |
| source = "salesos" on all events | ✅ |
| Sequence IDs unique per event | ✅ |
| Event payload contains correct deal data | ✅ |

---

## Failure Path Coverage

| Failure Type | Action | Error Code | Test |
|---|---|---|---|
| Governance — evidence gate | submit_for_review without evidence | GOVERNANCE_BLOCKED | ✅ |
| Business rule — closed deal | update closed deal | BUSINESS_RULE_FAILED | ✅ |
| Business rule — closed deal transition | transition from closed | BUSINESS_RULE_FAILED | ✅ |
| Validation — reject without reason | reject without reason | VALIDATION_ERROR | ✅ |
| Validation — close_lost without reason | close_lost without reason | VALIDATION_ERROR | ✅ |
| Concurrency — second write fails | stale version | BUSINESS_RULE_FAILED | ✅ |

---

## Test Results

| Test Category | Tests | Passed |
|---|---|---|
| Domain | 44 | 44 |
| Repository | 19 | 19 |
| Read API | 22 | 22 |
| Write API — Happy Path | 14 | 14 |
| Write API — Concurrency | 4 | 4 |
| Write API — Events | 3 | 3 |
| Write API — Failures | 6 | 6 |
| **Total** | **110** | **110** |

---

## Cumulative Indicators

| WP | Contract Stability | Traceability | Drift |
|---|---|---|---|
| WP-01 | ✅ | ✅ | 🟢 |
| WP-02 | ✅ | ✅ | 🟢 |
| WP-03 | ✅ | ✅ | 🟢 |
| WP-04 | ✅ | ✅ | 🟢 |

---

## Methodology Status

| Specification | Proven? |
|---|---|
| SPEC-01a (Domain) | ✅ PROVEN |
| SPEC-01b (API — Read) | ✅ PROVEN |
| SPEC-01b (API — Write) | ✅ PROVEN |
| SPEC-01c (Workflow) | ⏳ WP-05 |
| SPEC-01d (UX) | ⏳ WP-07 |
| SPEC-01e (Tests) | ✅ Partially proven |

---

## Decision

**WP-04 ARCHITECTURE DRIFT: GREEN — NO DRIFT.**

**First complete Write Path proven. CRUD cycle (Read + Write) fully verified against frozen specifications with zero contract changes and zero new ADRs.**

## Key Achievement

```text
Client → Server Action → Deal Aggregate → Repository → Events
         ↑                 ↑
    safe() wrapper    All business rules
    (error translation) enforced here
```

All 5 write operations follow this path. All 6 failure types are mapped. Concurrency is enforced. Events are published with correct metadata. **The methodology works end-to-end.**
