# Financial Statement Generation Rules

## Purpose

This document defines the overarching rules for financial statement generation in AuditOS. These rules apply across all statement types.

## Core Rules

### Rule 1: Map Before Generate

Financial statements are generated from mapped accounts only. Unmapped accounts are excluded. A completeness check is performed before generation.

### Rule 2: Draft Status

Every generated financial statement is clearly marked as DRAFT — NOT FINAL. The draft status is visible on every page and in every output format.

### Rule 3: Standard Compliance

Statements are generated in accordance with the engagement's configured accounting standard (IFRS, SOCPA, etc.). Presentation format, line items, and terminology match the standard.

### Rule 4: Comparative Data

When prior year data is available, comparative columns are generated. When not available, current period only.

### Rule 5: Consistency

Accounting policies, classification methods, and presentation formats are consistent across all statements within the same engagement.

### Rule 6: Materiality

Line items below the materiality threshold may be aggregated for presentation (but detailed data is retained in supporting schedules).

### Rule 7: Reclassification

All reclassification entries identified during mapping are applied before statement generation. Reclassifications are documented in the audit trail.

### Rule 8: Validation Before Output

Every statement passes validation checks (balancing, reasonableness) before output is generated.

## Statement Dependency Order

```txt
1. Trial Balance (foundation)
2. Account Mapping (classification)
3. Statement of Financial Position
4. Statement of Profit or Loss
5. Income Statement → Statement of Changes in Equity (profit movement)
6. Balance Sheet + Income Statement → Statement of Cash Flows (indirect method)
7. All Statements → Notes to Financial Statements
```

## Cross-Statement Validation

| Check | Formula | Action on Failure |
|-------|---------|-------------------|
| Net profit in SCE = Net profit in P&L | Must match | Flag discrepancy |
| Closing cash in Cash Flow = Cash in SFP | Must match | Flag discrepancy |
| Total equity in SCE = Total equity in SFP | Must match | Flag discrepancy |
| Total assets = Total liabilities + equity in SFP | Must balance | Flag and block |

## Standard Rounding

| Rule | Description |
|------|-------------|
| Presentation currency | As configured (SAR, USD, etc.) |
| Rounding level | Thousands or exact, per engagement preference |
| Decimal places | 0 or 2, per engagement preference |

## Draft Marking

Every page of every generated statement includes:

```txt
═══════════════════════════════════════════════════════
DRAFT — NOT FINAL
Prepared by AuditOS on 2026-05-08
Requires review and approval by qualified professional
═══════════════════════════════════════════════════════
```
