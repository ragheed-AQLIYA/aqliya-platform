# AQLIYA Current State — Operational Single Source of Truth

**Status:** Active  
**Version:** 1.3  
**Effective:** 2026-06-19

**Authority:** See `docs/source-of-truth/DOCUMENTATION_LINEAGE.md`  
**Full audit:** `docs/audits/truth-reconciliation-2026-06-18/FINAL_TRUTH_RECONCILIATION.md`

---

## Validation snapshot

Evidence: `docs/reports/2026-06-19-final-*.txt` (+ 2026-06-18 benchmark/smoke)

| Check | Result |
|-------|--------|
| TypeScript | **PASS** — `docs/reports/2026-06-19-final-tsc.txt` |
| Tests | **PASS** — 249 suites, **2462** tests (re-run 2026-06-19) |
| Lint | **PASS** — **0 errors**, ~241 warnings — `2026-06-19-final-lint.txt` |
| Build | **PASS** — 131 pages — `docs/reports/2026-06-19-final-build.txt` |
| Factory static smoke | **PASS** — 33 checks |
| Local AI smoke | **PASS** — Ollama qwen3:8b |
| TB benchmark (n=100) | **AI 87%** exact, rules 65% |

---

## Overall score: **72/100**

Pilot-capable; production health endpoint verified. Staging DNS missing; full AWS audit incomplete.

---

## Product layers

### Strong (pilot core)
- **AuditOS** L5 — TB/IFRS/SOCPA/FS/reconciliation factory + 86 targeted tests
- **LocalContentOS** L5 conditional — workbook, AI advisor, review/quality
- **AI Core + TB Factory** L4→L5 conditional — Local AI 87% on full benchmark

### Medium
- **DecisionOS** L4→L5 conditional
- **WorkflowOS** L4→L5 conditional
- **Office AI** L4 shared app
- **SalesOS** L4 active-with-caution
- **LocalContactOS** L5 pilot-ready
- **Institutional Memory** L4 partial — `/institutional-memory/*`, graph, typed actions
- **RiskOS** L4 usable v0.1 — `/risk/*` dashboard, KPIs, seed model/assessment (AuditOS models; not standalone product)

### Weak / strategic
- **Organizations** L3 mock
- **Local AI runtime** L4 pilot (operator Ollama required)
- **On-Prem / Air-Gap** L0
- **Enterprise ops** L2→L3 — IaC in repo; see `ENTERPRISE_OPS_CHECKLIST.md`

---

## Recent changes (2026-06-19)

- RiskOS dashboard rewrite — KPI cards, distribution chart, assessments table, `getRiskDashboardStatsAction`
- Seed: AuditRiskModel + Assessment + 2 Procedures
- Sidebar: مخاطر المنشأة link

---

## Not verified this cycle

- AWS ECS / RDS / Redis live state (beyond health endpoint)
- Staging DNS — `staging.aqliya.com` ENOTFOUND
- Cypress E2E — **28/28 PASS** sprint-3-5 (`2026-06-19-cypress-sprint-3-5.txt`)
- External pen test
- Terraform validate (CLI not on dev machine)

## Verified 2026-06-19

- Production post-deploy smoke — **28/30 critical PASS** (`2026-06-19-production-smoke.txt`)
- Production health — DB ok (`2026-06-19-production-probe.txt`)
- Build at HEAD — **131 routes PASS** (`2026-06-19-final-build.txt`)

---

## Unsupported claims

Do not claim L6, enterprise-ready, On-Prem/Air-Gap packages, autonomous AI, or RiskOS as standalone marketed product.  
Cite test count only with link to `docs/reports/2026-06-19-final-test.txt`.
