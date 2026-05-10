# Chart of Accounts Logic

## Purpose

This document defines how AuditOS understands and processes chart of accounts structures. The COA is the schema that organizes financial data — AuditOS must interpret diverse COA formats and map them to a consistent financial model.

## COA Structure Types

| Type | Description | Example |
|------|-------------|---------|
| Flat | Single-level codes, typically 4-6 digits | 1000, 2000, 3000 |
| Hierarchical | Multi-level codes with parent-child relationships | 1-1000 (parent asset → child cash) |
| Departmental | Codes filtered by department or cost center | 1000-01 (cash – Riyadh branch) |
| Alphanumeric | Codes containing both letters and numbers | A-1000, B-2000 |
| Arabic-named | Accounts named in Arabic without codes | Cash on Hand / نقد بالصندوق |

## COA Pattern Recognition

The system recognizes common COA patterns to inform mapping:

### Range-Based Patterns

| Code Range | Typical Category |
|------------|------------------|
| 1000-1999 | Assets |
| 1100-1199 | Cash and Cash Equivalents |
| 1200-1299 | Accounts Receivable |
| 1300-1399 | Inventory |
| 1400-1499 | Prepaid Expenses |
| 1500-1599 | Property, Plant and Equipment |
| 2000-2999 | Liabilities |
| 2100-2199 | Accounts Payable |
| 2200-2299 | Loans and Borrowings |
| 3000-3999 | Equity |
| 4000-4999 | Revenue |
| 5000-5999 | Cost of Revenue |
| 6000-7999 | Operating Expenses |
| 8000-8999 | Other Income/Expense |

### Digit-Based Patterns

| Pattern | Interpretation |
|---------|----------------|
| First digit = category | 1xxx = Assets, 2xxx = Liabilities, etc. |
| First two digits = class | 11xx = Current Assets, 12xx = Non-Current, etc. |
| Last digits = specific account | xxx1-xxx9 = specific accounts within a class |

### Keyword-Based Patterns (Arabic)

| Arabic Keyword | Likely Category |
|----------------|-----------------|
| نقد / بنك / صندوق | Cash and Cash Equivalents |
| مدينون / عملاء / قبض | Accounts Receivable |
| مخزون / بضاعة | Inventory |
| أصول ثابتة / عقارات / آلات | Property, Plant and Equipment |
| دائنون / موردون / دفع | Accounts Payable |
| قروض / تسهيلات | Loans and Borrowings |
| رأس المال / ملكية | Equity |
| مبيعات / إيرادات | Revenue |
| مصروفات / تكاليف | Expenses |

## Multi-Language Support

The system supports bilingual COA processing:

```txt
Account Code:  1200
Account Name:  حسابات قبض / Accounts Receivable

Recognition:   Arabic keyword "قبض" + English keyword "Receivable"
               → Trade Receivables
               → Current Asset
```

## Custom COA Learning

For clients with non-standard COA structures, the system learns from:

1. First-time mapping (operator manually maps accounts)
2. Historical mapping patterns (same client, prior period)
3. Industry-specific COA templates (pre-built mappings for common industries)
4. User corrections (rejected AI suggestions improve future accuracy)
