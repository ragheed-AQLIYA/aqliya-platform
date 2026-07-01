# SPEC-02e: Test Specification — Engagement Management

> **Status:** Draft v0.1 | **Date:** 2026-06-28
> **Program:** CPV-001 | **Template:** SPEC-01e (inherited)

---

## Inherited Without Change

| Element | Source | Status |
|---|---|---|
| Test Pyramid (Domain 50%, Contract 30%, Integration 15%, E2E 5%) | SPEC-01e §1.1 | ✅ Inherited |
| CI Gates (Commit → PR → Daily → Weekly) | SPEC-01e §11 | ✅ Inherited |
| Governance Tests (Constitutional) | SPEC-01e §7.1 | ✅ Inherited |
| Observable Tests (metrics, logs, traces) | SPEC-01e §8 | ✅ Inherited |

---

## Test Categories

| Category | Coverage Target | Focus for AuditOS |
|---|---|---|
| Domain Tests | 95%+ | Engagement aggregate, Value Objects, Loop invariants |
| API Contract Tests | 95%+ | 4-level review auth, return_to_fieldwork idempotency |
| Workflow Tests (critical) | 95%+ | **Non-linear loops, revision replay, multi-level approval** |
| UX Contract Tests | 90%+ | Timeline rendering, evidence chain read-only |
| Governance Tests | 100% | Loop invariants, evidence mutation boundary |

---

## Domain Tests

| Group | Count | AuditOS-specific |
|---|---|---|
| Value Objects | 8 | EngagementPeriod, MaterialityThreshold |
| Invariants | 10 | LI-01 to LI-05 (loop), H-01 to H-05 (hypotheses) |
| Review Records | 6 | Multi-level approval, authority matrix |
| Domain Events | 5 | returned_to_fieldwork, revision_completed, etc. |

---

## API Contract Tests

| Group | Count | AuditOS-specific |
|---|---|---|
| Server Actions | 7 | return_to_fieldwork, reviewAction (4 levels) |
| Review Authorization | 8 | Senior/Manager/Partner/Quality — approve/reject |
| Loop Idempotency | 4 | Same revision → skip; new revision → apply |
| Parallel Concurrency | 3 | Two reviewers → CONFLICT on stale version |

---

## Workflow Tests (Critical Path)

| Test | Type | What It Proves |
|---|---|---|
| Linear path: 9 stages forward | State Machine | Template handles 9 stages (more than SalesOS's 7) |
| Single review loop | Loop | InReview → Fieldwork → InReview preserves invariants |
| Double review loop | Loop | Multiple cycles without state corruption |
| Multi-level approval chain | Guards | Senior → Manager → Partner approval sequence |
| Return without reason rejected | Validation | `returnRequiresReason` guard enforced |
| SLA per revision | SLA | Each revision has independent SLA timer |
| Replay determinism | Snapshot | `replay(history) === history` |

---

## Exit Criteria for CPV-001

| Criterion | Target |
|---|---|
| Domain Tests | ≥95% pass |
| API Contract Tests | ≥95% pass |
| Workflow Tests | **100% pass** (critical path) |
| Loop Invariants (LI-01 to LI-05) | 100% pass |
| Hypothesis Tests (W-01 to W-05) | All passing |
| Architecture Drift | Green |
| Template Changes | **0** |

---

## Document Metadata

- **Author:** OpenCode | **Program:** CPV-001
- **Version:** 0.1 | **Template:** SPEC-01e
- **Template Reuse:** ~90%
- **Status:** Draft — ready for review
