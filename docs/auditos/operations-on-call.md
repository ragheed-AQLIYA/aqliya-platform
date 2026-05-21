# Operations — On-Call & Incident Response

## On-Call Rotation

| Role                | Primary              | Backup             | Escalation          |
| ------------------- | -------------------- | ------------------ | ------------------- |
| Application support | Pilot operator       | AQLIYA engineering | Product lead        |
| Database admin      | Infrastructure admin | AQLIYA engineering | Infrastructure lead |
| Security incident   | Security lead        | AQLIYA engineering | CTO                 |

## Incident Severity Matrix

| Severity    | Definition                              | Response Time | Resolution Time |
| ----------- | --------------------------------------- | ------------- | --------------- |
| 🔴 Critical | System down, data loss, security breach | 15 minutes    | 4 hours         |
| 🟠 High     | Major feature broken, auth failure      | 1 hour        | 8 hours         |
| 🟡 Medium   | Minor feature issue, UI bug             | 4 hours       | 24 hours        |
| 🟢 Low      | Cosmetic issue, documentation gap       | 24 hours      | Next release    |

## Incident Response Process

1. **Detect** — Automated alert or user report
2. **Triage** — Determine severity using matrix
3. **Respond** — Assign owner based on severity
4. **Fix** — Implement fix or workaround
5. **Verify** — Confirm resolution
6. **Document** — Record incident in pilot log
7. **Review** — Post-mortem for critical/high incidents

## Owner Assignments

| Area                   | Primary Owner        | Contact             |
| ---------------------- | -------------------- | ------------------- |
| Application (AuditOS)  | Pilot operator       | Via support channel |
| Authentication / Auth  | AQLIYA engineering   | Via escalation      |
| Database / Prisma      | Infrastructure admin | Via escalation      |
| File upload / scanning | AQLIYA engineering   | Via escalation      |
| Export / reporting     | AQLIYA engineering   | Via escalation      |
| AI generation          | AQLIYA engineering   | Via escalation      |
| Backup / recovery      | Infrastructure admin | Via escalation      |
| Security incidents     | Security lead        | Via escalation      |

## Support Channels

| Type      | Channel              | Response        |
| --------- | -------------------- | --------------- |
| L1 issues | Pilot operator       | Immediate       |
| L2 issues | AQLIYA engineering   | Within 4 hours  |
| L3 issues | Infrastructure admin | Within 24 hours |

## Escalation Path

```
Pilot Operator → L1
  ↓ (if unresolved)
AQLIYA Engineering Lead → L2
  ↓ (if unresolved)
Infrastructure / Security Lead → L3
  ↓ (if critical)
Product Lead / CTO
```

## Backup Ownership

| Task                   | Owner                             | Frequency |
| ---------------------- | --------------------------------- | --------- |
| Daily backup execution | Infrastructure admin              | Daily     |
| Backup verification    | Infrastructure admin              | Weekly    |
| Restore test           | Infrastructure admin              | Monthly   |
| Backup monitoring      | Pilot operator (via audit:health) | Daily     |
