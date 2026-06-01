# LocalContentOS L6 — Commit Plan (Recommended Split)

**Date:** 2026-06-01  
**Status:** NOT COMMITTED — plan only; no git operations performed  
**Program:** LocalContentOS L6 landing (post Worker 10 integrator closure)  
**Pre-commit gates:** Smoke **1–6 PASS** (Worker 2); **25/25** unit tests; user explicit "commit" instruction

## Principles

1. **Separate LocalContentOS from SalesOS** — SalesOS WIP must not land in LocalContentOS commits.
2. **Separate schema from migration SQL** — if `prisma/schema.prisma` mixes products, stage Content Studio models only or use `git add -p`.
3. **Docs last** — L6 completion docs reference final smoke + test evidence.
4. **Exclude scratch files** — `tmp-*.ts`, `tmp-*.cjs`, `tmp-*.mjs`, `.env`.

## Recommended commits (6)

### Commit 1 — Domain + service layer (incl. L6 hardening)

```
feat(localcontentos): add Content Studio domain, services, and L6 hardening
```

**Stage:** `src/lib/local-content/content/**`, `index.ts`, `registry.ts`, `jest.content-studio-prisma.config.js`

**Verify:** `npm test -- content-studio.test.ts` → **25/25 PASS**

### Commit 2 — Server actions + RBAC

```
feat(localcontentos): add governed workspace server actions
```

**Stage:** `src/actions/local-content-workspace-actions.ts`

**Verify:** grep `assertLocalContentPermission` on all mutations

### Commit 3 — UI routes and components

```
feat(localcontentos): add Content Studio UI routes and forms
```

**Stage:** `src/app/local-content/**` (Content Studio routes), `src/components/local-content/**`

**Exclude:** Any SalesOS or corrupted scratch components

### Commit 4 — Platform registry

```
feat(platform): register LocalContentOS in product registry
```

**Stage:** `src/lib/platform/product-registry.ts`, `src/lib/platform/index.ts` (export only — `git add -p`)

### Commit 5 — Prisma schema + migration (Content Studio only)

```
feat(prisma): add LocalContentOS Content Studio schema and migration
```

**Stage:** `prisma/migrations/20260601120000_localcontentos_content_studio/**`, Content Studio blocks in `schema.prisma`, LC-related `seed.ts` lines only

**Do NOT include:** SalesOS migrations (`20260601140000_*`, `20260601150000_*`, `20260601160000_*`)

**Note:** Migration applied on localhost per `localcontentos-migration-readiness.md`; **drift with SalesOS** — resolve before deploy on shared DB.

### Commit 6 — L6 completion documentation

```
docs(localcontentos): add L6 program evidence pack
```

**Stage:** `docs/releases/localcontentos-completion/**` including:

- `localcontentos-l6-readiness-scorecard.md`
- `localcontentos-l6-completion-status.md`
- `localcontentos-l6-final-report.md`
- `localcontentos-l6-gap-matrix.md`
- `localcontentos-l6-program-closure.md`
- `localcontentos-l6-roadmap.md`
- `agent-l6-*.md`
- Prior L4 completion docs (synced)

## Explicitly exclude

- `src/lib/sales/**`, `src/app/sales/**`, `src/actions/sales-actions.ts`
- SalesOS prisma migrations and seed scripts
- `tmp-*`, `.env`, unrelated release docs

## Pre-commit checklist

- [x] Smoke steps 1–6 PASS in `agent-14-smoke-results.md` (Worker 2; `crev_mpulmiwi_nzagcrh`)
- [ ] Unit tests **25/25 PASS** (`content-studio.test.ts`)
- [ ] LocalContentOS tsc clean (0 errors on LC paths)
- [ ] No secrets or scratch files staged
- [ ] User explicitly requested commit
- [ ] L6 scorecard reviewed — **L5 with conditions** acknowledged; **not** Production Ready

## Production claim

**NO**
