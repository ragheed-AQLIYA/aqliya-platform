# AuditOS Pilot — Session 01 Preflight

**Date:** 2026-07-09 | **Status:** Ready for account creation

---

## Preflight Checklist

### ✅ Complete — Infrastructure

| Item | Status |
|------|--------|
| Redis HA (2 nodes, Multi-AZ, failover) | ✅ Applied and verified |
| Smoke test — `/api/health` | ✅ 200 |
| Smoke test — `/login` | ✅ 200 |
| Smoke test — `/audit` | ✅ 307 (auth-protected) |
| Smoke test — `/` | ✅ 200 |
| ECS stability (1/1 running) | ✅ |

### 🔲 Required — Accounts

Create 4 accounts via `https://app.aqliya.com/signup`:

| Role | Email | Password | Tests |
|------|-------|----------|-------|
| Partner | `partner@aqliya.com` | Set during signup | Full engagement lifecycle |
| Manager | `manager@aqliya.com` | Set during signup | Review + evidence |
| Senior | `senior@aqliya.com` | Set during signup | Evidence upload |
| Reviewer | `reviewer@aqliya.com` | Set during signup | Independent review |

### ✅ Ready — Materials

| Item | Location |
|------|----------|
| Session script | `AUDITOS_PILOT_SESSION_01_PLAN.md` |
| Feedback log | `AUDITOS_PILOT_FEEDBACK_LOG.md` |
| Success criteria | `AUDITOS_PILOT_SUCCESS_CRITERIA.md` |
| Route sequence | 12 steps (login → dashboard → portfolio → engagement → evidence → findings → review → approval → export → audit-trail → quality) |

---

## Account Setup

```bash
# Open browser to:
https://app.aqliya.com/signup

# Create each account:
# 1. Fill email + password
# 2. Assign role via admin panel /settings/team
# 3. Verify login

# Quick verification for partner@:
curl -I https://app.aqliya.com/audit
# Expected: 307 (redirect to login)

# After login:
curl -I https://app.aqliya.com/audit/engagements/eng-gulf-2025
# Expected: 200
```

---

## Session Go/No-Go

| Gate | Status |
|------|--------|
| Accounts created | ❌ Pending |
| Account login verified | ❌ Pending |
| Engagement accessible | ❌ Pending |
| **Decision** | **⏳ Wait for accounts** |
