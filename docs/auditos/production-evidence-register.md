# AuditOS — Production Evidence Register

## Instructions

Each row records evidence collected for production readiness criteria. Evidence must be verifiable and dated.

---

## Category A: Scanner Provider

| #   | Evidence                            | Source      | Date | Verifier | Status |
| --- | ----------------------------------- | ----------- | ---- | -------- | ------ |
| A.1 | SCANNER_PROVIDER env var configured | `.env`      | —    | —        | ❌     |
| A.2 | Clean file test result              | Scanner log | —    | —        | ❌     |
| A.3 | Infected file test result           | Scanner log | —    | —        | ❌     |
| A.4 | Scanner failure blocks upload       | Test result | —    | —        | ❌     |
| A.5 | evidence.file_scanned AuditEvent    | Database    | —    | —        | ❌     |

## Category B: SSO/OAuth

| #   | Evidence                          | Source         | Date | Verifier | Status |
| --- | --------------------------------- | -------------- | ---- | -------- | ------ |
| B.1 | OAuth provider configured         | auth-config.ts | —    | —        | ❌     |
| B.2 | Session → AuditUser mapping test  | Test result    | —    | —        | ❌     |
| B.3 | Production demo fallback disabled | Code review    | —    | —        | ❌     |
| B.4 | Role mapping test                 | Test result    | —    | —        | ❌     |
| B.5 | Admin provisioning works with SSO | Test result    | —    | —        | ❌     |

## Category C: Risk Acceptance

| #   | Evidence                    | Source         | Date | Verifier | Status |
| --- | --------------------------- | -------------- | ---- | -------- | ------ |
| C.1 | Signed Risk Acceptance Form | docs/          | —    | —        | ❌     |
| C.2 | Signer name recorded        | Form           | —    | —        | ❌     |
| C.3 | Limitations acknowledged    | Form checklist | —    | —        | ❌     |

## Category D: On-Call Staffing

| #   | Evidence                   | Source                | Date | Verifier | Status |
| --- | -------------------------- | --------------------- | ---- | -------- | ------ |
| D.1 | Named L1 owner             | operations-on-call.md | —    | —        | ❌     |
| D.2 | Named L2 owner             | operations-on-call.md | —    | —        | ❌     |
| D.3 | Named L3 owner             | operations-on-call.md | —    | —        | ❌     |
| D.4 | Response-time expectations | operations-on-call.md | —    | —        | ❌     |

## Category E: Escalation Test

| #   | Evidence                | Source                 | Date | Verifier | Status |
| --- | ----------------------- | ---------------------- | ---- | -------- | ------ |
| E.1 | Test scenario executed  | escalation-test-log.md | —    | —        | ❌     |
| E.2 | L1 acknowledgement time | escalation-test-log.md | —    | —        | ❌     |
| E.3 | L2 escalation time      | escalation-test-log.md | —    | —        | ❌     |
| E.4 | Resolution time         | escalation-test-log.md | —    | —        | ❌     |
| E.5 | Gaps documented         | escalation-test-log.md | —    | —        | ❌     |

## Category F: Backup Scheduler

| #   | Evidence                | Source                      | Date | Verifier | Status |
| --- | ----------------------- | --------------------------- | ---- | -------- | ------ |
| F.1 | Scheduler configured    | Server crontab              | —    | —        | ❌     |
| F.2 | Backup command verified | Test run                    | —    | —        | ❌     |
| F.3 | Frequency documented    | backup-schedule-evidence.md | —    | —        | ❌     |
| F.4 | Owner assigned          | backup-schedule-evidence.md | —    | —        | ❌     |

## Category G: Penetration Test

| #    | Evidence                 | Source         | Date | Verifier | Status |
| ---- | ------------------------ | -------------- | ---- | -------- | ------ |
| G.1  | Pen test report          | Vendor report  | —    | —        | ❌     |
| G.2  | Auth testing results     | Report section | —    | —        | ❌     |
| G.3  | Tenant isolation results | Report section | —    | —        | ❌     |
| G.4  | File upload results      | Report section | —    | —        | ❌     |
| G.5  | Rate limiting results    | Report section | —    | —        | ❌     |
| G.6  | Server action results    | Report section | —    | —        | ❌     |
| G.7  | Export results           | Report section | —    | —        | ❌     |
| G.8  | Audit log results        | Report section | —    | —        | ❌     |
| G.9  | Findings remediated      | Re-test report | —    | —        | ❌     |
| G.10 | Security sign-off        | Sign-off doc   | —    | —        | ❌     |

## Summary

| Category         | Evidence Items | Completed | Pending | Completion % |
| ---------------- | -------------- | --------- | ------- | ------------ |
| Scanner          | 5              | 0         | 5       | 0%           |
| SSO/OAuth        | 5              | 0         | 5       | 0%           |
| Risk Acceptance  | 3              | 0         | 3       | 0%           |
| On-Call          | 4              | 0         | 4       | 0%           |
| Escalation Test  | 5              | 0         | 5       | 0%           |
| Backup Scheduler | 4              | 0         | 4       | 0%           |
| Penetration Test | 10             | 0         | 10      | 0%           |
| **Total**        | **36**         | **0**     | **36**  | **0%**       |
