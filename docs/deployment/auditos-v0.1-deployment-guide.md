# AuditOS v0.1 — Deployment Guide

**Date:** 2026-07-02  
**Target:** Controlled single-instance deployment (VPS, private server, internal VM)  
**Not in scope:** Kubernetes, multi-region HA, enterprise cloud scale

---

## Deployment Classification

> **Controlled Single-Instance Deployment Ready**

This guide supports one operational environment for internal rehearsal or limited pilot. It does **not** certify SOC2, ISO, or enterprise production readiness.

---

## Prerequisites

| Requirement | Minimum                                                               |
| ----------- | --------------------------------------------------------------------- |
| OS          | Linux (Ubuntu 22.04+ recommended) or Windows Server for dev rehearsal |
| Node.js     | 22.x LTS                                                              |
| PostgreSQL  | 15+ (16 recommended)                                                  |
| RAM         | 2 GB minimum; 4 GB recommended for build                              |
| Disk        | 20 GB+ including uploads and backups                                  |
| Network     | HTTPS reverse proxy for non-localhost access                          |
| Tools       | `pg_dump` for backup scripts (optional but recommended)               |
| Redis       | Optional — required only when `RATE_LIMITER=redis` (multi-instance)   |
| ClamAV      | Optional — required only when `SCANNER_PROVIDER=clamav` (recommended) |

### Optional service ports

| Service | Default Port | Required When                          |
| ------- | ------------ | -------------------------------------- |
| Redis   | 6379         | `RATE_LIMITER=redis` for shared limits |
| ClamAV  | 3310         | `SCANNER_PROVIDER=clamav` for scanning |

---

## Deployment Models

### A. VPS / private Linux server (recommended for rehearsal)

Single VM running Node.js app + PostgreSQL (co-located or managed DB).

### B. Single-instance with external PostgreSQL

App on one host; `DATABASE_URL` points to managed or separate Postgres instance.

### C. Local controlled rehearsal

Developer machine or internal workstation — same steps, `NEXTAUTH_URL=http://localhost:3000`.

---

## Startup Order

1. **PostgreSQL** — running and reachable
2. **Redis** — required only if `RATE_LIMITER=redis`
3. **ClamAV** — required only if `SCANNER_PROVIDER=clamav`
4. **Environment file** — `.env` with required variables
5. **Database schema** — `npx prisma db push` or `migrate deploy`
6. **Seed data** (rehearsal only) — platform seed + audit seed
7. **Build** — `npm run build`
8. **Storage directory** — ensure `LOCAL_STORAGE_DIR` exists and is writable
9. **Application** — `npm start` or process manager
10. **Health check** — `curl http://127.0.0.1:3000/api/health`
11. **Audit health** — `npm run audit:health`

### Scheduled tasks (L6 production)

After startup, configure the following scheduled tasks:

| Task                        | Schedule    | Command                                                    |
| --------------------------- | ----------- | ---------------------------------------------------------- |
| Database backup             | Daily       | `npm run db:backup:scheduler`                              |
| Audit event archival        | Weekly      | `node scripts/platform/audit-archival-cron.mjs`            |
| Rate limiter verification   | After deploy| `node scripts/platform/verify-redis-rate-limiter.mjs`      |

---

## Install Steps

```bash
git clone <repo-url>
cd aqliya-app
npm ci
cp .env.example .env
# Edit .env — see environment inventory
npm run validate:env
```

### Environment (minimum)

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/aqliya
AUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://audit.your-domain.internal
DOWNLOAD_TOKEN_SECRET=<openssl rand -base64 32>
LOCAL_STORAGE_DIR=/var/aqliya/uploads
STORAGE_PROVIDER=local
NODE_ENV=production
LOG_LEVEL=info
```

Generate secrets:

```bash
openssl rand -base64 32
```

### Database

```bash
npx prisma generate
npx prisma db push
# Rehearsal data:
npx prisma db seed
npm run seed:audit
```

### Build and start

```bash
npm run build
mkdir -p /var/aqliya/uploads /var/aqliya/backups
npm start
```

For network binding on a VPS:

```bash
npm run start:network
```

---

## Reverse Proxy Assumptions

Use nginx, Caddy, or Traefik in front of Node on port 3000.

| Setting        | Requirement                                            |
| -------------- | ------------------------------------------------------ |
| TLS            | Required for non-localhost production rehearsal        |
| `NEXTAUTH_URL` | Must match public URL exactly (scheme + host)          |
| WebSocket      | Not required for AuditOS v0.1 core flows               |
| Body size      | Allow uploads ≥ 10 MB for evidence files               |
| Timeouts       | Export generation may take 30–60s on large engagements |

Example nginx location block concept:

```nginx
location / {
  proxy_pass http://127.0.0.1:3000;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  client_max_body_size 25m;
}
```

NextAuth is configured with `trustHost: true` in `src/lib/auth-config.ts`.

---

## SSL Assumptions

- Internal rehearsal may use self-signed or internal CA certificates.
- Public pilot requires valid TLS on the reverse proxy.
- Application does not terminate TLS directly in v0.1 — proxy handles SSL.

---

## Storage Path Assumptions

| Path                | Action                                                |
| ------------------- | ----------------------------------------------------- |
| `LOCAL_STORAGE_DIR` | Create before first upload; persist across restarts   |
| Permissions         | App user read/write only                              |
| Backups             | Include storage directory in backup plan alongside DB |

Evidence files are stored under keys like:

```
engagements/{engagementId}/evidence/{evidenceId}/{filename}
```

Rejecting evidence updates status in DB; **physical files may remain on disk** (disclosed v0.1 limitation).

---

## Backup Assumptions

| Method             | Command                 | Output                           |
| ------------------ | ----------------------- | -------------------------------- |
| DB backup (script) | `npm run db:backup`     | `./backups/aqliya_backup_*.dump` |
| Legacy backup      | `npm run backup`        | `./backups/aqliya-backup-*.sql`  |
| Verify             | `npm run backup:verify` | Integrity check                  |

**v0.1 reality:** Backup scripts exist but automated scheduling, off-site replication, and tested restore runbooks are **operator responsibilities**, not built-in HA.

Recommended manual schedule for rehearsal: daily DB dump + weekly storage directory archive.

---

## L6 Production Configuration

### L6 Environment (beyond minimum)

```env
# === L6: Rate Limiting (Redis for multi-instance) ===
RATE_LIMITER=redis
REDIS_URL=redis://:<password>@redis-host:6379

# === L6: File Scanning (ClamAV recommended) ===
SCANNER_PROVIDER=clamav
CLAMAV_HOST=127.0.0.1
CLAMAV_PORT=3310

# === L6: Object Storage (S3-compatible) ===
STORAGE_PROVIDER=s3
S3_BUCKET=aqliya-audit-prod
S3_REGION=eu-west-1
# S3_ENDPOINT=https://s3.custom-endpoint.com  # optional

# === L6: Audit Event Archival ===
AUDIT_RETENTION_DAYS=365
AUDIT_ARCHIVE_DIR=/var/aqliya/audit-archives

# === L6: Backup ===
BACKUP_INTERVAL_MS=3600000
BACKUP_MAX_FILES=30
BACKUP_DIR=/var/aqliya/backups
```

### Redis deployment (for RATE_LIMITER=redis)

```bash
# Install Redis
sudo apt-get install redis-server
sudo systemctl enable redis-server && sudo systemctl start redis-server

# Secure with password
sudo redis-cli CONFIG SET requirepass "<strong-password>"
```

### ClamAV deployment (for SCANNER_PROVIDER=clamav)

```bash
# Install ClamAV
sudo apt-get install clamav clamav-daemon

# Update virus definitions
sudo systemctl stop clamav-freshclam
sudo freshclam
sudo systemctl start clamav-freshclam

# Start daemon
sudo systemctl enable clamav-daemon && sudo systemctl start clamav-daemon

# Verify
node scripts/platform/verify-redis-rate-limiter.mjs
```

### Systemd timer units

Create `/etc/systemd/system/aqliya-backup.service`:

```ini
[Unit]
Description=AQLIYA database backup
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/bin/npm run db:backup:scheduler
WorkingDirectory=/opt/aqliya
Environment=NODE_ENV=production
```

Create `/etc/systemd/system/aqliya-backup.timer`:

```ini
[Unit]
Description=Run AQLIYA backup daily

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

Create `/etc/systemd/system/aqliya-archival.service`:

```ini
[Unit]
Description=AQLIYA audit event archival

[Service]
Type=oneshot
ExecStart=/usr/bin/node /opt/aqliya/scripts/platform/audit-archival-cron.mjs
WorkingDirectory=/opt/aqliya
Environment=NODE_ENV=production
```

Create `/etc/systemd/system/aqliya-archival.timer`:

```ini
[Unit]
Description=Run AQLIYA archival weekly

[Timer]
OnCalendar=weekly
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start:

```bash
sudo systemctl link /opt/aqliya/deploy/systemd/aqliya-backup.service
sudo systemctl link /opt/aqliya/deploy/systemd/aqliya-archival.service
sudo systemctl enable aqliya-backup.timer aqliya-archival.timer
sudo systemctl start aqliya-backup.timer aqliya-archival.timer
```

---

## Docker (optional)

Repository includes `docker-compose.yml` and `Dockerfile` aligned for controlled single-instance use (Track C.1):

| Item                   | Status                                                           |
| ---------------------- | ---------------------------------------------------------------- |
| `output: 'standalone'` | Enabled in `next.config.mjs`                                     |
| Runtime auth secret    | `AUTH_SECRET` in compose (not `NEXTAUTH_SECRET` alone)           |
| Upload persistence     | `uploads` volume at `/app/uploads`                               |
| Build-time env         | Placeholder `DATABASE_URL` + `AUTH_SECRET` in Dockerfile builder |

Before first use, replace placeholder secrets in `docker-compose.yml`. Apply schema and seed **against the compose database** (not host Postgres):

```bash
docker compose up -d db
# Wait until db is healthy, then run from repo root:
docker run --rm --network aqliya_default \
  -v "$(pwd):/app" -w /app \
  -e DATABASE_URL=postgresql://postgres:postgres@db:5432/aqliya \
  node:20-alpine sh -c "npm ci --ignore-scripts && npx prisma db push && npx prisma generate && npx tsx prisma/seed.ts && npx tsx prisma/seed-audit.ts"

docker compose up -d app
curl -s http://127.0.0.1:3000/api/health
```

**Important:** On some dev machines, `localhost:5432` points to a **host PostgreSQL**, not the compose `db` service. The app container always uses `db:5432` inside the Docker network. If you seed via `localhost:5432` while compose is running, the app may start with an **empty database** and login will fail. Always seed via `@db:5432` on the compose network (command above) or verify you are targeting the same database the app uses.

**Note:** Docker image build validated in Track C.2 (2026-05-28). First build requires `npm ci --ignore-scripts` in Dockerfile because postinstall runs before schema copy.

---

## Process Manager (recommended)

Use `systemd`, PM2, or similar to keep one instance running:

```bash
# PM2 example
pm2 start npm --name aqliya -- start
pm2 save
```

Do not run multiple instances against the same local storage directory without shared filesystem coordination.

---

## Post-Deploy Verification

```bash
curl -s http://127.0.0.1:3000/api/health | jq .
npm run audit:health
```

Expected health response includes:

- `status: "ok"`
- `checks.database.ok: true`
- `checks.storage.ok: true` (when `STORAGE_PROVIDER=local`)

Login at `/login` with seeded credentials (rehearsal only — change for any external pilot).

---

## Known Limitations

- **Single instance only** — no horizontal scaling guidance. `RATE_LIMITER=redis` is ready for multi-instance but requires operational Redis setup.
- **No HA / failover** — Postgres and app are single points of failure
- **S3/Azure storage** — S3 implemented; Azure Blob is stubbed (not yet wired)
- **No SSO/LDAP** — Credentials provider only
- **Not certified production** — controlled rehearsal and limited pilot only
- **Draft exports** downloadable before approval — intentional for internal review

### L6 Resolved Limitations

The following v0.1 limitations have been resolved in this L6 hardening:

| Limitation                          | Resolution                                                                  |
| ----------------------------------- | --------------------------------------------------------------------------- |
| In-memory rate limiter only         | Provider pattern with Redis backend (set `RATE_LIMITER=redis` + `REDIS_URL`)|
| `SCANNER_PROVIDER` unconfigured     | ClamAV client integrated; set `SCANNER_PROVIDER=clamav` to activate         |
| No audit event archival             | Archival service + cron script; configurable retention via `AUDIT_RETENTION_DAYS` |
| S3 storage not integrated           | Full S3 implementation with `@aws-sdk/client-s3`; set `STORAGE_PROVIDER=s3` |
| Backup scheduling missing           | `db-backup-scheduler.ts` with single-run and timer modes                    |
| Dashboard N+1 queries               | TTL caching via memory cache; 15s window on operator summaries              |

---

## Quick Start (Docker — controlled rehearsal)

For the fastest path to a working AuditOS v0.1 stack on one machine:

```bash
# 1. Clone and enter repo
git clone <repo-url> && cd aqliya-app

# 2. Replace placeholder secrets in docker-compose.yml (AUTH_SECRET, etc.)

# 3. Start database
docker compose up -d db

# 4. Seed against compose network (NOT host localhost:5432)
docker run --rm --network aqliya_default \
  -v "$(pwd):/app" -w /app \
  -e DATABASE_URL=postgresql://postgres:postgres@db:5432/aqliya \
  node:20-alpine sh -c "npm ci --ignore-scripts && npx prisma db push && npx prisma generate && npx tsx prisma/seed.ts && npx tsx prisma/seed-audit.ts"

# 5. Build and start app
docker compose up -d --build app

# 6. Verify
curl -s http://127.0.0.1:3000/api/health
```

Login: `admin@aqliya.com` / `admin123` (rehearsal only).  
Rehearsal engagement: `eng-gulf-2025` (Gulf Trading Co., FY2025).

**Operator note after deploy:** Browsers may cache stale JavaScript after an app rebuild. If login succeeds but pages spin indefinitely, perform a **hard refresh** (`Ctrl+Shift+R` on Windows/Linux, `Cmd+Shift+R` on macOS) or open a cache-busted URL (`?v=deploy-YYYYMMDD`).

---

## Redeploy Checklist

Use before/after any app image rebuild or code update on a pilot host:

| Step | Action                                                                                    |
| ---- | ----------------------------------------------------------------------------------------- |
| 1    | Notify operators of maintenance window                                                    |
| 2    | `curl -s http://127.0.0.1:3000/api/health` — capture baseline                             |
| 3    | Backup PostgreSQL (`pg_dump`) and `uploads` volume if evidence exists                     |
| 4    | `docker compose build app` (or `npm run build` for bare-metal)                            |
| 5    | `docker compose up -d app` (or restart process manager)                                   |
| 6    | `curl -s http://127.0.0.1:3000/api/health` — confirm `status: ok`                         |
| 7    | `npm run audit:health` (from host with correct `DATABASE_URL`)                            |
| 8    | Operator hard refresh on all open browser tabs                                            |
| 9    | Smoke: login → `/audit/engagements/eng-gulf-2025/statements` loads without error boundary |
| 10   | Document deploy timestamp and git commit in operator log                                  |

**Do not** re-seed production/pilot data unless intentionally resetting the environment.

---

## Operator Restart Notes

- **App only:** `docker compose restart app` — database and uploads persist.
- **Full stack:** `docker compose down && docker compose up -d` — verify health before handing to operators.
- **After restart:** Operators must hard refresh; stale Server Action IDs cause infinite loading and `Failed to find Server Action` in browser console.
- **Session cookies:** Operators may need to log in again after long downtime or secret rotation.

---

## Rollback Checklist

1. Stop application process (`docker compose stop app` or PM2/systemd stop)
2. Restore PostgreSQL from latest verified dump
3. Restore `LOCAL_STORAGE_DIR` / `uploads` volume from archive if evidence needed
4. Redeploy previous application build artifact (git tag or saved image)
5. Health check + operator hard refresh
6. Smoke test login and one engagement workflow path
7. Record rollback reason and timestamp in operator log

Previous single-step rollback (legacy):

1. Stop application process
2. Restore PostgreSQL from latest dump
3. Restore `LOCAL_STORAGE_DIR` from archive if evidence needed
4. Restart with previous application build artifact if code rollback required

---

## References

- Environment inventory: `docs/deployment/auditos-v0.1-environment-inventory.md`
- Internal rehearsal: `docs/deployment/auditos-v0.1-internal-rehearsal.md`
- Security posture: `docs/deployment/auditos-v0.1-security-posture.md`
- Deployment readiness report: `docs/reports/auditos-v0.1-deployment-readiness-2026-05-28.md`
