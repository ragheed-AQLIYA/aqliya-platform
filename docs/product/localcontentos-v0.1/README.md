# LocalContentOS v0.1 — Product Scope Lock

**Status:** Scope locked — ready for implementation
**Classification:** Strategic second product under AQLIYA
**Current maturity:** L1 Marketing → targeting L4 Usable v0.1

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

## Design Principles

1. Governed, not guesswork — every output is evidence-linked and human-reviewed.
2. Reuse AQLIYA Core — do not duplicate governance, audit, storage, or platform engines.
3. Arabic-first UX — bilingual, RTL layouts, Saudi-market terminology.
4. Real workflow, not a dashboard — CRUD, classification, scoring, evidence, review, approval, export.
5. Evidence-backed — supplier claims must be supported.
6. Compliance-ready, not compliance-claiming — the system helps manage local content, it does not certify it.

## Target Release

- v0.1 = first complete usable product, not production-hardened.
- Scope locked before Phase 1 implementation begins.
