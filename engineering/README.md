# AQLIYA Engineering Intelligence Platform

**Status:** Active  
**Role:** Parallel engineering quality + learning organization  
**Authority:** Findings and memory only — never product ownership  

> OpenCode = Implementation Authority  
> Cursor Engineering = Quality & Intelligence  
> Program Governance = Architecture direction  

---

## Mission

Not just **measure** — **learn**.

```
Audit → History → Trend → Root Cause → Prediction → Recommendation
```

Every audit is **appended** to the data lake. Findings are fingerprinted so the platform knows:

- Is the repo improving?
- Is the same issue recurring?
- Did OpenCode fix it?
- Did it come back?
- What should we do next (Top 10 ROI)?

---

## Workspace

```
engineering/
├── agents/                 # 9 quality + 6 intelligence agents
├── data/                   # APPEND-ONLY data lake
│   ├── audits/
│   ├── metrics/
│   ├── findings/           # memory.json learns across runs
│   ├── history/
│   ├── timeline/
│   ├── trends/
│   ├── products/
│   ├── regressions/
│   ├── recommendations/
│   ├── costs/
│   └── predictions/
├── intelligence/           # Human-readable learning outputs
│   ├── MEMORY.md
│   ├── TRENDS.md
│   ├── REGRESSION.md
│   ├── TOP10.md
│   ├── COSTS.md
│   ├── PREDICTIONS.md
│   └── architecture-memory/
├── dashboard/              # Intelligence + Executive + Product scorecards
├── reports/                # Latest snapshot reports
├── refactors/
├── knowledge/
├── gates/                  # Smart gates (status + Δ reason)
├── metrics/
└── run.mjs
```

---

## Agents

### Quality (scan)

Code Health · Security · Performance · Test Intelligence · Documentation · UX · Dependency · Technical Debt · Architecture Drift

### Intelligence (learn)

| Agent | Output |
| ----- | ------ |
| Engineering Intelligence | `intelligence/MEMORY.md` |
| Trend Analysis | `intelligence/TRENDS.md` |
| Regression Detector | `intelligence/REGRESSION.md` |
| Recommendation Ranking | `intelligence/TOP10.md` |
| Engineering Cost | `intelligence/COSTS.md` |
| Predictive Risk | `intelligence/PREDICTIONS.md` |

---

## Commands

```bash
npm run eng:audit      # full: audit → lake → intelligence → dashboards
npm run eng:intel      # intelligence only (needs prior audit)
npm run eng:compare    # regression before/after
npm run eng:gates      # smart gates with delta reasons
npm run eng:memory     # sync ADRs into Architecture Memory
npm run eng:memory -- record --title "..." --product DecisionOS --reason "..."
npm run eng:weekly
npm run eng:dashboard
```

---

## Architecture Memory

When OpenCode makes an architectural decision, record it:

```bash
npm run eng:memory -- record \
  --id ADR-41 \
  --title "DecisionOS uses enforce()" \
  --product DecisionOS \
  --reason "Unify authorization" \
  --pattern "enforce() authorization" \
  --files "src/lib/authorization/authorize.ts"
```

Engineering Excellence will avoid recommending a revert of protected patterns.

---

## EngineeringOS (final operating layer)

```bash
npm run eng:os              # full OS
npm run eng:impact -- enforce
npm run eng:os -- --lifecycle assign --fp <id> --wave Wave-8
npm run eng:os -- --lifecycle verified --fp <id>
```

See `engineering/os/README.md` — Knowledge Graph, Impact, Compliance, Lifecycle, Release, KPI, ADR Validation, Executive Portal, and Finding Lifecycle Board.

---

## Execution Programs (A–E)

```bash
npm run eng:programs
```

| Program | Focus |
| ------- | ----- |
| A | Platform Completion |
| B | Product Completion (per-product %) |
| C | Engineering Excellence — **agent freeze** |
| D | Architecture Governance |
| E | Delivery Governance (Backlog → Measured) |

**Last agents admitted:** Delivery Planner · ROI Optimizer · Enterprise Readiness  

**Freeze:** [`programs/AGENT_FREEZE.md`](./programs/AGENT_FREEZE.md) — stop adding Engineering agents; invest in Program B + pilots.

---

## Hard Rules

1. Never modify `src/` automatically.
2. Never redesign products or architecture.
3. Data lake is append-only — do not delete history to “clean” scores.
4. Reports are evidence, not doctrine.
5. After agent freeze: product completion > new tooling.
