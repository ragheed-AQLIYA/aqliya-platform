# AQLIYA OS Core v1 — Known Limitations#

## Overview
AQLIYA OS Core v1 is a functional decision intelligence system, but has known limitations that must be addressed before full production deployment.

---

## 1. No Auth Hardening Yet ⚠️#

**Status:** ❌ Not implemented

**Details:**
- No authentication system (login is placeholder only)
- No JWT/session management
- No password hashing or secure storage
- No rate limiting on API routes
- No CSRF protection

**Impact:**
- System is **not ready for external use**
- Internal testing only
- Do NOT expose to public internet

**Next Step:** Implement auth (NextAuth.js, Clerk, or custom) before production.

---

## 2. Production PostgreSQL Must Be Provisioned Before Deployment ⚠️#

**Status:** ⚠️ Migration verified locally, production database not provisioned

**Details:**
- Local development now targets PostgreSQL
- Production PostgreSQL instance is not yet provisioned
- No production connection pooling configured
- No production database backup schedule configured
- No production query performance review

**Impact:**
- ❌ Cannot deploy to production until PostgreSQL is provisioned
- ❌ Runtime configuration is incomplete for production
- ❌ Backup/restore readiness is not yet confirmed

**Next Step:** Provision production PostgreSQL, configure runtime secrets, and confirm backup/restore workflow.

---

## 3. No Role-Based Permissions Yet ⚠️#

**Status:** ❌ Not implemented

**Details:**
- `UserRole` enum exists (ADMIN, MEMBER, VIEWER) but not enforced
- No permission checks in server actions
- No UI gating based on role
- Organization-level access not enforced

**Impact:**
- All users have full access to all decisions in their org
- No audit trail for permission changes
- Cannot restrict sensitive decisions

**Next Step:** Enforce roles in server actions + UI guards.

---

## 4. No Automated Test Suite Yet ⚠️#

**Status:** ❌ Manual testing only

**Details:**
- No unit tests (Jest, Vitest)
- No integration tests for server actions
- No E2E tests (Playwright, Cypress)
- No CI/CD pipeline configured
- Testing relies on `TESTING_CHECKLIST.md` manual flows

**Impact:**
- ❌ Regression risks on every change
- ❌ No confidence in refactoring
- ❌ Cannot automate releases

**Next Step:** Add test suite (Phase 1: critical paths like gates).

---

## 5. No External Integrations Yet ⚠️#

**Status:** ❌ Not implemented

**Details:**
- No email notifications (SMTP not configured)
- No webhook support for external systems
- No API endpoints for third-party integration
- No export/import functionality (PDF, Excel)
- No calendar integration for deadlines

**Impact:**
- ❌ Users must check system manually
- ❌ No workflow automation with external tools
- ❌ Limited adoption in enterprise environments

**Next Step:** Add integrations based on client requirements (A-5 Agents layer).

---

## 6. Additional Limitations#

### UI/UX
- [ ] No responsive design verification (mobile untested)
- [ ] No accessibility audit (WCAG compliance)
- [ ] No loading skeletons (basic loading text only)
- [ ] No toast notifications for action feedback
- [ ] No confirmation dialogs for destructive actions

### Performance
- [ ] No pagination on lists (sectors, signals, alerts)
- [ ] No caching strategy for derived outputs
- [ ] No image optimization for sector icons
- [ ] No code splitting analysis

### Data Integrity
- [ ] No soft delete (records hard deleted)
- [ ] No version history on decisions
- [ ] No conflict resolution for concurrent edits
- [ ] No data validation beyond Prisma schemas

### Monitoring
- [ ] No error tracking (Sentry, LogRocket)
- [ ] No analytics (user behavior tracking)
- [ ] No performance monitoring (Core Web Vitals)
- [ ] No uptime monitoring

---

## Production Readiness Checklist#

Before full production deployment:
- [ ] ✅ TypeScript clean (`tsc --noEmit`)
- [ ] ✅ Build passing (`npm run build`)
- [ ] ✅ ESLint clean (0 errors)
- [ ] ❌ Auth system implemented + tested
- [ ] ❌ Production database migrated (PostgreSQL)
- [ ] ❌ Role-based permissions enforced
- [ ] ❌ Automated test suite (≥70% coverage)
- [ ] ❌ External integrations configured
- [ ] ❌ Security audit passed
- [ ] ❌ Performance audit passed
- [ ] ❌ Accessibility audit passed

---

## Current Use Case#

✅ **Approved for:**
- Internal team testing
- Pilot programs with trusted users
- Sector intelligence bootstrapping
- Manual decision pipeline validation

❌ **NOT approved for:**
- Public internet exposure
- External client deployments
- Sensitive/regulated industry use
- High-volume concurrent users

---

*Last updated: 2026-05-05*
