# SalesOS vs Twenty CRM — Strategic Analysis

**Date:** 2026-06-01  
**Repository:** AQLIYA (`C:\Users\PC\Documents\Aqliya`)  
**Purpose:** Inform SalesOS v0.3 build decisions using Twenty as benchmark only.

---

## Twenty Source (Reference Only)

- **Repository:** [github.com/twentyhq/twenty](https://github.com/twentyhq/twenty)
- **Developer docs:** [docs.twenty.com/developers/introduction](https://docs.twenty.com/developers/introduction)
- **License note:** Primarily GNU AGPL v3 with Enterprise-carved files — **do not import into AQLIYA** without engineering/license review (see report 06).

---

## Report Index

| # | Report | Agent | Summary |
|---|--------|-------|---------|
| 00 | [00-salesos-current-reality.md](./00-salesos-current-reality.md) | Agent 0 | L3 mock dashboard; no Prisma/actions/tests; migration drift |
| 01 | [01-twenty-architecture-teardown.md](./01-twenty-architecture-teardown.md) | Agent 1 | Metadata GraphQL CRM; what to borrow vs avoid |
| 02 | [02-salesos-data-model-map.md](./02-salesos-data-model-map.md) | Agent 2 | P0/P1/P2 models; reuse PlatformOrganization; migration slices |
| 03 | [03-salesos-ux-benchmark.md](./03-salesos-ux-benchmark.md) | Agent 3 | Route tree; Twenty UX mapping; fix dead nav links |
| 04 | [04-salesos-workflow-governance.md](./04-salesos-workflow-governance.md) | Agent 4 | Stages, AI vs human gates, audit events, RBAC |
| 05 | [05-salesos-ai-agents-map.md](./05-salesos-ai-agents-map.md) | Agent 5 | Seven governed agents with failure modes |
| 06 | [06-integration-decision.md](./06-integration-decision.md) | Agent 6 | **Recommend Option A:** build native; reject embed |
| 07 | [07-salesos-v03-build-plan.md](./07-salesos-v03-build-plan.md) | Agent 7 | Phases 0–6 with files, risks, acceptance |
| 08 | [08-competitive-positioning.md](./08-competitive-positioning.md) | Agent 8 | vs Salesforce/HubSpot/Twenty; AR+EN copy |
| 09 | [09-final-synthesis.md](./09-final-synthesis.md) | Agent 9 | Executive summary, next PRs, risk register |

---

## Conclusion (One Paragraph)

SalesOS is today a protected **L3 prototype** (`/sales`) with mock data and no backend; Twenty is a strong **CRM UX benchmark** but a poor fit for embedding due to AGPL and governance gaps. The recommended path is **native SalesOS v0.3 on AQLIYA Core**, following LocalContentOS patterns, starting with migration drift reconciliation and P0 schema (accounts, contacts, opportunities, interactions, audit events)—not a Twenty fork or CRM clone.

---

## Next Implementation Slice

**PR-1:** `salesos/p0-schema-seed` — reconcile/document migration drift, add P0 Prisma models, seed data, scaffold `src/lib/sales/`. See [09-final-synthesis.md](./09-final-synthesis.md) for full PR sequence.

---

## Benchmark Warning

Twenty documentation and architecture evolve independently. This pack is a **point-in-time engineering assessment** (2026-06-01). Twenty was **not imported, cloned, or run** in this analysis. Use reports 01 and 06 before any integration experiment. Do not claim SalesOS is operational, pilot-ready, or production-certified based on this documentation alone.

---

## Related AQLIYA Authority

- `AGENTS.md` §21.5 SalesOS DoD
- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`
- `docs/source-of-truth/ROUTE_STRATEGY.md`
- `docs/systems/salesos/README.md`
