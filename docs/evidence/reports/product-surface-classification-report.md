# AQLIYA Product Surface Classification Report

**Agent:** Product Surface Classification Verifier  
**Date:** 2026-05-24  
**Type:** Documentation and classification pass only — no source code modified.

---

## Summary

Classified 6 ambiguous product/workspace/admin surfaces across AQLIYA. Separated real implemented surfaces from prototypes, mock-only shells, redirect aliases, and mixed-status areas. Three minor documentation corrections applied; all source-of-truth docs were already substantially accurate.

---

## Files Inspected

| File | Purpose |
|------|---------|
| `src/app/(dashboard)/assistant/page.tsx` | Office AI Assistant — task list |
| `src/app/(dashboard)/assistant/[taskId]/page.tsx` | Office AI Assistant — task detail |
| `src/app/sales/page.tsx` | SalesOS — prototype dashboard |
| `src/app/sales/layout.tsx` | SalesOS — layout chrome |
| `src/app/(dashboard)/organizations/page.tsx` | Organizations — mock list |
| `src/app/(dashboard)/organizations/[id]/page.tsx` | Organizations — mock detail |
| `src/app/(dashboard)/settings/page.tsx` | Settings — main shell |
| `src/app/(dashboard)/settings/platform-organization/page.tsx` | Settings — real admin surface |
| `src/app/(dashboard)/settings/workspaces/page.tsx` | Settings — real admin surface |
| `src/app/(dashboard)/settings/audit-logs/page.tsx` | Settings — real admin surface |
| `src/app/sunbul/page.tsx` | Sunbul — dashboard |
| `src/app/sunbul/layout.tsx` | Sunbul — layout |
| `src/app/sunbul/admin/page.tsx` | Sunbul — admin with RBAC |
| `src/app/workflowos/page.tsx` | workflowos — redirect to /sunbul |
| `src/app/workflowos/layout.tsx` | workflowos — layout |
| `src/app/workflowos/admin/page.tsx` | workflowos — redirect |
| `src/app/workflowos/clients/[clientId]/records/[recordId]/page.tsx` | workflowos — redirect |
| `src/components/sunbul/` | 16 components for Sunbul |
| `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | Product status reference |
| `docs/source-of-truth/ROUTE_STRATEGY.md` | Route strategy reference |
| `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` | Architecture reference |

## Files Changed

| File | Change |
|------|--------|
| `docs/source-of-truth/ROUTE_STRATEGY.md` | workflowos table: status changed from "Prototype (L3)" to "Redirect alias". Route rule 6 updated: "redirect alias" not "prototype". |
| `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | workflowos row: status changed from "L3 Prototype" to "Redirect alias (N/A)". SalesOS row: notes clarified as "mock-only". Reality notes expanded with per-surface detail. |

## Commands Run

- `Get-ChildItem` (targeted directory listings) — Light
- `Select-String` (targeted grep) — Light
- File reads on 21 files — Light
- No build, no lint, no test, no Prisma commands.

## RAM Risk

**None.** All operations were directory listings, grep queries, and single-file reads.

---

## Surface-by-Surface Classification

### 1. Office AI Assistant

| Attribute | Value |
|-----------|-------|
| **Classification** | Real implemented governed shared application |
| **Maturity** | L4 — Usable v0.1 |
| **Routes** | `/assistant` (task list, 640 lines), `/assistant/[taskId]` (task detail, 728 lines) |
| **API routes** | `/api/office-ai/download` (protected, platform-org scoped) |
| **Prisma models** | `OfficeAiTask`, `OfficeAiOutput`, `OfficeAiFile` |
| **Server Actions** | 14 actions: create, submit for review, approve, reject, generate output, add/remove file, update task, update output, archive, re-extract |
| **Workflow** | `draft → generated → needs_review → approved` — governed with review gate |
| **Navigation** | Platform sidebar (`module = "decision"` fallback), PlatformHeader breadcrumbs, footer, `/assistant` link in platformNav |
| **Customer-presentable** | Yes — with governance explanation (AI assists, human decides) |
| **Limitations** | Shared application, not standalone product. Uses deterministic AI provider. No local AI. No autonomous decisions. |
| **Documented status** | ✅ Accurate in all source-of-truth docs |

### 2. Sunbul

| Attribute | Value |
|-----------|-------|
| **Classification** | Real implemented custom/client-specific governed workspace |
| **Maturity** | L4 — Usable v0.1 |
| **Routes** | `/sunbul` (dashboard), `/sunbul/admin` (admin with RBAC), `/sunbul/clients/[clientId]/records/[recordId]` (record detail) |
| **API routes** | `/api/sunbul/clients/[clientId]/records/[recordId]/export/pdf`, `/api/sunbul/documents/[documentId]/download` |
| **Components** | 16 components in `src/components/sunbul/` — dashboard, admin, client list, record detail, review panel, audit trail, membership manager, workflow actions, document panel, etc. |
| **Prisma models** | `SunbulClient`, `SunbulUserMembership`, `SunbulRecord`, `SunbulDocument`, `SunbulReview`, `SunbulAuditEvent` |
| **Layout** | Full PlatformSidebar + PlatformHeader + auth |
| **RBAC** | Admin page: `user.role !== "ADMIN"` → `/access-denied` |
| **Customer-presentable** | Safe to show with explanation — positioned as custom/client-specific workspace, not platform-wide product |
| **Documented status** | ✅ Accurate in all source-of-truth docs |

### 3. workflowos

| Attribute | Value |
|-----------|-------|
| **Classification** | Pure redirect alias — NOT a prototype |
| **Maturity** | N/A — redirect alias only |
| **Routes** | `/workflowos`, `/workflowos/admin`, `/workflowos/clients/[clientId]/records/[recordId]` — all are single-line `permanentRedirect()` |
| **Components** | None. Zero components under `src/components/workflowos/` |
| **Data** | None. Zero Prisma queries, zero Server Actions |
| **Layout** | Duplicated layout.tsx (same as Sunbul's) — renders before redirect |
| **Behavior** | Every route: `permanentRedirect()` to corresponding `/sunbul/...` path |
| **Correction applied** | 🔴 ROUTE_STRATEGY.md incorrectly listed as "Prototype (L3)". Corrected to "Redirect alias". PRODUCT_STATUS_MATRIX.md similarly corrected. |

### 4. Sales

| Attribute | Value |
|-----------|-------|
| **Classification** | Mock-only prototype dashboard |
| **Maturity** | L3 — Prototype (mock-only) |
| **Routes** | `/sales` (1 page, 396 lines) |
| **Data** | All hardcoded: `mockRecentEntities`, `mockTimeline` — no Prisma, no Server Actions, no persistence |
| **Layout** | Full PlatformSidebar + PlatformHeader + auth |
| **Navigation** | Platform sidebar module switcher (SalesOS entry exists) |
| **Customer-presentable** | Do not show as implemented. Clearly labeled as prototype internally |
| **Documented status** | ✅ Accurate — all docs say L3 prototype. Correction applied to note it is mock-only specifically. |

### 5. Organizations

| Attribute | Value |
|-----------|-------|
| **Classification** | Mock-only prototype internal preview surface |
| **Maturity** | L3 — Prototype (mock-only) |
| **Routes** | `/organizations`, `/organizations/[id]` |
| **Data** | All hardcoded: `mockOrganizations` array (1 item), `mockOrg` object — no Prisma, no Server Actions, no persistence |
| **Self-labeling** | Amber warning banner: "هذه الصفحة نموذج أولي داخلي"; "واجهة داخلية تجريبية ببيانات ثابتة"; Button: "إنشاء مؤسسة غير متاح في v0.1" |
| **Navigation** | Referenced from platformNav, linked via `/organizations` |
| **Customer-presentable** | Internal only |
| **Documented status** | ✅ Accurate in all source-of-truth docs |

### 6. Settings

| Attribute | Value |
|-----------|-------|
| **Classification** | Mixed — 1 shell (L2) + 3 real admin surfaces (L4) |
| **Maturity** | Main: L2 Shell; Sub-routes: L4 Active |
| **Routes** | `/settings` (shell, client-side local state only), `/settings/platform-organization` (real Prisma, 385 lines), `/settings/workspaces` (real Prisma, 290 lines), `/settings/audit-logs` (real Prisma, 386 lines, `force-dynamic`), `/monitoring` (real, L4) |
| **Data** | Main: `useState` only, no persistence. Sub-routes: real Prisma queries |
| **Self-labeling** | Main page: Badge "Internal Preview", amber warning "هذه الصفحة تستخدم حالة محلية داخل المتصفح فقط" |
| **Navigation** | Referenced from all sidebar nav configurations |
| **Customer-presentable** | Sub-routes: internal admin only. Main page: internal preview only. |
| **Documented status** | ✅ Accurate — all docs correctly split between L2 shell (main) and L4 active (sub-routes) |

---

## Route/API Evidence Summary

| Surface | Route Count | API Route Count | Real Data | Persistence | Actions |
|---------|-------------|-----------------|-----------|-------------|---------|
| Office AI Assistant | 2 | 1 | ✅ Real Prisma | ✅ DB-backed | ✅ 14 Server Actions |
| Sunbul | 3 + dynamic | 2 | ✅ Real Prisma | ✅ DB-backed | ✅ Full CRUD |
| workflowos | 3 + dynamic | 0 | ❌ None (redirect) | ❌ N/A | ❌ None |
| Sales | 1 | 0 | ❌ Mock only | ❌ None | ❌ None |
| Organizations | 2 | 0 | ❌ Mock only | ❌ None | ❌ None |
| Settings (main) | 1 | 0 | ❌ Local state | ❌ None | ❌ None |
| Settings (sub-routes) | 3 | 0 | ✅ Real Prisma | ✅ DB-backed | ✅ Server components |

## Navigation Evidence

| Surface | Platform Sidebar | Platform Header | Footer | Other |
|---------|-----------------|-----------------|--------|-------|
| Office AI Assistant | ✅ platformNav (DecisionOS fallback) | ✅ Breadcrumbs | ✅ /assistant link | — |
| Sunbul | ✅ Module switcher (+ sunbulNav) | ✅ Breadcrumbs | — | — |
| workflowos | ⚠️ Module switcher refers to "Sunbul" | ✅ Breadcrumbs (via redirect) | — | — |
| Sales | ✅ Module switcher (+ salesNav) | ✅ Breadcrumbs | — | — |
| Organizations | ✅ platformNav | ✅ Breadcrumbs | — | — |
| Settings | ✅ All nav configs include settings | ✅ Breadcrumbs | — | — |

## Customer-Presentability Status

| Surface | Customer Safe? | Notes |
|---------|---------------|-------|
| Office AI Assistant | ✅ Yes — with explanation | Shared governed app, not standalone product |
| Sunbul | ✅ Yes — with explanation | Client-specific custom workspace |
| workflowos | ❌ No — internal redirect alias | Exists only as 302 redirects |
| Sales | ❌ No — mock-only prototype | All data fake, no persistence |
| Organizations | ❌ No — mock-only prototype | Self-labels as internal preview |
| Settings (main) | ❌ No — client-side-only shell | Self-labels as internal preview |
| Settings (sub-routes) | ⚠️ Internal admin only | Real diagnostics, not customer-facing |

## Required Documentation Corrections

| Doc | Issue | Correction Applied |
|-----|-------|-------------------|
| `ROUTE_STRATEGY.md` | workflowos incorrectly classified as "Prototype (L3)" | Changed to "Redirect alias"; route rule 6 updated |
| `PRODUCT_STATUS_MATRIX.md` | workflowos listed as "L3 Prototype" | Changed to "Redirect alias (N/A)" |
| `PRODUCT_STATUS_MATRIX.md` | SalesOS listed generically as "L3 Prototype" | Changed to "L3 Prototype (mock-only)" with note about no Prisma/actions |
| `PRODUCT_STATUS_MATRIX.md` | Reality notes lacked per-surface detail | Expanded with specific descriptions for SalesOS, Organizations, Settings |

## Remaining Risks

1. **workflowos duplicated layout.tsx** — The `workflowos/layout.tsx` is an exact copy of `sunbul/layout.tsx`. It runs auth + sidebar + header rendering before the redirect fires. This is unnecessary overhead and could be simplified, but is not a functional issue.
2. **workflowos route table confusion** — If a developer adds a new sunbul route without adding the corresponding workflowos redirect, the workflowos URL will 404 instead of redirecting. This is a maintenance burden.
3. **Settings mixed-status ambiguity** — The main `/settings` page is an L2 shell while its sub-routes are L4 active. This dual status is unusual and could confuse developers. Should be clearly documented (now done in PRODUCT_STATUS_MATRIX.md).
4. **SalesOS in sidebar as "SalesOS"** — Since it's mock-only, having it in the module switcher as "SalesOS" could imply it's a real product. Consider whether it should remain visible or be hidden behind a feature flag.
5. **Organizations/Sunbul overlap** — `/organizations/sunbul` exists as a separate page from `/sunbul`. The relation between these two routes should be clarified in documentation.

## Final Status

**PASS**

All 6 classification targets have been evaluated. Classification table produced with route/API/navigation/Customer evidence per surface. Three minor documentation corrections applied to align source-of-truth docs with code reality. No source code was modified. All prior reports' classifications (Office AI Assistant as L4 shared app, Sunbul as L4 custom workspace, Sales as L3 prototype, Organizations as L3 prototype, Settings as L2/L4 mixed) are confirmed with evidence.

## Exact Report Path

`docs/reports/product-surface-classification-report.md`
