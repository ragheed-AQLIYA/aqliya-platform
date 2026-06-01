# LocalContentOS B1 — Migration SQL encoding fix (commit-ready)

**Date:** 2026-06-01  
**Repo:** `C:\Users\PC\Documents\Aqliya`  
**Scope:** SalesOS P1 migration SQL encoding only + separate B1 evidence docs  
**Production claim:** **NO**  
**Validation:** Light validated (encoding bytes checked; read-only `migrate status` on pilot DB only)

---

## 1. Migration SQL encoding (verify / fix)

| Migration folder | Prior issue (Option A) | After verify/fix |
|------------------|------------------------|------------------|
| `20260601150000_salesos_p1_interactions` | UTF-8 **with BOM** | **UTF-8 no BOM** (leading bytes `2D 2D 20` = `-- `) |
| `20260601170000_salesos_p1_contacts` | **UTF-16 LE** | **UTF-8 no BOM** (leading bytes `2D 2D 20`; no NUL bytes) |

**Action taken:** Re-normalized both `migration.sql` files to UTF-8 without BOM (idempotent if already correct).

**Paths:**

- `prisma/migrations/20260601150000_salesos_p1_interactions/migration.sql`
- `prisma/migrations/20260601170000_salesos_p1_contacts/migration.sql`

**Not in this commit:** Other SalesOS migration folders (`20260601140000_*`, `20260601160000_*`) — encoding not part of this fix batch.

---

## 2. Read-only `prisma migrate status` (pilot DB)

- **Shared `aqliya`:** not queried; **no** `migrate deploy` / **no** migrate on shared DB.
- **`.env`:** **not** edited.
- **Session `DATABASE_URL`:** derived from existing `.env` by replacing DB segment with `aqliya_lc_pilot` (credentials redacted).

**Command (PowerShell, one-off env override):**

```powershell
cd C:\Users\PC\Documents\Aqliya
$envLine = (Get-Content ".env" | Where-Object { $_ -match '^DATABASE_URL=' -and $_ -notmatch '^\s*#' } | Select-Object -First 1)
$dbUrl = $envLine -replace '^DATABASE_URL=\s*["'']?|["'']?\s*$',''
$env:DATABASE_URL = $dbUrl -replace '/aqliya(\?|$)','/aqliya_lc_pilot$1'
npx prisma migrate status
```

**Captured output (2026-06-01):**

```
Datasource "db": PostgreSQL database "aqliya_lc_pilot", schema "public" at "localhost:5432"
17 migrations found in prisma/migrations
Database schema is up to date!
```

---

## 3. Git status (scoped paths)

```text
 M docs/releases/localcontentos-completion/localcontentos-b1-operator-approval-gate.md
 M docs/releases/localcontentos-completion/localcontentos-l6-completion-status.md
?? docs/releases/localcontentos-completion/localcontentos-b1-option-a-execution-log.md
?? prisma/migrations/20260601150000_salesos_p1_interactions/
?? prisma/migrations/20260601170000_salesos_p1_contacts/
```

**Working tree note:** Full repo has additional unrelated modified/untracked files (e.g. `prisma/schema.prisma`, SalesOS app sources, temp scripts). Use **path-scoped** `git add` below — do not `git add .`.

---

## 4. Commit A — migration encoding fix (SalesOS P1 SQL only)

**Commit gate:** Proceed only if `git diff --cached --stat` shows **exclusively** the two `migration.sql` paths below.

```powershell
cd C:\Users\PC\Documents\Aqliya

git add `
  prisma/migrations/20260601150000_salesos_p1_interactions/migration.sql `
  prisma/migrations/20260601170000_salesos_p1_contacts/migration.sql

git diff --cached --stat

git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "fix(prisma): normalize SalesOS P1 migration SQL to UTF-8" -m "Re-encode interactions and contacts migration.sql as UTF-8 without BOM so Prisma/PostgreSQL apply cleanly on LC pilot."
```

---

## 5. Commit B — B1 evidence docs (execution log, gate appendix, L6 status)

**Stage list:**

- `docs/releases/localcontentos-completion/localcontentos-b1-option-a-execution-log.md`
- `docs/releases/localcontentos-completion/localcontentos-b1-operator-approval-gate.md` (includes **Option A execution — evidence appendix**)
- `docs/releases/localcontentos-completion/localcontentos-l6-completion-status.md`

```powershell
cd C:\Users\PC\Documents\Aqliya

git add `
  docs/releases/localcontentos-completion/localcontentos-b1-option-a-execution-log.md `
  docs/releases/localcontentos-completion/localcontentos-b1-operator-approval-gate.md `
  docs/releases/localcontentos-completion/localcontentos-l6-completion-status.md

git diff --cached --stat

git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "docs(localcontentos): record B1 Option A pilot evidence" -m "Add execution log and gate appendix updates; refresh L6 completion status after LC pilot migrate status check."
```

---

## 6. Agent commit decision (this session)

| Check | Result |
|-------|--------|
| Encoding fix verified | **Yes** (UTF-8 no BOM on both files) |
| Pilot `migrate status` | **Up to date** (17 migrations; read-only) |
| Scoped paths ready | **Yes** |
| Auto-commit executed | **No** — operator runs Commits A/B from this doc with path-scoped adds |

Optional: add this file to Commit B if you want the commit recipe in-repo.

---

## 7. Explicit non-actions

- No `migrate deploy` on shared `aqliya`
- No `.env` edit
- No production-ready claim
