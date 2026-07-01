# SalesOS L6 — Operational closure preflight (Phase 1)

**Date:** 2026-06-01  
**Sprint:** L6 Operational Closure  
**Repo:** `C:\Users\PC\Documents\Aqliya`  
**Session classification:** Phase 1 only — **no** `-Execute`, **no** `migrate deploy`, **no** `prisma generate`  
**Validation:** not validated (DB/browser)

---

## 1. What Phase 0 does

`scripts/salesos-phase0-apply.ps1` is the **human operator pack** for applying SalesOS v0.3 schema to a target PostgreSQL database (dev/staging/pilot). It sequences:

| Step | Command | Effect |
|------|---------|--------|
| Pre-flight | `npx prisma validate` | Read-only schema check |
| Pre-flight | `npx prisma migrate status` | Read-only pending/failed migration report |
| Apply | `npx prisma migrate deploy` | Applies **all pending** folder migrations in order (platform + SalesOS) |
| Client | `npx prisma generate` | Regenerates Prisma Client |
| Seed | `npx tsx scripts/seed-sales-demo.ts` | Idempotent SalesOS demo data (unless `-SkipSeed`) |

**Default mode:** PLAN (echo only) — prints `cd` + commands, runs nothing.  
**Execute mode:** `-Execute` — runs each step sequentially; stops on first non-zero exit except `migrate status` exit **1** (documented B1 drift), which **WARN**s and stops unless `-ForceDrift` is also passed.

Optional platform-wide seed: `$env:SEED_SALES_DEMO='1'; npx prisma db seed` (documented in script footer).

---

## 2. Commands (this session)

### Allowed (executed)

```powershell
cd C:\Users\PC\Documents\Aqliya
git status -sb
powershell -ExecutionPolicy Bypass -File scripts/salesos-phase0-apply.ps1
```

**Echo output captured (2026-06-01):**

```
Mode: PLAN (echo only). Pass -Execute to run commands.
--- Pre-flight: validate schema ---     npx prisma validate
--- Pre-flight: migration status ---    npx prisma migrate status
--- Apply: migrate deploy ---           npx prisma migrate deploy
--- Client: prisma generate ---         npx prisma generate
--- Seed: SalesOS demo ---              npx tsx scripts/seed-sales-demo.ts
Done (plan only). Re-run with -Execute after drift review.
```

### Blocked until explicit user approval

```powershell
powershell -ExecutionPolicy Bypass -File scripts/salesos-phase0-apply.ps1 -Execute
powershell -ExecutionPolicy Bypass -File scripts/salesos-phase0-apply.ps1 -Execute -ForceDrift
npx prisma migrate deploy
npx prisma generate
npm run build
npm run lint
npm test
```

---

## 3. Database impact (if `-Execute` approved)

### SalesOS migration folders (local `prisma/migrations/`)

| Folder | Logical name | Creates (summary) |
|--------|--------------|-------------------|
| `20260601140000_salesos_p0_core` | salesos_p0_core | SalesPipeline, stages, SalesAccount, SalesDeal, SalesAuditEvent |
| `20260601150000_salesos_p1_interactions` | salesos_p1_interactions | SalesInteraction |
| `20260601160000_salesos_p1_evidence` | salesos_p1_evidence | SalesEvidenceLink |
| `20260601170000_salesos_p1_contacts` | salesos_p1_contacts | Sales contact slice (present in repo; **not** listed in Phase 0 script comments — still applied by `migrate deploy` when pending) |

**Order:** Prisma applies **entire** migration chain by timestamp — SalesOS folders are **after** `20260601120000_localcontentos_content_studio`. Earlier platform migrations must already be applied on the target DB.

### Seed impact

- Requires at least one `Organization` row (from platform seed).
- Creates default pipeline, `[DEMO]` accounts/deals, audit samples, interactions; evidence link smoke may skip without real Core evidence IDs.
- Tag: `salesos-v03-pr5` (+ ICP/signals demo tags in script).

### Shared DB drift (B1 — critical)

Runbook §7 documents **six legacy SalesOS migration names** applied in some DBs but **missing** from local `prisma/migrations/`. On shared `aqliya` @ localhost this can make blind `migrate deploy` **unsafe** (fail mid-chain or mask mismatch). See:

- `docs/operations/salesos-migration-runbook.md` §7
- `docs/releases/localcontentos-completion/localcontentos-b1-operator-approval-gate.md`

**Operator must** run `npx prisma migrate status` on the **target** DB and reconcile drift **before** `-Execute`. If drift is **documented** (runbook §7.1) and deploy is still approved after reconciliation, use **`-Execute -ForceDrift`** so the script warns instead of hard-stopping at status exit 1.

---

## 4. Generated / changed artifacts (after Execute)

| Artifact | When |
|----------|------|
| PostgreSQL DDL (Sales* tables) | `migrate deploy` |
| `_prisma_migrations` rows | `migrate deploy` |
| `node_modules/.prisma/client` | `prisma generate` |
| Demo Sales rows | `seed-sales-demo.ts` |

**Not generated in Phase 1 session:** no client regen, no DB writes.

---

## 5. Rollback

| Action | Guidance |
|--------|----------|
| **Forbidden without approval** | `migrate reset`, `db push` for rollback, DROP Sales* tables, delete `_prisma_migrations` rows |
| **Safer** | Restore DB from backup; forward-fix migration after team review |
| **Script failure** | Fix drift per runbook §7; retry with `-Execute -ForceDrift` only after documented drift review |

---

## 6. Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| B1 shared-DB drift | High | Dedicated pilot DB or signed B1 reconciliation before deploy |
| Full chain deploy (not SalesOS-only) | Medium | `migrate deploy` applies **all** pending migrations, not SalesOS slice alone |
| UTF-16 migration.sql | Medium | Re-save `salesos_p1_evidence` SQL as UTF-8 if deploy fails |
| Uncommitted WIP on `main` | Medium | Branch ahead 6; SalesOS paths untracked/modified — commit plan before production pilot |
| False L6 claim | High | No institutional L6 until Phase 0 log + browser smoke + checklist sign-off |
| Auto-send / production | Blocker | Product forbids email send; production label forbidden |

---

## 7. Repo state snapshot (preflight)

- **Branch:** `main` ahead of `origin/main` by 6 commits  
- **SalesOS:** migrations + routes + actions present (many **untracked** in `git status`)  
- **Nav:** `/sales/evidence` wired in `sales-shell.tsx` (`الأدلة`)  
- **PRODUCT_STATUS_MATRIX:** SalesOS row already synced to v0.3 / L6 not achieved  
- **Unit tests:** Prior pass cited in integrator docs (153 tests) — **not re-run** this session (low-load)

---

## 8. Recommendation

| Decision | Verdict |
|----------|---------|
| **Proceed to Phase 0 `-Execute`?** | **Conditional proceed** — only after human reviews `migrate status` on **chosen pilot DB**, B1 drift decision recorded, and explicit approval in this session |
| **Claim L6 institutional now?** | **Do not proceed** (documentation-only) |
| **Claim pilot-ready with conditions?** | **Yes for code**; **no for operations** until Execute + smoke + sign-off |

**Next single step for user:** Approve and run:

```powershell
cd C:\Users\PC\Documents\Aqliya
powershell -ExecutionPolicy Bypass -File scripts/salesos-phase0-apply.ps1 -Execute
# If status exit 1 is documented B1 drift only, after reconciliation:
powershell -ExecutionPolicy Bypass -File scripts/salesos-phase0-apply.ps1 -Execute -ForceDrift
```

Capture `migrate status` output before and after; then complete browser smoke per `docs/reports/salesos-l6-browser-smoke-report.md`.

---

## Related documents

- `docs/operations/salesos-migration-runbook.md`
- `docs/product/salesos-maturity-l3-l6.md`
- `docs/reports/salesos-l6-readiness-assessment.md`
- `docs/reports/salesos-l6-final-handoff.md`

### Arabic one-liner

المرحلة 1: مراجعة Phase 0 فقط — لا تنفيذ على القاعدة؛ المتابعة بشرط موافقة صريحة ومراجعة انحراف B1؛ عند exit 1 من migrate status استخدم `-Execute -ForceDrift` بعد المراجعة.
