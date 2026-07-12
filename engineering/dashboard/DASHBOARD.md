# AQLIYA Engineering Intelligence Dashboard

**Generated:** 2026-07-11T02:08:23.186Z  
**Mode:** Learn from history · OpenCode implements

## Repository Health

```
▁▇███  74  ↗ +0
```

Change vs previous audit: **+0** =

## Scorecards

| Area | Score |
| ---- | ----- |
| Overall Repository Health | 74 |
| Security Score | 65 |
| Performance Score | 57 |
| Code Quality | 32 |
| Architecture Drift | 73 |
| Documentation | 95 |
| Tests | 95 |
| Technical Debt | 58 |
| Developer Experience | 73 |
| Engineering Maturity | 80 |

## Smart Quality Gates

| Gate | Status | Score | Prev | Δ | Reason |
| ---- | ------ | ----- | ---- | - | ------ |
| security | WARNING | 65 | 65 | +0 | score 65 vs pass≥80 warn≥60 · Δ +0 (+0% vs previous) |
| performance | WARNING | 57 | 57 | +0 | score 57 vs pass≥75 warn≥55 · Δ +0 (+0% vs previous) |
| complexity | FAIL | 32 | 32 | +0 | score 32 vs pass≥70 warn≥50 · Δ +0 (+0% vs previous) · still below threshold despite = |
| coverage | PASS | 95 | 95 | +0 | score 95 vs pass≥60 warn≥40 · Δ +0 (+0% vs previous) |
| documentation | PASS | 95 | 95 | +0 | score 95 vs pass≥75 warn≥55 · Δ +0 (+0% vs previous) |
| deadCode | FAIL | 32 | 32 | +0 | score 32 vs pass≥70 warn≥50 · Δ +0 (+0% vs previous) · still below threshold despite = |
| dependencyHealth | PASS | 93 | 93 | +0 | score 93 vs pass≥80 warn≥60 · Δ +0 (+0% vs previous) |
| architectureDrift | WARNING | 73 | 73 | +0 | score 73 vs pass≥75 warn≥55 · Δ +0 (+0% vs previous) |

## Top Risks

- **[high]** `e21451a4a460` Client module references server-only concerns _(×1, open)_
- **[high]** `16ccb0427639` Client module references server-only concerns _(×1, open)_
- **[high]** `009e27e9b8cc` Client module references server-only concerns _(×1, open)_
- **[high]** `888bc52ca7d5` Client module references server-only concerns _(×1, open)_
- **[high]** `74779b1746f4` Client module references server-only concerns _(×1, open)_
- **[high]** `9273676d5f88` Client module references server-only concerns _(×1, open)_
- **[high]** `9ee3952e3faf` Client module references server-only concerns _(×1, open)_
- **[high]** `b22035b67a93` Client module references server-only concerns _(×1, open)_


## Top Improvements (resolved)

_No resolved findings yet — will fill as OpenCode fixes land._

## Top Regressions

_No score regressions vs previous audit._

**Most improved / strongest product:** RiskOS (94)  
**Needs attention:** DecisionOS (27)

## Trend (data lake)

| When | Overall | Security | Perf | Code | Arch | Debt |
| ---- | ------- | -------- | ---- | ---- | ---- | ---- |
| 2026-07-11T01:52:46.631Z | 33 | 0 | 0 | 0 | 44 | 25 |
| 2026-07-11T01:53:51.330Z | 72 | 65 | 57 | 15 | 73 | 58 |
| 2026-07-11T01:55:01.114Z | 74 | 65 | 57 | 32 | 73 | 58 |
| 2026-07-11T02:08:06.850Z | 74 | 65 | 57 | 32 | 73 | 58 |
| 2026-07-11T02:08:06.851Z | 74 | 65 | 57 | 32 | 73 | 58 |

## Intelligence Artifacts

| View | Path |
| ---- | ---- |
| Memory | [intelligence/MEMORY.md](../intelligence/MEMORY.md) |
| Trends | [intelligence/TRENDS.md](../intelligence/TRENDS.md) |
| Regression | [intelligence/REGRESSION.md](../intelligence/REGRESSION.md) |
| Top 10 | [intelligence/TOP10.md](../intelligence/TOP10.md) |
| Costs | [intelligence/COSTS.md](../intelligence/COSTS.md) |
| Predictions | [intelligence/PREDICTIONS.md](../intelligence/PREDICTIONS.md) |
| Architecture Memory | [intelligence/architecture-memory/INDEX.md](../intelligence/architecture-memory/INDEX.md) |
| Product Scorecard | [PRODUCT_SCORECARD.md](./PRODUCT_SCORECARD.md) |
| Executive | [EXECUTIVE.md](./EXECUTIVE.md) |

## Operating Rules

1. Never redesign products from this dashboard.
2. Never auto-apply refactors.
3. Respect Architecture Memory — do not recommend reverting accepted ADRs.
4. Feed Top 10 to OpenCode for implementation.
