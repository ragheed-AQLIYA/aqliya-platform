# Governance Visibility Rules

## Philosophy

Governance indicators should help reviewers act better, not overwhelm them with decorative metadata.

## Core Rule

```txt
No governance indicator without reviewer value.
```

## When to Show Governance

| Condition | Show? | Example |
|---|---|---|
| Real evidence insufficiency | ✅ YES | Evidence state = missing, conflicting, weak |
| Real evidence conflict | ✅ YES | Multiple evidence sources disagree |
| High materiality | ✅ YES | Finding severity = critical or high |
| Unsupported treatment | ✅ YES | Accounting treatment not supported by doctrine |
| Reviewer action required | ✅ YES | Unresolved critical finding |
| Static/no-op status | ❌ NO | Evidence state = sufficient (no action needed) |
| Generic draft without actionable issue | ❌ Minimal only | DraftOnlyBanner is sufficient |
| Decorative provenance | ❌ NO | Showing metadata without context |
| Escalation without consequence | ❌ NO | "Notice" level on standard workflows |

## Functions

### shouldShowEvidenceBadge(ctx)

Returns true ONLY when evidence state is actionable:
- `missing` — evidence not provided
- `conflicting` — evidence contradicts other sources
- `weak` — evidence is insufficient

Returns false for:
- `complete` — evidence is adequate
- `partial` — evidence is in progress (no immediate action)
- `unverifiable` — system limitation, not reviewer action

### shouldShowEscalationBadge(ctx)

Returns true ONLY when escalation requires reviewer attention:
- `review_required` — reviewer must act
- `senior_review_required` — senior reviewer needed
- `blocked` — workflow halted

Returns false for:
- `none` — no escalation
- `notice` — informational only, no action required

## Current Status

| Page | Governance Integration | Verdict |
|---|---|---|
| Statements | DraftOnlyBanner + inline human review callout + collapsible governance panel | ✅ Calibrated |
| Evidence | Existing state badges already cover governance needs | ✅ No additional badges needed |
| Findings | Existing severity/status badges already cover governance needs | ✅ No additional badges needed |
