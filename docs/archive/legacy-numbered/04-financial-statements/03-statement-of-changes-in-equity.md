# Statement of Changes in Equity

## Purpose

This document defines how AuditOS generates the draft Statement of Changes in Equity (SCE) from mapped trial balance data.

## Structure

### Standard Format

```txt
Statement of Changes in Equity
                                      Share        Retained      Total
                                      Capital      Earnings      Equity
Opening Balance                        X,XXX        X,XXX         X,XXX
Profit for the Year                                 X,XXX         X,XXX
Dividends Paid                                     (X,XXX)       (X,XXX)
Capital Introduced                     X,XXX                      X,XXX
Other Movements                                      X,XXX         X,XXX
Closing Balance                        X,XXX        X,XXX         X,XXX
```

## Generation Rules

### Opening Equity

| Component | Source |
|-----------|--------|
| Share Capital | Opening balance of share capital account |
| Reserves | Opening balance of reserve accounts |
| Retained Earnings | Opening balance of retained earnings |
| Total Opening | Sum of all equity opening balances |

### Current Year Movements

| Movement | Source |
|----------|--------|
| Profit for the Year | Current year profit from income statement |
| Dividends | If dividend account present in trial balance |
| Capital Introduction | If capital increase in current year |
| Reserves Transfer | If reserve movements present |
| Other Comprehensive Income | If OCI accounts present |

### Closing Equity

Calculated as:

```txt
Closing Equity = Opening Equity
                 + Profit for the Year
                 - Dividends
                 + Capital Introduced
                 ± Other Movements
```

## Data Requirements

| Data Point | Required for SCE? | Source |
|------------|-------------------|--------|
| Opening share capital | Yes | Opening balance |
| Opening retained earnings | Yes | Opening balance |
| Current year profit | Yes | Income statement |
| Dividends | If applicable | Trial balance or manual entry |
| Capital changes | If applicable | Trial balance |
| OCI items | If applicable | Trial balance |

## Notes

- The SCE is generated only if opening balance data is available
- Without opening balances, the system shows current year movements only
- Dividends must be separately identified (cannot be derived from retained earnings alone)
- Complex equity structures (multiple share classes, treasury shares) require reviewer attention
