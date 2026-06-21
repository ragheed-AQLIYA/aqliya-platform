# AQLIYA Production Deployment Runbook

> **Version:** 1.4  
> **Last updated:** 2026-06-21  
> **Scope:** Production deployment of AQLIYA platform (Next.js 16, PostgreSQL 16, Prisma 7, Node.js 22)  
> **Changelog:**
> - v1.4 (2026-06-21): Tier 3 enterprise prep — Intelligence Core operator APIs, SSO/SCIM hardening checklist, Redis rate limiter verification, ABAC enforce pilot env vars.
> - v1.3 (2026-06-17): Added SAML SSO, ClamAV scanner, rate limiter guidance, ECS rollback, restore-drill script, CI Postgres service. Reflected current validated build state.
> - v1.2 (2026-06-09): Domain migration `aqliya.ai → aqliya.com`.
> - v1.1 (2026-06-04): Initial AWS ECS Fargate runbook.

---

## 1. Prerequisites

| Dependency | Version | Notes |
|------------|---------|-------|
| Node.js | 22+ | `node -v` |
| npm | 10+ | Ships with Node 22 |
| PostgreSQL | 16 | Running and reachable |
| Redis | 7+ | Session store / queue backend |

### System checks

```bash
node -v
npm -v
psql --version
redis-cli ping
```

---

## 2. Environment Variables

Copy `.env.example` to `.env` and fill all values:

```bash
cp .env.example .env
```

### Required variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | NextAuth secret (must match `NEXTAUTH_SECRET`) |
| `NEXTAUTH_SECRET` | NextAuth secret |
| `NEXTAUTH_URL` | Public-facing URL of the app |
| `STORAGE_PROVIDER` | `local` or `s3` |
| `UPLOAD_DIR` | Path for local file uploads |
| `REDIS_URL` | Redis connection string |
| `NEXT_PUBLIC_APP_URL` | Public app URL for client-side use |

### SSO / OAuth (L0-05)

| Variable | Description | Required for |
|----------|-------------|--------------|
| `SCIM_API_KEY` | Bearer token for SCIM v2 API | SCIM provisioning |
| `SSO_DEFAULT_ORG_ID` | Default org ID for SCIM-bound users | SCIM + SSO |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth credentials | Google sign-in |
| `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` | GitHub OAuth credentials | GitHub sign-in |
| `AUTH_AZURE_AD_ID` / `AUTH_AZURE_AD_TENANT_ID` / `AUTH_AZURE_AD_SECRET` | Azure AD OAuth | Azure AD sign-in |
| `AUTH_OKTA_ID` / `AUTH_OKTA_SECRET` / `AUTH_OKTA_ISSUER` | Okta OAuth | Okta sign-in |
| `AUTH_OIDC_ISSUER` / `AUTH_OIDC_CLIENT_ID` / `AUTH_OIDC_CLIENT_SECRET` | Custom OIDC | Custom OIDC sign-in |

### SAML SSO (if using SAML providers)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Used as SAML SP issuer and callback base URL |

SAML provider configuration (entry point, certificate, issuer) is stored encrypted in the `SsoProvider` database table. No env vars are needed for individual SAML providers.

### Security & Scanning

| Variable | Description | Default |
|----------|-------------|---------|
| `SCANNER_PROVIDER` | `none` or `clamav` | `none` |
| `CLAMAV_HOST` | ClamAV daemon hostname | `localhost` |
| `CLAMAV_PORT` | ClamAV daemon port | `3310` |

> **Production requirement:** Set `SCANNER_PROVIDER=clamav` and deploy a ClamAV daemon alongside the app container. `none` is fail-open (no scanning) — acceptable only in dev.

### Rate Limiting

| Variable | Description | Default |
|----------|-------------|---------|
| `RATE_LIMITER` | `memory` or `redis` | `memory` |
| `REDIS_URL` | Redis connection string | required if `redis` |

> **Production requirement:** Set `RATE_LIMITER=redis` for all multi-instance deployments (ECS Fargate, etc.). `memory` limits are per-process and not shared across tasks — use only for single-instance dev/staging.

**Verify before production deploy (I-03):**

```bash
# With RATE_LIMITER=redis and REDIS_URL set in .env
npm run verify:redis-rate-limiter
```

### Intelligence Core (Tier 2/3 — off by default)

| Variable | Description | Production pilot |
|----------|-------------|------------------|
| `FF_EVENT_OUTBOX` | Transactional outbox on audit writes | `true` when event fan-out needed |
| `FF_EVENT_SCHEMA_REGISTRY` | Validate event envelopes at outbox | `true` with outbox |
| `FF_ABAC_SHADOW` | ABAC shadow evaluation logging | default on; set `false` to disable |
| `FF_ABAC_ENFORCE` | Block on ABAC denial | `true` only after pilot review |
| `ABAC_ENFORCE_ORG_IDS` | Comma-separated org IDs for enforce | Required when enforce on |
| `FF_AUDIT_ISA_RULES` | ISA rules after FS rebuild | opt-in per engagement |

**Operator APIs (ADMIN, authenticated):**

| Endpoint | Purpose |
|----------|---------|
| `GET /api/platform/enterprise-health` | Tier 3 readiness snapshot |
| `GET /api/platform/outbox/status` | Outbox queue counts + failed rows |
| `POST /api/platform/outbox/process` | Process pending outbox batch |
| `POST /api/platform/outbox/retry` | Reset failed rows to pending |
| `GET /api/platform/abac/pilot-status` | ABAC enforce pilot readiness |
| `GET /api/platform/abac/shadow-report` | Shadow mismatch detail |

**Smoke (after deploy):**

```bash
npm run smoke:tier2
npm run smoke:tier3:http -- --base-url https://staging.aqliya.com
```

### SSO / SCIM production hardening (L4 built — Tier 3 scope)

SSO and SCIM are implemented; production scope is **configuration, scale, and operator procedure** — not new feature development.

| Check | Action |
|-------|--------|
| SAML metadata | Confirm SP metadata URL matches `NEXT_PUBLIC_APP_URL` |
| SSO secrets | `clientSecret` encrypted at rest (AES-256-GCM) — verify provider CRUD at `/settings/sso` |
| SCIM auth | Rotate `SCIM_API_KEY`; never commit to repo |
| SCIM org binding | Set `SCIM_DEFAULT_ORG_ID` / `SSO_DEFAULT_ORG_ID` in ECS task definition |
| Session scale | Redis required for multi-instance session consistency if not using sticky sessions |
| Audit | Confirm SCIM provisioning events in PlatformAuditLog |
| Login smoke | OAuth + SAML login buttons on `/login` with real IdP (staging first) |

**Staging validation checklist:**

1. Create SAML provider in `/settings/sso` with staging IdP metadata
2. Login via SAML → confirm user lands in correct org
3. `GET /api/scim/v2/Users` with Bearer `SCIM_API_KEY` → 200
4. Provision test user via SCIM → verify audit event + org assignment

### Optional but recommended

| Variable | Description |
|----------|-------------|
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email delivery |
| `LOG_LEVEL` | `debug`, `info`, `warn`, `error` |
| `AI_PROVIDER_API_KEY` | AI provider key if AI features enabled |

### Validation

```bash
node scripts/platform/validate-env.mjs
```

---

## 3. Build Steps

Run in order:

```bash
# 1. Install dependencies (clean)
npm ci

# 2. Generate Prisma client
npx prisma generate

# 3. Build production bundle
npm run build
```

### Expected outcomes

- `npx prisma generate` — Generates `@prisma/client` with zero errors
- `npm run build` — Produces `.next/` directory; **validated clean** as of 2026-06-17
- `npx tsc --noEmit` — **0 errors** as of 2026-06-17
- `npm test` — All unit/integration tests pass as of 2026-06-17

### Build troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `prisma generate` fails | Schema validation error | Run `npx prisma validate` |
| Build OOM | RAM pressure | `NODE_OPTIONS="--max-old-space-size=4096" npm run build` |
| Module not found | Missing dependency | `npm ci` again from clean lockfile |
| Turbopack panic | Windows path in config | Use `npx next build` (webpack) |

---

## 4. Database Migration

### Before deploying new code

```bash
# Preview pending migrations
npx prisma migrate status

# Apply migrations
npx prisma migrate deploy
```

### Rules

- **Never** run `prisma migrate dev` on production (it resets data)
- Always preview with `migrate status` first
- If migration fails, stop and roll back (see §6)
- Run seeds only if explicitly required:

```bash
npx prisma db seed
```

### Migration safety checklist

- [ ] Schema change is backward-compatible where possible
- [ ] No `DROP COLUMN` without data migration
- [ ] No `RENAME` without alias period
- [ ] Migration tested against staging first

### Post-creation migration seed edits (AuditOS Factory V1)

**Context:** `release-hardening-pr5` (`291adda`, 2026-06-15) adjusted the **seed JSONB** inside an already-created migration:

| Migration | Change | Reason |
|-----------|--------|--------|
| `20260614130000_presentation_policy_engine` | Cleared Shalfa-specific GL codes from `generic-v1` seed row | `GENERIC_PRESENTATION_POLICY_V1` must stay client-agnostic; Shalfa codes remain in `SHALFA_PILOT_PRESENTATION_POLICY_V1` only |

**Rules for operators:**

- This is **not a new migration** — the file was edited after initial creation during release hardening.
- **Fresh path:** `prisma migrate deploy` on a clean database applies the corrected seed automatically.
- **Already-applied DBs:** If `20260614130000` ran before `291adda`, the generic policy row may still contain pilot GL codes. Verify with:

```sql
SELECT slug, rules->'revenue'->'affiliateGlCodes' AS affiliate
FROM "PresentationPolicyTemplate"
WHERE slug = 'generic-v1';
```

Expected after hardening: `[]` (empty array). If stale, update the row to match `GENERIC_PRESENTATION_POLICY_V1` in `src/lib/audit/presentation/presentation-policy-types.ts` or re-seed from that source — do **not** re-run the whole migration.

- **Validation:** TypeScript source and migration seed JSON must match (zero drift). See R-014 in `docs/review/TECHNICAL_RISK_REGISTER.md`.

---

## 5. Health Check Endpoints

| Endpoint | Purpose | Expected response |
|----------|---------|-------------------|
| `GET /api/health` | Application + DB liveness | `{ "status": "ok", "timestamp": "...", "uptime": ... }` |
| `GET /api/health/db` | Database connectivity | `{ "status": "ok", "db": "connected" }` |

### Smoke check after deploy

```bash
# Application health
curl -s http://localhost:3000/api/health

# Database connectivity
curl -s http://localhost:3000/api/health/db

# Public routes accessible
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/auditos
```

---

## 6. Rollback Procedure

### Option A — Quick rollback (code only)

```bash
# 1. Revert to previous build
git checkout <last-known-good-tag>

# 2. Rebuild
npm ci
npx prisma generate
npm run build

# 3. Restart service
pm2 restart aqliya  # or systemctl restart aqliya
```

### Option B — Full rollback (code + database)

```bash
# 1. Identify the last good migration
npx prisma migrate status

# 2. Roll back migrations
npx prisma migrate resolve --rolled-back <offending-migration>

# 3. Revert code (same as Option A)
git checkout <last-known-good-tag>
npm ci && npx prisma generate && npm run build

# 4. Restore database from backup
pg_restore -d aqliya_prod /backups/aqliya_prod_<date>.dump

# 5. Restart service
pm2 restart aqliya
```

### Rollback triggers

Deploy immediately if:

- Health check returns non-200 for >30s
- Database migration fails
- Error rate exceeds 5%
- Auth/login flow is broken
- Critical data mutation produces incorrect results

---

## 7. Monitoring Checklist

Check each of these after every deployment:

### Application

- [ ] App responds at `NEXT_PUBLIC_APP_URL` (200)
- [ ] `/api/health` returns 200
- [ ] Login flow completes (email + password)
- [ ] Protected routes redirect unauthenticated users
- [ ] No 4xx/5xx errors in logs

### Database

- [ ] Connection pool not saturated (`SHOW max_connections;`)
- [ ] Query latency within normal range
- [ ] No deadlocks or lock contention

### Storage

- [ ] File uploads reach `UPLOAD_DIR` or S3 bucket
- [ ] Downloads resolve correctly
- [ ] Disk usage below 80%

### Background jobs

- [ ] Queue consumer is running (if Redis-backed)
- [ ] Scheduled tasks execute within expected window

### Alerts

- [ ] Error budget remaining
- [ ] PagerDuty/OpsGenie integration active (if configured)
- [ ] Log shipping to central aggregator (if configured)

---

## 8. Post-Deployment Smoke Test

Run these after every production deployment.

### Authentication

```bash
# Access login page
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/auth/signin
# Expected: 200

# Access protected page without auth
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/audit
# Expected: 302 (redirect to login)
```

### Core products

- [ ] AuditOS dashboard loads with real data
- [ ] Trial balance upload accepts valid file
- [ ] Financial statements render
- [ ] Findings list displays existing records
- [ ] Export generates valid file

### General UX

- [ ] RTL layout renders correctly on Arabic pages
- [ ] English locale works on English pages
- [ ] Empty states render on pages with no data
- [ ] 404 page shows for unknown routes

### Governance

- [ ] Audit events logged for mutations
- [ ] RBAC restricts admin-only actions from non-admin users
- [ ] Tenant isolation: org A cannot see org B's data

---

## Rollback Quick Reference

```bash
# Short circuit: if health check fails within 1 minute of deploy
git stash && git checkout deploy/v1.2.3 && npm ci && npx prisma generate && npm run build && pm2 restart aqliya
```

---

---

## 9. Backup Restore Drill

Run periodically to verify backups are restorable (recommended: monthly in staging):

```bash
# Uses most-recent backup in ./backups/
DATABASE_URL=<pg-url> node scripts/platform/restore-drill.mjs

# Or pass a specific backup file
DATABASE_URL=<pg-url> node scripts/platform/restore-drill.mjs backups/aqliya-backup-2026-06-17.dump
```

The script:
1. Creates a temporary scratch database (`aqliya_drill_<timestamp>`)
2. Restores the backup using `pg_restore` (custom format) or `psql` (SQL format)
3. Spot-checks row counts in `Organization`, `User`, `AuditEngagement`, `PlatformAuditLog`
4. Drops the scratch database
5. Writes a JSON report to `backups/drill-reports/`

Exit code: `0` = pass, `1` = failure. Safe to run from CI or cron.

---

## 10. ECS Rollback (Production)

The GitHub Actions `promote.yml` workflow includes an automatic rollback job that activates when smoke tests fail after deployment.

**Automatic rollback:** The workflow rolls back to the previous ECS task definition revision (`family:N-1`), not just a force-restart. This ensures the previous known-good image is used.

**Manual rollback:**

```bash
# 1. Find previous task definition revision
aws ecs list-task-definitions --family-prefix aqliya --sort DESC --max-items 3

# 2. Update service to previous revision
aws ecs update-service \
  --cluster aqliya-prod \
  --service aqliya-app \
  --task-definition aqliya:N-1 \
  --force-new-deployment

# 3. Confirm rollback
aws ecs describe-services --cluster aqliya-prod --services aqliya-app
```

---

> **Note:** This runbook covers standard Cloud deployment (AWS ECS Fargate). On-Prem / Air-Gapped deployment requires separate procedures not yet documented.
