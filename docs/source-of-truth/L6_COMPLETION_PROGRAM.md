# AQLIYA L6 Completion Program

**Purpose:** Gap analysis for every platform layer, engine, and product.
**Goal:** L6 Production-Certified across all layers.
**Method:** Foundation gaps + Intelligence gaps + Governance gaps + Security gaps + Operations gaps + Analytics gaps + UX gaps + Testing gaps + Documentation gaps.
**Priority:** Critical > High > Medium > Low.
**Date:** 2026-06-03

---

## L0 — Platform Foundation (Current: L5 → Target: L6)

### Gaps

| # | Gap | Category | Priority | Evidence | Effort |
|---|-----|----------|----------|----------|--------|
| L0-01 | Infrastructure as Code (Terraform/Pulumi) | Operations | **Critical** | No IaC anywhere. Manual deployment. | M |
| L0-02 | HA/DR architecture + documented failover | Operations | **Critical** | ✅ Done 2026-06-03 — `docs/operations/ha-dr-plan.md` with RTO/RPO definitions, DR scenarios, failover procedures, backup schedule, monitoring alarms, quarterly drill schedule, recovery runbook | ✅ |
| L0-03 | Scheduled backup automation | Operations | **High** | ✅ Done 2026-06-03 — GitHub Actions scheduled workflow + AWS Backup in Terraform + backup verification step | ✅ |
| L0-04 | External penetration test | Security | **Critical** | Hard gate before enterprise. Not scheduled. | M (vendor) |
| L0-05 | SSO (SAML/OIDC) | Security | **Medium** | Decision record pending. Contract-gated. | L |
| L0-06 | SCIM provisioning | Security | **Low** | Not implemented. Contract-gated. | L |
| L0-07 | Cross-tenant isolation test suite | Testing | **High** | ✅ Done 2026-06-04 — `src/__tests__/cross-tenant-isolation.test.ts`, `tenant-isolation-audit.test.ts` | ✅ |
| L0-08 | API contract / OpenAPI specification | Foundation | **Medium** | ✅ Done 2026-06-03 — `docs/api/openapi.yaml` with 22 routes, Swagger UI at `/api-docs`, JSON at `/api/openapi.json` | ✅ |
| L0-09 | Tenant lifecycle provisioning | Foundation | **Medium** | ✅ Done 2026-06-04 — Invitation Prisma model (multi-purpose: signup, team invites, partner onboarding); `registerTenantAction` with single-transaction atomic creation (PlatformOrganization→Organization→User→ClientWorkspace→Audit Events); `/signup` page with org name/email/password; login page with signup link + success banner; `tenant.self-service` flag ON; `/settings/team` with member list + invite form + pending invitations; `/invite/[token]` acceptance page; `inviteTeamMemberAction`, `acceptInvitationAction`, `verifyInvitationAction`; sidebar Team nav in 4 modules; audit events for tenant.created, user.registered, workspace.created, invitation.sent, invitation.accepted; PENDING_SETUP status on new tenants | ✅ |
| L0-10 | Session revocation + device trust | Security | **Medium** | ✅ Done 2026-06-03 — RevokedToken + UserSession Prisma models; JWT `jti` generation + revocation check in JWT callback; `src/lib/auth/sessions.ts` (generate/revoke/list/check); `GET /api/auth/sessions` (list), `DELETE /api/auth/sessions` (revoke-all), `DELETE /api/auth/sessions/[jti]` (revoke single); device fingerprinting on login (user-agent, accept-language); session management UI at `/settings/sessions` with list, revoke, revoke-all; sidebar nav entry; `server-only` enforced | ✅ |
| L0-11 | Role-based MFA enforcement | Security | **Medium** | ✅ Done 2026-06-03 — MFA_REQUIRED_ROLES env var (default ADMIN), requireMFA() in server actions + middleware redirect, 17 unit tests | ✅ |
| L0-12 | S3 as default storage provider | Foundation | **Medium** | ✅ Done 2026-06-03 — StorageProvider abstraction with `getSignedUrl()` + `healthCheck()`; S3 provider with signed URLs, health check, audit logging; local provider fallback; feature flag `storage.s3-as-default` / `FF_STORAGE_S3`; migration script at `scripts/ops/migrate-local-storage-to-s3.ts`; AuditOS migrated from legacy ObjectStorageProvider stub to platform storage; `.env.example` S3 config uncommented; runtime env check updated | ✅ |
| L0-13 | CI deploy stage + env promotion | Operations | **Medium** | ✅ Done 2026-06-03 — `deploy.yml` with test → terraform → build & push → deploy (terraform apply) → post-deploy smoke test; `promote.yml` (staging → production with environment approval gate); consistent Node 22 across all 4 workflow files (`ci.yml`, `deploy.yml`, `backup.yml`, `preview.yml`); `scripts/platform/post-deploy-smoke.mjs` with health + homepage + auth + API checks; Dockerfile updated to Node 22 | ✅ |
| L0-14 | Rate limiter integration tests | Testing | **Low** | ✅ Done 2026-06-03 — 24 tests across MemoryRateLimiter, RedisRateLimiter, factory, and middleware | ✅ |
| L0-15 | Notification preferences UI | UX | **Low** | ✅ Done 2026-06-03 — UserNotificationPreference model, notification bell with dropdown + mark-read, preferences settings page at /settings/notifications, 4 API endpoints, 6 notification types | ✅ |
| L0-16 | Queue monitoring dashboard | Operations | **Low** | ✅ Done 2026-06-03 — `/monitoring/queue` with overview + job tabs + retry action + job detail modal | ✅ |

---

## L0.5 — Intelligence Core (Current: L4→L5 → Target: L6)

### Gaps

| # | Gap | Category | Priority | Evidence | Effort |
|---|-----|----------|----------|----------|--------|
| IC-01 | RAG/pgvector with governed retrieval chain | Intelligence | **High** | ✅ Done 2026-06-05 (Cycle 5) — `intelligence-core-rag.ts`, evidence/ranking/governance/audit; migration `20260605000001_ic01_pgvector_document_chunk`; staging live verify via `db:verify-pgvector` | ✅ |
| IC-02 | Active LLM wiring (cost controls gated) | Intelligence | **High** | ✅ Done 2026-06-04 — `ai.real-providers` + `selectOptimalProvider`, budget quotas, orchestrator tests; enable via `FF_AI_REAL_PROVIDERS=true` in staging only | ✅ |
| IC-03 | Streaming activation | Intelligence | **Medium** | ✅ Done 2026-06-03 — stream() on AIProvider interface, OpenAI/Anthropic/deterministic providers, orchestrator.generateStream(), /api/ai/stream SSE endpoint with auth + audit, client-side consumeAIStream() hook, ai.streaming feature flag flipped to ON | ✅ |
| IC-04 | CI eval regression gate | Testing | **Medium** | ✅ Done 2026-06-04 — `npm run ai:eval:ci` in `.github/workflows/ci.yml`, `scripts/ic/ai-eval-runner.ts` | ✅ |
| IC-05 | Model registry | Foundation | **Low** | ✅ Done 2026-06-05 — `model-registry.ts` (file-based catalog, provider defaults, status lifecycle); wired to `provider-router` + `/api/ai/providers` | ✅ |
| IC-06 | Budget alerts + per-tenant quotas | Governance | **Medium** | ✅ Done 2026-06-04 — `budget-manager.ts`, `FF_AI_BUDGET_QUOTAS`, `FF_AI_BUDGET_ALERTS`, orchestrator + governed executor integration | ✅ |
| IC-07 | Cross-product AI observability dashboard | Analytics | **Medium** | ✅ Done 2026-06-03 — Combined `/api/ai/observability` endpoint (spend + governance + per-product + per-provider + latency + errors + fallback + top orgs); enhanced `monitoring/ai/page.tsx` with trend bar charts (spend, requests, governance, errors), per-product breakdown table (AuditOS, LocalContentOS, Office AI, DecisionOS, SalesOS), per-provider latency/error/fallback table, P50/P95/P99 latency distribution, top orgs by spend; loading/error/empty states; 7/14/30/90 day selector | ✅ |
| IC-08 | Unified human review across all products | Governance | **Medium** | ✅ Done 2026-06-03 — Platform review abstraction layer: `src/lib/platform/reviews/types.ts` (shared types), `adapters/index.ts` (registry), `queue.ts` (aggregation); product adapters for AuditOS (AuditReviewComment → approve/reject/return), SalesOS (SalesReview → approve/reject with approval record), WorkflowOS (SunbulReview → Approved/Returned), LocalContentOS + ContentStudio (LocalContentReview + ContentStudioReview → full action matrix); `GET /api/platform/reviews` (list, filter by product, count-only mode), `POST /api/platform/reviews` (execute approve/reject/return/request_changes); unified review queue UI at `/monitoring/reviews` with product filter badges, action buttons (اعتماد/إعادة/رفض), loading/error/empty states, product links; linked from `/monitoring` dashboard; `/api/platform/:path*` added to middleware matcher | ✅ |
| IC-09 | Provider hardening (retry, timeout, circuit breaker, fallback) | Foundation | **High** | ✅ Done 2026-06-04 (Cycle 4) — `provider-circuit-breaker.ts`, fallback chain + health score + observability in `provider-router.ts`; retry/timeout in `provider-utils.ts`; tests `provider-ic09.test.ts`, `ai-reliability.test.ts`. Streaming TBD. | ✅ |
| IC-10 | Local AI runtime | Foundation | **Low** | Throws by design. Contract-gated. | L |

---

## L1 — AuditOS (Current: L5 → Target: L6)

### Gaps

| # | Gap | Category | Priority | Effort |
|---|-----|----------|----------|--------|
| A1-01 | Loading/error boundaries on 6 remaining tabs | UX | **High** | S |
| A1-02 | Sampling automation engine | Intelligence | **Medium** | L |
| A1-03 | Materiality calculation depth | Intelligence | **Medium** | M |
| A1-04 | Multi-period rollforward | Foundation | **Medium** | M |
| A1-05 | Evidence versioning + chain-of-custody | Governance | **Medium** | M |
| A1-06 | Arabic PDF font fidelity (P2) | UX | **Medium** | S |
| A1-07 | Portfolio analytics dashboard | Analytics | **Low** | M |
| A1-08 | Full reviewer sign-off chain at scale | Governance | **Medium** | M |
| A1-09 | Active LLM wiring (behind cost controls) | Intelligence | **High** | ✅ Repo 2026-06-05 — `audit-ai-bridge.ts`; staging live smoke still required | ✅ |
| A1-10 | Engagement archival lifecycle | Operations | **Low** | M |

---

## L2 — LocalContentOS (Current: L5-conditional → Target: L6)

### Gaps

| # | Gap | Category | Priority | Effort |
|---|-----|----------|----------|--------|
| LC-01 | Supplier scoring engine depth | Intelligence | **High** | M |
| LC-02 | Tender matching automation | Intelligence | **Medium** | L |
| LC-03 | Multi-reviewer approval routing | Governance | **High** | M |
| LC-04 | Classification rule admin interface | UX | **Medium** | M |
| LC-05 | Arabic PDF font fidelity (P2) | UX | **Medium** | S |
| LC-06 | Spend analytics dashboard | Analytics | **Medium** | M |
| LC-07 | Localization-rate trend analytics | Analytics | **Low** | M |
| LC-08 | ERP/procurement integration | Foundation | **Low** | XL |
| LC-09 | Content Studio scope definition | Foundation | **Low** | S |

---

## L3 — DecisionOS (Current: L5-conditional → Target: L6)

### Gaps

| # | Gap | Category | Priority | Effort |
|---|-----|----------|----------|--------|
| D3-01 | Outcome-tracking dashboard | UX | **High** | ✅ Done 2026-06-05 — portfolio outcome metrics on `/decisions` (`outcome-dashboard.ts`) | ✅ |
| D3-02 | Monitoring signal automation | Intelligence | **Medium** | M |
| D3-03 | Sector intelligence wiring to decisions | Intelligence | **Medium** | M |
| D3-04 | Cross-decision pattern analysis | Intelligence | **Low** | L |
| D3-05 | Decision portfolio view | UX | **Low** | M |
| D3-06 | Decision→outcome correlation analytics | Analytics | **Low** | M |

---

## L4 — WorkflowOS (Current: L4 → Target: L6 if re-activated)

### Gaps (if re-activated)

| # | Gap | Category | Priority | Effort |
|---|-----|----------|----------|--------|
| W4-01 | Configurable workflow builder | Foundation | **Medium** | XL |
| W4-02 | SLA timers | Foundation | **Medium** | M |
| W4-03 | Cross-client workflow templates | Foundation | **Low** | M |
| W4-04 | Throughput/SLA dashboard | Analytics | **Low** | M |
| W4-05 | Webhook/external triggers | Foundation | **Low** | L |

**Note:** WorkflowOS is **Internal**. These gaps are documented for reference if status changes.

---

## L5 — Office AI (Current: L4 → Target: L6 if re-activated)

### Gaps (if re-activated)

| # | Gap | Category | Priority | Effort |
|---|-----|----------|----------|--------|
| O5-01 | Real LLM path (currently deterministic only) | Intelligence | **Medium** | M |
| O5-02 | Broader task types | Foundation | **Low** | M |
| O5-03 | Multi-step task chaining | Intelligence | **Low** | M |
| O5-04 | Task-throughput dashboard | Analytics | **Low** | M |
| O5-05 | Document-source connectors | Foundation | **Low** | L |

**Note:** Office AI is **Internal**. These gaps are documented for reference if status changes.

---

## L6 — Organizations (Current: L3 → Target: L6 if re-activated)

### Gaps (if re-activated)

| # | Gap | Category | Priority | Effort |
|---|-----|----------|----------|--------|
| O6-01 | Full replacement of mock data | Foundation | **High** | L |
| O6-02 | Org lifecycle CRUD | Foundation | **High** | M |
| O6-03 | Tenant admin console | UX | **Medium** | L |
| O6-04 | Org analytics | Analytics | **Low** | M |

**Note:** Organizations is **Experimental**. Not active.

---

## L7 — SalesOS (Current: L4 → Target: L6)

### Gaps

| # | Gap | Category | Priority | Effort |
|---|-----|----------|----------|--------|
| S7-01 | Intelligence tab completion (ICP, market, signals) | Intelligence | **High** | M |
| S7-02 | Forecasting engine | Intelligence | **Medium** | M |
| S7-03 | CRM live sync (Apollo/CRM/email) | Foundation | **Low** | XL |
| S7-04 | L5 acceptance criteria definition | Foundation | **High** | S |
| S7-05 | Bilingual UX parity | UX | **Medium** | M |
| S7-06 | Conversion funnel analytics | Analytics | **Low** | M |
| S7-07 | Pipeline analytics depth | Analytics | **Low** | M |
| S7-08 | ICP/territory admin UI | UX | **Low** | M |

**Note:** SalesOS is **Active with Caution**. L5 must be proven before L6 investment.

---

## L8 — Enterprise Hardening (Current: L0)

### Gaps

| # | Gap | Category | Priority | Effort |
|---|-----|----------|----------|--------|
| E8-01 | SAML/OIDC SSO | Security | **High** | L |
| E8-02 | SCIM provisioning | Security | **Medium** | L |
| E8-03 | DR/HA architecture | Operations | **High** | L |
| E8-04 | SIEM audit log export | Operations | **Medium** | M |
| E8-05 | Data retention + deletion automation | Operations | **Medium** | M |
| E8-06 | External penetration test | Security | **Critical** | M (vendor) |

**Note:** Contract-gated. L8-06 (pentest) is the exception — should be scheduled before enterprise contract regardless.

---

## L9 — Compliance Certification (Current: L0)

| # | Gap | Category | Priority | Effort |
|---|-----|----------|----------|--------|
| C9-01 | SOC2 Type I → Type II | Compliance | **Low** | XL |
| C9-02 | ISO 27001 control mapping | Compliance | **Low** | XL |
| C9-03 | NCA ECC self-assessment | Compliance | **Low** | L |
| C9-04 | PDPL compliance | Compliance | **Low** | L |
| C9-05 | Saudi data residency proof | Compliance | **Low** | M |
| C9-06 | Data Processing Agreement | Compliance | **Low** | S |

**Note:** Contract-gated. No speculative investment.

---

## L10 — Air-Gapped / Local AI (Current: L0)

| # | Gap | Category | Priority | Effort |
|---|-----|----------|----------|--------|
| A10-01 | On-prem packaging | Operations | **Low** | XL |
| A10-02 | Local AI runtime (Ollama/vLLM) | Intelligence | **Low** | XL |
| A10-03 | Offline licensing | Operations | **Low** | L |
| A10-04 | Zero egress validation | Security | **Low** | M |
| A10-05 | Sealed update channel | Operations | **Low** | L |

**Note:** Contract-gated. No speculative investment.

---

## Top 20 Blockers to Full L6

| Rank | ID | Gap | Layer | Priority | Blocks |
|------|-----|-------|------|----------|--------|
| 1 | L0-04 | External penetration test | L0 | Critical | Enterprise sales |
| 2 | L0-01 | IaC (Terraform/Pulumi) | L0 | Critical | Reproducible deployments |
| 3 | L0-02 | HA/DR architecture | L0 | Critical | ✅ Done 2026-06-03 |
| 4 | IC-01 | RAG/pgvector + embeddings | L0.5 | High | Evidence grounding |
| 5 | IC-02 | Active LLM wiring | L0.5 | High | Real AI features |
| 6 | IC-09 | Provider hardening | L0.5 | High | Production AI reliability |
| 7 | L0-03 | Scheduled backup automation | L0 | High | ✅ Done 2026-06-03 |
| 8 | L0-07 | Cross-tenant isolation tests | L0 | High | Multi-tenant safety |
| 9 | A1-01 | AuditOS loading boundaries | L1 | High | UX completeness |
| 10 | A1-09 | AuditOS LLM wiring | L1 | High | Real AI review |
| 11 | LC-01 | Supplier scoring depth | L2 | High | Product depth |
| 12 | LC-03 | Multi-reviewer routing | L2 | High | Governance |
| 13 | D3-01 | Outcome dashboard | L3 | High | Decision visibility |
| 14 | S7-01 | Intelligence tab completion | L7 | High | SalesOS L5 proof |
| 15 | S7-04 | L5 criteria definition | L7 | High | SalesOS path |
| 16 | E8-06 | External pentest | L8 | Critical | Enterprise gate |
| 17 | L0-11 | Role-based MFA | L0 | Medium | ✅ Done 2026-06-03 |
| 18 | IC-04 | CI eval gate | L0.5 | Medium | AI regression |
| 19 | IC-06 | Budget alerts | L0.5 | Medium | Cost control |
| 20 | IC-07 | AI observability dashboard | L0.5 | Medium | Operations |

---

## Summary — Effort to L6

| Layer | Current | Target | Critical Gaps | High Gaps | Est. Effort |
|-------|---------|--------|---------------|-----------|-------------|
| L0 | L5 | L6 | 3 | 2 | 3-4 months |
| L0.5 | L4→L5 | L6 | 0 | 3 | 2-3 months |
| L1 | L5 | L6 | 0 | 2 | 1-2 months |
| L2 | L5-cond | L6 | 0 | 2 | 2-3 months |
| L3 | L5-cond | L6 | 0 | 1 | 1-2 months |
| L4 | L4 | — | — | — | Frozen |
| L5 | L4 | — | — | — | Frozen |
| L6 | L3 | — | — | — | Frozen |
| L7 | L4 | L6 | 0 | 3 | 3-4 months |
| L8 | L0 | — | 1 | 2 | Contract-gated |
| L9 | L0 | — | 0 | 0 | Contract-gated |
| L10 | L0 | — | 0 | 0 | Contract-gated |
| **Total** | **~58** | **L6** | **4** | **15** | **~8-12 months** |
