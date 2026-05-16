# Findings Classification

## Purpose

This document defines how AuditOS classifies and manages review findings throughout the engagement lifecycle.

## Finding Severity Levels

| Severity | Definition | Impact | Response Required |
|----------|------------|--------|-------------------|
| Critical | Material misstatement or material control deficiency | Affects audit opinion | Partner review, resolve before publication |
| High | Significant finding that may affect financial statements | May affect material balances | Manager review, resolve before publication |
| Medium | Moderate issue with limited financial impact | Does not affect material balances | Reviewer action recommended |
| Low | Minor observation or administrative note | No financial impact | Document for awareness |
| Informational | System-generated note or clarification | No action required | None |

## Finding Types

### Misclassification

```txt
Type:         Misclassification
Description:  Account mapped to wrong financial statement category
Example:      Rent expense classified as administrative instead of operating
Severity:     Medium to High (depends on materiality)
Action:       Reclassification entry required
```

### Missing Evidence

```txt
Type:         Missing Evidence
Description:  Required supporting evidence not provided
Example:      Bank confirmation not received for cash balance of SAR 2.5M
Severity:     Critical to High (depends on materiality)
Action:       Evidence request issued, follow-up required
```

### Missing Disclosure

```txt
Type:         Missing Disclosure
Description:  Required note disclosure not populated
Example:      Related party transaction disclosure not generated
Severity:     Medium to High (depends on materiality and regulatory requirement)
Action:       Disclosure drafted from available data, supplemented as needed
```

### Inconsistent Balance

```txt
Type:         Inconsistent Balance
Description:  Balance differs significantly from expectation
Example:      Revenue declined 40% without explanation
Severity:     Medium to High (depends on change magnitude)
Action:       Investigation required, management explanation obtained
```

### Potential Adjustment

```txt
Type:         Potential Adjustment
Description:  Balance may require adjustment
Example:      Fixed asset depreciation not recorded for the period
Severity:     High to Critical (depends on amount)
Action:       Adjustment proposed, management agreement required
```

### Reviewer Question

```txt
Type:         Reviewer Question
Description:  Item requiring clarification from management or team
Example:      Purpose of large period-end journal entry
Severity:     Low to Medium
Action:       Question sent to appropriate party, response awaited
```

## Finding Lifecycle States

```txt
Draft → Under Review → Resolved → Closed
                         → Escalated → Partner Review → Resolved → Closed
```

| State | Description | Who |
|-------|-------------|-----|
| Draft | Finding created, not yet assigned | System or Reviewer |
| Under Review | Assigned to reviewer for assessment | Reviewer |
| Resolved | Addressed with documented action | Reviewer |
| Escalated | Sent to higher authority | Reviewer or Manager |
| Partner Review | Under partner assessment | Partner |
| Closed | Finding completed and documented | Reviewer or Partner |

## Finding Content

Each finding includes:

| Field | Description |
|-------|-------------|
| Finding ID | Unique identifier (e.g., F-2026-0042) |
| Type | Classification, evidence, disclosure, consistency, adjustment, question |
| Severity | Critical, High, Medium, Low, Informational |
| Account | Reference to affected account(s) |
| Description | Clear statement of the finding |
| Supporting Data | Balances, ratios, trends supporting the finding |
| Evidence Reference | Links to supporting evidence |
| Recommendation | Suggested action to resolve |
| Status | Current lifecycle state |
| Created By | Attributable creator |
| Created Date | Timestamp |
| Resolved By | Attributable resolver |
| Resolution Date | Timestamp |

## Finding Workflow

```txt
1. Finding generated (system or manual)
2. Assigned to appropriate reviewer based on severity
3. Reviewer investigates: reviews evidence, account data, context
4. Reviewer determines action:
   a. Resolve — finding addressed, documented, closed
   b. Escalate — send to manager or partner
   c. Convert to recommendation — finding becomes adjustment proposal
5. All actions recorded with attributable rationale
6. Closed findings remain in audit trail for reference
```
