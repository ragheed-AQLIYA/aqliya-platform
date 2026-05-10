# Accounting Standards Support

## Purpose

This document defines the accounting standards supported by AuditOS and how the system adapts its outputs to different reporting frameworks.

## Supported Standards

| Standard | Full Name | Jurisdiction |
|----------|-----------|--------------|
| IFRS | International Financial Reporting Standards | International |
| IFRS for SMEs | IFRS for Small and Medium-sized Entities | International |
| SOCPA | Saudi Organization for Chartered and Professional Accountants | Saudi Arabia |
| GAAS | Generally Accepted Auditing Standards | Various |
| Local GAAP | Country-specific GAAP | Per jurisdiction |

## Standard-Specific Adjustments

### IFRS

| Feature | IFRS Treatment |
|---------|----------------|
| Statement titles | Statement of Financial Position, Statement of Profit or Loss |
| Classification | Current/Non-current (can be liquidity-based for certain entities) |
| Revenue | IFRS 15 — Five-step revenue recognition model |
| Leases | IFRS 16 — Right-of-use asset and lease liability |
| Financial Instruments | IFRS 9 — Classification and measurement |
| Presentation | IAS 1 — Complete set of financial statements |

### SOCPA

| Feature | SOCPA Treatment |
|---------|----------------|
| Statement titles | Consistent with IFRS titles (SOCPA converged with IFRS) |
| Zakat calculation | Zakat base computation from adjusted net income or equity |
| Classification | Follows IFRS classification with zakat-specific adjustments |
| Notes | Zakat note required — separate from tax |
| SCPA requirements | Additional disclosures per Saudi regulatory requirements |

### IFRS for SMEs

| Feature | IFRS for SMEs Treatment |
|---------|-------------------------|
| Scope | Applicable to entities without public accountability |
| Reduced disclosures | Fewer notes required than full IFRS |
| Simplified measurements | Cost model more common, fewer fair value requirements |
| Statement titles | Same as full IFRS |

## Standard Configuration

Each engagement is configured with:

| Configuration | Options |
|---------------|---------|
| Accounting standard | IFRS, SOCPA, IFRS for SMEs, Local GAAP |
| Reporting currency | SAR, USD, EUR, etc. |
| Functional currency | SAR, USD, etc. |
| Entity type | Corporation, LLC, Sole Proprietorship, Partnership, etc. |
| Industry | As selected during client setup |

## Standard-Specific Output Adaptations

### IFRS Output

```txt
Statement of Financial Position
  — Current Assets
  — Non-Current Assets
  — Current Liabilities
  — Non-Current Liabilities
  — Equity

Statement of Profit or Loss
  — Revenue
  — Cost of Revenue
  — Gross Profit
  — Operating Expenses
  — Finance Costs
  — Profit Before Tax
  — Income Tax Expense
  — Profit for the Year
```

### SOCPA Output

```txt
Statement of Financial Position
  — Same IFRS structure (SOCPA converged)

Statement of Profit or Loss
  — Same IFRS structure
  — Zakat expense line after tax

Notes:
  — Standard IFRS notes
  — Zakat note (Zakat base, provision, payment)
  — Regulatory compliance notes per SCPA
```

## Standard Migration

When an entity changes its accounting standard:

```txt
Old Standard:    Local GAAP
New Standard:    IFRS
Impact:          Reclassification adjustments, new disclosure requirements
System Action:   Generate IFRS 1 reconciliation notes, flag new disclosure needs
```

## Future Standards Support

The system is designed to accommodate new standards:

- New standards can be added through configuration (not code changes)
- Standard-specific templates, classification rules, and disclosure checklists are configurable
- Regulatory updates can be incorporated without system changes
