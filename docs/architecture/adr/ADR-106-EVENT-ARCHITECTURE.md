# ADR-106: Event Architecture

**Status:** Accepted — Codified from repository reality  
**Date:** 2026-07-19  
**Owner:** Platform Architecture  
**Constitution principles:** 1 (Product Independence — cross-talk via events)  
**Related:** ADR-100, ADR-101, ADR-104; Platform outbox APIs

---

## Context

Kernel provides an in-process Event Bus (`publish` / `subscribe`, retry, dead-letter, history). Typed helpers exist for AuditOS, LocalContentOS, SalesOS, and cross-product events. A transactional **outbox** (`PlatformOutboxEvent`) plus `/api/platform/outbox/*` supports durable/async processing. Bull queue (`queue-runtime.ts`) exists for workflow jobs behind feature flag `queue.enabled`.

---

## Problem

1. Teams may use direct Prisma bridges instead of events for cross-product reactions.
2. In-process bus alone is not durable across ECS tasks.
3. Unclear when to use Event Bus vs Outbox vs Bull.
4. EventDomain expansion must stay controlled.

---

## Options Considered

### Option A — External broker only (SQS/SNS/Kafka)

| Pros | Cons |
|------|------|
| Durable, multi-instance | Not provisioned as primary; ops weight |

### Option B — In-process events only

| Pros | Cons |
|------|------|
| Simple | Lost on crash; not multi-task safe |

### Option C — Layered: in-process bus + DB outbox + optional Bull (selected)

| Pros | Cons |
|------|------|
| Matches code | Cognitive load of three mechanisms |
| Progressive durability | Must document selection rules |

---

## Decision

1. **Cross-product reactions** use Kernel Event Bus typed publishers — not product lib imports.
2. **Selection rules:**

| Need | Mechanism |
|------|-----------|
| Same-process UI/domain reaction | Event Bus (`src/lib/kernel` publish/subscribe) |
| Durable “at-least-once” after commit | Platform Outbox + processor routes |
| Heavy/async jobs (generate, sync) | Bull queue when `queue.enabled` + Redis |

3. **Event metadata** must include tenant/org identifiers where applicable; handlers re-check authorization.
4. **EventDomain** values are Kernel-owned; new domains require Kernel PR + this ADR amendment.
5. **No silent cross-DB writes** in event handlers across product tables without an approved bridge ADR exception.
6. External brokers (SQS etc.) are **out of scope** until a consumer ADR and Terraform module exist.

---

## Consequences

### Positive
- Preserves product independence.
- Allows hardening durability without rewriting publishers.

### Negative
- Multi-instance subscribers on in-process bus do not see each other’s memory events — outbox required for shared work.
- Bull worker process topology in ECS remains operationally UNKNOWN until verified.

---

## Migration Strategy

1. Prefer events for new cross-product features.
2. Migrate critical bridge side-effects to outbox where durability matters.
3. Document ECS worker for Bull before enabling `queue.enabled` in production.
4. Keep architecture-drift agent watching product↔product imports.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| New cross-product features using events/outbox | 100% |
| Product↔product lib imports | 0 |
| Outbox processor health | Monitored via operator APIs |
| DLQ growth | Alertable (future) |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Lost in-process events | Outbox for critical paths |
| Handler infinite loops | Action naming conventions; idempotency keys |
| Bull without Redis | Feature flag default off |

---

## Related Components

- `src/lib/kernel/implementations/event-bus.ts`
- `src/lib/kernel/events/*`, `publish.ts`
- `src/lib/core/events/outbox-service.ts`
- `src/app/api/platform/outbox/*`
- `src/lib/platform/operations/queue-runtime.ts`

---

## Repository Evidence

| Evidence | Path |
|----------|------|
| Event bus retry/DLQ | `src/lib/kernel/implementations/event-bus.ts` |
| LCOS/Sales/Audit event helpers | `src/lib/kernel/events/` |
| Outbox API | `src/app/api/platform/outbox/process/route.ts` |
| Bull | `src/lib/platform/operations/queue-runtime.ts` |
| Feature flag | `queue.enabled` / `FF_QUEUE_ENABLED` |
