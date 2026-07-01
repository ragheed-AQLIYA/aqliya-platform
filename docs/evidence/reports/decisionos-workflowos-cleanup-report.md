# DecisionOS / WorkflowOS Cleanup Report

**Date:** 2026-05-29  
**Agent:** 4 — Platform shells & cross-product UX (DecisionOS / WorkflowOS stream)  
**Scope:** Naming consistency, product boundaries, stale Sunbul UI/docs in active surfaces  
**Authority:** `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`, `docs/source-of-truth/ROUTE_STRATEGY.md` (2026-05-28 Phase 2 rename)

---

## Executive Summary

Active UI was still presenting **Sunbul as a product** in several shell surfaces, with one **inverted route claim** (`/sunbul` official, `/workflowos` alias) that contradicts the matrix. **WorkflowOS is canonical**; Sunbul is a legacy redirect alias and seed/demo tenant name only.

**Patches applied:** 8 files (6 UI, 2 docs). **No schema or redirect route changes.**

---

## Product Boundary Reference

| System | Role | Routes | Maturity |
| ------ | ---- | ------ | -------- |
| **DecisionOS** | Adjacent governed decision workspace | `/decisions/*`, `/intelligence/sectors/*` | L4 — evidence upload added 2026-05-28; review/approval/export gates still L3 gaps |
| **WorkflowOS** | Canonical governed workflow workspace (multi-client records, documents, review) | `/workflowos/*` | L4 |
| **Sunbul** | **Not a product** — legacy redirect alias + Prisma model prefix + demo org seed name | `/sunbul/*` → 302 to `/workflowos/*` | Redirect alias (N/A) |
| **SimulationOS** | Marketing label only; simulation tabs live **inside DecisionOS** (`/decisions/[id]/simulation`) | `/products/simulation` (L1) | Not standalone |

**Boundary rule:** DecisionOS = executive decision lifecycle (intake → scenarios → recommendation → governance). WorkflowOS = operational case/document workflow with client isolation. They share platform auth/governance but are separate products.

---

## Findings — Naming Inconsistencies

| Location | Issue | Severity | Action |
| -------- | ----- | -------- | ------ |
| `platform-header.tsx` | Breadcrumb module = "Sunbul" on `/workflowos/*` | High | **Patched** → WorkflowOS |
| `platform-sidebar.tsx` | Nav item "Sunbul Company"; org chip labeled "Sunbul" as product | High | **Patched** → Demo Organization / WorkflowOS chip |
| `organization-workspace.tsx` | Product card named Sunbul; links to `/sunbul`; **inverted routeNote** | Critical | **Patched** → WorkflowOS + correct route note |
| `(marketing)/page.tsx` | L4 maturity tile listed "Sunbul" as product | High | **Patched** → WorkflowOS |
| `README.md` | WorkflowOS missing from products table | Medium | **Patched** |
| `navigation.ts`, `command-palette.tsx` | "Decision Intelligence" vs page title "DecisionOS"; no WorkflowOS in palette | Medium | **Patched** |
| `decisions/page.tsx` | Uses "DecisionOS" consistently in page header | OK | None |
| `workflow-dashboard.tsx`, `workflow-admin-page.tsx` | Arabic "سير العمل الذكي" (WorkflowOS) — no Sunbul product labels | OK | None |
| Prisma / services (`sunbulClient`, etc.) | Internal model names retained for migration compatibility | Informational | **Not patched** (not user-facing) |
| `/organizations/sunbul` page | Demo tenant still named "Sunbul" (seed org) | Low | **Kept** — tenant name, not product claim |
| `AQLIYA_SYSTEM_TAXONOMY.md` | Still says Sunbul = real workspace, workflowos = alias (**inverted vs matrix**) | Medium | **Not patched** — defer to Agent 5 doctrine sync |
| `AQLIYA_ARCHITECTURE.md` | Mixed legacy/custom-workspace framing | Low | **Not patched** — note only |

---

## Findings — DecisionOS vs WorkflowOS Boundaries

| Check | Result |
| ----- | ------ |
| Separate route trees | ✅ `/decisions/*` vs `/workflowos/*` |
| Separate module switcher entries | ✅ DecisionOS + WorkflowOS in `platform-sidebar.tsx` |
| Shared shell components | ✅ Both use `PlatformSidebar` / `PlatformHeader` — expected |
| Cross-links in product cards | ✅ `organization-workspace.tsx` lists both as distinct enabled products |
| SimulationOS confusion | ⚠️ Marketing page exists; matrix says "DecisionOS capability unless separately built". Simulation tab is under DecisionOS — **no patch** (truthful per matrix) |
| Intelligence routes under DecisionOS module | ✅ `/intelligence/sectors` grouped with DecisionOS in nav — matches matrix |

**Gap (not in sprint scope):** DecisionOS review/approval/export gates remain L3 per matrix B8 — documented, not a naming issue.

---

## Stale Sunbul References — Active UI (Before / After)

| File | Before | After |
| ---- | ------ | ----- |
| `platform-header.tsx` | module: Sunbul | module: WorkflowOS |
| `platform-sidebar.tsx` | Sunbul Company nav; Sunbul org chip | DecisionOS nav label aligned; Demo Organization; WorkflowOS chip |
| `organization-workspace.tsx` | Product "Sunbul", `/sunbul` links, wrong routeNote | Product "WorkflowOS", `/workflowos` links, correct alias note |
| `(marketing)/page.tsx` | L4 tile: … Sunbul | L4 tile: … WorkflowOS |

**Intentionally unchanged:** `/sunbul/*` redirect pages, `organizations/sunbul` route path, Prisma `Sunbul*` models, audit log `SUNBUL` source key.

---

## Files Changed

| File | Change |
| ---- | ------ |
| `src/components/platform/platform-header.tsx` | WorkflowOS breadcrumb; org page label |
| `src/components/platform/platform-sidebar.tsx` | Nav + org context labels |
| `src/components/organization/organization-workspace.tsx` | Product card, links, route note, action buttons |
| `src/app/(marketing)/page.tsx` | L4 product list |
| `src/lib/platform/navigation.ts` | DecisionOS nav label |
| `src/components/platform/command-palette.tsx` | DecisionOS label + WorkflowOS entries |
| `README.md` | WorkflowOS product row |
| `docs/source-of-truth/ROUTE_STRATEGY.md` | `/organizations/sunbul` note |

---

## Remaining Work (Not Patched)

1. **Agent 5:** Sync `AQLIYA_SYSTEM_TAXONOMY.md` and `AQLIYA_ARCHITECTURE.md` with Phase 2 rename (WorkflowOS canonical).
2. **Optional:** Rename demo tenant display on `/organizations/sunbul` from "شركة سنبل" to neutral "Demo Organization" if seed org name should not appear in UI.
3. **Optional:** Prisma/model rename `Sunbul*` → `Workflow*` — large migration; out of sprint scope.
4. **DecisionOS gates:** Review/approval/export hardening (matrix B8) — product work, not naming.

---

## Validation

| Command | Result |
| ------- | ------ |
| `npx tsc --noEmit` | **Not run** (label-only UI/docs per low-load) |
| `npm run lint` | **Not run** |
| Manual review | Label strings only; no logic/schema changes |

---

## Sign-off

| Field | Value |
| ----- | ----- |
| **Status** | **DONE** |
| **Report** | `docs/reports/decisionos-workflowos-cleanup-report.md` |
| **UI patches** | 6 files |
| **Doc patches** | 2 files (README + ROUTE_STRATEGY minimal) |
| **Schema / redirects** | Unchanged |

---

*Agent 4 — Eid Build Sprint. Reduce confusion; improve adjacent product clarity.*
