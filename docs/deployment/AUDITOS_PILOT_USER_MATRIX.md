# AuditOS Pilot — User Matrix

**Status:** Ready | **Date:** 2026-07-09 | **Platform:** `app.aqliya.com`

---

## Roles

| Role | Permissions | Pilot Account | Scenario |
|------|------------|---------------|----------|
| **Admin / Partner** | Full access, settings, user management | `partner@aqliya.com` | Create engagement, manage team, final approval |
| **Manager** | Engagement management, review, evidence | `manager@aqliya.com` | Day-to-day engagement oversight, review workpapers |
| **Senior Auditor** | Evidence upload, findings, workpapers | `senior@aqliya.com` | Execute audit procedures, document evidence |
| **Reviewer** | Review, approval, recommendation | `reviewer@aqliya.com` | Independent review of audit outputs |

## User Setup Checklist

- [ ] Accounts created via `/signup` or admin panel
- [ ] Roles assigned to each account
- [ ] Login credentials shared securely
- [ ] Access to `app.aqliya.com/audit` verified
- [ ] Auth flow tested (login → redirect → workspace)

## Auth Flow

```
1. User opens app.aqliya.com/audit
2. Redirected to /login (307)
3. User enters credentials
4. Redirected back to /audit
5. User sees AuditOS workspace
```

## Security Notes

- Passwords set during initial login
- MFA can be configured via `/settings/mfa`
- Session timeout follows platform settings
- All actions are audited via AuditLog
