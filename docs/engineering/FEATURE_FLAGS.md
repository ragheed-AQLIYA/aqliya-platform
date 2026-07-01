# Feature Flags Registry

> **Source of truth:** `src/lib/platform/feature-flags/registry.ts`  
> **Last updated:** 2026-06-25  
> **Total flags:** 27  

## How Flags Work

- Each flag has a **default variant** (`on` or `off`) defined in the registry.
- The default can be overridden via environment variable (`FF_<NAME>=true` or `FF_<NAME>=false`).
- Some flags have **dependencies** — if a dependency is `off`, the flag is also treated as `off`.
- Flags are resolved at runtime via `isEnabled(key)` in `src/lib/platform/feature-flags/registry.ts`.

## Flag Reference

### AI Flags

| Key | Name | Default | Owner | Dependencies | Env Var |
|-----|------|---------|-------|--------------|---------|
| `ai.real-providers` | Real AI Providers | `off` | ai-gov | `ai.cost-tracking` | `FF_AI_REAL_PROVIDERS=true` |
| `ai.cost-tracking` | AI Cost Tracking | `on` | ai-gov | — | `FF_AI_COST_TRACKING=false` (to disable) |
| `ai.streaming` | AI Response Streaming | `on` | eng | — | `FF_AI_STREAMING=false` (to disable) |
| `ai.budget-quotas` | AI Budget Quotas | `off` | ai-gov | `ai.cost-tracking` | `FF_AI_BUDGET_QUOTAS=true` |
| `ai.rag` | AI RAG/pgVector Pipeline | `off` | ai-gov | — | `FF_AI_RAG=true` |
| `ai.budget-alerts` | AI Budget Alerts | `off` | ai-gov | `ai.cost-tracking` | `FF_AI_BUDGET_ALERTS=true` |

### AuditOS Flags

| Key | Name | Default | Owner | Dependencies | Env Var |
|-----|------|---------|-------|--------------|---------|
| `audit.mock-ai` | AuditOS Mock AI Fallback | `on` | eng | `ai.real-providers` | `FF_AUDIT_MOCK_AI=false` (to disable) |
| `audit.intelligence` | AuditOS Intelligence Layer | `off` | eng | — | `FF_AUDIT_INTELLIGENCE=true` |
| `audit.reporting-graph` | AuditOS Reporting Graph | `off` | eng | — | `FF_AUDIT_REPORTING_GRAPH=true` |
| `audit.lead-schedule-auto` | Lead Schedule Auto-Generation | `off` | eng | — | `FF_AUDIT_LEAD_SCHEDULE_AUTO=true` |
| `audit.reconciliation` | Factory Reconciliation | `off` | eng | — | `FF_AUDIT_RECONCILIATION=true` |
| `audit.reconciliation-gates` | Reconciliation Approval Gates | `off` | eng | `audit.reconciliation` | `FF_AUDIT_RECONCILIATION_GATES=true` |
| `audit.fs-v2` | FS Engine v2 | `off` | eng | — | `FF_AUDIT_FS_V2=true` |
| `audit.ifrs-rules` | IFRS Rules Engine | `off` | eng | — | `FF_AUDIT_IFRS_RULES=true` |
| `audit.socpa-rules` | SOCPA Rules Engine | `off` | eng | — | `FF_AUDIT_SOCPA_RULES=true` |
| `audit.disclosure-auto` | Disclosure Auto Engine | `off` | eng | — | `FF_AUDIT_DISCLOSURE_AUTO=true` |
| `audit.approval-gates` | Factory Approval Gates | `off` | eng | — | `FF_AUDIT_APPROVAL_GATES=true` |
| `audit.mind-map` | Factory Mind Map | `off` | eng | — | `FF_AUDIT_MIND_MAP=true` |
| `audit.isa-rules` | ISA Rules Runtime | `off` | eng | — | `FF_AUDIT_ISA_RULES=true` |

### Platform Flags

| Key | Name | Default | Owner | Dependencies | Env Var |
|-----|------|---------|-------|--------------|---------|
| `platform.abac-shadow` | ABAC Shadow Evaluation | `on` | platform | — | `FF_ABAC_SHADOW=false` (to disable) |
| `platform.abac-shadow-verbose` | ABAC Shadow Verbose Logging | `off` | platform | `platform.abac-shadow` | (env var not exposed) |
| `platform.abac-enforce` | ABAC Enforce Mode | `off` | platform | `platform.abac-shadow` | `FF_ABAC_ENFORCE=true` |
| `platform.event-outbox` | Platform Event Outbox | `off` | platform | — | `FF_EVENT_OUTBOX=true` |
| `platform.event-schema-registry` | Event Schema Registry | `off` | platform | `platform.event-outbox` | `FF_EVENT_SCHEMA_REGISTRY=true` |

### Tenant & Queue Flags

| Key | Name | Default | Owner | Dependencies | Env Var |
|-----|------|---------|-------|--------------|---------|
| `queue.enabled` | Async Queue Runtime | `off` | eng | — | `FF_QUEUE_ENABLED=true` |
| `tenant.self-service` | Tenant Self-Service Onboarding | `on` | product | — | `FF_TENANT_SELF_SERVICE=false` (to disable) |
| `tenant.lifecycle` | Tenant Lifecycle Management | `off` | eng | — | `FF_TENANT_LIFECYCLE=true` |
| `storage.s3-as-default` | S3 as Default Storage | `off` | platform | — | `FF_STORAGE_S3=true` |

## Adding a New Flag

1. Add entry to `FLAG_REGISTRY` in `src/lib/platform/feature-flags/registry.ts`
2. Add env var mapping in `getEnvOverride()`
3. Add to this table
4. Add to `.env.example` if the flag is intended for external configuration

## Flag Lifecycle

1. **Development**: Flag added, default `off`, env var override available
2. **Staging testing**: Flag enabled via env var for specific tests
3. **Production rollout**: Flag enabled in staging then production via env var
4. **Stable**: Flag set default `on`, dependency on old code path removed
5. **Expired**: Flag removed from registry, env var handling deleted, old code path deleted

No flags currently have expiry dates. Consider adding `expiresAt` when enabling a flag for a temporary rollout.
