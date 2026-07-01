# LC-SPEC-01c: Workflow Specification — Project Management

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Workflow Specification — retroactive alignment documenting the state machines, transition rules, tab gates, approval routing, and scoring workflow for LocalContentOS Project Management.
> **Parent:** `LC-PRD-01_Project_Management.md` v0.1 (Draft)
> **Depends On:** `LC-SPEC-01a_Domain_Specification.md` v0.1, `LC-SPEC-01b_API_Specification.md` v0.1
> **Template:** Adapted from `SPEC-01c_Workflow_Specification.md` (IES-001 Reference)
> **Note:** All workflows documented here reflect the existing implementation in `src/lib/core/workflow/state-machine.ts`, `src/lib/local-content/workflow-gating.ts`, and `src/lib/local-content/approval-routing.ts`. No new design.

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | LC-SPEC-01a, LC-SPEC-01b |
| **Blocks** | LC-SPEC-01e (Test Specification) |
| **Consumer** | Domain Engineering, QA, Workflow Automation Teams |
| **Evidence Classification** | Executable Evidence — all workflows trace to existing code |

---

## Inputs

| Input | Source | Section Reference |
|---|---|---|
| Domain Model | LC-SPEC-01a | §2.1 (ProjectStatus), §7 (Transition Guards) |
| API Contracts | LC-SPEC-01b | §1.2 (Server Action Map) |
| State machine definitions | `state-machine.ts` | LOCAL_CONTENT_TEMPLATE with 6 governance transitions |
| Workbook workflow gating | `workflow-gating.ts` | 5-status workbook state machine + 7 tab gates |
| Approval routing | `approval-routing.ts` | 5-phase routing with 4 reviewer roles |

---

## Outputs

| Output | Description | Consumer |
|---|---|---|
| Project State Machine | 11-state lifecycle with 6 governance transitions | QA, Workflow team |
| Workbook State Machine | 5-status workbook lifecycle | Data processing team |
| Tab Gate Matrix | 7 tab gates governing workbook UI access | UX, Frontend teams |
| Approval Routing | 5-phase review/approval flow | Review pipeline |
| Scoring Workflow | Deterministic 4-factor scoring flow | Scoring engine |

---

## Dependencies

| Dependency | Type | Impact if Missing |
|---|---|---|
| `WorkflowEngine.getProductTemplate()` | Core shared engine | Cannot validate governance transitions |
| `approval-routing.ts` routing calculator | Service | Cannot determine approval phase |
| `scoring.ts` | Service | No score calculation |

---

# 1. Project State Machine

LocalContentOS projects follow an **11-state lifecycle** with **6 governance transitions** enforced by the Core Workflow Engine.

## 1.1 State Diagram

```
                  ┌──────────────┐
                  │    Draft     │
                  └──────┬───────┘
                         │
                  ┌──────▼───────┐
                  │DataCollection│
                  └──────┬───────┘
                         │
                  ┌──────▼────────────┐
                  │ClassificationInPro│
                  └──────┬────────────┘
                         │
                  ┌──────▼────────┐
                  │EvidenceReview │
                  └──────┬────────┘
                         │
                  ┌──────▼───────────┐
                  │ FindingsDrafted  │
                  └──────┬───────────┘
                    │    │    │          (submit)
                    │    │    └──────────────────┐
                    │    │                       │
                    │    │              ┌────────▼──────┐
                    │    │      ┌──────│   InReview     │◄─────────┐
                    │    │      │      └───┬────┬───────┘          │
                    │    │      │          │    │                  │
                    │    │      │    ┌─────┘    └──────┐           │
                    │    │      │    │                │           │
                    │    │      │    ▼                ▼           │
                    │    │      │ ┌──────────┐  ┌──────────┐      │
                    │    │      │ │Approved  │  │ Rejected │      │
                    │    │      │ └────┬─────┘  └──────────┘      │
                    │    │      │      │                          │
                    │    │      │      ▼                          │
                    │    │      │ ┌──────────┐                    │
                    │    │      │ │RptReady  │                    │
                    │    │      │ └────┬─────┘                    │
                    │    │      │      │                          │
                    │    │      │      ▼                          │
                    │    │      │ ┌──────────┐      ┌──────────┐  │
                    │    │      │ │Exported  │      │ Returned │──┘  (return)
                    │    │      │ └──────────┘      └──────────┘
                    │    │      │
                    │    │      ▼
                    │    │ ┌──────────┐
                    │    │ │Archived  │
                    │    │ └──────────┘
                    │    │
                    └────┘ (any → any before InReview: no governance gate)
```

## 1.2 Governance Transitions

The Core Workflow Engine (`state-machine.ts`) enforces these governance transitions:

| Transition ID | From State | Action | To State | Enforcement |
|---|---|---|---|---|
| GT-01 | Draft, FindingsDrafted | `submit` | InReview | `assertLocalContentGovernanceTransition()` |
| GT-02 | InReview | `approve` | Approved | Approval routing must be satisfied |
| GT-03 | InReview | `reject` | Rejected | Any reviewer/approver with reject permission |
| GT-04 | InReview | `return` | Returned | Reviewer return action |
| GT-05 | Approved, ReportReady | `archive` | Archived | Admin/Operator only |
| GT-06 | ReportReady | — (auto) | Exported | On report generation + export action |

## 1.3 Non-Governance Transitions

Transitions between Draft, DataCollection, ClassificationInProgress, EvidenceReview, and FindingsDrafted are **not governed** by the Core workflow engine. They progress naturally as data completeness advances.

## 1.4 Transition Validation Flow

```
User Action → Server Action → assertProjectAccess(pid, action)
                                 │
                                 ▼
                    assertLocalContentGovernanceTransition(from, to)
                                 │
                                 ▼
                    WorkflowEngine.evaluateTransition({
                      productKey: "local_content",
                      fromStatus: current,
                      action: inferred_action
                    })
                                 │
                                 ▼
                    { allowed: boolean, toStatus?: string }
                    Throws Error if not allowed
```

---

# 2. Workbook State Machine

The Workbook entity has its own 5-state lifecycle, separate from the Project state machine.

## 2.1 Workbook States

```typescript
const LC_WORKBOOK_STATUSES = [
  "draft",       // Initial state — empty workbook
  "populated",   // Data imported and lines filled
  "partial",     // Some lines filled, some missing
  "complete",    // All lines filled — ready for export
  "exported",    // Terminal state — workbook locked
] as const;
```

## 2.2 Workbook Transitions

```
  draft ──────► populated
   │                │
   │                ▼
   │            partial ──► complete ──► exported
   │                ▲
   └────────────────┘
```

Explicit transition map from `workflow-gating.ts`:

| From | To | Notes |
|---|---|---|
| `draft` | `populated`, `partial` | Initial population |
| `populated` | `partial`, `complete`, `populated` | Can re-populate |
| `partial` | `populated`, `complete` | Complete or refresh |
| `complete` | `populated`, `exported` | Export is one-way; can return to populated |
| `exported` | (none) | **Terminal state** — no transitions out |

## 2.3 Enforcement

Enforced by `requireTransition()` in `workflow-gating.ts`:

```typescript
function requireTransition(current: string, next: string): void {
  // Throws Error with Arabic error message if not allowed
}
```

---

# 3. Tab Gate Matrix

The workbook UI provides 7 tabs, each with a gate that controls access based on workbook state.

| Tab Key | Locked When | Reason (Arabic) | Gate Function |
|---|---|---|---|
| `lines` | Never | — | Always accessible |
| `missing` | `draft` | "استورد الميزان أولا لتعبئة الدفتر." | Import TB data first |
| `requests` | `draft` | "استورد الميزان أولا لتعبئة الدفتر." | Import TB data first |
| `tb-import` | `exported` | "تم تصدير الدفتر ولا يمكن استيراد ميزان جديد." | Cannot import after export |
| `export` | `completionPct < 100` | "أكمل جميع البنود (X%) قبل التصدير." | Must be 100% complete |
| `export` | `exported` | "تم تصدير الدفتر مسبقاً." | Already exported |
| `manual-edit` | `exported` | "تم تصدير الدفتر ولا يمكن تعديل القيم." | Values locked after export |

**Contract:**

```typescript
function evaluateWorkbookTabGate(tabKey: string, ctx: WorkbookGateContext): TabGateResult
// { locked: boolean, reason?: string }
```

---

# 4. Approval Routing

Review/approval follows a deterministic 5-phase routing algorithm (`approval-routing.ts`).

## 4.1 Approval Routing Phases

```
  ┌──────────────────┐
  │ awaiting_reviews  │  ← Initial state — project submitted for review
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │ ready_for_approval│  ← Minimum distinct reviewers satisfied
  └────────┬─────────┘
        ┌──┴──┐
        │     │
        ▼     ▼
  ┌────────┐ ┌──────────┐
  │approved│ │ rejected │
  └────────┘ └──────────┘
        │
        ▼
  ┌──────────┐
  │ returned │  ← Can return to awaiting_reviews on revisit
  └──────────┘
```

## 4.2 Routing Rules

| Rule | Value | Source |
|---|---|---|
| Min distinct reviewers | 2 | `LOCAL_CONTENT_REVIEW_POLICY.minDistinctReviewers` |
| Submit actions | `["submitted"]` | Actions counted as distinct review submissions |
| Return action | `"returned"` | Single return returns to awaiting_reviews |

## 4.3 Algorithm

```typescript
function computeApprovalRoutingState(
  reviews: LocalContentReviewRow[],
  approvals: LocalContentApprovalRow[],
): ApprovalRoutingState {
  // 1. Filter reviews by "effective" cycle (post-latest return)
  // 2. Count distinct submitters (by reviewerId)
  // 3. If distinct >= minDistinctReviewers → ready_for_approval
  // 4. If return exists → returned
  // 5. If approval exists → approved / rejected
}
```

## 4.4 State Object

```typescript
interface ApprovalRoutingState {
  phase: ApprovalRoutingPhase;
  requiredReviewers: number;      // 2
  distinctSubmitters: number;     // Current count
  submitterIds: string[];         // Who has submitted
  slotsRemaining: number;         // 2 - distinctSubmitters
  hasReturn: boolean;             // Was returned?
  canSubmitApproval: boolean;     // ready_for_approval?
  blockReason?: string;           // Why not ready
}
```

---

# 5. Scoring Workflow

Deterministic scoring (`scoring.ts`) computes the project's local content score.

## 5.1 Scoring Pipeline

```
Trigger: calculateProjectScore(projectId)
    │
    ├─ 1. Fetch all suppliers for project
    ├─ 2. For each supplier, compute weighted score:
    │      ├── localityFactor  (40 points)
    │      ├── ownershipFactor (25 points)
    │      ├── workforceFactor (20 points)
    │      └── declaredContent (15 points)
    ├─ 3. Aggregate supplier scores → project score
    ├─ 4. Map score to tier:
    │      ├── strong    (>= 70)
    │      ├── moderate  (>= 50)
    │      ├── weak      (>= 30)
    │      └── critical  (< 30)
    └─ 5. Return ScoringResult { score, tier, breakdown }
```

## 5.2 Weight Table (`SUPPLIER_SCORE_WEIGHTS`)

| Factor | Weight | Computation |
|---|---|---|
| Locality | 40 | `local` = 40, `mixed` = 40 × (declared%/100), `non_local` = 0, `unclassified` = 10 |
| Ownership | 25 | `Saudi` = 25, `joint_venture` = 15, `foreign` = 4, default = 9 |
| Workforce | 20 | = 20 × (local workforce %)/100, default = 8 (if null) |
| Declared Content | 15 | = 15 × (local content %)/100 |
| **Total** | **100** | Sum of all factors |

## 5.3 Tier Mapping

| Score Range | Tier |
|---|---|
| 70 — 100 | `strong` |
| 50 — 69 | `moderate` |
| 30 — 49 | `weak` |
| 0 — 29 | `critical` |

---

# 6. Workflow Sequence: End-to-End Project Lifecycle

```
 1. CREATE  ──► Draft
    │  Supplier creation, spend import, evidence upload
    │  (no governance gates)
    ▼
 2. PROCESS ──► DataCollection → ClassificationInProgress → EvidenceReview
    │  Classification rules applied, findings drafted
    │  (no governance gates)
    ▼
 3. SUBMIT  ──► FindingsDrafted
    │  User clicks "Submit for Review"
    │  GT-01: Governance transition (submit)
    ▼
 4. REVIEW  ──► InReview
    │  2 distinct reviewers must submit reviews
    │  Routing state → ready_for_approval
    ▼
 5. APPROVE ──► Approved (GT-02) / Rejected (GT-03) / Returned (GT-04)
    │  If Returned: cycle back to FindingsDrafted
    ▼
 6. REPORT  ──► ReportReady
    │  Generate assessment summary / spend classification / evidence index
    │  Export: PDF or XLSX
    ▼
 7. EXPORT  ──► Exported
    │  Final output generated, distributed
    ▼
 8. ARCHIVE ──► Archived (GT-05)
    │  Terminal — no further transitions
```

---

# Traceability

| SPEC Element | PRD Reference | Code Evidence | Evidence Classification |
|---|---|---|---|
| Project State Machine (§1) | §8 (Workflow) | `state-machine.ts` LOCAL_CONTENT_TEMPLATE | Executable |
| Workbook State Machine (§2) | §8 (Workbook) | `workflow-gating.ts` (ALLOWED_TRANSITIONS) | Executable |
| Tab Gate Matrix (§3) | §8 (Tab Access) | `workflow-gating.ts` (WORKBOOK_TAB_GATES) | Executable |
| Approval Routing (§4) | §8 (Review/Approval) | `approval-routing.ts` (computeApprovalRoutingState) | Executable |
| Scoring Workflow (§5) | §8 (Scoring) | `scoring.ts` (SUPPLIER_SCORE_WEIGHTS, score functions) | Executable |
| End-to-End Lifecycle (§6) | §5 (User Journeys) | Combined `services.ts` + actions | Executable |
| Constitution Principle: Deterministic Scoring | §4, DR-03 | `scoring.ts` — no AI calls, rule-based only | Governance |

---

## Alignment Delta

Because this is a **Brownfield Alignment** (LIA-001) and not a Greenfield or Cross-Product design:

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ Project state machine in `state-machine.ts`, workbook gating in `workflow-gating.ts`, approval routing in `approval-routing.ts`, scoring in `scoring.ts` |
| **Documented** | ✅ This specification retroactively describes the existing workflow rules |
| **Behavior Changed** | None |
| **Code Modified** | None |
| **Governance Added** | Documentation only |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Workflow Specification — Brownfield Alignment
- **Date:** 2026-06-28
- **Version:** 0.1 (Draft)
- **Parent:** `LC-PRD-01_Project_Management.md` v0.1
- **Program:** LIA-001 (LC-EPIC-01)
- **Status:** **Frozen** (LC-EPIC-01 complete)
- **Next:** LC-SPEC-01d (UX Specification) — *already frozen*
