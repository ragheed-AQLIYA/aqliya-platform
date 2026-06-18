# AQLIYA Current State — Operational Single Source of Truth

**Status:** Active  
**Version:** 1.1  
**Effective:** 2026-06-18 (Truth Reconciliation completion pass)

**Authority:** See `docs/source-of-truth/DOCUMENTATION_LINEAGE.md`

---

## Validation snapshot (2026-06-18 final)

Evidence: `docs/reports/2026-06-18-final-*.txt`

| Check | Result |
|-------|--------|
| TypeScript | **PASS** (after build; see final-tsc.txt) |
| Tests | **PASS** — 247 suites, **2383** tests, 21 skipped |
| Lint | **PASS** — **0 errors**, ~240 warnings |
| Build | **PASS** — 131 pages, institutional-memory routes included |

---

## Overall score: **70/100**

Pilot-capable for AuditOS + LocalContentOS. Not enterprise-production-ready (live AWS/DR unverified).

---

## Product layers

### Strong (pilot core)
- **AuditOS** L5 — TB/IFRS/SOCPA/FS/reconciliation factory + 86 targeted tests
- **LocalContentOS** L5 conditional — workbook, AI advisor, review/quality
- **AI Core + TB Factory** L4→L5 conditional

### Medium
- **DecisionOS** L4→L5 conditional
- **WorkflowOS** L4 internal
- **Office AI** L4 shared app
- **SalesOS** L4 active-with-caution
- **LocalContactOS** L4→L5 partial
- **Institutional Memory** L4 partial — `/institutional-memory/*`, Prisma models, typed actions

### Weak / strategic
- **Organizations** L3 mock
- **RiskOS** L3 submodule (`/risk/*`)
- **Local AI** L4 pilot (operator; smoke evidence 2026-06-16)
- **On-Prem / Air-Gap** L0
- **Enterprise ops** L2→L3 (IaC exists; live unverified)

---

## Truth debt closed (2026-06-18)

- `PRODUCT_STATUS_AUTHORITY_MATRIX.md` reconciled
- `AQLIYA_MASTER_REFERENCE.md` §9/§13/§14 fixed
- `FINAL_REALITY_AUDIT.md` superseded banner
- `TB_CLASSIFICATION_BENCHMARK.md` superseded banner
- `DOCUMENTATION_LINEAGE.md` created

---

## Not verified this cycle

- AWS ECS / RDS / Redis live state
- Backup restore on production RDS
- Cypress E2E
- `local-ai:smoke` / `tb:benchmark` re-run 2026-06-18
- External pen test

---

## Unsupported claims

Do not claim L6, enterprise-ready, On-Prem/Air-Gap packages, or autonomous AI.  
Cite test count only with link to `docs/reports/2026-06-18-final-test.txt`.
