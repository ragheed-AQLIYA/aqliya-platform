# Engineering Agents

## Quality agents (scan source)

| Agent | Module | Outputs |
| ----- | ------ | ------- |
| Code Health | `code-health.mjs` | code-health, duplication, complexity |
| Security | `security.mjs` | security |
| Performance | `performance.mjs` | performance |
| Test Intelligence | `test-intelligence.mjs` | testing |
| Documentation | `documentation.mjs` | documentation |
| UX Quality | `ux-quality.mjs` | ui-quality |
| Dependency | `dependency.mjs` | dependencies |
| Technical Debt | `technical-debt.mjs` | technical-debt |
| Architecture Drift | `architecture-drift.mjs` | architecture-drift |

## Intelligence agents (learn from data lake)

| Agent | Module | Outputs |
| ----- | ------ | ------- |
| Engineering Intelligence | `engineering-intelligence.mjs` | MEMORY.md |
| Trend Analysis | `trend-analysis.mjs` | TRENDS.md |
| Regression Detector | `regression-detector.mjs` | REGRESSION.md |
| Recommendation Ranking | `recommendation-ranking.mjs` | TOP10.md |
| Engineering Cost | `engineering-cost.mjs` | COSTS.md |
| Predictive Risk | `predictive-risk.mjs` | PREDICTIONS.md |

```bash
npm run eng:audit
npm run eng:intel
npm run eng:compare
npm run eng:agent -- predictive-risk
```

**Hard rule:** never modify `src/`. Findings and memory only.
