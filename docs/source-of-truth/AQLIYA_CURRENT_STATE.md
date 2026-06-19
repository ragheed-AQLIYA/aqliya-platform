# AQLIYA Current State — Operational Single Source of Truth

**Status:** Active  
**Version:** 1.6  
**Effective:** 2026-06-18

**Authority:** See `docs/source-of-truth/DOCUMENTATION_LINEAGE.md`  
**Full audit:** `docs/audits/truth-reconciliation-2026-06-18/FINAL_TRUTH_RECONCILIATION.md`

---

## Validation snapshot

Evidence: `docs/reports/2026-06-18-*`, `docs/reports/2026-06-19-final-*.txt`

| Check | Result |
|-------|--------|
| TypeScript | **PASS** — `docs/reports/2026-06-19-final-tsc.txt` |
| Tests | **PASS** — 249 suites, **2462** tests |
| Lint | **PASS** — **0 errors**, ~241 warnings |
| Build | **PASS** — 131 routes |
| Factory static smoke | **PASS** — 33 checks |
| Local AI smoke | **PASS** — Ollama qwen3:8b |
| TB benchmark (n=100) | **AI 87%** exact, rules 65% |
| Cypress E2E (11 specs) | **162 pass** (incl. sampling 3/3 after `seed:audit`) — `2026-06-18-cypress-full-v2.txt` |
| Production health | **PASS** — `2026-06-18-production-probe.txt` |
| Production smoke | **PASS** — 28/30 critical — `2026-06-18-production-smoke.txt` |
| Staging DNS | **FAIL** — `staging.aqliya.com` ENOTFOUND — `2026-06-18-staging-probe.txt` |

---

## Overall score: **75/100**

Pilot-capable; production verified remotely. Staging DNS missing; AWS live audit blocked (no CLI on dev machine).

---

## Product layers

### Strong (pilot core)
- **AuditOS** L5 — TB/IFRS/SOCPA/FS/reconciliation factory; full seed via `npm run seed:audit` (23 TB lines on eng-gulf-2025)
- **LocalContentOS** L5 conditional
- **AI Core + TB Factory** L4→L5 conditional — Local AI 87% on full benchmark

### Medium
- **DecisionOS** L4→L5 conditional
- **WorkflowOS** L4→L5 conditional
- **SalesOS** L5 pilot-ready — sidebar, seed, Prisma dashboard
- **LocalContactOS** L5 pilot-ready
- **Organizations** L5 pilot-ready — Prisma CRUD, `/organizations/*`, seed (3 orgs)
- **Office AI Assistant** L5 pilot-ready — 7 seeded tasks, review lifecycle
- **Institutional Memory** L4 partial
- **RiskOS** L4 usable v0.1 — `/risk/*` (not standalone product)

### Weak / strategic
- **On-Prem / Air-Gap** L0
- **Enterprise ops** L2→L3 — IaC in repo; production health/smoke verified; staging/AWS CLI checks pending operator

---

## Recent changes (2026-06-18 Phase 3 — local)

- **Organizations L5** — Prisma list/detail, CRUD actions + audit log, 3 seed orgs, loading/error boundaries
- **Office AI L5** — `seed-office-ai.ts` (7 tasks), assistant route boundaries
- **Sales dashboard** — Prisma-backed KPIs (accounts, deals, pipeline stages)

## Recent changes (2026-06-18 Phase 2)

- Production probe re-run — HTTP 200, DB ok (commit `da2e2fb` deployed)
- Production post-deploy smoke — 28/30 critical PASS
- Staging probe — DNS ENOTFOUND (blocker for staging smoke)
- `npm run seed:audit` — 23 TB lines for eng-gulf-2025 (sampling E2E precondition)
- `staging-probe.mjs` — Windows exit fix (libuv crash)

---

## Operator blockers (Phase 3)

| Item | Status |
|------|--------|
| Terraform validate | **BLOCKED** — CLI not installed locally |
| AWS ECS/RDS/Redis | **BLOCKED** — AWS CLI not on dev machine |
| Restore drill on live RDS | **NOT RUN** — requires staging/prod access |
| Staging DNS + smoke | **BLOCKED** — ENOTFOUND |
| External pen test | **NOT SCHEDULED** |

---

## Unsupported claims

Do not claim L6, enterprise-ready, On-Prem/Air-Gap packages, autonomous AI, or RiskOS as standalone marketed product.
