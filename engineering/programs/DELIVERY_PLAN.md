# Delivery Planner — Proposed Waves

**Generated:** 2026-07-11T11:36:48.407Z  
**Pool size:** 220 · **Waves:** 3

> EngineeringOS proposes order. Program Governance accepts. OpenCode implements.

## Wave-9

```
Wave-9
LocalContentOS
8 Findings
ROI 2.2
Risk Medium
Effort 10 days
Program B
```

**Why:** Focus LocalContentOS (completion gap 48%). Pack score prioritizes ROI × need / effort. Program B.

| # | Finding | Severity | ROI | Effort |
| - | ------- | -------- | --- | ------ |
| 1 | Possible secret material (generic-secret) | high | 3.4 | 1.25d |
| 2 | Client module references server-only concerns | high | 2 | 1.25d |
| 3 | Large module / God Object signal: localcontent-actions. | high | 2 | 1.25d |
| 4 | Large module / God Object signal: page.tsx | high | 2 | 1.25d |
| 5 | Large module / God Object signal: ai-advisor.ts | high | 2 | 1.25d |
| 6 | Long function WorkbookDetailClient (708 lines) | high | 2 | 1.25d |
| 7 | Long function ReviewCenter (561 lines) | high | 2 | 1.25d |
| 8 | Long function QualityDashboardClient (519 lines) | high | 2 | 1.25d |

## Wave-10

```
Wave-10
SalesOS
8 Findings
ROI 2.2
Risk Medium
Effort 10 days
Program B
```

**Why:** Focus SalesOS (completion gap 46%). Pack score prioritizes ROI × need / effort. Program B.

| # | Finding | Severity | ROI | Effort |
| - | ------- | -------- | --- | ------ |
| 1 | Possible secret material (generic-secret) | high | 3.4 | 1.25d |
| 2 | Client module references server-only concerns | high | 2 | 1.25d |
| 3 | Client module references server-only concerns | high | 2 | 1.25d |
| 4 | Large module / God Object signal: seed-data.ts | high | 2 | 1.25d |
| 5 | Large module / God Object signal: store.ts | high | 2 | 1.25d |
| 6 | Large module / God Object signal: page.tsx | high | 2 | 1.25d |
| 7 | Long function buildSalesSeedData (1651 lines) | high | 2 | 1.25d |
| 8 | Long function buildKnowledgeGraphFromSnapshot (430 line | high | 2 | 1.25d |

## Wave-11

```
Wave-11
WorkflowOS
8 Findings
ROI 2.4
Risk Medium
Effort 10 days
Program B
```

**Why:** Focus WorkflowOS (completion gap 44%). Pack score prioritizes ROI × need / effort. Program B.

| # | Finding | Severity | ROI | Effort |
| - | ------- | -------- | --- | ------ |
| 1 | API route may lack auth check | high | 3.4 | 1.25d |
| 2 | API route may lack auth check | high | 3.4 | 1.25d |
| 3 | Long function WorkflowAdminDashboard (293 lines) | high | 2 | 1.25d |
| 4 | Elevated complexity in workflowos-actions.ts | high | 2 | 1.25d |
| 5 | Low maintainability index (0) | high | 2 | 1.25d |
| 6 | Download/export route may lack tenant scope | high | 2 | 1.25d |
| 7 | Download/export route may lack tenant scope | high | 2 | 1.25d |
| 8 | Debt hotspot (priority 106): workflowos-actions.ts | high | 2 | 1.25d |

## Next

1. Governance accepts / edits wave.
2. `eng:programs -- --delivery assign --id <fp> --wave Wave-N`
3. OpenCode implements → Engineering verifies → Measured.
