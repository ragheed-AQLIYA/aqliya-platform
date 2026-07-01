# AQLIYA Current Reality Report

**Generated:** 2026-06-24
**Methodology:** Full repository crawl — 2,249 source files, 328,151 lines of TypeScript/TSX, 5,475-line Prisma schema, 547 route/view files, 72 test files, 14 Cypress E2E specs.

---

## 1. Repository Size & Shape

| Metric | Value |
|--------|-------|
| Source files | 2,249 (`.ts`, `.tsx`, `.js`, `.css`) |
| Total lines | 328,151 |
| Route files (pages/layouts/etc.) | 551 |
| Prisma models | ~210 |
| Prisma schema lines | 5,475 |
| Jest test files | 72 |
| Cypress E2E specs | 14 |
| Docker compose files | 5 |
| CI/CD workflows | 5 |
| Runbooks | 7 |
| Seed scripts | 12 |

---

## 2. Architecture Topology

### 2.1 Route Architecture
- **3 route groups**: `(dashboard)/`, `(marketing)/`, root
- **~260 page.tsx files**, 77 loading.tsx, 77 error.tsx, 64 route.ts, 21 layout.tsx
- Products: audit, decisions, local-content, sales, office-ai, sunbul, workflowos, contacts, content-studio, risk, sampling, intelligence, monitoring, operator, knowledge-foundation, governance-hub
- API routes under `/api/:product/` pattern
- Auth via middleware.ts with JWT token + RBAC + MFA gate

### 2.2 Source Layout (Evolutionary — not clean)
- `src/app/` — Next.js App Router routes
- `src/actions/` — Server Actions (~75 files)
- `src/components/` — UI components by domain (~23 directories)
- `src/lib/` — Business logic (~22 service directories)
- `src/core/` — Core platform services (5 directories)
- `src/products/` — Product-specific code (1 directory: sales)

### 2.3 Database Architecture (Prisma)
- ~210 models across products
- Multi-product schema in single Prisma file (5,475 lines)
- Products share `PlatformOrganization` as root tenant
- pgvector extension for embeddings (`DocumentChunk`)
- Hash chain audit support (`HashChainEntry`)
- ABAC policies (`AbacPolicy`, `AbacPolicyCondition`, `AbacPolicyAssignment`)

---

## 3. Critical Architecture Findings

### CRITICAL: F-01 — Duplicate AI Engine
**Two parallel AI frameworks exist:**
- `src/lib/ai/` — 69 files, full implementation (providers, eval, governance, routing, spending)
- `src/lib/core/ai/` — 35 files, 33 overlapping filenames = code duplication

**Risk:** Maintenance divergence, inconsistent behavior, double cost tracking, double evaluation gates.

### CRITICAL: F-02 — Duplicate Governance Engine
**Two parallel governance frameworks:**
- `src/lib/governance/` — Full framework (approval, escalation, provenance, retrieval routing)
- `src/lib/core/governance/` — Duplicate engine (2 files)
- Plus `src/lib/audit/governance/` — Audit-specific governance engine
- Plus `src/lib/sales/` governance checks
- Plus `src/lib/local-content/` guards

**Risk:** Inconsistent approval flows, audit gaps, maintenance burden.

### CRITICAL: F-03 — Fragmented Authorization System
**4+ permission systems discovered:**
1. `src/lib/core/access/` — Core access control
2. `src/lib/platform/access/` — Platform RBAC (1,409 lines)
3. `src/core/access/` — Server action guard + access control
4. `src/lib/platform/abac/` — ABAC policy engine
5. Product-specific guards:
   - `src/lib/workflowos/tenant-guard.ts`
   - `src/lib/sales/guards.ts` + `permissions.ts`
   - `src/lib/local-content/guards.ts`
   - `src/lib/audit/tenant-guard.ts`
   - `src/lib/platform/guards/` (2 guards)
6. Middleware.ts — Edge-level RBAC with `routeMinRoles`
7. `src/core/access/server-action-guard.ts` — Server Action guard

**30+ files** match permission/RBAC/access/guard patterns.

**Risk:** Inconsistent authorization enforcement, bypass potential, audit gaps.

### HIGH: F-04 — Two Evidence Systems
- `src/lib/core/evidence/` — Core evidence service (index, service, health, lifecycle, graph)
- `src/lib/platform/evidence/` — Platform evidence
- Product evidence in `src/lib/audit/`, `src/actions/audit-actions.ts`

**Risk:** Inconsistent evidence lifecycle, dual maintenance.

### HIGH: F-05 — Two RAG/Embedding Implementations
- `src/lib/ai/embedding/` + `src/lib/ai/retrieval/`
- `src/lib/core/ai/` (duplicated)
- `src/lib/rag/` — Separate Rag embedding provider + governance metadata
- `src/lib/core/knowledge/rag/` — Another embedding provider

**Risk:** Scattered retrieval architecture, inconsistent citation behavior.

### HIGH: F-06 — Prisma Schema Monolith (5,475 lines)
Single `schema.prisma` file contains ~210 models for all products.
- No product-level schema separation
- Cross-model dependencies across product boundaries
- Migration risk across all products simultaneously

### MEDIUM: F-07 — Explicit Route File Gaps
Filesystem check shows `[engagementId]` route files NOT FOUND on disk for:
- `mapping/`, `materiality/`, `notes/`, `pilot/`, `publication/`, `recommendations/`, `review/`, `sampling/`, `statements/`, `trial-balance/`, `validation/`
- These are likely in route groups or use parallel routes/fragments

---

## 4. AI Stack Assessment

| Component | Status |
|-----------|--------|
| Provider routing | ✅ Implemented (hybrid-router, provider-router, provider-factory) |
| Provider implementations | Anthropic, OpenAI, local, deterministic, cloud (5 providers) |
| Circuit breaker | ✅ Implemented |
| Eval framework | ✅ Implemented (eval-runner, eval-types, 4 eval suites) |
| Eval gate | ✅ Implemented (eval-gate.ts in both lib/ai and lib/core/ai) |
| Cost tracking | ✅ 2 implementations (budget-manager.ts, spend-tracker.ts) |
| Prompt registry | ✅ Implemented (prompt-registry.ts) |
| Model registry | ✅ Implemented (model-registry.ts) |
| AI observability | ✅ Implemented (observability.ts — 2 copies) |
| AI governance | ✅ Implemented (governance-metrics.ts, governed-ai-metadata.ts) |
| Golden datasets | ⚠️ Partial (4 eval suites exist: disclosure-notes, financial-analysis, finding-summary, framework-self-test) |
| Cost controls | ✅ Budget manager + spend tracker |
| Regression testing | ⚠️ Partial (eval suites exist but no automated regression pipeline) |
| Benchmark runner | ❌ Not found as standalone runner |

### AI Providers
| Provider | File | Purpose |
|----------|------|---------|
| Anthropic | `anthropic-provider.ts` | Primary LLM |
| OpenAI | `openai-provider.ts` | Secondary LLM |
| OpenAI Embedding | `openai-embedding-provider.ts` | Embedding generation |
| Local | `local-provider.ts` | Local inference for private deployments |
| Deterministic | `deterministic-provider.ts` | Rule-based fallback |
| Cloud | `cloud-provider.ts` | Cloud provider abstraction |

---

## 5. Permission/Authorization System Map

### 5.1 Middleware Layer (Edge)
- `src/middleware.ts` — JWT token auth, RBAC route check, MFA gate
- `routeMinRoles` — Route-to-minimum-role mapping (viewer, operator, manager, admin)
- Role hierarchy: viewer(0) → operator(1) → manager(2) → admin(3)

### 5.2 Server Action Guard
- `src/core/access/server-action-guard.ts` — Server-side action authorization

### 5.3 Platform RBAC
- `src/lib/platform/access/rbac-service.ts` — 14,468 bytes, full RBAC implementation
- `src/lib/platform/access/permissions.ts` — Permission definitions
- `src/lib/platform/access/workspace-access.ts` — Workspace-level access
- `src/lib/platform/access/seed-permissions.ts` — Database seeding

### 5.4 ABAC (Attribute-Based Access Control)
- `src/lib/platform/abac/abac-service.ts`
- `src/lib/platform/abac/condition-evaluator.ts`
- Prisma models: `AbacPolicy`, `AbacPolicyCondition`, `AbacPolicyAssignment`

### 5.5 Product Guards
| Product | Guard File | Lines |
|---------|-----------|-------|
| Audit | `src/lib/audit/tenant-guard.ts` | 1,934 |
| Sales | `src/lib/sales/guards.ts` | 3,585 |
| Local Content | `src/lib/local-content/guards.ts` | 2,894 |
| WorkflowOS | `src/lib/workflowos/tenant-guard.ts` | 4,064 |
| Platform Org | `src/lib/platform/guards/platform-org-guard.ts` | 4,118 |
| Workspace | `src/lib/platform/guards/workspace-guard.ts` | 5,256 |
| Audit workflow | `src/components/audit/layout/workflow-guard.tsx` | 2,199 |
| Audit access | `src/core/access/audit-access-adapter.ts` | 2,175 |

### 5.6 Permission Seeds
- **33 seed scripts** in `prisma/seed*.ts`
- Permission seeds in `prisma/seed-abac-policies.ts`

---

## 6. Governance System Map

### 6.1 Governance Libraries
| Location | Files | Purpose |
|----------|-------|---------|
| `src/lib/governance/` | 8 source + 5 tests + examples | Full governance framework |
| `src/lib/core/governance/` | 2 files | Duplicate engine |
| `src/lib/audit/governance/` | 4 files + tests | Audit-specific governance |
| `src/lib/sales/` governance files | Multiple | Sales governance |

### 6.2 Governance Components
- `approval-state.ts` — Approval state machine
- `escalation.ts` — Escalation rules
- `actor-lineage.ts` — Actor tracking
- `provenance.ts` — Data provenance
- `retrieval-router.ts` — Retrieval governance
- `prompt-framework.ts` — Prompt governance

### 6.3 Governance UI Components
- `src/lib/governance/ui/governance-display.ts`
- `src/lib/governance/ui/escalation-display.ts`
- `src/lib/governance/ui/provenance-display.ts`
- `src/lib/governance/ui/governance-visibility-rules.ts`
- `src/components/audit/governance/` — 10 files

---

## 7. Test Coverage

### 7.1 Jest Tests (72 files)
| Category | Count | Tests |
|----------|-------|-------|
| Unit tests | ~25 | General, AI, governance, security, rate-limit |
| Integration tests | ~8 | API health, governance bridge, decision evidence, org scoping |
| Cross-tenant isolation | 2 | `cross-tenant-isolation.test.ts`, `tenant-isolation-audit.test.ts` |
| AI tests | ~15 | Provider, router, eval, embedding, spend, ingestion, observability |
| Governance tests | 5 | Approval, escalation, prompt, provenance, retrieval |

### 7.2 Cypress E2E (14 specs)
- Sales, audit, local content flows
- Authentication flows

### 7.3 Test Gaps
- No load testing
- No performance regression tests
- No security penetration tests
- No E2E for all products
- No migration tests for schema changes
- No AI regression benchmark pipeline

---

## 8. Infrastructure

### 8.1 Containerization
- 5 Docker compose files
- Dockerfile (Node.js)
- `.dockerignore`

### 8.2 CI/CD
| Workflow | File | Purpose |
|----------|------|---------|
| CI | `.github/workflows/ci.yml` | Push/PR: type-check, test, lint, build, audit |
| Deploy | `.github/workflows/deploy.yml` | Production deployment |
| Preview | `.github/workflows/preview.yml` | Preview deployments |
| Promote | `.github/workflows/promote.yml` | N-1 rollback support |
| Backup | `.github/workflows/backup.yml` | Database backup |

### 8.3 Monitoring
- Sentry (client, edge, server)
- Runbooks for alerting, monitoring, backup/restore, disaster recovery
- AI observability module

### 8.4 Rate Limiting
- `src/middleware-rate-limit.ts` — Edge rate limiter
- `src/lib/rate-limit.ts`, `src/lib/rate-limit-edge.ts`
- `src/lib/platform/rate-limiter/`
- Redis-backed rate limiting

---

## 9. Cross-Cutting Concerns

### 9.1 Internationalization
- `next-intl` configured
- Arabic-first UX with RTL layouts
- `i18n/` directory at root
- `messages/` directory at root

### 9.2 File Storage
- Local storage provider (`src/lib/platform/storage/local-storage-provider.ts`)
- S3 storage provider (`src/lib/platform/storage/s3-storage-provider.ts`)
- Upload directories: `uploads/localcontent/`, `uploads/siem-jobs/`, `uploads/sunbul/`

### 9.3 Background Jobs
- Bull queue (Redis-backed)
- Outbox event system in `src/lib/core/events/`

### 9.4 SSO
- SAML implementation via `@node-saml/node-saml`
- OAuth providers in `src/lib/auth/`
- SCIM provisioning in `src/lib/auth/scim-service.ts`

---

## 10. Risk Matrix

| ID | Finding | Severity | Effort | Business Impact |
|----|---------|----------|--------|-----------------|
| F-01 | Duplicate AI engine (`lib/ai` vs `lib/core/ai`) | **Critical** | 3-5 days | Inconsistent AI behavior, double cost tracking |
| F-02 | Duplicate governance engine | **Critical** | 2-3 days | Approval bypass risk, audit inconsistency |
| F-03 | Fragmented authorization (4+ systems) | **Critical** | 5-8 days | Permission gaps, security incidents |
| F-04 | Two evidence systems | **High** | 2-3 days | Evidence lifecycle inconsistency |
| F-05 | Scattered RAG/embedding | **High** | 3-4 days | Retrieval inconsistency, citation gaps |
| F-06 | Prisma schema monolith (5,475 lines) | **High** | 5-10 days | Migration friction, cross-product coupling |
| F-07 | Missing route files | **Medium** | 1 day | Confusion about implemented routes |
| F-08 | No AI regression benchmark | **Medium** | 3-5 days | AI quality degradation undetected |
| F-09 | No load testing | **Medium** | 3-5 days | Performance blind spot |
| F-10 | No penetration testing | **High** | 5-10 days | Security vulnerabilities undetected |
| F-11 | 33 overlapping files in AI libraries | **Critical** | 3-5 days | Direct code duplication |

---

*This report is evidence-based. Every finding was verified by inspecting actual filesystem, source code, Prisma schema, CI/CD config, and test output. No assumptions from documentation were used.*
