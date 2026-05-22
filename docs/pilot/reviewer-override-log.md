# Reviewer Override Log

## Purpose
Record every instance where a reviewer overrides an AI-generated suggestion during the pilot. This log enables analysis of reviewer trust, AI accuracy, and training needs.

---

## Log Template

| Override ID | Timestamp | Component | AI Suggestion | Reviewer Decision | Override Reason | Reviewer Confidence | Governance Consulted | Escalation Triggered |
|---|---|---|---|---|---|---|---|---|
| OVR-001 |           |           |               |                   |                 |                    |                      |                      |

---

## Column Definitions

| Column | Description | Values |
|---|---|---|
| Override ID | Unique identifier (OVR-nnn) | Auto-generated |
| Timestamp | When the override occurred | ISO 8601 |
| Component | Which part of the process was overridden | `mapping`, `evidence`, `finding`, `recommendation` |
| AI Suggestion | The output the AI produced before override | Free-text |
| Reviewer Decision | What the reviewer chose instead | Free-text |
| Override Reason | Why the reviewer overrode | Free-text |
| Reviewer Confidence | Self-reported confidence in the override | 1 (low) – 5 (high) |
| Governance Consulted | Was a governance rule checked before overriding? | Yes / No |
| Escalation Triggered | Did the override escalate to a second reviewer or lead? | Yes / No |

---

## Guidance for Reviewers

- Log every override immediately, even if it feels minor.
- Confidence level refers to your certainty in the *override*, not in the original AI suggestion.
- If governance was consulted, include the rule reference in the Override Reason.
- Escalation is required when confidence is ≤ 2.
