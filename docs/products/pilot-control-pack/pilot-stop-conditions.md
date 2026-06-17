# Pilot Stop Conditions — AQLIYA

## Purpose

Define the conditions under which a controlled pilot must be paused, stopped, or terminated immediately. These are non-negotiable safety triggers.

## When to Use

Reviewed before pilot kickoff. Monitored continuously during pilot. Any team member may raise a stop condition.

---

## Stop Levels

| Level            | Action                                                                     | Timeframe       |
| ---------------- | -------------------------------------------------------------------------- | --------------- |
| 🔴 **Hard Stop** | Terminate pilot immediately. Isolate data. Notify customer.                | Within 4 hours  |
| 🟡 **Pause**     | Suspend pilot activities. Investigate. Resume only after root cause fixed. | Within 24 hours |
| 🟢 **Watch**     | Log the issue. Monitor. Escalate if not resolved within 7 days.            | Within 7 days   |

---

## 🔴 Hard Stop Conditions

| #   | Condition                                                                           | Trigger                                   |
| --- | ----------------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | **Data breach** — unauthorized access to customer data confirmed                    | Any confirmed incident                    |
| 2   | **Data loss** — customer data permanently lost or corrupted                         | Confirmed by audit log or customer report |
| 3   | **Cross-tenant leak** — customer A data visible to customer B                       | Any confirmed occurrence                  |
| 4   | **Unauthorized AI decision** — AI approved, exported, or acted without human review | Confirmed by audit event                  |
| 5   | **Legal/compliance violation** — pilot activity violates applicable law             | Confirmed by legal review                 |
| 6   | **Customer requests termination** — written or verbal                               | Immediately upon receipt                  |

## 🟡 Pause Conditions

| #   | Condition                                                                       | Trigger                           |
| --- | ------------------------------------------------------------------------------- | --------------------------------- |
| 1   | **System outage** — platform unavailable for >4 hours during business hours     | Monitoring alert                  |
| 2   | **Data integrity issue** — evidence/finding mismatch, data corruption detected  | QA or customer report             |
| 3   | **Performance degradation** — response time >10s for critical workflows         | Monitoring or user report         |
| 4   | **Export failure** — exports generate incorrect data or fail silently           | QA or customer report             |
| 5   | **Overclaim detected** — marketing or demo claim exceeds implemented capability | Claims audit or customer question |
| 6   | **Staffing gap** — assigned AQLIYA lead unavailable for >5 business days        | Operations                        |

## 🟢 Watch Conditions

| #   | Condition                                                                  | Trigger               |
| --- | -------------------------------------------------------------------------- | --------------------- |
| 1   | **Minor UI/UX bugs** — non-blocking cosmetic or workflow issues            | User report           |
| 2   | **Feature request volume** — >3 unscheduled feature requests from customer | Customer conversation |
| 3   | **Adoption dip** — <50% user activity for 7 consecutive days               | Activity metrics      |
| 4   | **Customer feedback trend** — declining satisfaction in weekly check-ins   | Feedback log          |

## Stop Condition Escalation Path

```
Team member identifies condition
        │
        ▼
Raise to AQLIYA Pilot Lead (same day)
        │
        ├── 🔴 Hard Stop → Immediate action
        │      ├── Isolate customer data
        │      ├── Notify customer within 4 hours
        │      ├── Internal incident report
        │      └── Legal review if applicable
        │
        ├── 🟡 Pause → Investigation
        │      ├── Root cause analysis (24h)
        │      ├── Fix plan
        │      ├── Customer notification
        │      └── Resume only after fix validated
        │
        └── 🟢 Watch → Monitor
               ├── Log in tracking system
               ├── Review in weekly sync
               └── Escalate if unresolved after 7 days
```

## Owner

- **Stop Authority:** AQLIYA Pilot Lead (any team member can raise)
- **Escalation:** AQLIYA Product Lead

## Status

- [ ] Draft
- [ ] Reviewed
- [ ] Approved
- [ ] Active
