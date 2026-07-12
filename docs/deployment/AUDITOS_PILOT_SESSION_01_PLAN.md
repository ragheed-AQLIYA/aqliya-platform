# AuditOS Pilot — Session 01 Plan

**Date:** 2026-07-09 | **Duration:** 45-60 min | **Platform:** `app.aqliya.com`

---

## Session Goal

Verify the core AuditOS workflow: login → engagement → evidence → governance → export

## Participants

| Role | Account | Action |
|------|---------|--------|
| Admin/Partner | `partner@aqliya.com` | Lead the session, create engagement |
| Observer | Pilot operator | Take notes via feedback log |

## Account Setup (pre-session)

- [ ] Create accounts via `/signup` or admin panel
- [ ] Assign roles: partner → admin, reviewer → reviewer
- [ ] Verify login works
- [ ] Share credentials securely

## Route Sequence

```
1.  https://app.aqliya.com              → Marketing page
2.  /login                              → Login with partner account
3.  /audit                              → AuditOS dashboard
4.  /audit/portfolio                    → Engagement list
5.  /audit/engagements/eng-gulf-2025    → Engagement detail (all tabs)
6.  /audit/engagements/eng-gulf-2025/evidence   → Evidence tab
7.  /audit/engagements/eng-gulf-2025/findings    → Findings tab
8.  /audit/engagements/eng-gulf-2025/review      → Review tab
9.  /audit/engagements/eng-gulf-2025/approval    → Approval tab
10. /audit/engagements/eng-gulf-2025/exports     → Export tab
11. /audit/engagements/eng-gulf-2025/audit-trail → Audit trail
12. /audit/quality                      → ISQM1 quality metrics
```

## Talking Points

| Stop | Topic | Key Message |
|------|-------|-------------|
| Login | Auth + security | "All routes are auth-protected" |
| Dashboard | Platform | "This is your AuditOS workspace" |
| Engagement | Breadth | "Full financial audit lifecycle" |
| Evidence | Governance | "Every file is versioned + scanned" |
| Review | Human-in-loop | "AI assists, humans decide" |
| Export | Compliance | "Bilingual PDF with full audit trail" |

## Evidence to Collect

- [ ] Screenshot of /audit dashboard
- [ ] Screenshot of engagement with tabs
- [ ] Screenshot of evidence section
- [ ] Screenshot of export initiation
- [ ] Note any errors or slow loads

## Success Criteria

| Criterion | Pass/Fail |
|-----------|-----------|
| All routes load without 500 | ⬜ |
| User can navigate between tabs | ⬜ |
| Evidence tab renders | ⬜ |
| Export option visible | ⬜ |
| No blocker bugs | ⬜ |

## Failure Recovery

| Issue | Action |
|-------|--------|
| Route returns 500 | Check logs, reload, try alternate route |
| Auth fails | Use admin panel to reset password |
| Data missing | Run `prisma db seed` |
| Network error | Try ALB directly via HTTP |
| Any blocker | Record in feedback log, continue to next flow |
