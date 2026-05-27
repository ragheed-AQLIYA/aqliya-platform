# LocalContentOS v0.1 — Product Pack

**Status:** L5 pilot-ready with conditions / usable v0.1 (after mutation feedback loop verification)  
**Classification:** Strategic second product under AQLIYA  
**Current maturity:** L5 with conditions — not L6 production-hardened

## Evidence (2026-05-23)

- Mutation feedback loop fix: `revalidatePath` after write mutations + client `ActionResult` handling + `router.refresh()`.
- Focused verification on clean `next start` (:3001): project, supplier, spend, CSV, evidence mutations; isolated finding create **PASS** on `/local-content/projects/lc-project-demo-001/findings` (no hard refresh; form closes on success).
- CLI validation passed: `npx prisma generate`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm test -- --testPathPatterns=local-content` (30 tests, 4 suites).

## Remaining limitations

- Not L6 production-hardened.
- Binary PDF/XLSX export implemented (pdfkit + xlsx). Arabic PDF font rendering is P2 quality gap.
- Review/approval/report inline server forms may still need clean manual pass.
- No full edit/delete UI for all entities.
- No AI autonomous classification.

## Pack Contents

| File                           | Purpose                                             |
| ------------------------------ | --------------------------------------------------- |
| `product-scope.md`             | What is included and excluded from v0.1             |
| `workflow-spec.md`             | Core workflow, states, user journey                 |
| `route-plan.md`                | Route architecture and API plan                     |
| `data-model-plan.md`           | Prisma models, reuse strategy                       |
| `governance-model.md`          | RBAC, audit, approval, evidence rules               |
| `evidence-and-export-model.md` | Evidence requirements, report/export specifications |
| `ai-boundaries.md`             | AI allowed/forbidden actions                        |
| `seed-data-plan.md`            | Demo dataset for development and pilot              |
| `implementation-plan.md`       | Phased implementation sequence                      |
| `pilot-smoke-checklist.md`     | Pilot browser smoke checklist                       |
| `pilot-onboarding-pack/`       | Customer pilot onboarding documents                 |

## Design Principles

1. Governed, not guesswork — every output is evidence-linked and human-reviewed.
2. Reuse AQLIYA Core — do not duplicate governance, audit, storage, or platform engines.
3. Arabic-first UX — bilingual, RTL layouts, Saudi-market terminology.
4. Real workflow, not a dashboard — CRUD, classification, scoring, evidence, review, approval, export.
5. Evidence-backed — supplier claims must be supported.
6. Compliance-ready, not compliance-claiming — the system helps manage local content, it does not certify it.

## Target Release

- v0.1 = first complete usable product, not production-hardened (L6).
- Workspace implemented at `/local-content/*` (12 routes + 1 download API).
