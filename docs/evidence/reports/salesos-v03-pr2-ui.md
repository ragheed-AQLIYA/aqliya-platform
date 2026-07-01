# SalesOS v0.3 PR-2 — P0 UI Report (`salesos_p0_ui`)

**Status:** Implementation complete (UI + migration file); migration/seed/generate not executed in agent session  
**Product level after PR:** L4 foundation + P0 deals UI (~L4 partial)  
**Validation classification:** light validated (prisma validate + targeted jest only)

---

## 1. Objective

Deliver PR-2 slice after PR-1 foundation: deals list/detail/create routes, org-scoped guards, `SalesAuditEvent` timeline on deal detail, platform audit on deal update/stage change, dashboard navigation to deals, migration SQL file for `salesos_p0_core` (not applied in-session).

---

## 2. Files changed / added

| Path | Role |
|------|------|
| `prisma/migrations/20260601140000_salesos_p0_core/migration.sql` | P0 Sales tables + indexes + FKs |
| `src/lib/sales/services.ts` | `listSalesDealAuditEvents` |
| `src/lib/sales/audit-timeline.ts` | Map domain audit rows → `EntityTimeline` events |
| `src/actions/sales-actions.ts` | `listSalesDealAuditEventsAction`; platform audit on update; revalidate `/sales/deals` |
| `src/app/sales/deals/page.tsx` | Org-scoped deals list |
| `src/app/sales/deals/[id]/page.tsx` | Deal detail + stage form + audit timeline |
| `src/app/sales/deals/new/page.tsx` | Create deal form |
| `src/components/sales/sales-shell.tsx` | Nav, cards, notices, status badges |
| `src/components/sales/deal-create-form.tsx` | Client create form |
| `src/components/sales/deal-stage-form.tsx` | Client stage update |
| `src/app/sales/sales-dashboard-client.tsx` | Links to deals; real recent deals panel |
| `src/lib/sales/__tests__/sales-services.test.ts` | +2 tests (audit list + timeline map; 10 total) |
| `docs/reports/salesos-v03-pr2-ui.md` | This report |

---

## 3. Routes added

| Route | Behavior |
|-------|----------|
| `/sales/deals` | List deals (org-scoped), link to detail, CTA to new |
| `/sales/deals/[id]` | Read deal, stage update (OPERATOR), `SalesAuditEvent` timeline |
| `/sales/deals/new` | Create deal (account picker, title, optional stage/amount) |

Dashboard `/sales` links to list + new deal; latest deals and stage cards link to detail.

---

## 4. Migration status

| Item | Status |
|------|--------|
| Migration file `20260601140000_salesos_p0_core` | **Created** (SQL in repo) |
| `prisma migrate dev` / `deploy` | **Not run** (low-load / human step) |
| `prisma generate` | **Not run** |
| `scripts/seed-sales-demo.ts` | **Not run** |

### Human commands (after drift check)

```bash
# Resolve any existing migration drift per team process, then:
npx prisma migrate deploy
# or locally:
npx prisma migrate dev --name salesos_p0_core

npx prisma generate
tsx scripts/seed-sales-demo.ts
```

**Drift note:** `prisma migrate diff --from-migrations` failed in agent session (requires `shadowDatabaseUrl` in `prisma.config.ts`). Migration SQL was authored manually from `schema.prisma` P0 models — verify against your DB before production deploy.

---

## 5. Audit & governance

**Domain (`SalesAuditEvent`):** unchanged actions; timeline read on deal detail via `listSalesDealAuditEvents`.

**Platform (`auditLogger` / `Product.SALES_OS`):**

- Create deal — dual-write (PR-1)
- Update deal — `sales.deal.updated` (PR-2)
- Stage change — `sales.deal.stage_changed` with metadata (PR-2)

No auto-send, no email/calendar sync, no Twenty import, no AI on sales routes in this PR.

---

## 6. Guards / tenant

- All data paths use `requireSalesOrgAccess` / `assertSalesDealAccess`
- Cross-org deal/account → `FORBIDDEN` or `notFound()` on detail page
- Create/update require `OPERATOR`; list/view `VIEWER` via existing auth helpers

---

## 7. Validation performed

| Command | Result |
|---------|--------|
| `npx prisma validate` | **Passed** |
| `jest src/lib/sales/__tests__/sales-services.test.ts` | **Passed** (10 tests) |
| `npm run build` | **Not run** |
| `npm run lint` | **Not run** |
| Full test suite | **Not run** |

---

## 8. Risks

1. **Migration not applied** — UI/actions fail until deploy + generate + seed.
2. **Manual migration SQL** — must be reconciled if shadow diff differs from live drift.
3. **Global `UserRole` only** — no `salesos:read` product permissions yet (deferred).
4. **AI insight panels on dashboard** — still illustrative, not Prisma-backed.
5. **Account CRUD UI** — not in scope; seed or future PR required for accounts.

---

## 9. Intentionally deferred (PR-3+)

- `salesos:read` / `salesos:create` platform RBAC matrix entries
- Account/pipeline admin UI, deal delete
- Platform timeline on dashboard (per-deal timeline only)
- E2E / Cypress for sales
- Product registry marketing entry for SalesOS

---

## 10. Next PR slice (exact)

**Name:** `salesos_p0_accounts` or `salesos_p1_pipeline`

1. Account list/detail minimal UI + create (OPERATOR).
2. Pipeline stage admin (read-only board or reorder).
3. Deal status transitions (won/lost) with validation.
4. Hook `prisma/seed.ts` or org bootstrap for sales demo.
5. Browser smoke on `/sales/deals` after migration applied.

---

## 11. Parent handoff

| Item | Value |
|------|--------|
| **Status** | DONE_WITH_CONCERNS |
| **Product level** | L4 foundation + P0 deals UI (partial CRM, not production) |
| **Production readiness** | **No** — migration + generate + seed required |

### ملخص عربي

تم تنفيذ واجهة الصفقات (قائمة، تفاصيل، إنشاء) مع حوكمة المؤسسة وسجل `SalesAuditEvent` على صفحة التفاصيل، وربط لوحة `/sales` بمسارات الصفقات. ملف migration جاهز لكن لم يُطبَّق في الجلسة — يلزم تشغيل الأوامر أعلاه يدوياً قبل اعتبار البيانات حية.
