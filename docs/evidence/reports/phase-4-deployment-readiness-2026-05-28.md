# Phase 4 — Deployment Readiness Assessment

**Date:** 2026-05-28
**Agent:** Deployment Readiness Agent
**Status:** Assessment complete
**Rule:** No cloud-native scalability claims unless validated.

---

## Files Inspected

| File | Role |
|------|------|
| `.env` | Current environment variables |
| `.env.example` | Template env vars |
| `.env.test.example` | Test env vars (not read) |
| `next.config.mjs` | Next.js configuration |
| `prisma/schema.prisma` | Database schema |
| `src/lib/platform/audit-log.ts` | Audit write helper |
| `src/lib/platform/audit-logger.ts` | Audit logger factory |
| `src/lib/platform/storage/index.ts` | Storage provider factory |
| `src/lib/audit/storage/index.ts` | Audit storage provider factory |
| `src/lib/rate-limit.ts` | Rate limiter |
| `src/lib/audit/rate-limit.ts` | Audit rate limiter |
| `sentry.server.config.ts` | Error monitoring config |
| `package.json` (via npm ls) | Dependencies |

---

## Deployment Models

### 1. Local Development

| Requirement | Status | Notes |
|-------------|--------|-------|
| PostgreSQL | ✅ Required | `DATABASE_URL` in `.env` |
| Node.js 20+ | ✅ Required | `@types/node@20` |
| npm install | ✅ Standard | All deps in package.json |
| Prisma generate | ✅ Required | Post-install step |
| Local storage dir | ✅ Default `./uploads` | `LOCAL_STORAGE_DIR` env override |
| Sentry DSN | ❌ Empty | Not needed in development |

**Readiness:** ✅ Ready for local development

### 2. VPS / Single-Server Deployment

| Requirement | Status | Notes |
|-------------|--------|-------|
| PostgreSQL server | ✅ Required | Could be same host or managed |
| Environment variables | ✅ Via `.env` or process env | 7 required variables |
| Build step | ✅ `npm run build` | Next.js standalone output |
| Asset storage | ⚠️ Local filesystem | `./uploads` must be persisted across deploys |
| Rate limiting | ⚠️ In-memory only | Per-instance, not shared |
| Session store | ⚠️ JWT only | No server-side session store needed |
| File upload size | ⚠️ Size limit exists | Not reviewed for large files |
| HSTS | ❌ Not configured | Header not in middleware |
| SSL termination | ❌ Not built-in | Requires reverse proxy (nginx/Caddy) |

**Readiness:** ⚠️ Functional with caveats

**Blockers:**
- Local filesystem storage (`./uploads`) must be persisted or backed up
- In-memory rate limiting resets on restart
- No HSTS header

### 3. Private Deployment (Customer Environment)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Single-tenant | ✅ Architecture supports | orgId scoping works |
| PostgreSQL | ✅ Required | Standard dependency |
| File persistence | ⚠️ Local dir or S3 | S3 provider defined but untested |
| Backup strategy | ❌ Not defined | No backup/restore tooling |
| Monitoring | ⚠️ Sentry (optional) | Requires DSN config |
| Migration automation | ⚠️ Manual | Prisma migrate must be run manually |
| Container support | ❌ Not built | No Dockerfile |
| Health endpoint | ⚠️ `/monitoring` exists | L4 — functional but limited |

**Readiness:** ⚠️ Functional core, missing deployment tooling

### 4. Air-Gapped Deployment

| Requirement | Status | Notes |
|-------------|--------|-------|
| No external dependencies | ❌ npm registry required at build | Could vendor node_modules |
| No CDN dependencies | ✅ No external CDN deps | All assets from Next.js build |
| Local AI runtime | ❌ Not implemented | External API calls for AI |
| Offline operation | ❌ Not validated | Assume AI calls fail without connectivity |

**Readiness:** ❌ Not viable for v0.1

**Stated correctly in docs:** Air-gapped is listed as "strategic / future" in AQLIYA_MASTER_REFERENCE.md.

---

## Environment Coupling Risks

| Risk | Impact |
|------|--------|
| `NEXTAUTH_URL` hardcoded to `localhost:3000` | Must change per environment |
| `NEXT_PUBLIC_APP_URL` not in `.env.example` but expected by some components | May cause URL mismatches |
| `AUTH_URL` duplicates `NEXTAUTH_URL` | Confusion; should consolidate |
| `DOWNLOADE_TOKEN_SECRET` not in `.env.example` | Missing configuration documented |
| `LOG_LEVEL` in `.env.example` but no log level read in code | Dead config |
| `SENTRY_DSN` empty — enabled only in production | Good pattern but needs docs |

---

## Local-Only Assumptions

| Assumption | Where | Risk |
|------------|-------|------|
| In-memory rate limiting | `rate-limit.ts`, `audit/rate-limit.ts` | Per-instance only; multi-instance deployment bypasses limits |
| Local filesystem storage | `platform/storage/`, `audit/storage/` | Single-server only; not shared across instances |
| `./uploads` directory | Default storage location | Must exist and be writable |
| `crypto.subtle` (Web Crypto) | `download-token.ts` | Available in Edge and Node.js — but check environment support |
| `setInterval` in route modules | `office-ai/download/route.ts`, `audit/rate-limit.ts` | HMR leaks; edge runtime may not support |

---

## Build Assumptions

| Assumption | Status |
|------------|--------|
| `serverExternalPackages` includes prisma/pg/pdfkit | ✅ Configured |
| `removeConsole` excludes error/warn in production | ✅ Configured |
| Bundle analyzer via ANALYZE env | ✅ Configured |
| Sentry build plugin | ✅ Graceful fallback if not installed |
| next-intl (i18n) | ✅ Configured via `createNextIntlPlugin` |

---

## Next.js Deployment Constraints

| Constraint | Status |
|------------|--------|
| Node.js runtime (not Edge) for API routes | ✅ Assumed — `serverExternalPackages` confirms |
| Static export | ❌ Not compatible (requires server for auth and API) |
| `output: "standalone"` | ❌ Not configured |
| Docker | ❌ No Dockerfile |
| Image optimization | ✅ Configured (AVIF/WebP, device sizes) |

---

## Deployment Readiness Matrix

| Environment | Readiness | Blockers | Effort to Resolve |
|-------------|-----------|----------|-------------------|
| Local development | ✅ Ready | None | — |
| VPS / single-server | ⚠️ Conditional | Uploads persistence, rate limiting restart, HSTS | ~1-2 days |
| Private / customer | ⚠️ Partial | Backup strategy, container, migration automation | ~1-2 weeks |
| Air-gapped | ❌ Not viable | No local AI, npm dependency | Strategic/future |
| Multi-instance | ❌ Not viable | In-memory rate limiting, local storage | Blocking |

---

## Assessment Summary

| Dimension | Maturity |
|-----------|----------|
| Local development | L5 (ready, documented) |
| Single-server deployment | L3 (functional but no tooling) |
| Multi-instance deployment | L1 (blocked by in-memory state) |
| Air-gapped deployment | L0 (strategic/future) |
| Backup/restore | L0 (not implemented) |
| Containerization | L0 (no Dockerfile) |
| Environment configuration | L3 (incomplete env template) |
| Monitoring | L4 (Sentry configured, `/monitoring` route) |
