# AQLIYA Controlled Pilot — TB Arrival Protocol

**Document:** 05-tb-arrival-protocol.md  
**Purpose:** Exact process to follow when the customer's real Trial Balance file arrives.  

---

## Protocol Steps

### Step 1: Receive File

| Action | Detail | Owner |
|--------|--------|-------|
| Receive file from customer | Via agreed channel (email, secure upload, encrypted link) | Pilot Lead |
| Confirm receipt to customer | "We've received your file. We'll begin validation and get back to you." | Pilot Lead |
| Log receipt date | Record in pilot run folder | Technical Lead |

### Step 2: Secure Storage

| Action | Detail | Owner |
|--------|--------|-------|
| Save file to secure location | `./pilot-data/[customer-name]/tb-[date].xlsx` | Technical Lead |
| Verify file is unmodified | Check file hash if available | Technical Lead |
| Confirm no password protection | File must be accessible for processing | Technical Lead |

### Step 3: Confirm Customer/Entity Details

| Detail | Source |
|--------|--------|
| Company name | Customer communication |
| Reporting period | TB file header or customer confirmation |
| Currency | TB file or customer confirmation |
| Accounting standard | Customer confirmation |
| Contact person | Customer communication |
| Reviewer name | Customer communication |

### Step 4: Run TB Intake Checklist

| Action | Reference | Owner |
|--------|-----------|-------|
| Open `01-trial-balance-intake-checklist.md` | `docs/pilot/execution-pack/01-trial-balance-intake-checklist.md` | Technical Lead |
| Validate file format | Section 1 of checklist | Technical Lead |
| Validate required columns | Section 2 of checklist | Technical Lead |
| Validate data quality | Section 4 of checklist | Technical Lead |
| Validate reporting period | Section 5 of checklist | Technical Lead |
| Record all results | Document in run folder intake document | Technical Lead |

### Step 5: Record Intake Decision

| Decision | Meaning | Next Step |
|----------|---------|-----------|
| **Accepted** | All critical checks pass | Proceed to Step 6 |
| **Accepted with issues** | Critical checks pass, medium/low issues found | Proceed to Step 6, document issues |
| **Rejected** | Critical check fails | Go to Step 9 |

### Step 6: Create Pilot Run Folder

| Action | Detail | Owner |
|--------|--------|-------|
| Create dated run folder | `docs/pilot/runs/[date]-[customer-name]/` | Technical Lead |
| Copy templates from last run | Use `2026-05-12-first-controlled-pilot/` as template | Technical Lead |
| Begin filling documents as data becomes available | | Technical Lead |

### Step 7: Process in AuditOS (if Accepted)

| Action | Detail | Owner |
|--------|--------|-------|
| Upload TB to AuditOS engagement | AuditOS workspace → Trial Balance upload | Technical Lead |
| Run account mapping | AI suggestions + reviewer confirmation | Technical Lead + Reviewer |
| Generate financial statements | System generated after mapping confirmed | System |
| Generate notes | AI-drafted, reviewer to review | System + Reviewer |
| Generate evidence requirements | System generated | System |
| Proceed to QA checklists | Use execution pack documents 04–06 | Reviewer |

### Step 8: Notify Customer If Clarifications Required

| Situation | Action | Owner |
|-----------|--------|-------|
| File rejected | Notify customer with specific rejection reasons | Pilot Lead |
| File accepted with issues | Notify customer of minor issues found | Pilot Lead |
| Clarification needed (e.g., missing period) | Contact customer for clarification | Pilot Lead |

### Step 9: Log Rejected File

| Action | Detail | Owner |
|--------|--------|-------|
| Log rejection reason | `09-issue-log.md` in run folder | Technical Lead |
| Notify customer with clear explanation | What was wrong, what needs to be fixed | Pilot Lead |
| Set expectation for corrected file | Timeline for resubmission | Pilot Lead |
| When corrected file arrives | Restart from Step 1 | Technical Lead |

## Intake Outcomes Summary

```
Accepted         → Upload to AuditOS → Process → QA → Demo → Feedback → Review
Accepted with issues → Upload → Process → QA (note issues) → Demo → Feedback → Review
Rejected         → Notify customer → Request corrections → Await corrected file
```

## Signoff

| Role | Name | Date |
|------|------|------|
| Technical Lead | | |
| Pilot Lead | | |
