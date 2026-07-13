# AQLIYA Engineering Operating System

**Status:** Active — Engineering OS v1.0  
**Role:** Self-improving engineering platform — governs, measures, and continuously evolves the repository  
**Authority:** Intelligence and governance — implementation through OpenCode  

> OpenCode = Implementation Authority  
> Engineering OS = Quality, Intelligence, Governance, Skills  
> Program Governance = Architecture direction, Priorities  

---

## Mission

Not just **measure** — **operate and improve**.

```
Audit → Learn → Govern → Execute → Verify → Remember → Skill Extraction → Repeat
```

**New (2026-07-13):** Upgraded from "Engineering Intelligence Platform" to "Engineering Operating System" with:
- 12-layer architecture (see `engineering/os/ENGINEERING_OS_ARCHITECTURE.md`)
- Skills Factory (`.skills/aqliya/eng-*.md`)
- Active Governance Rules (`engineering/gates/ACTIVE_GOVERNANCE_RULES.md`)
- Engineering Memory (`engineering/knowledge/`)
- OpenCode Bridge (`engineering/os/BRIDGE_OPENCODE.md`)

---

## Workspace (AEOS v1.1)

```
engineering/
├── kernel/                 # ★ AEOS KERNEL v1.1 (NEW)
│   ├── KERNEL.md           #   Kernel constitution
│   ├── index.mjs           #   Boot sequence
│   ├── state-machine.mjs   #   Agent/Skill/Task/Cycle states
│   ├── event-engine.mjs    #   Cross-engine communication bus
│   ├── runtime-engine.mjs  #   Scheduler, queue, execution
│   └── metrics-engine.mjs  #   22 metrics, health score, trends
│
├── registry/               # ★ Agent & Skill Registries (NEW)
│   ├── agents/             #   11 agents in YAML
│   └── skills/             #   4 skills with quality scoring
│
├── agents/                 # 9 quality + 6 intelligence agents (.mjs)
├── data/                   # APPEND-ONLY data lake
│   ├── DATA_LAKE_SCHEMA.md #   Data lake schema (v1.1)
│   ├── DIGITAL_TWIN_SCHEMA.md # Digital Twin schema (v1.1)
│   ├── audits/
│   ├── metrics/
│   ├── findings/           #   memory.json learns across runs
│   ├── history/
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
├── os/                     # EngineeringOS modules
│   ├── ENGINEERING_OS_ARCHITECTURE.md  # 12-layer design
│   ├── BRIDGE_OPENCODE.md              # OpenCode ↔ Engineering bridge
│   ├── KNOWLEDGE_GRAPH.md
│   ├── COMPLIANCE.md
│   └── ... (8 modules)
├── knowledge/              # Engineering Memory
│   ├── ADR_REGISTRY.md
│   ├── PATTERN_LIBRARY.md
│   └── DECISION_LOG.md
├── gates/                  # Smart gates + Active Governance
│   └── ACTIVE_GOVERNANCE_RULES.md
├── dashboard/              # Intelligence + Executive + Product scorecards
├── reports/                # Latest snapshot reports
├── refactors/
├── AEOS_ROADMAP.md         # v1.0 → v2.0 roadmap
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
