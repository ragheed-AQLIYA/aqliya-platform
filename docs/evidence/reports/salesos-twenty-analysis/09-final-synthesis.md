# 09 — Final Synthesis

**Date:** 2026-06-01  
**Analysis:** SalesOS current state vs Twenty CRM benchmark  
**Recommendation owner:** Product + Platform engineering

---

## Executive Summary

SalesOS today is an **L3 auth-gated mock dashboard** at `/sales` with no persistence, no server actions, and no tests. Twenty CRM is a capable **open-source metadata-driven CRM** (AGPL) suitable as a **UX and vocabulary benchmark only** — not as embedded code. The correct path is **Option A: native SalesOS v0.3** on AQLIYA Core, cloning LocalContentOS's Prisma + server action + audit patterns. A prerequisite **migration drift reconciliation** is required before schema work.

**Final recommendation:** Do not import Twenty. Build a minimal governed sales slice (accounts, contacts, opportunities, interactions, audit) in Phase 0–4, then add proposal review gate in Phase 5.

---

## Top 10 Reuse (from AQLIYA + Twenty concepts)

1. **LocalContentOS lib pattern** — `src/lib/local-content/` → `src/lib/sales/`
2. **Server action wrapper** — `ActionResult<T>` from `local-content-workspace-actions.ts`
3. **Audit event model** — `LocalContentAuditEvent` → `SalesAuditEvent`
4. **Enterprise UI components** — already on `/sales` dashboard
5. **Platform auth + middleware** — `/sales` protection exists
6. **Governance router** — `commercial_claim_review` in `retrieval-router.ts`
7. **Actor lineage checks** — `src/lib/governance/actor-lineage.ts`
8. **Entity timeline component** — `entity-timeline.tsx` for interactions
9. **Twenty's record page tab layout** — conceptual UX benchmark
10. **Command palette** — extend for sales entity search/create

---

## Top 10 Avoid

1. **Importing Twenty AGPL code** into monorepo
2. **Metadata/dynamic GraphQL engine** — scope explosion
3. **CRM clone scope** — email sync, leads, marketing automation day one
4. **Claiming L4/L5 status** before persistence exists
5. **Dead nav links** to `/sales/deals/...` (current command palette bug)
6. **AI autonomous stage changes** or auto-close
7. **Export without approval** on AI-generated briefs
8. **Skipping migration drift fix** — blocks all Prisma work
9. **Using mock AuditOS timeline data** on sales dashboard (current bug)
10. **Customer demo of `/sales`** before amber banner removed with evidence

---

## Target Definition — SalesOS v0.3

**Product:** Governed revenue intelligence under AQLIYA  
**Level target:** L4 Usable v0.1  
**Route prefix:** `/sales/*`  
**Core loop:** Account → Opportunity → Interactions → (optional Proposal review) → Memory  
**Governance:** SalesAuditEvent on every mutation; commercial claim gate on exports  
**Language:** Arabic-first RTL

---

## v0.3 Scope (In)

- P0 Prisma models + seed
- Accounts + Opportunities CRUD
- Dashboard wired to real data
- Interaction logging + audit trail page
- Nav/command palette fixes
- Basic permissions (org-scoped)
- Light unit tests on services

## Deferred (v0.4+)

- Kanban board, ICP/intelligence/revenue routes
- Email/calendar integration
- Full AI agent suite (7 agents)
- SalesMemory extraction automation
- PDF brief export
- L5 pilot-ready review

---

## Risk Register

| ID | Risk | Severity | Mitigation |
|----|------|----------|------------|
| R1 | Migration drift blocks dev | High | Phase 0 reconciliation |
| R2 | Scope creep to full CRM | High | P0 entity cap in PR reviews |
| R3 | AGPL contamination if Twenty imported | High | Option A only |
| R4 | Commercial overclaim on marketing | Medium | Keep "قيد التطوير" until L4 |
| R5 | Cross-tenant data leak | High | permissions.ts on all queries |
| R6 | Orphan DB tables from prior SalesOS work | Medium | Inventory before migrate |
| R7 | AuditOS regression | Medium | Isolated models + light tests |
| R8 | AI outputs without review | High | Draft-only UI labels Phase 3–4 |

---

## First Implementation Slice

**Single PR: "SalesOS Phase 0 + Phase 1 — drift doc + P0 schema + seed"**

1. Document migration drift decision in `docs/reports/salesos-twenty-analysis/` addendum or issue
2. Add P0 models to `prisma/schema.prisma`
3. Create migration `salesos_p0_core`
4. Add `prisma/seed-sales.ts` + hook in seed
5. Scaffold empty `src/lib/sales/` with types + audit helper (no routes yet)

**Do not** in first PR: UI routes, AI, Twenty code, full build CI

---

## Exact Next PR Plan

```
PR-1: salesos/p0-schema-seed
  - prisma/schema.prisma (5 models)
  - prisma/migrations/.../migration.sql
  - prisma/seed-sales.ts
  - src/lib/sales/{types,audit-events,permissions}.ts
  - docs: update PRODUCT_STATUS_MATRIX (data layer L1)

PR-2: salesos/p0-actions-accounts-opportunities
  - src/actions/sales-workspace-actions.ts
  - src/lib/sales/services.ts + prisma-repository.ts
  - src/app/sales/accounts/*, opportunities/*
  - Fix navigation.ts + command-palette.tsx
  - src/lib/sales/__tests__/services.test.ts

PR-3: salesos/p0-dashboard-audit
  - Rewire src/app/sales/page.tsx (server data)
  - src/app/sales/audit-trail/page.tsx
  - Interaction log component
  - Docs sync ROUTE_STRATEGY + systems/salesos/README
```

---

## Validation Classification

| Artifact | Status |
|----------|--------|
| This analysis pack | Light validated (static inspection) |
| SalesOS product | **Not validated** — L3 prototype |
| Twenty benchmark | Reference only |
| Production readiness | **Production no-go** |
| Pilot readiness | **Not pilot-ready** |

---

## Commands Run (This Analysis)

| Command | Class |
|---------|-------|
| Glob/grep/read file inspection | Light |
| WebFetch Twenty docs + LICENSE | Light |
| WebSearch Twenty architecture | Light |
| `mkdir` report directory | Light |
| git status / build / test / migrate | **Not run** (low-load protocol) |

---

## Blockers Encountered

1. **Migration drift** — SalesOS migrations in some DBs, not in repo (documented, unresolved)
2. **Codebase divergence** — smoke script expects v0.2 routes absent from tree
3. **00 report write tool** — initial binary write error; resolved via PowerShell UTF-8

**Status for parent agent:** **DONE_WITH_CONCERNS** (drift + historical artifacts require Phase 0 before implementation)
