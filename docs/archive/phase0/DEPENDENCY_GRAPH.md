# AQLIYA — Dependency Graph
**Phase 0 Reality Audit | Generated: 2026-06-24**

---

## 1. Inter-Layer Dependencies

```
┌──────────────────────────────────────────────────────────┐
│  LAYER: Request Handling (Edge)                          │
│  middleware.ts                                           │
│  ├── lib/auth/mfa-gate.ts                               │
│  ├── middleware-security.ts                              │
│  └── middleware-rate-limit.ts                            │
│       └── lib/platform/rate-limiter/ (Node-side)        │
└──────────────────────────┬───────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────┐
│  LAYER: Pages / API Routes                               │
│  src/app/**                                              │
│  ├── lib/auth (getCurrentUser, session)                  │
│  ├── lib/authorization (enforce, authorize)              │
│  ├── lib/[product]/ (product queries)                    │
│  └── actions/ (server mutations)                         │
└──────────────────────────┬───────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────┐
│  LAYER: Server Actions (src/actions/)                    │
│  ├── lib/authorization/action-guard (enforce)            │
│  ├── lib/auth (getCurrentUser)                           │
│  └── lib/[product]/ (service calls)                      │
└──────────────────────────┬───────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────┐
│  LAYER: Product Libraries (lib/audit, lib/sales, etc.)   │
│  ├── lib/core/ai (AI execution)                          │
│  ├── lib/core/evidence (evidence write-through)          │
│  ├── lib/core/workflow (workflow state machine)          │
│  ├── lib/core/events (outbox events)                     │
│  ├── lib/platform/storage (file storage)                 │
│  ├── lib/platform/email (notifications)                  │
│  ├── lib/platform/audit-log (audit trail)                │
│  └── Prisma (DB access)                                  │
└──────────────────────────┬───────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────┐
│  LAYER: Core Engines (lib/core/)                         │
│  ├── Prisma (all DB access)                              │
│  ├── AI providers (Anthropic, OpenAI, vLLM, Ollama)      │
│  ├── Redis (cache, queues)                               │
│  └── S3 (via lib/platform/storage)                       │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Critical Import Paths

### Authorization (canonical)
```
Server Action
  └── @/lib/authorization/action-guard → enforce()
       └── @/lib/authorization/authorize → authorize()
            ├── @/lib/authorization/tenant-guard
            ├── @/lib/core/policy/access (ABAC)
            └── Prisma (Role, Permission lookups)
```

### AI Execution (canonical)
```
Product service
  └── @/lib/core/ai/engine → governedAiExecutor()
       ├── @/lib/core/ai/eval-gate
       ├── @/lib/core/ai/hybrid-router
       │    └── @/lib/core/ai/providers/[provider]
       ├── @/lib/core/ai/budget-manager
       ├── @/lib/core/ai/spend-tracker → Prisma
       └── @/lib/core/ai/observability
```

### AI Execution (legacy — still used by older product code)
```
@/lib/ai/* → re-exports @/lib/core/ai/*
⚠ DEPRECATED LAYER: backward compat only
```

### Evidence Write (canonical)
```
Product event/action
  └── @/lib/core/evidence/core-evidence-service
       ├── @/lib/core/evidence/lifecycle
       ├── @/lib/core/evidence/graph
       └── Prisma (CoreEvidence, EvidenceLink, EvidenceLifecycle)

Product adapters bridge to core:
  @/lib/core/evidence/adapters/audit-adapter
  @/lib/core/evidence/adapters/local-content-adapter
```

### Workflow Execution
```
Product action
  └── @/lib/core/workflow/engine
       ├── @/lib/core/workflow/state-machine
       └── adapters:
            ├── workflowos-adapter
            ├── local-content-adapter
            └── decision-os-adapter
```

---

## 3. External Dependency Map

### Runtime Dependencies (48 production packages)

| Package | Purpose | Risk |
|---|---|---|
| `next` | Framework | Core — locked to Next.js App Router |
| `@prisma/client` + `@prisma/adapter-pg` | ORM + PG adapter | DB schema coupled to Prisma |
| `next-auth` | Authentication | Auth strategy locked to NextAuth |
| `ioredis` | Redis client | Node-only (not Edge compatible — isolated to server) |
| `bull` | Job queues | Depends on Redis; used for background work |
| `@sentry/nextjs` | Error tracking | Observability dependency |
| `@node-saml/node-saml` | SAML auth | Enterprise SSO dependency |
| `@aws-sdk/client-s3` | S3 storage | Cloud storage dependency |
| `pdf-parse` + `pdfkit` | PDF processing | File handling |
| `mammoth` | DOCX processing | File handling |
| `xlsx` | Excel processing | File handling |
| `bcryptjs` | Password hashing | Auth dependency |
| `zod` | Schema validation | Used across all validation layers |
| `nodemailer` | Email sending | SMTP dependency |
| `csv-parse` | CSV import | LocalContentOS data import |
| `pg` | PostgreSQL driver | Database |
| `next-intl` | i18n | Arabic/English locale routing |
| `playwright` | Browser automation | Scripting (not test runner) |
| `date-fns` | Date utilities | Utility |

### AI Provider Dependencies

| Provider | Package/Protocol | Route |
|---|---|---|
| Anthropic | `ANTHROPIC_API_KEY` env, HTTP | Cloud |
| OpenAI | `OPENAI_API_KEY` env, HTTP | Cloud + Embeddings |
| vLLM | `VLLM_BASE_URL` env, OpenAI-compatible | Self-hosted |
| Ollama | `AI_LOCAL_BASE_URL` env, HTTP | Local |
| Generic cloud | `AI_CLOUD_API_KEY`, `AI_CLOUD_BASE_URL` | Custom cloud |

---

## 4. Module Coupling Analysis

### High-Coupling Areas (most imported, highest blast radius)

| Module | Used By | Risk |
|---|---|---|
| `@/lib/auth` (getCurrentUser) | Every server action, every page | Platform-wide auth dependency |
| `@/lib/authorization/action-guard` | All server actions | Authorization critical path |
| `@/lib/core/ai/engine` | All AI-enabled products | AI execution critical path |
| `Prisma client` | All services, all actions | Database coupling |
| `@/lib/platform/audit-log` | All mutation paths | Audit trail dependency |
| `@/lib/core/evidence` | AuditOS, LC, Decisions, Sales | Cross-product evidence bus |

### Low-Coupling (well-isolated)
- `src/app/auditos/*` — mock-backed, no Prisma writes
- `src/app/(marketing)/*` — no auth, no DB
- `src/lib/core/events/outbox-service.ts` — event-driven, loosely coupled

---

## 5. Problematic Dependency Patterns

### Pattern A — Layer Bypass (High Risk)
Some product-level files import directly from Prisma instead of going through the service layer. This bypasses auth checks and audit logging.

**Locations to audit during Phase 1:**
- Any `import { prisma }` inside `src/app/api/` route handlers (should go through service)
- Direct Prisma calls in `src/components/` (should never happen)

### Pattern B — Backward-Compat Wrapper Accumulation (Medium Risk)
```
src/lib/ai/* → src/lib/core/ai/*
```
The `src/lib/ai/` directory is a pure re-export shell. Any code still importing from `@/lib/ai` instead of `@/lib/core/ai` is using a deprecated path. This creates a hidden import graph that makes tree-shaking and tracing harder.

### Pattern C — Decision Module Fragmentation (Medium Risk)
```
src/lib/decision/     ← primary decision logic (32 files)
src/lib/decisions/    ← single file (export.ts) — unclear why separate
src/lib/core/decision/ ← core engine + adapters
```
Three module locations for one product's logic. Developers importing DecisionOS logic may not know which layer is authoritative.

### Pattern D — Sales Version Proliferation (High Risk)
```
src/lib/sales/        ← base SalesOS library
src/lib/sales/v02/    ← version 2 additions
src/lib/sales/vnext/  ← next version in development
src/products/sales/   ← product definition + core adapters
```
Four entry points for SalesOS logic. The TypeScript errors in `src/actions/sales-actions.ts` suggest that `v02/` and `vnext/` diverged from the core type definitions without reconciliation.

### Pattern E — Retention Policy Duplication (Medium Risk)
```
src/lib/core/policy/retention/  ← canonical retention engine
src/lib/platform/retention/     ← appears to mirror or extend it
```
Both have `engine.ts`, `policies.ts`, `holds.ts`, `types.ts`. Risk of logic divergence over time.

### Pattern F — Evidence Store Fragmentation (High Risk)
Evidence logic exists in 5+ locations:
```
src/core/evidence/                 ← old layer (evidence-store.ts, evidence-store-prisma.ts)
src/lib/core/evidence/             ← new canonical layer
src/lib/platform/evidence/         ← platform-level evidence service
src/lib/audit/evidence-versioning-service.ts  ← audit-specific
src/lib/[product]/evidence.ts      ← per-product evidence
```

---

## 6. Feature Flag Dependencies

The following features have code that conditionally activates based on `FF_*` environment variables. Removing or toggling these flags has downstream effects:

| Flag | Activates | Dependencies |
|---|---|---|
| FF_ABAC_ENFORCE | ABAC policy enforcement | lib/core/policy/access, AbacPolicy DB models |
| FF_AI_RAG | RAG-augmented AI | lib/core/knowledge/rag, pgvector, DocumentChunk |
| FF_AI_REAL_PROVIDERS | Live AI providers | Anthropic/OpenAI API keys |
| FF_EVENT_OUTBOX | Outbox event processing | PlatformOutboxEvent, Bull queue, Redis |
| FF_EVENT_SCHEMA_REGISTRY | Event schema validation | lib/core/events/schema-registry |
| FF_AUDIT_APPROVAL_GATES | Approval gate enforcement | AuditApprovalRecord, workflow gating |
| FF_AUDIT_INTELLIGENCE | AI-powered audit analysis | audit-intelligence service |
| FF_AUDIT_RECONCILIATION | Auto-reconciliation | reconciliation service |
| FF_AUDIT_REPORTING_GRAPH | Graph-based reporting | ReportingGraph* models |

---

*Dependency Graph generated from live code — 2026-06-24.*
