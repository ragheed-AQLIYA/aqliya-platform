# AEOS Kernel v1.1

**Status:** Active  
**Version:** 1.1  
**Date:** 2026-07-13  
**Owner:** AEOS Core Team  

---

## What is the AEOS Kernel?

The AEOS Kernel is the **execution core** of the AQLIYA Engineering Operating System. It provides the runtime infrastructure that all agents, skills, registries, and engines plug into.

```
┌──────────────────────────────────────────────────────────┐
│                    AEOS Kernel v1.1                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Agent Engine │  │ Skill Engine │  │Memory Engine │   │
│  │  • Lifecycle │  │  • Registry  │  │  • ADR store │   │
│  │  • Registry  │  │  • Scoring   │  │  • Patterns  │   │
│  │  • Dispatch  │  │  • Matching  │  │  • Decisions │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │            │
│  ┌──────┴─────────────────┴─────────────────┴───────┐   │
│  │                  Event Engine                     │   │
│  │         Cross-engine communication bus            │   │
│  └──────┬──────────────────────────────────┬───────┘   │
│         │                                  │            │
│  ┌──────┴───────┐  ┌──────────────┐  ┌─────┴──────┐   │
│  │Governance   │  │  Planning    │  │  Metrics   │   │
│  │ Engine      │  │  Engine      │  │  Engine    │   │
│  │ • Rules     │  │  • Epics     │  │  • Health  │   │
│  │ • Gates     │  │  • Stories   │  │  • Trends  │   │
│  │ • Enforce   │  │  • Priority  │  │  • Alerts  │   │
│  └──────┬───────┘  └──────┬───────┘  └─────┬──────┘   │
│         │                 │                 │            │
│  ┌──────┴─────────────────┴─────────────────┴───────┐   │
│  │              Runtime Engine                       │   │
│  │    Scheduler → Queue → Execute → Verify → Done   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Knowledge Engine                     │   │
│  │    Digital Twin • Graph • Relations • History    │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## Kernel Engines

| # | Engine | File | Role |
|---|--------|------|------|
| 1 | Agent Engine | `agent-engine.mjs` | Agent registration, lifecycle, dispatch |
| 2 | Skill Engine | `skill-engine.mjs` | Skill registration, scoring, agent matching |
| 3 | Memory Engine | `memory-engine.mjs` | ADRs, patterns, decisions, anti-patterns |
| 4 | Event Engine | `event-engine.mjs` | Cross-engine event bus |
| 5 | Governance Engine | `governance-engine.mjs` | Rule enforcement, pre-execution gates |
| 6 | Planning Engine | `planning-engine.mjs` | Sprint/epic/story planning, dependencies |
| 7 | Metrics Engine | `metrics-engine.mjs` | Health scores, trends, benchmarks |
| 8 | Knowledge Engine | `knowledge-engine.mjs` | Digital Twin, graph, relations |
| 9 | Runtime Engine | `runtime-engine.mjs` | Scheduler, queue, state machine, execution |

---

## Agent Lifecycle (state-machine.mjs)

Every agent passes through these states:

```
IDLE → QUEUED → RUNNING → REVIEW → COMPLETED → ARCHIVED
                       ↓         ↓
                    FAILED    REJECTED → QUEUED (retry)
```

---

## Skill Lifecycle

```
DRAFT → REVIEW → ACTIVE → DEPRECATED → RETIRED
         ↓
      REJECTED → DRAFT (revise)
```

---

## Event Bus (event-engine.mjs)

All kernel engines communicate through the event bus:

| Event | Producer | Consumers |
|-------|----------|-----------|
| `agent.registered` | Agent Engine | Registry, Metrics |
| `agent.dispatched` | Runtime Engine | Scheduler, Metrics |
| `skill.used` | Skill Engine | Metrics, Memory |
| `governance.violated` | Governance Engine | Planning, Metrics |
| `cycle.completed` | Runtime Engine | All engines |
| `memory.updated` | Memory Engine | Knowledge, Metrics |
| `digital_twin.synced` | Knowledge Engine | All engines |

---

## Plugin Architecture

Everything outside the kernel is a **plugin**:

```
Kernel (9 engines)
├── Plugin: Agent Registry (engineering/registry/agents/*.yaml)
├── Plugin: Skill Registry (engineering/registry/skills/*.yaml)
├── Plugin: Data Lake (engineering/data/*)
├── Plugin: Dashboards (engineering/dashboard/*)
├── Plugin: Intelligence (engineering/intelligence/*)
├── Plugin: Reports (engineering/reports/*)
└── Plugin: External Agents (engineering/agents/*.mjs)
```

---

## Kernel Constitution (immutable rules)

1. **Kernel is stateless** — All state lives in the Data Lake
2. **Kernel is event-driven** — All engine communication goes through Event Bus
3. **Kernel is plugin-first** — Agent registry, skill registry, data lake are plugins, not kernel
4. **Kernel enforces governance** — No execution without governance gate pass
5. **Kernel is measurable** — Every operation produces metrics

---

## Boot Sequence

```
1. Kernel loads
2. Registry plugins load (agents, skills)
3. Data Lake plugin mounts
4. Event Bus activates
5. Runtime Engine becomes ready
6. Agent dispatch begins
```

---

## Amendment

Kernel changes require:
1. ADR in `engineering/knowledge/ADR_REGISTRY.md`
2. Kernel version bump
3. All plugin compatibility check
