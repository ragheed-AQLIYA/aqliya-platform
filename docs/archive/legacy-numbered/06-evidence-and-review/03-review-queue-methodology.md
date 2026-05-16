# Review Queue Methodology

## Purpose

This document defines how AuditOS structures and prioritizes the reviewer queue. The queue ensures that reviewers address items in order of risk, materiality, and workflow dependency.

## Queue Structure

The reviewer queue is organized into tiers and prioritized within each tier:

```txt
Tier 1 — Critical Items (Red)
  Partner review required
  Blocks publication

Tier 2 — High Priority Items (Orange)
  Manager review typically required
  Should be resolved before publication

Tier 3 — Standard Items (Yellow)
  Reviewer action recommended
  Monitor before publication

Tier 4 — Informational Items (Blue)
  No action required
  Documented for awareness
```

## Queue Prioritization

### Scoring Formula

```txt
Priority Score = (Risk Score × 0.5) + (Materiality Score × 0.3) + (Urgency Score × 0.2)

Where:
  Risk Score = 1-5 (from risk framework)
  Materiality Score = 1-5 (based on account balance vs. materiality threshold)
  Urgency Score = 1-5 (based on deadline proximity and dependency chain)
```

### Priority Tiers

| Score | Tier | Color |
|-------|------|-------|
| 4.0-5.0 | Critical | Red |
| 3.0-3.9 | High | Orange |
| 2.0-2.9 | Standard | Yellow |
| 1.0-1.9 | Low | Blue |

## Queue Views

### Reviewer View

```txt
My Queue (12 items)
├── Critical (3)
│   ├── F-2026-0042 — Cash balance unconfirmed (SAR 2.5M)
│   ├── F-2026-0043 — Revenue classification anomaly
│   └── E-2026-0017 — Bank confirmation not provided
├── High (5)
│   ├── F-2026-0044 — PPE depreciation not recorded
│   ├── F-2026-0045 — Related party disclosure incomplete
│   ├── E-2026-0018 — Inventory count sheet not uploaded
│   ├── F-2026-0046 — Loan covenant compliance uncertain
│   └── M-2026-0003 — Account mapping low confidence (3 items)
└── Standard (4)
    ├── ...
```

### Manager View

```txt
Engagement Overview
├── All Items (42)
│   ├── Critical (3) — Partner attention required
│   ├── High (8) — Manager review
│   ├── Standard (22) — Reviewer assigned
│   └── Low (9) — On track
├── Items Awaiting My Approval (7)
└── Recently Completed (15)
```

### Partner View

```txt
Engagement Dashboard
├── Items Requiring Partner Action (2)
├── Critical Items (3) — At risk
├── High Items (8) — Monitoring
├── Review Progress: 65% complete
└── Publication Blockers (1)
    └── Cash balance unconfirmed — evidence not provided
```

## Queue Rules

| Rule | Description |
|------|-------------|
| New items enter at tier based on priority score | Automatic |
| Items escalate when unresolved past deadline | Automatic |
| Items de-escalate when addressed or mitigated | Manual (reviewer) |
| Rejected items return to sender's queue | Automatic |
| Approved items move to next workflow step | Automatic |
| Blocked items marked with clear blocker reason | Automatic |

## Queue Management Workflow

```txt
1. New items enter the queue from system generation or reviewer creation
2. Items are scored and assigned to priority tier
3. Reviewers claim or are assigned items from their queue
4. Reviewer takes action (investigate, dismiss, escalate)
5. Action updates item status and queue position
6. Escalated items move to higher reviewer queue
7. Completed items move to next workflow stage or close
```
