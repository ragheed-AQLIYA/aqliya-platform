# LC-SPEC-05e: Test Specification — Approval & Export

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Test Specification — retroactive alignment
> **Parent:** `LC-PRD-05_Approval_Export.md` v0.1
> **Depends On:** All LC-EPIC-05 specs | **Template:** LC-SPEC-01e (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | All LC-EPIC-05 specs |
| **Consumer** | QA, CI Pipeline |
| **Evidence Classification** | Executable Evidence |

---

## 1. Test File Map

| # | File | What It Tests | SPEC Reference |
|---|---|---|---|
| T-01 | `approval.test.ts` | Approval submission, prerequisite validation, routing state | LC-SPEC-05b §1, LC-SPEC-05c §1 |
| T-02 | `report.test.ts` | Report generation, scoring metadata, disclaimer | LC-SPEC-05b §1, LC-SPEC-05c §2 |
| T-03 | `guards.test.ts` | RBAC: `approve`, `create_spend` (for reports) | LC-SPEC-05b §1 |

---

## 2. Key Test Scenarios

### Approval Tests
```
✓ Submits approval with valid data and completed reviews
✓ Rejects approval when no reviews exist
✓ Rejects approval when reviews are in "returned" state
✓ Creates audit event on approval submission
✓ Lists approvals for project
✓ Computes correct routing state
```

### Report Tests
```
✓ Generates report with valid type and format
✓ Includes bilingual disclaimer in report metadata
✓ Includes scoring data (localContent%, totalSpend, etc.)
✓ Creates audit event on generation
✓ Lists reports for project
```

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ Approval + report logic in services.ts + actions |
| **Documented** | ✅ This spec retroactively describes existing test coverage |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Freeze:** ✅ LC-EPIC-05 FROZEN

---

## Freeze Checklist — LC-EPIC-05

| Check | Status |
|---|---|
| Blueprint Traceability | ✅ LC-EPIC-05 mapped from Capability Backlog |
| PRD Complete | ✅ LC-PRD-05 v0.1 |
| Domain Spec Frozen | ✅ LC-SPEC-05a v0.1 |
| API Spec Frozen | ✅ LC-SPEC-05b v0.1 |
| Workflow Spec Frozen | ✅ LC-SPEC-05c v0.1 |
| UX Spec Frozen | ✅ LC-SPEC-05d v0.1 |
| Test Spec Frozen | ✅ LC-SPEC-05e v0.1 |
| Code Evidence Verified | ✅ All specs reference existing code |
| Architecture Drift | None — no code changes required |
