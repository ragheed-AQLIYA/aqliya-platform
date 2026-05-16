# Explainability Policy

## Purpose

This document defines the explainability policy for all AI-generated outputs in AuditOS. Every AI output must be explainable — the system must be able to describe why a particular output was produced.

## Explainability Requirements

| Requirement | Description |
|-------------|-------------|
| Every AI output must include an explanation | No black-box outputs |
| Explanations must be understandable to a professional reviewer | Technical ML details not required |
| Explanations must reference the specific input data used | Traceable to source |
| Explanations must describe the reasoning logic | Not just "the model said so" |
| Explanations must disclose limitations and confidence | Honest about uncertainty |

## Explanation Content

Each AI output includes:

```txt
Output:        Account mapping suggestion
Value:         Cash and Cash Equivalents
Confidence:    High (92%)

Explanation:
  The account "Bank / Cash on Hand" (Code 1100) was mapped to
  "Cash and Cash Equivalents" based on:

  1. Account Name Keywords: "Bank", "Cash", "Cash on Hand"
     → Matches Cash keywords in English and Arabic

  2. Account Code Range: 1100 falls in range 1000-1999
     → Asset category

  3. Balance Nature: Debit balance
     → Consistent with asset classification

  4. Historical Pattern: Same account mapped to same line item
     in prior period (confirmed by reviewer)

  5. No conflicting indicators: Classification is unambiguous
```

## Explanation by Output Type

### Account Mapping Explanation

```txt
Explanation for: Account Mapping
Inputs:           Account code, name, balance, historical mapping
Logic:            Keyword matching + code range + balance nature + historical
Output:           Suggested canonical line item and category
Confidence:       92%
Limitations:      Does not consider entity-specific business context
```

### Anomaly Detection Explanation

```txt
Explanation for: Anomaly Flag
Inputs:           Account balance, prior period balance, industry benchmark
Logic:            Period-over-period comparison + statistical deviation
Output:           Flag: "Revenue declined 40% without explanation"
Supporting Data:  Current: SAR 8M, Prior: SAR 13.3M, Change: -40%
Confidence:       88%
Limitations:      Does not know business reason for decline
```

### Finding Draft Explanation

```txt
Explanation for: Finding Draft
Inputs:           Signal data, evidence links, account context
Logic:            Evidence assessment + classification rules
Output:           Draft finding description
Supporting Data:  Evidence items linked, account balance, signal context
Confidence:       75%
Limitations:      Draft requires professional assessment of materiality
```

## Non-Explainable Outputs

If an AI model cannot produce an explanation for an output, that output must not be used in governed workflows:

```txt
Black-Box Output Detected:
  → Cannot explain mapping rationale
  → Automatically rejected
  → Review notified: "AI could not explain this suggestion"
  → Manual mapping required
```

## Reviewer Interaction with Explanations

| Action | How |
|--------|-----|
| View explanation | Displayed alongside every AI output |
| Accept with understanding | Reviewer confirms explanation is correct |
| Correct with override | Reviewer overrides with documented rationale |
| Request clarification | If explanation is unclear, reviewer requests |
| Flag poor explanation | Reviewer reports insufficient explanation |
