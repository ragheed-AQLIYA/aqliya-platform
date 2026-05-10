# Penetration Testing Scope

## Status

⏳ **Not yet conducted.** This document defines the scope and criteria for when penetration testing is performed.

## Scope Areas

### 1. Authentication

| Test | Method | Expected |
|------|--------|----------|
| Session hijacking | JWT token interception | Token is signed and verified |
| Brute force login | Repeated login attempts | Rate limited or account lockout |
| Role escalation | Attempt admin actions as operator | Blocked by requireRole() |
| Unauthenticated access | Access protected routes without session | Blocked by NextAuth |

### 2. Tenant Isolation

| Test | Method | Expected |
|------|--------|----------|
| Cross-org engagement read | Attempt to read org2 engagement from org1 | Blocked by assertEngagementAccess() |
| Cross-org evidence access | Attempt to access org2 evidence from org1 | Blocked |
| Cross-org mutation | Attempt to modify org2 data from org1 | Blocked |
| Cross-org export | Export org2 data from org1 session | Blocked |

### 3. File Upload

| Test | Method | Expected |
|------|--------|----------|
| File type bypass | Upload with manipulated extension | Blocked by whitelist |
| File size bypass | Upload oversized file | Blocked by size limit |
| Malware upload | Upload known malware sample (EICAR) | Blocked if scanner configured |
| Directory traversal | Path manipulation in filename | Blocked |

### 4. Rate Limiting

| Test | Method | Expected |
|------|--------|----------|
| Upload rate limit | Rapid evidence creation | Blocked after limit |
| AI generation rate limit | Rapid AI output requests | Blocked after limit |
| Export rate limit | Rapid export downloads | Blocked after limit |
| Mutation rate limit | Rapid CRUD operations | Blocked after limit |

### 5. Server Actions

| Test | Method | Expected |
|------|--------|----------|
| Actor ID injection | Pass fake actorId in request | Server resolves from session |
| Role injection | Attempt action without required role | Blocked by requireRole() |
| Engagement ID injection | Pass engagementId from different org | Blocked by tenant guard |
| Audit event manipulation | Attempt to create/delete audit events | No endpoints exist |

### 6. Exports

| Test | Method | Expected |
|------|--------|----------|
| Unauthorized export | Export without proper role | Blocked |
| Cross-org export | Export engagement from other org | Blocked by tenant guard |
| Data leakage | Check exported JSON for sensitive fields | No PII in export |

### 7. Audit Log

| Test | Method | Expected |
|------|--------|----------|
| Audit event deletion | Attempt to delete events | No delete endpoint |
| Audit event modification | Attempt to modify events | No update endpoint |
| Audit event forgery | Create fake events | Requires authenticated session |

## Pass/Fail Criteria

| Result | Definition |
|--------|------------|
| ✅ Pass | No vulnerabilities found |
| ⚠️ Low | Minor issue, documented, no immediate fix required |
| ❌ Medium | Should be fixed before production |
| ❌ High | Must be fixed before production |
| ❌ Critical | Stop all activity until fixed |

## Required Before External Production

- [ ] All critical and high findings resolved
- [ ] All medium findings accepted or resolved
- [ ] Re-test after fixes
- [ ] Penetration test report signed off
- [ ] Remediation evidence documented
