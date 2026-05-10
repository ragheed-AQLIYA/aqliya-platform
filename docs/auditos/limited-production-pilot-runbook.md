# Limited Production Pilot Runbook

## Overview

This runbook covers the setup, operation, and recovery procedures for a limited production pilot of AQLIYA AuditOS.

**Pilot Type:** Limited production — controlled real-engagement environment  
**Status:** CONDITIONAL GO  
**Restrictions:** No external production. Limited to approved pilot clients.

---

## 1. Environment Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn
- SMTP server for auth emails (if email provider configured)

### Install

```bash
git clone <repo-url>
cd aqliya-app
npm install
```

### Environment Variables

Create `.env` in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/aqliya
AUTH_SECRET=<generate with: openssl rand -base64 32>
NODE_ENV=production
SCANNER_PROVIDER=clamav       # Optional — set to block or allow uploads
BACKUP_DEST=/var/backups      # Optional
```

### Database Setup

```bash
npx prisma migrate deploy
npm run seed:audit            # Seeds demo data (replace with production seed if needed)
```

### Build

```bash
npm run build -- --webpack
```

### Start

```bash
npm start
```

---

## 2. Auth Provider Setup

AQLIYA AuditOS uses NextAuth.js with Credentials provider.

### Default Login

1. Navigate to `/login`
2. Enter email and password (configured via seed or admin UI)
3. JWT session is created

### Production Recommendations

- Replace Credentials provider with OAuth/SSO provider (Google, Azure AD, etc.) before external production
- Configure `AUTH_SECRET` with a strong random value
- Set `authConfig.debug = false` in production

---

## 3. AuditUser Provisioning Steps

1. Admin logs in at `/login`
2. Navigate to `/audit/admin/users`
3. Click "Provision User"
4. Enter email, name, select role
5. Click "Create User"

**Note:** The NextAuth user and AuditUser are separate records. The AuditUser maps the session user via email + organizationId. If a user can log in but gets "Audit user not provisioned", an admin must provision them via the Admin UI.

---

## 4. Backup Procedure

### Manual Backup

```bash
npm run db:backup
```

This displays the `pg_dump` command. Execute it as shown:

```bash
pg_dump -h localhost -U aqliya -d aqliya -F c -f backup_$(date +%Y%m%d).dump
```

### Restore

```bash
pg_restore -h localhost -U aqliya -d aqliya --clean backup_file.dump
```

### Schedule

| Frequency | Type | Retention |
|-----------|------|-----------|
| Every 6 hours | Full database dump | 30 days |
| Daily | Copy to remote storage | 90 days |

---

## 5. Health Check Procedure

```bash
npm run audit:health
```

Expected output:

```
✅ All 7 checks pass
```

If any check fails:

| Check | Possible Cause | Action |
|-------|---------------|--------|
| Database connectivity | DB down, wrong URL | Check DATABASE_URL, restart PostgreSQL |
| Engagements = 0 | Seed not run | Run `npm run seed:audit` |
| Audit events = 0 | No activity | Verify application is processing requests |
| AI outputs = 0 | Seed not run | Run `npm run seed:audit` |
| Audit users = 0 | Seed not run | Run `npm run seed:audit` or provision via Admin UI |
| Open blockers > 0 | Production blockers unresolved | Review and close blockers |

---

## 6. Demo/Pilot Reset Procedure

```bash
# Full reset to seeded demo state
npm run seed:audit

# Rebuild
npm run build -- --webpack

# Restart
npm start
```

---

## 7. Rollback Procedure

### Code Rollback

```bash
git checkout <previous-tag-or-commit>
npm ci
npx prisma migrate deploy
npm run build -- --webpack
npm start
```

### Database Rollback

```bash
# Restore from backup
pg_restore -h localhost -U aqliya -d aqliya --clean backup_file.dump
```

---

## 8. Support Escalation Process

| Level | Team | Response Time |
|-------|------|---------------|
| L1 | Pilot operator | Within 4 hours |
| L2 | AQLIYA engineering team | Within 24 hours |
| L3 | Infrastructure/DB admin | Within 48 hours |

### Reporting Issues

1. Check health check: `npm run audit:health`
2. Check application logs: `.next/dev/logs/next-development.log`
3. Check database logs
4. Escalate via support channel

---

## 9. Known Pilot Restrictions

- JSON-only export (no PDF/Word)
- No virus scanning — do not upload real client files without scanner configured
- Manual backup required
- Single-organization validation — multi-tenant isolation verified but not stress-tested
- Demo fallback disabled in production — all users must be provisioned
