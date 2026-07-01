# SPEC-02b: API Specification — Engagement Management

> **Status:** Draft v0.1 | **Date:** 2026-06-28
> **Program:** CPV-001 | **Template:** SPEC-01b (inherited)
> **Focus:** AuditOS-specific API pressure points — review authorization, loop idempotency, concurrent reviews, evidence/knowledge isolation

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | SPEC-02a v1.0 (FROZEN) |
| **Blocks** | SPEC-02c, SPEC-02d, SPEC-02e |

---

## Inherited Without Change (Engineering Standard)

| Element | Source | Status |
|---|---|---|
| `ActionResult<T>` | SPEC-01b §1.1 | ✅ Inherited |
| `safe()` wrapper | SPEC-01b §1.2 | ✅ Inherited |
| Error mapping (5 errors → 5 codes) | SPEC-01b §1.2 | ✅ Inherited |
| AuthContext contract | SPEC-01b §1.4 | ✅ Inherited |
| Correlation context | SPEC-01b §1.3 | ✅ Inherited |
| DTO flattening (no Domain types) | SPEC-01b §5 | ✅ Inherited |
| Pagination contract | SPEC-01b §6 | ✅ Inherited |
| API versioning | SPEC-01b §7 | ✅ Inherited |

---

## New Pressure Points

| # | Pressure Point | Why New for AuditOS |
|---|---|---|
| P-01 | Review authorization across 4 levels | SalesOS had single-level approval |
| P-02 | Idempotency for review loop transitions | SalesOS had linear transitions |
| P-03 | Concurrency during parallel reviews | Multiple reviewers may act simultaneously |
| P-04 | Domain Events for review cycles | New event types: returned_to_fieldwork, revision_completed |
| P-05 | Evidence/Knowledge isolation in API | API must enforce the boundary |

---

## Server Actions

| Action | Permission | New Challenge |
|---|---|---|
| `createEngagementAction` | `auditos:engagement.create` | — |
| `transitionEngagementAction` | `auditos:engagement.update` | Loop idempotency (P-02) |
| `assignTeamAction` | `auditos:engagement.update` | — |
| `reviewAction` | `auditos:engagement.review` | **4-level authorization (P-01)** |
| `returnToFieldworkAction` | `auditos:engagement.review` | **Loop idempotency (P-02)** |
| `listEngagementsAction` | `auditos:engagement.view` | — |
| `getEngagementAction` | `auditos:engagement.view` | — |

---

## P-01: Review Authorization

Each review level has distinct permission scopes:

| Level | Permission | May approve | May return |
|---|---|---|---|
| Senior | `auditos:engagement.review.senior` | Workpapers | Own work |
| Manager | `auditos:engagement.review.manager` | Findings, Fieldwork stage | Team work |
| Partner | `auditos:engagement.review.partner` | Engagement overall, Sign-off | Engagement |
| Quality | `auditos:engagement.review.quality` | Sign-off gate | ❌ (recommends only) |

**Implementation:** `safe()` wrapper checks permission level before allowing the review action. The Domain aggregate enforces the review hierarchy rules (from SPEC-02a H-04).

---

## P-02: Review Loop Idempotency

```typescript
// transitionEngagementAction — returning from InReview to Fieldwork
async function returnToFieldworkAction(
  engagementId: string,
  input: { reason: string; revisionNumber: number; version: number },
): Promise<ActionResult<EngagementResponse>> {
  return safe(async () => {
    // Idempotency: if same revisionNumber is already recorded, skip
    // + version check for concurrency
    // + reason required per SPEC-02a DI-02
  });
}
```

**Idempotency rules:**

| Operation | Idempotent? | Key |
|---|---|---|
| createEngagement | No | — |
| transitionEngagement | **Yes** | (currentStage, action) → if already in target stage, return success |
| returnToFieldwork | **Yes** | revisionNumber — if same revision already recorded, skip |
| reviewAction | **Yes** | (reviewerId, level) — if same decision exists, return success |
| assignTeam | No | — |

### Review Idempotency Key

Review operations are idempotent based on a composite key:

```typescript
interface ReviewIdempotencyKey {
  engagementId: string;
  revisionNumber: number;     // which revision cycle
  reviewLevel: "senior" | "manager" | "partner" | "quality";
  reviewerId: string;
  decision: "approved" | "revision_required";
}
```

**Rule:** If a ReviewRecord with the same key already exists, the action returns success without re-applying. This allows reviewers to safely retry requests without creating duplicate review records.

---

## P-03: Concurrency During Parallel Reviews

Multiple reviewers may act on the same engagement simultaneously. The `version` field handles conflicts:

**Scenario:** Senior approves a workpaper while Manager returns the engagement to fieldwork.

| Action | Version read | Version after |
|---|---|---|
| Senior approves workpaper | 5 | 6 |
| Manager returns to fieldwork | 5 | **CONFLICT** (stale version) |

**Resolution:** The second action receives CONFLICT. The caller must re-read the engagement and re-apply the decision. The Engagement aggregate preserves both decisions in `reviewHistory`.

---

## P-04: Domain Events

### Event Ordering Contract

Events follow a strict sequence per review cycle:

```text
returned_to_fieldwork
        ↓
    revision_started
        ↓
    revision_completed
        ↓
    in_review
        ↓
    (next cycle or signed_off)
```

| Event | Previous Event | Next Event |
|---|---|---|
| `returned_to_fieldwork` | `in_review` | `revision_started` |
| `revision_started` | `returned_to_fieldwork` | `revision_completed` |
| `revision_completed` | `revision_started` | `in_review` |
| `in_review` | `revision_completed` or `stage_changed` | `returned_to_fieldwork` or `stage_changed` |
| `signed_off` | `in_review` (final) | — (terminal) |

**Violation:** Publishing events out of order must be considered a system error, not a business-as-usual scenario.

### Correlation Tree

Each engagement review trace carries:

```text
correlationId          ── stable across the entire engagement lifecycle
    ↓
reviewCycleId         ── unique per InReview → Fieldwork → InReview cycle
    ↓
revisionNumber        ── monotonically increasing per cycle (1, 2, 3...)
```

| ID | Scope | Generated By |
|---|---|---|
| `correlationId` | Entire engagement lifecycle | Client (first action) |
| `reviewCycleId` | Single review cycle | Server (on return_to_fieldwork) |
| `revisionNumber` | Per cycle iteration | Server (incremented on return) |

| Event | When | Payload |
|---|---|---|
| `auditos.engagement.created` | Engagement created | engagementId, clientId, period |
| `auditos.engagement.stage_changed` | Any stage transition | engagementId, fromStage, toStage, action |
| `auditos.engagement.in_review` | Entered InReview | engagementId, reviewerId |
| `auditos.engagement.returned_to_fieldwork` | Returned from review | engagementId, revisionNumber, reason |
| `auditos.engagement.revision_completed` | Revision re-submitted | engagementId, revisionNumber |
| `auditos.engagement.signed_off` | Final sign-off | engagementId, partnerId |

All events: `eventVersion: 1`, `source: "auditos"`, `correlationId`, `timestamp`, `sequenceId`.

---

## P-05: Evidence/Knowledge Isolation in API

The API layer must enforce the Domain boundaries defined in SPEC-02a:

| Boundary | API Enforcement |
|---|---|
| Evidence references only | API never accepts evidence mutation requests |
| Knowledge one-way | API never calls Knowledge Platform from Engagement endpoints |
| Evidence chain | API routes evidence operations through `platform.evidence` contract only |

### API Boundary Matrix

| API Owns | Delegates to Domain | Forbidden |
|---|---|---|
| DTO mapping (Domain → Response) | Business rules and invariants | Business logic in API layer |
| Auth check (permission verification) | Review hierarchy rules | Review decisions in API |
| Correlation context | Domain Events | Direct evidence mutation |
| Error translation (DomainError → ActionResult) | Aggregate state transitions | Domain state bypass |
| Pagination and filtering | Validation rules | Knowledge Platform direct calls |
| Request validation (format, types) | Evidence gate rules | Bypassing Platform contracts |

---

## Traceability

| SPEC-02b Element | SPEC-02a Reference | Template (SPEC-01b) |
|---|---|---|
| Server Actions | §1 (Engagement aggregate) | ✅ Inherited |
| Review authorization | H-04 (Review Authority Matrix) | ❌ New |
| Loop idempotency | H-02 (Revision Model) | ❌ New |
| Concurrency | §1 (version field) | ✅ Inherited |
| Domain Events | §3 | ✅ Inherited |
| Evidence/knowledge isolation | H-03, H-05 | ❌ New |

---

## Document Metadata

- **Author:** OpenCode | **Program:** CPV-001
- **Version:** 0.2 | **Template:** SPEC-01b
- **Changes from v0.1:** Added Correlation Tree (correlationId → reviewCycleId → revisionNumber), Event Ordering Contract (5 events with strict sequence), Review Idempotency Key (composite key for safe retry), API Boundary Matrix (Owns/Delegates/Forbidden).
- **Template Reuse:** ~85% (15% new pressure points for AuditOS)
- **Status:** Draft v0.2 — ready for review. Next: freeze v1.0 → SPEC-02c.
