# AQLIYA Roadmap v1.2 — Repository Reality Edition

**Version:** 1.2
**Status:** Official execution roadmap — single source of truth
**Date:** 2026-06-05
**Authority:** Repository reality. Code evidence > Schema > Tests > Documentation > Historical assumptions.
**Supersedes:** aqliya-roadmap-v1.1.md, ENTERPRISE_COMPLETION_ROADMAP.md (where conflict exists — see ROADMAP_CONFLICT_MATRIX.md)

---

## Architecture Layers (Preserved from v1.1)

```
L0   Platform Foundation           — auth, infra, storage, queue, secrets, monitoring
L0.5 AQLIYA Intelligence Core      — AI providers, costs, evals, governance, observability
L1   AuditOS                       — first strategic product
L2   LocalContentOS                 — KSA-strategic second product
L3   DecisionOS                    — decision governance system
L4   WorkflowOS                    — governed workflow workspace (internal)
L5   Office AI                     — shared governed assistant (internal)
L6   Organizations                 — tenant lifecycle (experimental)
L7   SalesOS                       — revenue intelligence (active with caution)
L8   Enterprise Hardening          — SSO, DR, HA, pentest (contract-gated)
L9   Compliance Certification      — SOC2, ISO, NCA, PDPL (contract-gated)
L10  Air-Gapped / Local AI         — on-prem runtime (contract-gated)
```

**Architecture rule:** These 12 layers are the AQLIYA architecture. No new layers may be added without documented repository evidence of a new product/system requiring separation.

---

## Part 1 — v1.2 Changes from v1.1

| Change | v1.1 Statement | v1.2 Correction | Source |
|--------|----------------|-----------------|--------|
| L0 Platform | "Missing: secrets, notifications, queue, staging, monitoring, feature flags, S3, Redis" | **All now built.** 19/20 components at L4+. | Repository reality (OpenCode build) |
| L0.5 Intelligence | "Missing: cost controls, eval framework, observability, provider router" | **All now built.** 13/15 components at L4+. RAG/vector infrastructure built (IC-01); active LLM wiring pending (A1-09). | Repository reality (OpenCode build) |
| L0 Security | "MFA exists but not enforced. Rate limiter in-memory. No vault." | MFA (TOTP+backup) implemented. Redis rate limiter built. Secrets vault (AES-256-GCM) built. | Repository reality |
| SalesOS status | "Active workspace hardening" / "Freeze as internal tool" | **ACTIVE_WITH_CAUTION.** 100+ files changed. Active development proven. | Repository reality, PRODUCT_STATUS_AUTHORITY_MATRIX |
| DecisionOS level | L4 | **L5-conditional.** Real engines, evidence model, publish gates. | Repository reality |
| Overall readiness | ~52/100 | **~58/100** (↑6 points from L0/L0.5 builds) | CURRENT_REALITY_MATRIX |

---

## Part 2 — Current Maturity by Layer

### L0 — Platform Foundation
**Current: L5 | Target: L6 | Status: Active**

| Component | Maturity | Key Evidence |
|-----------|----------|-------------|
| Auth (NextAuth v5) | L5 | JWT, OAuth (Google/GitHub), credentials, middleware. `src/middleware.ts` |
| MFA | L5 | TOTP + backup codes, verification UI. `src/lib/auth/mfa.ts` |
| RBAC | L4 | Per-product guards. `src/core/access/` |
| Tenant Isolation | L5 | Guards on Audit, WorkflowOS, SalesOS, LocalContent. `platformOrganizationId` on entities |
| Redis | L5 | ioredis singleton with retry. `src/lib/platform/redis-client.ts` |
| Rate Limiter | L5 | Memory + Redis sliding window. `src/lib/platform/rate-limiter/` |
| Secrets Vault | L5 | AES-256-GCM, DB-backed, audit-logged. `src/lib/platform/secrets/vault.ts` |
| Notifications | L5 | Multi-channel (in_app/email/webhook). `src/lib/platform/notifications/engine.ts` |
| Queue Runtime | L5 | Bull queue, retry, priority. `src/lib/platform/operations/queue-runtime.ts` |
| Storage (S3) | L4 | S3 provider exists. Not default. `src/lib/platform/storage/s3-storage-provider.ts` |
| Feature Flags | L5 | Registry, env overrides, org overrides. `src/lib/platform/feature-flags/` |
| Monitoring | L4 | Health checks, system metrics, alerting engine. Dashboard UI exists. |
| CI/CD | L4 | GitHub Actions. No deploy stage. |
| Backup | L5 | Scripts with safety gates. `scripts/db-backup-scheduler.ts` |
| Staging | L5 | Docker Compose: PG16 + Redis7 + App. `docker-compose.staging.yml` |
| Audit System | L5 | PlatformAuditEvent + per-product events. Dual-write strategy. |

**Remaining for L6:**
- IaC (Terraform/Pulumi) — High
- HA/DR plan and tested restore drill — High
- SSO (SAML/OIDC) — Medium (contract-gated)
- Scheduled backup automation — Medium
- Cross-tenant isolation test suite — Medium
- Penetration test (external) — High
- API contract/OpenAPI specification — Medium
- Tenant lifecycle provisioning — Medium

---

### L0.5 — Intelligence Core
**Current: L5 | Target: L6 | Status: Active**

| Component | Maturity | Key Evidence |
|-----------|----------|-------------|
| Provider Factory | L5 | OpenAI, Anthropic, Cloud, Deterministic. `src/lib/ai/provider-factory.ts` |
| Provider Router | L5 | Health-checked, cost-based, 60s cache. `src/lib/ai/provider-router.ts` |
| Cost Mapping | L5 | Per-model costs per 1K tokens. `src/lib/ai/cost-mapping.ts` |
| Spend Tracker | L5 | Aggregates from audit logs. `src/lib/ai/spend-tracker.ts` |
| Eval Framework | L5 | Test suites, pass thresholds, audit-logged. `src/lib/ai/eval-gate.ts` |
| Governance Metrics | L5 | Review rates, confidence, task breakdown. `src/lib/ai/governance-metrics.ts` |
| Governed Executor | L5 | Human-approval gates, cost, audit. `src/lib/ai/governed-ai-executor.ts` |
| Prompt Registry | L5 | Task → framework builder. `src/lib/ai/prompt-registry.ts` |
| Human Review | L5 | Governance core, escalation, provenance. `src/lib/governance/` |

**Remaining for L6:**
- RAG pipeline active LLM wiring (A1-09; blocked until staging smoke pass) — High
- CI eval regression gate — Medium
- Streaming activation — Medium
- Model registry — Low
- Local AI runtime — Low (contract-gated)

---

### L1 — AuditOS
**Current: L5 | Target: L6 | Status: Active**

| Area | Maturity | Gap |
|------|----------|-----|
| Engagement workflow (15 tabs) | L5 | 6 tabs need loading/error boundaries |
| Trial balance + mapping | L5 | Sampling automation |
| Financial statements | L5 | Multi-period rollforward |
| Evidence vault | L5 | Versioning, chain-of-custody |
| Findings + recommendations | L5 | — |
| Review + approval | L5 | Full sign-off chain at scale |
| Exports (PDF/XLSX bilingual) | L5 | Arabic PDF font fidelity (P2) |
| AI review | L5 | Wire real LLM when cost controls active |
| Dashboard | L5 | Portfolio analytics |

**Remaining for L6:** Loading boundaries on 6 tabs, Arabic font fidelity, portfolio analytics, sampling/materiality engine depth.

---

### L2 — LocalContentOS
**Current: L5-conditional | Target: L6 | Status: Active**

| Area | Maturity | Gap |
|------|----------|-----|
| Project/supplier/spend CRUD | L5 | — |
| Classification | L5 | Rule admin interface |
| Scoring engine | L4 | Weighted multi-factor scoring |
| Evidence | L5 | — |
| Findings | L5 | Tender matching |
| Review/approval | L4 | Multi-reviewer routing |
| Exports | L5 | Arabic PDF font fidelity |
| Content Studio | L4 | Scope clarity |

**Remaining for L6:** Scoring engine depth, multi-reviewer approval routing, tender matching, Arabic font fidelity, ERP integration.

---

### L3 — DecisionOS
**Current: L5-conditional (↑ from L4) | Target: L6 | Status: Active**

| Area | Maturity | Gap |
|------|----------|-----|
| Decision engine | L5 | — |
| Framework, scenarios, risks | L5 | — |
| Recommendation + publish gates | L5 | — |
| Evidence model | L5 | — |
| Monitoring signals | L4 | Not wired |
| Outcome tracking | L3 | No dashboard |
| Sector intelligence | L4 | Integration surface |
| Learning engine | L4 | Cross-decision patterns |

**Remaining for L6:** Outcome-tracking dashboard, monitoring signal automation, sector intelligence wiring, cross-decision pattern analysis.

---

### L4 — WorkflowOS
**Current: L4 | Status: Internal**

Complete v0.1. No active expansion. Bug fixes and security patches only.
Remaining if re-activated: configurable workflow builder, SLA timers, cross-client templates.

---

### L5 — Office AI
**Current: L4 | Status: Internal**

Shared application. Deterministic-only. No active expansion.
Remaining if re-activated: real LLM path, broader task types, document-source connectors.

---

### L6 — Organizations
**Current: L3 | Status: Experimental**

Mock data with amber banners. Real DB model exists.
Not active. Full replacement of mock required before any use.

---

### L7 — SalesOS
**Current: L4 | Target: L6 | Status: Active with Caution**

**Active evidence:**
- 100+ files modified, 50 deleted (v02→vnext migration)
- New contacts module (routes, actions, types)
- 18 error/loading boundaries across all routes
- PrismaRepository refactor with intelligence snapshots
- Account brief + pilot handoff PDF export parity
- Evidence layer (evidence-links, evidence-resolver)

**Gaps preventing L5:**
- Intelligence tabs partially stubbed
- No forecasting engine
- No CRM sync
- No L5 acceptance criteria met

**Policy:** See PRODUCT_STATUS_AUTHORITY_MATRIX.md §SalesOS.

**Remaining for L6:** Intelligence depth (tabs completion), forecasting, CRM sync, L5→L6 hardening.

---

### L8–L10 — Enterprise, Compliance, Air-Gapped
**Current: L0 | Status: Future (contract-gated)**

All at L0. No speculative investment. Documented strategy only.

---

## Part 3 — Product Status Classification

See `PRODUCT_STATUS_AUTHORITY_MATRIX.md` for full matrix.

| Product/System | Status | Current L | Target L |
|---------------|--------|-----------|----------|
| Platform Foundation | Active | L5 | L6 |
| Intelligence Core | Active | L5 | L6 |
| AuditOS | Active | L5 | L6 |
| LocalContentOS | Active | L5-cond | L6 |
| DecisionOS | Active | L5-cond | L6 |
| WorkflowOS | Internal | L4 | — |
| Office AI | Internal | L4 | — |
| Organizations | Experimental | L3 | — |
| SalesOS | **Active with Caution** | L4 | L6 |
| Sunbul | Deprecated | Redirect | — |
| SimulationOS | Internal | L1 | — |
| Enterprise (L8) | Future | L0 | — |
| Compliance (L9) | Future | L0 | — |
| Air-Gapped (L10) | Future | L0 | — |
| LocalContactOS | Future | L0 | — |
| AQLIYA Studio | Future | L0 | — |

---

## Part 4 — Roadmap Authority Rules

1. **Repository reality is the final authority.** If code proves a capability exists, it exists. If code proves a capability is missing, documentation cannot claim it.
2. **Status changes must originate from code evidence.** Update PRODUCT_STATUS_AUTHORITY_MATRIX.md first, then cascade to other docs.
3. **Active with Caution** is not a downgrade — it is an honest label for products with real code but unproven L5/L6 readiness.
4. **Internal** products have no commercial claim path without explicit roadmap revision.
5. **Future** products must not appear in marketing copy as live capabilities.
6. **L6 is production-certified.** No product may claim L6 unless it meets all criteria in L6_COMPLETION_PROGRAM.md.

---

## Part 5 — Overall Readiness

| Dimension | Score (v1.2) | v1.1 Score | Change | Primary Driver |
|-----------|-------------|------------|--------|----------------|
| Product maturity | 62 | 58 | +4 | L0/L0.5 builds |
| Architecture | 70 | 65 | +5 | Queue, secrets, storage, monitoring |
| Security | 56 | 50 | +6 | MFA, vault, Redis rate limiter |
| AI | 60 | 45 | +15 | Costs, evals, router, observability |
| Operations | 48 | 40 | +8 | Staging, monitoring, queue, Redis |
| Documentation | 82 | 80 | +2 | Updated matrices |
| Enterprise | 30 | 30 | 0 | No change |
| Commercial | 40 | 40 | 0 | No change |
| **Overall** | **~58** | **~52** | **+6** | L0/L0.5 hardening |

---

## Part 6 — Conflict Resolution Authority

All conflicts between v1.1 sources and v1.2 are documented in `ROADMAP_CONFLICT_MATRIX.md`.

**Key resolutions:**
1. L0 gaps: Resolved — foundations are built (19/20 components)
2. L0.5 gaps: Resolved — cost, eval, observability, router built
3. SalesOS: Resolved — ACTIVE_WITH_CAUTION
4. DecisionOS: Resolved — L5-conditional
5. All other products: Status unchanged

---

## Part 7 — Supporting Documents

| Document | Location | Purpose |
|----------|----------|---------|
| ROADMAP_CONFLICT_MATRIX.md | `docs/source-of-truth/` | All conflict resolutions |
| CURRENT_REALITY_MATRIX.md | `docs/source-of-truth/` | Current maturity by component |
| PRODUCT_STATUS_AUTHORITY_MATRIX.md | `docs/source-of-truth/` | Product status classifications |
| L6_COMPLETION_PROGRAM.md | `docs/source-of-truth/` | Gap analysis per layer |
| EXECUTION_DEPENDENCY_GRAPH.md | `docs/source-of-truth/` | Dependency graph and critical path |
| PRODUCT_STATUS_MATRIX.md | `docs/source-of-truth/` | Detailed product status |
| ROUTE_STRATEGY.md | `docs/source-of-truth/` | Route architecture |
| AQLIYA_ARCHITECTURE.md | `docs/source-of-truth/` | Architecture documentation |

---

*This document supersedes aqliya-roadmap-v1.1.md. Where conflicts exist, this document and the supporting matrices in `docs/source-of-truth/` are the authority.*

