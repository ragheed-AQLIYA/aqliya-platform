# AQLIYA Pilot — Traceability QA Checklist

**Document:** 06-traceability-qa-checklist.md  
**Purpose:** QA checklist for validating end-to-end traceability across the AuditOS workflow.  
**Owner:** AQLIYA Reviewer  

---

## Instructions

Traceability is the foundation of AQLIYA's trust principle: **"AI assists. Humans decide. Evidence governs."** Every output must be traceable back to its source, and every decision must be attributable to a human actor.

Run this checklist **after** all outputs have been generated and reviewed.

---

## Section 1: Trial Balance to Mapped Account

| # | Traceability Path | Expected Evidence | Pass/Fail | Reviewer Comment |
|---|-------------------|-------------------|-----------|-----------------|
| 1.1 | TB Line → Mapped Account | Each TB line has a mapping status | | |
| 1.2 | Mapped Account → TB Line | Clicking a mapped account shows source TB data | | |
| 1.3 | TB total = Sum of mapped line totals | No lines lost or duplicated | | |
| 1.4 | Unmapped lines are flagged | Reviewer can see unmapped status | | |

**Traceability Chain Example:**
```
TB Line: 1010 - Cash at Bank (SAR 500,000)
    ↓
Mapped Account: 1010 - Cash and Cash Equivalents
    Status: Confirmed (by Ahmed M., 2026-05-12)
```

---

## Section 2: Mapped Account to Financial Statement

| # | Traceability Path | Expected Evidence | Pass/Fail | Reviewer Comment |
|---|-------------------|-------------------|-----------|-----------------|
| 2.1 | Mapped Account → Statement Line | Account appears in correct statement | | |
| 2.2 | Statement Line → Mapped Account | Clicking line shows contributing accounts | | |
| 2.3 | Statement line total = Sum of mapped account balances | No calculation errors | | |
| 2.4 | Account appears in correct statement section | Asset in SFP, Revenue in P&L, etc. | | |

**Traceability Chain Example:**
```
Mapped Account: 1010 - Cash and Cash Equivalents (SAR 500,000)
    ↓
SFP Line: Current Assets - Cash and Cash Equivalents (SAR 500,000)
    ↓
Statement: Statement of Financial Position as at 31 Dec 2025
```

---

## Section 3: Financial Statement to Note

| # | Traceability Path | Expected Evidence | Pass/Fail | Reviewer Comment |
|---|-------------------|-------------------|-----------|-----------------|
| 3.1 | Statement Line → Note | Line item has an associated note | | |
| 3.2 | Note → Statement Line | Note references the line item | | |
| 3.3 | Note content matches line item | Disclosure is relevant to the balance | | |
| 3.4 | Note status is visible | Draft / Reviewed / Missing info flagged | | |

**Traceability Chain Example:**
```
SFP Line: Cash and Cash Equivalents (SAR 500,000)
    ↓
Note 3: Cash and Cash Equivalents
    Content: "Cash at bank includes SAR 500,000 held in current accounts..."
    Status: AI Draft
```

---

## Section 4: Note to Evidence Requirement

| # | Traceability Path | Expected Evidence | Pass/Fail | Reviewer Comment |
|---|-------------------|-------------------|-----------|-----------------|
| 4.1 | Note → Evidence Requirement | Note has linked evidence requirements | | |
| 4.2 | Evidence Requirement → Note | Evidence shows which note it supports | | |
| 4.3 | Evidence requirement is specific | e.g., "Bank statement for Dec 2025" not just "evidence needed" | | |
| 4.4 | Evidence state is tracked | missing/requested/uploaded/linked/reviewed/accepted/rejected | | |

**Traceability Chain Example:**
```
Note 3: Cash and Cash Equivalents
    ↓
Evidence Requirement: Bank Statement - Dec 2025
    State: Requested
    ↓
Evidence Item: bank_statement_dec2025.pdf
    State: Uploaded (by Ahmed M., 2026-05-12)
```

---

## Section 5: Evidence to Finding

| # | Traceability Path | Expected Evidence | Pass/Fail | Reviewer Comment |
|---|-------------------|-------------------|-----------|-----------------|
| 5.1 | Evidence → Finding | Evidence is linked to relevant findings | | |
| 5.2 | Finding → Evidence | Finding shows supporting/contradicting evidence | | |
| 5.3 | Evidence link type is specified | supports / contradicts / context | | |
| 5.4 | All evidence is considered in findings | No orphan evidence with no related finding | | |

**Traceability Chain Example:**
```
Evidence Item: bank_statement_dec2025.pdf
    State: Reviewed (by Sarah K., 2026-05-12)
    ↓
Finding F-001: Cash balance variance - SAR 1,200
    Severity: Medium
    Status: Open
    Evidence: bank_statement_dec2025.pdf (supports)
```

---

## Section 6: Finding to Approval

| # | Traceability Path | Expected Evidence | Pass/Fail | Reviewer Comment |
|---|-------------------|-------------------|-----------|-----------------|
| 6.1 | Finding → Recommendation | Finding has linked recommendations | | |
| 6.2 | Recommendation → Approval Status | Recommendation shows its approval state | | |
| 6.3 | Approval → Reviewer Action | Approval record shows who approved/rejected | | |
| 6.4 | Approval includes rationale | Comments or conditions documented | | |

**Traceability Chain Example:**
```
Finding F-001: Cash balance variance - SAR 1,200
    ↓
Recommendation R-001: Adjust cash balance to match bank statement
    Status: Suggested
    ↓
Approval: Pending (awaiting reviewer decision)
```

---

## Section 7: AI Suggestion to Human Decision

| # | Traceability Path | Expected Evidence | Pass/Fail | Reviewer Comment |
|---|-------------------|-------------------|-----------|-----------------|
| 7.1 | AI Suggestion → Status | Suggestion shows accepted/rejected | | |
| 7.2 | AI Suggestion → Human Actor | Acceptance/rejection has actor name | | |
| 7.3 | AI Suggestion → Confidence | Confidence score is visible | | |
| 7.4 | AI Suggestion → Model Version | Model version is recorded | | |
| 7.5 | Rejected suggestion has reason | If applicable, rejection rationale visible | | |

**Traceability Chain Example:**
```
AI Suggestion: Map Account 1010 → "Cash and Cash Equivalents"
    Confidence: 0.92
    Status: Accepted (by Ahmed M., 2026-05-12)
    Model: AuditOS-mapping-v1
```

---

## Section 8: Source Visibility

| # | Check | Expected | Pass/Fail | Reviewer Comment |
|---|-------|----------|-----------|-----------------|
| 8.1 | Every output has a visible source | Source data is one click away | | |
| 8.2 | Every status change has an actor | No anonymous changes | | |
| 8.3 | Every status change has a timestamp | Date/time visible for all changes | | |
| 8.4 | Previous state is visible | Before/after comparison available | | |

---

## Section 9: Audit Trail Clarity

| # | Check | Expected | Pass/Fail | Reviewer Comment |
|---|-------|----------|-----------|-----------------|
| 9.1 | Audit trail is accessible per engagement | Dedicated audit trail page | | |
| 9.2 | Audit events are chronological | Sorted by timestamp | | |
| 9.3 | Audit events show actor | User name visible | | |
| 9.4 | Audit events show change details | What changed, from/to what | | |
| 9.5 | AI-related events are flagged | aiRelated = true marker | | |

---

## Section 10: Full Trace Walkthrough

Perform a complete trace from end to end:

```
Start: Finding / Statement Line / Note (choose one)
    → Trace back through all intermediate steps
    → End: Original TB Line
```

| # | Path Segment | Status | Notes |
|---|-------------|--------|-------|
| 10.1 | Starting point chosen | | |
| 10.2 | Step back 1 | | |
| 10.3 | Step back 2 | | |
| 10.4 | Step back 3 | | |
| 10.5 | Step back 4 | | |
| 10.6 | Step back 5 | | |
| 10.7 | Step back 6 | | |
| 10.8 | Reached original source | | |

**Full Chain Example:**
```
Finding F-001
    → Evidence bank_statement_dec2025.pdf
    → Evidence Requirement: Bank Statement - Dec 2025
    → Note 3: Cash and Cash Equivalents
    → SFP Line: Cash and Cash Equivalents
    → Mapped Account: 1010 - Cash and Cash Equivalents
    → TB Line: 1010 - Cash at Bank
```

---

## Section 11: Traceability Summary

| # | Item | Status |
|---|------|--------|
| 11.1 | Full traceability chain is visible | ☐ Yes ☐ No |
| 11.2 | All path segments are functional (clickable) | ☐ Yes ☐ No |
| 11.3 | AI decisions are tracked separately from human decisions | ☐ Yes ☐ No |
| 11.4 | No broken links in the chain | ☐ Yes ☐ No |
| 11.5 | Evidence governs — every output has a source | ☐ Yes ☐ No |

## Reviewer Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| AQLIYA Reviewer | | | |
| AQLIYA Technical Lead | | | |
