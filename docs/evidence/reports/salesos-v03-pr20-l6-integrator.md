# SalesOS v0.3 PR-20 — L6 integrator gate

**Status:** integrator pass (docs + evidence route + encoding + Jest)  
**Validation:** light validated (sales lib Jest only)  
**Production:** NO

## Deliverables

| Item | Result |
|------|--------|
| `docs/reports/salesos-l6-progress.md` | Updated PR-1–19 table from repo scan |
| `docs/reports/salesos-l6-integrator-checklist.md` | Pilot-ready acceptance checklist (honest) |
| `/sales/evidence` | **Added** — org list, resolver titles, read-only |
| Sales components UTF-8 | **Fixed** UTF-16: `sales-nav.tsx`, `deal-interaction-panel.tsx`, `governance-approval-banner.tsx`, `review-decision-panel.tsx` |
| Lib UTF-8 (Jest blockers) | **Fixed** `audit-trail.ts`, `registry.ts`; rebuilt `pilot-handoff-pack.ts` after corrupt conversion |
| Jest | See below |

## Jest (single command)

```bash
npx jest src/lib/sales/__tests__ --no-coverage
```

| Metric | Value |
|--------|-------|
| Test suites | **15 passed** / 15 total |
| Tests | **134 passed** / 134 total |
| Date | 2026-06-01 |
| Classification | light validated (unit/lib only) |

## Code touch (summary)

- `src/lib/sales/evidence-links.ts` — `listEvidenceLinksForOrganization`
- `src/actions/sales-actions.ts` — `listOrgSalesEvidenceLinksAction`
- `src/app/sales/evidence/page.tsx` — new page
- `src/components/sales/sales-shell.tsx` — nav link «الأدلة»

## Known limitations

- No `npm run build`, no migrate, no browser smoke in this session.
- `docs/pilot/` onboarding folder still missing (PR-19 partial).
- L6 pilot-ready requires human checklist sign-off + DB deploy evidence.

## Arabic one-liner

بوابة PR-20: صفحة أدلة org-scoped، توثيق L6، إصلاح ترميز مكوّنات المبيعات، Jest 15/15 و134/134 — جاهزية pilot بشروط وليست إنتاجاً.