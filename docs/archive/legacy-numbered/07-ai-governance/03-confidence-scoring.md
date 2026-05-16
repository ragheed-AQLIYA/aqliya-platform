# Confidence Scoring

## Purpose

This document defines how AuditOS measures and communicates confidence in AI-generated outputs. Confidence scoring ensures that reviewers understand the reliability of each AI suggestion.

## Confidence Dimensions

| Dimension | What It Measures | Scale |
|-----------|-----------------|-------|
| Data Quality | Completeness, consistency, and trust of source data | 1-5 |
| Pattern Match | Strength of the signal pattern (e.g., account name match) | 1-5 |
| Historical Accuracy | How often similar suggestions were confirmed by reviewers | 1-5 |
| Model Certainty | The AI model's internal confidence for the specific output | 1-5 |

## Overall Confidence Calculation

```txt
Overall Confidence = (Data Quality × 0.3) + (Pattern Match × 0.3)
                   + (Historical Accuracy × 0.2) + (Model Certainty × 0.2)
```

## Confidence Levels by Output Type

### Account Mapping

| Level | Range | Meaning | Action |
|-------|-------|---------|--------|
| High | 85-100% | Strong match — name, code, and balance align | Reviewer confirmation recommended |
| Medium | 60-84% | Partial match — some signals align | Reviewer confirmation required |
| Low | Below 60% | Weak match — ambiguous or conflicting signals | Manual review and correction likely |
| None | 0% | No reasonable match found | Manual mapping required |

### Anomaly Detection

| Level | Range | Meaning |
|-------|-------|---------|
| High | 85-100% | Strong anomaly — multiple indicators, significant deviation |
| Medium | 60-84% | Moderate anomaly — worth investigating |
| Low | Below 60% | Minor anomaly — may be within normal range |

### Finding Drafting

| Level | Range | Meaning |
|-------|-------|---------|
| High | 85-100% | Finding strongly supported by evidence and patterns |
| Medium | 60-84% | Finding plausible but requires reviewer assessment |
| Low | Below 60% | Finding speculative — likely requires reviewer revision |

## Confidence Display

Confidence is displayed contextually:

```txt
Account Mapping:
  Client Account:  1100 — Bank / Cash on Hand
  Mapped To:       Cash and Cash Equivalents
  Confidence:      High (92%)
  Basis:           Account name match (cash/bank keywords)
                   Account code range (1100 = cash)
                   Balance nature (debit)
                   Historical accuracy (confirmed in prior period)
```

## Low Confidence Handling

| Action | When |
|--------|------|
| Flag for reviewer attention | Confidence below threshold |
| Request manual confirmation | Confidence below minimum |
| Provide alternative suggestions | Multiple possible matches |
| Escalate to senior reviewer | Repeated low confidence in same area |

## Confidence Thresholds

| Application | Minimum Confidence Threshold |
|-------------|------------------------------|
| Account mapping auto-accept | None — all require reviewer confirmation |
| Anomaly flagging | No minimum — all anomalies surfaced |
| Finding draft generation | 60% minimum — below threshold, suggest manually |
| Recommendation draft | 70% minimum — below threshold, flag only |
