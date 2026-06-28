---
title: "LocalContentOS Production Readiness — Gap Register"
status: active
program: "LocalContentOS Production Readiness"
phase: 2
version: "2.3"
date: 2026-06-28
author: OpenCode
classification: gap-register
supersedes: v1.1
---

# LocalContentOS Production Readiness — Gap Register

**Program:** LocalContentOS Production Readiness  
**Phase:** 0 — Production Readiness Baseline  
**Date:** 2026-06-27  

> **Gap severity:** Blocker (must fix) | High (should fix) | Medium (important) | Nice (improvement)  
> **Status:** Open / In Progress / Blocked / Resolved / Deferred  
> **All gaps identified through evidence-based evaluation in PRODUCTION_READINESS_MATRIX.md**

### Gap Structure

Every gap entry follows this structured schema:

| Field | Purpose | Example |
|-------|---------|---------|
| **Domain** | Production Readiness Matrix domain | 7. Security |
| **Matrix ref** | Specific criterion in the matrix | 7.4 |
| **Status** | Current lifecycle state | Open / In Progress / Blocked / Resolved / Deferred |
| **Owner Capability** | Capability from CAPABILITY_MAP.md | C-04 (Security Hardening) |
| **Execution Wave** | Backlog wave assignment | P0-A1 |
| **Blocks** | Gap(s) that cannot close before this one | SC-01B |
| **Blocked by** | Gap(s) that must close first | RB-02 |
| **Verification** | Commands/checks required to close | `npx tsc --noEmit` + `npm run build` + integration test |
| **Evidence** | Persistent artifact proving closure | File path, commit hash, or report link |
| **Impact** | Business/technical consequence if unfixed | — |
| **Suggested fix** | Technical approach to resolve | — |

**Design rationale:** These fields turn the Gap Register into an **Execution Graph**, not just a task list. Dependencies are explicit. Closure is verifiable. Each gap is atomic (single outcome).

---

## Phase 1 Validation Update (2026-06-27)

All 41 gaps have been validated against the current repository state. Key corrections:

| Gap | Original Claim | Corrected Finding | Impact |
|:---:|----------------|-------------------|:------:|
| OP-05 | "No health endpoint exists" | **Health endpoint EXISTS** at `/api/health`, `/api/health/live`, `/api/health/ready`, `/api/integration/health`, `/api/platform/enterprise-health`, `/api/monitoring/health`. Gap is: *no LCOS-specific health checks added to the existing endpoint*. | Reduced effort (extend, not build) |
| DI-01 | Separate gap | **Duplicate of RB-01.** Same root cause: tenant isolation audit not performed. | Removed from gap list (count: 41→40) |
| FC-01 | "No ERP test files" | **Test files EXIST** for connector-factory, field-mapping, file-importer, import-pipeline. Gap is: *no real-instance integration testing* (mock-only). | Reduced severity (connector code is tested) |
| SC-01 | Single gap | **Split into SC-01A (Resolved) + SC-01B (Blocked by RB-02).** Validation standard + 17/19 entry points closed; 2 workbook actions blocked by RBAC dependency. | Accurate tracking — remaining scope visible, blocker explicit |

**Validated gap count: 40 unique gaps** (1 duplicate removed, 1 split into 2, 1 moved to correct severity section).

> **Note:** SC-01 split → SC-01A (Resolved, removed from counts) + SC-01B (High, Security). DI-01 removed (duplicate of RB-01, cross-reference only). SC-04 moved from Medium to High (AI provider auth review) — High count unchanged.

---

## Summary

| Severity | Count | Weighted Impact | Notes |
|----------|:-----:|:---------------|:------|
| **Blocker** | 0 | — | |
| **High** | **15** | Operations (5), Monitoring (4), Performance (3), **Security (2: SC-01B, SC-04)**, RBAC (1), Data (1) | **RB-01 ✅ Resolved** — 21 exploitation paths eliminated, Zero Tenant Leakage ✅ PASS. High count reduced from 16 to 15. RB-02 now unblocked. |
| **Medium** | 16 | UX (4), Commercial (4), Functional (2), Data (1), Security (1), Workflow (2), RBAC (2) | DI-01 ✅ Resolved (duplicate of RB-01) |
| **Nice-to-have** | 9 | Commercial (6), Monitoring (1), Operations (1) | |
| **Total** | **40** | | 3 resolved (SC-01A, RB-01, DI-01), 40 open (RB-02 now unblocked) |

---

## High-Severity Gaps

### OP-01: No LCOS-specific deployment runbook
| Field | Value |
|-------|-------|
| **Domain** | 8. Operations |
| **Matrix ref** | 8.2 |
| **Status** | Open |
| **Owner Capability** | C-01 (Operations Runbook) |
| **Execution Wave** | P0-F1 |
| **Blocks** | — |
| **Blocked by** | P0-D2 (seed script), P0-D1 (health checks for verification) |
| **Verification** | `npx tsc --noEmit` · `npm run build` · file exists at `docs/runbooks/localcontentos-deployment-runbook.md` · operator can follow runbook successfully |
| **Evidence** | No file at `docs/runbooks/localcontentos-*.md` found |
| **Impact** | Production deployment unreliable; dependent on operator tribal knowledge |
| **Suggested fix** | Create `docs/runbooks/localcontentos-deployment-runbook.md` covering: env vars, Prisma migrations, seed data, file storage setup, ERP connector config, post-deploy smoke tests |

### OP-02: LCOS-specific environment variables undocumented
| Field | Value |
|-------|-------|
| **Domain** | 8. Operations |
| **Matrix ref** | 8.3 |
| **Status** | Open |
| **Owner Capability** | C-01 (Operations Runbook) |
| **Execution Wave** | P0-F2 |
| **Blocks** | — |
| **Blocked by** | P0-F1 (runbook references env vars) |
| **Verification** | `npx tsc --noEmit` · `.env.example` updated with all LCOS vars · deployment runbook references full var list |
| **Evidence** | `.env.example` has shared vars only |
| **Impact** | Operators may misconfigure file storage or AI provider routing |
| **Suggested fix** | Document all LCOS env vars in `.env.example` and deployment runbook |

### OP-03: No LCOS-specific backup/restore tested
| Field | Value |
|-------|-------|
| **Domain** | 8. Operations |
| **Matrix ref** | 8.5 |
| **Status** | Open |
| **Owner Capability** | C-01 (Operations Runbook) |
| **Execution Wave** | P0-D3 |
| **Blocks** | P0-F3 (DR plan references restore-drill) |
| **Blocked by** | — |
| **Verification** | `npx tsc --noEmit` · `npm run restore-drill` succeeds with LCOS model counts · row counts match pre-backup snapshot |
| **Evidence** | Restore drill script references shared models only |
| **Impact** | Data loss if LCOS data cannot be restored from backup |
| **Suggested fix** | Extend restore-drill to spot-check LCOS model row counts; document in deployment runbook |

### OP-04: No disaster recovery plan
| Field | Value |
|-------|-------|
| **Domain** | 8. Operations |
| **Matrix ref** | 8.6 |
| **Status** | Open |
| **Owner Capability** | C-01 (Operations Runbook) |
| **Execution Wave** | P0-F3 |
| **Blocks** | — |
| **Blocked by** | P0-D3 (restore-drill extended for LCOS) |
| **Verification** | `npx tsc --noEmit` · DR plan exists at `docs/runbooks/localcontentos-dr-plan.md` · RPO/RTO clearly defined |
| **Evidence** | No DR documentation found in `docs/` |
| **Impact** | Extended downtime in disaster scenario |
| **Suggested fix** | Define RPO/RTO for LCOS; document recovery procedure in runbook; test failover if infrastructure permits |

### OP-05: No LCOS-specific health checks
| Field | Value |
|-------|-------|
| **Domain** | 8. Operations |
| **Matrix ref** | 8.7 |
| **Status** | Open |
| **Owner Capability** | C-02 (Observability) |
| **Execution Wave** | P0-D1 |
| **Blocks** | P2-03 (health dashboard depends on health endpoint) |
| **Blocked by** | — |
| **Verification** | `npx tsc --noEmit` · `npm run build` · `curl /api/health/ready` returns LCOS dependency states · failing LCOS component marks overall health as unhealthy |
| **Evidence** | Files at `src/app/api/health/`, `src/app/api/integration/health/`, `src/app/api/platform/enterprise-health/`, `src/app/api/monitoring/health/` — none reference LocalContentOS |
| **Impact** | Cannot monitor LCOS service health independently; LCOS degradation invisible to operators |
| **Suggested fix** | Extend `/api/health/ready` or create `/api/local-content/health` with LCOS-specific checks: ERP connector state, workbook engine health, LCOS model count sanity |

### MO-01: No application metrics infrastructure
| Field | Value |
|-------|-------|
| **Domain** | 9. Monitoring & Observability |
| **Matrix ref** | 9.1 |
| **Status** | Open |
| **Owner Capability** | C-02 (Observability) |
| **Execution Wave** | P1-B2 |
| **Blocks** | P2-03 (health dashboard depends on metrics), P1-B4 (alert rules) |
| **Blocked by** | P1-B1 (structured logging provides data context for metrics) |
| **Verification** | `npx tsc --noEmit` · Prometheus-compatible metrics endpoint available · LCOS-specific metrics visible (request rate, error rate, latency P50/P95/P99) |
| **Evidence** | No metrics config in repository |
| **Impact** | Cannot measure SLO compliance; blind to degradation |
| **Suggested fix** | Integrate platform-level metrics infrastructure. At minimum: request rate, error rate, latency P50/P95/P99 for LCOS API routes |

### MO-02: No distributed tracing
| Field | Value |
|-------|-------|
| **Domain** | 9. Monitoring & Observability |
| **Matrix ref** | 9.2 |
| **Status** | Open |
| **Owner Capability** | C-02 (Observability) |
| **Execution Wave** | P2 (strategic — shared Core effort) |
| **Blocks** | — |
| **Blocked by** | P1-B1 (structured logging provides foundation for trace correlation) |
| **Verification** | OpenTelemetry traces available for LCOS server actions · trace spans visible in monitoring backend |
| **Evidence** | No tracing libraries in package.json dependencies |
| **Impact** | Debugging AI pipeline latency issues requires manual log spelunking |
| **Suggested fix** | Add OpenTelemetry instrumentation to server actions and AI pipeline (shared Core effort) |

### MO-04: No production health dashboard
| Field | Value |
|-------|-------|
| **Domain** | 9. Monitoring & Observability |
| **Matrix ref** | 9.5 |
| **Status** | Open |
| **Owner Capability** | C-02 (Observability) |
| **Execution Wave** | P2-03 (strategic) |
| **Blocks** | — |
| **Blocked by** | P0-D1 (health checks), P1-B2 (metrics data) |
| **Verification** | Health dashboard shows live health check results, request rate, error rate · red indicators trigger investigation |
| **Evidence** | `/local-content/pilot-readiness` exists but measures operational readiness, not system health |
| **Impact** | Operations team has no single-pane-of-glass for LCOS health |
| **Suggested fix** | Create production health view showing: recent error count, avg latency, active users, pending AI runs, storage usage |

### MO-05: No alerting rules
| Field | Value |
|-------|-------|
| **Domain** | 9. Monitoring & Observability |
| **Matrix ref** | 9.6 |
| **Status** | Open |
| **Owner Capability** | C-02 (Observability) |
| **Execution Wave** | P2 (strategic) |
| **Blocks** | — |
| **Blocked by** | P1-B2 (metrics endpoint provides data for alerts) |
| **Verification** | Alert rules defined · AI pipeline failure, scoring engine errors, evidence upload failures, API error rate spikes trigger alerts |
| **Evidence** | No alerting config in repository |
| **Impact** | Outages detected by user reports, not automated monitoring |
| **Suggested fix** | Define alert rules for: AI pipeline failure rate >5%, scoring engine errors, evidence upload failures, API error rate spikes |

### PF-01: No page load benchmarks
| Field | Value |
|-------|-------|
| **Domain** | 10. Performance |
| **Matrix ref** | 10.1 |
| **Status** | Open |
| **Owner Capability** | C-03 (Performance & Reliability) |
| **Execution Wave** | P2 (strategic) |
| **Blocks** | — |
| **Blocked by** | P0-E (UX stabilization — benchmarks need stable page state) |
| **Verification** | Lighthouse CI or Playwright timing data available · SLO targets documented |
| **Evidence** | No benchmark data in repository |
| **Impact** | Can't detect regressions; unknown if pages are performant for production users |
| **Suggested fix** | Establish page load benchmarks using Lighthouse CI or Playwright timing; document SLO targets |

### PF-03: Scoring engine performance untested
| Field | Value |
|-------|-------|
| **Domain** | 10. Performance |
| **Matrix ref** | 10.3 |
| **Status** | Open |
| **Owner Capability** | C-03 (Performance & Reliability) |
| **Execution Wave** | P2 (strategic) |
| **Blocks** | — |
| **Blocked by** | P0-A (validation stabilizes scoring engine inputs) |
| **Verification** | Benchmark test creates 100+ workbook lines, 50+ suppliers, 500+ spend records · scoring completes within acceptable threshold |
| **Evidence** | Workbook engine tests use small datasets |
| **Impact** | User-facing scoring recalculation may be slow with real customer data |
| **Suggested fix** | Create benchmark test for scoring engine with large dataset; optimize if needed |

### PF-06: No concurrent user load testing
| Field | Value |
|-------|-------|
| **Domain** | 10. Performance |
| **Matrix ref** | 10.6 |
| **Status** | Open |
| **Owner Capability** | C-03 (Performance & Reliability) |
| **Execution Wave** | P2 (strategic) |
| **Blocks** | — |
| **Blocked by** | P0-D1 (health checks provide baseline), P0-B (RBAC ensures load is permissioned) |
| **Verification** | Load test script available · critical paths: project list, workbook scoring, evidence download, AI review tested at N concurrent users |
| **Evidence** | No load test scripts in repository |
| **Impact** | Risk of cascading failure under load |
| **Suggested fix** | Run load tests (k6/artillery) on critical paths: project list, workbook scoring, evidence download, AI review |

### SC-01A: Server action input validation — standard and infrastructure ✅ CLOSED

| Field | Value |
|-------|-------|
| **Domain** | 7. Security |
| **Matrix ref** | 7.4 (partial) |
| **Status** | **Resolved** |
| **Owner Capability** | C-04 (Security Hardening) |
| **Execution Wave** | P0-A1 |
| **Blocks** | — |
| **Blocked by** | — |
| **Verification** | `npx tsc --noEmit` ✅ · `npm run build` ✅ · `npm test` ✅ (3120/3141 pass, 1 pre-existing) |
| **Evidence** | `P0-A1_validation-inventory.md`, `P0-A2_validation-standard.md`, `P0-A3_implementation-report.md`. All at `docs/programs/localcontentos-production-readiness/` |
| **Description** | Validation standard, schema library (11 domain directories), `parseOrError()` helper, and 17/19 critical entry points retrofitted with Zod. P0-A program (Inventory → Standard → Implementation) executed 2026-06-27. |
| **Close criteria** | ✅ Validation Standard defined · ✅ Schema library built · ✅ 17/19 entry points done · ✅ All validations pass |

### SC-01B: Workbook action validation — blocked by RB-02

| Field | Value |
|-------|-------|
| **Domain** | 7. Security |
| **Matrix ref** | 7.4 (partial) |
| **Status** | **Blocked** |
| **Owner Capability** | C-04 (Security Hardening) |
| **Execution Wave** | P0-B3 (after RB-02 + RB-03 resolved) |
| **Blocks** | — |
| **Blocked by** | **RB-02** — workbook actions (`createWorkbookAction`, `populateWorkbookAction`) use document-level `LcSheetImport` types whose schema depends on RBAC role resolution. Adding Zod without auth context would be premature. |
| **Verification** | `npx tsc --noEmit` · `npm run build` · `npm test` · trace `createWorkbookAction` + `populateWorkbookAction` with invalid input |
| **Evidence** | `src/actions/localcontent-workbook-actions.ts` — both actions use loose `unknown` input with `LcSheetImport` type assertion only |
| **Impact** | Workbook mutations may accept malformed `LcSheetImport` input; risk reduced (these are admin/specialist tools, not end-user forms) |
| **Suggested fix** | 1. Close RB-02 and RB-03 (systematic RBAC matrix). 2. Define which roles can create/populate workbooks and what constraints apply per role. 3. Add `parseOrError()` + workbook-specific Zod schema to both actions. |

### RB-01: Tenant isolation audit — 21 exploitation paths found ✅ RESOLVED

| Field | Value |
|-------|-------|
| **Domain** | 4. Authorization & RBAC |
| **Matrix ref** | 4.4 |
| **Status** | **✅ Resolved** |
| **Owner Capability** | C-05 (RBAC Audit) |
| **Execution Wave** | P0-B1 (audit) → P0-B2A (4 remediation waves + 1 proof wave) |
| **Blocks** | — (resolved) |
| **Blocked by** | — |
| **Verification** | **Zero Tenant Leakage Gate: ✅ PASS** — all 7 criteria GREEN. 5-wave remediation complete. B2A-5 operational proof: **14/14 ALL PASS** (Layer 1: 5/5 server actions blocked, Layer 2: 9/9 queries scoped). See `RB-01/B2A-5/RESULTS.md`. |
| **Evidence** | Full evidence package at `RB-01/`:<br>• 4 remediation waves (B2A-1 through B2A-4) each with independent evidence packages<br>• B2A-5 operational proof: 14/14 tests pass (5 server action paths blocked + 9 query scoping verified)<br>• ATTACK_MATRIX.md: 21 rows Before=SUCCESS / After=BLOCKED<br>• All 4 Regression Guards pass (B2A-1: 27/27, B2A-2: 16/16, B2A-3: 29/29, B2A-4: 14/14)<br>• Program Closure: `RB-01/RB-01_PROGRAM_CLOSURE.md` |
| **Impact** | **Resolved.** Zero Tenant Leakage confirmed. 53 verification points across 4 layers (Action→Guard→Library→Prisma). 14 caller-scoped items documented as technical debt. RB-02 is unblocked. |
| **Suggested fix** | ✅ Complete. See RB-01 Program Closure for closure declaration. |

### DI-02: No seed script for LCOS development environments
| Field | Value |
|-------|-------|
| **Domain** | 2. Data Model & Integrity |
| **Matrix ref** | 2.8 |
| **Status** | Open |
| **Owner Capability** | C-07 (Data Integrity) |
| **Execution Wave** | P0-D2 |
| **Blocks** | P0-F1 (deployment runbook references seed script) |
| **Blocked by** | — |
| **Verification** | `npm run seed:localcontent` creates demonstrable LCOS environment from scratch · reviewer can navigate workbooks, view suppliers, see scores |
| **Evidence** | `prisma/seed.ts` has AuditOS seeds only |
| **Impact** | Slow developer onboarding; impossible to demo from clean state |
| **Suggested fix** | Create seed script `prisma/seed-localcontent.ts` with: 1 project (شركة الابتكار التقني), 3 suppliers, 5 spend records, 1 workbook with 20 lines, 1 AI review run, 3 pattern suggestions |

---

### SC-04: AI provider auth review
| Field | Value |
|-------|-------|
| **Domain** | 7. Security |
| **Matrix ref** | 7.11 |
| **Status** | Open |
| **Owner Capability** | C-04 (Security Hardening) |
| **Execution Wave** | P0-F4 |
| **Blocks** | P2-02 (AI governance documentation references auth setup) |
| **Blocked by** | P0-F1 (documentation in runbook) |
| **Verification** | `npx tsc --noEmit` · security review confirms no AI provider keys leak to client · provider auth setup documented in deployment runbook |
| **Evidence** | AI provider config exists; LCOS AI call auth not separately reviewed from platform AI |
| **Impact** | AI provider keys could be exposed in client bundles if routing is misconfigured |
| **Suggested fix** | Verify AI provider keys used by LCOS AI advisor are stored server-side only, not exposed in client bundles. Document provider routing and auth setup in deployment runbook. |

---

## Medium-Severity Gaps

### FC-01: ERP connectors untested with real instances
| Field | Value |
|-------|-------|
| **Domain** | 1. Functional Completeness |
| **Matrix ref** | 1.17 |
| **Status** | Open |
| **Owner Capability** | C-09 (Functional Completeness) |
| **Execution Wave** | P2 (strategic) |
| **Blocks** | — |
| **Blocked by** | — |
| **Verification** | Integration test suite with mock ERP responses · ERP setup procedure documented in deployment runbook |
| **Evidence** | Connector interfaces exist; no real-instance test evidence |
| **Impact** | ERP integration may fail in production with real credentials |
| **Suggested fix** | Create integration test suite with mock ERP responses; document ERP setup procedure |

### FC-02: Content Studio has documented tech debt (R-03)
| Field | Value |
|-------|-------|
| **Domain** | 1. Functional Completeness |
| **Matrix ref** | 1.18 |
| **Status** | Open |
| **Owner Capability** | C-09 (Functional Completeness) |
| **Execution Wave** | P2 (strategic) |
| **Blocks** | — |
| **Blocked by** | — |
| **Verification** | R-03 schema drift resolved · Content Studio routes have adequate test coverage |
| **Evidence** | R-03 documented in security hardening pass reports; 2 test files only |
| **Impact** | Content Studio may have undiagnosed issues |
| **Suggested fix** | Resolve R-03 schema drift; add test coverage for Content Studio routes |

### DI-01: Tenant isolation — 21 exploitation paths (shared with RB-01) ✅ RESOLVED
| Field | Value |
|-------|-------|
| **Domain** | 2. Data Model & Integrity |
| **Matrix ref** | 2.7 |
| **Status** | **✅ Resolved** (remediation via RB-01 B2A waves) |
| **Owner Capability** | C-07 (Data Integrity) |
| **Execution Wave** | P0-B1 (audit) → P0-B2A (remediation) |
| **Blocks** | — |
| **Blocked by** | — |
| **Verification** | Zero Tenant Leakage Gate: ✅ PASS. B2A-5 operational proof: 14/14 ALL PASS. |
| **Evidence** | See RB-01 evidence package for full findings + remediation. `RB-01/B2A-5/RESULTS.md` for proof results. |
| **Impact** | Resolved. Zero Tenant Leakage confirmed. |
| **Suggested fix** | ✅ Complete. See RB-01 Program Closure for closure declaration. |

### DI-03: JSON fields lack schema validation
| Field | Value |
|-------|-------|
| **Domain** | 2. Data Model & Integrity |
| **Matrix ref** | 2.10 |
| **Status** | Open |
| **Owner Capability** | C-07 (Data Integrity) |
| **Execution Wave** | P0-C3 |
| **Blocks** | — |
| **Blocked by** | P0-A1 (Zod infrastructure), P0-B (RBAC ensures only authorized writes) |
| **Verification** | `npx tsc --noEmit` · `npm run build` · invalid JSON field content rejected at action boundary with clear error |
| **Evidence** | Prisma schema shows Json type on metadata, evidence, parameters, drivers, assumptions fields |
| **Impact** | Malformed JSON can be stored and cause runtime errors on read |
| **Suggested fix** | Add Zod schemas for JSON field types; validate before write in server actions |

### WM-01: State transitions not fully verified server-side
| Field | Value |
|-------|-------|
| **Domain** | 3. Workflow & State Management |
| **Matrix ref** | 3.8 |
| **Status** | Open |
| **Owner Capability** | C-06 (Workflow Integrity) |
| **Execution Wave** | P2 (strategic) |
| **Blocks** | — |
| **Blocked by** | — |
| **Verification** | All state machines (project, workbook, evidence, finding, review) have complete transition matrix · edge cases guarded |
| **Evidence** | `workflow-gating.ts` covers major transitions; edge cases not tested |
| **Impact** | Possible invalid state transitions in edge cases |
| **Suggested fix** | Audit all state machines for complete transition matrix; add guards for missing edges |

### WM-02: No formal state machine tests
| Field | Value |
|-------|-------|
| **Domain** | 3. Workflow & State Management |
| **Matrix ref** | 3.10 |
| **Status** | Open |
| **Owner Capability** | C-06 (Workflow Integrity) |
| **Execution Wave** | P2 (strategic) |
| **Blocks** | — |
| **Blocked by** | P2 — WM-01 (transition matrix needed first) |
| **Verification** | `state-machine.test.ts` exists · validates that specific transitions are allowed/rejected per model |
| **Evidence** | No `state-machine.test.ts` exists |
| **Impact** | State machine bugs may go undetected until production |
| **Suggested fix** | Add state machine unit tests for each LCOS model with state: project, workbook, evidence, finding, review |

### RB-02: No systematic RBAC matrix for LCOS roles ⏸ BLOCKS SC-01B

| Field | Value |
|-------|-------|
| **Domain** | 4. Authorization & RBAC |
| **Matrix ref** | 4.5 |
| **Status** | **Planning Active / Execution Locked (RB-01 ✅ Resolved — unblocked)** |
| **Owner Capability** | C-05 (RBAC Audit) |
| **Execution Wave** | P0-B2B (after B2A gate = ✅ PASS, before RB-03) |
| **Blocks** | **SC-01B** — workbook actions (`createWorkbookAction`, `populateWorkbookAction`). Also blocks RB-03 (permission granularity depends on RBAC matrix). |
| **Blocked by** | — (RB-01 ✅ Resolved — tenant isolation proven. See `RB-01/B2A-5/RESULTS.md` for proof, `RB-01/RB-01_PROGRAM_CLOSURE.md` for closure.) |
| **Verification** | `npx tsc --noEmit` · `npm run build` · RBAC audit matrix document published · automated test verifying role enforcement on sampled actions |
| **Evidence** | Role definitions exist in auth system (`src/lib/auth/`); no LCOS-specific RBAC documentation yet. `src/actions/localcontent-workbook-actions.ts` lacks role-based input constraints. RB-01 audit provides the action inventory. |
| **Impact** | Users may access actions they shouldn't, or be blocked from actions they need. **Blocks SC-01B** — cannot add Zod validation to workbook actions without RBAC resolving role-based input constraints. |
| **Suggested fix** | 1. Design RBAC matrix for ALL LCOS actions (planning can start). 2. Implement role guards in action files. 3. Document in runbook. 4. Include workbook-specific role-constrained schemas. |

### RB-03: Inconsistent server action permission granularity
| Field | Value |
|-------|-------|
| **Domain** | 4. Authorization & RBAC |
| **Matrix ref** | 4.8 |
| **Status** | Open |
| **Owner Capability** | C-05 (RBAC Audit) |
| **Execution Wave** | P0-B2B-02 (after RBAC matrix design) |
| **Blocks** | — |
| **Blocked by** | P0-B2B (RBAC matrix defines required roles per action) |
| **Verification** | `npx tsc --noEmit` · `npm run build` · every LCOS mutation action enforces role + tenant guards · guard pattern documented in runbook |
| **Evidence** | Permission patterns vary across LCOS action files |
| **Impact** | Inconsistent enforcement; some actions may be more permissive than intended |
| **Suggested fix** | Audit all action files; apply consistent permission guard pattern |

### AE-01: No audit retention/disposal policy
| Field | Value |
|-------|-------|
| **Domain** | 5. Audit & Evidence |
| **Matrix ref** | 5.8 |
| **Status** | Open |
| **Owner Capability** | C-08 (Audit & Evidence Hardening) |
| **Execution Wave** | P1-A1 |
| **Blocks** | — |
| **Blocked by** | P0-F1 (runbook reference), P0-B2B (RBAC defines who can configure retention) |
| **Verification** | `npx tsc --noEmit` · audit events older than retention period auto-archived · policy documented in deployment runbook |
| **Evidence** | No retention-related logic in audit modules |
| **Impact** | Storage growth; regulatory non-compliance if retention requirements exist |
| **Suggested fix** | Define retention period (e.g., 7 years for audit data); implement cleanup job |

### AE-02: No dedicated audit export API
| Field | Value |
|-------|-------|
| **Domain** | 5. Audit & Evidence |
| **Matrix ref** | 5.9 |
| **Status** | Open |
| **Owner Capability** | C-08 (Audit & Evidence Hardening) |
| **Execution Wave** | P1-A2 |
| **Blocks** | — |
| **Blocked by** | P0-B2B (RBAC context for permissions) |
| **Verification** | `npx tsc --noEmit` · project admin can download audit CSV · events sorted by timestamp · non-admin users receive 403 |
| **Evidence** | `/local-content/projects/[projectId]/audit-trail` is browser-only |
| **Impact** | Auditors cannot easily export audit trails |
| **Suggested fix** | Add audit export endpoint generating CSV or PDF of project audit events |

### AG-01: AI provider dependency for non-deterministic features
| Field | Value |
|-------|-------|
| **Domain** | 6. AI Governance |
| **Matrix ref** | 6.10 |
| **Status** | Open |
| **Owner Capability** | C-10 (AI Governance) |
| **Execution Wave** | P2-02 |
| **Blocks** | — |
| **Blocked by** | P0-F4 (AI auth review), P0-F1 (runbook reference) |
| **Verification** | AI provider dependencies documented · graceful degradation verified in AI advisor UI · users see clear messages when cloud AI is unavailable |
| **Evidence** | AIOrchestrator handles provider selection; LCOS AI currently uses deterministic path |
| **Impact** | Advanced AI features unavailable without cloud provider keys |
| **Suggested fix** | Document AI provider requirements; ensure graceful degradation when cloud AI unavailable |

### SC-02: Incomplete file upload validation
| Field | Value |
|-------|-------|
| **Domain** | 7. Security |
| **Matrix ref** | 7.5 |
| **Status** | Open |
| **Owner Capability** | C-04 (Security Hardening) |
| **Execution Wave** | P0-B4 (after RBAC implementation + workbook validation) |
| **Blocks** | — |
| **Blocked by** | P0-B2B (RBAC ensures only authorized users can upload) |
| **Verification** | `npx tsc --noEmit` · upload non-whitelisted MIME type → rejected · file exceeding size limit → rejected · checksum stored alongside evidence |
| **Evidence** | File upload logic in `file-repository.ts` has basic validation only |
| **Impact** | Risk of malicious file upload; storage of non-compliant content |
| **Suggested fix** | Add file magic byte validation; integrate ClamAV scanning (scanner provider configured in hardening pass) |

### SC-03: No explicit CORS policy for LCOS API routes
| Field | Value |
|-------|-------|
| **Domain** | 7. Security |
| **Matrix ref** | 7.10 |
| **Status** | Open |
| **Owner Capability** | C-04 (Security Hardening) |
| **Execution Wave** | P0-C2 |
| **Blocks** | — |
| **Blocked by** | — |
| **Verification** | `npx tsc --noEmit` · API routes return correct CORS headers for configured origins · non-permitted origins receive 403 |
| **Evidence** | API routes use Next.js defaults |
| **Impact** | Potential CORS misconfiguration in production |
| **Suggested fix** | Add explicit CORS headers to API download routes |

### UX-01: Incomplete empty states
| Field | Value |
|-------|-------|
| **Domain** | 11. UX & Accessibility |
| **Matrix ref** | 11.3 |
| **Status** | Open |
| **Owner Capability** | C-11 (UX Consistency) |
| **Execution Wave** | P0-E1 |
| **Blocks** | — |
| **Blocked by** | — |
| **Verification** | `npx tsc --noEmit` · every LCOS list page shows helpful empty state with Arabic + English text and CTA button |
| **Evidence** | Projects and suppliers checked; other pages uncertain |
| **Impact** | Users may see blank pages instead of helpful empty state messages |
| **Suggested fix** | Audit all LCOS list pages for empty states; add where missing |

### UX-02: Inconsistent error handling
| Field | Value |
|-------|-------|
| **Domain** | 11. UX & Accessibility |
| **Matrix ref** | 11.4 |
| **Status** | Open |
| **Owner Capability** | C-11 (UX Consistency) |
| **Execution Wave** | P0-E2 |
| **Blocks** | P0-E3 (loading states depend on error pattern) |
| **Blocked by** | P0-A1 (consistent action return types `{success, message}`) |
| **Verification** | `npx tsc --noEmit` · every LCOS server action failure shows user-facing notification · messages actionable in Arabic + English |
| **Evidence** | Error boundary at route level; action error handling varies |
| **Impact** | Users may see technical error messages or silent failures |
| **Suggested fix** | Standardize error display pattern: server actions return structured errors → toast/notification UI |

### UX-04: Mobile responsiveness not tested
| Field | Value |
|-------|-------|
| **Domain** | 11. UX & Accessibility |
| **Matrix ref** | 11.9 |
| **Status** | Open |
| **Owner Capability** | C-11 (UX Consistency) |
| **Execution Wave** | P0-E4 |
| **Blocks** | — |
| **Blocked by** | — |
| **Verification** | `npx tsc --noEmit` · LCOS pages render correctly at 375px, 768px, 1024px · no horizontal scrolling · key workflows usable on mobile |
| **Evidence** | No mobile-specific CSS or testing |
| **Impact** | Mobile users may have broken layout |
| **Suggested fix** | Test LCOS pages on mobile viewport; fix responsive layout issues |

### UX-05: Inconsistent server action feedback
| Field | Value |
|-------|-------|
| **Domain** | 11. UX & Accessibility |
| **Matrix ref** | 11.11 |
| **Status** | Open |
| **Owner Capability** | C-11 (UX Consistency) |
| **Execution Wave** | P0-E3 |
| **Blocks** | — |
| **Blocked by** | P0-E2 (error pattern reused for success feedback) |
| **Verification** | `npx tsc --noEmit` · every async operation shows loading indicator · every mutation shows success/failure feedback in Arabic |
| **Evidence** | Action return types vary across files |
| **Impact** | UI cannot consistently display action results |
| **Suggested fix** | Standardize action return pattern: `{ success: boolean, message?: string, data?: T }` |

---

## Nice-to-Have Gaps

### CR-02: Pricing model undefined
| Field | Value |
|-------|-------|
| **Domain** | 12. Commercial Readiness |
| **Matrix ref** | 12.2 |
| **Status** | Open |
| **Owner Capability** | C-12 (Commercial Readiness) |
| **Execution Wave** | P1-A3 (commercial readiness document) |
| **Blocks** | — |
| **Blocked by** | — |
| **Verification** | P1-A3 commercial readiness document covers pricing model proposal |
| **Evidence** | No pricing documentation |
| **Impact** | Cannot sell LCOS without defined pricing |
| **Suggested fix** | Define per-seat, per-workspace, or enterprise pricing |

### CR-03: Packaging undefined
| Field | Value |
|-------|-------|
| **Domain** | 12. Commercial Readiness |
| **Matrix ref** | 12.3 |
| **Status** | Open |
| **Owner Capability** | C-12 (Commercial Readiness) |
| **Execution Wave** | P1-A3 (commercial readiness document) |
| **Blocks** | — |
| **Blocked by** | — |
| **Verification** | P1-A3 commercial readiness document covers packaging tiers |
| **Evidence** | No packaging documentation |
| **Impact** | Unclear how customers buy LCOS |
| **Suggested fix** | Define packaging options (standalone vs bundle vs module) |

### CR-04: No SLA targets
| Field | Value |
|-------|-------|
| **Domain** | 12. Commercial Readiness |
| **Matrix ref** | 12.4 |
| **Status** | Open |
| **Owner Capability** | C-12 (Commercial Readiness) |
| **Execution Wave** | P1-A3 (commercial readiness document) |
| **Blocks** | — |
| **Blocked by** | — |
| **Verification** | P1-A3 commercial readiness document covers SLA tiers |
| **Evidence** | No SLA documentation |
| **Impact** | No contractual service guarantees |
| **Suggested fix** | Define SLA tiers (Standard/Premium/Enterprise) |

### CR-06: No demo/sandbox environment
| Field | Value |
|-------|-------|
| **Domain** | 12. Commercial Readiness |
| **Matrix ref** | 12.6 |
| **Status** | Open |
| **Owner Capability** | C-12 (Commercial Readiness) |
| **Execution Wave** | P1-A3 (commercial readiness document) |
| **Blocks** | — |
| **Blocked by** | P0-D2 (seed data for sandbox) |
| **Verification** | P1-A3 commercial readiness document covers sandbox access procedure |
| **Evidence** | Demo route exists for AuditOS (/auditos) but not for LCOS |
| **Impact** | No way for prospects to evaluate LCOS |
| **Suggested fix** | Create sandbox deployment config + seed data for demonstrations |

### CR-08: Regulatory compliance mapping missing
| Field | Value |
|-------|-------|
| **Domain** | 12. Commercial Readiness |
| **Matrix ref** | 12.8 |
| **Status** | Open |
| **Owner Capability** | C-12 (Commercial Readiness) |
| **Execution Wave** | P1-A3 (commercial readiness document) |
| **Blocks** | — |
| **Blocked by** | — |
| **Verification** | P1-A3 commercial readiness document covers regulatory compliance matrix |
| **Evidence** | No regulatory mapping document |
| **Impact** | Risk of non-compliance with Saudi local content regulations |
| **Suggested fix** | Document regulatory compliance matrix (Vision 2030 NCAP, Saudization) |

### CR-09: No support contact documented
| Field | Value |
|-------|-------|
| **Domain** | 12. Commercial Readiness |
| **Matrix ref** | 12.10 |
| **Status** | Open |
| **Owner Capability** | C-12 (Commercial Readiness) |
| **Execution Wave** | P1-A3 (commercial readiness document) |
| **Blocks** | — |
| **Blocked by** | — |
| **Verification** | P1-A3 commercial readiness document covers support channels and escalation matrix |
| **Evidence** | No support documentation |
| **Impact** | Customers don't know how to get help |
| **Suggested fix** | Define support tiers and contact channels |

### CR-10: No case studies
| Field | Value |
|-------|-------|
| **Domain** | 12. Commercial Readiness |
| **Matrix ref** | 12.11 |
| **Status** | Open |
| **Owner Capability** | C-12 (Commercial Readiness) |
| **Execution Wave** | P1-A3 (commercial readiness document) |
| **Blocks** | — |
| **Blocked by** | — |
| **Verification** | P1-A3 commercial readiness document includes case study from شركة الابتكار التقني pilot |
| **Evidence** | Pilot data exists but not formatted as case study |
| **Impact** | No social proof for sales conversations |
| **Suggested fix** | Create case study from pilot results |

### MO-06: No suspicious pattern monitoring on audit events
| Field | Value |
|-------|-------|
| **Domain** | 9. Monitoring & Observability |
| **Matrix ref** | 9.7 |
| **Status** | Open |
| **Owner Capability** | C-02 (Observability) |
| **Execution Wave** | P2-01 |
| **Blocks** | — |
| **Blocked by** | P1-B5 (alert infrastructure) |
| **Verification** | Suspicious patterns (rapid failed logins, bulk data export, unusual hours access) trigger audit events visible in monitoring dashboard |
| **Evidence** | Audit events stored; no monitoring consumers |
| **Impact** | Security incidents may go undetected until too late |
| **Suggested fix** | Define and implement audit event monitoring rules |

### OP-07: No structured logging
| Field | Value |
|-------|-------|
| **Domain** | 8. Operations |
| **Matrix ref** | 8.9 |
| **Status** | Open |
| **Owner Capability** | C-02 (Observability) |
| **Execution Wave** | P1-B1 |
| **Blocks** | P1-B2 (metrics), P1-B3 (tracing), P1-B5 (alerts) |
| **Blocked by** | P0-A1 (action boundaries define modules for logging) |
| **Verification** | `npx tsc --noEmit` · all LCOS server actions emit structured JSON logs · logs searchable by module and correlation ID |
| **Evidence** | No structured logging in LCOS modules |
| **Impact** | Debugging production issues requires manual log reading |
| **Suggested fix** | Integrate structured logging library; define log level standards |

---

## Gap Distribution by Domain

> **Note:** SC-01 split → SC-01A (Resolved, removed from counts) + SC-01B (High, Security). DI-01 removed (duplicate of RB-01, cross-reference only).

| Domain | Blockers | High | Medium | Nice | Total |
|--------|:--------:|:----:|:------:|:----:|:-----:|
| 1. Functional Completeness | 0 | 0 | 2 | 0 | 2 |
| 2. Data Model & Integrity | 0 | 1 | 1 | 0 | 2 |
| 3. Workflow & State Management | 0 | 0 | 2 | 0 | 2 |
| 4. Authorization & RBAC | 0 | 0 | 2 | 0 | 2 |
| 5. Audit & Evidence | 0 | 0 | 2 | 0 | 2 |
| 6. AI Governance | 0 | 0 | 1 | 0 | 1 |
| 7. Security | 0 | 3 | 2 | 0 | 5 |
| 8. Operations | 0 | 5 | 0 | 1 | 6 |
| 9. Monitoring & Observability | 0 | 4 | 0 | 1 | 5 |
| 10. Performance | 0 | 3 | 0 | 0 | 3 |
| 11. UX & Accessibility | 0 | 0 | 4 | 0 | 4 |
| 12. Commercial Readiness | 0 | 0 | 0 | 7 | 7 |
| **Total** | **0** | **16** | **16** | **9** | **41** |

---

## Gap Disposition Rules (from Program Charter)

| Severity | Phase | Required Action |
|----------|:-----:|-----------------|
| **Blocker** | — | Must fix before program closure |
| **High** | 2–4 | Should fix; defer only with documented rationale |
| **Medium** | 3–5 | Fix if time permits; defer ok with tracking |
| **Nice-to-have** | — | Document for future; may defer permanently |

### Recommended Phase Allocation

> **Dependency chain:** P0-B1 (RB-01) → Gate: Zero Tenant Leakage → P0-B2 (RB-02, RB-03) → P0-B3 (SC-01B) → P0-B4 (SC-02).

| Phase | Gap IDs |
|:-----:|---------|
| **2 — Security & Operations** | OP-01, OP-02, OP-03, OP-04, OP-05, OP-07, **SC-01A ✅ (Closed)** |
| **3 — Data & RBAC** | DI-02, DI-03, WM-01, WM-02, FC-01, FC-02, **RB-01 (→ P0-B1)**, **RB-02 (→ P0-B2)**, **RB-03 (→ P0-B2)**, **SC-01B (→ P0-B3)**, **SC-02 (→ P0-B4)**, SC-03, AE-01, AE-02, **SC-04 (→ P0-F4)** |
| **4 — Performance & UX** | PF-01, PF-03, PF-06, UX-01, UX-02, UX-04, UX-05 |
| **5 — Commercial & AI** | AG-01, MO-01, MO-02, MO-04, MO-05, MO-06, CR-02, CR-03, CR-04, CR-06, CR-08, CR-09, CR-10 |

---

*Gap Register v2.3. 39 open gaps (0 Blockers, 15 High, 16 Medium, 9 Nice) + 3 Resolved (SC-01A, RB-01, DI-01). **RB-01 RESOLVED (2026-06-28):** 5-wave remediation (B2A-1 through B2A-5): 21 exploitation paths eliminated, Zero Tenant Leakage = ✅ PASS (7/7 GREEN). B2A-5 operational proof: **14/14 ALL PASS**. RB-02 unblocked — planning active, execution gated on B2A-5. Dependency chain: P0-B1 (RB-01, tenant isolation) → **✅ Gate: Zero Tenant Leakage — PASS** → P0-B2B (RB-02, RB-03, RBAC model) → P0-B3 (SC-01B, workbook validation) → P0-B4 (SC-02, upload security). Cross-reference with PRODUCTION_READINESS_MATRIX.md and RB-01/ evidence package.*
