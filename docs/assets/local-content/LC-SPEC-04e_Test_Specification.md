# LC-SPEC-04e: Test Specification — Findings & Review

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Test Specification — retroactive alignment
> **Parent:** `LC-PRD-04_Findings_Review.md` v0.1
> **Depends On:** LC-SPEC-04a, LC-SPEC-04b, LC-SPEC-04c, LC-SPEC-04d
> **Template:** LC-SPEC-01e (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | All LC-EPIC-04 specs |
| **Consumer** | QA, CI Pipeline |
| **Evidence Classification** | Executable Evidence |

---

## 1. Test File Map

| # | File | Tests | What It Tests | SPEC Reference |
|---|---|---|---|---|
| T-01 | `finding.test.ts` | — | Finding CRUD, status transitions, linking | LC-SPEC-04b §1.1 |
| T-02 | `review.test.ts` | — | Review submission, duplicate validation, routing | LC-SPEC-04b §1.2 |
| T-03 | `guards.test.ts` | — | RBAC: `create_finding`, `review` (shared) | LC-SPEC-04b §1 |
| T-04 | `audit-events.test.ts` | — | Events: FINDING_CREATED, REVIEW_SUBMITTED (shared) | LC-SPEC-04c §4 |

---

## 2. Key Test Scenarios

### Finding Tests
```
✓ Creates finding with required fields
✓ Creates finding with all optional fields
✓ Updates finding status (draft → submitted)
✓ Updates finding status (submitted → reviewed)
✓ Updates finding status (reviewed → resolved)
✓ Updates finding status (reviewed → dismissed)
✓ Rejects invalid status transition
✓ Lists findings for project (desc)
✓ Deletes finding
✓ Links finding to supplier
✓ Links finding to spend record
```

### Review Tests
```
✓ Submits review with valid action
✓ Rejects duplicate review from same reviewer
✓ Computes correct review status based on action
✓ Creates audit event on review submission
✓ Lists reviews for project
```

### Approval Routing Tests
```
✓ Returns correct state when no reviews exist
✓ Returns correct state when review completed
✓ Returns correct state when insufficient reviews
```

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ Finding, review, and approval logic in existing services.ts + actions |
| **Documented** | ✅ This specification retroactively describes existing test coverage |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Next:** LC-EPIC-04 Freeze → LC-EPIC-05

---

## Freeze Checklist — LC-EPIC-04

| Check | Status |
|---|---|
| Blueprint Traceability | ✅ LC-EPIC-04 mapped from Capability Backlog |
| PRD Complete | ✅ LC-PRD-04 v0.1 |
| Domain Spec Frozen | ✅ LC-SPEC-04a v0.1 |
| API Spec Frozen | ✅ LC-SPEC-04b v0.1 |
| Workflow Spec Frozen | ✅ LC-SPEC-04c v0.1 |
| UX Spec Frozen | ✅ LC-SPEC-04d v0.1 |
| Test Spec Frozen | ✅ LC-SPEC-04e v0.1 |
| Code Evidence Verified | ✅ All specs reference existing code |
| Architecture Drift | None — no code changes required |
