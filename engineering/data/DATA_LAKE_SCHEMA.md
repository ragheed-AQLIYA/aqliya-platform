# AEOS Engineering Data Lake

**Status:** Active — Append-only  
**Version:** 1.1  
**Owner:** Layer 2 (Repository Intelligence)  

## Schema

The Data Lake is an append-only knowledge store. Every cycle produces new data that is appended — never deleted or overwritten.

```
engineering/data/
├── audits/                  # Raw audit outputs per cycle
│   └── cycle-<id>/
│       ├── code-health.json
│       ├── security.json
│       ├── performance.json
│       ├── technical-debt.json
│       ├── architecture-drift.json
│       └── dependencies.json
│
├── metrics/                 # Metrics time-series
│   ├── architecture.jsonl   # { metric, value, cycleId, timestamp }
│   ├── quality.jsonl
│   ├── security.jsonl
│   ├── testing.jsonl
│   ├── governance.jsonl
│   └── engineering.jsonl
│
├── health/                  # Health score snapshots
│   └── health-scores.jsonl  # { cycleId, overall, components, timestamp }
│
├── history/                 # Cycle execution history
│   └── cycles.jsonl         # { cycleId, phases, duration, agents, results }
│
├── benchmarks/              # Performance benchmarks
│   └── benchmarks.jsonl     # { metric, baseline, current, variance, timestamp }
│
├── incidents/               # Engineering incidents
│   └── incidents.jsonl      # { id, severity, description, resolution, cycleId }
│
├── findings/                # Intelligence findings
│   └── memory.json          # Fingerprinted findings across cycles
│
├── products/                # Per-product metrics
│   ├── auditos.jsonl
│   ├── decisionos.jsonl
│   ├── localcontentos.jsonl
│   └── ...
│
├── regressions/             # Regression detection
│   └── regressions.jsonl    # { metric, before, after, change, cycleId }
│
├── recommendations/         # Top-N recommendations
│   └── recommendations.jsonl
│
├── predictions/             # Predictive analytics
│   └── predictions.jsonl
│
└── costs/                   # Engineering cost tracking
    └── costs.jsonl
```

## JSONL Format

All data files use JSONL (JSON Lines) — one JSON object per line for append-friendly streaming:

```jsonl
{"metric":"governance.score","value":82,"cycleId":"cycle-001","timestamp":"2026-07-13T00:00:00Z"}
{"metric":"governance.score","value":84,"cycleId":"cycle-002","timestamp":"2026-07-14T00:00:00Z"}
```

## Data Rules

1. **Append-only**: Never delete or modify existing lines
2. **Timestamped**: Every entry has a timestamp
3. **Cycle-tagged**: Every entry has a cycleId
4. **Fingerprinted**: Findings have unique fingerprints for tracking across cycles
5. **Immutable history**: The data lake is the source of truth for all trends
