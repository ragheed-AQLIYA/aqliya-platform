# Limited Production Pilot — Support SOP

## Overview

Standard operating procedures for common pilot support scenarios.

---

## 1. Failed Login

**Error:** Invalid credentials or login page does not load

**Checklist:**
- [ ] Is the user typing the correct email/password?
- [ ] Is the user account active in the database? (`AuditUser.status = "active"`)
- [ ] Is the user provisioned as an AuditUser? (`AuditUser` record exists with matching email + organizationId)
- [ ] Is `AUTH_SECRET` configured correctly?
- [ ] Is the NextAuth configuration correct?

**Resolution:**
1. If user account is inactive → Admin re-activates via Admin UI or DB
2. If no AuditUser → Admin provisions via `/audit/admin/users`
3. If auth config issue → Restart application, verify `.env`

---

## 2. "Audit User Not Provisioned" Error

**Error:** User can log in but cannot perform AuditOS actions

**Cause:** Session user exists but no matching `AuditUser` record

**Resolution:**
1. Admin navigates to `/audit/admin/users`
2. Clicks "Provision User"
3. Enters the user's email, name, and role
4. User can now perform actions

---

## 3. Failed Upload (File Type)

**Error:** `"Unsupported file type: {type}. Allowed: pdf, xlsx, ..."`

**Checklist:**
- [ ] Is the file type in the allowed list? (`pdf, xlsx, xls, docx, jpg, jpeg, png, csv`)
- [ ] Is the file extension correct?

**Resolution:**
1. Convert the file to an allowed format
2. Retry upload

---

## 4. Failed Upload (File Size)

**Error:** `"File too large: {size}MB. Maximum: 20MB"`

**Checklist:**
- [ ] Is the file under 20MB?
- [ ] Can the file be compressed or split?

**Resolution:**
1. Compress or split the file
2. Retry upload

---

## 5. Upload Blocked by Scanner

**Error:** `"File scanning is not configured. Upload blocked for production safety."`

**Cause:** `NODE_ENV=production` but `SCANNER_PROVIDER` is not configured

**Resolution:**
1. Configure a scanner provider by setting `SCANNER_PROVIDER` in `.env`
2. Restart application
3. Or accept the limitation and keep uploads blocked

---

## 6. Failed Export

**Error:** Export does not download or returns error

**Checklist:**
- [ ] Is the engagement accessible?
- [ ] Are there statements and notes to export?
- [ ] Is the user authorized (correct role)?

**Resolution:**
1. Verify engagement data exists
2. Retry after page refresh
3. If persists, check application logs

---

## 7. Failed Approval

**Error:** Approval button is disabled or returns error

**Checklist:**
- [ ] Is the user role `partner` or `admin`?
- [ ] Are all readiness checks passed? (accounts mapped, evidence collected, reviews resolved, no critical findings)
- [ ] Is the engagement in an eligible status?

**Resolution:**
1. Check readiness checklist on the Approval page
2. Resolve any blocking issues
3. Only `partner` or `admin` roles can approve

---

## 8. Tenant Access Denied

**Error:** `"Access denied: engagement belongs to another organization"`

**Cause:** User tried to access an engagement from a different organization

**Checklist:**
- [ ] Is the user assigned to the correct organization?
- [ ] Is the engagement in the user's organization?

**Resolution:**
1. User should only access engagements in their own organization
2. If user needs cross-org access, an admin must provision them in the target org

---

## 9. Failed Health Check

**Error:** One or more health checks fail

**Checklist:**
- [ ] Check each failed check's cause
- [ ] Is the database running?
- [ ] Is Prisma connected?

**Resolution:**
Refer to the health check section in the Limited Production Pilot Runbook.

---

## 10. Rollback Process

**Trigger:** Unresolvable issue during pilot

**Steps:**
1. Stop application
2. Restore database from latest backup
3. Revert code to previous tag/commit
4. Rebuild and restart
5. Verify health check passes

---

## Escalation Levels

| Level | Contact | When |
|-------|---------|------|
| L1 | Pilot operator | First response, common issues |
| L2 | AQLIYA engineering | Issues beyond runbook scope |
| L3 | Infrastructure admin | Database, server, network issues |

**Response times:** L1 within 4 hours, L2 within 24 hours, L3 within 48 hours.
