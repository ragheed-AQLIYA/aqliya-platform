# Engineering Readiness Review — Opportunity Management (EPIC-01)

> **Status:** APPROVED — PENDING ERR EXECUTION | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Gate Review — final checkpoint before Implementation-01.
> **Predecessor documents:**
> - `PRD-01_Opportunity_Management.md` v1.0 (FROZEN)
> - `SPEC-01a_Domain_Specification.md` v1.0 (FROZEN)
> - `SPEC-01b_API_Specification.md` v1.0 (FROZEN)
> - `SPEC-01c_Workflow_Specification.md` v1.0 (FROZEN)
> - `SPEC-01d_UX_Specification.md` v1.0 (FROZEN)
> - `SPEC-01e_Test_Specification.md` v1.0 (FROZEN)
> **Next:** Implementation-01
> **Decision options:** ✅ PASS | ⏸️ PASS WITH CONDITIONS | 🔄 RETURN TO SPEC | ❌ REJECT
> **Lifecycle context:** This ERR closes the **Engineering Design Lifecycle** (Design → Spec → Review). A passing ERR opens the **Software Engineering Lifecycle** (Implementation → Verification → Acceptance → Release).

---

## Purpose

The Engineering Readiness Review (ERR) is the final gate before code begins. It verifies that:

1. All specifications are complete, consistent, and frozen
2. The implementation can start without revisiting architectural decisions
3. The work is properly scoped and packaged for delivery
4. The definition of done is measurable and enforceable

This is NOT a design review. Design is complete. This is an **execution readiness check**.

---

## Review Gates

### Gate 1: Specification Completeness

| # | Check | Status | Evidence Required |
|---|---|---|---|
| C-01 | PRD-01 frozen with no open questions | ⬜ | PRD-01 v1.0 status = FROZEN |
| C-02 | SPEC-01a frozen with no open questions | ⬜ | SPEC-01a v1.0 status = FROZEN |
| C-03 | SPEC-01b frozen with no open questions | ⬜ | SPEC-01b v1.0 status = FROZEN |
| C-04 | SPEC-01c frozen with no open questions | ⬜ | SPEC-01c v1.0 status = FROZEN |
| C-05 | SPEC-01d frozen with no open questions | ⬜ | SPEC-01d v1.0 status = FROZEN |
| C-06 | SPEC-01e frozen with no open questions | ⬜ | SPEC-01e v1.0 status = FROZEN |
| C-07 | All open questions across all specs are resolved | ⬜ | Open Questions sections reviewed |
| C-08 | All assumptions are documented and accepted | ⬜ | Assumptions sections reviewed |

### Gate 2: Cross-Spec Consistency

| # | Check | Status | Verification Method |
|---|---|---|---|
| X-01 | Domain types in SPEC-01a match PRD-01 field definitions | ⬜ | Traceability table cross-reference |
| X-02 | API error codes in SPEC-01b match Domain errors in SPEC-01a | ⬜ | Error mapping table (§1.2) |
| X-03 | Workflow stages in SPEC-01c match Stage value object in SPEC-01a | ⬜ | Stage definitions aligned |
| X-04 | UX ViewModels in SPEC-01d map correctly to API responses in SPEC-01b | ⬜ | ViewModel mapping functions |
| X-05 | Test cases in SPEC-01e cover all PRD-01 acceptance criteria | ⬜ | Regression matrix (§10) |
| X-06 | Authorization permissions consistent across all specs | ⬜ | Permission-to-Action map |
| X-07 | Event types consistent across Domain (SPEC-01a), API (SPEC-01b), Workflow (SPEC-01c) | ⬜ | Event type strings cross-referenced |
| X-08 | No contradictory requirements between any two specs | ⬜ | Manual review |

### Gate 3: Implementation Readiness

| # | Check | Status | Evidence Required |
|---|---|---|---|
| I-01 | Platform Kernel contracts are available (auth, workflow, evidence, event-bus) | ⬜ | Platform Kernel Architecture verified |
| I-02 | Platform Kernel extraction Wave 1 is complete or in progress | ⬜ | Extraction Blueprint status |
| I-03 | Test database is provisioned for integration tests | ⬜ | Docker compose or CI config |
| I-04 | CI pipeline supports the defined test gates (commit, PR, daily, weekly) | ⬜ | CI configuration |
| I-05 | All dependencies (SPECs, Platform contracts, infrastructure) are documented and accessible | ⬜ | Dependency lists per spec |
| I-06 | Team has access to the reference specifications | ⬜ | Document repository |

### Gate 4: Delivery Readiness

| # | Check | Status | Evidence Required |
|---|---|---|---|
| D-01 | Implementation-01 is broken into work packages | ⬜ | Work packages defined below |
| D-02 | Each work package has a clear scope and exit criteria | ⬜ | Work package definitions |
| D-03 | Definition of Done is defined and measurable | ⬜ | DoD defined below |
| D-04 | CI gates are configured per SPEC-01e §11 | ⬜ | CI configuration |
| D-05 | First work package can be completed within 1 sprint | ⬜ | Work package estimation |

### Gate 5: Work Package Readiness

Every work package must pass this gate **before its implementation begins**. This prevents starting work on a package whose prerequisites are not met.

| # | Check | Status | Verification Method |
|---|---|---|---|
| R-01 | Scope is frozen — no ambiguity about what the WP delivers | ⬜ | WP definition reviewed |
| R-02 | All dependencies (other WPs, Platform contracts) are satisfied | ⬜ | Dependency chain verified |
| R-03 | Test strategy exists — what tests will be written and how they will pass | ⬜ | SPEC-01e section referenced |
| R-04 | Acceptance criteria are mapped to SPEC-01e test cases | ⬜ | Regression matrix cross-reference |
| R-05 | Effort estimate is approved — team capacity allocated for the WP's duration | ⬜ | Estimate review |
| R-06 | Risks are identified — known unknowns documented with mitigation plan | ⬜ | Risk log reviewed |

**WP Readiness flow:**

```text
WP-N Definition
    │
    ▼
Gate 5 Check (R-01 through R-06)
    │
    ├── All pass → WP is Ready → Begin implementation
    │
    └── Any fail → WP is Not Ready → Resolve conditions before starting
```

---

## Implementation Work Packages

EPIC-01 (Opportunity Management) is broken into work packages. Each package is independently deliverable and testable.

| WP ID | Name | Scope | Depends On | Estimated Effort | Exit Criteria |
|---|---|---|---|---|---|
| **WP-01** | Domain Core | Deal aggregate, Value Objects, Domain Events, Domain Errors | None | 3-5 days | All Domain tests (SPEC-01e §2) pass |
| **WP-02** | Repository + Persistence | DealRepository implementation, Prisma schema, migrations | WP-01 | 2-3 days | Integration tests (SPEC-01e §6.1) pass |
| **WP-03** | Server Actions (Read) | listDealsAction, getDealAction with pagination + auth | WP-01, WP-02 | 2-3 days | API Contract tests (SPEC-01e §3) pass |
| **WP-04** | Server Actions (Write) | createDealAction, updateDealAction, transitionDealAction, linkEvidenceAction, deleteDealAction | WP-01, WP-02 | 3-5 days | API Contract tests (SPEC-01e §3) pass |
| **WP-05** | Workflow Engine Integration | State machine, transition guards, evidence gates | WP-04 | 3-5 days | Workflow tests (SPEC-01e §4) pass |
| **WP-06** | SLA + Escalation | SLA timers, notification triggers, escalation logic | WP-05 | 2-3 days | SLA tests (SPEC-01e §4.4) pass |
| **WP-07** | UX — Deal List | Deal list screen, filters, pagination, ViewModel, states | WP-03 | 3-5 days | UX tests (SPEC-01e §5) pass |
| **WP-08** | UX — Deal Detail | Deal detail screen, stage progress, evidence panel, review panel, AI brief panel | WP-04, WP-05 | 3-5 days | UX tests (SPEC-01e §5) pass |
| **WP-09** | Governance + Audit | Authorization enforcement, audit trail, constitutional tests | WP-04, WP-05 | 2-3 days | Governance tests (SPEC-01e §7) pass |
| **WP-10** | Observability | Metrics, logs, traces, correlation IDs | WP-03, WP-04, WP-05 | 2-3 days | Observability tests (SPEC-01e §8) pass |

---

## Definition of Done

A work package is **Done** only when all of the following criteria are met:

| # | Criterion | Verification |
|---|---|---|
| DoD-01 | Code compiles with zero TypeScript errors | `npx tsc --noEmit` |
| DoD-02 | All new code has passing unit tests | `npm test -- <package>` |
| DoD-03 | All acceptance criteria for the work package pass | Automated test run |
| DoD-04 | No regression in existing tests | Full test suite |
| DoD-05 | Code review completed and approved | PR approval |
| DoD-06 | Architectural compliance verified (no spec violations) | Manual review against specs |
| DoD-07 | All Platform contracts used correctly (no direct DB access from API layer) | Code review |
| DoD-08 | No new product-to-product dependencies introduced | CI grep |
| DoD-09 | Documentation updated if behavior differs from spec | ADR if needed |

---

## CI Gate Configuration

Per SPEC-01e §11:

| Gate | Trigger | Runs | Pass Required | Action on Failure |
|---|---|---|---|---|
| **Commit** | Every push | Domain + API + Workflow + UX tests | 100% | Blocks PR creation |
| **PR** | Pull request | Commit tests + Integration + Governance | 100% (gov), ≥ 95% (others) | Blocks merge |
| **Daily** | Nightly | Observability + Regression | 90% | Alert |
| **Weekly** | Weekly | Performance | Warning | Non-blocking |

---

## Decision Options

| Decision | Meaning | Action |
|---|---|---|
| ✅ **PASS** | All gates pass. Implementation-01 authorized to start. | Begin WP-01. All specs are baseline. |
| ⏸️ **PASS WITH CONDITIONS** | All gates pass, but conditions must be resolved within the first sprint. Implementation may start. | Begin WP-01. Track conditions as sprint tasks. |
| 🔄 **RETURN TO SPEC** | One or more specifications have identified issues that must be resolved before implementation. | Return to affected spec. Re-freeze. Re-run ERR. |
| ❌ **REJECT** | Fundamental architectural or design issues found. Cannot proceed with current design. | Return to design phase. Architecture Review Board required. |

---

## Mandated ERR Outputs

After the review, the ERR must produce the following artifacts:

| # | Output | Type | Automation | Owner |
|---|---|---|---|---|---|
| ERR-01 | **Consistency verification report** | Evidence Package | ✅ `node tools/err/err-01-consistency.js` | Product Architect |
| ERR-02 | **Acceptance Criteria coverage audit** | Evidence Package | ✅ `node tools/err/err-02-ac-coverage.js` | QA Lead |
| ERR-03 | **Open Questions closure record** | Evidence Package | ✅ `node tools/err/err-03-open-questions.js` | Product Architect |
| ERR-04 | **Platform readiness verification** | Evidence Package | ✅ `node tools/err/err-04-platform-readiness.js` | Platform Architect |
| ERR-05 | **Work Package plan approved** | Human Review | ❌ Manual | Engineering Lead |
| ERR-06 | **DoD + DoR adopted** | Human Review | ❌ Manual | Engineering Lead |
| ERR-07 | **Traceability Matrix** (future) | 🔜 Automated | 🔜 Future | Architecture Board |

**Automation:** Run `cd tools/err && npm run err` to produce ERR-01 through ERR-04 evidence packages in `tools/err/evidence/`.

**How it works:**
1. Evidence scripts read from `tools/err/spec-data/` (structured source-of-truth JSON files mirroring PRD-01, SPEC-01a, SPEC-01b, SPEC-01c)
2. Each check compares data across specifications (e.g., stages in PRD-01 vs SPEC-01a vs SPEC-01c)
3. ERR-04 verifies Platform contracts at 3 levels: file existence → expected exports → version (stub)
4. All evidence is packaged as JSON + Markdown + CSV
5. A `manifest.json` records git commit, checksum, and evidence status for auditability
6. ERR-05 and ERR-06 remain human review

**Architecture note:** `tools/err/spec-data/*.json` is an **Intermediate Representation (IR)** — not the ultimate source of truth. The true source is the Markdown specification documents. Currently, data is manually copied from Markdown to JSON, which introduces potential drift. The next evolution is a **Specification Parser** that reads Markdown directly and generates the IR automatically, eliminating the manual copy step. See `tools/err/README.md` for the target architecture.

---

## Change Control After ERR

After the ERR is signed as PASS or PASS WITH CONDITIONS:

- All specification documents (PRD-01, SPEC-01a through SPEC-01e) become the **frozen baseline**.
- Any modification to a frozen specification must go through **Change Control**:
  1. Document the proposed change
  2. Assess impact on downstream specifications
  3. Obtain Architecture Review Board approval
  4. Update the affected specification version
  5. Communicate the change to all affected teams
- Changes discovered during implementation that do NOT affect contracts (e.g., implementation details, variable names) do not require change control.
- Changes that DO affect contracts (API signatures, domain rules, workflow transitions, UX ViewModel shapes) require change control.

---

## Decision Record

| Gate | Status |
|---|---|
| **G1: Specification Completeness** | ⬜ Pending |
| **G2: Cross-Spec Consistency** | ⬜ Pending |
| **G3: Implementation Readiness** | ⬜ Pending |
| **G4: Delivery Readiness** | ⬜ Pending |
| **G5: Work Package Readiness** | ⬜ Pending (per WP) |

### Overall Decision

| Decision | Selected |
|---|---|
| ✅ **PASS** — All gates pass. Begin Implementation-01. | ⬜ |
| ⏸️ **PASS WITH CONDITIONS** — Conditions documented below. Implementation starts, conditions tracked in sprint. | ⬜ |
| 🔄 **RETURN TO SPEC** — Issues found. Return to affected specification. Re-run ERR after fix. | ⬜ |
| ❌ **REJECT** — Fundamental issues found. Architecture Review Board required. | ⬜ |

### Conditions (if PASS WITH CONDITIONS)

| # | Condition | Affected Spec | Owner | Deadline |
|---|---|---|---|---|
| — | — | — | — | — |

---

## Architecture Drift Review

After ERR is signed and implementation begins, the architecture must not drift from the frozen specifications. A formal Architecture Drift Review is conducted **after every work package completion**.

### Frequency

| Trigger | Reviewer | Format |
|---|---|---|
| After each WP completion | Product Architect + Engineering Lead | 30-minute review |
| After WP-04 (first write operations) | Architecture Review Board | Extended review |
| After WP-09 (governance implementation) | Architecture Review Board | Extended review |

### Drift Checklist

| Check | What It Verifies | Violation Example |
|---|---|---|
| **No contract drift** | API signatures, domain types, event schemas match SPEC-01a/01b/01c | Server Action returns different shape than SPEC-01b |
| **No new coupling** | No direct imports between products | SalesOS v2 code imports from `@/lib/audit` |
| **No bypass of Platform contracts** | Platform capabilities used through their contracts, not bypassed | Direct Prisma access from API layer instead of Platform Evidence Network |
| **ADR impact** | Any new ADR is documented and traced to affected specs | Decision made during implementation without ADR |
| **Technical debt introduced** | Any shortcuts taken are documented with a plan to resolve | `TODO` comments without tracking ticket |

### Drift Resolution

| Severity | Action | Example |
|---|---|---|
| **Green** — No drift | No action | Implementation matches spec |
| **Yellow** — Minor drift | Document in WP completion notes. Resolve before next WP. | Minor field name mismatch in ViewModel |
| **Red** — Major drift | Stop work on current WP. File ADR. Update specification. Return to ERR. | API contract changed without approval. |

---

## ERR Exit Criteria

The Engineering Readiness Review is considered **officially closed** only when ALL of the following are true:

| # | Criterion | How to Verify |
|---|---|---|
| EC-01 | All 5 gates (G1 through G5) have passed | Gate status table |
| EC-02 | All 6 mandated outputs (ERR-01 through ERR-06) have been produced | Output artifacts exist |
| EC-03 | A decision has been recorded (PASS / PASS WITH CONDITIONS) | Decision Record section |
| EC-04 | All required sign-offs have been collected | Sign-Off section |
| EC-05 | The baseline is frozen — no spec modifications without Change Control | Spec status = FROZEN |
| EC-06 | Implementation-01 is authorized — first work package ready to start | WP-01 Gate 5 passed |

### What ERR Exit Means

```text
ERR STATUS = CLOSED
        │
        ├── Engineering Design Lifecycle → ✅ COMPLETE
        │
        └── Software Engineering Lifecycle → ▶️ AUTHORIZED
                │
                ├── Implementation-01
                ├── Verification (per CI gates)
                ├── Acceptance (per PRD-01 ACs)
                └── Release
```

---

## Full Lifecycle Context

### ✅ Completed: Engineering Design Lifecycle

```text
Constitution → ADR → Blueprint → Capability Backlog → PRD
    → Domain Spec → API Spec → Workflow Spec → UX Spec → Test Spec
    → Engineering Readiness Review ← YOU ARE HERE
```

### ▶️ Beginning: Software Engineering Lifecycle

```text
Engineering Readiness Review (PASS)
    ↓
Implementation-01
    ↓
Verification (per SPEC-01e CI gates)
    ↓
Acceptance (per PRD-01 §13)
    ↓
Release
```

---

## Sign-Off

| Role | Sign-Off | Date |
|---|---|---|
| **Product Architect** | ⬜ | — |
| **Platform Architect** | ⬜ | — |
| **Engineering Lead** | ⬜ | — |
| **QA Lead** | ⬜ | — |

---

## Template Note

This document is currently specific to **SalesOS v2 — Opportunity Management (EPIC-01)**. If the ERR methodology proves successful, it should be generalized into a reusable template:

```text
AQLIYA Engineering Readiness Standard (AERS)

Template: ERR-Template.md

Used by:
  - SalesOS v2 ERR
  - AuditOS vNext ERR
  - LocalContentOS vNext ERR
  - FinanceOS ERR
  - Any future product
```

The template would preserve:
- All 5 gates (with product-specific content)
- The 6 mandated outputs (ERR-01 through ERR-06)
- Architecture Drift Review process
- ERR Exit Criteria
- Change Control policy
- 4 decision options

Products would inherit the structure and fill in their specific specifications, dependencies, and work packages.

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Gate Review
- **Date:** 2026-06-28
- **Version:** 1.2
- **Predecessor documents:** PRD-01, SPEC-01a, SPEC-01b, SPEC-01c, SPEC-01d, SPEC-01e (all FROZEN v1.0)
- **Next:** Implementation-01
- **Changes from v1.0:** Decision options expanded to 4. Mandated ERR outputs defined (ERR-01 to ERR-06). Change Control policy added. Full lifecycle context added.
- **Changes from v1.1:** Gate 5 (Work Package Readiness) added with 6 checks (R-01 to R-06). Architecture Drift Review section added (post-WP checks, severity matrix, resolution). ERR Exit Criteria defined (6 criteria EC-01 to EC-06). Template note added for AQLIYA Engineering Readiness Standard.
- **Architecture Review Board Decision (2026-06-28):**
  - **Methodology:** ✅ Approved
  - **Architecture Design:** ✅ Approved
  - **Specification System:** ✅ Approved
  - **ERR Framework:** ✅ Approved
  - **ERR Automation:** ✅ Approved
  - **Implementation:** ✅ **PASS WHEN ERR PROCESS IS COMPLETED** — 6 evidence packages produced, 4 sign-offs obtained.
- **Status:** **APPROVED — PENDING ERR EXECUTION.** Run `cd tools/err && npm run err`, verify evidence, obtain sign-offs, record PASS decision, begin WP-01: Domain Core.
