# AQLIYA Current State — Operational Single Source of Truth

**Status:** Active  
**Version:** 1.4  
**Effective:** 2026-06-18

**Authority:** See `docs/source-of-truth/DOCUMENTATION_LINEAGE.md`  
**Full audit:** `docs/audits/truth-reconciliation-2026-06-18/FINAL_TRUTH_RECONCILIATION.md`

---

## Validation snapshot

Evidence: `docs/reports/2026-06-19-final-*.txt`, `docs/reports/2026-06-18-cypress-*.txt`

| Check | Result |
|-------|--------|
| TypeScript | **PASS** — `docs/reports/2026-06-19-final-tsc.txt` |
| Tests | **PASS** — 249 suites, **2462** tests (2026-06-19) |
| Lint | **PASS** — **0 errors**, ~241 warnings |
| Build | **PASS** — 131 routes (re-build 2026-06-18 with SalesOS sidebar) |
| Factory static smoke | **PASS** — 33 checks |
| Local AI smoke | **PASS** — Ollama qwen3:8b |
| TB benchmark (n=100) | **AI 87%** exact, rules 65% |
| Cypress E2E (11 specs) | **161 executed PASS**, **3 pending** (DB seed optional) — `2026-06-18-cypress-full-v2.txt` |

---

## Overall score: **74/100**

Pilot-capable with broad E2E coverage. Staging DNS missing; full AWS audit incomplete.

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
- **SalesOS** L5 pilot-ready — sidebar entry, Prisma seed, product nav (pipeline/deals/accounts/intelligence/activities/reports)
- **LocalContactOS** L5 pilot-ready
- **Institutional Memory** L4 partial — `/institutional-memory/*`, graph, typed actions
- **RiskOS** L4 usable v0.1 — `/risk/*` dashboard (AuditOS models; not standalone product)

### Weak / strategic
- **Organizations** L3 mock
- **Local AI runtime** L4 pilot (operator Ollama required)
- **On-Prem / Air-Gap** L0
- **Enterprise ops** L2→L3 — IaC in repo; see `ENTERPRISE_OPS_CHECKLIST.md`

---

## Recent changes (2026-06-18)

- **SalesOS L5** — platform-sidebar module + sales nav; ProductWorkspaceNotice pilot; seedSalesOS in main seed
- **Cypress** — 11 specs aligned to routes/copy; `cy.loginAdmin()` session; marketing contact/buyers text; optional skip when TB/decision seed missing
- **E2E** — full suite 161/162 pass (3 pending when DB lacks trial-balance lines or tender recommendation seed)

---

## Not verified this cycle

- AWS ECS / RDS / Redis live state (beyond health endpoint)
- Staging DNS — `staging.aqliya.com` ENOTFOUND
- External pen test
- Terraform validate (CLI not on dev machine)
- Sampling generation E2E (requires seeded trial-balance lines)

## Verified 2026-06-18 / 2026-06-19

- Production post-deploy smoke — **28/30 critical PASS**
- Production health — DB ok
- Cypress — audit-os 16/16, auth 9/9, routing-and-gates 39/39, sprint-3-5 28/28, sales-os 24/24, marketing 7/7, local-content 9/9, audit-factory 9/9

---

## Unsupported claims

Do not claim L6, enterprise-ready, On-Prem/Air-Gap packages, autonomous AI, or RiskOS as standalone marketed product.  
Cite test count only with link to `docs/reports/2026-06-19-final-test.txt`.
