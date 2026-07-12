# ROI Optimizer

**Generated:** 2026-07-11T11:36:48.410Z

```
لو أصلحت Top 15

Platform Health
74
    ↓
90.5   (+16.5)

Effort ≈ 16.3 days
Confidence ≈ 72%
```

## Scenario table

| Fix Top N | Projected Health | Lift | Effort (days) |
| --------- | ---------------: | ---: | ------------: |
| 5 | **82.8** | +8.8 | 5 |
| 10 | **88.6** | +14.6 | 10 |
| 15 | **90.3** | +16.3 | 16.3 |
| 20 | **90.3** | +16.3 | 16.3 |

## Top 15 (recommended package)

| # | Finding | Impact | Risk | Effort | Conf | Est. Lift |
| - | ------- | ------ | ---- | ------ | ---- | --------: |
| 1 | Possible secret material (generic-secret) | 9 | 2 | 1d | 75% | +2.1 |
| 2 | Possible secret material (generic-secret) | 9 | 2 | 1d | 75% | +2.1 |
| 3 | Possible secret material (generic-secret) | 9 | 2 | 1d | 75% | +2.1 |
| 4 | API route may lack auth check | 9 | 2 | 1d | 75% | +2.1 |
| 5 | API route may lack auth check | 9 | 2 | 1d | 75% | +2.1 |
| 6 | API route may lack auth check | 9 | 2 | 1d | 75% | +2.1 |
| 7 | API route may lack auth check | 9 | 2 | 1d | 75% | +2.1 |
| 8 | API route may lack auth check | 9 | 2 | 1d | 75% | +2.1 |
| 9 | API route may lack auth check | 9 | 2 | 1d | 75% | +2.1 |
| 10 | API route may lack auth check | 9 | 2 | 1d | 75% | +2.1 |
| 11 | Client module references server-only concerns | 8 | 3 | 1.25d | 65% | +0.9 |
| 12 | Large module / God Object signal: localcontent-act | 8 | 3 | 1.25d | 65% | +0.9 |
| 13 | Large module / God Object signal: page.tsx | 8 | 3 | 1.25d | 65% | +0.9 |
| 14 | Large module / God Object signal: ai-advisor.ts | 8 | 3 | 1.25d | 65% | +0.9 |
| 15 | Long function WorkbookDetailClient (708 lines) | 8 | 3 | 1.25d | 65% | +0.9 |

## Model (honest)

Heuristic diminishing-returns model — **not a guarantee**. Re-measure with `eng:audit` after OpenCode closes items (Measured state in Delivery Governance).
