# SalesOS v0.3 PR-3 — Accounts + Won/Lost Report (`salesos_p0_accounts`)

**Status:** Implementation complete; migration/seed/generate not executed in this session  
**Product level after PR:** L4 foundation + P0 accounts UI + deal status transitions (~L4 partial)  
**Validation classification:** light validated (targeted jest only)

---

## 1. Objective

Complete PR-3 after PR-2 deals UI: account list/detail/create, `createSalesAccount` + audit, deal won/lost validation + UI, dashboard/shell nav to accounts, read-only `/sales/pipeline`, optional seed hook in `prisma/seed.ts`.

---

## 2. Files changed / added

| Path | Role |
|------|------|
| `src/app/sales/accounts/page.tsx` | Org-scoped accounts list + CTA |
| `src/app/sales/accounts/[id]/page.tsx` | Account detail, linked deals, edit form |
| `src/app/sales/accounts/new/page.tsx` | Create account form |
| `src/components/sales/account-create-form.tsx` | Client create form |
| `src/components/sales/account-edit-form.tsx` | Client update form |
| `src/components/sales/deal-status-form.tsx` | Won/lost/archived with required `statusReason` |
| `src/app/sales/pipeline/page.tsx` | Read-only pipeline board (open deals by stage) |
| `src/lib/sales/validation.ts` | Account validation; `validateDealStatusTransition` |
| `src/lib/sales/services.ts` | `createSalesAccount`, `updateSalesAccount`, account getters |
| `src/actions/sales-actions.ts` | Account actions; deal status update; pipeline viewed audit |
| `src/components/sales/sales-shell.tsx` | Nav (dashboard/deals/accounts/pipeline); account list/card |
| `src/app/sales/sales-dashboard-client.tsx` | Links to accounts + pipeline |
| `src/app/sales/deals/[id]/page.tsx` | Deal status form; `statusReason` display; evidence stub card |
| `prisma/seed.ts` | `SEED_SALES_DEMO=1` → runs `scripts/seed-sales-demo.ts` |
| `src/lib/sales/__tests__/sales-services.test.ts` | Account create audit; won/lost validation tests |
| `docs/reports/salesos-v03-pr3-accounts.md` | This report |

---

## 3. Routes

| Route | Behavior |
|-------|----------|
| `/sales/accounts` | List accounts (org-scoped), link to detail, CTA to new |
| `/sales/accounts/[id]` | Read account, linked deals, edit (OPERATOR) |
| `/sales/accounts/new` | Create account (name, optional industry) |
| `/sales/pipeline` | Read-only open-deal board by stage |
| `/sales/deals/[id]` | + won/lost status form; shows `statusReason` from metadata |

Dashboard `/sales` links to accounts and pipeline.

---

## 4. Validation rules (won/lost)

- `statusReason` required when transitioning to `won` or `lost`
- Cannot reopen `won`/`lost` to `open` without archiving first
- Terminal deals show read-only message in status form

---

## 5. Audit & governance

**Domain (`SalesAuditEvent`):**

- `sales.account.created`, `sales.account.updated`, `sales.account.viewed`
- `sales.deal.status_changed` with `fromStatus`, `toStatus`, `statusReason`
- `sales.pipeline.viewed` on pipeline stages load

**Platform (`auditLogger` / `Product.SALES_OS`):** dual-write on account create/update and deal status change.

Tenant isolation via `requireSalesOrgAccess` / `assertSalesAccountAccess` unchanged from PR-1/2.

---

## 6. Seed hook

```bash
SEED_SALES_DEMO=1 npx prisma db seed
# or standalone:
tsx scripts/seed-sales-demo.ts
```

Idempotent demo pipeline, stages, accounts, deals for first org.

---

## 7. Validation performed

| Command | Result |
|---------|--------|
| `jest src/lib/sales/__tests__/sales-services.test.ts` | **Passed** (16 tests, 2026-06-01) |
| `npx prisma validate` | Not re-run (schema unchanged in PR-3) |
| `npm run build` | **Not run** |
| `npm run lint` | **Not run** |

---

## 8. Intentionally deferred (PR-4+)

- Pipeline value summaries and closed-deal section → **PR-4** (`salesos_p1_pipeline`)
- `SalesContact` model + list
- Full evidence linking (stub only on deal detail)
- Product RBAC matrix entries (`salesos:read` / `salesos:create`)
- Deal delete, stage admin/reorder

---

## 9. Next PR slice

**Name:** `salesos_p1_pipeline`

1. Pipeline KPI row (open count, total SAR, closed count)
2. Column totals; exclude `isClosed` stages from open board
3. Closed won/lost read-only section
4. Evidence stub polish (no upload)

---

## 10. Parent handoff

| Item | Value |
|------|--------|
| **Status** | DONE_WITH_CONCERNS |
| **Product level** | L4 foundation + P0 accounts (not production) |
| **Production readiness** | **No** — migration + generate + seed required |

### ملخص عربي

تم إكمال حسابات SalesOS (قائمة، تفاصيل، إنشاء) مع تحقق فوز/خسارة الصفقة وسجل تدقيق، ومسار قراءة فقط، وربط لوحة `/sales`. يلزم تطبيق migration و seed قبل البيانات الحية.
