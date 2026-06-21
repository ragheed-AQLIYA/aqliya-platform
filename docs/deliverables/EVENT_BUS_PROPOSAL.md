# Phase 7 — Event-Driven Architecture Proposal

**Date:** 2026-06-20  
**Scope:** Assessment of whether AQLIYA needs a Platform Event Bus — event taxonomy, ownership, lifecycle, persistence  
**Data Sources:** `src/lib/platform/signals/`, `src/lib/platform/operations/`, `src/lib/platform/institutional-memory/`, `src/lib/platform/notification/`, `src/app/(dashboard)/operator/`, `src/app/(dashboard)/monitoring/`

---

## Executive Summary

AQLIYA has implicit event-driven patterns: signals propagate state changes, notifications react to events, institutional memory records historical events, and the operations runtime aggregates activities. But these are **not connected by a shared event bus** — each system independently discovers, produces, and consumes events.

A platform event bus would connect these systems, enabling real-time cross-product reactions, consistent event persistence, and reduced duplication. However, the value must be balanced against implementation cost.

**Current Event Coherence Score: 3.5/10** — implicit patterns, no bus, high duplication

---

## 1. Current Event Landscape

### 1.1 Event Producers (Implicit)

| Producer | Event Type | Current Destination |
|----------|------------|-------------------|
| AuditOS (AuditEvent) | Engagement lifecycle | AuditEvent table, Audit signal producer |
| LocalContentOS (LCAuditEvent) | Project lifecycle | LCAuditEvent table, LC signal producer |
| SalesOS (SalesAuditEvent) | Deal lifecycle | SalesAuditEvent table, Sales signal producer |
| WorkflowOS (WorkflowAEvent) | Record transitions | WorkflowEvent table |
| DecisionOS | Decision lifecycle | (No event writer) |
| Platform core | Platform events | PlatformAuditLog |
| AI Orchestrator | AI execution | PlatformAuditLog (via onGenerate) |

### 1.2 Event Consumers (Implicit)

| Consumer | Events Consumed | Current Source |
|----------|----------------|---------------|
| Operator Dashboard | All product signals | Signal producers (polled per product) |
| Activity Stream | Audit trail entries | Per-product audit tables (mapped) |
| Task Center | Review/approval tasks | Signal producers (derived) |
| Notifications | Product events | `notifyOnEvent()` (called manually) |
| Institutional Memory | Knowledge graph events | PlatformAuditLog (manual writes) |

### 1.3 Gap Analysis

| Gap | Impact | Current Workaround |
|-----|--------|-------------------|
| No "event happened" contract | Each producer formats events differently | Signal layer normalizes after the fact |
| No subscription mechanism | Consumers must poll or be called manually | Each consumer imports and calls producers directly |
| No event ordering | Cross-product causality is lost | Not tracked |
| No event replay | Cannot rebuild state from events | Not possible |
| No dead letter queue | Events lost on consumer failure | Not handled |
| No event schema registry | Event structure is implicit | TypeScript types (not at runtime) |

---

## 2. Does AQLIYA Need an Event Bus?

### Decision Framework

| Criteria | Score (1-10) | Rationale |
|----------|-------------|-----------|
| Current pain from lack of bus | 6/10 | 11 audit models, 4 signal producers, 2 notification engines — substantial duplication |
| Number of event producers | 7 | All product audit models + platform core |
| Number of event consumers | 5 | Operator, activities, tasks, notifications, memory |
| Real-time requirements | 5 | Notifications and operator dashboard benefit, but polling works for now |
| Event volume | 3 | Low for an enterprise platform (not high-throughput) |
| Cross-product causality need | 6 | Understanding "this AI output was based on this evidence from this engagement" requires event tracing |
| Infrastructure maturity | 7 | Bull queue exists, Redis available, PostgreSQL ready |

**Verdict: YES — but phased approach. Not urgent, but inevitable as platform scales.**

### Why Not Now

- Current event volume is low enough for polling and direct calls
- The Intelligence Core consolidation (Phase 3) and Audit Unification (Phase 4) are higher priority
- Event bus without unified audit events adds another abstraction on a fragmented foundation
- Bull queue exists but is feature-flagged off

### Why Soon

- Adding the 7th, 8th, 9th event producer without a bus increases duplication exponentially
- Cross-product tracing (e.g., "AI reviewed this evidence, which led to this finding, which was approved by this reviewer") requires event correlation
- Adding a new product should not require writing another signal producer

---

## 3. Proposed Event Taxonomy

```typescript
enum PlatformEventType {
  // Domain Events
  ENGAGEMENT_CREATED,
  ENGAGEMENT_UPDATED,
  ENGAGEMENT_STATUS_CHANGED,
  ENGAGEMENT_APPROVED,
  ENGAGEMENT_EXPORTED,
  
  DEAL_CREATED,
  DEAL_STAGE_CHANGED,
  DEAL_WON,
  DEAL_LOST,
  
  PROJECT_CREATED,
  PROJECT_STATUS_CHANGED,
  PROJECT_COMPLETED,
  
  DECISION_CREATED,
  DECISION_APPROVED,
  DECISION_OUTCOME_RECORDED,
  
  WORKFLOW_RECORD_CREATED,
  WORKFLOW_RECORD_COMPLETED,
  
  // Cross-Cutting Events
  REVIEW_SUBMITTED,
  REVIEW_APPROVED,
  REVIEW_REJECTED,
  
  EVIDENCE_UPLOADED,
  EVIDENCE_VERIFIED,
  EVIDENCE_REJECTED,
  
  EXPORT_PERFORMED,
  DOWNLOAD_PERFORMED,
  
  // AI Events
  AI_EXECUTION_STARTED,
  AI_EXECUTION_COMPLETED,
  AI_EXECUTION_FAILED,
  AI_OUTPUT_REVIEWED,
  AI_OUTPUT_ACCEPTED,
  
  // System Events
  NOTIFICATION_SENT,
  SIGNAL_RAISED,
  TASK_DERIVED,
  TASK_ESCALATED,
  MONITORING_ALERT,
  
  // Integration Events
  INTEGRATION_SYNC_STARTED,
  INTEGRATION_SYNC_COMPLETED,
  INTEGRATION_SYNC_FAILED
}

interface PlatformEvent {
  id: string;
  type: PlatformEventType;
  source: string;       // "auditos", "salesos", "localcontentos", etc.
  sourceEventId: string; // ID in the source system's event table
  
  organizationId: string;
  actorId: string;
  
  resourceType: string;
  resourceId: string;
  parentResourceType?: string;
  parentResourceId?: string;
  
  // Causality chain
  correlationId: string;     // Links related events
  causationId?: string;      // "This happened because of event X"
  
  data: Record<string, unknown>;  // Event-specific payload
  timestamp: Date;
  metadata: Record<string, unknown>;
}
```

### Correlation Pattern

```
correlationId: "corr-abc-123"  // Same for the entire user flow
                                // e.g., "user uploads TB → AI maps → reviewer approves"

causationId: null             // First event in the chain (TB upload)
causationId: "evt-001"       // "AI mapping started because TB was uploaded"
causationId: "evt-002"       // "Mapping completed because AI was invoked"
causationId: "evt-003"       // "Review was submitted because mapping was completed"
```

---

## 4. Bus Architecture Design

### Option A: Database-Polled Event Bus (Recommended for Phase 1)

```
Product writes → PlatformAuditEvent table (shared)
                      │
                      ▼
              Event Poller Process
              (runs every N seconds)
                      │
                      ├──→ Publish to Notification Engine
                      ├──→ Update Signal State
                      ├──→ Derive Tasks
                      └──→ Update Institutional Memory
```

**Pros:** No new infrastructure. Leverages PlatformAuditEvent (to be unified). Simple. Reliable (DB as message store).

**Cons:** Polling latency. Not real-time. Not suitable for high throughput.

### Option B: Redis Pub/Sub + DB Persistence (Recommended for Phase 2)

```
Product → Audit Client
            │
            ├──→ PlatformAuditEvent (persistent store)
            │
            └──→ Redis Pub/Sub channel
                    │
                    ├──→ Notification Engine (real-time)
                    ├──→ Operator Dashboard (real-time)
                    ├──→ Signal Bus
                    └──→ Task Derivation Service
```

**Pros:** Real-time. No polling. Redis already in infra. Pub/Sub is well-understood.

**Cons:** Requires Redis. Events in Redis are ephemeral (DB persistence in PlatformAuditEvent).

### Option C: Message Queue (Bull/Redis) (Future)

```
Product → Event Producer → Bull Queue → Event Consumers
                                      ├──→ Notification Worker
                                      ├──→ Signal Worker
                                      ├──→ Task Worker
                                      └──→ Memory Worker
```

**Pros:** Full message queue semantics. Retries, dead letter, backpressure. Already have Bull.

**Cons:** Most complex. Operational overhead. Only needed at high volume.

---

## 5. Event Lifecycle

```
Created → Persisted (PlatformAuditEvent) → Published → Consumed → Archived
   │                                                           │
   └── correlationId assigned ─────────────────────────────────┘
   └── causationId linked to parent
```

### Persistence Strategy

| Stage | Storage | Retention |
|-------|---------|-----------|
| Hot (active queries) | PlatformAuditEvent (PostgreSQL) | 90 days |
| Warm (recent history) | PlatformAuditEvent | 1 year |
| Cold (archive) | S3/Cloud storage | 7 years (regulatory) |
| Hash chain (tamper proof) | HashChainEntry | Permanent |

---

## 6. Recommendation and Roadmap

### Phase 1 — Database-Polled Bus (Month 1-2, ~20 days)

| Step | Action | Effort |
|------|--------|--------|
| 1.1 | Define event taxonomy and types | 2 days |
| 1.2 | Add correlationId to all audit models | 1 day |
| 1.3 | Create event producer contract (wraps audit write + event metadata) | 3 days |
| 1.4 | Create event poller (reads PlatformAuditEvent, dispatches to consumers) | 5 days |
| 1.5 | Integrate notification engine as consumer | 3 days |
| 1.6 | Integrate signal system as consumer | 3 days |
| 1.7 | Integrate task derivation as consumer | 3 days |

### Phase 2 — Real-Time Pub/Sub (Month 3, ~15 days)

| Step | Action | Effort |
|------|--------|--------|
| 2.1 | Add Redis Pub/Sub publishing to event producer | 3 days |
| 2.2 | Create Redis subscriber service | 3 days |
| 2.3 | Migrate consumers to subscription model | 5 days |
| 2.4 | Add event replay capability from PlatformAuditEvent | 4 days |

### Phase 3 — Full Message Queue (Month 4+, optional)

| Step | Action | Effort |
|------|--------|--------|
| 3.1 | Enable Bull queue for event processing | 2 days |
| 3.2 | Add dead letter queue | 2 days |
| 3.3 | Add event retry with backoff | 2 days |

**Total Estimated Effort:** **35-45 days** (Phase 1 + 2 minimum)

---

## 7. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Event bus without unified audit adds abstraction on fragmentation | Worse architecture | Complete Audit Unification (Phase 4) BEFORE Event Bus |
| Correlation ID requires all products to participate | Incomplete traces | Start with 2-3 products, add others incrementally |
| DB-polled bus has latency | Not real-time | Acceptable for v1; Redis Pub/Sub in Phase 2 |
| Event schema evolution | Breaking changes | Use flexible metadata field; version event types |

---

## 8. Scoring

| Metric | Current | Target (Phase 2) | Gap |
|--------|---------|-------------------|-----|
| Shared event taxonomy | None | Complete | ✓ |
| Event producers | 7 in isolation | 7+ on shared bus | ✓ |
| Event consumers | 5 polling | 5 subscribed | ✓ |
| Cross-product tracing | Manual | Correlation ID chain | ✓ |
| Real-time notifications | Polling | Pub/Sub | ✓ |
| Event replay | Not possible | From PlatformAuditEvent | ✓ |
| Dead letter handling | None | Queue retry | ✓ |
| **Composite** | **3.5/10** | **8.5/10** | **5.0** |
