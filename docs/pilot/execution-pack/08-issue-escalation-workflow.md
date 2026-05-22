# AQLIYA Pilot — Issue Escalation Workflow

**Document:** 08-issue-escalation-workflow.md  
**Purpose:** Define how issues are categorized, escalated, tracked, and resolved during the pilot.  
**Owner:** Pilot Lead  

---

## Severity Levels

| Level | Definition | Response Time | Examples |
|-------|------------|---------------|----------|
| **Critical** | Blocks pilot from continuing. Outputs are incorrect or unrecoverable. | < 4 hours | Wrong totals, missing accounts, system crash, data loss |
| **High** | Significantly impacts trust or usability. Workaround exists but is painful. | < 24 hours | Wrong mapping classification, broken traceability chain, incorrect statement format |
| **Medium** | Impacts quality or experience. Workaround is acceptable. | < 48 hours | Missing note content, unclear evidence links, display issues |
| **Low** | Cosmetic, minor, or nice-to-have. Does not block the pilot. | < 1 week | Typo in labels, spacing issues, color inconsistency |

---

## Issue Categories

| Category | Description | Typical Severity |
|----------|-------------|------------------|
| **Data quality** | Issues with the customer's Trial Balance data | Critical/High |
| **Mapping** | Incorrect account mapping or classification | High/Medium |
| **Statements** | Financial statement format, balance, or display issues | Critical/High |
| **Notes** | Note content, relevance, or completeness issues | Medium |
| **Evidence** | Evidence requirement logic or linking issues | Medium |
| **Traceability** | Broken traceability chains or missing audit trail | High |
| **UI/UX** | Interface usability, navigation, or display issues | Medium/Low |
| **Performance** | Slow loading, timeouts, or unresponsive UI | High/Medium |
| **Access/Security** | Login, permissions, or data visibility issues | Critical |
| **Customer confusion** | Customer misunderstands the workflow or purpose | Medium |
| **Unsupported expectation** | Customer expects a feature that doesn't exist | Medium |

---

## Escalation Path

```
Customer reports issue
    |
    ↓
Pilot Lead triages (severity + category)
    |
    ├── Low/Medium → Log in issue tracker → Assign to team → Resolve → Close
    │
    ├── High → Log in issue tracker → Assign to technical lead → 
    │           Notify AQLIYA lead → Resolve → Close → Inform customer
    │
    └── Critical → Log in issue tracker → Immediately notify technical lead + AQLIYA lead →
                    Stop pilot if needed → Emergency resolution → 
                    Customer communication → Resume pilot → Close
```

---

## Issue Tracking Template

```
Issue ID: PILOT-[YYYY]-[NNN]
Date Reported: 
Reported By: 
Severity: Critical / High / Medium / Low
Category: 
Description:
Impact:
Expected Behavior:
Actual Behavior:
Status: Open / In Progress / Resolved / Closed
Owner:
Response Deadline:
Resolved At:
Resolution Notes:
Customer Notified: Yes / No / N/A
```

---

## Issue Log

| ID | Date | Severity | Category | Description | Status | Owner |
|----|------|----------|----------|-------------|--------|-------|
| | | | | | | |
| | | | | | | |
| | | | | | | |

---

## Response Time Targets

| Severity | First Response | Status Update | Resolution Target |
|----------|---------------|---------------|-------------------|
| Critical | < 1 hour | Every 2 hours | < 4 hours |
| High | < 4 hours | Daily | < 24 hours |
| Medium | < 24 hours | Every 2 days | < 48 hours |
| Low | < 48 hours | Weekly | < 1 week |

---

## Resolution Criteria

An issue is considered resolved when:

- **Critical/High:** The root cause is identified and fixed. The impact is reversed or mitigated. The customer has been informed and agrees the issue is resolved.
- **Medium:** A workaround is in place, or the fix has been applied and verified.
- **Low:** The fix has been applied, or the issue has been documented for future sprints.

---

## Customer Communication Templates

### Critical Issue Notification

> **Subject:** [AQLIYA Pilot] Issue [ID] — [Brief Description]
>
> We've identified an issue that affects [impact description].
> We are investigating and will provide an update within [timeframe].
> Severity: Critical
>
> Current status: [Open / In Progress]
> Next update by: [time]

### Issue Resolved Notification

> **Subject:** [AQLIYA Pilot] Issue [ID] — Resolved
>
> The issue [ID] / [description] has been resolved.
>
> Resolution: [brief description of fix]
> Impact: [any remaining impact or confirmation that all is clear]
>
> Please confirm that the resolution addresses your concern.

---

## Escalation Contacts

| Role | Name | Contact | Backup Contact |
|------|------|---------|----------------|
| Pilot Lead | TBD | | |
| Technical Lead | TBD | | |
| AQLIYA Lead | TBD | | |
| Customer Sponsor | TBD | | |
