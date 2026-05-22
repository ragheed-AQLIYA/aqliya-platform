# AQLIYA Controlled Pilot — First Pilot Operating Protocol

**Document:** 07-first-pilot-operating-protocol.md  
**Purpose:** Define roles, cadence, escalation, and status reporting during the first controlled pilot.  

---

## Section 1: Operating Roles

| Role | Person | Responsibilities |
|------|--------|-----------------|
| **Pilot Lead** | TBD | Customer communication, demo execution, pilot timeline, feedback collection, final memo |
| **Technical Lead** | TBD | TB intake, data processing, system stability, issue resolution, backup |
| **Founder** | TBD | Company positioning, trust narrative, executive relationship, escalation owner |
| **Reviewer** | TBD | QA checklists, mapping validation, financial output review, approval signoff |

## Section 2: Daily Cadence

During active pilot processing (after TB received, before demo):

| Time | Activity | Participants | Duration |
|------|----------|--------------|----------|
| 09:00 | Daily standup — status, blockers, next steps | Pilot Lead, Technical Lead | 15 min |
| 09:15 | Issue triage if needed | Technical Lead, Pilot Lead | 15 min |
| As needed | Customer communication | Pilot Lead | — |

## Section 3: Issue Review Cadence

| Severity | Review Cadence | Participants |
|----------|---------------|--------------|
| Critical | Immediate — notify all roles | All |
| High | Same day — review at standup | Pilot Lead, Technical Lead |
| Medium | Next standup | Pilot Lead, Technical Lead |
| Low | Weekly backlog review | Technical Lead |

## Section 4: Reviewer Responsibility

The reviewer is responsible for:

- Running the reviewer QA checklist (`04-reviewer-qa-checklist.md`)
- Running the financial output QA checklist (`05-financial-output-qa-checklist.md`)
- Running the traceability QA checklist (`06-traceability-qa-checklist.md`)
- Accepting or rejecting AI suggestions with documented rationale
- Providing review comments with actor attribution
- Flagging critical issues immediately to Pilot Lead
- Signing off on outputs before customer presentation
- Signing off on approval readiness

## Section 5: Founder Responsibility

The founder is responsible for:

- Delivering company positioning and trust narrative during customer sessions
- Managing customer expectations (pilot vs production, draft vs final)
- Handling difficult customer questions with honesty
- Avoiding forbidden claims (automated audit, replaces auditors, etc.)
- Owning escalation decisions at the executive level
- Participating in the post-pilot review and Go/No-Go decision

## Section 6: Customer Communication Owner

| Communication Type | Owner | Channel |
|-------------------|-------|---------|
| TB file request | Pilot Lead | Email |
| TB receipt confirmation | Pilot Lead | Email |
| Intake results (accepted/issues/rejected) | Pilot Lead | Email |
| Demo scheduling | Pilot Lead | Email / Calendar |
| Demo walkthrough | Pilot Lead + Founder | Video call |
| Issue notification (critical/high) | Technical Lead → Pilot Lead → Customer | Phone / Email |
| Status updates | Pilot Lead | Email (weekly) |
| Feedback collection | Pilot Lead | Form / Interview |
| Final pilot results | Founder | Meeting |

## Section 7: Issue Escalation Path

```
Customer reports issue
    ↓
Pilot Lead triages (severity + category)
    ↓
Low/Medium → Log → Assign → Resolve → Close
High → Log → Assign Technical Lead → Notify Founder → Resolve → Inform customer → Close
Critical → Log → Immediately notify all → Emergency resolution → Customer communication → Close
```

## Section 8: Status Reporting

| Report | Frequency | Audience | Format |
|--------|-----------|----------|--------|
| Internal standup | Daily (during active processing) | Pilot team | Verbal |
| Customer status | Weekly (or at key milestones) | Customer | Email |
| Issue report | As issues occur | Pilot team + Founder | Issue log |
| Final report | End of pilot | All stakeholders | Post-pilot memo |

## Section 9: Document Update Rules

- All pilot run documents are living documents during the pilot
- QA checklists are updated as each section is reviewed
- Issue log is updated in real-time as issues are identified
- No documents are modified after a gate decision without re-evaluation
- Final pilot memo is created after all gates have passed

## Section 10: Final Memo Process

1. Pilot Lead compiles post-pilot review memo
2. Technical Lead verifies technical accuracy
3. Founder reviews commercial assessment
4. All parties sign off
5. Memo is saved to pilot run folder
6. Decision (Go/Conditional/No-Go) is documented
7. Next steps are communicated to customer

## Signoff

| Role | Name | Date |
|------|------|------|
| Pilot Lead | | |
| Technical Lead | | |
| Founder | | |
