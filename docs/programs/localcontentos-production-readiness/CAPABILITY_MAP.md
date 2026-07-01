---
title: "LocalContentOS Production Readiness — Capability Map"
status: active
program: "LocalContentOS Production Readiness"
phase: 1
version: "1.0"
date: 2026-06-27
author: OpenCode
classification: capability-map
supersedes: none
---

# LocalContentOS Production Readiness — Capability Map

**Phase:** 1A — Gap Consolidation  
**Source:** GAP_REGISTER.md (41 gaps → 12 capabilities after deduplication)

> This document groups individual gaps into **Production Capabilities** — coherent units of work that deliver a measurable operational outcome when closed.  
> Each capability has a single acceptance criterion, one pre-requisite list, and a set of gaps it closes.

---

## How to Read

```
Capability Name
  ├── Closes Gaps: [IDs]
  ├── Reason: Why this is a single capability
  ├── Acceptance: What "done" means
  ├── Dependencies: What must exist before this can close
  └── Sub-items: The concrete outputs (files, configs, tests, docs)
```

---

## C-01: Operations Runbook & Deployment Guide

**Closes Gaps:** OP-01 (deployment runbook), OP-02 (env vars doc), OP-03 (backup/restore), OP-04 (DR plan)  
**Severity:** 4 High  
**Reason:** All four gaps share a root cause: "an operator cannot deploy, configure, or recover LCOS without tribal knowledge." Fixing them together produces a single deployable artifact — the operations runbook.  
**Priority:** P1 — Without this, production deployment is unreliable.

**Acceptance Criterion:** An operator with no prior LCOS knowledge can deploy the system, configure it, run a backup, simulate a restore, and document the procedure for DR — all following a written runbook.

**Dependencies:**
- None (can start immediately, docs-only work)

**Sub-items:**
- `docs/runbooks/localcontentos-deployment-runbook.md` — full deployment guide
- `.env.example` — comprehensive env var documentation with LCOS-specific vars
- `scripts/platform/restore-drill.mjs` — extended to cover LCOS models
- `docs/runbooks/localcontentos-dr-plan.md` — RPO/RTO, failover, recovery steps

---

## C-02: Observability Infrastructure

**Closes Gaps:** OP-05 (LCOS health checks), OP-07 (structured logging), MO-01 (metrics), MO-02 (tracing), MO-04 (health dashboard), MO-05 (alerting), MO-06 (suspicious pattern monitoring)  
**Severity:** 5 High, 2 Nice  
**Reason:** All seven gaps are layers of the same observability stack: health checks → structured logging → metrics → tracing → dashboard → alerts → pattern monitoring. Each depends on the previous. Splitting them creates coordination overhead.  
**Priority:** P1 — Without observability, operations is blind.

> **Validation note (2026-06-27):** OP-05 was originally "No health endpoint" — this was incorrect. The platform has a robust health infrastructure: `/api/health` (liveness + readiness + K8s probes), `/api/integration/health` (circuit breakers + metrics counters), `/api/platform/enterprise-health` (enterprise snapshot with critical/warning alerts), and `/api/monitoring/health` (system metrics with queue visibility). **The gap is refined to:** Health endpoints exist but none validate LCOS-specific dependencies (ERP connector availability, workbook engine state, scoring engine health, data request pipeline). The fix is to extend the existing `/api/health/ready` endpoint with LCOS checks, not build from scratch.

**Acceptance Criterion:** A dashboards page (or equivalent) shows live request rate, error rate, latency P50/P95/P99 for LCOS API routes and server actions. Alerts fire when error rate exceeds 5% or AI pipeline failures spike. All logs are structured JSON.

**Dependencies:**
- C-01 (runbook should document how to verify observability)
- Shared decision on metrics provider (Prometheus vs cloud-native)

**Sub-items:**
- LCOS-specific checks in `/api/health/ready` (ERP connector state, workbook engine health)
- Structured logging integration (pino/winston) with consistent JSON format
- Prometheus metrics endpoint (or equivalent) with request rate, error rate, latency histograms
- OpenTelemetry instrumentation for server actions + AI pipeline
- Health dashboard view
- Alert rules defined + integrated with notification channel
- Audit event monitoring rules

---

## C-03: Performance Benchmarking

**Closes Gaps:** PF-01 (page load benchmarks), PF-03 (scoring engine benchmarks), PF-06 (concurrent load testing)  
**Severity:** 3 High  
**Reason:** All three are about establishing performance baselines. Without baselines, regressions are invisible and capacity planning is impossible.  
**Priority:** P1 — Without benchmarks, production performance is unknown.

**Acceptance Criterion:** CI includes a performance test job that measures page load time (Lighthouse), scoring engine throughput (ops/sec with 100+ lines), and API response times under load (k6/artillery). Results are reported as a CI artifact.

**Dependencies:**
- None for baseline (can measure current state immediately)
- C-02 for ongoing monitoring (alerts on regression)

**Sub-items:**
- Lighthouse CI config for 3 key pages (dashboard, workbook, AI review)
- Scoring engine benchmark test with 100-line, 50-supplier, 500-record dataset
- k6/artillery load test script for 3 critical paths (project list, workbook scoring, evidence download)
- Baseline report with current performance numbers

---

## C-04: Security Hardening

**Closes Gaps:** SC-01 (input validation), SC-02 (file upload validation), SC-03 (CORS policy)  
**Severity:** 1 High, 2 Medium  
**Reason:** All three are about closing explicit security attack surfaces — unvalidated inputs, unsanitized uploads, and missing CORS policy. Different checks, same threat model category.  
**Priority:** P1 — Security is a hard gate for production.

**Acceptance Criterion:** Every server action rejects malformed inputs with a structured error. File upload validates magic bytes and rejects non-compliant files. API download routes return explicit CORS headers.

**Dependencies:**
- None (changes are scoped to LCOS files)

**Sub-items:**
- Zod schemas for all 9 server action input types
- Magic byte validation in `file-repository.ts`
- CORS headers on `/api/local-content/*` routes

---

## C-05: RBAC & Authorization Matrix

**Closes Gaps:** RB-01 (tenant isolation audit), RB-02 (RBAC matrix), RB-03 (permission granularity)  
**[DI-01 is duplicate of RB-01 — removed]**  
**Severity:** 1 High, 2 Medium  
**Reason:** All three are different views of the same problem: "we don't know who can do what in LCOS, and we haven't proved tenant isolation holds." Fixing them together produces a single RBAC specification.  
**Priority:** P1 — Production without verified authorization is a compliance risk.

**Acceptance Criterion:** A documented RBAC matrix exists mapping roles (admin/manager/analyst/reviewer/approver) → actions (create/read/update/delete/approve/export) → entities (project/supplier/spend/evidence/etc.). Every action file enforces the matrix. Tenant isolation is verified by a cross-tenant test.

**Dependencies:**
- None (audit + documentation, then targeted code changes)

**Sub-items:**
- RBAC matrix document (`docs/source-of-truth/LCOS_RBAC_MATRIX.md`)
- Tenant isolation coverage audit across all 9 action files
- Cross-tenant isolation test (`src/__tests__/lc-tenant-isolation.test.ts`)
- Consistent permission guard pattern applied to all action files

---

## C-06: Workflow State Machine Validation

**Closes Gaps:** WM-01 (state transition verification), WM-02 (state machine tests)  
**Severity:** 2 Medium  
**Reason:** Both gaps are about the same concern — state transitions are partially guarded but not systematically verified. Fixing them together produces a complete state machine specification with test coverage.  
**Priority:** P2 — Important but no immediate security or ops risk.

**Acceptance Criterion:** Complete state transition matrix documented for all 5 stateful models (project/workbook/evidence/finding/review). Tests validate every valid transition is allowed and every invalid transition is rejected.

**Dependencies:**
- C-05 (RBAC matrix defines who can trigger which transitions)

**Sub-items:**
- State transition matrix document
- `src/lib/local-content/__tests__/state-machine.test.ts` covering all 5 models

---

## C-07: Data Integrity & Seeding

**Closes Gaps:** DI-02 (seed script), DI-03 (JSON field validation)  
**Severity:** 1 High, 1 Medium  
**Reason:** Both are about data quality at the edges — seeding fresh environments and validating data before it reaches the DB. Different but complementary.  
**Priority:** P2 — Blocks developer onboarding and data quality.

**Acceptance Criterion:** A `npm run seed:localcontent` command creates a demonstrable LCOS environment from scratch. All JSON fields are validated by Zod schemas before write.

**Dependencies:**
- C-04 (Zod schemas from security hardening can be reused here)

**Sub-items:**
- `prisma/seed-localcontent.ts` with realistic Saudi-market data
- `npm run seed:localcontent` script in `package.json`
- Zod schemas for all JSON fields in LCOS models (metadata, evidence, parameters, drivers, assumptions)

---

## C-08: Audit & Evidence Hardening

**Closes Gaps:** AE-01 (retention policy), AE-02 (audit export API)  
**Severity:** 2 Medium  
**Reason:** Both are about completing the audit story — policy for old data and a way to export it. They can be done independently but share the same audit domain.  
**Priority:** P2 — Necessary for regulatory readiness.

**Acceptance Criterion:** Audit events older than the retention period are automatically archived/deleted. A downloadable audit report (CSV or PDF) is available per project.

**Dependencies:**
- C-04 (export endpoint needs validation patterns)

**Sub-items:**
- Retention policy documented in runbook
- Scheduled cleanup job for audit events
- `/api/local-content/projects/[projectId]/audit/export` endpoint
- Audit export button in audit trail UI

---

## C-09: Feature Hardening

**Closes Gaps:** FC-01 (ERP connectors), FC-02 (Content Studio tech debt)  
**Severity:** 2 Medium  
**Reason:** Both are about features that exist but have documented gaps — ERP connectors untested, Content Studio has schema drift. Neither is a blocker for production but both reduce confidence.  
**Priority:** P3 — Not production-critical but needed for full feature confidence.

**Acceptance Criterion:** ERP connector integration test suite passes with mock responses. Content Studio schema drift (R-03) is resolved and has adequate test coverage.

**Dependencies:**
- C-04 (Content Studio action files share validation patterns)

**Sub-items:**
- ERP connector integration tests with mock SAP/Oracle/Dynamics/Odoo responses
- ERP setup documentation
- Content Studio schema alignment (R-03 remediation)
- Content Studio test coverage (target: 80%+ of actions)

---

## C-10: AI Governance Documentation

**Closes Gaps:** AG-01 (AI provider dependency documentation)  
**Severity:** 1 Medium  
**Reason:** Single gap about documenting what happens when cloud AI providers are unavailable. Standalone documentation task.  
**Priority:** P3 — Low urgency, important for operator clarity.

**Acceptance Criterion:** LCOS AI documentation clearly states which features require cloud providers, which fall back to deterministic AI, and what users see when cloud AI is unavailable.

**Dependencies:**
- C-01 (runbook should reference AI provider config)

**Sub-items:**
- AI provider dependency section in deployment runbook
- Graceful degradation messages in AI advisor UI (if not already present)

---

## C-11: UX Consistency

**Closes Gaps:** UX-01 (empty states), UX-02 (error handling), UX-04 (mobile responsiveness), UX-05 (action feedback)  
**Severity:** 4 Medium  
**Reason:** All four are about inconsistent user experience — different pages handle errors, empty states, loading, and feedback differently. Fixing together produces a consistent UI pattern.  
**Priority:** P3 — User-facing quality but not production-blocking.

**Acceptance Criterion:** Every LCOS list page shows a helpful empty state. Every server action failure shows a user-facing notification. Mobile viewport renders without layout breakage. All actions return a consistent `{success, message?, data?}` structure.

**Dependencies:**
- C-04 (consistent action return types from input validation)

**Sub-items:**
- Empty state audit and remediation across all list pages
- Standardized error notification pattern (toast/alert)
- Mobile viewport testing + responsive fixes
- Standardized server action return type

---

## C-12: Commercial Readiness

**Closes Gaps:** CR-02 (pricing), CR-03 (packaging), CR-04 (SLAs), CR-06 (sandbox), CR-08 (regulatory compliance), CR-09 (support), CR-10 (case studies)  
**Severity:** 7 Nice  
**Reason:** All seven are about making LCOS a sellable product. Most require business decisions, not engineering work. Grouped as a single capability to present to product/commercial stakeholders.  
**Priority:** P4 — Not engineering-blocking; requires business decisions.

**Acceptance Criterion:** A commercial readiness document exists covering: pricing model, packaging options, SLA tiers, sandbox access procedure, regulatory compliance matrix, support channels, and at least one customer case study.

**Dependencies:**
- C-01 (runbook needed for sandbox deployment)
- C-07 (seed data needed for sandbox demo environment)

**Sub-items:**
- Pricing & packaging proposal
- SLA definition document
- Sandbox deployment configuration
- Regulatory compliance mapping (Vision 2030, NCAP, Saudization)
- Support channels & escalation matrix
- Case study from شركة الابتكار التقني pilot

---

## Summary: 41 Gaps → 12 Capabilities

| Capability | Gaps | Severity Mix | Priority | Effort Profile |
|:----------:|:----:|:------------:|:--------:|:--------------:|
| C-01 | 4 | 4 High | P1 | Docs |
| C-02 | 7 | 5 High, 2 Nice | P1 | Code + Docs |
| C-03 | 3 | 3 High | P1 | Tests + Config |
| C-04 | 3 | 1 High, 2 Med | P1 | Code |
| C-05 | 3 | 1 High, 2 Med | P1 | Audit + Code + Docs |
| C-06 | 2 | 2 Med | P2 | Tests + Docs |
| C-07 | 2 | 1 High, 1 Med | P2 | Code |
| C-08 | 2 | 2 Med | P2 | Code + Docs |
| C-09 | 2 | 2 Med | P3 | Tests + Code |
| C-10 | 1 | 1 Med | P3 | Docs |
| C-11 | 4 | 4 Med | P3 | Code |
| C-12 | 7 | 7 Nice | P4 | Docs + Business |
| **Total** | **40** | **15 High, 17 Med, 8 Nice** | | |

> **Deduplication note:** DI-01 was merged into RB-01 (same root cause: missing tenant isolation audit). Original 41 → 40 unique gaps.

---

## Phase 1B: Validation Results (2026-06-27)

All 41 gaps validated against repository reality. Key corrections:

| Gap | Original Claim | Corrected Finding | Impact |
|:---:|----------------|-------------------|:------:|
| OP-05 | "No health endpoint" | Health endpoint EXISTS (`/api/health`, `/api/health/live`, `/api/health/ready`, `/api/integration/health`, `/api/platform/enterprise-health`, `/api/monitoring/health`). Gap refined to: **no LCOS-specific health checks**. | Reduced effort — extend existing, not build |
| DI-01 | "No tenant isolation audit" | Duplicate of RB-01 (same root cause). | Removed (41→40 unique gaps) |
| FC-01 | "No ERP test files" | Test files EXIST for connector-factory, field-mapping, file-importer, import-pipeline. Gap refined to: **no real-instance integration tests** (mock-only). | Reduced severity — connector code is tested |

**Verified correct:** All other 38 gaps confirmed present as described. Detailed validation per capability available in `docs/programs/localcontentos-production-readiness/validation/`.

---

## Phase 1C: Dependency Graph

```
                          ┌────────────────────────────────┐
                          │  P0-A: PRODUCTION FOUNDATION   │
                          │  ─── ما يمنع التشغيل الآمن     │
                          │                                │
                          │  C-04: Security Hardening      │
                          │    → Zod validation            │
                          │    → File upload hardening     │
                          │    → CORS policy               │
                          │  C-07: Data Integrity          │
                          │    → Seed script               │
                          │    → JSON field validation     │
                          │  C-05: RBAC (tenant isolation) │
                          │    → RB-01 critical audit      │
                          │  C-02: LCOS health checks      │
                          │    → OP-05 extend /ready       │
                          │  C-01: Backup/restore          │
                          │    → OP-03 extend drill        │
                          └────────┬───────────────────────┘
                                   │ gate: tsc + build + tests + matrix update
                                   ▼
┌──────────────────────────────────────────────────────────────┐
│  P0-B: PRODUCTION UX                                         │
│  ─── تجربة مستخدم متكاملة                                     │
│                                                              │
│  C-11: UX Consistency                                        │
│    → UX-01 Empty states                                      │
│    → UX-02 Error states                                      │
│    → UX-04 Mobile responsiveness                             │
│    → UX-05 Action feedback                                   │
└────────┬─────────────────────────────────────────────────────┘
         │ gate: tsc + build + tests + matrix update
         ▼
┌──────────────────────────────────────────────────────────────┐
│  P0-C: OPERATIONAL READINESS                                  │
│  ─── قابل للتشغيل والتسليم                                    │
│                                                              │
│  C-01: Operations Runbook                                    │
│    → OP-01 Deployment runbook                                │
│    → OP-02 Env vars doc                                      │
│    → OP-04 DR plan                                           │
│  C-04: AI provider auth review                               │
│    → SC-04 per security                                      │
└────────┬─────────────────────────────────────────────────────┘
         │ gate: tsc + build + tests + matrix update
         ▼
┌──────────────────────────────────┐   ┌──────────────────────────┐
│  P1-A: SECURITY & GOVERNANCE     │   │  P1-B: QUALITY & OPS     │
│  ─── الحوكمة والصلاحيات          │   │  ─── الجودة والمراقبة    │
│                                  │   │                          │
│  C-05: RBAC (full audit)        │   │  C-02: Observability     │
│    → RB-02, RB-03 audit matrix  │   │    → logging, metrics    │
│  C-08: Audit Hygiene            │   │    → tracing, dashboard  │
│    → AE-01 retention            │   │    → alerts, monitoring  │
│    → AE-02 export API           │   │  C-03: Performance       │
│  C-12: Commercial Docs          │   │  C-06: Workflow Tests    │
│    → CR-02 through CR-10        │   │  C-09: Feature Hardening │
└────────┬─────────────────────────┘   └────────┬─────────────────┘
         │                                     │
         ▼                                     ▼
┌──────────────────────────────────────────────────────────────┐
│  P2: STRATEGIC                                               │
│  ─── استراتيجي                                                │
│                                                              │
│  C-10: AI Governance                                         │
│    → AG-01 provider dependency docs                          │
└──────────────────────────────────────────────────────────────┘
```

### Dependency Rules

1. **P0-A blocks everything** — no capability starts until foundation is solid. No production deployment without Zod + tenant isolation + health checks + seed data.
2. **P0-B can run in parallel with P0-C** — UX and documentation are independent of each other, but both wait for P0-A gate.
3. **P1 tracks are parallel** — Security/Governance and Quality/Observability have no cross-dependencies. Run simultaneously.
4. **P2 waits for all P1** — AI governance depends on observability (to monitor) and security (for provider auth).

### Sub-Wave Gates

After **each sub-wave**, before moving to the next:

```
┌─────────────────────────────────────────────────────────┐
│                     GATE CHECK                          │
│                                                         │
│  1. npx tsc --noEmit                                    │
│  2. npm run build                                       │
│  3. npm test (relevant domain tests)                    │
│  4. Update PRODUCTION_READINESS_MATRIX.md               │
│     — mark closed gaps as "Resolved"                    │
│     — update scores per domain                          │
│  5. Close GAP IDs in GAP_REGISTER.md                    │
│     — change status to "Resolved"                       │
│     — add resolution note with commit ref               │
│  6. git commit (per capability, not per sub-wave)       │
│                                                         │
│  Gate fails → fix before proceeding to next sub-wave    │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 1D: Execution Waves

### P0 — Must Ship (5-7 days)

| Sub-Wave | Focus | Capabilities | Gaps | Commit Pattern |
|:--------:|:-----:|:------------:|:----:|:--------------:|
| **P0-A** | Production Foundation | C-04 (security), C-07 (data), C-05 (RBAC core), C-02 (health checks), C-01 (backup/restore) | 9 (5 High, 3 Medium, 1 Nice) | `P0-A<N> feat(localcontentos): <message>` |
| **P0-B** | Production UX | C-11 (empty/error/loading/responsive) | 4 (4 Medium) | `P0-B<N> feat(localcontentos): <message>` |
| **P0-C** | Operational Readiness | C-01 (runbooks, DR), C-04 (AI auth) | 5 (4 High, 1 Medium) | `P0-C<N> feat(localcontentos): <message>` |

### P1 — Should Ship (7-10 days)

| Sub-Wave | Focus | Capabilities | Gaps | Commit Pattern |
|:--------:|:-----:|:------------:|:----:|:--------------:|
| **P1-A** | Security & Governance | C-05 (full RBAC), C-08 (audit), C-12 (commercial) | 10 (1 High, 8 Medium, 1 Nice?) | `P1-A<N> feat(localcontentos): <message>` |
| **P1-B** | Quality & Observability | C-02 (full stack), C-03 (perf), C-06 (tests), C-09 (hardening) | 9 (4 High, 2 Medium, 1 Nice) | `P1-B<N> feat(localcontentos): <message>` |

| Track | P1-A — Security & Governance | P1-B — Quality & Observability |
|:-----:|:----------------------------:|:------------------------------:|
| Items | RB-02, RB-03, AE-01, AE-02, CR-02..10 | OP-07, MO-01, MO-02, MO-04, MO-05, MO-06, PF-01, PF-03, PF-06, WM-01, WM-02, FC-01, FC-02 |

### P2 — Strategic (2-3 days)

| Wave | Focus | Capabilities | Gaps | Commit Pattern |
|:----:|:-----:|:------------:|:----:|:--------------:|
| P2 | AI Governance | C-10 | AG-01 (1 Medium) | `P2 feat(localcontentos): <message>` |

**Total investment:** 14-20 days for all 12 capabilities → estimated 40 unique gaps → target ~95% production readiness.

---

## Phase 1E: Execution Backlog

Detailed ordered work items by sub-wave. Each item maps to a capability sub-item with:
- Gap IDs closed
- Acceptance test
- Commit convention

See `EXECUTION_BACKLOG.md` — the authoritative execution document.

---

## Commit Convention

| Pattern | Example |
|:-------:|:--------|
| `P0-A<N> feat(localcontentos): <description>` | `P0-A1 feat(localcontentos): add Zod validation for workbook APIs` |
| `P0-B<N> feat(localcontentos): <description>` | `P0-B1 feat(localcontentos): add empty states for all list pages` |
| `P0-C<N> feat(localcontentos): <description>` | `P0-C1 feat(localcontentos): create deployment runbook` |
| `P1-A<N> feat(localcontentos): <description>` | `P1-A1 feat(localcontentos): complete RBAC audit matrix` |
| `P1-B<N> feat(localcontentos): <description>` | `P1-B1 feat(localcontentos): add structured logging` |
| `P<N> fix(localcontentos): <description>` | `P0-A2 fix(localcontentos): validate JSON fields on write` |

Rules:
- One commit per capability (2-3 gaps max)
- Never mix sub-waves in one commit
- Always include updated PRODUCTION_READINESS_MATRIX in the same commit that closes a gap

---

*Capability Map v2.1. 40 validated gaps → 12 capabilities → 3 sub-waves (P0) + 2 tracks (P1) + P2. Execution ready.*
