# AuditOS — Real Data Gate Decision

**Date:** May 12, 2026
**Session:** 3.1 Backup Gate Hotfix
**Decision:** Real data allowed with constraints

## Gate Status

| Gate | Status | Evidence |
|---|---|---|
| Backup works | ✅ | 140 KB dump file: `backups/aqliya_backup_2026-05-12T10-03-24-145Z.dump` |
| Backup automated | ✅ | `npm run db:backup` — single command |
| Restore safe | ✅ | Dry-run by default, `CONFIRM_RESTORE=true` guard |
| Health check | ✅ | 7/7 |
| Audit events | ✅ | 31 events, 21 types |
| Security review | ✅ | 0 critical/high |
| Validation lifecycle | ✅ | Proven (Session 2) |
| Publication lifecycle | ✅ | Proven (Session 2) |
| No secret leaks | ✅ | Scripts use `new URL()`, print only sanitized host:port/db |

## Decision

**Real data allowed with constraints.**

## Constraints

1. Take backup before every session
2. Single organization, single engagement
3. Development environment only
4. Follow `docs/PILOT_RUNBOOK.md`
5. Log all feedback
6. Do not claim production/commercial readiness
7. Approved customer data only

## Sign-Off

- [x] PS1-001 Resolved — backup operational
- [x] PF-001 Resolved — same fix
- [x] URL parsing fixed for Prisma-style DATABASE_URL
- [x] pg_dump autodiscovery working (PostgreSQL 18.3)
- [x] Dry-run restore confirmed safe
