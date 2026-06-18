# AQLIYA Current State — Operational Single Source of Truth

**Status:** Active executive operational reference  
**Version:** 1.0  
**Effective:** 2026-06-18  
**Supersedes for status claims:** Ad-hoc audit summaries; partially supersedes stale rows in `PRODUCT_STATUS_AUTHORITY_MATRIX.md` (2026-06-03)

**Authority order (implementation status):**

1. Code + schema at committed HEAD  
2. `docs/reports/*` validation artifacts (timestamped)  
3. This document  
4. `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`  
5. `docs/official/AQLIYA_MASTER_REFERENCE.md` (summary only)

**Doctrine / identity:** unchanged — follow `docs/DOCUMENTATION_AUTHORITY.md` and `docs/official/*`.

---

## Validation snapshot (2026-06-18)

Evidence: [`docs/reports/README.md`](../reports/README.md)

| Check | Result | Artifact |
|-------|--------|----------|
| TypeScript | **PASS** | `docs/reports/2026-06-18-tsc.txt` |
| Tests | **PASS** — 247 suites, **2383** tests, 21 skipped | `docs/reports/2026-06-18-test.txt` |
| Lint | **FAIL** — 3 errors, 234 warnings | `docs/reports/2026-06-18-lint.txt` |
| Build (committed HEAD) | **PASS** | `docs/reports/2026-06-18-build.txt` |
| Build (dirty working tree) | **FAIL** — Prisma schema drift | See caveat below |

**Lint blockers:** `src/actions/contact-actions.ts` lines 523, 576, 621 (`no-explicit-any`).

**Schema caveat:** Uncommitted `prisma/schema.prisma` references `InstitutionalMemoryEvent` / `InstitutionalMemoryCollection` on `User` without model definitions. Revert or complete before merge.

---

## Overall score (Truth Reconciliation v2)

| Dimension | Score | Basis |
|-----------|------:|-------|
| Code + tests | 74 | tsc + 2383 tests pass; lint fail; schema WIP |
| Products (pilot) | 68 | AuditOS + LC strong; mixed elsewhere |
| Documentation truth | 52 | Truth debt in Master Ref + Authority Matrix |
| Enterprise / production ops | 48 | AWS/live DR/pen test **not verified this cycle** |
| **Overall operational reality** | **68–70** | Pilot-capable; not enterprise-ready |

Between **Pilot-Ready** (selected products) and **Enterprise-Ready** (platform ops): **clear gap remains**.

---

## Product layers (verified 2026-06-18)

### Strong — pilot-capable core

| System | Maturity | Evidence |
|--------|----------|----------|
| **AuditOS** | L5 pilot | TB/IFRS/SOCPA/FS/reconciliation engines; 86 factory tests pass; 29 routes |
| **LocalContentOS** | L5 conditional | Workbook, AI advisor, review/quality; LC test suite in full run |
| **AI Core + TB Factory** | L4→L5 conditional | Orchestrator, deterministic default; TB rebenchmark 85% local AI (2026-06-14 JSON) |

### Medium — usable v0.1, not full pilot

| System | Maturity | Evidence |
|--------|----------|----------|
| **DecisionOS** | L4→L5 conditional | Engines + evidence + export |
| **WorkflowOS** | L4 internal | WorkflowRecord, export, audit |
| **Office AI** | L4 shared app | OfficeAiTask persistence |
| **SalesOS** | L4 active-with-caution | 31 routes, Prisma; `@ts-nocheck` debt in v02/vnext |
| **LocalContactOS** | L4→L5 partial | CRUD + governance; lint errors in WIP actions |

### Weak / incomplete / strategic only

| System | Maturity | Evidence |
|--------|----------|----------|
| **Organizations** | L3 mock | Hardcoded `mockOrganizations` |
| **RiskOS** | L3 submodule | `/risk/*` — AuditOS risk models, not standalone product |
| **Institutional Memory** | L3 partial | Service + graph models; schema WIP broken; docs still say L0 in places |
| **Local AI runtime** | L4 pilot (operator) | Ollama smoke PASS; not L6 package; not default-on |
| **On-Prem / Air-Gap** | L0 strategic | Not production packages |
| **Enterprise ops** | L2→L3 | IaC exists; live ECS/RDS/backup restore **unverified** |

---

## Documentation truth debt (must fix)

| Document | Issue | Action |
|----------|-------|--------|
| `PRODUCT_STATUS_AUTHORITY_MATRIX.md` | LocalContactOS/RiskOS/InstMem/Local AI = Future | Sync to this doc |
| `AQLIYA_MASTER_REFERENCE.md` §9 vs §6 | SalesOS + Local AI contradictions | Editorial pass |
| `FINAL_REALITY_AUDIT.md` | build/MFA stale | Mark superseded by 2026-06-18 evidence |
| `TB_CLASSIFICATION_BENCHMARK.md` | Phase 1A only | Banner → REBENCHMARK |

---

## What is NOT verified (honest gaps)

- AWS ECS / RDS / ElastiCache live state  
- Backup restore on production RDS  
- Cypress browser E2E this cycle  
- `local-ai:smoke` / `tb:benchmark` re-run 2026-06-18  
- External penetration test  
- Multi-instance Redis rate limiter in production  

---

## Unsupported commercial claims

Do not claim: L6 production-certified, enterprise-ready, On-Prem/Air-Gap packages, autonomous AI, full SIEM, regulator certification, or "2383 tests" without linking `docs/reports/2026-06-18-test.txt`.

---

## Maintenance

- Regenerate validation artifacts weekly or before any status change.  
- Update this file when PRODUCT_STATUS_MATRIX changes.  
- Link Phase completion rows to `docs/reports/*` files.

**Next doc sync owners:** Master Reference §9, Authority Matrix product table, READINESS_GATES lint baseline.
