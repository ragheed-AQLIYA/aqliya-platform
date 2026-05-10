# Review Observations Methodology

## Purpose

This document defines how AuditOS generates, classifies, and manages review observations during the engagement review process.

## Observation Types

| Type | Description | Typical Source |
|------|-------------|----------------|
| Misclassification | Account mapped to wrong category | Mapping analysis |
| Missing Evidence | Insufficient audit evidence for balance | Evidence requirement analysis |
| Missing Disclosure | Required note disclosure not populated | Disclosure requirement analysis |
| Inconsistent Balance | Balance differs significantly from expectation | Period-over-period analysis |
| Potential Adjustment | Balance may require adjustment | Anomaly detection |
| Reviewer Question | Item requiring professional clarification | AI flag or reviewer identification |

## Observation Generation

### Automated Observations

The system generates observations automatically from:

```txt
1. Trial balance validation results
2. Account mapping confidence levels
3. Period-over-period comparison thresholds
4. Evidence requirement coverage gaps
5. Disclosure requirement gaps
6. Red flag triggers
```

### Manual Observations

Reviewers can create observations manually:

```txt
1. Reviewer identifies issue during review
2. Reviewer creates observation with:
   - Account reference
   - Observation type
   - Description
   - Supporting evidence reference
3. Observation enters findings lifecycle
```

## Observation Severity

| Severity | Definition | Response Required |
|----------|------------|-------------------|
| Observation | Minor note or question | Acknowledge or address |
| Issue | Moderate concern | Address before publication |
| Finding | Significant concern | Partner review, resolve before publication |
| Critical Finding | Material misstatement risk | Immediate partner escalation |

## Observation Lifecycle

```txt
Draft → Under Review → Resolved → Closed
                         → Escalated → Partner Review → Resolved → Closed
```

| State | Description | Actor |
|-------|-------------|-------|
| Draft | Observation created, not yet assigned | System or Reviewer |
| Under Review | Assigned to reviewer for assessment | Reviewer |
| Resolved | Addressed with documented action | Reviewer |
| Escalated | Sent to higher authority | Reviewer or Manager |
| Partner Review | Under partner assessment | Partner |
| Closed | Observation completed and documented | Reviewer or Partner |

## Observation Content

Each observation includes:

| Field | Description |
|-------|-------------|
| Observation ID | Unique identifier |
| Type | Classification, evidence, disclosure, consistency, adjustment, question |
| Severity | Observation, Issue, Finding, Critical Finding |
| Account | Reference to affected account(s) |
| Description | Clear statement of the observation |
| Supporting Data | Balances, ratios, trends supporting the observation |
| Evidence Reference | Links to supporting evidence |
| Recommendation | Suggested action to resolve |
| Status | Current lifecycle state |
| Created By | Attributable creator |
| Created Date | Timestamp |
