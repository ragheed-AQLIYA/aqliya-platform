# AQLIYA Full Repository Reality Audit

> **Status:** Evidence-based audit | **Date:** 2026-07-10 | **Method:** Code-first inspection  
> **Scope:** Entire repository — routes, schema, platform libs, CI/infra, tests, docs reconciliation  
> **Authority:** This document supersedes optimistic status rows where they conflict with verified code evidence.

---

## 1. Executive Verdict

**What AQLIYA is today:** A large, real **multi-product governed institutional intelligence monolith** built on Next.js 16, Prisma/PostgreSQL, and a partially converged Intelligence Core. It is **not** a marketing shell, **not** AuditOS-only, and **not** production-commercial-certified — but it **is** a substantive platform with multiple pilot-capable product workspaces, extensive schema (243 Prisma models), ~280 UI pages, 64 API routes, and ~381 test files.

**Honest maturity band:** **L4–L5 pilot-ready with conditions** for active products; **L1** for public demo surfaces; **L0** for strategic future claims (On-Prem, Air-Gapped, Model Governance registry as product).

**Safe external posture:**
| Claim | Safe? |
|-------|-------|
| Platform exists with governed multi-product architecture | Yes, with explanation |
| AuditOS guided demo at `/auditos` | Yes — clearly labeled demo |
| AuditOS / LocalContentOS / DecisionOS pilot | Yes — controlled pilot with known gaps |
| L6 production-hardened / commercial-ready | **No** — overstated in docs |
| On-Prem / Air-Gapped / full local AI | **No** — strategic only |

**Top 5 blockers before commercial production claims:**
1. Deploy pipeline not gated on CI pass (`deploy.yml` fires independently of `ci.yml`)
2. No external penetration test (documented CRITICAL blocker)
3. Production RDS tfvars show free-tier compromises (backup retention 0, Multi-AZ off)
4. Dual deployment models (`deploy.yml` eu-north-1 vs `promote.yml` me-south-1)
5. Authorization/tenant fragmentation (AuditOS parallel identity graph)

---

## 2. Repository Truth Summary

### 2.1 Scale (code evidence)

| Dimension | Count | Evidence |
|-----------|-------|----------|
| UI pages (`page.tsx`) | 280 | `src/app/**/page.tsx` |
| Layouts | 21 | `src/app/**/layout.tsx` |
| API route handlers | 64 | `src/app/api/**/route.ts` |
| Prisma models | 243 | `prisma/schema.prisma` |
| Migrations | 54 SQL files | `prisma/migrations/` |
| Server action modules | 92 | `src/actions/` |
| `src/lib` test files | ~281 | colocated `__tests__/` |
| Central tests | ~77 | `src/__tests__/` |
| Cypress E2E specs | 11 | `cypress/e2e/` |
| Route resilience files | 167 error / 170 loading / 140 not-found | verified by glob |

### 2.2 Repository topography

```
Aqliya/
├── src/app/          # Next.js App Router — 25 top-level route segments
├── src/lib/          # Domain + platform logic (31 top-level modules)
├── src/actions/      # Flat server-action namespace (product-prefixed)
├── src/components/   # UI by product/domain
├── prisma/           # Canonical schema + seeds
├── infra/terraform/  # AWS IaC (dev, prod, staging, stale production/)
├── .github/workflows/# CI, deploy, promote, backup, governance, preview
├── scripts/platform/ # Backup, restore-drill, smoke, env validation
├── docs/
│   ├── official/           # Doctrine (L2 authority)
│   ├── source-of-truth/    # Status, routes, architecture (L4)
│   ├── audits/             # Evidence reports (L6)
│   └── archive/            # Historical — not authoritative
└── cypress/          # E2E — not wired to CI
```

### 2.3 Product/system map (code-backed)

| System | Route family | Lib namespace | Schema namespace |
|--------|-------------|---------------|------------------|
| AQLIYA Platform | `/overview`, `/operator`, `/monitoring`, `/settings/*` | `src/lib/platform/`, `src/lib/core/` | Platform* models |
| AuditOS | `/audit/*`, `/auditos/*` (demo) | `src/lib/audit/` | Audit* models |
| LocalContentOS | `/local-content/*` | `src/lib/local-content/` | LocalContent*, Lc* |
| SalesOS | `/sales/*` | `src/lib/sales/`, `src/lib/salesos/` | Sales* |
| DecisionOS | `/decisions/*` | `src/lib/decision/` | Decision* |
| WorkflowOS | `/workflowos/*`, `/sunbul/*` (redirect) | `src/lib/workflowos/` | Workflow* |
| Office AI Assistant | `/assistant/*`, `/office-ai/*` | `src/lib/office-ai/` | OfficeAi* |
| LocalContactOS | `/contacts/*` | `src/lib/localcontactos/` | LocalContact* |
| ContentStudio | `/content-studio/*` | platform content-studio | Content* |
| RiskOS | `/risk/*` | audit-adjacent | AuditRisk* |
| Institutional Memory | `/institutional-memory/*` | core/memory | InstitutionalMemory* |
| Knowledge Foundation | `/knowledge-foundation/*` | `src/lib/knowledge-foundation/` | KnowledgeFoundation* |
| Marketing | `(marketing)/`, `/en/` | `src/lib/marketing/` | none |

### 2.4 Legacy / dead / superseded indicators

| Indicator | Path | Status |
|-----------|------|--------|
| Sales v02 intelligence layer | `src/lib/sales/v02/` (62 files) | Active imports from vnext/components — parallel architecture |
| Sales vnext | `src/lib/sales/vnext/` (39 files) | ESLint-ignored; consolidation planned |
| Dual Sales libs | `src/lib/sales/` + `src/lib/salesos/` | Overlapping patterns |
| Stale prod env | `infra/terraform/environments/production/` | Placeholder `<ACCOUNT_ID>` — do not use |
| Deprecated entry | `CLAUDE.md` | Points to AI_ENTRYPOINT (path drift) |
| Doc archive | `docs/archive/` (1000+ files) | Historical only |
| Dead middleware key | `routeMinRoles["/decision"]` | No `/decision/*` routes exist |
| Broken nav link | `/audit/settings` in audit-header | Route does not exist |

---

## 3. Route Reality Summary

### 3.1 Route truth principles

- **Middleware** (`src/middleware.ts`) covers ~70 path prefixes — routes outside matcher rely on layout/page/action guards only.
- **Demo vs workspace** is well-separated for AuditOS (`/auditos` mock vs `/audit` real).
- **Settings** is physically split across `src/app/settings/*` and `src/app/(dashboard)/settings/*` — same URL prefix, different layout ancestry.
- **Public marketing** at `/platform` must not be confused with operational hub at `/overview`.

### 3.2 Route Truth Table (major families)

| Route | Owner | Route Type | Auth? | Data Source | Real / Mock / Partial / Dead | Notes |
|-------|-------|------------|-------|-------------|------------------------------|-------|
| `/` | Platform | Marketing | Public | Static copy | Real (marketing) | `(marketing)/page.tsx` |
| `/platform` | Platform | Marketing | Public | Static copy | Real (marketing) | Not operational workspace |
| `/overview` | Platform | Governed workspace | Yes | Prisma/actions | Real | Actual platform hub |
| `/audit/*` | AuditOS | Governed workspace | Yes + tenant guard | Prisma/services | **Real** | 27 pages, engagement workflow |
| `/auditos/*` | AuditOS | Guided demo | Public | `demo-data.ts` | **Mock** | Isolated from audit lib |
| `/local-content/*` | LocalContentOS | Governed workspace | Yes | Server actions/Prisma | **Real** | 29 pages |
| `/sales/*` | SalesOS | Governed workspace | Yes | Prisma/actions | **Real** | Pilot UI badge in layout |
| `/decisions/*` | DecisionOS | Governed workspace | Yes | Actions/engine | **Real** | 22 pages under dashboard |
| `/workflowos/*` | WorkflowOS | Governed workspace | Yes | Actions | **Real** | 8 pages |
| `/assistant/*` | Office AI | Governed workspace | Yes | Prisma/actions | **Real** | Split from `/office-ai/advanced` |
| `/office-ai/*` | Office AI | Admin surface | Yes | Actions | **Real** | Advanced config |
| `/contacts/*` | LocalContactOS | Governed workspace | Yes | Actions/Prisma | **Real** | 7 pages |
| `/content-studio/*` | ContentStudio | Governed workspace | Yes | Actions/Prisma | **Real** | 6 pages |
| `/risk/*` | RiskOS | Governed workspace | Yes | Actions | **Real** | Audit-adjacent, 4 pages |
| `/institutional-memory/*` | Platform | Governed workspace | **Partial** | Actions | **Real data, weak edge auth** | Not in middleware matcher |
| `/settings/*` | Platform | Admin/settings | Yes | Mixed | **Partial** | Index page is L2 shell; sub-routes real |
| `/organizations/*` | Platform | Admin workspace | Admin | Prisma | **Real** | Doc line 95 "mock-only" is **stale** |
| `/knowledge-foundation/*` | Platform | Governed workspace | Yes | KF lib | **Real** | Release governance pipeline |
| `/intelligence`, `/monitoring`, `/operator` | Platform | Operator | Yes | Platform APIs | **Real** | Admin for monitoring/operator |
| `/api/health` | Platform | API | Public | Prisma ping | **Real** | |
| `/api/*` (product families) | Various | API | Per-route RBAC | Prisma/actions | **Real** | 64 handlers |

Full matrix: see `AQLIYA_PRODUCT_MATURITY_MATRIX.md`.

---

## 4. Product Maturity Assessment

Evidence-based levels (not doc claims):

| Product | Doc claim | Code verdict | Rationale |
|---------|-----------|--------------|-----------|
| **AuditOS workspace** | L6 | **L5 pilot-ready** | Deepest workflow: TB, mapping, FS, evidence, findings, review, approval, export, 8 L6 engines in code. Separate tenant graph. Not pentest-certified. |
| **AuditOS demo** | L1 | **L1 marketing/demo** | Confirmed mock isolation |
| **LocalContentOS** | L6 | **L5 pilot-ready** | 29 routes, scoring, workbook AI, review center, ERP connectors (operator setup). Strong test count. |
| **DecisionOS** | L6 | **L5 pilot-ready** | Full lifecycle, evidence, PDF export, 22 routes. Action tests exist. |
| **SalesOS** | L6 | **L4–L5** | Real Prisma CRUD + pilot layout notice. v02/vnext debt, ESLint ignores, dual lib patterns. |
| **WorkflowOS** | L6 | **L4–L5** | Templates, records, SLA, gated export. 31 action tests claimed. |
| **Office AI Assistant** | L6 | **L4–L5** | Real task lifecycle, review gates. Route split `/assistant` vs `/office-ai`. |
| **LocalContactOS** | L6 | **L4** | Real CRUD; "integration tests" mock Prisma |
| **ContentStudio** | L6 | **L4–L5** | Standalone content workspace, PDF export, evidence |
| **RiskOS** | L6 | **L4–L5** | Dashboard, assessments, export — not standalone marketed product |
| **Institutional Memory** | L6 | **L4** | Graph/events real; middleware gap on routes |
| **Knowledge Foundation** | L6 | **L5** | Strong test suite (87 claimed), release pipeline |
| **SSO/SCIM** | L6 | **L4–L5** | Real implementation; operator key setup required |
| **Platform operator** | L6 | **L4** | Health, monitoring, outbox APIs — diagnostic tier |
| **Marketing site** | L1 | **L1** | Static bilingual marketing |
| **On-Prem / Air-Gapped / Local AI prod** | L0/L4 | **L0–L3** | Ollama path exists; flags default off; not hardened |

---

## 5. Platform Capability Assessment

Summary — full detail in `AQLIYA_PLATFORM_CAPABILITY_ASSESSMENT.md`.

| Capability | Reality | Trust to build on? |
|------------|---------|-------------------|
| Auth (NextAuth v5, MFA, SAML, SCIM) | Real | Yes — with coarse roles caveat |
| RBAC | Partial — dual stack | Caution — shadow engine not primary |
| Tenant isolation | Real, fragmented | Caution — AuditOS parallel tenant |
| Audit logging | Real, dual-write | Medium — product tables + PlatformAuditLog |
| Evidence/storage | Partial | Caution — 3 storage paths, S3 not default factory |
| Workflow/approval | Per-product | Medium — no unified DB engine |
| AI orchestration | Real, flag-gated | Yes for assistive — defaults deterministic |
| Export | Per-product | Medium — no central governed service |
| Monitoring | Diagnostic | Medium — not full APM |
| Notifications/jobs | Partial | Low without `queue.enabled` + Redis |
| Feature flags | Static registry | Medium — env overrides only |
| Rate limiting | Real | Caution — memory default in multi-instance |

**Intelligence Core** (`src/lib/core/index.ts`): Intended convergence layer — workflow adapters, evidence graph, AI orchestrator, outbox, governance engine. **Adoption is partial**; products still use legacy paths heavily.

---

## 6. Data / Prisma Assessment

### 6.1 Platform vs product separation

**Platform bridge:** `PlatformOrganization` links `Organization`, `AuditOrganization`, workspaces.

**Major architectural debt:** AuditOS uses **`AuditOrganization` / `AuditUser`** parallel to platform **`Organization` / `User`**. Tenant isolation and RBAC must be implemented twice.

**Evidence migration:** `CoreEvidence` mirrors product evidence; product tables remain canonical.

### 6.2 Tenant isolation field coverage

| Pattern | Products using | Consistency |
|---------|----------------|-------------|
| `organizationId` → `Organization` | DecisionOS, LocalContentOS, SalesOS, RiskOS | Consistent within cluster |
| `platformOrganizationId` | PlatformOrganization bridge | Used on AuditOrganization, SunbulClient |
| Audit-scoped IDs | AuditOS | Separate graph |

### 6.3 Audit / lineage fields

`createdById` pass completed on 10+ models per AGENTS.md. Product-specific `*AuditEvent` tables coexist with `PlatformAuditLog` — unified ledger incomplete.

### 6.4 Schema maturity blockers for L6

- Dual tenant identity graphs
- 243 models with cross-product IntelligenceGraph linkage — high coupling surface
- Sales schema served by `@ts-nocheck` repository in places (documented R-04)
- No single soft-delete convention across products

---

## 7. Governance / Authorization Assessment

### 7.1 Authorization fragmentation

**Three enforcement paths observed:**
1. Edge middleware `routeMinRoles` + JWT (`src/middleware.ts`)
2. `getCurrentUser()` / `requireUserContext()` — **dominant** (~200+ call sites)
3. New RB-02 engine (`src/lib/authorization/engine/`) — **shadow mode only** via `FEATURE_AUTHZ_SHADOW`

**Two role vocabularies:** `ADMIN/OPERATOR/VIEWER` vs lowercase in download gate.

### 7.2 Governance integrity

| Control | Status | Evidence |
|---------|--------|----------|
| Server-side RBAC on mutations | Mostly yes | Action guards, product guards |
| Tenant scoping on reads | Mostly yes | Gaps: ADMIN cross-tenant in tenant-guard |
| Audit trail on mutations | Yes per product | Fragmented tables |
| Human review on AI outputs | Product-varying | Office AI, LC review — enforced; others vary |
| Export approval gates | Product-specific | WorkflowOS, AuditOS — real; not platform-unified |
| Demo route isolation | Good for `/auditos` | No real customer data |
| Maker-checker / SoD | Partial | `SeparationOfDutyRule` model exists; under-adopted |

### 7.3 Top 10 governance risks

1. AuditOS parallel tenant bypasses platform org model
2. RB-02 authorization engine not primary enforcement
3. `/institutional-memory/*` missing middleware — page shell reachable unauthenticated
4. ADMIN role cross-tenant access in `tenant-guard.ts`
5. Dual audit event tables — incomplete unified lineage
6. AI defaults to deterministic — risk of claiming "AI-powered" without flags
7. Settings index page misrepresents operational status (L2 shell at `/settings`)
8. Command palette hardcoded engagement IDs may 404
9. Download gates exist but export paths distributed — inconsistent approval
10. SCIM/API key auth — real but needs operational key rotation discipline

---

## 8. AI / Intelligence Assessment

### 8.1 Provider reality

| Provider | Status | Evidence |
|----------|--------|----------|
| Deterministic/mock | **Default** | `ai.real-providers` variant `off` in registry |
| Anthropic/OpenAI | Wired behind flag | `src/lib/core/ai/providers/` |
| Ollama/local | Exists | `LocalAIProvider`; operator endpoint required |
| RAG/pgvector | Off by default | `ai.rag` variant `off` |

### 8.2 Governance reality

**Present:** `governed-ai-executor.ts`, cost tracking (on), review gates, `AiModelRegistry`, platform audit on AI actions, confidence metadata patterns in LC.

**Gaps:** Budget quotas off; RAG off; duplicate `lib/ai` vs `core/ai`; human review enforcement varies by product.

### 8.3 Product AI usage

| Product | AI invoked? | Authoritative? |
|---------|-------------|----------------|
| LocalContentOS | Yes — workbook, advisor, classification | Assistive + review |
| AuditOS | Yes — AI review, intelligence (flagged) | Human review required |
| Office AI | Yes — task generation | Review/approve workflow |
| SalesOS | Partial — commercial review runtime | Assistive |
| DecisionOS | Partial — recommendations | Draft only |

### 8.4 Verdicts

| Dimension | Level | Risk |
|-----------|-------|------|
| AI platform maturity | **L4** — orchestrator real, defaults safe | Medium |
| AI governance maturity | **L4** — metadata/review patterns exist | Medium |
| AI production risk | **Low-Medium** when flags off (deterministic); **Medium-High** when real providers on without pentest | |

**Local AI:** Implemented path exists (Ollama REST + hybrid router). **Not production-hardened.** Do not claim air-gapped or local inference as shipped capability.

---

## 9. Infra / Production Readiness Assessment

### 9.1 What is real

- **CI** (`ci.yml`): tsc, lint, build, jest, migrate deploy, npm audit
- **Deploy** (`deploy.yml`): ECR + ECS on push to `main` → `app.aqliya.com`
- **Terraform**: multi-module AWS (networking, RDS, ECS, CloudFront, WAF, monitoring)
- **Docker**: Node 22 multi-stage; compose with Redis, ClamAV, pgvector
- **Backup workflow** (`backup.yml`): scheduled
- **Launch evidence**: `docs/deployments/prod-launch-evidence-2026-07-09_*.txt`

### 9.2 What is overstated or incomplete

| Claim | Reality |
|-------|---------|
| L6 production-hardened | Prod tfvars: `db_backup_retention_days = 0`, Multi-AZ false, micro instance |
| CI/CD complete | Deploy **not gated** on CI pass |
| Integration tests in CI | Postgres test compose exists; **not in CI**; most "integration" tests mock Prisma |
| Cypress E2E in pipeline | **Not wired** |
| ClamAV in production | IaC + code exist; runtime verification not confirmed this audit |
| Pentest complete | **Open** — CRITICAL blocker |
| Live RDS restore drill | Script exists; live drill not proven |

### 9.3 Production Blocker Table

| Blocker | Severity | Affected | Evidence | Fix |
|---------|----------|----------|----------|-----|
| Deploy not CI-gated | Critical | Platform | `deploy.yml` + `ci.yml` both on main push | Add `workflow_run` dependency |
| No penetration test | Critical | All | Blockers register B-01 | Schedule external pentest |
| Prod RDS free-tier tfvars | High | Platform | `environments/prod/terraform.tfvars` | Account upgrade + apply |
| Dual deploy paths | High | Platform | deploy vs promote regions/domains | Consolidate single prod path |
| Mock integration tests | High | QA trust | `jest.config.js` global Prisma mock | Wire real Postgres CI job |
| backup:verify non-blocking | Medium | Data integrity | `ci.yml` continue-on-error | Make blocking |
| E2E not in CI | Medium | Regression | Cypress present, no workflow | Add smoke E2E job |
| Doc L6 inflation | Medium | Commercial truth | PRODUCT_STATUS vs READINESS_GATES | Sync docs to this audit |
| Rate limiter memory default | Medium | Multi-instance | `.env.example`, compose vs prod | Set Redis in ECS task def |
| Stale production/ env | Medium | Ops mistake risk | placeholder tfvars | Archive or delete |

### 9.4 Launch verdicts

| Verdict | Status |
|---------|--------|
| **Internal development** | GO |
| **Controlled pilot (AuditOS, LCOS, DecisionOS)** | **GO with conditions** — pentest plan, pilot runbook, no L6 marketing |
| **Commercial production** | **NO-GO** until P-01–P-05 closed |
| **Public demo (`/auditos`, marketing)** | GO — honest labeling |

---

## 10. Test & Verification Assessment

### 10.1 Coverage by area (test files, approximate)

| Area | Files | Trust level |
|------|-------|-------------|
| AuditOS | 41 | High unit coverage |
| SalesOS | 71 | High — includes v02/vnext |
| Platform/Core | 40+ | Medium-high |
| LocalContentOS | 23 | High |
| Knowledge Foundation | 16 | High |
| DecisionOS | 6+ actions | Medium |
| WorkflowOS | 2–4 | Thin vs route count |
| LocalContactOS | 2 | **Low** — mocked integration |
| E2E Cypress | 11 specs | **Not automated in CI** |

### 10.2 Critical gaps

- No true Postgres integration gate in CI
- Global `@prisma/client` mock masks DB integration failures
- E2E not in pipeline
- Cross-tenant isolation test exists but not production-proof alone
- Products with thin action-layer tests relative to route surface (WorkflowOS, contacts)

**Trust label for "3924 tests pass":** Structurally credible from CI history; **does not prove** production DB flows or browser regressions.

---

## 11. Documentation Truth Assessment

### 11.1 Documentation authority map

| Trust for planning | Path | Role |
|--------------------|------|------|
| **Highest — conflict rules** | `docs/DOCUMENTATION_AUTHORITY.md` | Hierarchy |
| **Doctrine** | `docs/official/*` | Identity, governance principles |
| **Implementation status — verify in code** | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | **Inflated L6 rows** |
| **More honest ops status** | `docs/source-of-truth/READINESS_GATES.md` | Open blockers |
| **Routes** | `docs/source-of-truth/ROUTE_STRATEGY.md` | Mostly aligned; L5/L6 drift on AuditOS |
| **This audit suite** | `docs/audits/AQLIYA_*` | Code-reconciled evidence |
| **Historical** | `docs/archive/*` | Do not plan from |

### 11.2 Code-vs-doc divergence (verified samples)

| Doc claim | Code reality | Verdict |
|-----------|--------------|---------|
| Organizations mock-only (matrix line 95) | `organizations/page.tsx` uses `prisma.organization.findMany` | **STALE DOC** |
| All products L6 (matrix rows) | Pentest open, prod tfvars weak, CI deploy ungated | **OVERSTATED** |
| AuditOS L6 vs ROUTE_STRATEGY L5 | Both active | **INTERNAL CONFLICT** |
| LocalContact 15 integration tests | `localcontactos-crud.test.ts` mocks Prisma | **OVERSTATED** |
| CI/CD "planned" (READINESS_GATES) | `deploy.yml` exists | **STALE** |
| ClamAV "not integrated" (validate-env comment) | Scanner + Terraform sidecar exist | **STALE COMMENT** |

### 11.3 Documents to trust for planning **right now**

1. This audit suite (`docs/audits/AQLIYA_FULL_REALITY_AUDIT.md` + siblings)
2. `docs/DOCUMENTATION_AUTHORITY.md`
3. `docs/source-of-truth/READINESS_GATES.md` (with deploy correction)
4. `docs/audits/AQLIYA_PRODUCTION_BLOCKERS_REGISTER.md`
5. `docs/official/AQLIYA_MASTER_REFERENCE.md` for identity — **not** for L6 status
6. Code: `src/app/`, `prisma/schema.prisma`, `src/middleware.ts`

---

## 12. Top 20 Critical Findings

| # | Finding | Category | Severity |
|---|---------|----------|----------|
| 1 | Repository is a real multi-product platform, not a demo repo | Reality | Info |
| 2 | L6 claims in PRODUCT_STATUS_MATRIX overshoot verified production evidence | Doc truth | High |
| 3 | Deploy runs on every main push without CI gate | Production | Critical |
| 4 | No external penetration test | Security | Critical |
| 5 | AuditOS uses parallel tenant identity graph | Architecture | High |
| 6 | Authorization engine in shadow mode only | Governance | High |
| 7 | `/auditos` correctly isolated as mock demo | Demo safety | Positive |
| 8 | AuditOS workspace is deepest real product (L5) | Product | Info |
| 9 | LocalContentOS is second-strongest pilot product | Product | Info |
| 10 | SalesOS has v02/vnext parallel architecture debt | Architecture | High |
| 11 | AI defaults to deterministic (`ai.real-providers` off) | AI | Medium |
| 12 | Settings routes split across two app folder trees | UX/Arch | Medium |
| 13 | Institutional memory routes lack middleware coverage | Security | Medium |
| 14 | Prod RDS tfvars show backup retention 0 | Infra | High |
| 15 | Integration tests mock Prisma — not true DB CI | Testing | High |
| 16 | Cypress E2E exists but not in CI | Testing | Medium |
| 17 | Dual deployment workflows (deploy vs promote) | Infra | High |
| 18 | Organizations page is Prisma-backed — doc says mock | Doc truth | Medium |
| 19 | Intelligence Core exists but partial product adoption | Platform | Medium |
| 20 | 167 error boundaries — genuine resilience investment | Platform | Positive |

---

## 13. What Is Real Today

**Platform kernel (real):**
- NextAuth v5 auth with MFA, SAML, SCIM v2
- Prisma/PostgreSQL multi-tenant data plane (243 models)
- Middleware RBAC first gate + server-side guards
- Platform audit log writer, download gate, rate limiter
- Intelligence Core facades (AI orchestrator, workflow adapters, evidence graph, outbox)
- Feature flag registry, enterprise health snapshot
- Terraform + ECS deploy path with launch evidence files
- Arabic-first marketing + authenticated product workspaces

**Products with real governed workflows:**
- AuditOS engagement lifecycle (TB → mapping → FS → findings → review → approval → export)
- LocalContentOS project/scoring/review/workbook/ERP integration surfaces
- DecisionOS full decision lifecycle with evidence and PDF export
- SalesOS Prisma-backed pipeline/deals/accounts with audit events
- WorkflowOS templates, records, SLA, gated PDF export
- Office AI task lifecycle with human review
- ContentStudio content lifecycle with versioning and evidence
- Knowledge Foundation release governance pipeline

**Operational surfaces:**
- `/monitoring`, `/operator`, platform retention/health APIs
- Backup scripts and scheduled GitHub backup workflow

---

## 14. What Is Misleading / Inflated / Unsafe to Claim

**Do not claim as implemented/production:**
- L6 production-hardened for all products (docs inflated)
- Commercial-ready without pentest + CI-gated deploy + prod RDS hardening
- On-Prem package, Air-Gapped mode, Kubernetes deployment
- Full local AI runtime as production capability
- Unified platform RBAC (dual stacks remain)
- Single tenant model (AuditOS parallel graph)
- "Integration tests prove DB flows" (global Prisma mock)
- Model Governance as live product (registry models exist; not full product)
- AQLIYA Studio builder

**Unsafe demo practices to avoid:**
- Showing `/audit/*` with `/auditos` data expectations
- Claiming AI is live when `ai.real-providers` is off
- Marketing "production HA" while tfvars show backup retention 0

---

## 15. Recommended Next Execution Order

See `AQLIYA_EXECUTION_PRIORITY_PLAN.md` for full program. Summary:

1. **Freeze commercial L6 claims** — sync PRODUCT_STATUS to L4–L5 reality
2. **CI/deploy gate** — block deploy on CI pass
3. **Prod infra hardening** — RDS Multi-AZ, backup retention, deletion protection
4. **Pentest scheduling** — external, scoped
5. **Authorization convergence** — promote RB-02 engine; retire ad-hoc patterns
6. **AuditOS tenant reconciliation plan** — long-horizon; document bridge rules now
7. **Sales v02/vnext consolidation** — stop parallel growth
8. **True Postgres integration CI job**
9. **Middleware gap fixes** — institutional-memory, settings unification
10. **Pilot program** — AuditOS + LocalContentOS with runbook, not commercial launch

---

## 16. Final Launch / Pilot / Internal-Only Status Verdict

| Surface | Verdict | Conditions |
|---------|---------|------------|
| Engineering / internal dev | **GO** | Standard local compose |
| Marketing + `/auditos` demo | **GO** | Demo labeling only |
| AuditOS pilot | **GO** | Pilot agreement, seeded org, no L6 claims |
| LocalContentOS pilot | **GO** | ERP creds operator-managed |
| DecisionOS pilot | **GO** | Internal/committee use |
| SalesOS pilot | **GO with caution** | Mark as pilot; v02 debt |
| WorkflowOS / Office AI / Contacts | **Internal pilot** | Thinner test coverage |
| Commercial production launch | **NO-GO** | Blockers table |
| Enterprise sales "production-certified" | **NO-GO** | Pentest, HA RDS, CI gate |

---

## Appendix A — Product Maturity Matrix

See dedicated file: `AQLIYA_PRODUCT_MATURITY_MATRIX.md`

## Appendix B — Platform Capability Table

See dedicated file: `AQLIYA_PLATFORM_CAPABILITY_ASSESSMENT.md`

## Appendix C — Architecture Risk Table

See dedicated file: `AQLIYA_ARCHITECTURE_RISKS_AND_GAPS.md`

---

**Audit method:** Read-only code inspection, subagent reconnaissance, targeted file verification. No `npm run build`, `npm test`, or live prod URL probes in this session.

**Completion status:** DONE — evidence-based audit deliverable complete.
