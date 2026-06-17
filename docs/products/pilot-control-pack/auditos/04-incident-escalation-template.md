# AuditOS Pilot Incident / Escalation Template

## Incident Information

| Field         | Value                                       |
| ------------- | ------------------------------------------- |
| Incident ID   | `AUDITOS-PILOT-<YYYYMMDD>-<NN>`             |
| Date reported |                                             |
| Time reported |                                             |
| Reported by   |                                             |
| Severity      | Critical / High / Medium / Low              |
| Status        | Open / Investigating / Resolved / Won't Fix |

## Classification

### Severity Definitions

| Severity | Definition                                          | Response time   |
| -------- | --------------------------------------------------- | --------------- |
| Critical | Data leak, auth bypass, security breach             | Immediate       |
| High     | Workflow broken, data corruption, export wrong data | Within 1 hour   |
| Medium   | UI bug, confusing flow, missing validation          | Within 24 hours |
| Low      | Typo, cosmetic, nice-to-have                        | Next sprint     |

### Category

- [ ] Security / Auth
- [ ] Data integrity
- [ ] Workflow bug
- [ ] UI / UX
- [ ] Export / output
- [ ] Environment / deployment
- [ ] Performance
- [ ] Governance gap
- [ ] Documentation
- [ ] Other: **\_**

## Description

**What happened:**

**Expected behavior:**

**Actual behavior:**

**Steps to reproduce:**

1.
2.
3.

**Environment details:**

- Commit hash:
- Database state:
- User role:

## Evidence

- [ ] Screenshot(s) attached
- [ ] Log output attached
- [ ] Network request captured
- [ ] Audit event ID:
- [ ] Test data preserved

## Impact

- Affected users:
- Affected data:
- Blocking pilot continuation? Yes / No
- Participant aware? Yes / No

## Resolution

**Root cause:**

**Fix applied:**

**Verified by:**

**Resolution date:**

## Escalation Path

| Level                       | Contact | Status |
| --------------------------- | ------- | ------ |
| L1: Pilot operator          |         |        |
| L2: Platform lead           |         |        |
| L3: Architecture / Security |         |        |

## Follow-Up

- [ ] Root cause documented
- [ ] Fix verified in pilot environment
- [ ] Post-session review updated (07)
- [ ] Lessons learned added to runbook (06)
- [ ] Incident closed
