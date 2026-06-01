# AuditOS v0.1 — Environment Inventory

**Date:** 2026-05-28  
**Scope:** Controlled single-instance deployment rehearsal  
**Classification:** Operational reference — not enterprise certification

---

## Purpose

This document lists the **actual runtime dependencies** AuditOS v0.1 requires on a private server or VPS. It reflects code reality in this repository, not marketing claims.

---

## Runtime Stack

| Component         | Version / assumption                                | Source                          |
| ----------------- | --------------------------------------------------- | ------------------------------- |
| **Node.js**       | 20.x recommended (Dockerfile uses `node:20-alpine`) | `Dockerfile`, `@types/node` ^20 |
| **npm**           | Bundled with Node                                   | `package-lock.json`             |
| **Next.js**       | 16.2.4 (App Router)                                 | `package.json`                  |
| **PostgreSQL**    | 15+ (16 used in `docker-compose.yml`)               | Prisma datasource               |
| **Process model** | Single Next.js Node process (`next start`)          | `package.json` scripts          |
| **Build**         | `prisma generate && next build --webpack`           | `package.json` `build` script   |

---

## Required Environment Variables

These must be set for the application to start and authenticate users.

| Variable       | Used by                                                                   | Purpose                      |
| -------------- | ------------------------------------------------------------------------- | ---------------------------- |
| `DATABASE_URL` | Prisma (`src/lib/prisma.ts`)                                              | PostgreSQL connection string |
| `AUTH_SECRET`  | NextAuth (`src/lib/auth-config.ts`), middleware JWT (`src/middleware.ts`) | JWT session signing secret   |

**Note:** `scripts/validate-env.mjs` also accepts `NEXTAUTH_SECRET` as a legacy alias, but runtime code reads **`AUTH_SECRET`**. Set `AUTH_SECRET` in production.

---

## Recommended for Controlled Deployment

| Variable                | Used by                                                             | Purpose                                                             |
| ----------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `NEXTAUTH_URL`          | NextAuth callbacks                                                  | Canonical public URL (required behind reverse proxy)                |
| `DOWNLOAD_TOKEN_SECRET` | `src/lib/download-token.ts`                                         | HMAC secret for signed evidence download URLs (optional at startup) |
| `LOCAL_STORAGE_DIR`     | `src/lib/platform/storage/local-storage-provider.ts`, audit storage | Writable directory for uploaded evidence and files                  |
| `NODE_ENV`              | Throughout                                                          | Set to `production` on deployment host                              |

**`DOWNLOAD_TOKEN_SECRET` behavior:** optional for app startup. Session-authenticated evidence downloads work without it. Required only when generating or verifying **token-based** download URLs; missing value causes runtime error on that code path only.

---

## Optional Environment Variables

| Variable                                | Default                                 | Purpose                                                                                                        |
| --------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `STORAGE_PROVIDER`                      | `local`                                 | Storage backend selector. **`local` only is integrated for v0.1.** `s3` / `azure-blob` stubs throw at runtime. |
| `LOG_LEVEL`                             | `info` in production, `debug` otherwise | `src/lib/logger.ts`                                                                                            |
| `NEXT_PUBLIC_APP_URL`                   | —                                       | Public URL for client-side links                                                                               |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`          | —                                       | Optional analytics                                                                                             |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | —                                       | Optional error monitoring via `@sentry/nextjs`                                                                 |
| `AI_CLOUD_API_KEY`                      | —                                       | Optional cloud AI assistive features                                                                           |
| `AI_CLOUD_BASE_URL`                     | —                                       | Cloud AI provider endpoint                                                                                     |
| `AI_CLOUD_MODEL`                        | —                                       | Default AI model                                                                                               |
| `AI_CLOUD_PROVIDER_NAME`                | `cloud-api`                             | AI provider label in logs                                                                                      |
| `AI_LOCAL_BASE_URL`                     | —                                       | Local AI stub (strategic, not production package)                                                              |
| `AI_LOCAL_MODEL`                        | —                                       | Local AI model name                                                                                            |
| `SCANNER_PROVIDER`                      | none                                    | Virus scan hook — **configured but not integrated** (`src/lib/audit/file-scanner.ts`)                          |
| `AUDIT_ALLOW_MOCK_FALLBACK`             | `false`                                 | Allows mock DB fallback in audit services (dev only)                                                           |
| `AUDIT_DEV_FALLBACK_ENABLED`            | `false`                                 | Dev actor fallback (`src/lib/audit/actor-context.ts`)                                                          |
| `PILOT_REVIEW_WEBHOOK_URL`              | —                                       | Optional pilot review webhook                                                                                  |
| `RESEND_API_KEY`                        | —                                       | Custom product form email (not AuditOS core)                                                                   |
| `AQLIYA_INTERNAL_METRICS_TOKEN`         | —                                       | Internal ops token gating `GET /api/metrics`. Caller sends it via the `x-aqliya-ops-token` header. Unset / missing / mismatch ⇒ **404**. Additional ops gate; does **not** replace the session + ADMIN check. Use a high-entropy secret. |
| `ANALYZE`                               | `false`                                 | Bundle analyzer toggle                                                                                         |

---

## Storage Assumptions

### Default (local filesystem)

| Setting                   | Value                                                           |
| ------------------------- | --------------------------------------------------------------- |
| Provider                  | `STORAGE_PROVIDER=local` (default)                              |
| Base directory            | `LOCAL_STORAGE_DIR` or `./uploads` relative to `process.cwd()`  |
| Evidence key pattern      | `engagements/{engagementId}/evidence/{evidenceId}/{filename}`   |
| Path traversal protection | Yes — keys normalized and bounded to base dir                   |
| Persistence               | **Must survive restarts** — bind mount or dedicated disk volume |

### Object storage (not ready for v0.1)

`src/lib/audit/storage/object-storage-provider.ts` throws for `s3` and `azure-blob`. Do not set non-local providers for controlled deployment.

### Export generation

Audit exports (PDF/XLSX) are generated **in memory** and streamed via API routes. They are **not** written to persistent export directories by default.

---

## Database Assumptions

| Item               | Assumption                                                                |
| ------------------ | ------------------------------------------------------------------------- |
| Engine             | PostgreSQL                                                                |
| ORM                | Prisma 7 with `@prisma/adapter-pg`                                        |
| Schema apply       | `npx prisma db push` or `npx prisma migrate deploy`                       |
| Seed (rehearsal)   | `npm run seed:audit` after main `prisma db seed` if platform users needed |
| Connectivity check | `npm run audit:health` or `GET /api/health`                               |

Single-database, single-tenant-per-org model. No read replicas or sharding in v0.1.

---

## Filesystem Assumptions

| Path                              | Writable              | Purpose                                       |
| --------------------------------- | --------------------- | --------------------------------------------- |
| `uploads/` or `LOCAL_STORAGE_DIR` | **Yes**               | Evidence and platform file storage            |
| `backups/`                        | **Yes** (for scripts) | `npm run backup` / `npm run db:backup` output |
| `.next/`                          | Build artifact        | Created at build time                         |
| `node_modules/`                   | Install time          | Dependencies                                  |

On Linux VPS, run the app user with write access to storage and backup directories only.

---

## Auth Configuration

| Item             | Reality                                         |
| ---------------- | ----------------------------------------------- |
| Provider         | NextAuth v5 Credentials provider                |
| Session          | JWT (not database sessions)                     |
| Protected routes | Middleware on `/audit/*` and sensitive `/api/*` |
| Public demo      | `/auditos/*` — mock only, no real tenant data   |
| SSO/LDAP/AD      | **Not implemented**                             |

Platform `User` (login) and `AuditUser` (workspace role) are separate records linked by email + organization. Users may authenticate but fail AuditOS access if not provisioned.

---

## External Service Dependencies

| Service                | Required? | Notes                                              |
| ---------------------- | --------- | -------------------------------------------------- |
| PostgreSQL             | **Yes**   | Primary data store                                 |
| SMTP / Resend          | No        | Only for marketing custom-product form             |
| Cloud AI API           | No        | Assistive features only; workflow works without AI |
| Sentry                 | No        | Optional error reporting                           |
| Plausible              | No        | Optional analytics                                 |
| ClamAV / virus scanner | No        | Hook exists; not integrated                        |

---

## Validation Scripts

| Command                | Purpose                                          |
| ---------------------- | ------------------------------------------------ |
| `npm run validate:env` | Checks required env vars (runs on `postinstall`) |
| `npm run audit:health` | AuditOS-specific DB and seed sanity checks       |
| `GET /api/health`      | Liveness + DB + local storage writable check     |

---

## Env Alignment (Track C.1 — 2026-05-28)

| Item                                                                   | Status                                                                                         |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `AUTH_SECRET` primary in `.env.example`, `docker-compose.yml`, runtime | **Aligned**                                                                                    |
| `NEXTAUTH_SECRET`                                                      | Legacy alias in `validate-env.mjs` only; not used by auth runtime                              |
| `output: 'standalone'` in `next.config.mjs`                            | **Enabled** — matches `Dockerfile`                                                             |
| `docker-compose.yml` upload volume                                     | **`uploads:/app/uploads`** with `LOCAL_STORAGE_DIR=/app/uploads`                               |
| Docker build postinstall                                               | **`npm ci --ignore-scripts`** in Dockerfile — postinstall must not run before schema is copied |
| Host vs compose Postgres                                               | **`localhost:5432` may not be compose DB** — seed via compose network `@db:5432`               |

---

## References

- Deployment guide: `docs/deployment/auditos-v0.1-deployment-guide.md`
- Security posture: `docs/deployment/auditos-v0.1-security-posture.md`
- Go/No-Go review: `docs/reports/auditos-v0.1-go-no-go-review-2026-05-28.md`
