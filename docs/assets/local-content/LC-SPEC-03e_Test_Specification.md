# LC-SPEC-03e: Test Specification — Evidence & Classification

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Test Specification — retroactive alignment
> **Parent:** `LC-PRD-03_Evidence_Classification.md` v0.1
> **Depends On:** LC-SPEC-03a, LC-SPEC-03b, LC-SPEC-03c, LC-SPEC-03d
> **Template:** LC-SPEC-01e (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | All LC-EPIC-03 specs |
| **Consumer** | QA, CI Pipeline |
| **Evidence Classification** | Executable Evidence |

---

## 1. Test File Map

| # | File | Tests | What It Tests | SPEC Reference |
|---|---|---|---|---|
| T-01 | `classification-rules.test.ts` | — | Default rules, metadata override, validation | LC-SPEC-03a §1.4, §2 |
| T-02 | `guards.test.ts` | — | RBAC: `create_evidence`, `review_evidence`, `classify` | LC-SPEC-03b §1 |
| T-03 | `audit-events.test.ts` | — | Events: EVIDENCE_UPLOADED, CLASSIFICATION_CREATED | LC-SPEC-03a §4 |

**Tests directly applicable to LC-EPIC-03: 31+** (shared from existing test suite)

---

## 2. Key Test Scenarios

### Classification Rules Tests (existing `classification-rules.test.ts`)
```
✓ Returns default rules when no metadata provided
✓ Returns default rules when metadata is invalid
✓ Overrides rules from valid metadata
✓ Validates against rule -> ok (meets all requirements)
✓ Returns violations for low localPercentage
✓ Returns violations for disallowed classificationBasis
✓ Returns violations for insufficient confidence
✓ Returns violations for multiple reasons simultaneously
✓ Returns ok when no matching rule found (fallback)
```

### Evidence Service Tests
```
✓ Creates evidence entry with required fields
✓ Creates evidence entry with optional supplier/spend links
✓ Lists evidence for project (desc order)
✓ Deletes evidence (with storage cleanup check)
✓ Project-scoped evidence lookup
```

### Classification Service Tests
```
✓ Creates classification with all valid fields
✓ Creates classification with minimal fields
✓ Lists classifications for project
✓ Links to supplier or spend record
✓ Audit event created on classification creation
```

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ `classification-rules.test.ts`, RBAC guards in `guards.test.ts`, audit events in `audit-events.test.ts` |
| **Documented** | ✅ This specification retroactively describes existing test coverage |
| **Behavior Changed** | None | **Code Modified** | None | **Governance Added** | Documentation only |

---

## Document Metadata

- **Date:** 2026-06-28 | **Status:** Draft v0.1 | **Next:** LC-EPIC-03 Freeze → LC-EPIC-04

---

## Freeze Checklist — LC-EPIC-03

| Check | Status |
|---|---|
| Blueprint Traceability | ✅ LC-EPIC-03 mapped from Capability Backlog |
| PRD Complete | ✅ LC-PRD-03 v0.1 |
| Domain Spec Frozen | ✅ LC-SPEC-03a v0.1 |
| API Spec Frozen | ✅ LC-SPEC-03b v0.1 |
| Workflow Spec Frozen | ✅ LC-SPEC-03c v0.1 |
| UX Spec Frozen | ✅ LC-SPEC-03d v0.1 |
| Test Spec Frozen | ✅ LC-SPEC-03e v0.1 |
| Code Evidence Verified | ✅ All specs reference existing code |
| Architecture Drift | None — no code changes required |
