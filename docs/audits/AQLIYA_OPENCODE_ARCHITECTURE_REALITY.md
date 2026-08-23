# AQLIYA — OpenCode Architecture Reality Assessment
**Date:** 2026-08-16  
**Scope:** Platform Kernel, Product Boundaries, Cross-Product Coupling, Code Health

---

## 1. Real Dependency Map

The repository presents itself as a platform-first architecture. The actual dependency graph is:

```
┌─────────────────────────────────────────────────────────────────────┐
│                           UI LAYER                                   │
│  src/app/ (marketing) + src/app/(dashboard) + src/app/audit/...   │
│  src/components/ (product-organized)                               │
├─────────────────────────────────────────────────────────────────────┤
│                        APPLICATION LAYER                             │
│  Server Actions (src/actions/, src/app/**/actions.ts)                │
│  API Route Handlers (src/app/api/)                                   │
│  Middleware (src/middleware.ts)                                      │
├─────────────────────────────────────────────────────────────────────┤
│                         DOMAIN LAYER                               │
│  src/lib/audit/        → AuditOS domain logic                        │
│  src/lib/local-content/ → LocalContentOS domain logic                │
│  src/lib/sales/        → SalesOS legacy store-based logic            │
│  src/lib/salesos/      → SalesOS DDD/Clean Architecture layer        │
│  src/lib/decision/     → DecisionOS logic                            │
│  src/lib/workflowos/   → WorkflowOS logic                            │
│  src/lib/risk/         → RiskOS logic                                │
│  src/lib/office-ai/    → Office AI Assistant logic                   │
│  src/lib/assistant/    → Assistant UI logic                          │
│  src/lib/platform/     → Platform operations (leaks into products)   │
├─────────────────────────────────────────────────────────────────────┤
│                         KERNEL / CORE                                │
│  src/lib/kernel/       → Plugin registry, event bus, contracts       │
│    └── bootstrap.ts    → Hardcodes product plugins (VIOLATION)       │
│    └── audit.ts        → Re-exports AuditOS internals (VIOLATION)      │
│    └── workflowos.ts   → Re-exports WorkflowOS internals (VIOLATION)│
│  src/core/             → Platform runtime, evidence store, audit       │
│    └── product-runtime.ts → Clean, no product deps                 │
│    └── ai/handlers/register-handlers.ts → Imports AuditOS handler    │
├─────────────────────────────────────────────────────────────────────┤
│                      INFRASTRUCTURE LAYER                            │
│  src/lib/prisma/       → Prisma client + extensions                  │
│  src/lib/platform/cache-strategy.ts → Redis / memory cache           │
│  src/lib/observability/ → Logger, Sentry, metrics                     │
│  src/lib/security/     → Prompt sanitization, guards                 │
│  src/lib/auth/         → NextAuth v5 config, MFA, session            │
├─────────────────────────────────────────────────────────────────────┤
│                     EXTERNAL SERVICES                                │
│  PostgreSQL 16 + pgvector, Redis 7, S3, OpenAI/Anthropic,            │
│  ClamAV (optional), HubSpot/Apollo/SmartLead connectors              │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Observations
- `src/core/` is genuinely platform-level and has **zero product imports**. This directory should be the architectural model.
- `src/lib/kernel/` contains real infrastructure (event bus, plugin registry, contracts) but is **polluted by product-specific bridge files**.
- `src/lib/platform/` is intended to be shared platform operations, but it **imports from SalesOS** (`@/lib/sales/signals/core-signal-producer`), creating upward coupling.
- Product directories (`src/lib/audit/`, `src/lib/local-content/`, `src/lib/sales/`) have **no direct imports between each other**, which is correct.

---

## 2. Platform Kernel Violations

| ID | File | Violation | Severity |
|---|---|---|---|
| K-01 | `src/lib/kernel/bootstrap.ts` | Hardcodes `AuditOSPlugin`, `LocalContentOSPlugin`, `SalesOSPlugin` via static `import()` from `../../products/*`. Kernel directly knows individual product classes. | CRITICAL |
| K-02 | `src/lib/kernel/audit.ts` | 215-line barrel re-exporting 150+ AuditOS-specific functions from `@/lib/audit/*`. Kernel acts as AuditOS proxy. | CRITICAL |
| K-03 | `src/lib/kernel/workflowos.ts` | 103-line barrel re-exporting WorkflowOS functions from `@/lib/workflowos/*`. Kernel acts as WorkflowOS proxy. | CRITICAL |
| K-04 | `src/lib/kernel/knowledge.ts` | 91-line barrel re-exporting `../knowledge-foundation/*` and `../knowledge-review/*`. Violates kernel purity by bridging deep domain modules. | MEDIUM |
| K-05 | `src/lib/core/ai/handlers/register-handlers.ts` | Core AI handler registry imports `disclosureEnrichmentHandler` from `@/lib/audit/handlers/disclosure-enrichment-handler`. Core depends on AuditOS. | CRITICAL |

**Verdict:** The kernel claims product independence in AGENTS.md and documentation, but in practice it contains dedicated product bridges. The kernel is **not product-agnostic**.

---

## 3. Cross-Product Coupling

Direct product-to-product imports (e.g., `src/lib/audit/` → `src/lib/sales/`) are **zero**. The coupling is one-way: **platform/core layers import from products**.

| Importer | Imported From | File | Purpose |
|---|---|---|---|
| `src/lib/platform/operations/unified-activity-runtime.ts` | `@/lib/sales/signals/core-signal-producer` | `collectSalesActivitySignals` | Cross-product activity feed |
| `src/lib/platform/operations/unified-task-runtime.ts` | `@/lib/sales/signals/core-signal-producer` | `collectSalesApprovalSignals`, `collectSalesReviewSignals`, `collectSalesTaskSignals` | Cross-product task feed |
| `src/lib/platform/signals/index.ts` | `@/lib/sales/signals/core-signal-producer` | Re-exports sales signals | Signal aggregation |
| `src/lib/core/ai/handlers/register-handlers.ts` | `@/lib/audit/handlers/disclosure-enrichment-handler` | `disclosureEnrichmentHandler` | AI handler registration |
| `src/app/api/sales/intel/webhook/route.ts` | `@/lib/sales/intelligence/webhook/receiver` | `receiveWebhook` | Webhook handling |
| `src/app/api/sales/export/route.ts` | `@/lib/sales/guards` | `requireSalesPermission` | Export guard |
| `src/app/api/crm/webhook/route.ts` | `@/lib/sales/crm/connector-factory` | `createConnector` | CRM connector |

**Impact:** Platform operations and core AI cannot compile or run without SalesOS and AuditOS present. This prevents deploying the platform kernel independently or substituting products.

---

## 4. Product Boundary Assessment

| Product | Boundary Clear | Independent Logic | Independent Routes | Hidden Deps | Can Deploy Independently? |
|---|---|---|---|---|---|
| **AuditOS** | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Kernel `audit.ts` bridge | ❌ No (kernel depends on it) |
| **LocalContentOS** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ None visible | ❌ No (kernel depends on it) |
| **SalesOS** | ⚠️ No | ⚠️ Partial | ✅ Yes | ⚠️ Dual impl; platform imports from it | ❌ No (kernel + platform depend on it) |
| **DecisionOS** | ⚠️ Partial | ⚠️ Yes | ✅ Yes | ⚠️ Scattered across `decision/`, `simulation/`, `recommendation/` | ❌ No (no plugin registered) |
| **WorkflowOS** | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Kernel `workflowos.ts` bridge | ❌ No (kernel depends on it) |
| **RiskOS** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ None visible | ❌ No (kernel not verified) |
| **Office AI Assistant** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ None visible | ❌ No (kernel not verified) |
| **LocalContactOS** | ✅ Yes | ✅ Yes | ✅ Yes | ⚠️ Queries SalesOS models for cross-product memory | ❌ No |
| **ContentStudio** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ None visible | ❌ No |

**Notes:**
- **SalesOS dual implementation:** `src/lib/sales/` (store-based, ~50 files) and `src/lib/salesos/` (DDD, 28 files) exist in parallel. Platform operations import from `src/lib/sales/`, ignoring `salesos/`.
- **DecisionOS plugin gap:** No `DecisionOSPlugin` is registered in `kernel/bootstrap.ts`, meaning DecisionOS is not a first-class platform product despite having substantial logic.
- **LocalContactOS cross-product query:** `src/lib/localcontactos/cross-product-service.ts` queries `prisma.salesAccount` and `prisma.salesDeal` directly for relationship intelligence. This is a data-layer coupling, not a code import.

---

## 5. Code Health

### Giant Files (>1000 lines)
| File | Lines | Type |
|---|---|---|
| `src/lib/audit/mock-data.ts` | 2,418 | Seed / mock data |
| `src/lib/sales/seed-data.ts` | 1,673 | Seed / mock data |
| `src/app/auditos/demo-data.ts` | 1,127 | Public demo data |

**Production logic files:** 0 files >1000 lines. Good.

### TODO / FIXME / XXX
- **Production code:** 0 occurrences.
- **Test code:** 1 (`src/__tests__/i18n/no-english-strings.test.ts:452` — pre-existing skip).

**Assessment:** Excellent hygiene.

### `as any` Casts
- **Production code:** 4 occurrences in 3 files (all documented as schema drift escapes):
  1. `src/lib/sales/prisma-repository/common.ts:17` — `getPrismaAny(): any`
  2. `src/lib/decision/intelligence-gate.ts` — 1 documented cast (safe union subtype narrowing)
- **Test code:** ~105 occurrences (mock objects, jest mocking).

**Assessment:** AGENTS.md claims "0 `as any` in production code." Reality is 4 documented escapes. Slightly overstated.

### Dead Code
- `src/lib/simulation/` — **NOT dead**. Active DecisionOS logic (`simulation-engine.ts`, 258 lines).
- `src/lib/recommendation/` — **NOT dead**. Active DecisionOS logic (`recommendation-engine/index.ts`, 31 lines, adapters for TENDER/INVESTMENT/STRATEGIC/HIRING).
- `src/lib/validation/` — Contains `src/lib/validation/safe-utils.ts` and related files. Active.

**Assessment:** No dead directories found.

### Duplicate Logic — Tenant Guards
Each product reinvents tenant isolation instead of using the shared guard:

| Product | Guard File | Lines | Custom Error |
|---|---|---|---|
| AuditOS | `src/lib/audit/tenant-guard.ts` | 65 | `TenantAccessError` |
| SalesOS | `src/lib/sales/guards.ts` | 142 | `SalesAccessError` |
| LocalContentOS | `src/lib/local-content/guards.ts` | 123 | Inline throws |
| WorkflowOS | `src/lib/workflowos/tenant-guard.ts` | 154 | Inline throws |
| **Shared** | `src/lib/authorization/tenant-guard.ts` | 75 | Unified result |

**Assessment:** The shared `src/lib/authorization/tenant-guard.ts` exists but is **not used** by any product. This is a maintainability risk.

### Duplicate Logic — Audit Events
Each product maintains its own audit event emitter:
- `src/lib/audit/audit-events.ts`
- `src/lib/sales/audit-events.ts`
- `src/lib/local-content/audit-events.ts`
- `src/lib/workflowos/audit.ts`

The platform-level `PlatformAuditLog` is used, but each product still has its own event builder/publisher.

---

## 6. Plugin System & Event Bus Reality

### Plugin System
- **Interface:** `ProductPlugin` in `src/lib/kernel/plugin/` is a real interface with lifecycle methods (`onInit`, `onShutdown`, `getHealth`), dependency injection, routes, schemas, and health checks.
- **Registry:** `ProductRegistry` handles init/shutdown/health.
- **Dynamic Loading:** **Missing**. No filesystem scanning or config-driven discovery. All 3 plugins are hardcoded in `bootstrap.ts`.
- **Event Wiring:** Plugins log cross-product events; they do not trigger business actions.

### Event Bus
- **Implementation:** `EventBusWrapper` in `src/lib/kernel/events/` is real.
- **Features:** Pub/sub, wildcard handlers, 3-retry logic, dead letter queue, history, replay by `correlationId`.
- **Persistence:** In-memory only. No outbox table or external message broker (e.g., RabbitMQ, SQS).
- **Cross-Product Events:** Defined in `src/lib/kernel/events/cross-product-events.ts` with actions like `evidence.uploaded`, `ai.output_generated`.

**Verdict:** Both systems are **genuinely implemented**, not stubs. However, they are limited to in-memory operation and lack dynamic discovery.

---

## 7. Top 5 Architectural Risks

| Rank | Risk | Severity | Evidence |
|---|---|---|---|
| 1 | **Kernel Violates Product Independence** | CRITICAL | `bootstrap.ts` hardcodes products. `audit.ts` and `workflowos.ts` re-export product internals. |
| 2 | **Core AI Layer Depends on AuditOS** | CRITICAL | `register-handlers.ts` imports AuditOS handler. Core cannot initialize without AuditOS. |
| 3 | **SalesOS Dual Implementation** | HIGH | `src/lib/sales/` and `src/lib/salesos/` in parallel. Platform imports from legacy `sales/`. |
| 4 | **Platform Operations Import from SalesOS** | MEDIUM | `unified-activity-runtime.ts` and `unified-task-runtime.ts` import sales signals. Platform cannot compile without SalesOS. |
| 5 | **Tenant Guard Duplication** | MEDIUM | 4 custom guard files. Shared guard is unused. Security fixes must be applied in multiple places. |

---

*End of Architecture Reality Assessment.*
