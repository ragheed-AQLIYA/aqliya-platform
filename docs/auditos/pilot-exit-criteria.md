# Limited Production Pilot — Exit Criteria

## Overview

These criteria define when AuditOS can transition from limited production pilot to external production readiness.

---

## Required Criteria (All Must Be Met)

### 1. Virus/Malware Scanning

- [ ] Scanner provider integrated and verified (ClamAV, cloud, or equivalent)
- [ ] Scanner provider configured via `SCANNER_PROVIDER` in production
- [ ] Scanner test passes: clean file accepted, infected file rejected
- [ ] Scanning AuditEvent recorded for every upload
- [ ] Scanner failure blocks upload in production

### 2. Authentication

- [ ] SSO/OAuth provider configured (Google, Azure AD, or equivalent)
- [ ] Password-based Credentials provider disabled or restricted
- [ ] User provisioning workflow automated (self-service or delegated)
- [ ] Session timeout configured
- [ ] Brute-force protection active

### 3. Backup

- [ ] Automated database backup configured and verified
- [ ] Backup monitoring active (alerts on failure)
- [ ] Restore procedure tested within last 30 days
- [ ] Backup retention policy enforced

### 4. Monitoring

- [ ] Application performance monitoring deployed
- [ ] Error rate alerting configured (>5% in 5 minutes)
- [ ] Auth failure monitoring active
- [ ] Upload failure monitoring active
- [ ] Export failure monitoring active
- [ ] Health check endpoint exposed to monitoring system

### 5. Export

- [ ] PDF or DOCX export implemented and verified
- [ ] OR formal business decision to remain JSON-only with stakeholder acceptance
- [ ] Draft/final labels preserved in all export formats

### 6. Security

- [ ] External security review / penetration testing completed
- [ ] All findings resolved or accepted with documented risk
- [ ] Tenant isolation re-verified with multi-org test
- [ ] Rate limiting verified for production load
- [ ] File upload security review signed off

### 7. Operations

- [ ] Runbook updated for production environment
- [ ] On-call rotation defined
- [ ] Support escalation process tested
- [ ] Rollback procedure tested

### 8. UAT

- [ ] Manual UAT completed with real client data (controlled)
- [ ] Zero critical or high-priority bugs open
- [ ] All 23 UAT test cases pass
- [ ] Stakeholder sign-off received

---

## Scoring

| Category               | Required | Met     | Notes |
| ---------------------- | -------- | ------- | ----- |
| Virus/malware scanning | 5        | /5      |       |
| Authentication         | 5        | /5      |       |
| Backup                 | 4        | /4      |       |
| Monitoring             | 5        | /5      |       |
| Export                 | 3        | /3      |       |
| Security               | 5        | /5      |       |
| Operations             | 4        | /4      |       |
| UAT                    | 4        | /4      |       |
| **Total**              | **35**   | **/35** |       |

**Result:** ☐ Pass (35/35) ☐ Conditional pass (≥30/35 with documented exceptions) ☐ Fail (<30/35)

---

## Decision

| Stage                           | Criteria                                |
| ------------------------------- | --------------------------------------- |
| **Move to external production** | All 35 criteria met                     |
| **Extend limited pilot**        | ≥30 criteria met, exceptions documented |
| **Pause pilot / return to dev** | <30 criteria met                        |

---

## Sign-Off

| Role                       | Name | Signature | Date |
| -------------------------- | ---- | --------- | ---- |
| AQLIYA Product Lead        |      |           |      |
| AQLIYA Security Lead       |      |           |      |
| Stakeholder Representative |      |           |      |
