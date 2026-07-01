# Pilot Weekly Operating Rhythm — AQLIYA

## Purpose

Define the daily/weekly operational cadence during an active pilot. Clarifies who does what, when, and how decisions are made.

## When to Use

- Established at pilot kickoff
- Followed for the duration of the pilot
- Reviewed at closeout for lessons learned

## Inputs

- Pilot command center (`pilot-command-center.md`)
- Pilot stop conditions (`pilot-control-pack/pilot-stop-conditions.md`)
- Pilot success criteria (`pilot-control-pack/pilot-success-criteria.md`)

---

## Daily Cadence

### AQLIYA Team Daily Check (15 min)

| Time       | What                                               | Who               |
| ---------- | -------------------------------------------------- | ----------------- |
| Morning    | Review pilot status, open risks, customer messages | AQLIYA Pilot Lead |
| Ongoing    | Log customer interactions, update command center   | AQLIYA Lead       |
| End of day | Verify data integrity, check audit events          | Technical Lead    |

### Daily Questions

1. Are there any 🔴 Hard Stop or 🟡 Pause conditions triggered?
2. Has the customer raised any new issue or request?
3. Is the system available and performing normally?
4. Are there pending decisions that need escalation?

---

## Weekly Cadence

### AQLIYA Internal Weekly Review (30 min)

| When  | Topic                                             | Participants              |
| ----- | ------------------------------------------------- | ------------------------- |
| Day 1 | Review pilot status, success criteria progress    | Pilot Lead + Tech Lead    |
| Day 3 | Risk review, open decisions, escalation decisions | Pilot Lead + Product Lead |
| Day 5 | Customer feedback review, next week plan          | Pilot Lead + Tech Lead    |

### Weekly Agenda

1. **Pilot Command Center review** — status, next action, open risks
2. **Success criteria progress** — operational, quality, governance, satisfaction
3. **Risk register review** — new risks, mitigation status, escalations
4. **Customer sentiment** — feedback from last session, concerns, feature requests
5. **Data review** — data quality, deletion schedule, evidence completeness
6. **Decisions needed** — open decisions with blockers
7. **Plans for next week** — customer sessions, milestones, deliverables

### Customer Touchpoint (Weekly, 60 min)

| Time   | Topic                                |
| ------ | ------------------------------------ |
| 5 min  | Review of last week's progress       |
| 15 min | Product demo or review of new output |
| 15 min | Customer feedback and concerns       |
| 10 min | Data and evidence review             |
| 10 min | Open issues and decisions            |
| 5 min  | Next steps and upcoming sessions     |

---

## Escalation Cadence

| Issue Type   | Escalate To                   | Timeframe     |
| ------------ | ----------------------------- | ------------- |
| 🟢 Watch     | Pilot Lead                    | Weekly review |
| 🟡 Pause     | Pilot Lead → Product Lead     | Within 24h    |
| 🔴 Hard Stop | Product Lead → Immediate team | Immediately   |

## Decision Cadence

| Decision Type               | Who Decides                            | When          |
| --------------------------- | -------------------------------------- | ------------- |
| Daily operational decisions | Pilot Lead                             | Daily         |
| Scope changes               | Product Lead + Customer Lead           | Weekly review |
| Stop/Pause decision         | Product Lead (can be raised by anyone) | Immediately   |
| Conversion decision         | Product Lead + Customer Lead           | Closeout      |

---

## Acceptance Criteria

The operating rhythm is established when:

1. Daily check is assigned to a named individual
2. Weekly internal and customer meetings are scheduled
3. Escalation paths are clear to all team members

## Owner

- **Rhythm Keeper:** AQLIYA Pilot Lead

## Related Files in Pilot Control Pack

- `pilot-control-pack/pilot-success-criteria.md`
- `pilot-control-pack/pilot-stop-conditions.md`
- `pilot-control-pack/customer-data-handling-rules.md`

## Status

- [ ] Established
- [ ] Active
- [ ] Reviewed at closeout
