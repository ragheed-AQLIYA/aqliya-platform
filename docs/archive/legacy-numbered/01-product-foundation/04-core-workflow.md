# AuditOS Core Workflow

## Purpose

This document defines the end-to-end core workflow of AuditOS — from raw accounting data to published audit preparation outputs. Every feature, data model, and user interaction maps to one or more steps in this workflow.

## Workflow Diagram

```txt
Trial Balance
    → Account Mapping
    → Trial Balance Review
    → Financial Statement Draft
    → Notes Draft
    → Evidence Requirements
    → Review Findings
    → Reviewer Approval
    → Publication Package
```

## Step-by-Step

### 1. Trial Balance

**Input:** Client trial balance (CSV, XLSX) with account codes, names, debit/credit balances, opening balances, comparative period data.

**System Action:**
- Parse file structure and validate format
- Verify trial balance balance (total debits = total credits)
- Assess data trust: completeness, format consistency, reasonable ranges
- Assign trust state (trusted, conditionally trusted, blocked)

**Output:** Parsed and validated trial balance with trust state.

---

### 2. Account Mapping

**Input:** Parsed trial balance accounts.

**System Action:**
- Analyze account code pattern, name keywords, balance nature, and entity type
- Suggest mapping to canonical financial model line items
- Calculate confidence level for each suggestion
- Present suggestions for reviewer confirmation

**Output:** Complete account mapping with confidence levels.

---

### 3. Trial Balance Review

**Input:** Mapped trial balance.

**System Action:**
- Validate account relationships (assets = liabilities + equity)
- Identify classification anomalies
- Flag unusual balances, period-over-period changes
- Generate preliminary observations

**Output:** Reviewed trial balance with flagged items and observations.

---

### 4. Financial Statement Draft

**Input:** Reviewed and mapped trial balance.

**System Action:**
- Classify accounts by financial statement line item
- Generate Statement of Financial Position
- Generate Statement of Profit or Loss
- Generate Statement of Changes in Equity (where data sufficient)
- Generate Statement of Cash Flows (where data sufficient)
- Apply reclassification rules as needed

**Output:** Draft financial statements clearly marked as DRAFT — NOT FINAL.

---

### 5. Notes Draft

**Input:** Draft financial statements, trial balance data, account mappings.

**System Action:**
- Identify required disclosures based on account types and balances
- Generate draft notes with available data
- Flag notes that require additional information beyond trial balance
- Populate accounting policy templates where applicable

**Output:** Draft notes to financial statements with missing information flagged.

---

### 6. Evidence Requirements

**Input:** Draft financial statements and notes.

**System Action:**
- Identify supporting evidence needed for each account area
- Generate evidence request list by account
- Link evidence requirements to specific assertions (existence, completeness, valuation, rights, presentation)

**Output:** Structured evidence requirements mapped to accounts and assertions.

---

### 7. Review Findings

**Input:** Draft statements, notes, evidence requirements.

**System Action:**
- Compare account balances to expectations, prior periods, and industry norms
- Identify potential misclassifications, missing disclosures, and inconsistent balances
- Generate review observations with severity classification (critical, high, medium, low)
- Link each observation to specific accounts and evidence gaps

**Output:** Structured review findings with severity ratings and evidence links.

---

### 8. Reviewer Approval

**Input:** Review findings, draft outputs, evidence status.

**System Action:**
- Present reviewer queue prioritized by risk and severity
- Enable accept/modify/reject actions per finding
- Track reviewer decisions with attributable records
- Block publication until all critical and high findings are resolved

**Output:** Approved or conditionally approved engagement with attributable decisions.

---

### 9. Publication Package

**Input:** Approved outputs.

**System Action:**
- Generate final publication package: draft financial statements, draft notes, evidence summary, approval record
- Package is immutable — once published, outputs are versioned
- Provide client access link or export package

**Output:** Published engagement package with full traceability.

## Golden Rule

AI assists. Humans decide. Evidence governs. Every AI-generated output is a draft that requires human review and approval before it becomes part of the published engagement package.
