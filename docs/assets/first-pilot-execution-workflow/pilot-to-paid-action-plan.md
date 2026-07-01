# Pilot-to-Paid Action Plan — AQLIYA

## Purpose

Translate pilot outcomes into a concrete commercial recommendation. Produces a clear decision: convert to paid, extend pilot, or stop.

## When to Use

- At pilot closeout
- When all success criteria have been evaluated

## Inputs

- Pilot closeout memo (`pilot-control-pack/pilot-closeout-and-conversion-memo.md`)
- Pilot command center history (`pilot-command-center.md`)
- Pilot issue & risk register (`pilot-issue-risk-register.md`)
- Success criteria evaluation (`pilot-control-pack/pilot-success-criteria.md`)

---

## Action Plan

### 1. Success Summary

| Criteria Area         | Score (0-5) | Verdict                 | Notes |
| --------------------- | ----------- | ----------------------- | ----- |
| Operational           | /5          | ☐ Pass ☐ Partial ☐ Fail |       |
| Quality               | /5          | ☐ Pass ☐ Partial ☐ Fail |       |
| Governance            | /5          | ☐ Pass ☐ Partial ☐ Fail |       |
| Customer Satisfaction | /5          | ☐ Pass ☐ Partial ☐ Fail |       |
| Business              | /5          | ☐ Pass ☐ Partial ☐ Fail |       |

### 2. Value Proof

_What concrete value did the customer gain? Provide evidence._

| Value                          | Evidence |
| ------------------------------ | -------- |
| Efficiency gain (hours saved)  |          |
| Accuracy improvement           |          |
| Governance / audit improvement |          |
| Evidence completeness          |          |
| Other                          |          |

### 3. Remaining Gaps for Paid Production

| Gap | Severity | Required Before Paid? | Timeline |
| --- | -------- | --------------------- | -------- |
|     | 🔴 🟡 🟢 | ☐ Yes ☐ No            |          |
|     | 🔴 🟡 🟢 | ☐ Yes ☐ No            |          |
|     | 🔴 🟡 🟢 | ☐ Yes ☐ No            |          |

### 4. Commercial Recommendation

| Scenario                      | Recommended Action                       |
| ----------------------------- | ---------------------------------------- |
| All criteria met              | **Convert to Paid** — prepare proposal   |
| Most criteria met (≥3/5 pass) | **Convert with scope adjustment**        |
| Significant gaps remain       | **Extend pilot** — new scope + timeline  |
| Governance/security gap       | **Stop** — do not convert                |
| Customer declines             | **Close** — data deletion within 30 days |

#### Selected Recommendation

☐ **Convert to Paid**
☐ **Extend Pilot**
☐ **Stop — Do Not Convert**

### 5. Proposed Next Offer (if converting)

| Item                                 | Detail                              |
| ------------------------------------ | ----------------------------------- |
| Product(s)                           |                                     |
| License Model                        | ☐ Monthly ☐ Annual ☐ Per-engagement |
| Duration                             |                                     |
| Data Migration                       | ☐ Included ☐ Separate               |
| Support Level                        | ☐ Standard ☐ Premium                |
| Training                             | ☐ Included ☐ Additional             |
| Go-Live Date                         |                                     |
| Price (internal only until proposal) |                                     |

### 6. Production Blockers Status

_Required for paid production — evaluated from pilot learnings._

| Blocker                     | Pilot Learnings | Priority After Pilot |
| --------------------------- | --------------- | -------------------- |
| Redis/Upstash rate limiting |                 |                      |
| JWT maxAge/rotation         |                 |                      |
| Callback URL validation     |                 |                      |
| Monitoring & alerting       |                 |                      |
| Backup automation           |                 |                      |
| SSO/OAuth                   |                 |                      |
| Penetration test            |                 |                      |
| Stricter CSP                |                 |                      |

### 7. Decision

| Decision | Approver | Date |
| -------- | -------- | ---- |
|          |          |      |

### Decision Options

```
convert → Prepare paid service agreement → Go-live plan → Production hardening roadmap
extend  → New scope template → Updated milestone → Continue pilot operations
stop    → Data deletion → Closeout memo → Lessons learned → Archive
```

## Owner

- **Prepared by:** AQLIYA Pilot Lead
- **Approved by:** AQLIYA Product Lead + Customer Lead

## Related Files in Pilot Control Pack

- `pilot-control-pack/pilot-closeout-and-conversion-memo.md`
- `pilot-control-pack/pilot-success-criteria.md`

## Related Files in Execution Workflow

- `pilot-command-center.md`
- `pilot-issue-risk-register.md`
- `pilot-session-notes-template.md`

## Status

- [ ] Draft
- [ ] Customer Review
- [ ] Signed
- [ ] Executed
