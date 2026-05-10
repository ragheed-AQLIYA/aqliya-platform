# Materiality Concept in AuditOS

## Purpose

This document defines how AuditOS applies the concept of materiality to financial statement preparation and review. Materiality determines which items are significant enough to affect user decisions and therefore require specific attention in the review process.

## Definition

**Materiality:** An item is material if its omission, misstatement, or non-disclosure could reasonably influence the economic decisions of users taken on the basis of the financial statements.

Materiality is a threshold, not a fixed formula. AuditOS uses quantitative and qualitative factors to assess materiality.

## Quantitative Materiality

### Calculation Methods

| Method | Formula | When Used |
|--------|---------|-----------|
| Revenue-based | Percentage of total revenue | Common benchmark for most entities |
| Asset-based | Percentage of total assets | Used for asset-heavy entities |
| Profit-based | Percentage of profit before tax | Used for profitable entities |
| Custom | User-defined | Entity-specific benchmarks |

### Typical Thresholds

| Benchmark | Typical Range |
|-----------|---------------|
| Revenue | 0.5% — 1% |
| Total Assets | 1% — 2% |
| Profit Before Tax | 5% — 10% |
| Equity | 2% — 5% |

### Performance Materiality

Performance materiality is a lower threshold (typically 50-75% of overall materiality) used to reduce the risk that the aggregate of individually immaterial misstatements exceeds materiality.

```txt
Overall Materiality:     SAR 500,000
Performance Materiality: SAR 325,000 (65%)
Clearly Trivial:         SAR 25,000 (5%)
```

## Qualitative Materiality

Items may be material even if below the quantitative threshold if they:

| Qualitative Factor | Example |
|--------------------|---------|
| Regulatory requirement | Related party disclosure regardless of amount |
| Industry convention | Revenue recognition policy disclosure |
| User focus | Earnings per share impact |
| Trend reversal | Loss after years of profit |
| Compliance | Loan covenant threshold |
| Segment importance | Management's focus on specific metric |

## Materiality in AuditOS Workflows

### Account-Level Materiality

Each account is compared to the materiality threshold:

| Classification | Criteria |
|----------------|----------|
| Material | Balance > Performance Materiality |
| Individually Significant | Balance > Overall Materiality |
| Not Material | Balance < Clearly Trivial |

### Finding Materiality

Findings are classified by materiality impact:

| Severity | Materiality Impact |
|----------|-------------------|
| Critical | Affects overall materiality or is qualitatively material |
| High | Exceeds performance materiality |
| Medium | Exceeds clearly trivial but below performance materiality |
| Low | Below clearly trivial threshold |

### Disclosure Materiality

Disclosure items are assessed for materiality:

```txt
Note Required:   Related Party Transactions
Material If:     Balance > Performance Materiality
                  OR regulatory requirement
                  OR management focus area
                  OR involves key management personnel
```

## Materiality Configuration

Materiality is configured per engagement:

- Default thresholds based on entity size and industry
- Configurable by Partner or Manager
- Changes to materiality are governance events
- Materiality basis is documented in the audit trail
