# SalesOS v0.3 PR-4 — Pipeline P1 Report (`salesos_p1_pipeline`)

**Status:** Implementation complete (UI only); no schema change  
**Product level after PR:** L4 foundation + P1 pipeline read board (~L4 partial)  
**Validation classification:** light validated (targeted jest only)

---

## 1. Objective

Improve read-only `/sales/pipeline` after PR-3 accounts slice: KPI summary row, per-column deal count + SAR totals, exclude closed stages (`isClosed`) from open board, separate won/lost section, evidence stub on deal detail (no upload).

---

## 2. Files changed

| Path | Role |
|------|------|
| `src/app/sales/pipeline/page.tsx` | KPI cards, active stages only, column totals, closed deals section |
| `src/components/sales/sales-shell.tsx` | `SalesPhaseBadge` optional `phase="pr4"` label |
| `src/app/sales/deals/[id]/page.tsx` | `statusReason` display; evidence P1 stub card |
| `docs/reports/salesos-v03-pr4-pipeline.md` | This report |

---

## 3. Pipeline behavior

| Feature | Behavior |
|---------|----------|
| KPI row | Open deal count, open pipeline SAR total, closed won/lost count |
| Open board | Only stages where `isClosed === false` |
| Column header | `{count} صفقة · {SAR total}` |
| Closed section | Won/lost deals listed below board (read-only links) |
| Drag/drop | **Not implemented** (deferred) |

Audit: `sales.pipeline.viewed` unchanged (via `listSalesPipelineStagesAction`).

---

## 4. Evidence stub

Deal detail shows placeholder card "الأدلة (P1 stub)" — no file upload, no Evidence Core integration. Full evidence linking deferred to future slice.

---

## 5. Validation performed

| Command | Result |
|---------|--------|
| `jest src/lib/sales/__tests__/sales-services.test.ts` | **Passed** (16 tests, 2026-06-01) |
| `npx prisma validate` | **Not run** (no schema change) |
| `npm run build` | **Not run** |
| `npm run lint` | **Not run** |

---

## 6. Intentionally deferred (PR-5+)

- `SalesContact` P1 model + minimal list (schema change)
- Stage reorder / admin UI
- Drag-and-drop stage moves (would need client mutation + audit)
- Real evidence links to platform Evidence Core
- E2E browser smoke on `/sales/pipeline`

---

## 7. Next PR slice

**Name:** `salesos_p1_contacts` or `salesos_p1_evidence`

1. Minimal `SalesContact` model (if schema approved) + org-scoped list on account detail
2. OR metadata-based evidence reference field on deal (no file store)
3. Platform RBAC entries for SalesOS
4. Browser smoke checklist after migration applied

---

## 8. Parent handoff

| Item | Value |
|------|--------|
| **Status** | DONE_WITH_CONCERNS |
| **Product level** | L4 + P1 pipeline read board |
| **Production readiness** | **No** |

### ملخص عربي

تحسين مسار الصفقات بملخص القيمة وأعمدة المراحل النشطة وقسم الفوز/الخسارة — قراءة فقط بدون سحب وإفلات.
