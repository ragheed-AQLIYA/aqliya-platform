# Local Content OS (LocalContentOS)

**Status:** L5 pilot-ready with conditions / usable v0.1  
**Routes:** `/local-content/*` (12 workspace routes), `/products/local-content` (marketing)  
**Current maturity:** Real governed workspace with server actions, seed data, mutations, review/approval, text/CSV and binary PDF/XLSX export (2026-05-25), audit trail. Not L6 production-hardened.

**Current authority:** `docs/reports/localcontentos-v0.1-documentation-truth-sync-2026-05-23.md`

## What Exists

- Workspace at `/local-content/*` with project, supplier, spend, classification, evidence, findings, scoring, review, approval, reports, audit trail
- Prisma models, server actions, seed dataset (`lc-project-demo-001`)
- Product pack at `docs/product/localcontentos-v0.1/`
- Pilot onboarding pack at `docs/product/localcontentos-v0.1/pilot-onboarding-pack/`

## What Is Deferred

- L6 production hardening
- AI autonomous classification
- Full edit/delete UI for all entities

## Safe Claims

- Governed local content assessment workspace (pilot-ready with conditions)
- Human review and approval workflows
- Evidence-backed supplier/spend classification display
- Text/CSV and binary PDF/XLSX export with disclaimer metadata (pdfkit + xlsx; not regulator-certified)

## Forbidden Claims

- Production-hardened (L6) or regulator-certified compliance
- Claiming binary PDF/XLSX export is L6-certified or regulator-approved
- AI autonomous classification
- On-Prem / Air-Gapped deployment as available today
