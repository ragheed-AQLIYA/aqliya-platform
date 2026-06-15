# Staging Environment

## Purpose

The staging environment is a pre-production deployment used for:

- Integration testing before production release
- Customer demo and pilot validation (LocalContentOS L5 pilot)
- Smoke testing, regression testing, and feature flag validation
- AI provider integration verification (with `FF_AI_REAL_PROVIDERS=true`)
- SCIM/SSO provider integration testing
- Performance and data migration dry-runs

Staging mirrors production infrastructure (ECS, ECR, PostgreSQL with pgvector, Redis) but uses **separate** AWS resources and a **distinct database** (`aqliya_staging`). It runs with production-like feature flags (`FF_QUEUE_ENABLED`, `FF_TENANT_LIFECYCLE`, `FF_AI_COST_TRACKING`) that may be disabled in development.

## Architecture

```
┌─────────────────────────────────────────┐
│            AWS ECS (Fargate)             │
│  ┌─────────┐  ┌────────┐  ┌──────────┐ │
│  │  Next.js │  │  Redis │  │ Postgres │ │
│  │  (app)   │  │  7-alp │  │ pg16+vec │ │
│  └────┬────┘  └────────┘  └─────┬────┘ │
│       │                         │       │
│  ┌────┴────┐                    │       │
│  │ EFS vol │                    │       │
│  └─────────┘                    │       │
└─────────────────────────────────┼───────┘
                                  │
                         ┌────────┴────────┐
                         │  RDS PostgreSQL  │
                         │  aqliya_staging  │
                         └─────────────────┘
```

## How to Start Local Staging with Docker

Use the local staging compose files to run an environment that closely mirrors CI staging. This is useful for testing migrations, seeding, or configuration before pushing.

### Prerequisites

- Docker Desktop (or Docker Engine on Linux)
- Node.js 22+
- `.env` file populated (copy from `.env.example`)

### Start Services

```bash
# Start all staging services (db + redis + app)
docker compose -f docker-compose.staging.yml up -d

# Or start only data services (db + redis) for local dev targeting staging-like infra
docker compose -f docker-compose.staging.yml -f docker-compose.staging-local.yml up -d db redis
```

The `staging-local` overlay remaps ports to avoid clashing with local dev databases:

| Service  | Default port | Local staging port |
|----------|-------------|-------------------|
| Postgres | 5432        | 5435              |
| Redis    | 6379        | 6380              |

### Configure Environment

Create a `.env.staging.local` file (do not commit):

```bash
# Override for local staging
DATABASE_URL=postgresql://postgres:postgres@localhost:5435/aqliya_staging
REDIS_URL=redis://localhost:6380
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=<your-secret>
```

### Run the App Against Local Staging Services

```bash
# Apply schema and seed
npx prisma db push --skip-generate
npx prisma db seed

# Start Next.js pointing at local staging DB
npx next dev --webpack
```

## How to Deploy to Staging (CI Trigger)

Deployments are handled by the [`deploy.yml`](../.github/workflows/deploy.yml) GitHub Actions workflow.

### Automatic Deploy

Push to the `staging` branch triggers a full deploy pipeline:

```bash
git checkout -b staging
git push origin staging
```

### What the Pipeline Does

```
Push to staging
  └─▶ test (tsc, lint, jest)
        ├─▶ terraform (init, validate, plan)
        └─▶ build-and-push (Docker build → ECR → ECS update)
              └─▶ deploy (terraform apply)
                    └─▶ post-deploy (comprehensive smoke test)
```

1. **Test** — TypeScript check, lint, unit tests
2. **Terraform** — Validate and plan infrastructure changes
3. **Build & Push** — Build Docker image, push to ECR, trigger ECS rolling update
4. **Deploy** — Apply Terraform plan
5. **Post-Deploy** — Run comprehensive smoke test (see [Verify Staging](#how-to-verify-staging))

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key for ECR/ECS/Terraform |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `SCIM_API_KEY` | API key for SCIM endpoint tests |
| `SMOKE_TEST_TOKEN` | Auth token used by post-deploy smoke tests |

### Required Environment Variables (set in the container/ECS task)

See [Staging vs Production Differences](#staging-vs-production-differences) for the full list.

## How to Verify Staging

### Quick Reachability Probe (Track A)

Use the staging probe script — it checks DNS, HTTP reachability, and critical endpoints:

```bash
# Check default staging host (staging.aqliya.ai)
node scripts/staging-probe.mjs

# Check custom host
STAGING_HOST=staging.custom.com node scripts/staging-probe.mjs

# Check a different base URL
STAGING_BASE_URL=https://staging.aqliya.ai node scripts/staging-probe.mjs
```

The probe tests:

1. DNS resolution of `STAGING_HOST`
2. `GET /api/health` — application health
3. `GET /api/health/ready` — readiness check
4. `GET /api/health/live` — liveness check
5. `GET /login` — page loads or redirects
6. `GET /` — homepage loads

**Exit codes:** 0 = all critical checks pass; 1 = DNS/network failure; 2 = HTTP non-2xx.

### Comprehensive Smoke Test (Track B — CI only)

The full post-deploy smoke test runs automatically in CI but can be run locally:

```bash
npm run smoke:local  # targets http://localhost:3000

# Against remote staging
BASE_URL=https://staging.aqliya.ai node scripts/post-deploy-smoke.mjs --base-url "$BASE_URL"
```

This checks:

- Health endpoints (`/api/health`, `/api/health/ready`, `/api/health/live`)
- Auth flows (login page, CSRF, protected route redirect)
- SCIM API (with optional API key)
- Marketing pages (homepage, about, products, platform)
- Required and optional environment variables
- Notification engine tests

### NPM Scripts

```bash
# Quick staging probe
npm run staging:probe

# Full staging verification (alias, same as staging:probe)
npm run staging:verify

# Local smoke test
npm run smoke:local
```

## Staging Environment Variables Required

### Required (must be set in ECS task definition or CI)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Runtime mode | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@db:5432/aqliya_staging` |
| `AUTH_SECRET` | NextAuth encryption secret | (generated via `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Public URL of staging app | `https://staging.aqliya.ai` |
| `DOWNLOAD_TOKEN_SECRET` | Secret for download token signing | (generated) |
| `SCIM_API_KEY` | SCIM endpoint authentication | (generated) |
| `SSO_DEFAULT_ORG_ID` | Default org for SSO provisioning | (valid UUID) |

### Optional (feature flags and integrations)

| Variable | Default | Description |
|----------|---------|-------------|
| `STORAGE_PROVIDER` | `local` | File storage backend (`local` or `s3`) |
| `LOCAL_STORAGE_DIR` | `/app/uploads` | Path for local file storage |
| `REDIS_URL` | `redis://redis:6379` | Redis connection string |
| `RATE_LIMITER` | `redis` | Rate limiter backend |
| `AUTH_GOOGLE_ID` | — | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | — | Google OAuth client secret |
| `AUTH_GITHUB_ID` | — | GitHub OAuth client ID |
| `AUTH_GITHUB_SECRET` | — | GitHub OAuth client secret |
| `AUTH_AZURE_AD_ID` | — | Azure AD client ID |
| `AUTH_AZURE_AD_TENANT_ID` | — | Azure AD tenant ID |
| `AUTH_AZURE_AD_SECRET` | — | Azure AD client secret |
| `AUTH_OKTA_ID` | — | Okta OAuth client ID |
| `AUTH_OKTA_SECRET` | — | Okta OAuth client secret |
| `AUTH_OKTA_ISSUER` | — | Okta issuer URL |
| `AUTH_OIDC_ISSUER` | — | Generic OIDC issuer |
| `AUTH_OIDC_CLIENT_ID` | — | Generic OIDC client ID |
| `AUTH_OIDC_CLIENT_SECRET` | — | Generic OIDC client secret |
| `SENTRY_DSN` | — | Sentry error reporting DSN |
| `LOG_LEVEL` | `info` | Logging verbosity |

### Feature Flags (always on in staging)

| Flag | Effect |
|------|--------|
| `FF_AI_REAL_PROVIDERS=true` | Enable real AI provider calls |
| `FF_AI_COST_TRACKING=true` | Track AI usage costs |
| `FF_QUEUE_ENABLED=true` | Enable job queue processing |
| `FF_TENANT_LIFECYCLE=true` | Enable tenant lifecycle operations |

## Staging vs Production Differences

| Aspect | Staging | Production |
|--------|---------|------------|
| **URL** | `https://staging.aqliya.ai` | `https://aqliya.ai` |
| **Database** | `aqliya_staging` (separate RDS instance) | `aqliya_production` |
| **ECS Cluster** | `aqliya-staging-cluster` | `aqliya-production-cluster` |
| **ECR Repo** | `aqliya/staging/app` | `aqliya/production/app` |
| **Terraform workspace** | `environments/staging/` | `environments/production/` |
| **Deploy trigger** | Push to `staging` branch | Push to `main` branch |
| **Docker tag** | `:latest` → staging | `:latest` → production |
| **Scaling** | 1 task (minimal) | Multiple tasks (HA) |
| **Backups** | Daily (7-day retention) | Continuous + daily (30-day) |
| **Monitoring** | Basic CloudWatch | Full Datadog + PagerDuty |
| **Postgres image** | `pgvector/pgvector:pg16` | RDS with `pgvector` extension |
| **Feature flags** | All enabled | Gradual rollout |
| **SSO providers** | All configured | Per-tenant subset |
| **Sentry** | Development DSN | Production DSN |
| **Data** | Anonymized / synthetic seeds | Real production data |

> **Note:** Staging uses a `pgvector/pgvector:pg16` Docker image for the database container (see `docker-compose.staging.yml:52`), while production uses AWS RDS PostgreSQL with the `pgvector` extension installed separately.

## Seeding Staging Data

### Standard Seeds

```bash
# Push schema and run base seed (users, organizations, workspaces)
npx prisma db push
npx prisma db seed
```

### AuditOS Seed (for pilot demos)

```bash
npm run seed:audit
```

### Office AI Assistant Seed

```bash
npm run office-ai:seed
# Dry-run first:
npm run office-ai:seed:dry
```

### Backfill Scripts (platform migrations)

Run these after schema changes that introduce new platform fields:

```bash
# Dry-runs (safe)
npm run platform:backfill-orgs:dry
npm run platform:backfill-workspaces:dry
npm run platform:audit-log:dry
npm run platform:auditos-dual-write:dry
npm run platform:decisionos-dual-write:dry

# Apply
npm run platform:backfill-orgs:apply
npm run platform:backfill-workspaces:apply
npm run platform:audit-log:apply
npm run platform:auditos-dual-write:apply
npm run platform:decisionos-dual-write:apply
```

### Pilot Seed (LocalContentOS L5)

The pilot environment uses a separate `.env.pilot.example` template. See that file for the required variables and then run:

```bash
npm run dev:localcontent-pilot
```

This script reads `.env`, swaps the database name to `aqliya_lc_pilot`, and sets `LOCALCONTENT_CONTENT_BACKEND=prisma`.

## Troubleshooting

### Deployment fails at terraform apply

Check that the Terraform state file in `infra/terraform/environments/staging/backend.tf` is accessible and the AWS credentials have not expired.

### Probe returns DNS FAIL

The staging host `staging.aqliya.ai` must resolve in public DNS. If testing locally, ensure your network can reach the target. For local-only checks, use:

```bash
STAGING_BASE_URL=http://localhost:3000 node scripts/staging-probe.mjs
```

### Post-deploy smoke test fails on SCIM

SCIM requires a valid `SCIM_API_KEY` and `SSO_DEFAULT_ORG_ID`. The check is non-critical and will warn if not set.

### Docker compose port clash

If you see `port is already allocated`, use the local staging overlay to remap ports:

```bash
docker compose -f docker-compose.staging.yml -f docker-compose.staging-local.yml up -d db redis
```

## Related

- [Deploy workflow](../.github/workflows/deploy.yml) — CI pipeline definition
- [Staging compose](../docker-compose.staging.yml) — Staging service definitions
- [Local staging overlay](../docker-compose.staging-local.yml) — Port remapping for local use
- [Pilot env template](../.env.pilot.example) — LocalContentOS pilot configuration
- [Post-deploy smoke test](../scripts/post-deploy-smoke.mjs) — Comprehensive smoke test
- [Staging probe](../scripts/staging-probe.mjs) — Quick reachability probe
