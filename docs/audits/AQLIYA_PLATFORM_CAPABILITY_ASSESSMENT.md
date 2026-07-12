# AQLIYA Platform Capability Assessment

> **Status:** Code-reconciled | **Date:** 2026-07-10  
> **Scope:** Shared platform/kernel capabilities in `src/lib/` consumed across products  
> **Question answered:** Is this a real shared platform capability, is it product-neutral, and can we build on it?

---

## Executive Summary

AQLIYA has a **genuine Intelligence Core** (`src/lib/core/`) and **platform services layer** (`src/lib/platform/`) that multiple products consume. However, adoption is **partial and fragmented**: products retain domain-specific guards, audit tables, storage paths, and approval persistence. The platform is **real but mid-convergence** — trustworthy for pilot builds on established patterns, **not yet trustworthy as a fully neutral product factory**.

**Overall platform kernel maturity: L4** (usable foundation with known fragmentation)  
**Target convergence layer maturity: L3–L4** (facades exist; adoption incomplete)

---

## Platform Capability Table

| Capability | Shared Module(s) | Consumers | Reality Status | Major Gaps | Trust Level |
|------------|------------------|-----------|----------------|------------|-------------|
| **Authentication / identity** | `src/lib/auth.ts`, `auth-config.ts`, `auth/` (MFA, SAML, SCIM, OAuth) | All products (~200+ imports) | **Real** | Coarse 3-role enum; AuditOS separate `AuditUser` identity | **High** |
| **Authorization / RBAC** | `authorization/` facade, `authorization/engine/` (RB-02), `platform/access/permissions.ts` | ~15 files use `authorize()`; hundreds use `requireUserContext` | **Partial — dual stack** | New engine shadow-only; two role vocabularies; ABAC env-gated | **Medium** |
| **Tenant / org isolation** | `authorization/tenant-guard.ts`, `product-guards.ts`, `platform/client-workspace-context.ts`, product guards | Platform APIs, downloads, cross-product tests | **Real, fragmented** | ADMIN cross-tenant; AuditOS parallel tenant graph | **Medium** |
| **Audit logging / lineage** | `platform/audit-log.ts`, `core/audit/`, `platform/audit/hash-chain.ts`, product `*AuditEvent` writers | 100+ `writePlatformAuditLog` sites + per-product events | **Real, dual-write** | Not unified ledger; hash chain optional | **Medium** |
| **Evidence / files / traceability** | `core/evidence/core-evidence-service.ts`, `platform/storage/`, `platform/download/download-gate.ts`, `audit/storage/` | AuditOS, LCOS, WorkflowOS, Sales adapter, platform health | **Partial** | 3 storage entrypoints; S3 not default in `platform/storage/index.ts`; CoreEvidence mirror not canonical | **Medium-Low** |
| **Workflow / approval orchestration** | `core/workflow/` (engine + adapters), `authorization/engine/policies/pol-07-approval-gate.ts` | DecisionOS, LCOS, WorkflowOS, Sales review | **Partial — per-product persistence** | No unified DB approval engine; `core/output` in-memory | **Medium** |
| **AI orchestration / governance** | `core/ai/orchestrator.ts`, `governed-ai-executor.ts`, `provider-router.ts`, `hybrid-router.ts`, `ai/` legacy | `/api/ai/*`, AuditOS bridge, LC workbook, Office AI, Sales review | **Real, flag-gated** | `ai.real-providers` off by default; RAG off; duplicate lib paths | **Medium** |
| **Knowledge / memory / RAG** | `core/memory/`, `ai/embeddings`, `knowledge-foundation/`, `tb-intelligence/` | LCOS, KF workspace, institutional memory, agent-memory API | **Partial** | RAG flag off; embeddings path exists but not default | **Medium** |
| **Monitoring / health / observability** | `platform/enterprise-health.ts`, `monitoring/system-monitor.ts`, `integration/health-runtime.ts` | `/monitoring`, `/api/platform/enterprise-health`, operator panel | **Real — diagnostic tier** | No APM/tracing; snapshot health only | **Medium** |
| **Notifications / email / jobs** | `platform/notification/engine.ts`, `core/events/outbox-service.ts`, `platform/operations/queue-runtime.ts` | Approvals, workflowos, platform operator | **Partial** | Queue no-op without `queue.enabled`; in-memory rate limits | **Low-Medium** |
| **Export infrastructure** | `platform/export.ts`, `production-export.ts`, product exporters (audit, LC, workflowos PDF) | Download API routes, export actions | **Partial — distributed** | No central governed PDF/XLSX service | **Medium** |
| **Feature flags / rollout** | `platform/feature-flags/registry.ts`, `isEnabled()` | AI, ABAC, outbox, queue, audit engines (~35 files) | **Real — static** | File registry + env only; no per-tenant DB flags | **Medium** |
| **Secret / env / config** | `platform/secrets/`, `validate-env.mjs`, `PlatformSecret` model | postinstall, storage factory, SSO | **Real** | Operator-managed; not fully self-service for all secrets | **Medium-High** |
| **Storage strategy** | `platform/storage/storage-factory.ts`, `audit/storage/`, local `./uploads` | Upload flows per product | **Partial** | `STORAGE_PROVIDER=local` default; S3 via factory not default index | **Medium** |
| **Cross-product eventing** | `core/events/outbox-service.ts`, `PlatformOutboxEvent`, `platform/product-ai-bridge.ts` | Operator APIs, audit writes, SIEM | **Partial** | Outbox flag-gated; not full event bus | **Low-Medium** |
| **Rate limiting** | `rate-limit.ts`, `platform/rate-limiter/`, `middleware-rate-limit.ts` | Middleware `/api/*`, public POST endpoints | **Real** | Memory default — unsafe multi-instance ECS | **Medium** |
| **SIEM integration** | `platform/siem/` | Enterprise health, outbox handlers | **Real, optional** | Operator wiring required | **Low-Medium** |
| **Skill runtime** | `skill-runtime/`, `/api/skills/evaluate` | Settings evaluate dashboard | **Real** | Mock evaluation default | **Medium** |
| **PDF generation** | `pdf/`, `audit/export/`, `local-content/pdf-arabic.ts` | Product exports | **Real — per-product** | Arabic fonts embedded in LC; not unified | **Medium** |
| **Malware / file scanning** | `audit/file-scanner.ts`, ClamAV client | AuditOS uploads primarily | **Partial** | Fail-closed in prod code; not platform-wide; compose has clamav | **Medium** |
| **Encryption at rest** | `platform/encryption/`, SSO clientSecret AES-256-GCM | SSO providers, vault | **Real** | Scope limited to implemented surfaces | **High** |
| **Download ticket gate** | `platform/download/download-gate.ts` | Protected download API routes | **Real** | Not all exports use ticket pattern | **Medium-High** |
| **Hash chain audit integrity** | `platform/audit/hash-chain.ts`, `HashChainEntry` model | Platform audit store | **Real, optional** | Not all audit paths write chain | **Medium** |
| **ABAC policy engine** | `core/policy/access/`, `AbacPolicy*` models | Shadow + enforce flags | **Partial** | Enforce env-gated; shadow in auth.ts | **Low-Medium** |
| **Model governance registry** | `AiModelRegistry`, `AiModelDeployment`, settings UI | `/settings/models`, `/settings/ai-governance` | **Partial** | Models exist; not full Model Governance product | **Medium** |
| **Agent memory** | `AgentMemory`, `/api/agent-memory` | Cross-product memory API | **Real** | Governance varies by consumer | **Medium** |
| **Internationalization** | `messages/`, `i18n/`, RTL layouts | All UI routes | **Real** | Arabic-first; some English leakage in shells | **High** |

---

## Intelligence Core Deep Dive

**Location:** `src/lib/core/index.ts` — barrel exports for:

| Module | Path | Status | Product adapters |
|--------|------|--------|------------------|
| Workflow engine | `core/workflow/engine.ts` | Real | DecisionOS, LCOS, WorkflowOS adapters |
| Evidence graph | `core/evidence/graph.ts` | Real | IntelligenceGraphNode linkage |
| AI orchestrator | `core/ai/orchestrator.ts` | Real, flag-gated | All AI consumers |
| Governance engine | `core/governance/engine.ts` | Real | Metadata injection |
| Event outbox | `core/events/outbox-service.ts` | Real, flag-gated | Platform operator |
| Audit facade | `core/audit/` | Real | Dual-write to PlatformAuditLog |
| Policy access | `core/policy/access/` | Partial | ABAC pilot |

**Adoption verdict:** Core is **architecturally real** but products **do not uniformly route through it**. Legacy `src/lib/audit/`, `src/lib/local-content/`, etc. remain primary execution paths.

---

## Feature Flag Reality (Platform Controls)

Key flags from `src/lib/platform/feature-flags/registry.ts`:

| Flag | Default | Impact |
|------|---------|--------|
| `ai.real-providers` | **off** | All AI deterministic unless enabled |
| `ai.rag` | **off** | No vector retrieval |
| `ai.budget-quotas` | off | No spend caps |
| `platform.event-outbox` | env | Async event processing |
| `platform.abac-enforce` | env | ABAC enforcement |
| `queue.enabled` | env | Bull/Redis jobs — fake IDs when off |
| `storage.s3-as-default` | env | S3 vs local storage |
| `audit.intelligence` | off | AuditOS AI enrichment |
| `audit.reporting-graph` | off | Dual-write reporting graph |

**Implication:** Platform capabilities exist but **production behavior depends on env/flags** not visible in UI admin.

---

## Consumer Map (Who Uses What)

```
                    ┌─────────────────────────────────────┐
                    │         Intelligence Core           │
                    │  core/ai, workflow, evidence, audit │
                    └──────────────┬──────────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
   ┌────▼────┐               ┌─────▼─────┐            ┌──────▼──────┐
   │ AuditOS │               │ LocalContent│           │ DecisionOS  │
   │ audit/  │               │ local-content/│         │ decision/   │
   └────┬────┘               └─────┬─────┘            └──────┬──────┘
        │                          │                          │
        └──────────────────────────┼──────────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │     Platform Services Layer           │
                    │  auth, audit-log, storage, download,  │
                    │  notification, feature-flags, SIEM  │
                    └─────────────────────────────────────┘
```

**Leakage observed:** AuditOS tenant model (`AuditOrganization`) bypasses platform `Organization` — product concept in shared isolation layer.

---

## Product-Neutrality Assessment

| Capability | Product-neutral? | Evidence |
|------------|------------------|----------|
| Auth session | Mostly yes | Shared User model — except AuditUser |
| RBAC roles | Mostly yes | 3 coarse roles — product guards add rules |
| Tenant guard | **No** | AuditOS separate graph |
| Audit log writer | Yes | PlatformAuditLog API neutral |
| AI orchestrator | Yes | Provider routing shared |
| Workflow engine | Mostly yes | Adapters per product |
| Evidence CoreEvidence | Mostly yes | Mirror from product uploads |
| Export | **No** | Product-specific generators |
| Storage | Mostly yes | Factory pattern — inconsistent default |

---

## Trust Levels for Building New Products

| Build on... | Recommendation |
|-------------|----------------|
| `getCurrentUser()` + `requireUserContext()` + action guards | **Yes** — established pattern |
| `writePlatformAuditLog()` | **Yes** — for cross-product observability |
| `core/ai/governed-ai-executor` | **Yes** — with human review + flags documented |
| `core/workflow/engine` + adapter | **Yes** — for new approval flows |
| `CoreEvidence` registration | **Yes** — register on upload |
| `authorize()` RB-02 engine alone | **No yet** — not primary enforcement |
| AuditOS tenant model for new product | **No** — use Organization + platformOrganizationId |
| Sales v02/vnext modules | **No** — consolidation required |
| In-memory output service | **No** — not persisted |

---

## Gap Priority for Platform Maturity (L4 → L5)

1. **Make RB-02 engine primary** — retire shadow-only mode
2. **Unify storage behind storage-factory** — S3 default in prod task def
3. **Enable outbox + Redis rate limiter + queue in staging/prod**
4. **Complete CoreEvidence registration** on all upload paths
5. **Persist approval/output** — replace in-memory core/output
6. **Platform-wide file scanner** — not AuditOS-only
7. **Per-tenant feature flag store** — or document env-only limitation
8. **Single audit ledger strategy** — document dual-write until migration complete

---

## Comparison to Documentation Claims

| Doc claim (PRODUCT_STATUS) | Code verdict |
|---------------------------|--------------|
| Intelligence Core L6, Tier 3 complete | **L4** — facades real, adoption partial |
| ABAC shadow+enforce production | **Partial** — env-gated |
| 12/12 engines barrel-exported | **True** in core/index |
| Unified workflow engine | **Partial** — adapters exist; product tables own state |
| Cost governance per-org | **Real** when cost-tracking on |
| Model registry production | **Partial** — schema + UI, not full product |

---

**Evidence paths:** `src/lib/core/`, `src/lib/platform/`, `src/lib/authorization/`, `src/lib/auth.ts`, `prisma/schema.prisma` (Platform*, CoreEvidence, AbacPolicy*), feature flag registry, middleware.ts.

**Status:** DONE
