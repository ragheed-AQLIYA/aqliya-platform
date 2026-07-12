# Documentation Report

**Agent:** documentation  
**Generated:** 2026-07-11T02:08:05.568Z  
**Score:** 95/100  
**Findings:** 12 (critical 0, high 0, medium 11, low 1, info 0)

> Engineering Excellence — findings only. OpenCode remains implementation authority. No automatic code changes.

## Summary

| Severity | Count |
| -------- | ----- |
| critical | 0 |
| high | 0 |
| medium | 11 |
| low | 1 |
| info | 0 |

## Inventory

- Markdown under docs/: 2298
- ADRs: 1
- Diagram-bearing docs: 19
- Broken relative links (sampled): 9
- Outdated authority candidates: 0

## Authority Reminder

Reports are evidence, not doctrine. Conflict resolution follows `docs/DOCUMENTATION_AUTHORITY.md`.

## MEDIUM Findings

### F-0504 — Documentation tree missing: docs/products

- **Category:** missing-readme
- **Files:** `docs/products`
- **Evidence:** Directory not found

### F-0505 — Documentation tree missing: docs/systems

- **Category:** missing-readme
- **Files:** `docs/systems`
- **Evidence:** Directory not found

### F-0506 — Broken link in docs/DOCUMENTATION_GOVERNANCE.md

- **Category:** broken-link
- **Files:** `docs/DOCUMENTATION_GOVERNANCE.md`
- **Evidence:** [Knowledge Governance Charter v1](governance/aqliya-knowledge-governance-charter-v1.md) → missing docs/governance/aqliya-knowledge-governance-charter-v1.md

### F-0507 — Broken link in docs/programs/localcontentos-production-readiness/PROGRAM_CHARTER.md

- **Category:** broken-link
- **Files:** `docs/programs/localcontentos-production-readiness/PROGRAM_CHARTER.md`
- **Evidence:** [Repository Quality](../../PROGRAM_CLOSURE.md) → missing docs/PROGRAM_CLOSURE.md

### F-0508 — Broken link in docs/programs/localcontentos-production-readiness/PROGRAM_CHARTER.md

- **Category:** broken-link
- **Files:** `docs/programs/localcontentos-production-readiness/PROGRAM_CHARTER.md`
- **Evidence:** [Repository Quality](../../PROGRAM_CLOSURE.md) → missing docs/PROGRAM_CLOSURE.md

### F-0509 — Broken link in docs/pilot/PILOT-PACK-INDEX.md

- **Category:** broken-link
- **Files:** `docs/pilot/PILOT-PACK-INDEX.md`
- **Evidence:** [`docs/products/auditos-commercial-master-index.md`](../products/auditos-commercial-master-index.md) → missing docs/products/auditos-commercial-master-index.md

### F-0510 — Broken link in docs/pilot/PILOT-PACK-INDEX.md

- **Category:** broken-link
- **Files:** `docs/pilot/PILOT-PACK-INDEX.md`
- **Evidence:** [`docs/products/localcontentos-v0.1/pilot-onboarding-pack/`](../products/localcontentos-v0.1/pilot-onboarding-pack/) → missing docs/products/localcontentos-v0.1/pilot-onboarding-pack

### F-0511 — Broken link in docs/pilot/PILOT-PACK-INDEX.md

- **Category:** broken-link
- **Files:** `docs/pilot/PILOT-PACK-INDEX.md`
- **Evidence:** [`docs/products/localcontentos-pilot-runbook/`](../products/localcontentos-pilot-runbook/) → missing docs/products/localcontentos-pilot-runbook

### F-0512 — Broken link in docs/pilot/PILOT-PACK-INDEX.md

- **Category:** broken-link
- **Files:** `docs/pilot/PILOT-PACK-INDEX.md`
- **Evidence:** [`docs/products/localcontentos-sales-pack/`](../products/localcontentos-sales-pack/) → missing docs/products/localcontentos-sales-pack

### F-0513 — Broken link in docs/pilot/PILOT-PACK-INDEX.md

- **Category:** broken-link
- **Files:** `docs/pilot/PILOT-PACK-INDEX.md`
- **Evidence:** [`docs/reports/project-organization/09-final-closure.md`](../reports/project-organization/09-final-closure.md) → missing docs/reports/project-organization/09-final-closure.md

### F-0514 — Broken link in docs/evidence/validation/cycle-6/CERTIFICATION_BLOCKERS.md

- **Category:** broken-link
- **Files:** `docs/evidence/validation/cycle-6/CERTIFICATION_BLOCKERS.md`
- **Evidence:** [cycle-6-close.md](../../operations/parallel-execution-cycle-2026-06-06-cycle-6-close.md) → missing docs/evidence/operations/parallel-execution-cycle-2026-06-06-cycle-6-close.md

## LOW Findings

### F-0503 — Only 1 ADR(s) present

- **Category:** missing-adr
- **Files:** `docs/adr/ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT.md`
- **Evidence:** docs/adr/ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT.md
- **Suggestion:** Expand ADRs for auth, tenancy, deployment, and product boundaries.

---

_AQLIYA Engineering Excellence · documentation_
