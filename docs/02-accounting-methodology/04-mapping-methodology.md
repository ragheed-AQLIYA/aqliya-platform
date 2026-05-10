# Account Mapping Methodology

## Purpose

This document defines how AuditOS maps client chart of accounts (COA) to the canonical financial model. Account mapping is the critical intelligence layer that transforms raw trial balance data into structured financial statements.

## Mapping Inputs

| Input | Source | Description |
|-------|--------|-------------|
| Account Code | Trial balance | Numeric or alphanumeric account identifier |
| Account Name | Trial balance | Descriptive account name (Arabic, English, or both) |
| Balance Nature | Trial balance | Debit or credit normal balance |
| Entity Type | Client setup | Company type (Sole proprietorship, LLC, Joint Stock, etc.) |
| Industry | Client setup | Industry classification |
| Accounting Standard | Client setup | IFRS, GAAS, SOCPA, etc. |
| Historical Mappings | System | Previously confirmed mappings for the same client |

## Mapping Logic

### Primary Signal: Account Name

The system analyzes account names using a combination of:

```txt
1. Keyword matching (standard Arabic/English account terms)
2. Pattern recognition (account code prefix/suffix conventions)
3. Semantic similarity (AI-assisted for ambiguous names)
4. Historical precedence (previously confirmed mappings)
```

### Secondary Signal: Account Code Pattern

Account code structures vary by client. The system learns code patterns:

```txt
Code Range       → Typical Category
1000-1999        → Assets
2000-2999        → Liabilities
3000-3999        → Equity
4000-4999        → Revenue
5000-5999        → Cost of Revenue
6000-7999        → Expenses
8000-8999        → Other Income/Expense
9000-9999        → Suspense / Clearing
```

### Tertiary Signal: Balance Nature

Debit/credit normal balance helps confirm classification:

| Category | Normal Balance |
|----------|----------------|
| Assets | Debit |
| Liabilities | Credit |
| Equity | Credit |
| Revenue | Credit |
| Expenses | Debit |

## Mapping Output

Each mapped account produces:

```txt
Client Account Code:    1100
Client Account Name:    بنك / نقد بالصندوق / Cash on Hand

Mapped FS Line Item:    Cash and Cash Equivalents
FS Category:            Current Asset
FS Statement:           Statement of Financial Position
Confidence Level:       High (95%)
Suggested By:           AI
Status:                 Pending Confirmation
```

## Confidence Levels

| Level | Range | Meaning |
|-------|-------|---------|
| High | 85-100% | Strong match based on name, code, and balance |
| Medium | 60-84% | Partial match — some signals align, some conflict |
| Low | Below 60% | Weak or ambiguous match — requires reviewer judgment |
| Unmapped | — | No reasonable match found — must be manually mapped |

## Review Requirements

| Confidence | Action Required |
|------------|----------------|
| High | Reviewer confirmation recommended |
| Medium | Reviewer confirmation required |
| Low | Reviewer confirmation required with manual correction likely |
| Unmapped | Manual mapping required |

## Common Mapping Examples

| Client Account | Mapped To | Category |
|----------------|-----------|----------|
| Bank / Cash on Hand / Current Account | Cash and Cash Equivalents | Current Asset |
| Accounts Receivable / Debtors | Trade Receivables | Current Asset |
| Inventory / Stock on Hand | Inventory | Current Asset |
| Land & Buildings / Fixed Assets | Property, Plant and Equipment | Non-Current Asset |
| Accounts Payable / Creditors | Trade Payables | Current Liability |
| Loans Payable / Bank Loans | Loans and Borrowings | Non-Current Liability |
| Share Capital / Capital | Share Capital | Equity |
| Sales / Revenue / Income | Revenue | Revenue |
| Cost of Sales / COGS | Cost of Revenue | Cost of Revenue |
| Salaries / Wages / Staff Costs | Employee Expenses | Operating Expense |
| Rent / Lease Expense | Operating Expenses | Operating Expense |

## Reclassification Rules

When an account is mapped to a line item that differs from its original classification, a reclassification is generated:

```txt
Original:    Rent Expense classified under Administrative Expenses
Reclassify:  Rent Expense → Operating Expenses
Rationale:   Standard IFRS presentation
```

## Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Arabic account names | Bilingual keyword matching. Arabic terms mapped to standard IFRS line items. |
| Ambiguous names (e.g., "Sundry") | Low confidence. Requires manual mapping. |
| Combined accounts (e.g., "Cash & Bank") | Map to primary category, flag for reviewer. |
| Negative balances in wrong category | Flag as potential mapping error or non-standard presentation. |
| Empty account names | Use account code alone. Low confidence. |
| Custom/non-standard account names | AI-assisted semantic matching. Low confidence if no match found. |
