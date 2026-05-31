# Pilot Pack Navigation Index

**Date:** 2026-06-01  
**Purpose:** Canonical map of AuditOS and LocalContentOS pilot pack trees. Resolves Category C3 duplicate-tree confusion without deleting content.

---

## AuditOS — Which Pack When?

| Tree | Role | Use when |
|------|------|----------|
| [`docs/commercial-pack/`](../commercial-pack/) | **Primary commercial / sales pack** | Customer outreach, offer, scope, onboarding checklists, success criteria, timeline, client messages |
| [`docs/pilot/execution-pack/`](./execution-pack/) | **Primary operational execution pack** | After customer agrees — TB intake, demo walkthrough, QA checklists, feedback, post-pilot review |
| [`docs/pilot/`](../pilot/) (root files) | **Governance and readiness** | Scope, go/no-go, risk disclosure, controlled execution, session reports |
| [`docs/archive/commercial-legacy/pilot-pack/`](../archive/commercial-legacy/pilot-pack/) | **Archived legacy commercial pack** | Historical reference only — do not use for live pilots |
| [`docs/product/auditos-commercial-master-index.md`](../product/auditos-commercial-master-index.md) | **AuditOS commercial navigation hub** | Start here for full AuditOS commercial doc map |

### Overlap guidance (AuditOS)

- **Success criteria:** Primary → `docs/commercial-pack/07-pilot-success-criteria.md`. Operational mirror → `docs/pilot/execution-pack/09-pilot-success-criteria.md`. Legacy → `docs/archive/commercial-legacy/pilot-pack/05-success-criteria.md` (archived).
- **Onboarding checklists:** Commercial prep → `docs/commercial-pack/03-client-onboarding-checklist.md`. Post-agreement ops → `docs/pilot/execution-pack/02-customer-onboarding-checklist.md`.
- **Demo scripts:** Sales narrative → `docs/commercial/demo-storyline/`. Live walkthrough → `docs/pilot/execution-pack/03-demo-walkthrough-script.md` or `docs/pilot/CLIENT-DEMO-SCRIPT.md`.

---

## LocalContentOS — Separate Product Pack

| Tree | Role |
|------|------|
| [`docs/product/localcontentos-v0.1/pilot-onboarding-pack/`](../product/localcontentos-v0.1/pilot-onboarding-pack/) | **Primary LocalContentOS pilot pack** — scope, demo script, safe claims, closeout |
| [`docs/product/localcontentos-pilot-runbook/`](../product/localcontentos-pilot-runbook/) | Operating runbook (analyst-led procedures) |
| [`docs/product/localcontentos-sales-pack/`](../product/localcontentos-sales-pack/) | **Superseded** pre-software sales framing — use pilot-onboarding-pack for live demos |

LocalContentOS packs are **not** duplicates of AuditOS commercial-pack; they cover a different product workspace at `/local-content/*`.

---

## Archive and Duplication Evidence

- Full overlap analysis: [`docs/archive/commercial-legacy/COMMERCIAL_DUPLICATION_REVIEW.md`](../archive/commercial-legacy/COMMERCIAL_DUPLICATION_REVIEW.md)
- Project-organization closure: [`docs/reports/project-organization/09-final-closure.md`](../reports/project-organization/09-final-closure.md)

**Policy:** No deletes. Use this index to choose the correct primary source. Content merge across trees remains a future optional project (Category C3 — pointer-only resolution complete 2026-06-01).
