# SPEC-02a: Domain Specification — Engagement Management

> **Status:** Draft v0.1 | **Date:** 2026-06-28
> **Program:** CPV-001 | **Template:** SPEC-01a (inherited)
> **Focus:** 5 new pressure points — not re-proving established patterns

---

## Inherited Without Change (Engineering Standard)

| Element | Source | Status |
|---|---|---|
| Aggregate pattern | SPEC-01a §1 | ✅ Inherited |
| Value Object pattern | SPEC-01a §2 | ✅ Inherited |
| Domain Error Model (5 errors) | SPEC-01a §4 | ✅ Inherited |
| Repository principle (Aggregates only) | SPEC-01a §5 | ✅ Inherited |
| Event versioning (eventVersion: 1) | SPEC-01a §3 | ✅ Inherited |
| Concurrency model (version field) | SPEC-01a §1 | ✅ Inherited |
| Ubiquitous Language | SPEC-01a §9 | ✅ Inherited |

---

## 5 Hypothesis Tests

| # | Hypothesis | Test |
|---|---|---|
| H-01 | Engagement remains the Aggregate Root despite Findings and Workpapers being separate aggregates | Engagement boundary holds |
| H-02 | Non-linear review loop does not break invariants | Loop-safe lifecycle |
| H-03 | Chain of Custody stays in Platform Evidence Network — no leakage into Domain | Evidence ownership clean |
| H-04 | Multi-level review is a Domain Rule, not a Workflow Rule | Review hierarchy belongs to aggregate |
| H-05 | Domain remains independent from Knowledge platform | Knowledge is consumed, not owned |

---

## 1. Engagement Aggregate

```typescript
type EngagementStatus = "Proposal" | "Accepted" | "Planning" | "RiskAssessment"
  | "Fieldwork" | "InReview" | "Reporting" | "SignOff" | "Archived";

interface Engagement {
  id: string;
  clientId: string;
  period: string;
  status: EngagementStatus;
  team: EngagementTeam[];
  materiality?: MaterialityThreshold;
  
  // Review tracking — multi-level
  reviewHistory: ReviewRecord[];
  qualityReviewCompleted: boolean;

  // Domain ownership boundary
  workpaperIds: string[];     // references only
  findingIds: string[];       // references only
  evidenceRefs: string[];     // references to Platform Evidence Network

  version: number;
  createdAt: string;
  updatedAt: string;
}
```

### H-01 Test: Aggregate Boundary

| Owned by Engagement | Referenced (externally owned) | Forbidden |
|---|---|---|
| Status | Client (Client aggregate) | Direct modification of Workpaper content |
| Team assignments | Findings (Finding aggregate) | Direct modification of Finding content |
| Review history | Workpapers (Workpaper aggregate) | Direct mutation of evidence metadata |
| Materiality (computed) | Evidence (Platform Evidence Network) | Bypassing Platform Evidence contract |

**Assertion:** Engagement does NOT own Findings, Workpapers, or Client data.
**Rule:** Any forbidden action must go through the owning aggregate or Platform service.

---

### H-02 Test: Loop-Safe Lifecycle

```
Proposal → Acceptance → Planning → RiskAssessment → Fieldwork
                                                       │
                                                       ▼
                                                  InReview ──→ Reporting → SignOff → Archived
                                                       │
                                                       └── (findings unresolved) ──→ Fieldwork
```

**Invariants during loop:**

| Invariant | Description |
|---|---|
| DI-01 | Engagement status must always be a valid state in the lifecycle |
| DI-02 | When returning from InReview to Fieldwork, a reason must be documented |
| DI-03 | InReview → Fieldwork transition does NOT reset completed workpapers |
| DI-04 | QualityReview is only checked at SignOff, not at every Review cycle |

#### Revision / Replay Model

The review loop creates revisions. Each cycle from InReview → Fieldwork → InReview is tracked:

```typescript
interface RevisionCycle {
  revisionNumber: number;       // monotonically increasing, starts at 1
  returnedToFieldworkAt: string;
  reason: string;               // required — what triggered the revision
  returnedToFieldworkBy: string;
  reReviewedAt?: string;        // when the revision was re-submitted for review
  resolved: boolean;
}
```

**Rules:**

| Rule | Enforcement |
|---|---|
| Each cycle from InReview → Fieldwork creates a new RevisionCycle | revisionNumber incremented |
| Reason for return is required — cannot return without documenting cause | ValidationError if missing |
| Previous ReviewRecords are preserved — NOT replaced or reset | Historical review chain intact |
| Workpapers completed in prior cycles are NOT invalidated | Only findings related to the return reason are reopened |
| Replay from any revisionNumber reconstructs engagement state at that point | Domain Events + RevisionCycles provide full history |

---

### H-03 Test: Evidence Ownership

```
Engagement → Finding → Workpaper → Evidence (Platform Evidence Network)
                                         │
                                         └──→ Client Source Document
```

**Rules:**

| Rule | Enforcement |
|---|---|
| Evidence is linked via `platform.evidence` contract | No direct evidence storage in Engagement Domain |
| Engagement stores only `evidenceRefs[]` — string references | No evidence metadata duplication |
| Chain-of-custody metadata sits in Platform Evidence layer | Not in Domain. If Platform Evidence lacks this, it's a Platform gap, not a Domain gap |
| **Engagement may reference evidence, but may never mutate evidence** | Domain has no write access to evidence content, metadata, chain-of-custody, or retention flags |
| Delete evidence | ❌ Forbidden — Platform Evidence Network only |
| Edit evidence metadata | ❌ Forbidden — Platform Evidence Network only |
| Replace evidence hash | ❌ Forbidden — Platform Evidence Network only |
| Set retention period | ❌ Forbidden — Platform Evidence Network only |

---

### H-04 Test: Review Hierarchy

```typescript
interface ReviewRecord {
  level: "senior" | "manager" | "partner" | "quality";
  reviewerId: string;
  decision: "approved" | "revision_required" | "rejected";
  reason: string;
  reviewedAt: string;
}

// Domain Rule: Quality Review must be completed before SignOff
function canSignOff(engagement: Engagement): boolean {
  const qualityReview = engagement.reviewHistory.find(r => r.level === "quality");
  return qualityReview?.decision === "approved";
}
```

**Assertion:** Multi-level review is a Domain invariant, not a Workflow configuration. The Workflow Engine enforces the transition; the aggregate enforces the rule.

#### Review Authority Matrix

| Level | May Approve | May Reject | May Return to Fieldwork | Final Authority |
|---|---|---|---|---|
| Senior | ✅ Workpapers | ✅ Workpapers | ✅ Own work | ❌ |
| Manager | ✅ Workpapers, Fieldwork stage | ✅ Findings | ✅ Team work | ❌ |
| Partner | ✅ Engagement overall, Sign-off | ✅ Engagement | ✅ Engagement | ✅ Sign-off |
| Quality Reviewer | ✅ Sign-off (independence) | ❌ (recommends only) | ❌ | ✅ Quality gate |

**Domain Rule:** A reviewer at any level cannot be the author of the workpaper or finding under review.

---

### H-05 Test: Knowledge Independence

| Knowledge Dependency | Domain Action |
|---|---|
| Audit programs (ISA rules) | Consumed from `platform.knowledge` — not embedded in Domain |
| Prior year data | Queried via `platform.event-bus` — not stored in Engagement |
| Regulatory rules | Referenced, not owned — Domain applies rules but does not store them |

#### One-way Knowledge Dependency Contract

```
Domain → publishes Domain Events → Event Bus → Knowledge Platform subscribes
                                                      ↓
                                           (enriches, does NOT write back to Domain)
```

**Rules:**

| Rule | Enforcement |
|---|---|
| Domain publishes events only to `platform.event-bus` | No direct Knowledge Platform imports in Domain code |
| Knowledge Platform subscribes to Domain events | Knowledge is a consumer, not a producer for Domain |
| Domain never queries Knowledge Platform directly | All queries go through Platform Kernel contracts |
| If reverse dependency is needed (Knowledge → Domain), it must go through Event Bus | No direct service calls from Knowledge to Domain |

---

```typescript
// Same pattern as SPEC-01a — only domain content changes
class EngagementPeriod {
  constructor(public readonly label: string) {}
}

class MaterialityThreshold {
  constructor(
    public readonly planning: number,
    public readonly performance: number,
    public readonly clearlyTrivial: number,
  ) {
    if (clearlyTrivial > performance || performance > planning)
      throw new BusinessRuleError("Materiality hierarchy violated");
  }
}
```

---

## 3. Domain Events

```typescript
interface EngagementCreatedEvent { type: "auditos.engagement.created"; eventVersion: 1; ... }
interface EngagementStageChangedEvent { type: "auditos.engagement.stage_changed"; eventVersion: 1; ... }
interface EngagementInReviewEvent { type: "auditos.engagement.in_review"; eventVersion: 1; ... }
interface EngagementReturnedToFieldworkEvent { type: "auditos.engagement.returned_to_fieldwork"; eventVersion: 1; ... }
interface EngagementSignedOffEvent { type: "auditos.engagement.signed_off"; eventVersion: 1; ... }
```

---

## 4. Domain Error Model

Identical to SPEC-01a §4. Five errors: `ValidationError`, `BusinessRuleError`, `GovernanceBlockedError`, `ConcurrencyError`, `NotFoundError`. No new error types needed.

---

## 5. Repository Interface

Same pattern as SPEC-01a §5. Repository returns Aggregates only.

```typescript
interface EngagementRepository {
  findById(id: string, orgId: string): Promise<Engagement | null>;
  findMany(filter: EngagementFilter, orgId: string): Promise<Engagement[]>;
  save(engagement: Engagement): Promise<Engagement>;
}
```

---

## 6. Hypothesis Results (to be verified during implementation)

| H# | Hypothesis | Verification Method | Expected Result |
|---|---|---|---|
| H-01 | Aggregate boundary holds | Code review: Engagement does not expose workpaper/finding internals | ✅ PASS |
| H-02 | Loop-safe lifecycle | Test: InReview → Fieldwork → InReview without invariant violation | ✅ PASS |
| H-03 | Evidence stays in Platform | Code review: zero direct evidence storage in Domain | ✅ PASS |
| H-04 | Review hierarchy is Domain Rule | Test: canSignOff() enforced without Workflow Engine | ✅ PASS |
| H-05 | Knowledge independence | Code review: Domain imports zero knowledge platform modules | ✅ PASS |

---

## Document Metadata

- **Author:** OpenCode | **Program:** CPV-001
- **Version:** 0.1
- **Template:** SPEC-01a (90% inherited, 10% new hypothesis tests)
- **Status:** **FROZEN (v1.0)** — CPV-001 Domain Specification. Template: SPEC-01a (inherited). Cross-product hypothesis tests documented. Ready for SPEC-02b.
