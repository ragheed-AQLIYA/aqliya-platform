# Pilot Environment Checklist

## Pre-Pilot Verification

### Database

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1.1 | PostgreSQL is running | ☐ | `pg_isready` |
| 1.2 | DATABASE_URL configured | ☐ | Check `.env` |
| 1.3 | Migrations applied | ☐ | `npx prisma migrate deploy` |
| 1.4 | Seed data loaded | ☐ | `npm run seed:audit` |

### Auth

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 2.1 | AUTH_SECRET configured | ☐ | At least 32 characters |
| 2.2 | Login page loads | ☐ | `/login` |
| 2.3 | Admin user can log in | ☐ | |
| 2.4 | Operator user can log in | ☐ | |
| 2.5 | Reviewer user can log in | ☐ | |
| 2.6 | Incorrect login rejected | ☐ | Verify error message |

### Application

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 3.1 | Build passes | ☐ | `npm run build -- --webpack` |
| 3.2 | App starts | ☐ | `npm start` |
| 3.3 | Health check passes | ☐ | `npm run audit:health` — all 7 checks |
| 3.4 | Rate limiting active | ☐ | Exceed limit → error message |

### Security

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 4.1 | NODE_ENV=production | ☐ | No demo fallback |
| 4.2 | SCANNER_PROVIDER decision | ☐ | `clamav`, cloud, or documentation |
| 4.3 | Demo fallback blocked | ☐ | Unauthenticated request → error |
| 4.4 | File type whitelist active | ☐ | Invalid type → error |
| 4.5 | File size limit active | ☐ | >20MB → error |

### Tenant Isolation

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 5.1 | Organization created | ☐ | `auditOrganization` exists |
| 5.2 | Pilot client created | ☐ | `auditClient` for pilot engagement |
| 5.3 | Users assigned roles | ☐ | Admin creates via Admin UI |
| 5.4 | Cross-org access blocked | ☐ | Verify with test |

### Backup

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 6.1 | Manual backup tested | ☐ | `npm run db:backup` — verify dump created |
| 6.2 | Restore procedure documented | ☐ | |
| 6.3 | Backup schedule defined | ☐ | Frequency + retention |

### Monitoring

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 7.1 | Health check accessible | ☐ | `npm run audit:health` |
| 7.2 | Log location known | ☐ | `.next/dev/logs/` |
| 7.3 | Error alerting configured | ☐ | Notifications for failures |

### Workflows

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 8.1 | Dashboard loads | ☐ | `/audit` |
| 8.2 | Engagement accessible | ☐ | `/audit/engagements/[id]` |
| 8.3 | Evidence CRUD works | ☐ | |
| 8.4 | Findings CRUD works | ☐ | |
| 8.5 | Recommendations CRUD works | ☐ | |
| 8.6 | Review comments work | ☐ | |
| 8.7 | Approval gate works | ☐ | |
| 8.8 | AI outputs generate | ☐ | |
| 8.9 | Exports download | ☐ | JSON |
| 8.10 | Traceability drawer opens | ☐ | |
| 8.11 | Admin user provisioning works | ☐ | `/audit/admin/users` |
| 8.12 | Pilot feedback works | ☐ | `/audit/engagements/[id]/pilot` |

## Overall Status

| Section | Passed | Total |
|---------|--------|-------|
| Database | | /4 |
| Auth | | /6 |
| Application | | /4 |
| Security | | /5 |
| Tenant Isolation | | /4 |
| Backup | | /3 |
| Monitoring | | /3 |
| Workflows | | /12 |

**Sign-off:** ☐ Ready for limited production pilot ☐ Not ready

**Date:** __________________ **Signed:** __________________
