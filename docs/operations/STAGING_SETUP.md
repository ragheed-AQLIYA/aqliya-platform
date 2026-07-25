# Staging Environment Setup

## Prerequisites
- Node.js 22+
- PostgreSQL 16
- Redis (for rate limiting)
- Docker (optional)

## Quick Start
1. Copy `.env.staging` to `.env`
2. Fill in secrets:
   - `DATABASE_URL` — connection string to staging PostgreSQL
   - `AUTH_SECRET` — generate with `openssl rand -base64 32`
   - `DOWNLOAD_TOKEN_SECRET` — generate with `openssl rand -base64 32`
   - `HUBSPOT_API_KEY` (for CRM)
   - `HUBSPOT_WEBHOOK_SECRET`
   - `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` (for AI)
   - `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` (for file storage)
   - `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` (for email)
3. `npm install`
4. `npx prisma migrate deploy`
5. `npx prisma db seed`
6. `npm run build`
7. `npm run start`

## Verification
- http://localhost:3000 — platform
- http://localhost:3000/api/platform/health — health check
- `/local-content` — LocalContentOS
- `/decisions` — DecisionOS
- `/sales` — SalesOS
- `/contacts` — LocalContactOS
- `/audit` — AuditOS workspace
- `/assistant` — Office AI Assistant

## Monitoring
- `/api/platform/health` — health endpoint (DB latency, kernel plugin status)
- `/monitoring` — dashboard

## Troubleshooting
- **Build fails**: `npx tsc --noEmit` to check TypeScript errors
- **DB connection issues**: `npx prisma validate` to verify schema
- **Port conflict**: change `PORT` in `.env`
- **Prisma issues**: `npx prisma generate && npx prisma migrate deploy`
- **Redis not available**: set `RATE_LIMITER=memory` in `.env` for single-instance dev
- **File scanning**: set `SCANNER_PROVIDER=local` if ClamAV is not available

## Feature Flags
Staging should mirror production feature flags as closely as possible.
See `.env.staging` for the current feature flag configuration.
