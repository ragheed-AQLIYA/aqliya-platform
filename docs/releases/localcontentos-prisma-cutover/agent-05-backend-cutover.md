# Agent 05 — Repository Backend Cutover

**File:** `src/lib/local-content/content/repository-instance.ts`

## Default backend resolution

1. `LOCALCONTENT_CONTENT_BACKEND=file|prisma` — explicit override
2. `configureContentRepositoryBackend()` — programmatic override (tests)
3. `DATABASE_URL` set → **prisma**
4. Otherwise → **file** (local/no-db mode)

## Fallback behavior

- File backend remains available when `DATABASE_URL` is unset or `LOCALCONTENT_CONTENT_BACKEND=file`
- Tests force file via `resetContentRepositoryForTests()` (`backendOverride = "file"`)
- Production-like mode without DB must set `LOCALCONTENT_CONTENT_BACKEND=file` explicitly — not silent Prisma fallback to file when DB configured

## Environment flag

`LOCALCONTENT_CONTENT_BACKEND` — optional; values `file` | `prisma`
