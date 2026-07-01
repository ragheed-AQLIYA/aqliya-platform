# AQLIYA — Current State Report
**Phase 0 Reality Audit | Generated: 2026-06-24**
**Classification: Internal — Engineering & Executive Use Only**

---

## Audit Methodology

This report is derived entirely from repository reality — live code, Prisma schema, middleware, CI/CD configuration, and package manifest. Documentation claims were cross-referenced against code but documentation was not used as a source of truth. All findings are evidence-backed.

---

## 1. Repository Scale

| Dimension | Count |
|---|---|
| TypeScript / TSX source files | 2,250 |
| UI Components | 344 |
| Library files (src/lib) | 1,162 |
| API route handlers (route.ts) | 62 |
| App pages (page.tsx) | 260 |
| Test files (unit + integration + component) | 324 |
| Cypress e2e specs | 11 |
| Prisma models | ~200 |
| Prisma enums | 27 |
| Prisma migrations | 55 |
| npm production dependencies | 48 |
| npm dev dependencies | 23 |
| CI/CD workflows | 5 |
| Terraform modules | 5 |
| Feature flags (FF_ env vars) | ~15 |

This is a large-scale Next.js monolith with significant breadth. The surface area presents maintenance risk without architectural discipline.

---

## 2. Product Inventory — Reality vs Documentation

| Product / System | Declared Status | Code Reality | Route(s) | Notes |
|---|---|---|---|---|
| AuditOS | L5 pilot-ready | Confirmed — deep service layer, tests, governance | `/audit/*` | Strongest product in codebase |
| LocalContentOS | L5 pilot-ready (with conditions) | Confirmed — ERP integration, workbook, campaigns | `/local-content/*` | Pilot-ready; ERP connectors present |
| DecisionOS | L4 usable v0.1 | Confirmed — decision engine, governance, scenarios | `/decisions/*` and `/decision/*` | Duplicate route prefix exists |
| WorkflowOS | L4→L5 partial | Confirmed — clients, templates, records | `/workflowos/*` | Sunbul redirect alias active |
| Office AI Assistant | L4 usable v0.1 | Confirmed — task service, file processing | `/office-ai/*` | `/assistant/*` also exists separately |
| SalesOS | L4+ prototype | Active but TypeScript-broken — ~30 TS errors | `/sales/*` | Schema drift R-04 confirmed; not buildable cleanly |
| RiskOS | Contradicts docs ("do not build") | Routes exist: `/risk/*`, `/risk/assessments/*` | `/risk/*` | Middleware matcher includes risk; AGENTS.md says do not build |
| ContentStudio | L3 prototype | Active — workspaces, content items, approvals | `/content-studio/*` | Not in official product taxonomy |
| LocalContactOS | L4→L5 partial | Confirmed — contacts, interactions, relations | `/contacts/*` | Functioning governed workspace |
| Knowledge Foundation | Active | Deep versioning, diff, release system | `/knowledge-foundation/*` | Substantial surface, undocumented in main taxonomy |
| Institutional Memory | Active | Collections, events, graph | `/institutional-memory/*` | Not in main CLAUDE.md taxonomy |
| Sampling | Active | Sampling plans, evidence, reviews | `/sampling/*` | Middleware-protected but undocumented in taxonomy |
| AuditOS Demo | L1 public demo | Confirmed mock-backed, read-only | `/auditos/*` | Correctly isolated |
| SimulationOS | Marketing redirect | Route `/products/simulation` → `/products` | N/A | Confirmed redirect-only |
| Sunbul | Redirect alias | `/sunbul/*` has actual page content | `/sunbul/*` | Should be redirect-only; has live pages |
| AQLIYA Studio | L0 future | No code present | — | Correctly absent |

**Finding**: 4 systems (RiskOS, ContentStudio, Institutional Memory, Sampling) operate as active governed workspaces without appearing in the official CLAUDE.md taxonomy. This creates governance drift — changes to these areas lack a documented owner or readiness gate.

---

## 3. Architecture Overview

### Stack
- **Framework**: Next.js (App Router, webpack build) with TypeScript
- **Database**: PostgreSQL via Prisma ORM (pgvector extension for embeddings)
- **Cache / Queue**: Redis (ioredis) via ElastiCache
- **Storage**: AWS S3 with provider abstraction
- **Auth**: NextAuth v5 (JWT strategy) with SAML, OAuth (Google, GitHub, Azure AD, Okta), MFA, SCIM
- **AI**: Multi-provider — Anthropic, OpenAI, vLLM/Ollama, with hybrid routing
- **Monitoring**: Sentry (error), CloudWatch (infra), custom observability layer
- **Deployment**: AWS ECS Fargate (me-south-1 primary, eu-central-1 DR) + Vercel alternative

### Source Layer Structure

```
src/
├── app/                    Next.js pages + API routes (260 pages, 62 API routes)
├── actions/                Server Actions (Next.js server-side mutations)
├── components/             UI components (344 total)
├── lib/                    Application libraries
│   ├── core/               Core domain engines (AI, audit, decision, evidence, workflow)
│   ├── platform/           Platform-level shared services
│   ├── ai/                 ← LEGACY WRAPPER: re-exports from lib/core/ai
│   ├── audit/              AuditOS business logic
│   ├── decision/           DecisionOS business logic (+ lib/decisions/ exists separately)
│   ├── sales/              SalesOS (with v02/ and vnext/ version subdirs)
│   ├── local-content/      LocalContentOS
│   ├── authorization/      Unified authorization layer
│   └── [other products]
├── core/                   ← PARTIALLY MIGRATED: access/, evidence/, audit/, output/
├── products/               Product definitions (currently only sales/)
└── types/                  Type definitions
```

### Architecture Issues

The repository has **three distinct "core" layers** in active use:
- `src/core/` — older product-level access and evidence (partially migrated)
- `src/lib/core/` — new canonical core engines (AI, audit, decision, workflow, evidence, knowledge)
- `src/lib/platform/` — platform services (auth, caching, storage, email, SIEM, etc.)

`src/lib/ai/*` is a backward-compatibility re-export shell pointing to `src/lib/core/ai/*`. Both layers are in the live codebase, creating confusion about the canonical import path.

---

## 4. Authentication & Authorization

### Authentication
- NextAuth JWT with `AUTH_SECRET` and custom `salt`
- MFA gate: `resolveMfaGateState()` enforced at middleware level
- MFA is role-conditional (not universal) — configurable via `mfa-roles.ts`
- SAML/OIDC SSO: implemented in `src/lib/auth/saml/` and `sso-service.ts`
- SCIM provisioning: `/api/scim/v2/*` (API key auth)
- OAuth providers: Google, GitHub, Azure AD, Okta (env-configured)

### Authorization
- **Edge RBAC**: `middleware.ts` enforces role hierarchy (viewer < operator < manager < admin) per route prefix
- **Unified auth layer**: `src/lib/authorization/` — `authorize()`, `enforce()`, `checkTenantAccess()`
- **ABAC**: `src/lib/core/policy/access/` — policy-based attribute control, **feature-flagged** (`FF_ABAC_ENFORCE`, `FF_ABAC_SHADOW`)
- **Product guards**: Consolidated in `src/lib/authorization/product-guards.ts`
- **Server Action guard**: `src/lib/authorization/action-guard.ts`
- **Legacy layer**: `src/core/access/` still present (partially migrated)

**Finding**: Authorization has been consolidated into `src/lib/authorization/` but `src/core/access/` remains. ABAC is shadow-mode only — not enforced by default. MFA enforcement is role-based, not universal.

---

## 5. AI Stack

| Component | Location | Status |
|---|---|---|
| Provider factory | `src/lib/core/ai/provider-factory.ts` | Active |
| Providers | Anthropic, OpenAI, vLLM, local Ollama, deterministic | Active |
| Hybrid router | `src/lib/core/ai/hybrid-router.ts` | Active |
| Circuit breaker | `src/lib/core/ai/providers/provider-circuit-breaker.ts` | Active |
| Budget manager | `src/lib/core/ai/budget-manager.ts` | Active |
| Spend tracker | `src/lib/core/ai/spend-tracker.ts` | Active |
| Observability | `src/lib/core/ai/observability.ts` | Active |
| Eval gate | `src/lib/core/ai/eval-gate.ts` | Active |
| Eval runner | `src/lib/ai/eval/eval-runner.ts` | Partial |
| RAG / embeddings | `src/lib/core/knowledge/rag/` | Active |
| Prompt registry | `src/lib/core/ai/prompt-registry.ts` | Active |
| Governance metrics | `src/lib/core/ai/governance-metrics.ts` | Active |
| Skill runtime | `src/lib/skill-runtime/` | Active |
| Agent memory | `src/lib/core/memory/` | Active |

**AI Mode configuration**: `AI_MODE` env var (cloud/local/hybrid). Local AI (Ollama) is wired but not production-confirmed. The `local-provider.ts` implementation exists but has no production deployment evidence.

**Finding**: The AI stack has solid foundations (circuit breaker, budget, observability, eval gate) but lacks golden datasets for regression testing, has no hard spend limits enforced, and the eval runner has suites but no evidence of regular execution.

---

## 6. Infrastructure

| Component | Implementation |
|---|---|
| Primary region | AWS me-south-1 (Bahrain) |
| DR region | AWS eu-central-1 (Frankfurt) |
| Compute | ECS Fargate (3 min / 10 max tasks, 1 vCPU / 2 GB) |
| Database | RDS PostgreSQL Multi-AZ, deletion protection, 30-day backup |
| Cache | ElastiCache Redis |
| Storage | S3 + CloudFront CDN |
| IaC | Terraform — modules: compute, database, networking, monitoring, storage |
| Environments | dev, staging, production (separate tfvars + backends) |
| Monitoring | CloudWatch + Sentry |
| Error tracking | Sentry (client, server, edge configs present) |
| Build | Docker multi-stage, Next.js standalone output |

---

## 7. CI/CD Pipeline

| Workflow | Trigger | Purpose |
|---|---|---|
| `deploy.yml` | Push to main/staging | Test → Terraform plan → Build+Push → ECS deploy |
| `ci.yml` | PR | Type check + lint + tests |
| `backup.yml` | Scheduled | Database backup automation |
| `preview.yml` | PR | Preview deployment |
| `promote.yml` | Manual | Promote staging → production |

**CI test gate**: `npx tsc --noEmit` + Jest (`--passWithNoTests --forceExit`). No lint gate in main deploy path (lint is CI only).

**Finding**: `--passWithNoTests` means new test files not discovered by Jest config will silently pass. `--forceExit` masks hanging test cleanup issues.

---

## 8. Test Coverage Assessment

| Category | Count | Notes |
|---|---|---|
| Unit tests | ~180 | Good coverage in audit, sales, platform, AI |
| Integration tests | ~40 | Require docker postgres; not in default CI |
| Component tests | ~10 | Sparse — mostly audit components |
| e2e (Cypress) | 11 | Cover main product flows |
| AI output quality tests | 0 | No golden dataset tests |
| Load / performance tests | 0 | No load testing |
| Security / DAST | 0 | No automated security scanning |

---

## 9. Migration Health

- 55 total migrations across product lifecycle
- **Finding**: 8 recent migrations use year **2027** in timestamps (e.g., `20270622100000_knowledge_foundation_versioning`). This is likely a typo in migration naming (should be 2026). Prisma orders migrations alphanumerically by timestamp — this means these migrations will always sort after any future 2026 migrations, potentially causing ordering confusion in collaborative development environments.

---

## 10. Feature Flag Inventory

All feature flags are `FF_` prefixed environment variables. No centralized flag service.

| Flag | Domain | Default |
|---|---|---|
| FF_AI_RAG | AI | off |
| FF_AI_REAL_PROVIDERS | AI | off |
| FF_ABAC_ENFORCE | Authorization | off |
| FF_ABAC_SHADOW | Authorization | off |
| FF_AUDIT_APPROVAL_GATES | AuditOS | configurable |
| FF_AUDIT_DISCLOSURE_AUTO | AuditOS | off |
| FF_AUDIT_FS_V2 | AuditOS | configurable |
| FF_AUDIT_IFRS_RULES | AuditOS | off |
| FF_AUDIT_INTELLIGENCE | AuditOS | off |
| FF_AUDIT_LEAD_SCHEDULE_AUTO | AuditOS | off |
| FF_AUDIT_MIND_MAP | AuditOS | off |
| FF_AUDIT_RECONCILIATION | AuditOS | off |
| FF_AUDIT_RECONCILIATION_GATES | AuditOS | off |
| FF_AUDIT_REPORTING_GRAPH | AuditOS | off |
| FF_AUDIT_SOCPA_RULES | AuditOS | off |
| FF_EVENT_OUTBOX | Events | off |
| FF_EVENT_SCHEMA_REGISTRY | Events | off |

**Finding**: 17+ feature flags with no audit trail, no expiry dates, no ownership mapping, and no centralized visibility. Flags are env-var strings — toggling them requires a deployment. This is a maintenance and governance risk.

---

## 11. Known Defects (at audit time)

| ID | Severity | Area | Description |
|---|---|---|---|
| D-001 | High | SalesOS | ~30 TypeScript errors — `SALES_OS` missing from product registry enum, form handler mismatches, missing module `@/components/platform/command-surface/metric-action-card` |
| D-002 | Medium | Migrations | 8 migrations with year 2027 timestamps (should be 2026) |
| D-003 | Medium | Routes | `/sunbul/*` has live page content; should be redirect-only per CLAUDE.md |
| D-004 | Medium | Routes | `/en/*` duplicates all marketing routes (21 folders) — adds maintenance surface |
| D-005 | Low | Taxonomy | RiskOS, ContentStudio, Institutional Memory, Sampling active but undocumented in CLAUDE.md taxonomy |

---

## 12. Production Domain

- Primary: `aqliya.com` (migrated from `aqliya.ai` 2026-06-09)
- Staging: `staging.aqliya.com`
- Vercel: Alternative deployment path available via `vercel.json`

---

*Report generated from live repository analysis — 2026-06-24. No documentation was used as a source of truth.*
