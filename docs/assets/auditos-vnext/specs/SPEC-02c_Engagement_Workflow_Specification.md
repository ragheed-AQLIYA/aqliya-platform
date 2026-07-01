# SPEC-02c: Workflow Specification — Engagement Management

> **Status:** Draft v0.1 | **Date:** 2026-06-28
> **Program:** CPV-001 | **Template:** SPEC-01c (inherited)
> **Focus:** First non-linear workflow test against the Reference Workflow Template

---

## Inherited Without Change (Engineering Standard)

| Element | Source | Status |
|---|---|---|
| WorkflowDefinition | SPEC-01c §1.1 | ✅ Inherited |
| workflowVersion | SPEC-01c §1.1 | ✅ Inherited |
| Guard Pipeline (ordered, fail-fast, deterministic) | SPEC-01c §2.1 | ✅ Inherited |
| Guard Phases (validation → business → governance) | SPEC-01c §2.1 | ✅ Inherited |
| GuardResult type | SPEC-01c §2.6 | ✅ Inherited |
| WorkflowSnapshot | SPEC-01c §8 | ✅ Inherited |
| Compensation Matrix | SPEC-01c §7.2 | ✅ Inherited |
| SLA Policy Model | SPEC-01c §4.1 | ✅ Inherited |
| Deterministic Execution | SPEC-01c §2.1 | ✅ Inherited |

---

## 5 Hypothesis Tests (AuditOS-specific)

| # | Hypothesis | Test |
|---|---|---|
| W-01 | Non-linear State Graph — template accepts loops | Engagement lifecycle with review → fieldwork → review |
| W-02 | Nested Review Loops — deterministic execution preserved | Multiple revision cycles without state corruption |
| W-03 | Multi-level Approval Gates — guard pipeline unchanged | Senior → Manager → Partner → Quality, same 3 phases |
| W-04 | Revision Replay — SLA + snapshot preserve cycle history | Each revision maintains separate SLA + snapshot |
| W-05 | Workflow Engine independence — no coupling to Domain/Evidence/Knowledge | Engine knows only stages and transitions |

---

## 1. State Machine (Non-linear)

```
Proposal → Acceptance → Planning → RiskAssessment → Fieldwork
                                                       │
                                                       ▼
                                                  InReview ──→ Reporting → SignOff → Archived
                                                       │
                                              (findings  │
                                               require   │
                                               revision) │
                                                       │
                                                       ▼
                                                  Fieldwork (revision #1)
                                                       │
                                                       ▼
                                                  InReview (#2)
                                                       │
                                               ───────┘
```

### W-01 Test: Non-linear State Graph

**Template claim:** SPEC-01c supports non-linear transitions.

```typescript
const ENGAGEMENT_STAGES = [
  { name: "Proposal", sortOrder: 1 },
  { name: "Acceptance", sortOrder: 2 },
  { name: "Planning", sortOrder: 3 },
  { name: "RiskAssessment", sortOrder: 4 },
  { name: "Fieldwork", sortOrder: 5 },
  { name: "InReview", sortOrder: 6 },
  { name: "Reporting", sortOrder: 7 },
  { name: "SignOff", sortOrder: 8 },
  { name: "Archived", sortOrder: 9 },
];

const ENGAGEMENT_TRANSITIONS = [
  // Linear forward
  { action: "accept", from: "Proposal", to: "Acceptance" },
  { action: "plan", from: "Acceptance", to: "Planning" },
  { action: "assess_risk", from: "Planning", to: "RiskAssessment" },
  { action: "start_fieldwork", from: "RiskAssessment", to: "Fieldwork" },
  { action: "submit_review", from: "Fieldwork", to: "InReview", guard: "evidenceGate" },
  { action: "approve_review", from: "InReview", to: "Reporting", guard: "reviewComplete" },
  { action: "report", from: "Reporting", to: "SignOff", guard: "qualityReviewDone" },
  { action: "sign_off", from: "SignOff", to: "Archived" },

  // Non-linear: review loop
  { action: "return_to_fieldwork", from: "InReview", to: "Fieldwork", guard: "returnRequiresReason" },
];
```

**Validation:** One `from` → one `to` per action. Loops are valid as long as each transition has a unique `(from, action)` pair.

### Transition Classification Matrix

| Type | Examples | Template Validity |
|---|---|---|
| **Forward** | Proposal → Acceptance, Planning → RiskAssessment | ✅ Linear — same as SPEC-01c |
| **Loop** | InReview → Fieldwork (return_to_fieldwork) | ✅ Non-linear — template supports (from, action) uniqueness |
| **Terminal** | SignOff → Archived | ✅ Same as SPEC-01c terminal stages |
| **Administrative** | Reopen (future), Amend (future) | ⏳ Not yet tested — added for template completeness |

**Template implication:** The Workflow Template does not distinguish between forward/loop/terminal transitions at the definition level. The distinction exists only in business meaning, not in the engine. This confirms the template's flexibility.

---

## 2. Guard Pipeline

### W-03 Test: Multi-level Approval Gates

Same 3 phases, new guard for multi-level authority:

| Phase | Guard | Action | Error Code |
|---|---|---|---|
| Validation | Input validation | all | VALIDATION_ERROR |
| Business | reviewerNotAuthor | approve_review | BUSINESS_RULE_FAILED |
| Business | returnRequiresReason | return_to_fieldwork | VALIDATION_ERROR |
| Governance | evidenceGate | submit_review | GOVERNANCE_BLOCKED |
| Governance | qualityReviewDone | sign_off | GOVERNANCE_BLOCKED |

**Template claim:** Guard pipeline remains unchanged — only guard functions change.

### W-02 Test: Nested Loops (Deterministic Execution)

```typescript
// Same input, same revision cycle → same result
function determineNextReviewCycle(
  engagementId: string,
  currentRevision: number,
  previousDecisions: ReviewRecord[],
): ReviewCycleResult {
  // Deterministic: based on findings resolution status, not randomness
  // Returns: { shouldReturn: boolean, reason: string }
}
```

**Determinism rules:**
- Same unresolved findings → same decision to return to fieldwork
- Same review records → same approval path
- Revision number does NOT affect business logic — only tracking

### Loop Invariants

These rules must hold regardless of how many revision cycles occur:

| Invariant | Description | Violation |
|---|---|---|
| LI-01 | `revisionNumber` is monotonically increasing | Resetting or reusing a revision number |
| LI-02 | ReviewRecords are append-only. No deletions, no modifications | Editing or deleting a past ReviewRecord |
| LI-03 | Cannot return to a previous revision | Going from revision #3 back to revision #2 state |
| LI-04 | WorkflowSnapshots are immutable. Never replaced. | Overwriting a past snapshot |
| LI-05 | Each revision cycle has exactly one `in_review` entry and one `returned_to_fieldwork` or `approve_review` | Missing or duplicated cycle-end events |

---

## 3. SLA Rules

### W-04 Test: Revision Replay + SLA

| Stage | SLA | Revision Behavior |
|---|---|---|
| Fieldwork | 30 days | Reset per revision (new revision = new timer) |
| InReview | 5 days | Reset per revision cycle |
| Reporting | 10 days | Single timer |
| SignOff | 5 days | Single timer |

```typescript
// SLA per revision cycle — each revision has its own timer
interface RevisionTimer {
  revisionNumber: number;
  fieldworkStartedAt: string;
  fieldworkSLABreachAt: string;
  reviewStartedAt: string;
  reviewSLABreachAt: string;
}
```

**WorkflowSnapshot records each revision separately.**

---

## 4. Workflow Engine Independence

### W-05 Test: No coupling to Domain/Evidence/Knowledge

| Element | Workflow Engine Responsibility | Not Responsible For |
|---|---|---|
| Stage definitions | ✅ Define valid stages and transitions | ❌ Domain rules enforcement |
| Guard execution | ✅ Execute guard functions | ❌ Guard logic (delegated to Domain) |
| Transition recording | ✅ Record state changes | ❌ Revision logic (Domain) |
| SLA tracking | ✅ Start/stop/reset timers | ❌ Evidence validation (Domain) |
| Snapshot creation | ✅ Create WorkflowSnapshot | ❌ Knowledge queries (Platform) |

---

## 5. Workflow Snapshots

### Snapshot Evolution Rule

Products may **extend** `WorkflowSnapshot` — they may NOT modify it.

| Principle | Rule |
|---|---|
| Base Snapshot | `WorkflowSnapshot` from SPEC-01c is immutable. Every product inherits it. |
| Extensions | Products add product-specific fields (e.g., `revisionNumber`, `reviewCycleId`). |
| Serialization | Extended snapshots must include base fields unchanged. |
| Replay | Replay tooling must read ALL snapshot fields — base + extensions. |

```typescript
// SPEC-01c base (immutable)
interface WorkflowSnapshot {
  snapshotId, workflowId, workflowVersion, correlationId,
  dealId, action, fromStage, toStage, actorId,
  guardPipeline, transitionRequestedAt, transitionCompletedAt,
  versionBefore, versionAfter, error
}

// AuditOS extension — adds revision tracking
interface AuditOSWorkflowSnapshot extends WorkflowSnapshot {
  revisionNumber: number;
  reviewCycleId: string;
  revisionTimer?: RevisionTimer;
}
```

### Replay Determinism

> Given the same history of WorkflowSnapshots, replay must produce the same sequence of snapshots.

```typescript
// Replay test
const history = loadSnapshots(engagementId);
const replayed = replay(history); 
expect(replayed).toEqual(history); // Identical sequence
```

| Property | Guarantee |
|---|---|
| Order | Snapshots are ordered by `sequenceId` |
| Determinism | Replaying events in order always produces the same snapshot sequence |
| Immutability | No snapshot is ever modified after creation |
| Completeness | Every transition produces exactly one snapshot |

---

## 6. Compensation Matrix

Same categories as SPEC-01c §7.2. New row for loop-specific failures:

| Failure Point | Auto-Retry | Manual | Compensate |
|---|---|---|---|
| Revision event not published | ✅ Queue retry | ❌ | ❌ |
| Revision timer not started | ❌ Log only | ❌ | ❌ |
| Guard failure during loop | ❌ | ✅ Admin | ❌ |
| Concurrency during parallel review | ❌ | ✅ Re-read + retry | ❌ |

---

## 7. Test Scenarios (SPEC-01e §4 mapping)

| Scenario | Tests |
|---|---|
| Linear happy path | All 9 stages forward — Proposal → Archived |
| Single review loop | Fieldwork → InReview → return_to_fieldwork → Fieldwork → InReview → Reporting |
| Double review loop | Fieldwork → InReview → return (#1) → ... → return (#2) → ... → Reporting |
| Multi-level approval | Senior approves, Manager approves, Partner signs off |
| SLA breach in loop | Fieldwork SLA expires → escalation during revision #2 |
| Guard failure | Missing evidence blocks submit_review |
| Concurrency | Two reviewers act simultaneously → CONFLICT on second |

---

## 8. Hypothesis Results (to verify during implementation)

| H# | Hypothesis | Method | Expected |
|---|---|---|---|
| W-01 | Non-linear State Graph | Code: transitions allow loops | ✅ PASS |
| W-02 | Nested Loops deterministic | Test: same input → same result across revisions | ✅ PASS |
| W-03 | Multi-level Guards unchanged | Code review: pipeline structure identical to SPEC-01c | ✅ PASS |
| W-04 | Revision Replay + SLA preserved | Test: each revision has independent SLA + snapshot | ✅ PASS |
| W-05 | Workflow Engine independent | Code review: zero imports from Domain/Evidence/Knowledge | ✅ PASS |

---

## Document Metadata

- **Author:** OpenCode | **Program:** CPV-001
- **Version:** 0.2 | **Template:** SPEC-01c
- **Changes from v0.1:** Added Transition Classification Matrix (4 types), Loop Invariants (5 rules), Snapshot Evolution Rule (base immutable, products extend), Replay Determinism test (history → replay → identical sequence).
- **Template Reuse:** ~90% (10% new loop-specific concepts)
- **Status:** Draft v0.2 — ready for review. Next: freeze v1.0 → SPEC-02d (UX).
