# Phase 2 — Platform Core Assessment

**Date:** 2026-06-20  
**Scope:** Evaluation of cross-platform capabilities for reuse, duplication, fragmentation, and missing abstractions  
**Data Sources:** `src/lib/platform/` (~185 files), `src/core/` (~10 files), `src/middleware*.ts`, `src/lib/*auth*`

---

## Executive Summary

AQLIYA's platform core (`src/lib/platform/`) is both its greatest strength and its most significant technical liability. It contains a rich, production-grade set of capabilities — access control, immutable audit, multi-channel notifications, cross-product signals, operations runtime — but suffers from **critical fragmentation**: duplicate notification engines, competing audit write paths, dual product registries, and core abstractions that are stubs while real implementations live in the platform layer.

**Platform Core Score: 6.5/10** — rich capability but fragmented architecture

---

## 1. Capability Inventory

| Capability | Location | Maturity | Reuse | Notes |
|-----------|----------|----------|-------|-------|
| **RBAC** | `access/` (9 files) | L5 | High | 4 roles, 55 slugs, SoD enforcement. Used by middleware. |
| **ABAC** | `abac/` (5 files) | L3 | None | Policy engine exists but NOT wired into any authorization flow |
| **Audit Trail** | `audit/` (7 files) | L5 | Low | Hash chain + verification. Only linked to `PlatformAuditLog`, not product tables |
| **Audit Write** | `audit-log.ts` | L5 | None | Not adopted by any product (all products use their own audit tables) |
| **Notifications** | `notification/` (12 files) | L5 | Medium | 3 channels, 14 bilingual templates. Used by platform but not by all products |
| **Notifications (dup)** | `notifications/` (3 files) | L4 | Low | Different API, same table. Duplicate. |
| **Signals** | `signals/` (7 files) | L4 | High | Cross-product runtime signals. Used by operator dashboard. |
| **Operations** | `operations/` (8 files) | L3 | Medium | Task center, activity stream, queue (Bull). Task persistence is in-memory only. |
| **Workflow** | `workflow/` (1 file) | L1 | None | Stub — returns null |
| **AI Sessions** | `cross-product-ai/` (4 files) | L4 | Medium | Session management, action registry, context bridging |
| **Product Registry** | `product-registry.ts` | L3 | None | 1 of 2 registries (inconsistent) |
| **Product Registry** | `registry/product-registry.ts` | L4 | Medium | 2nd, more complete registry with core service bindings |
| **Download** | `download/` (6 files) | L5 | High | Secure download tickets with gates |
| **Evidence** | `evidence/` (3 files) | L1 | None | Stub — fake IDs |
| **Storage** | `storage/` (8 files) | L5 | Medium | Local/S3 providers |
| **Encryption** | `encryption/` (7 files) | L5 | High | Field-level + service-level |
| **Secrets** | `secrets/` (9 files) | L5 | High | Vault, key rotation |
| **Guards** | `guards/` (3 files) | L4 | Medium | Platform org + workspace guards |
| **Retention** | `retention/` (8 files) | L4 | Medium | Policies, holds |
| **SIEM** | `siem/` (7 files) | L4 | Low | SIEM integration, export |
| **Monitoring** | `monitoring/` (3 files) | L3 | Medium | System monitor |
| **Intelligence** | `intelligence.ts` (1 file) | L2 | Low | Types/scoring only — no implementation |
| **Model Gov** | `model-governance/` (4 files) | L4 | Medium | AI model registry + governance |
| **Rate Limiter** | `rate-limiter/` (6 files) | L5 | High | Memory + Redis presets |
| **Institutional Memory** | `institutional-memory/` (4 files) | L5 | Medium | Full graph DB, event-sourced |

---

## 2. Critical Duplications

### D-01: Notification Engines — `notification/` vs `notifications/`

| Dimension | `notification/` | `notifications/` |
|-----------|----------------|-------------------|
| Files | 12 (engine, 3 channels, templates, integration) | 3 (engine, types) |
| API | Functions (`dispatch()`, `sendInApp()`, etc.) | Interface (`NotificationsEngine`), singleton |
| Templates | 14 bilingual templates | None |
| Channels | in_app, email, webhook | Same types, simpler handling |
| Persistence | `PlatformNotification` via engine | `PlatformNotification` direct |
| Queue | None | Optional (via `enqueueTask()`) |
| Pipeline | Backed by `notifications/` engine | Referenced by `app/(dashboard)/notifications/` UI |

**Impact:** Both write to `PlatformNotification`. Inconsistent behavior. Extra maintenance. Confusing for developers.

**Recommendation:** Consolidate into `notification/` with interface-based API from `notifications/`.

### D-02: Product Registries — `product-registry.ts` vs `registry/product-registry.ts`

| Dimension | Root `product-registry.ts` | `registry/product-registry.ts` |
|-----------|---------------------------|-------------------------------|
| Products | 5 (AuditOS, LC, DecisionOS, WorkflowOS, SalesOS) | 3 (AuditOS, LC, SalesOS) |
| Key | `id` (e.g., `"auditos"`) | `slug` (e.g., `"audit"`) |
| Maturity | Static array | Full `ProductContract` with route prefix, core services, evidence types, AI task types |
| Core Bindings | None | `{ service, required, adopted }` model |
| Liveness | Used by navigation/UI | Used by platform registry |

**Impact:** Two sources of truth for product definitions. Products registered in one but not the other.

**Recommendation:** Deprecate the root `product-registry.ts` and consolidate into `registry/`.

### D-03: Audit Write Paths — 3 Ways to Write to PlatformAuditLog

| File | API | Used By |
|------|-----|---------|
| `audit-log.ts` | `writePlatformAuditLog()` | Platform core, middleware, guards |
| `audit-logger.ts` | `auditLogger(context).record()` | Thin factory over audit-log.ts |
| `audit-event-service.ts` | `writeAuditEvent()`, `dualWriteAuditEvent()` | Legacy/adapter path |

**Impact:** Three functions that all write to `PlatformAuditLog` with different parameter shapes. Contributors have to choose without guidance.

**Recommendation:** Consolidate into `audit-log.ts` as primary, `audit-logger.ts` as convenience factory, deprecate `audit-event-service.ts`.

### D-04: Rate Limiting — 3 Implementations

| File | Type | Interface |
|------|------|-----------|
| `src/lib/rate-limit.ts` | Server-side function | `checkRateLimit()` |
| `src/lib/rate-limit-edge.ts` | Edge function | `checkRateLimitEdge()` |
| `src/lib/platform/rate-limiter/` | Platform module | `checkRateLimit()` (different signature) |

**Impact:** Different APIs, different behaviors. The middleware uses the edge variant; server actions use server variant; platform rate limiter is separate.

**Recommendation:** Consolidate into `platform/rate-limiter/` with edge + server presets.

### D-05: Signals Index Stubs — `signals/index.ts` vs `signals/*-signal-producer.ts`

`signals/index.ts` has 9 exported functions that all return `[]` (empty). The actual implementations are in `signals/audit-signal-producer.ts`, `sales-signal-producer.ts`, and `localcontent-signal-producer.ts`.

**Recommendation:** Remove the empty stubs from `index.ts` and re-export from producers.

### D-06: Workflow — `workflow/product-templates.ts` vs `contracts/review-approval-runtime.ts`

Both are incomplete workflow/review implementations. One returns null; the other is an in-memory state machine.

**Recommendation:** Either consolidate or designate one as the canonical future path.

---

## 3. Missing Abstractions

### M-01: Single Authorization Decision Point

**Current state:** 4 separate authorization layers:
1. Middleware (`src/middleware.ts`) — route-level access via `routeMinRoles`
2. Platform Access (`access/`) — RBAC with roles/permissions/SoD
3. Platform ABAC (`abac/`) — Attribute-based policies (NOT wired)
4. Core Access (`core/access/`) — Core abstraction (re-exports platform access)

**Missing:** A unified `authorize(request, resource, context)` function that composes RBAC + ABAC + tenant isolation in one call.

**Impact:** Authorization logic is spread across 4 locations. Adding new permission models requires changes in multiple places.

### M-02: Unified Audit Client

**Current state:** 11 separate audit models, 3 write paths to PlatformAuditLog, 0 product adoptions of the platform audit path.

**Missing:** A `PlatformAuditClient` that every product calls as a dual-write alongside their product-specific audit table, with automatic hash-chain protection.

### M-03: Product Configuration Registry

**Current state:** Two product registries with different structures, neither serving as the canonical source of product configuration (route prefixes, capability flags, AI task types, evidence types).

**Missing:** A single `ProductRegistry` that centrally defines every product's:
- Route prefix
- Capability matrix
- Permissions/roles
- AI task types and governance context
- Audit event types
- Evidence types
- Export types
- Workflow templates

### M-04: Health Check Standard

**Current state:** `/api/health` exists with basic checks (DB ping, auth secret). But the deploy workflow's smoke test and Terraform health checks use custom scripts, not the standard endpoint.

**Missing:** Standardized health response format consumed by:
- Terraform ALB health checks
- CI/CD post-deploy smoke tests
- CloudWatch alarms
- Operator dashboard
- Prometheus/Grafana (future)

### M-05: Event Taxonomy

**Current state:** Events are defined ad-hoc per product as free-text strings. Audit event service uses `AuditEventCategory` enum, but products ignore it.

**Missing:** A platform-wide `EventType` taxonomy shared by:
- Audit events
- Notifications
- Signals
- Workflow transitions
- AI actions
- Institutional memory events

### M-06: Async Job Framework

**Current state:** Bull queue exists with `enqueueTask()` but:
- Feature-flagged (default: off)
- No persistence for tasks
- Output queue is a stub
- No worker runtime for scheduled/background jobs

**Missing:** A consistent async job framework for exports, AI inference, report generation, and scheduled tasks.

---

## 4. Platform Core Architecture Assessment

### Scorecard

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| **Reuse** | 6/10 | Access control and storage are reused well. Audit, notifications, workflow are not adopted by products. |
| **Duplication** | 4/10 | 6 confirmed duplicates (D-01 through D-06). High burden. |
| **Fragmentation** | 5/10 | 11 audit models, 4 auth layers, 2 notification engines, 2 product registries |
| **Missing Abstractions** | 5/10 | 6 critical abstractions missing (M-01 through M-06) |
| **API Consistency** | 6/10 | Inconsistent patterns: functions vs classes, direct Prisma vs services |
| **Test Coverage** | 7/10 | Strong test presence in access, audit, notification |
| **Documentation** | 4/10 | No developer guide for platform core. No architecture diagram. |
| **Production Readiness** | 7/10 | Hash chain, encryption, secrets are production-grade. Queues are feature-flagged off. |
| **Composite** | **5.5/10** | |

### Strengths

1. **Immutable audit hash chain** is unique and production-grade — SHA-256 + PoW nonce, chain verification, tamper detection
2. **Multi-channel notifications** with bilingual templates and rate limiting
3. **Separation of Duties** enforcement is built into RBAC
4. **Cryptographic key management** (encryption service, secrets vault, key rotation)
5. **Cross-product signals** architecture is well-designed (producer pattern)
6. **Secure download tickets** with gates and audit trail

### Weaknesses

1. **No product has adopted platform audit** — 0% adoption rate
2. **ABAC exists but is unused** — built but not wired into any authorization path
3. **Queue infrastructure is feature-flagged off by default** — no async processing in production
4. **Task persistence is disabled** — all task state is in-memory only
5. **Two notification engines** writing to the same table
6. **Core layer stubs** (`core/evidence/`, `core/audit/`, `core/output/`) are in-memory only

---

## 5. Layer Bleed Analysis

**Problem:** Product-specific code inside `src/lib/platform/`

| Location in Platform | Product-Specific Code | Risk |
|---------------------|----------------------|------|
| `platform/sales-intelligence/` | SalesOS AI bridge | Platform layer should not contain product intelligence |
| `platform/audit-risk/` | Audit risk engine | Belongs in `lib/audit/` |
| `platform/office-ai-adv/` | Office AI advanced | Belongs in `lib/office-ai/` |
| `platform/local-content-intelligence/` | LC intelligence | Belongs in `lib/local-content/` |

**Recommendation:** Move product-specific bridges out of `platform/` into their respective domain directories. Platform should only contain truly cross-cutting capabilities.

---

## 6. Consolidation Roadmap

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| **P0** | Consolidate notifications: merge `notifications/` into `notification/` | 2 days | Removes duplicate, reduces confusion |
| **P0** | Consolidate product registries into `registry/` | 1 day | Single source of truth |
| **P1** | Consolidate audit write paths: deprecate `audit-event-service.ts` | 0.5 days | Clean API surface |
| **P1** | Remove signal index stubs | 0.5 days | Dead code elimination |
| **P1** | Move layer-bleed code out of `platform/` | 3 days | Architectural purity |
| **P2** | Consolidate rate limiting into `platform/rate-limiter/` | 2 days | Consistent behavior |
| **P2** | Wire ABAC into authorization decision point | 3 days | Completes unfinished feature |
| **P2** | Create `ProductRegistry` abstraction | 2 days | Product configuration source of truth |
| **P3** | Create unified audit client | 5 days | Enable cross-product forensics |
| **P3** | Standardize health check | 1 day | Operational consistency |
| **P3** | Define Event Taxonomy | 2 days | Foundation for event-driven architecture |

**Total Estimated Effort:** ~22 days
