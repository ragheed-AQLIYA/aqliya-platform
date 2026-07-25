# AQLIYA Current State — Operational Single Source of Truth

**Status:** Active  
**Version:** 1.7  
**Effective:** 2026-06-18  
**Owner:** Governance Team  
**Last Reviewed:** 2026-07-19

**Authority:** See `docs/source-of-truth/DOCUMENTATION_LINEAGE.md`  
**Full audit:** `docs/audits/truth-reconciliation-2026-06-18/FINAL_TRUTH_RECONCILIATION.md`

> **GOVERNANCE FREEZE (P0 — 2026-07-19 / ADR-109):** Unrestricted **L6** claims are suspended. Active systems are **L5 Pilot-ready (conditional)** until B-01 pen-test, Redis/ClamAV production activation verification, and commercial claim alignment close. Canonical entry: `docs/AI_ENTRYPOINT.md`. Commercial wedges: **AuditOS** XOR **LocalContentOS**. SalesOS = internal only. On-Prem / Air-Gap = L0.

---

## Validation snapshot

Historical evidence (2026-06-18/19): `docs/reports/2026-06-18-*`, `docs/reports/2026-06-19-final-*.txt`  
P0 re-validation (2026-07-19): see Engineering Team PR report after `tsc` / lint / test / build / `eng:gates`.

| Check | Result (last frozen snapshot) |
|-------|--------|
| TypeScript | **PASS** — `docs/reports/2026-06-19-final-tsc.txt` |
| Tests | **PASS** — 249 suites, **2462** tests (snapshot; suite has grown since) |
| Lint | **PASS** — **0 errors**, warnings may remain |
| Build | **PASS** — snapshot routes count outdated |
| Staging DNS | **FAIL** — `staging.aqliya.com` ENOTFOUND — `2026-06-18-staging-probe.txt` |

---

## Overall score: **~61–75/100 (conditional pilot)**

Controlled pilot: **CONDITIONAL GO**. Unrestricted production: **NO-GO** until pen-test (B-01), Redis rate-limit + ClamAV activation verified, and L6 language remains frozen.

---

## Product layers

### Strong (pilot commercial wedges)
- **AuditOS** — L5 Pilot-ready (conditional)
- **LocalContentOS** — L5 Pilot-ready (conditional)

### Medium (platform / adjacent — not equal commercial wedges)
- **DecisionOS** — L5 conditional (capability)
- **WorkflowOS** — L5 conditional (capability)
- **Office AI Assistant** — L5 conditional (shared app)
- **LocalContactOS** — L5 conditional
- **Organizations** — L5 surface (capability; not a sold product)
- **Institutional Memory** — L4 partial
- **RiskOS** — L5 conditional workspace under AuditOS adjacency — **not sold as standalone**
- **SalesOS** — L5 conditional — **internal only; not sold in pilot**

### Weak / strategic
- **On-Prem / Air-Gap** — L0 (not sold)
- **Enterprise ops hardening** — IaC present; Redis HA / pen-test / staging DNS pending operator

---

## Operator blockers (P0)

| Item | Status | Artifact |
|------|--------|----------|
| External pen test (B-01) | **NOT SCHEDULED** | `docs/audits/PENTEST_SCOPE_B-01.md` |
| `RATE_LIMITER=redis` in prod ECS | **VERIFY** | `docs/operations/P0_OPS_ACTIVATION_CHECKLIST.md` |
| `SCANNER_PROVIDER=clamav` + daemon | **VERIFY** | same checklist |
| Staging DNS + smoke | **BLOCKED** | ENOTFOUND |
| Terraform: use `prod/` not `production/` | **Canonical** | ADR-108; `infra/terraform/environments/prod/` |

---

## Unsupported claims

Do not claim unrestricted L6, enterprise-ready certification, On-Prem/Air-Gap packages, autonomous AI decisions, SalesOS as customer CRM, or RiskOS as a standalone marketed product.
