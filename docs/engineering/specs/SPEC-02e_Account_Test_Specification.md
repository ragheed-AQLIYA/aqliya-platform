# SPEC-02e: Test Specification — Account Intelligence

> **Status:** Draft v0.1 | **Template:** SPEC-01e | **Reuse:** ~95% | **Cycle:** 2

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | SPEC-02a, SPEC-02b, SPEC-02c, SPEC-02d |
| **Blocks** | Engineering Readiness Review |
| **Consumer** | QA Engineering Team |

---

## Test Categories

Same pyramid as SPEC-01e: Domain (50%), Contract (30%), Integration (15%), E2E (5%).

| Category | Coverage Target |
|---|---|
| Domain Tests | 95%+ |
| API Contract Tests | 95%+ |
| Workflow Tests | 95%+ |
| UX Contract Tests | 90%+ |
| Integration Tests | 85%+ |
| Governance Tests | 100% |

---

## Domain Tests

| Test Group | Count | Focus |
|---|---|---|
| Value Objects | 12 | IcpScore (0-100), HealthScore (0-100), Sensitivity (3 levels), AccountStatus (4 values) |
| Invariants | 8 | DI-01 (name required), DI-02 (icp 0-100), DI-03 (org scoped), DI-04 (archived immutable), DI-05 (health 0-100) |
| Domain Events | 5 | AccountCreated, AccountQualified, AccountScored, AccountDormant, BriefGenerated |
| Domain Errors | 5 | Same 5-error hierarchy |

---

## API Contract Tests

| Test Group | Count | Focus |
|---|---|---|
| Server Actions | 8 | create, update, score, linkContact, brief, list, get, archive |
| Authorization | 4 | Account Manager vs Relationship Manager vs Admin |
| Error Mapping | 6 | Same 5 DomainErrors + FORBIDDEN |
| Concurrency | 3 | Version match, mismatch, retry |

---

## Workflow Tests

| Test Group | Count | Focus |
|---|---|---|
| State Machine | 4 | 4-stage lifecycle transitions |
| Guards | 2 | Admin archive guard, auto-dormancy trigger |
| SLA | 2 | Prospect 30d, Dormant 60d |

---

## UX Contract Tests

| Test Group | Focus |
|---|---|
| ViewModel | No Domain types in output |
| States | All 10 UX states per screen |
| Permissions | Buttons reflect server contracts |
| Accessibility | ARIA, keyboard, contrast |

---

## CI Gates

| Gate | Trigger | Pass |
|---|---|---|
| Commit | Every push | Domain + API + Workflow + UX | 100% |
| PR | Pull request | + Integration + Governance | ≥95% |
| Daily | Scheduled | Observability + Regression | 90% |

---

## Regression Matrix

| AC ID | PRD-02 Criterion | Domain | API | Workflow | UX |
|---|---|---|---|---|---|
| AC-01 | Create account | ✅ | ✅ | — | ✅ |
| AC-02 | Lifecycle transitions | ✅ | — | ✅ | ✅ |
| AC-03 | ICP score compute | ✅ | ✅ | — | — |
| AC-04 | AI brief with governance | — | ✅ | — | ✅ |
| AC-05 | Contact link with sensitivity | ✅ | ✅ | — | ✅ |
| AC-06 | Audit events | — | ✅ | — | — |
| AC-07 | Tenant isolation | — | ✅ | — | — |
| AC-08 | Archived immutable | ✅ | ✅ | ✅ | — |

---

## Traceability

| Element | PRD-02 Reference |
|---|---|
| All test categories | §14 (Test Scenarios), §15 (ACs) |
| Regression matrix | §15 (8 ACs) |
| CI gates | SPEC-01e §11 (reused) |

---

## Document Metadata

- **Author:** OpenCode | **Template:** SPEC-01e | **Reuse:** ~95%
- **Version:** 0.1 | **Status:** Draft
