# Cursor Development Workflow — AQLIYA

**Status:** Operator guide  
**Principle:** *الذكاء يساعد — الإنسان يقرر — الأدلة تحكم*

## 1. Before coding

1. Read `AGENTS.md` and `docs/DOCUMENTATION_AUTHORITY.md`.
2. Identify product/module (Platform, AuditOS, SalesOS, WorkflowOS, LocalContentOS).
3. Check `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` for honest maturity.
4. Use branch naming: `feature/<product>-<goal>` (e.g. `feature/salesos-l6-unblock`).

## 2. Workspace setup

- Open repo root: `C:\Users\PC\Documents\Aqliya` (or project clone).
- Run `npx prisma validate` before schema edits.
- Prefer **dedicated pilot DB** when shared dev DB shows B1 drift (`migrate deploy` P3005 / `db push` data-loss).

## 3. Execution waves (default)

| Wave | Focus |
|------|--------|
| 0 | Git inventory, meaningful commits, prisma validate/status |
| 1 | Migrations, generate, backfills, seed |
| 2 | Product code fixes (minimal diff, existing patterns) |
| 3 | `.next` clear, targeted Jest, `tsc`, `next build --webpack` |
| 4 | Dev server + curl/browser smoke |
| 5 | Docs, `.cursor/rules`, status matrix |
| 6 | Commits + handoff report |

## 4. Validation labels (mandatory)

- **not validated** — not run or failed
- **light validated** — subset passed with documented gaps
- **build validated** — green `next build` + targeted tests
- **pilot-ready with conditions** — build + smoke + ops gates documented
- **production no-go** — default until CI, backup, SSO, migrate signed

Never claim production-ready without evidence in repo.

## 5. Commit discipline

- Commit L5/L6 recovery in dedicated messages before wide refactors.
- Do not commit `.env`, secrets, or `.next`.
- Stage untracked product trees intentionally (`git add src/lib/sales src/app/sales ...`).

## 6. Agent parallelization (Phases 9–12)

- **Migration Agent:** prisma migrate baseline, pilot DB, backfills
- **SalesOS Agent:** actions, bundler, sales tests
- **AuditOS Agent:** protect L5 routes; vnext stubs only when blocking build
- **Platform Agent:** core stubs, rules, CI, docs
- **Smoke Agent:** dev server, curl, browser checklist

## 7. Human gates (minimize)

- PO sign-off (LocalContentOS, production)
- Production infra (SSO, backup automation, CI tests)
- Shared DB baseline when drift blocks migrate
