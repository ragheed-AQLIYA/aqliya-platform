# Engineering Data Lake

Append-only. Every `eng:audit` adds a new snapshot — nothing is replaced.

| Path | Contents |
| ---- | -------- |
| `audits/` | Full audit snapshots + `latest.json` |
| `metrics/series.jsonl` | Score time series |
| `findings/memory.json` | Fingerprinted finding memory (learn recurrence) |
| `findings/<auditId>.json` | Per-audit finding blobs |
| `timeline/events.jsonl` | Event log |
| `trends/` | Latest trend artifacts |
| `products/` | Product size + scorecard history |
| `regressions/` | Before/after comparisons |
| `recommendations/` | Ranked Top 10 |
| `costs/` | Fix cost estimates |
| `predictions/` | Predictive risk by product |

Do not hand-edit. Re-run `npm run eng:audit`.
