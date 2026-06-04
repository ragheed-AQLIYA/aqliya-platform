# AQLIYA Enterprise Completion Roadmap

> **⚠ SUPERSEDED — 2026-06-03**
> This document is superseded by `docs/official/AQLIYA_ROADMAP_v1.2.md` and its supporting matrices in `docs/source-of-truth/`:
> - `ROADMAP_CONFLICT_MATRIX.md` — Conflict resolutions
> - `CURRENT_REALITY_MATRIX.md` — Current maturity by component
> - `PRODUCT_STATUS_AUTHORITY_MATRIX.md` — Product status classifications
> - `L6_COMPLETION_PROGRAM.md` — Gap analysis per layer
> - `EXECUTION_DEPENDENCY_GRAPH.md` — Dependency graph and critical path
>
> Retained in-source for historical reference. Do not use as authority for planning or status decisions.

**Type:** Company + Product delivery roadmap (now superseded)
**Method:** Code reality first, documentation second. No capability is graded above what the repository proves.
**Author basis:** Direct audit of `prisma/schema.prisma` (95 models, 18 enums), `src/app/*` routes, `src/lib/{ai,auth,governance,audit,platform}`, `.github/workflows/ci.yml`, `Dockerfile`, and the source-of-truth matrices.
**Date:** 2026-06-03 (superseded same date)
**Trust principle:** AI assists. Humans decide. Evidence governs.

> Scoring scale used throughout: **0–100 readiness**, anchored to the repo's L0–L6 maturity ladder.
> L0 concept · L1 marketing · L2 shell · L3 prototype · L4 usable v0.1 · L5 pilot-ready · L6 production-certified.
> No product in this repo is at L6. Treat every "production" claim as a target, not a current state.

---

## Executive Verdict (read this first)

AQLIYA is a **real, multi-product, governed Next.js + Prisma platform** — not a demo collection. It has 95 Prisma models, working auth (NextAuth v5 + MFA), per-product tenant guards, audit-event logging, a genuine AI orchestration layer with real OpenAI/Anthropic providers, and bilingual (Arabic-first) export pipelines. That is materially ahead of most pre-seed "AI platforms."

But it is **pilot-ready, not commercial-ready**. The gap to a sellable enterprise product is concentrated in four places, in priority order:

1. **One product to GA, not six to L4.** AuditOS is the only product near pilot-grade. Breadth is the enemy.
2. **Enterprise identity and operations.** No SAML/LDAP/SCIM, no DR, no external pentest, no IaC. (Backup scripts exist and are production-grade; scheduled automation and tested restore drill remain.)
3. **AI productionization.** Providers are real but there is no eval framework, no cost controls, no AI observability, no RAG (governance context is static maps).
4. **Commercial machinery.** Strong pilot pack exists; pricing, licensing, contracts, and a repeatable onboarding/support motion do not.

The fastest path to revenue is **AuditOS pilot → paid pilot → first reference customer**, deferring everything that does not serve that line.

---

## AQLIYA Production Program

**The official production build order.** This replaces the earlier "8 Stage gates" model with a layered architecture. Each layer builds on the prior. No layer skips ahead without the layer below being production-stable.

### Architecture overview

| Layer | Name | Dependency | Build phase | Current status |
| --- | --- | --- | --- | --- |
| L0 | Platform Foundation | None — start here | Foundation | L4 (usable) |
| L0.5 | AQLIYA Intelligence Core | L0 | Shared intelligence | L4 (usable) |
| L1 | AuditOS | L0 + L0.5 | First product to GA | L5 (pilot-ready) |
| L2 | LocalContentOS | L0 + L0.5 | Second product, KSA-strategic | L5 (conditional) |
| L3 | DecisionOS | L0 + L0.5 | Decision governance | L4 → L5 |
| L4 | WorkflowOS | L0 + L0.5 | Workflow engine | L4 |
| L5 | Office AI | L0 + L0.5 + L0.5 AI | Shared governed assistant | L4 |
| L6 | Organizations | L0 (tenant lifecycle) | Org management | L3 (prototype) |
| L7 | SalesOS | L0 + L0.5 | Revenue intelligence | L3 → L4 |
| L8 | Enterprise Hardening | All products stable | SSO, SCIM, DR, HA, pentest | L0 (not started) |
| L9 | Compliance Certification | L8 | SOC2, ISO, NCA, PDPL | L0 (not started) |
| L10 | Air-Gapped / Local AI | L0–L9 | On-prem, local runtime | L0 (not started) |

### Layer definitions

#### Layer 0 — Platform Foundation
**Scope:** Auth (NextAuth v5 + MFA + RBAC), tenant isolation (middleware + per-product guards), middleware (route protection, security headers, rate limiting in-memory), audit event system (`PlatformAuditEvent` + per-product audit), file storage abstraction (local provider), Prisma schema foundation (User, Organization, PlatformOrganization, PlatformAuditEvent), CI/CD (GitHub Actions), Docker, backup/restore scripts (production-grade), Sentry monitoring.
**Key gap:** No staging environment, no IaC, no scheduled backup automation (scripts exist). Rate limiter is in-memory (Redis class stubbed).
**Decision:** Tenant Lifecycle (org CRUD, provisioning, billing) lives here as a platform capability, not in a product layer.

#### Layer 0.5 — AQLIYA Intelligence Core
**Scope:** AI orchestrator with provider abstraction (Anthropic/OpenAI HTTP providers, deterministic default, Cloud/Local stubs), governance context injection (`governed-ai-executor.ts`), prompt registry + framework builders, human-review-by-design (`AISuggestionPanel`, `AIBadge`, `GovernanceContextPanel`), token usage tracking in audit logs, evidence linkage API, deterministic handler library (5 rule-based handlers).
**Key gap:** No RAG engine (static governance maps only — **RAG is a shared capability, not a product feature**), no eval framework, no cost controls/budgeting, no AI observability dashboard, `onGenerate` callback not activated, real LLM providers stubbed (opt-in via env; not wired).
**Decision:** RAG, vector storage, and embeddings are shared Intelligence Core capabilities, owned here — they serve all products equally. Do not duplicate per product.

#### Layer 1 — AuditOS (First Product to GA)
**Scope:** Full 15-tab workflow (overview, trial balance, mapping, validation, statements, notes, evidence, findings, recommendations, review, approval, publication, exports, audit trail, pilot), 23 Prisma models, 50+ server actions with RBAC + tenant guard + audit trail, PDF/XLSX bilingual exports, 2495-line comprehensive seed data, dashboard with real KPI cards + AI insight panel.
**Key gap:** 6 of 15 tabs lack dedicated loading/error boundaries (P2), AI service partially mock-backed behind env flag, in-memory rate limiting (fine for single-instance pilot), no dedicated integration test suite.

#### Layer 2 — LocalContentOS (Second Product, KSA-Strategic)
**Scope:** Organization/project setup, local content baseline, supplier/vendor records, spend/procurement, classification workflow, evidence upload, scoring engine, gap/risk findings, review/approval, reports/exports, audit trail, Saudi-market terminology, bilingual UX, seed dataset.
**Key gap:** Supplier scoring depth, tender matching automation, multi-reviewer approval routing, ERP/procurement integration, Arabic PDF font fidelity.

#### Layer 3 — DecisionOS (Decision Governance)
**Scope:** Decision requests, context collection, options, risks, evidence, recommendation draft (AI-assisted), committee/reviewer workflow, voting/approval, final decision record, audit trail, export/memo, seed decisions.
**Status update from code reality:** Closer to L5 than the earlier L4 label. 9 real models, review/approval gates implemented, evidence model (`DecisionEvidence`), monitoring signals, risk alerts, pattern detection, reports. The publish→approve→export gate is operational. Outcome-tracking dashboard remains the main gap.

#### Layer 4 — WorkflowOS (Workflow Engine)
**Scope:** Process builder, configurable workflow templates, SLA timers, cross-client template sharing, throughput/SLA dashboard, webhook/external triggers.
**Decision:** The Workflow Engine (runtime) is separated from any specific WorkflowOS product. The engine is a shared platform capability; the product is the admin/configuration surface. This separation prevents over-investment in a product shell.

#### Layer 5 — Office AI (Governed Shared Assistant)
**Scope:** Assistant workspace, task categories, document-aware responses (where implemented), action logs, user review, no autonomous final action, evidence/source references, prompt/action registry, permission checks, audit events, clear limitations.
**Note:** Application on the Intelligence Core, not a standalone product. Keep as shared utility — avoid expanding into a full product before L1–L3 earn revenue.

#### Layer 6 — Organizations (Tenant Lifecycle Management)
**Scope:** Org CRUD lifecycle, admin console, billing/metering integration, user provisioning, platform admin shell, plan/quota configuration.
**Current reality:** UI surface is L3 prototype with hardcoded `mockOrganizations` constant and amber warning banner ("هذه الصفحة نموذج أولي داخلي"). The database `Organization` model is fully real with cross-product relations. The amber banner already protects against demo exposure — no urgent action needed. Build when multi-tenant onboarding is required.

#### Layer 7 — SalesOS (Revenue Intelligence)
**Scope:** Accounts, contacts, opportunities, deals, sales memory, interaction logs, qualification, pipeline dashboard, governance/review for sensitive claims, evidence-backed proposals, exports/account briefs, seed data.
**Current reality:** L3 trending L4 with substantial backend — 26+ route pages, 11 real Prisma models, 40+ server actions, RBAC, audit trail, evidence links, review/approval models, PDF exports, 40+ test files. Intelligence tabs are partially stubbed. The PRODUCT_STATUS_MATRIX lists L4; the homepage transparency section correctly shows L3. **Freeze as internal tool.** Do not invest further until L1–L3 generate revenue.

#### Layer 8 — Enterprise Hardening
**Scope:** SAML/OIDC SSO, SCIM provisioning, audit-log export/SIEM feed, data retention + deletion automation, DR/HA architecture, external penetration test.
**Key gap:** All at L0 (not started). Contract-gated — do not build speculatively. External pentest is the exception: schedule before first enterprise (non-pilot) contract per `READINESS_GATES.md`.

#### Layer 9 — Compliance Certification
**Scope:** SOC2 Type I → Type II, ISO 27001 control mapping → certification, NCA ECC self-assessment, PDPL compliance, Saudi data residency, DPA.
**Key gap:** All at L0. Contract-gated. Do not start certification without a funded compliance program.

#### Layer 10 — Air-Gapped / Local AI
**Scope:** On-prem packaging, local AI runtime (Ollama/vLLM), offline licensing, zero egress validation, sealed update channel, local model eval parity.
**Key gap:** All at L0. Contract-gated. The Local AI provider in code throws by design. No speculative investment.

### Layer sequencing rules
1. **Build order is strict:** No layer starts production work until its dependency (the layer below) is stable.
2. **L0 and L0.5 are shared foundations** — invest here continuously. Every product benefits.
3. **L1–L3 are the 2026 product set.** AuditOS (L1) first paid customer → LocalContentOS (L2) pilot → DecisionOS (L3) gates completion.
4. **L4–L7 are frozen or internal-only until L1–L3 earn revenue.** No new feature work on SalesOS, Organizations, or Office AI beyond bug fixes and security patches.
5. **L8–L10 are contract-gated.** No speculative investment. No marketing claim of readiness.
6. **RAG and vector capabilities** live in L0.5 (Intelligence Core), not in any product layer. Build when L1 demands it; do not duplicate across products.

---

## Phase 1 — Current State Assessment

### Current State Matrix

| Dimension | Score /100 | Evidence (code reality) | Verdict |
| --- | --- | --- | --- |
| **Product maturity** | 58 | AuditOS L5; LocalContentOS L5-cond; DecisionOS L4→L5 (closer to L5 on gates); WorkflowOS L4; Office AI L4; Platform L4; SalesOS L3→L4 (26+ routes, 11 models — real but frozen); Organizations L3 (amber-bannered prototype) | Strong breadth, shallow depth. One product near pilot, rest usable-but-thin. Production Program layers now enforce build order. |
| **Architecture maturity** | 65 | Next.js App Router, Prisma/Postgres, 95 models, clean `src/lib` domain split, governance core, shared platform audit layer | Solid monolith. Coherent, documented, not yet horizontally scaled |
| **Security maturity** | 50 | NextAuth v5 JWT, OAuth invite-only (Google/GitHub), MFA (TOTP+backup), middleware route-gating, HSTS/security headers, per-product tenant guards, audit events, `npm audit` in CI | Good app-sec baseline. No SAML/LDAP/SCIM, no pentest, no SIEM |
| **AI maturity** | 45 | Real orchestrator, OpenAI/Anthropic providers (opt-in), deterministic default handlers, governance context injection, human-review-by-design | Governance-first and honest. No RAG, no evals, no cost/observability controls |
| **Operational maturity** | 40 | CI (tsc/lint/test/build/db-push/audit), Dockerfile (standalone, non-root, healthcheck), Sentry, `/api/health` + `/api/metrics`, production-grade backup/restore/verify scripts (safety gates), middleware fully implemented | CI is real. Backup scripts production-grade. No IaC, no scheduled backup automation, no DR/HA, no staging |
| **Documentation maturity** | 80 | Source-of-truth matrices, official taxonomy/vision, commercial-pack, deployment & ops runbooks, governance examples | Best-in-class for stage. Risk is drift; needs a single authority enforced |
| **Commercial maturity** | 40 | Commercial-pack (pilot one-pager, scope, onboarding, success criteria, conversion plan, risk disclosure, exec deck), live custom-product funnel | Pilot motion exists. No pricing, licensing, contracts, ROI tooling, or repeatable CS |

**Overall current readiness: ~52/100 — "Pilot-ready candidate for one product."**

### Hard evidence anchors

- **Real:** 95 Prisma models incl. ~24 `Audit*`, 11 `Sales*`, 9 `LocalContent*`/`ContentStudio*`, 9 `Decision*`; tenant guards (`src/lib/audit/tenant-guard.ts`, `src/lib/workflowos/tenant-guard.ts`); MFA in `auth-config.ts` + `/api/auth/mfa/verify`; AI orchestrator + real Anthropic/OpenAI HTTP providers.
- **Stub / not implemented (do not sell):** Local AI provider throws by design; Cloud provider not wired; vector RAG / embeddings absent; Model Governance registry absent; SAML/LDAP/SCIM absent; On-Prem/Air-Gapped packages absent; no Terraform/K8s/Helm.

---

## Phase 2 — Target State Definition

Eight commercialization stages, each with mandatory vs optional capabilities and acceptance criteria. Stages are cumulative.

> **Note:** These stages operate *within* the AQLIYA Production Program layer architecture (see above). For example, "Demo Ready" maps to L0 + L0.5 + L1; "Pilot Ready" adds L1 production stability; "Enterprise Deployment" maps to L8. Use the layers for build-order decisions and these stages for customer-facing maturity assessment.

### Stage gates

| Stage | Mandatory capabilities | Optional | Acceptance criteria |
| --- | --- | --- | --- |
| **1. Demo Ready** | Routes documented; demo data consistent; no mock labeled "Live"; governed workspace separated from `/auditos` demo; limitations visible | Polished narrated walkthrough | `tsc`+`test`+`build` green; demo runbook path excludes `/organizations`; no in-memory banner on user-facing paths |
| **2. Pilot Ready** | Tenant enforcement on all read/write; persisted attributable validation; publish lifecycle + audit; backup/restore executable; RBAC | Bilingual polish | One product passes all 8 readiness-gate "Pilot Ready" bullets (currently AuditOS = Conditional GO) |
| **3. First Paying Customer** | Staging+prod for one product; MFA for tenant admins; documented backup restore drill; signed SOW/LOI; support contact path | Usage analytics | Remediation gates "LOI" (wk24) + "First paid" (wk26) closed with commit hashes |
| **4. Multi-Customer SaaS** | True tenant onboarding self-serve or operator flow; per-tenant data isolation tests; metering; subscription billing; status page | In-app admin console | 3+ tenants live with isolation test evidence; billing reconciles; <1 sev-1/mo |
| **5. Enterprise Deployment** | SAML/OIDC SSO; SCIM provisioning; audit-log export/SIEM feed; data retention+deletion policy; DR/HA; external pentest | Customer-managed keys | Pentest report remediated; signed enterprise MSA; uptime SLA instrumented |
| **6. Regulated Enterprise** | SOC2 Type II (or in-progress) ; ISO 27001 controls; DPA; encryption at rest+in transit documented; access reviews | HIPAA/PCI scoping | External audit underway; control evidence repository maintained |
| **7. Government (KSA)** | NCA ECC alignment; Saudi data residency; PDPL compliance; Arabic-first certified; in-Kingdom hosting | NDMO data classification | NCA ECC self-assessment + residency proof; government reference architecture |
| **8. Air-Gapped** | On-prem packaging; local AI runtime (Ollama/vLLM); offline licensing; no external calls; sealed update channel | Hardware appliance | Reproducible air-gapped install; zero egress validated; local model eval parity |

**Strategic call:** Stages 1–3 are 6 months of focused work. Stages 5–8 are each 6–18 month commitments that should be **customer-funded (contract-gated), never speculative.**

---

## Phase 3 — Product Completion Roadmap

Per-product gap analysis from code. "Missing" = not present or stubbed in the repo today.

### Product Completion Matrix

| Product (status) | Missing features | Missing workflows | Missing reports/dashboards | Missing admin/config | Missing UX | Missing analytics | Missing integrations |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AuditOS** (L5 pilot) | Sampling automation, materiality calc depth, multi-period rollforward | Full reviewer sign-off chain at scale, engagement archival lifecycle polish | Partner/QC dashboard, engagement portfolio analytics | Per-firm config (templates, thresholds), user provisioning UI | Arabic PDF font fidelity (P2), reviewer mobile view | Engagement KPIs, time-to-complete | Accounting-system import beyond CSV/TB |
| **DecisionOS** (L4→L5) | Scenario depth, monitoring signal automation, outcome-tracking dashboard | Publish→approve→export gate is operational (code reality: closer to L5) | Outcome-tracking dashboard, decision portfolio view | Framework admin UI | Bilingual parity across all tabs | Decision→outcome correlation | External data feeds for signals |
| **LocalContentOS** (L5-cond) | Supplier scoring depth, tender matching automation | Multi-reviewer approval routing | Spend analytics dashboard, compliance scorecard | Classification rule admin | Arabic PDF font (P2), output editor polish | Localization-rate trend analytics | ERP/procurement integration |
| **SalesOS** (L3→L4) | Intelligence tabs (partially stubbed), forecasting engine | Full deal→pilot handoff automation, sequence execution | Revenue/pipeline analytics depth | ICP/territory admin | Bilingual UX, export pages parity | Conversion funnel analytics | Apollo/CRM/email live sync |
| **WorkflowOS** (L4) | Configurable workflow builder, SLA timers | Cross-client workflow templates | Throughput/SLA dashboard | Workflow schema admin UI | Mobile/responsive polish | Cycle-time analytics | Webhook/external triggers |
| **Office AI** (L4 shared) | Broader task types, real LLM path (currently deterministic) | Multi-step task chaining | Task-throughput dashboard | Task-type config | Result preview/editing UX | Usage analytics | Document-source connectors |
| **Organizations** (L2/L3 mock) | Real backend (currently `mockOrganizations` constants) | Org lifecycle CRUD | Org analytics | Org admin console | Replace amber-banner shell | — | — |
| **Platform Core** (L4) | Tenant self-onboarding, billing/metering | Tenant provisioning workflow | Cross-tenant operator dashboard depth | Plan/quota config | Unified admin shell | Platform usage analytics | Billing provider (Stripe), SIEM |

**Priority ranking (aligned to Production Program layers):**
- **L0 — Platform Foundation:** Staging environment, scheduled backup automation, IaC. Continuous investment.
- **L0.5 — AQLIYA Intelligence Core:** AI cost controls, eval framework, observability, RAG as shared capability. Continuous investment.
- **L1 — AuditOS:** Drive to first paid customer. No other product layer receives new feature work until L1 earns revenue.
- **L2 — LocalContentOS:** Second product, KSA-strategic. Pilot-ready when L1 is cash-flow positive.
- **L3 — DecisionOS:** Complete outcome-tracking dashboard. Do not expand scope.
- **L4 — WorkflowOS:** Freeze. Bug fixes and security patches only.
- **L5 — Office AI:** Keep as shared utility. No product expansion.
- **L6 — Organizations:** Already amber-bannered as internal prototype. No investment.
- **L7 — SalesOS:** Freeze as internal tool. 26+ routes and 11 models exist but no further feature work.
- **L8–L10:** Contract-gated. No speculative investment.

---

## Phase 4 — Security Roadmap

### Security Maturity Roadmap

| Control | Code reality | Target | Effort |
| --- | --- | --- | --- |
| OWASP Top 10 | Partial: Zod validation, parameterized Prisma, security headers, rate limiting. No formal review | Documented OWASP review + fixes | M |
| Authentication | NextAuth v5 JWT + credentials + invite-only OAuth | Add session hardening, password policy | S |
| Authorization / RBAC | Real per-product RBAC (`src/lib/sales/permissions.ts`, platform access) | Centralize into one policy engine | M |
| Tenant isolation | Real guards per product (AuditOS, WorkflowOS, LocalContent) | Cross-tenant isolation test suite | M |
| Audit logs | `PlatformAuditEvent` + per-product audit events | Tamper-evidence, export, retention | M |
| Secrets management | `.env` + `validate-env.mjs`; no vault | Vault/KMS-backed secrets, rotation | M |
| Data encryption | TLS in transit (Vercel); at-rest = provider default | Documented at-rest + field-level for PII | M |
| Session management | JWT sessions, MFA flag in token | Idle/absolute timeout, revocation | S |
| API security | Middleware gates `/api/*`, rate limiting | Per-route authz tests, schema validation gate | M |
| Rate limiting | Memory limiter live; Redis module exists unwired | Set `RATE_LIMITER=redis` in prod | S |
| SSO (SAML/OIDC) | **Not implemented** (decision record pending SOW) | Contract-gated OIDC/SAML, 4–8 wks | L |
| LDAP / AD | **Not implemented** | Contract-gated | L |
| SCIM provisioning | **Not implemented** | Contract-gated | L |
| SOC 2 | None | Type I readiness → Type II | XL |
| ISO 27001 | None | Control mapping → certification | XL |
| NCA ECC / Saudi (PDPL, residency) | None | Self-assessment + residency + Arabic-first cert | XL |

**Sequencing:** Quick wins first (Redis rate limiter, password policy, isolation test suite, OWASP review). Defer SSO/SCIM/SOC2/ISO/NCA until a customer contract funds them. **Run an external pentest before the first enterprise (non-pilot) contract** — it is a hard gate in `READINESS_GATES.md` and currently unmet.

---

## Phase 5 — AI Roadmap

### AI Maturity Roadmap

| Capability | Code reality | Target | Priority |
| --- | --- | --- | --- |
| LLM readiness | Real OpenAI/Anthropic providers, opt-in via env, deterministic default | Production prompt+retry+timeout hardening, streaming | High |
| RAG readiness | **None** — governance context is static maps, explicitly "not RAG" | Scoped RAG over evidence/institutional docs (pgvector) | Med |
| Vector storage | **None** (no pgvector/pinecone in deps) | pgvector on existing Postgres | Med |
| Prompt governance | Real prompt registry + framework builders + governance injection | Versioned prompts, change review, A/B | High |
| Evaluation framework | **None** | Golden-set evals per task type, regression gate in CI | High |
| Model registry | **None** | Lightweight model+version+config registry | Low |
| Hallucination controls | Human-review-by-design, evidence linkage, confidence/limitation notes | Grounding checks, citation enforcement | High |
| Human review workflows | Implemented (review/approval models, escalation) | Extend to all AI outputs uniformly | High |
| Cost controls | **None** (no token budgeting/quotas) | Per-tenant token budgets + alerts | High |
| AI observability | **None** beyond Sentry errors | Prompt/response logging, latency, cost dashboards | High |

**Stance:** The repo's "deterministic-by-default, AI-assistive, human-decides" posture is a genuine differentiator for audit/government buyers — **keep it.** Do not chase autonomous agents. Add evals, cost controls, and observability before turning real LLM providers on for any paying tenant. RAG and local-runtime are customer-funded, not speculative.

---

## Phase 6 — DevOps Roadmap

### Infrastructure Completion Roadmap

| Area | Code reality | Target | Effort |
| --- | --- | --- | --- |
| CI/CD | GitHub Actions: tsc, action-guards, smoke, lint, db-push, test, build, npm audit | Add deploy stage, env promotion, test DB matrix | M |
| Infrastructure as Code | **None** (no Terraform/Pulumi/CDK) | IaC for prod+staging (start Vercel/managed PG) | M |
| Docker | Real multi-stage Dockerfile, non-root, healthcheck | Already solid; add image scanning | S |
| Kubernetes | **None** | Only if customer requires self-host; otherwise skip | L (defer) |
| Monitoring | Sentry (client/server/edge), `/api/health`, `/api/metrics` | Uptime monitor, dashboards, golden signals | M |
| Logging | App logs + audit events | Centralized structured logs + retention | M |
| Alerting | **None** wired | On-call alerts (errors, latency, failed backups) | M |
| Backup | Scripts production-grade (`db-backup`/`restore`/`verify`) with safety gates; manual execution | Scheduled automated backups + periodic restore drill | M |
| Disaster Recovery | **None** | Documented RTO/RPO + tested restore drill | M |
| High Availability | Single-instance (Vercel managed) | Multi-AZ DB, redundancy as scale demands | L |

**Sequencing:** (1) staging environment, (2) **scheduled backup automation + documented restore drill** (scripts exist — automate scheduling), (3) alerting on golden signals + backup failure, (4) IaC for reproducibility. K8s/HA only on customer demand.

---

## Phase 7 — Documentation Roadmap

### Documentation Completion Plan

| Doc type | Code reality | Gap |
| --- | --- | --- |
| User guides | Pilot onboarding packs (AuditOS, LocalContentOS) | Per-product end-user guides, in-app help |
| Admin guides | Partial (settings runbooks) | Tenant-admin guide, provisioning |
| Operations guides | Strong (backup, CI, readiness, demo runbooks) | Consolidate into single ops handbook + on-call |
| Deployment guides | AuditOS v0.1 deployment + environment inventory | Multi-product + staging/prod promotion guide |
| Security guides | Deployment security posture, SSO decision record | Customer-facing security whitepaper, DPA |
| API documentation | Route files exist; no published API docs | OpenAPI spec for `/api/*` |
| Architecture docs | Strong (`AQLIYA_ARCHITECTURE`, core platform) | Keep current; add data-flow + tenancy diagrams |
| AI governance docs | Strong (governance examples, capability matrix) | Customer-facing "how AI is governed" one-pager |

**The documentation is the strongest asset.** The single biggest doc risk is **drift** — multiple files re-describe product status. Enforce `DOCUMENTATION_AUTHORITY.md` + `PRODUCT_STATUS_MATRIX.md` as the only status authority; everything else links, never restates.

---

## Phase 8 — Enterprise Readiness Gap Analysis

| Requirement | Code reality | Gap | Stage unlocked |
| --- | --- | --- | --- |
| Multi-tenancy | Per-product tenant guards + `platformOrganizationId` on entities | No self-serve onboarding, no metering | Multi-Customer SaaS |
| Enterprise identity | OAuth invite-only + MFA | No SAML/OIDC/LDAP/SCIM | Enterprise |
| Enterprise audit | Platform + per-product audit events | No tamper-evidence, no SIEM export | Regulated |
| Compliance | Governance-by-design, risk disclosure docs | No SOC2/ISO/NCA evidence program | Regulated/Gov |
| Data residency | Vercel/managed PG (region-config) | No KSA in-Kingdom hosting proof | Government |
| Data retention | createdById lineage; no policy engine | No retention/deletion automation | Enterprise |
| Legal | Pilot risk-limitation disclosure, terms/privacy pages | No MSA, DPA, SLA contracts, licensing terms | First paying / Enterprise |

**Reality:** Enterprise readiness is the **largest cluster of L0 gaps.** None block a pilot or a first paying SMB/mid-market customer. All block large regulated/government accounts — and all are appropriate to defer until a contract funds them.

---

## Phase 9 — Customer Operations Roadmap

| Area | Code reality | Gap | Effort |
| --- | --- | --- | --- |
| Onboarding | Commercial-pack: onboarding checklist, required-data checklist, TB submission reqs | Operator-run onboarding flow + in-product checklist | M |
| Training | Pilot packs, demo runbooks | Recorded training, Arabic walkthroughs | M |
| Help center | None in-product | KB + in-app help (start with AuditOS) | M |
| Support | None systematized | Ticket intake, response targets, escalation path | M |
| SLA | None | Pilot SLA + production uptime SLA instrumentation | M |
| Customer success | Conversion plan + success criteria docs | Named CS owner, health scoring, QBR cadence | M |

**Sequencing:** For the first pilot, a **human-run, doc-driven CS motion** (which the commercial-pack already supports) is enough. Build tooling only after 2–3 customers reveal the repeatable pattern.

---

## Phase 10 — Go-To-Market Roadmap

| Area | Code reality | Gap |
| --- | --- | --- |
| Packaging | Product taxonomy + marketing pages | Define sellable SKUs (AuditOS pilot, LocalContentOS pilot) |
| Licensing | None | License terms (per-seat / per-engagement / per-tenant) |
| Pricing | None found | Pilot price + production tiers + ROI basis |
| Pilot programs | Strong pack (one-pager, scope, timeline, criteria, conversion) | Execute with 2–3 design partners |
| Demo environments | `/auditos` sanitized demo, demo runbook | Stable hosted demo, no `/organizations` exposure |
| Sales material | Exec pilot deck v3, corporate presentation | Battlecards, objection handling, case study (post-pilot) |
| ROI calculators | None | Audit-hours-saved / localization-compliance ROI tool |
| Executive reports | `exec-brief-writer` capability + report exports | Standardized exec readout per engagement |

**Motion:** Founder-led, design-partner pilots for AuditOS in KSA. Use the existing pilot pack as-is. Add pricing + a one-page ROI model before the first commercial conversation. Defer broad GTM until one reference customer exists.

---

## Phase 11 — Risk Register

| # | Risk | Sev | Business impact | Technical impact | Effort to mitigate | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | Backup scheduling not automated; restore drill not documented | **High** (was Critical — scripts now production-grade) | Data loss = pilot-ending | Scripts exist with safety gates (`CONFIRM_RESTORE`); automate scheduling + periodic drill | S | DevOps Director |
| R2 | No external pentest before enterprise sale | **Critical** | Blocks regulated/gov deals; breach risk | Unknown vulns | M (vendor) | CISO |
| R3 | Breadth over depth (6 products at ~L4) | **Critical** | Diffuse focus delays revenue | Maintenance load across surfaces | Strategic | CPO |
| R4 | SalesOS just unblocked (phantom imports) | High | Internal tool instability | Recent large refactor, thin tests on intel tabs | M | Eng Lead |
| R5 | Documentation drift across status files | High | Overclaiming risk in sales | Truth fragmentation | S | Architect |
| R6 | No AI cost controls / observability | High | Runaway spend when LLMs enabled | No token budgeting | M | AI Gov Lead |
| R7 | Rate limiter in-memory in prod | High | Abuse / no multi-instance correctness | Redis module unwired | S | DevOps |
| R8 | No staging environment | High | Risky prod changes | Test-in-prod | M | DevOps |
| R9 | `/organizations` mock exposed in demos | Med | Credibility hit | Hardcoded mock data | S | Eng |
| R10 | Arabic PDF font fidelity (P2) | Med | KSA UX quality | pdfkit font rendering | S | Eng |
| R11 | No SSO/SCIM | Med | Blocks large accounts only | Net-new build | L | Eng |
| R12 | Single-instance / no DR-HA | Med | Downtime at scale | Architecture | L | DevOps |
| R13 | No SOC2/ISO/NCA program | Med | Blocks regulated/gov only | Evidence program | XL | Compliance |
| R14 | Thin automated test depth on new surfaces | Med | Regressions | 85 test files, uneven coverage | M | QA |

**Critical-path mitigations (do first): R2, R3. (R1 resolved to High — scripts exist; automate scheduling.)**

---

## Phase 12 — Master Roadmap (Layer-Aligned)

> All plans below are mapped to the AQLIYA Production Program layers. Layer references in brackets.

### 30-Day Plan — "Demo-stable + pilot-loadable AuditOS" [L0, L0.5, L1]

- **Deliverables:** AuditOS pilot environment (staging) [L0]; scheduled backup automation + documented restore drill [L0]; Redis rate limiter in prod [L0]; pricing + 1-page ROI model draft; OWASP self-review [L0].
- **Dependencies:** Managed Postgres staging; Redis instance.
- **Risks:** R7, R9. (R1 mitigated — scripts exist; automate scheduling.)
- **Success criteria:** `tsc`+`test`+`build` green; restore drill documented with timestamps; AuditOS pilot can ingest a real trial balance end-to-end.

### 90-Day Plan — "First signed AuditOS pilot (LOI/SOW)"

- **Deliverables:** 2–3 design-partner pilots scoped; cross-tenant isolation test suite; AI cost controls + basic prompt/response observability; alerting on errors+backup failure; consolidated ops handbook; external pentest scheduled.
- **Dependencies:** Design partners; pentest vendor.
- **Risks:** R2, R3, R6, R8.
- **Success criteria:** ≥1 signed LOI/SOW; isolation tests pass; AI spend capped per tenant; on-call alerting live.

### 180-Day Plan — "First paying AuditOS customer"

- **Deliverables:** AuditOS production environment; MFA enforced for tenant admins; pentest remediated; OIDC SSO **only if customer requires**; support + SLA motion live; LocalContentOS pilot readied as second product.
- **Dependencies:** Pentest results; customer contract.
- **Risks:** R2, R11, R14.
- **Success criteria:** First paid invoice; SLA instrumented; pentest high/criticals closed.

### 12-Month Plan — "Repeatable multi-customer SaaS for AuditOS (+ LocalContentOS)"

- **Deliverables:** Tenant self/operator onboarding; metering + billing (Stripe); status page; LocalContentOS to paid pilot; IaC for prod+staging; eval framework gating AI changes; SOC2 Type I readiness (if pipeline demands).
- **Dependencies:** 3+ tenants; billing integration.
- **Risks:** R12, R13, R14.
- **Success criteria:** 3+ paying tenants; billing reconciles; <1 sev-1/month; AI eval regression gate in CI.

### 24-Month Vision — "Governed institutional intelligence platform, KSA-credible"

- **Deliverables (contract-gated):** Enterprise SSO/SCIM; SOC2 Type II / ISO 27001; NCA ECC + PDPL + in-Kingdom residency for a government/regulated reference account; RAG over institutional evidence; selective on-prem for one strategic customer.
- **Dependencies:** Enterprise/government contracts funding each track.
- **Risks:** R13, plus over-extension if pursued speculatively.
- **Success criteria:** One regulated/government reference customer live under compliant deployment; AQLIYA positioned as platform, not single product.

---

## Phase 13 — Resource Planning

Indicative roles per phase (small founder-led team; "x0.5" = part-time/shared).

| Function | 30-Day | 90-Day | 180-Day | 12-Month |
| --- | --- | --- | --- | --- |
| Engineering (full-stack) | 2 | 2–3 | 3 | 4–5 |
| Product | 0.5 | 1 | 1 | 1–2 |
| Security | 0.5 (advisory) | 0.5 + pentest vendor | 1 | 1 |
| DevOps | 0.5 | 1 | 1 | 1–2 |
| QA | 0.5 | 1 | 1 | 1–2 |
| Customer Success | 0 (founder) | 0.5 | 1 | 1–2 |
| Sales Engineering | 0 (founder) | 0.5 | 1 | 1–2 |
| Technical Writing | 0.5 | 0.5 | 0.5 | 1 |

**Minimum viable team to reach first paying customer (180 days): ~4–5 FTE** plus a pentest vendor. Compliance (SOC2/ISO/NCA) is a 12–24 month, contract-funded add, not an upfront hire.

---

## Phase 14 — Final Scorecard

| Dimension | Current /100 | 180-Day target | 24-Month target |
| --- | --- | --- | --- |
| Product | 58 | 70 | 85 |
| Architecture | 65 | 72 | 85 |
| Security | 50 | 65 | 88 |
| AI | 45 | 60 | 80 |
| DevOps | 40 | 62 | 82 |
| Documentation | 80 | 85 | 90 |
| Enterprise | 30 | 45 | 85 |
| Commercial | 40 | 60 | 82 |
| **Overall readiness** | **~53** | **~65** | **~85** |

Scores are evidence-anchored to the L0–L6 ladder; no dimension is credited above what code proves today.

---

## Final Unified Roadmap — "If this were mine to run"

**The one question answered: what does it take to commercialize this repo?**
A focused 6-month push to take **AuditOS (L1)** from pilot-ready to one paying KSA customer, with the platform (L0) and Intelligence Core (L0.5) as the shared foundations, and LocalContentOS (L2) as the sequenced follow-on — with a disciplined refusal to build anything a customer hasn't paid for.

### What I would execute (in order, mapped to layers)

1. **[L0 + L0.5] Stabilize the foundations.** Stand up staging, schedule backup automation + restore drill, Redis rate limiting, AI cost controls + observability, OWASP self-review. These are the cheap operational gaps that block a credible pilot.

2. **[L1] Drive AuditOS to paid pilot.** It is genuinely L5 pilot-ready — 23 models, 15-tab workflow, 50+ action servers, PDF/XLSX bilingual exports, full governance stack. The remaining gaps are P2 (loading states on 6 tabs, mock AI behind env flag). Close them, execute the commercial-pack pilot motion, and sign a paying customer.

3. **Close R2 (external pentest) now.** Schedule before first enterprise contract. This is the real critical blocker — not backups (already production-grade).

4. **Add pricing + a one-page ROI model**, then run 2–3 founder-led design-partner pilots using the existing commercial-pack (15 files, pilot-ready).

5. **[L2] LocalContentOS as second product** on the same rails once L1 earns revenue.

### What I would stop

- Building/maintaining six products at L4 in parallel. Freeze **SalesOS (L7)** as internal tool (26+ routes already built; no new features). **WorkflowOS (L4)**, **Office AI (L5)**, and **Organizations (L6)** get bug fixes and security patches only.
- Overclaiming risk: **marketing pages are currently compliant** — no language implying SSO, on-prem, air-gapped, local AI, RAG, or institutional memory exists. The homepage transparency section (§8) shows SalesOS as L3 and future products as L0. Monitor monthly for drift but this is not an active problem.

### What I would accelerate

- **L0 + L0.5 shared foundations** — staging, backup automation, AI cost controls, eval framework. Every product benefits.
- **L1 AuditOS depth** — the only near-pilot product. Finish the P2 gaps (loading boundaries, mock AI cleanup).
- **Pentest scheduling** — the single unmet hard gate before enterprise sales.
- **Pricing/ROI/pilot-execution motion** — the commercial gap that blocks revenue, not technology.

### What I would delay (until a contract funds it)

- **L8 Enterprise Hardening** — SAML/OIDC/SCIM, DR/HA, SIEM export. 4–8 weeks each.
- **L9 Compliance Certification** — SOC2/ISO 27001/NCA ECC/PDPL. 12–24 month programs.
- **L10 Air-Gapped / Local AI** — on-prem packaging, local runtime, offline licensing.
- **RAG / vector / embeddings** — lives in L0.5 as a shared capability; build when L1 demands it.
- **Kubernetes / HA** — only if customer requires self-host.

Each is real revenue-gated work, not pre-revenue investment.

### What I would never build (speculatively)

- A constellation of "OS" products (RiskOS/ComplianceOS/LegalOS/GovOS/LocalContactOS) before the first two earn revenue.
- Autonomous AI decisioning — it contradicts the core trust principle and the audit/government buyer's requirements. Keep "AI assists, humans decide, evidence governs" as the moat.
- Air-gapped/on-prem as a generic SKU. Only as a single funded strategic deployment.

**Bottom line:** This is a genuinely strong pre-commercial platform held back by breadth, not weakness. The AQLIYA Production Program layers provide the build-order discipline. Narrow to L0 + L0.5 foundations and L1 AuditOS, close the pentest gate, sell a pilot, and let revenue — not aspiration — fund L2 through L10.

---

## Appendix — Evidence Index

- **Production Program authority:** This document (`ENTERPRISE_COMPLETION_ROADMAP.md`) — the single build-order reference.
- **Status authority:** `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`, `READINESS_GATES.md`, `PARALLEL_REMEDIATION_GATES.md`, `AI_CAPABILITY_MATRIX.md`, `ROUTE_STRATEGY.md`
- **Schema:** `prisma/schema.prisma` — 95 models, 18 enums, 2,269 lines
- **AI:** `src/lib/ai/orchestrator.ts`, `providers/{anthropic,openai,cloud,local}-provider.ts`, `provider-factory.ts`; `src/lib/governance/*`
- **Security:** `src/lib/auth-config.ts`, `src/middleware.ts`, `src/lib/audit/tenant-guard.ts`, `src/lib/workflowos/tenant-guard.ts`, `/api/auth/mfa/verify`
- **DevOps:** `.github/workflows/ci.yml`, `Dockerfile`, `docker-compose*.yml`, `scripts/{db-backup,db-restore,backup-verify}.ts`, `sentry.*.config.ts`
- **Commercial/ops:** `docs/commercial-pack/*`, `docs/deployment/auditos-v0.1-*`, `docs/operations/*`

> Maturity labels in this roadmap mirror the source-of-truth matrices as of 2026-06-03. If code advances, update `PRODUCT_STATUS_MATRIX.md` first, then this file.

