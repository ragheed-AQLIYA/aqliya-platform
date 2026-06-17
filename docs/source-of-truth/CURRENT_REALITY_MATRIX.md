# AQLIYA Current Reality Matrix — v1.2

**Purpose:** Authoritative maturity assessment for every platform layer, engine, and product.
**Method:** Repository evidence only. Code > Schema > Tests > Documentation.
**Date:** 2026-06-06 (Cycle 6 docs sync — see `docs/validation/cycle-6/`)
**Scale:** L0 Concept · L1 Marketing · L2 Shell · L3 Prototype · L4 Usable v0.1 · L5 Pilot-ready · L6 Production-certified

---

## L0 — Platform Foundation

| Component | Maturity | Evidence | Gap |
|-----------|----------|----------|-----|
| **Auth (NextAuth v5)** | L5 | JWT sessions with `jti` (JWT ID), session revocation (RevokedToken + UserSession models), device fingerprinting on sign-in, OAuth (Google/GitHub), credentials provider, middleware route-gating. `src/lib/auth-config.ts`, `src/lib/auth/sessions.ts`, `src/middleware.ts`. Session management UI at `/settings/sessions`. | Password policies, step-up auth |
| **MFA** | L5 | TOTP + backup codes implemented. `src/lib/auth/mfa.ts`, `src/app/api/auth/mfa/verify`, `src/app/(dashboard)/settings/mfa/`, `mfaEnabled` flag on User model. | Role-based enforcement, step-up auth |
| **RBAC** | L4 | Per-product RBAC (sales/permissions, platform access), server-action guards (`server-action-guard.ts`). `src/core/access/`. | No unified cross-product policy engine; ABAC absent |
| **Tenant Isolation** | L5 | Per-product tenant guards + `cross-tenant-isolation.test.ts` (92 tests with bridge @ `4d24afd`). | DB integration leak tests not in CI |
| **Redis** | L5 | Singleton client (ioredis) with retry strategy. `src/lib/platform/redis-client.ts`, `src/lib/platform/redis-config.ts`. | Prod connection validation |
| **Rate Limiter** | L5 | Memory + Redis-backed (sliding window). Feature-flag controlled. `src/lib/platform/rate-limiter/`, `src/middleware-rate-limit.ts`. ✅ 24 unit/integration tests (2026-06-03). | None |
| **Secrets Vault** | L5 | AES-256-GCM encrypted vault backed by PlatformSecret table. Audit-logged. `src/lib/platform/secrets/vault.ts`. | Key rotation automation, KMS integration |
| **Notifications** | L5 | Multi-channel (in_app/email/webhook), severity levels, audit-logged. User preferences (per-type × per-channel toggle). Notification bell in header with dropdown. `/notifications` list page, `/settings/notifications` preferences page. `src/lib/platform/notifications/engine.ts`, `src/actions/platform/notifications.ts`, `src/components/platform/notification-bell.tsx`, 4 public API endpoints. | None |
| **Email** | L4 | Nodemailer sender with dev fallback + queue handler. `src/lib/platform/email/sender.ts`, `handler.ts`. | SMTP configuration, templates |
| **Storage** | L5 | Dual provider (local + S3). `StorageProvider` abstraction with `store()`, `retrieve()`, `delete()`, `exists()`, `getSignedUrl()`, `healthCheck()`. S3 provider with presigned URLs, health check, aws-sdk. Local provider with directory-based persistence, path traversal protection, MIME detection. Feature flag `storage.s3-as-default`. Migration script. `src/lib/platform/storage/index.ts`. | None — S3 is now production-ready; local remains default for dev |
| **Queue Runtime** | L2 | **Not on `main`** — `queue-runtime.ts` / Bull deferred (not in `package.json`). Do not claim L5 queue. | Bull dependency + activation when scoped |
| **Feature Flags** | L5 | Registry with env overrides, org-level overrides. `src/lib/platform/feature-flags/registry.ts`. | Admin UI for flag management |
| **Logger** | L5 | Structured console logger with level filtering, metadata. `src/lib/platform/logger.ts`. | Log aggregation, retention |
| **Monitoring** | **L5** | Health checks (DB/Redis/Queue/filesystem/AI). System metrics (memory/CPU/uptime). Alerting engine. AI observability dashboard with spend, governance, per-product, per-provider, latency, error charts. `src/lib/platform/monitoring/system-monitor.ts`. `src/app/(dashboard)/monitoring/`, `src/app/(dashboard)/monitoring/ai/`. | Alert routing, uptime SLA instrumentation |
| **CI/CD** | L5 | Multi-workflow pipeline: `ci.yml` (tsc, lint, test, build, prisma, guards, demo smoke, audit), `deploy.yml` (test → terraform plan → build & push → deploy → post-deploy smoke test), `promote.yml` (staging → production with environment approval gate), `backup.yml` (scheduled DB backup + verify). Consistent Node 22 across all workflows. `scripts/platform/post-deploy-smoke.mjs` for post-deployment validation. `.github/workflows/`. | Test DB matrix |
| **Backup** | L5 | Production-grade scripts with safety gates (`CONFIRM_RESTORE`). `scripts/platform/db-backup-scheduler.ts`, `scripts/platform/db-restore-drill.ts`. | Scheduled automation, periodic restore drill |
| **Staging** | L5 | Docker Compose with PostgreSQL 16 + Redis 7 + App. `docker-compose.staging.yml`. | IaC for reproducibility |
| **Audit System** | L5 | Dual-write strategy: PlatformAuditEvent (unified) + per-product events. Full AI-specific fields. `src/lib/platform/audit-event-service.ts`. | Tamper-evidence, retention policy, SIEM export |
| **Overall L0** | **L5** | All L0 components at L4+. CI/CD now L5 with multi-workflow pipeline + promotion + smoke tests. | IaC, HA/DR, tenant lifecycle, API contracts |

---

## L0.5 — AQLIYA Intelligence Core

| Component | Maturity | Evidence | Gap |
|-----------|----------|----------|-----|
| **AI Orchestrator** | L5 | Provider selection, governance injection, fallback, callbacks, streaming (`generateStream()`). `src/lib/ai/orchestrator.ts`. | None |
| **Provider Factory** | L5 | OpenAI, Anthropic, Cloud, Deterministic creation. `src/lib/ai/provider-factory.ts`. | Local provider throws by design |
| **Provider Router** | L5 | Health-checked, cost-based routing with 60s cache. Logged to audit. `src/lib/ai/provider-router.ts`. | Active LLM connections not env-gated in prod |
| **Anthropic Provider** | L4 | HTTP provider implementation. `src/lib/ai/providers/anthropic-provider.ts`. | Production hardening, retry, timeout |
| **OpenAI Provider** | L4 | HTTP provider implementation. `src/lib/ai/providers/openai-provider.ts`. | Production hardening, retry, timeout |
| **Cost Mapping** | L5 | Per-model 1K token costs (input/output). `src/lib/ai/cost-mapping.ts`. | Real-time pricing updates |
| **Spend Tracker** | L5 | Aggregates from audit logs by provider, model, day, org. `src/lib/ai/spend-tracker.ts`. | Budget alerts, per-tenant quotas |
| **Eval Framework** | L5 | Test suites per task type, pass thresholds, audit-logged. `src/lib/ai/eval-gate.ts`, `src/lib/ai/eval/`. | CI regression gate |
| **Governance Metrics** | L5 | Review rate, override rate, confidence, per-task breakdown. `src/lib/ai/governance-metrics.ts`. Dashboard integration at `/monitoring/ai`. | None |
| **AI Observability Dashboard** | L5 | Combined endpoint `/api/ai/observability` with per-product, per-provider, latency, error, fallback, top orgs. Enhanced UI with trend charts, breakdown tables, P50/P95/P99 latency, loading/error/empty states. `src/app/(dashboard)/monitoring/ai/page.tsx`, `src/lib/ai/observability.ts`. | None |
| **Governed AI Executor** | L5 | Human-approval gates, cost calculation, audit logging. `src/lib/ai/governed-ai-executor.ts`. | Async execution path |
| **Human Review** | L5 | Review/approval models, escalation, provenance. `src/lib/governance/`. **Unified review abstraction layer** — `src/lib/platform/reviews/` with adapter registry (AuditOS, SalesOS, WorkflowOS, LocalContentOS, ContentStudio), shared queue API at `/api/platform/reviews`, unified UI at `/monitoring/reviews`. | None |
| **Prompt Registry** | L5 | Task type → framework builder mapping. `src/lib/ai/prompt-registry.ts`. | Versioning, A/B testing |
| **RAG / Vector** | L4→L5 (repo) | pgvector + `DocumentChunk`, `intelligence-core-rag.ts`, `audit-ai-bridge` @ `4d24afd`. Local Docker verify PASS. | **Staging live** verify + ingest smoke pending (Cycle 6 G6-2) |
| **Knowledge Layer** | L1 | Sector intelligence models exist (Sector, SectorBenchmark, SectorPattern). `prisma/schema.prisma`. | No knowledge graph runtime |
| **Simulation Layer** | L3 | Simulation engine exists. `src/lib/simulation/`. | Not wired to products |
| **Overall L0.5** | **L4→L5** | IC-09, orchestrator, bridge, pgvector schema on `main`. | Staging live smoke; knowledge graph runtime |

---

## L1 — AuditOS

| Component | Maturity | Evidence | Gap |
|-----------|----------|----------|-----|
| **Engagement Management** | L5 | Full 15-tab workflow, 23 Prisma models, 50+ server actions. | 6 tabs missing dedicated loading boundaries |
| **Trial Balance** | L5 | Upload, parse, validate. Trust state system. | Sampling automation |
| **Account Mapping** | L5 | AI-suggested + manual mapping. Canonical accounts. | Materiality calculation depth |
| **Financial Statements** | L5 | Generation, status tracking. | Multi-period rollforward |
| **Notes/Disclosures** | L5 | AI-drafted notes, missing information detection. | N/A |
| **Evidence Vault** | L5 | Upload, link, state tracking. Chain-of-custody. | Evidence versioning |
| **Findings** | L5 | AI-suggested, severity/materiality classification. | N/A |
| **Recommendations** | L5 | AI-contributed, reviewer decision. | N/A |
| **Review/Approval** | L5 | Multi-step review, approval records. | Full reviewer sign-off chain at scale |
| **Exports** | L5 | PDF (pdfkit) + XLSX (xlsx) bilingual. Arabic-first. | Arabic PDF font fidelity (P2) |
| **Audit Trail** | L5 | Per-engagement AuditEvent. AI-related flagging. | N/A |
| **AI Review** | L5 | AI outputs + human review; **A1-09** `audit-ai-bridge.ts` (tenant + RAG path) @ `4d24afd`. | Live LLM on staging not evidenced (Cycle 6 BLOCKED) |
| **Dashboard** | L5 | KPI cards, AI insight panel, recent activity. | Portfolio analytics |
| **Overall L1** | **L5** | Matches or exceeds pilot-ready. Remaining gaps are P2 polish. | Loading boundaries, font fidelity, LLM wiring |

---

## L2 — LocalContentOS

| Component | Maturity | Evidence | Gap |
|-----------|----------|----------|-----|
| **Project Setup** | L5 | Organization/project CRUD, reporting period, scope. | N/A |
| **Supplier Records** | L5 | CRUD, locality classification, ownership type. | Supplier scoring depth |
| **Spend Records** | L5 | Amount, currency, category, contract reference. | ERP/procurement integration |
| **Classification** | L5 | AI-assisted, confidence tracking, review status. | Classification rule admin |
| **Evidence Upload** | L5 | Multi-type, file hash, storage key. | N/A |
| **Scoring Engine** | L4 | Local content percentage calculation. | Depth: weighted scoring, multi-factor |
| **Findings** | L5 | Gap/risk findings, severity, status workflow. | Tender matching automation |
| **Review/Approval** | L4 | Review + approval models exist. | Multi-reviewer routing |
| **Exports/Reports** | L5 | PDF (pdfkit) + XLSX (xlsx) bilingual. | Arabic PDF font fidelity (P2) |
| **Audit Trail** | L5 | LocalContentAuditEvent per mutation. | N/A |
| **Seed Data** | L5 | Comprehensive seed dataset. | N/A |
| **Content Studio** | L4 | 8 models, 4 routes, campaign/item workflow. | Not L5 — product scope unclear |
| **Overall L2** | **L5-conditional** | Strong v0.1. Gaps are depth (scoring, tender matching) and polish (fonts, routing). | Scoring depth, multi-reviewer, ERP integration |

---

## L3 — DecisionOS

| Component | Maturity | Evidence | Gap |
|-----------|----------|----------|-----|
| **Decision Engine** | L5 | Real engine with framework, scenarios, risk analysis. `src/lib/decision/decision-engine.ts`. | N/A |
| **Framework Builder** | L5 | Context, purpose, options, criteria, values. `src/lib/decision/framework.ts`. | N/A |
| **Scenarios** | L5 | Best/expected/worst case with risk analysis. `src/lib/decision/scenarios.ts`. | Scenario depth automation |
| **Risk Analysis** | L5 | 7-dimension risk model. `src/lib/decision/risk-analysis.ts`. | N/A |
| **Recommendation** | L5 | Publish→approve→export gate operational. `src/lib/decision/recommendation.ts`. | N/A |
| **Evidence** | L5 | DecisionEvidence model with CRUD, file validation, audit. `prisma/schema.prisma`, `src/actions/decision-evidence-actions.ts`. | N/A |
| **Monitoring Signals** | L4 | Signal + alert models exist (DecisionMonitoringSignal, DecisionRiskAlert). | Signal automation not wired |
| **Outcome Tracking** | L3 | DecisionOutcome model exists. | No dashboard, no UI |
| **Sector Intelligence** | L4 | Sector, SectorBenchmark, SectorPattern, SectorPlaybook, SectorRule. | Not integrated with decisions |
| **Learning Engine** | L4 | Pattern extraction, sector pattern storage. `src/lib/decision/learning-engine.ts`. | Cross-decision pattern analysis |
| **Exports** | L5 | Bilingual PDF export with audit trail. Gated by OPERATOR role. | N/A |
| **Overall L3** | **L5-conditional** | Engines are real and deep. UI gaps: outcome dashboard, signal automation. | Outcome dashboard, signal wiring |

---

## L4 — WorkflowOS

| Component | Maturity | Evidence | Gap |
|-----------|----------|----------|-----|
| **Workflow CRUD** | L5 | Full create/read/update/delete. Workflow states, audit trail. | N/A |
| **Client Management** | L5 | Client CRUD with tenant isolation, membership, records. | N/A |
| **Document Storage** | L5 | File upload, storage key, metadata. | N/A |
| **Review Workflow** | L5 | SunbulReview with status (Pending/Approved/Returned). | N/A |
| **Approval** | L5 | Record approval workflow. | N/A |
| **Audit Trail** | L5 | SunbulAuditEvent per action. | N/A |
| **Sunbul Redirect** | L5 | permanentRedirect(302) to WorkflowOS routes. | N/A |
| **Seed Data** | L5 | SunbulClient + membership for admin user. | N/A |
| **Overall L4** | **L4** | Complete v0.1. Internal tool — no active expansion needed. | Configurable workflow builder, SLA timers |

---

## L5 — Office AI

| Component | Maturity | Evidence | Gap |
|-----------|----------|----------|-----|
| **Task Management** | L5 | Task CRUD, types (summarize, analyze, draft, etc.), statuses. `prisma/schema.prisma` OfficeAiTask. | Broader task types |
| **Output Generation** | L5 | Deterministic handlers, markdown/text/html formats, status tracking. `src/lib/office-ai/deterministic-generators.ts`. | Real LLM path |
| **File Attachment** | L5 | File upload, extraction, hash. OfficeAiFile model. | N/A |
| **Governance** | L5 | Human review, approval, source evidence. `OfficeAiOutput` review status. | N/A |
| **Audit** | L5 | Platform audit events. | N/A |
| **Overall L5** | **L4** | Shared application, stable. Not expanded. | Real LLM, broader task types |

---

## L6 — Organizations

| Component | Maturity | Evidence | Gap |
|-----------|----------|----------|-----|
| **UI Surface** | L3 | Hardcoded `mockOrganizations` and `mockOrg` constants. Amber warning banner. | Real backend |
| **Database** | L5 | Organization model with cross-product relations is real. | N/A |
| **PlatformOrganization** | L5 | Bridge entity connecting all products. `prisma/schema.prisma`. | N/A |
| **Overall L6** | **L3** | Prototype surface on real data model. Not active. | Full replacement of mock data |

---

## L7 — SalesOS

| Component | Maturity | Evidence | Gap |
|-----------|----------|----------|-----|
| **Route Pages** | L5 | 26+ active route pages including contacts. `src/app/sales/`. | None |
| **Prisma Models** | L5 | 11 models: SalesAccount, SalesDeal, SalesPipeline, SalesPipelineStage, SalesEvidenceLink, SalesInteraction, SalesContact, SalesProposal, SalesReview, SalesApproval, SalesAuditEvent. | None |
| **Server Actions** | L5 | 6 action files / 40+ server actions. `src/actions/sales-actions.ts`, `src/actions/sales-contact-actions.ts`. | None |
| **Components** | L5 | 70+ components with RBAC, audit trail, evidence links. | None |
| **Exports** | L5 | PDF export parity for account brief + pilot handoff. | Bilingual polish |
| **Pipeline** | L4 | Pipeline + stage model. | Forecasting engine |
| **Intelligence** | L3→L4 | Prisma-derived ICP/intelligence memory surfaces. | Tabs partially stubbed |
| **Error States** | L5 | 18 error.tsx + loading.tsx across all routes. | None |
| **Seed Data** | L5 | `prisma/seed-sales.ts` with Prisma-backed dashboard data. | None |
| **Governance** | L5 | Review/approval models, audit trail, evidence links. | None |
| **Overall L7** | **L4** | Active development (100+ files changed). ACTIVE_WITH_CAUTION policy. | Intelligence depth, forecasting, CRM sync, L5 criteria |

---

## L8 — Enterprise Hardening

| Component | Maturity | Evidence | Gap |
|-----------|----------|----------|-----|
| **SSO (SAML/OIDC)** | L0 | OAuth invite-only exists (Google/GitHub). SSO decision record pending. | Not implemented |
| **SCIM Provisioning** | L0 | **Not implemented.** | Not implemented |
| **DR/HA** | L0 | **Not implemented.** | Not implemented |
| **SIEM Export** | L0 | **Not implemented.** | Not implemented |
| **Pentest** | L0 | **Not scheduled.** | Hard gate before enterprise |
| **Overall L8** | **L0** | Not started. Contract-gated. | Everything |

---

## L9 — Compliance Certification

| Component | Maturity | Evidence | Gap |
|-----------|----------|----------|-----|
| **SOC2** | L0 | **Not started.** | Contract-gated |
| **ISO 27001** | L0 | **Not started.** | Contract-gated |
| **NCA ECC** | L0 | **Not started.** | Contract-gated |
| **PDPL** | L0 | **Not started.** | Contract-gated |
| **Overall L9** | **L0** | Not started. Contract-gated. | Everything |

---

## L10 — Air-Gapped / Local AI

| Component | Maturity | Evidence | Gap |
|-----------|----------|----------|-----|
| **On-Prem Package** | L0 | **Not implemented.** | Not implemented |
| **Local AI Runtime** | L0 | `local-provider.ts` throws by design. | Not implemented |
| **Offline Licensing** | L0 | **Not implemented.** | Not implemented |
| **Overall L10** | **L0** | Not started. Contract-gated. | Everything |

---

## Summary — Current State

| Layer | Current Maturity | Target (v1.2) | Confidence |
|-------|-----------------|----------------|------------|
| L0 Platform Foundation | **L5** (↑ from L4) | L6 | High — 19/20 at L4+ |
| L0.5 Intelligence Core | **L4→L5** (↑ from L4) | L6 | High — 12/15 at L4+ |
| L1 AuditOS | **L5** | L6 | High — near pilot-ready |
| L2 LocalContentOS | **L5-conditional** | L6 | Medium — scoring depth needed |
| L3 DecisionOS | **L5-conditional** (↑ from L4) | L6 | Medium — outcome dashboard |
| L4 WorkflowOS | **L4** | L6 | Low — internal/frozen |
| L5 Office AI | **L4** | L6 | Low — shared app, not expanded |
| L6 Organizations | **L3** | L6 | Low — prototype, not active |
| L7 SalesOS | **L4** (ACTIVE_WITH_CAUTION) | L6 | Medium — active, needs L5 proof |
| L8 Enterprise | **L0** | L6 | Low — contract-gated |
| L9 Compliance | **L0** | L6 | Low — contract-gated |
| L10 Air-Gapped | **L0** | L6 | Low — contract-gated |

**Overall platform readiness:** ~58/100 (up from ~52/100 in ENTERPRISE_COMPLETION_ROADMAP)
