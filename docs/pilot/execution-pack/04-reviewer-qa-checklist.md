# AQLIYA Pilot — Reviewer QA Checklist

**Document:** 04-reviewer-qa-checklist.md  
**Purpose:** QA checklist for the reviewer evaluating AuditOS outputs.  
**Owner:** AQLIYA Reviewer  

---

## Instructions

Run this checklist **after** the TB has been uploaded and mapped, and **before** presenting outputs to the customer. Each item must be reviewed and signed off.

---

## Section 1: Engagement Setup

| # | Item | Expected Result | Pass/Fail | Severity | Reviewer Note |
|---|------|----------------|-----------|----------|---------------|
| 1.1 | Engagement exists in workspace | ✅ Engagement visible | | Critical | |
| 1.2 | Engagement details match customer | Name, period, currency correct | | Critical | |
| 1.3 | Customer information is accurate | Client name, industry, jurisdiction match | | Critical | |
| 1.4 | Engagement status is correct | Status reflects current workflow stage | | Medium | |

## Section 2: Trial Balance Upload

| # | Item | Expected Result | Pass/Fail | Severity | Reviewer Note |
|---|------|----------------|-----------|----------|---------------|
| 2.1 | TB file is uploaded | ✅ File appears in upload list | | Critical | |
| 2.2 | Total debits = total credits | ✅ Variance is 0 or within rounding tolerance | | Critical | |
| 2.3 | All accounts are loaded | ✅ Count matches original file | | Critical | |
| 2.4 | Account names are readable | ✅ No encoding issues | | Medium | |
| 2.5 | Currency is correct | ✅ Matches engagement currency | | Medium | |
| 2.6 | Reporting period is visible | ✅ Displayed correctly | | Medium | |

## Section 3: Account Mapping

| # | Item | Expected Result | Pass/Fail | Severity | Reviewer Note |
|---|------|----------------|-----------|----------|---------------|
| 3.1 | All accounts have a mapping status | ✅ No unmapped accounts | | Critical | |
| 3.2 | AI-suggested mappings are reasonable | ✅ ≥ 70% reasonable per reviewer judgment | | Critical | |
| 3.3 | High-confidence AI mappings are accurate | ✅ ≥ 90% for confidence > 0.8 | | Critical | |
| 3.4 | Low-confidence AI mappings flagged | ✅ Reviewer attention drawn to < 0.7 | | Medium | |
| 3.5 | Manual overrides are possible | ✅ Reviewer can change any mapping | | Critical | |
| 3.6 | Mapping status is visible per account | ✅ pending/confirmed/rejected shown | | Medium | |

## Section 4: Classification

| # | Item | Expected Result | Pass/Fail | Severity | Reviewer Note |
|---|------|----------------|-----------|----------|---------------|
| 4.1 | Asset accounts classified as Assets | ✅ Correct statement classification | | Critical | |
| 4.2 | Liability accounts classified as Liabilities | ✅ Correct statement classification | | Critical | |
| 4.3 | Equity accounts classified as Equity | ✅ Correct statement classification | | Critical | |
| 4.4 | Revenue accounts classified as Revenue | ✅ Correct statement classification | | Critical | |
| 4.5 | Expense accounts classified as Expenses | ✅ Correct statement classification | | Critical | |
| 4.6 | Classification matches account nature | ✅ No obvious misclassifications | | Critical | |

## Section 5: Financial Statements

| # | Item | Expected Result | Pass/Fail | Severity | Reviewer Note |
|---|------|----------------|-----------|----------|---------------|
| 5.1 | Statement of Financial Position generated | ✅ Appears in statements list | | Critical | |
| 5.2 | Statement of Profit or Loss generated | ✅ Appears in statements list | | Critical | |
| 5.3 | Statement of Changes in Equity generated | ✅ Appears if applicable | | Medium | |
| 5.4 | All statements show "Draft" status | ✅ Not marked as final | | Critical | |
| 5.5 | Statement totals balance | ✅ Assets = Liabilities + Equity (for SFP) | | Critical | |
| 5.6 | Subtotals are correct | ✅ Gross profit, operating income, net income | | Critical | |
| 5.7 | Line items match mapped accounts | ✅ No orphan line items | | Medium | |

## Section 6: Notes

| # | Item | Expected Result | Pass/Fail | Severity | Reviewer Note |
|---|------|----------------|-----------|----------|---------------|
| 6.1 | Notes are generated | ✅ Notes list is non-empty | | Critical | |
| 6.2 | AI-drafted notes are labeled | ✅ "AI Draft" badge visible | | Medium | |
| 6.3 | Note content is relevant | ✅ Matches account types present | | Critical | |
| 6.4 | Missing information is flagged | ✅ Unclear/unsupported items marked | | Medium | |
| 6.5 | Notes link to statement lines | ✅ Cross-references visible | | Medium | |

## Section 7: Evidence Requirements

| # | Item | Expected Result | Pass/Fail | Severity | Reviewer Note |
|---|------|----------------|-----------|----------|---------------|
| 7.1 | Evidence requirements generated | ✅ At least 1 requirement per material account | | Medium | |
| 7.2 | Evidence states are tracked | ✅ missing/requested/uploaded/linked/reviewed | | Medium | |
| 7.3 | Evidence is linked to accounts | ✅ Link visible in evidence view | | Medium | |

## Section 8: Findings

| # | Item | Expected Result | Pass/Fail | Severity | Reviewer Note |
|---|------|----------------|-----------|----------|---------------|
| 8.1 | Findings are generated for anomalies | ✅ Mapping/classification issues flagged | | Medium | |
| 8.2 | Finding severity is assigned | ✅ Low/Medium/High/Critical | | Medium | |
| 8.3 | Finding status is tracked | ✅ Open/In Review/Resolved/Dismissed | | Medium | |
| 8.4 | Findings link to related accounts | ✅ Cross-reference visible | | Medium | |

## Section 9: Review Status

| # | Item | Expected Result | Pass/Fail | Severity | Reviewer Note |
|---|------|----------------|-----------|----------|---------------|
| 9.1 | Review comments can be added | ✅ Comment input works | | Critical | |
| 9.2 | Comments show actor and timestamp | ✅ Attribution visible | | Medium | |
| 9.3 | Comments have status (open/resolved) | ✅ Resolvable | | Medium | |

## Section 10: Approval Readiness

| # | Item | Expected Result | Pass/Fail | Severity | Reviewer Note |
|---|------|----------------|-----------|----------|---------------|
| 10.1 | Approval workflow is accessible | ✅ Approval page renders | | Critical | |
| 10.2 | Approval status is visible | ✅ Ready / Pending / Approved / Blocked | | Critical | |
| 10.3 | Approval creates a record | ✅ Before/after snapshot captured | | Critical | |

## Section 11: Audit Disclaimer

| # | Item | Expected Result | Pass/Fail | Severity | Reviewer Note |
|---|------|----------------|-----------|----------|---------------|
| 11.1 | "Draft" status is visible on all outputs | ✅ Every page shows draft status | | Critical | |
| 11.2 | AI suggestions are labeled | ✅ "AI Suggested" / "AI Draft" visible | | Critical | |
| 11.3 | Human review disclaimer is present | ✅ "Requires human review" stated | | Critical | |

## Section 12: Overall Review

| # | Item | Status |
|---|------|--------|
| 12.1 | All critical items pass | ☐ Pass ☐ Fail |
| 12.2 | All high-severity items pass | ☐ Pass ☐ Fail |
| 12.3 | Medium/Low items documented | ☐ Yes ☐ No |
| 12.4 | Reviewer recommends presenting to customer | ☐ Yes ☐ Conditional ☐ No |

## Reviewer Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| AQLIYA Reviewer | | | |
| AQLIYA Technical Lead | | | |
