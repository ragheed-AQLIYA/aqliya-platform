# Event Bus Discovery Report

**Classification:** Decision-grade event architecture discovery  
**Date:** 2026-06-21  
**Scope:** Notifications, Audit Events, Workflow Events, AI Events, Platform Events  
**Method:** Read-only codebase discovery — no implementation  
**Related:** `EVENT_BUS_PROPOSAL.md`, Audit Event Unification program (completed)

---

## Executive Summary

AQLIYA has **no unified event bus**. Events are **synchronous, point-to-point database writes** at mutation time, with **partial convergence on `PlatformAuditLog`** following the completed audit unification program. Notification infrastructure is real but **manually invoked** at ~6 call sites. Signal infrastructure was **removed** without replacement, breaking cross-product activity aggregation.

| Dimension | Assessment |
|-----------|------------|
| Event bus implementation | **None** (0 pub/sub patterns) |
| Canonical audit sink | **PlatformAuditLog** — strong foundation |
| Event stores count | **11+** fragmented tables |
| Async delivery | **Bull queue** — email only, feature-flagged |
| Event envelope standard | **None** |
| Readiness for Event Bus program | **4/10** (per Intelligence Readiness Scorecard) |

**Recommendation:** Do not implement a full event bus until Intelligence Core P0–P1 complete and event contract defined (IC-P3-05). Proceed with **outbox-on-PlatformAuditLog** as Phase 0.

---

## 1. Current Architecture

```
Product Mutation
       │
       ├── Direct Prisma write (product audit table)
       ├── writePlatformAuditLog() [dual-write — most products]
       ├── notifyOnEvent() [manual — ~6 sites]
       └── HashChainEntry append [best-effort]
       
Consumers ← Poll DB / Query tables (no subscription)
```

| Property | Value |
|----------|-------|
| Pattern | Direct function calls + Prisma |
| Sync vs async | Sync for audit/notifications; async optional via Bull |
| Persistence | PostgreSQL |
| In-memory | `recentAuditBuffer` unused; task runtime file snapshot |
| Real-time | SSE polls DB every 30s — not event-driven |

---

## 2. Event Producers

### 2.1 Platform Audit (Cross-Cutting)

**Canonical writer:** `writePlatformAuditLog()` — `src/lib/platform/audit-log.ts`

**~70+ call sites** including auth (SSO, SCIM), retention, secrets, SIEM, content-studio, sampling, org-advanced, notifications, AI orchestrator.

| Domain | Key producer paths |
|--------|-------------------|
| Auth / identity | `src/lib/auth/sso-service.ts`, `scim-service.ts` |
| Platform ops | `retention/engine.ts`, `monitoring/system-monitor.ts` |
| Security | `secrets/vault*.ts`, `encryption/key-management.ts` |
| Integration | `integration/failover-engine.ts`, `circuit-alerts.ts` |
| AI | `ai/orchestrator.ts`, `governed-ai-executor.ts`, `product-ai-bridge.ts` |

### 2.2 AuditOS Events

| Producer | Path | Store |
|----------|------|-------|
| `recordAuditOsAuditEvent()` | `src/lib/audit/audit-events.ts` | `AuditEvent` + PlatformAuditLog |
| Domain engines | materiality, isqm1, sampling, fs-engine, rules, intelligence | `AuditEvent` |
| Actions | `audit-actions.ts`, `audit-materiality-actions.ts`, etc. | Via services |

**Event types (sample):** `engagement.created`, `trial_balance.uploaded`, `finding.created`, `ai.output_generated`, `evidence.file_scanned`

### 2.3 LocalContentOS Events

| Producer | Path | Store |
|----------|------|-------|
| `createLocalContentAuditEvent()` | `src/lib/local-content/audit-events.ts` | `LocalContentAuditEvent` + PlatformAuditLog |
| `createAiAuditEvent()` | Same | `LcAiAuditEvent` + PlatformAuditLog |

**Actions:** `project.created`, `evidence.uploaded`, `review.submitted`, `ai.review_run`, `ai.recommendation_generated`

### 2.4 SalesOS Events

| Producer | Path | Store |
|----------|------|-------|
| `recordSalesAuditEvent()` | `src/lib/sales/audit-events.ts` | `SalesAuditEvent` + PlatformAuditLog |

**Note:** `src/lib/sales/signals.ts` stores commercial signals in account metadata — **not platform events**.

### 2.5 WorkflowOS Events

| Producer | Path | Store | Dual-write? |
|----------|------|-------|-------------|
| `createWorkflowAuditEvent()` | `src/lib/workflowos/audit.ts` | `SunbulAuditEvent` | ✅ PlatformAuditLog |
| Direct writes | `workflowos-actions.ts`, export routes, escalation | `WorkflowAuditEvent` | ❌ Often missing |

**Schema drift:** Two models — `SunbulAuditEvent` (enum actions) vs `WorkflowAuditEvent` (string actions).

### 2.6 DecisionOS Events

| Producer | Path | Store |
|----------|------|-------|
| `logAudit()` | `src/lib/platform-audit.ts` (legacy) | `auditLog` + PlatformAuditLog |
| `createGovEvent()` | `src/lib/platform/decision-gov/decision-gov-service.ts` | `DecisionGovEvent` + PlatformAuditLog |

### 2.7 AI Events

| Producer | Path | PlatformAuditLog action |
|----------|------|-------------------------|
| `AIOrchestrator.onGenerate` | `ai/orchestrator.ts` | `ai_generation` |
| `governedAIExecute()` | `ai/governed-ai-executor.ts` | `ai_core` |
| LC AI audit | `local-content/audit-events.ts` | `LcAiAuditEvent` + PAL |
| RAG / memory | `rag/*.ts`, institutional-memory | Various |

### 2.8 Notifications (Not Audit — Separate Channel)

| Producer | Path | Trigger |
|----------|------|---------|
| `dispatch()` | `platform/notification/engine.ts` | Central dispatcher |
| `notifyOnEvent()` | `platform/notification/integration.ts` | Product entry |
| Callers | `approval.ts`, `audit-actions.ts`, `localcontent-actions.ts`, `sales/crm/sync-orchestrator.ts` | Manual |
| WorkflowOS | `workflowos/notification-service.ts` | Export/escalation — duplicates direct PlatformNotification writes |

**Notification event types:** `on_create`, `on_review`, `on_approval`, `on_rejection`, `on_sync_complete`, `on_error`

### 2.9 Other Platform Events

| Domain | Store | Producer |
|--------|-------|----------|
| Org lifecycle | `OrgLifecycleEvent` | `org-advanced/org-adv-service.ts` |
| SCIM | `ScimProvisioningEvent` | `auth/scim-service.ts` |
| Institutional memory | `InstitutionalMemoryEvent` | `institutional-memory-service.ts` |

---

## 3. Event Consumers

| Consumer | Path | Mechanism |
|----------|------|-----------|
| In-app notifications | `notification/in-app-channel.ts`, dashboard page | Query `PlatformNotification` |
| SSE stream | `api/notifications/stream/route.ts` | Poll every 30s |
| Platform overview | `platform-overview-actions.ts` | **Synthetic** — queries entities directly, not events |
| Audit trail UIs | Product pages, audit-trail components | Query product tables |
| Platform audit viewer | `/settings/audit-logs` | Query PlatformAuditLog |
| Hash chain verification | `audit/audit-store.ts`, verification dashboard | Query HashChainEntry |
| SIEM export | `siem/export-service.ts` | Read PlatformAuditLog → HTTP/Splunk/S3 |
| Audit bridge | `audit-bridge/audit-bridge-service.ts` | External adapters |
| Unified activity runtime | `operations/unified-activity-runtime.ts` | Maps shapes; signals stub empty |
| Unified task runtime | `operations/unified-task-runtime.ts` | In-memory/file — not event-driven |
| Retention engine | `retention/engine.ts` | Scheduled delete/archive |
| Email handler | `email/handler.ts` | Bull queue consumer |

**No subscribers.** All consumption is pull-based query or polling.

---

## 4. Event Taxonomy

### 4.1 Proposed Canonical Envelope (Future — Not Implemented)

```typescript
interface PlatformEvent {
  id: string;
  correlationId: string;      // cross-product trace
  causationId?: string;       // parent event
  productSlug: string;
  domain: 'audit' | 'workflow' | 'ai' | 'notification' | 'platform' | 'auth';
  action: string;             // namespaced: audit.finding.created
  actorId: string;
  organizationId: string;
  workspaceId?: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  occurredAt: ISO8601;
  schemaVersion: '1.0';
}
```

### 4.2 Current Action Namespaces (Observed)

| Namespace | Examples | Owner |
|-----------|----------|-------|
| `audit.*` | engagement.created, finding.created | AuditOS |
| `sales.*` | sales.deal.stage_changed | SalesOS |
| `lc.*` / local content | project.created, ai.review_run | LocalContentOS |
| `workflow.*` | RECORD_CREATED, created, completed | WorkflowOS (dual enum/string) |
| `decision.*` | SUBMITTED_FOR_REVIEW, DECISION_APPROVED | DecisionOS |
| `ai_*` | ai_generation, ai_core | AI layer |
| `notification_*` | notification_dispatched | Notification engine |
| `org.*` | CREATED, USER_ADDED, SUSPENDED | Org advanced |
| `scim.*` | provisioning events | Auth |

### 4.3 Ownership Matrix

| Domain | Primary store | Canonical sink | Module owner |
|--------|---------------|----------------|--------------|
| Notifications | PlatformNotification | PlatformAuditLog | `platform/notification/` |
| AuditOS | AuditEvent | PlatformAuditLog | `audit/audit-events.ts` |
| LocalContentOS | LocalContentAuditEvent, LcAiAuditEvent | PlatformAuditLog | `local-content/audit-events.ts` |
| SalesOS | SalesAuditEvent | PlatformAuditLog | `sales/audit-events.ts` |
| WorkflowOS | SunbulAuditEvent / WorkflowAuditEvent | Partial PlatformAuditLog | `workflowos/audit.ts` |
| DecisionOS | auditLog, DecisionGovEvent | PlatformAuditLog | `platform-audit.ts`, decision-gov |
| AI | PlatformAuditLog (+ product) | PlatformAuditLog | `ai/orchestrator` |
| Platform/auth | — | PlatformAuditLog | Per-service |
| Org/SCIM | OrgLifecycleEvent, ScimProvisioningEvent | PlatformAuditLog | org-advanced, scim |

---

## 5. Retention Requirements

From `src/lib/platform/retention/policies.ts`:

| Model | Retention | Action |
|-------|-----------|--------|
| PlatformAuditLog | 365 days | delete |
| PlatformNotification | 90 days | delete |
| ScimProvisioningEvent | 90 days | delete |
| IntelligenceQuery | 90 days | delete |
| Decision | 730 days | delete (notify before) |
| AuditEngagement | 2555 days | archive |

**Gaps:** Product audit tables (`AuditEvent`, `SalesAuditEvent`, `LocalContentAuditEvent`, `WorkflowAuditEvent`, `DecisionGovEvent`, etc.) **not in retention policies** — unbounded growth risk. Hash chain entries follow PlatformAuditLog lifecycle implicitly.

**Enterprise requirement (target):** Align all event stores to tiered retention: operational (90d), audit (7y), regulatory (engagement-linked archive).

---

## 6. Gaps for Unified Event Bus

| # | Gap | Severity | Evidence |
|---|-----|----------|----------|
| 1 | No bus abstraction | CRITICAL | Zero emit/subscribe patterns |
| 2 | Signal layer removed | CRITICAL | `platform/signals/` deleted; activity runtime stub |
| 3 | 11+ event stores | HIGH | Fragmented schemas |
| 4 | Inconsistent dual-write | HIGH | WorkflowAuditEvent path skips PAL |
| 5 | Notifications manually invoked | MEDIUM | ~6 call sites; overview re-derives state |
| 6 | Duplicate notification paths | MEDIUM | WorkflowOS direct + dispatch() |
| 7 | No ordering/correlation/replay | HIGH | No correlationId propagation |
| 8 | In-memory buffers unused | LOW | recentAuditBuffer never fed |
| 9 | Bull not event bus | MEDIUM | Email jobs only |
| 10 | Retention asymmetry | MEDIUM | Product tables unbounded |
| 11 | Legacy platform-audit.ts | MEDIUM | 9 DecisionOS call sites |

---

## 7. Future Event Bus Architecture (Design Only)

### Phase 0: Event Contract on PlatformAuditLog (Weeks 1–3)

- Define canonical envelope (Section 4.1)
- Add `correlationId`, `schemaVersion` to PlatformAuditLog metadata JSON
- Adapter layer: product audit writers emit envelope before dual-write
- **No new infrastructure**

### Phase 1: Transactional Outbox (Weeks 4–8)

```
Mutation (Prisma transaction)
  ├── Business write
  ├── PlatformAuditLog write
  └── OutboxEvent insert (same transaction)

OutboxPoller (background worker)
  ├── Read unprocessed OutboxEvent
  ├── Dispatch to registered handlers
  └── Mark processed
```

- Uses existing PostgreSQL + Bull/Redis queue
- Handlers: notification, SIEM, activity runtime, task runtime
- Delivery: at-least-once with idempotent handlers

### Phase 2: Event Registry + Schema Evolution (Weeks 9–12)

- Event schema registry (JSON Schema or Zod)
- Versioned action namespaces
- Deprecation policy for action renames
- Operator dashboard: event flow metrics

### Phase 3: Cross-Product Pub/Sub (Weeks 13–20)

- Redis Streams or PostgreSQL LISTEN/NOTIFY for fan-out
- Dead-letter queue for failed handlers
- Replay API for operator debugging (ADMIN only, audited)
- **Only after** Intelligence Core interfaces stable

### Explicit Non-Goals (Phase 1–3)

- Kafka/NATS deployment — over-engineered for current scale
- In-process EventEmitter as primary bus — lost on restart, no cross-instance
- Replacing product audit tables — retain for product-specific queries; PAL is canonical cross-product

---

## 8. Producer/Consumer Summary Table

| Event family | Producers (count) | Consumers | Async? |
|--------------|------------------:|-----------|--------|
| Platform audit | 70+ | SIEM, audit viewer, hash chain, activity runtime | No |
| Product audit | 5 products | Product UIs, activity runtime | No |
| Notifications | 6+ manual | In-app, SSE, email | Partial (email) |
| AI | 10+ | Audit viewer, quality dashboards | No |
| Workflow | 2 paths | Workflow UI, platform overview | No |
| Org/SCIM | 2 services | Admin UIs | No |

---

## 9. Dependencies

| Prerequisite | Program |
|--------------|---------|
| PlatformAuditLog unified | ✅ Audit unification (done) |
| Hash chain | ✅ Done |
| Legacy audit migration | ⏳ IC-P0-01 (9 files) |
| Signal engine | ⏳ IC-P0-02 |
| Core event contract | ⏳ IC-P3-05 |
| Redis in production | ⏳ Infra I-03 |

**Event Bus program start earliest:** After IC-P0 + IC-P1 complete (~45 days).

---

## 10. Key File Reference

| Path | Role |
|------|------|
| `src/lib/platform/audit-log.ts` | Canonical audit write |
| `src/lib/platform/audit/audit-store.ts` | Hash chain |
| `src/lib/platform/notification/engine.ts` | Notification dispatcher |
| `src/lib/platform/notification/integration.ts` | notifyOnEvent |
| `src/lib/platform/operations/unified-activity-runtime.ts` | Activity aggregation (degraded) |
| `src/lib/platform/operations/unified-task-runtime.ts` | Task aggregation |
| `src/lib/platform/operations/queue-runtime.ts` | Bull queue (email) |
| `src/lib/platform/retention/policies.ts` | Retention rules |
| `docs/deliverables/EVENT_BUS_PROPOSAL.md` | Prior proposal |

**Document status:** DONE — Event Bus Discovery Report for executive planning.
