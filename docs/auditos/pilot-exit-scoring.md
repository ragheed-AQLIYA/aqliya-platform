# AQLIYA AuditOS — Pilot Exit Criteria Scoring

## Instructions

Score each criterion as:
- **Pass** (✅) — requirement met with evidence
- **Partial** (◐) — requirement partially met, documented exception
- **Fail** (❌) — requirement not met, action required

---

## 1. Virus/Malware Scanning

| # | Criterion | Score | Evidence | Required Action | Owner |
|---|-----------|-------|----------|----------------|-------|
| 1.1 | Scanner provider integrated | ☐ | | | |
| 1.2 | Scanner configured via SCANNER_PROVIDER | ☐ | | | |
| 1.3 | Scanner test: clean accepted, infected rejected | ☐ | | | |
| 1.4 | Scan AuditEvent recorded per upload | ☐ | | | |
| 1.5 | Scanner failure blocks upload in production | ☐ | | | |
| **Subtotal** | **/5** | | | | |

## 2. Authentication

| # | Criterion | Score | Evidence | Required Action | Owner |
|---|-----------|-------|----------|----------------|-------|
| 2.1 | SSO/OAuth provider configured | ☐ | | | |
| 2.2 | Password provider disabled or restricted | ☐ | | | |
| 2.3 | User provisioning automated | ☐ | | | |
| 2.4 | Session timeout configured | ☐ | | | |
| 2.5 | Brute-force protection active | ☐ | | | |
| **Subtotal** | **/5** | | | | |

## 3. Backup

| # | Criterion | Score | Evidence | Required Action | Owner |
|---|-----------|-------|----------|----------------|-------|
| 3.1 | Automated backup configured | ☐ | | | |
| 3.2 | Backup monitoring active | ☐ | | | |
| 3.3 | Restore tested within 30 days | ☐ | | | |
| 3.4 | Retention policy enforced | ☐ | | | |
| **Subtotal** | **/4** | | | | |

## 4. Monitoring

| # | Criterion | Score | Evidence | Required Action | Owner |
|---|-----------|-------|----------|----------------|-------|
| 4.1 | APM deployed | ☐ | | | |
| 4.2 | Error rate alerting configured | ☐ | | | |
| 4.3 | Auth failure monitoring active | ☐ | | | |
| 4.4 | Upload failure monitoring active | ☐ | | | |
| 4.5 | Health check in monitoring system | ☐ | | | |
| **Subtotal** | **/5** | | | | |

## 5. Export

| # | Criterion | Score | Evidence | Required Action | Owner |
|---|-----------|-------|----------|----------------|-------|
| 5.1 | PDF/DOCX or formal decision to remain JSON-only | ☐ | | | |
| 5.2 | Stakeholder acceptance of export format | ☐ | | | |
| 5.3 | Draft/final labels preserved | ☐ | | | |
| **Subtotal** | **/3** | | | | |

## 6. Security

| # | Criterion | Score | Evidence | Required Action | Owner |
|---|-----------|-------|----------|----------------|-------|
| 6.1 | External security review completed | ☐ | | | |
| 6.2 | All findings resolved or accepted | ☐ | | | |
| 6.3 | Tenant isolation re-verified | ☐ | | | |
| 6.4 | Rate limiting verified for load | ☐ | | | |
| 6.5 | File upload security signed off | ☐ | | | |
| **Subtotal** | **/5** | | | | |

## 7. Operations

| # | Criterion | Score | Evidence | Required Action | Owner |
|---|-----------|-------|----------|----------------|-------|
| 7.1 | Runbook updated for production | ☐ | | | |
| 7.2 | On-call rotation defined | ☐ | | | |
| 7.3 | Support escalation tested | ☐ | | | |
| 7.4 | Rollback procedure tested | ☐ | | | |
| **Subtotal** | **/4** | | | | |

## 8. UAT

| # | Criterion | Score | Evidence | Required Action | Owner |
|---|-----------|-------|----------|----------------|-------|
| 8.1 | UAT with real client data (controlled) | ☐ | | | |
| 8.2 | Zero critical/high bugs open | ☐ | | | |
| 8.3 | All 23 UAT test cases pass | ☐ | | | |
| 8.4 | Stakeholder sign-off received | ☐ | | | |
| **Subtotal** | **/4** | | | | |

---

## Final Score

| Category | Score | Weight |
|----------|-------|--------|
| Virus/malware scanning | /5 | 14% |
| Authentication | /5 | 14% |
| Backup | /4 | 11% |
| Monitoring | /5 | 14% |
| Export | /3 | 9% |
| Security | /5 | 14% |
| Operations | /4 | 11% |
| UAT | /4 | 11% |
| **Total** | **/35** | **100%** |

## Decision

| Score | Action |
|-------|--------|
| **35/35** | ✅ **Candidate for external production review** |
| **30–34** | 🔄 **Extend pilot** — document exceptions |
| **< 30** | ⛔ **Pause and remediate** |

## Sign-Off

| Role | Name | Date |
|------|------|------|
| AQLIYA Product Lead | | |
| AQLIYA Security Lead | | |
| Pilot Sponsor | | |
