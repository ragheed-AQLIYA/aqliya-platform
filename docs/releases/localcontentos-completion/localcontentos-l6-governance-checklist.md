# LocalContentOS L6 — Governance Checklist

**Program:** LocalContentOS L6 — Institutional Pilot-Ready  
**Worker:** 5 — Governance & Persistence  
**Date:** 2026-06-01  
**Production claim:** **NO**  
**Validation:** Code/doc review + read-only `npx prisma migrate status` — not build/lint/full suite

---

## 1. Permission registry (verified)

All six Content Studio permissions are declared consistently in `product-registry.ts`, `local-content/registry.ts`, `content/contracts.ts`, and `content/permissions.ts`:

| Permission | VIEWER | OPERATOR | ADMIN |
|------------|--------|----------|-------|
| localcontentos:read | Yes | Yes | Yes |
| localcontentos:create | — | Yes | Yes |
| localcontentos:update | — | Yes | Yes |
| localcontentos:review | — | Yes | Yes |
| localcontentos:approve | — | — | Yes |
| localcontentos:export | — | — | Yes |

Workspace actions use `assertLocalContentPermission` on every mutation path. Compliance workspace uses `assertProjectAccess` (L5; separate from `localcontentos:*` keys).

---

## 2. Platform audit integration

**Compliance** (`localcontent-actions.ts`): all write actions call `logToPlatform` with `Product.LOCAL_CONTENT` / `localcontent_compliance`.

**Content Studio** (`local-content-workspace-actions.ts`): 12 mutation paths call `logContentStudioAudit` (`localcontentos_content_studio`).

**Downloads:** report and evidence API routes use `auditLogger` + `Product.LOCAL_CONTENT`.

Dual-write failures are non-blocking.

---

## 3. L6 persistence

See `localcontentos-migration-readiness.md` — Content Studio migration applied on localhost; SalesOS drift **OUT OF SCOPE**.

| Path | Backend | When |
|------|---------|------|
| **Institutional / pilot** | Prisma | `DATABASE_URL` set; optional `LOCALCONTENT_CONTENT_BACKEND=prisma` |
| **Unit tests** | File (`.data/localcontentos-content/store.json`) | `NODE_ENV=test` + `resetContentRepositoryForTests()` → `LOCALCONTENT_CONTENT_BACKEND=file` override |
| **Dev without DB** | File | Default when `DATABASE_URL` unset and not production-like |

**B3 dual-backend guard** (`repository-instance.ts`):

- Skipped when `NODE_ENV=test` (unit tests use file via `resetContentRepositoryForTests()`).
- **Production-like** = `NODE_ENV=production` **or** `LOCALCONTENT_CONTENT_BACKEND=prisma`.
- Explicit `LOCALCONTENT_CONTENT_BACKEND=file` or Prisma requested without `DATABASE_URL` → **throws** (no file backend in institutional path).
- `NODE_ENV=production` without DB and no explicit file flag → **warns** if file backend resolves (institutional path expects Prisma).

**Status:** guard implemented; shared pilot DB + backup/restore not validated. **Production claim: NO.**

---

## 4. Worker 5 status

| Item | Status |
|------|--------|
| Permission registry (6 keys) | Done |
| Compliance platform audit | Done |
| Content Studio platform audit | Done |
| L6 persistence documented | Done |
| SalesOS drift blocker note | Done (no SalesOS fixes) |
| Production claim | **NO** |

---

## Related docs

- `localcontentos-migration-readiness.md`
- `localcontentos-l6-gap-matrix.md`
