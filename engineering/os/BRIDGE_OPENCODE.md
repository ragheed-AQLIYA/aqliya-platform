# Engineering OS — Bridge: OpenCode ↔ Engineering Platform

**Status:** Active  
**Purpose:** This file defines how OpenCode (the agent runtime) connects to the engineering/ platform (the intelligence layer). It is the operational bridge between analysis and implementation.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                   OpenCode Runtime                    │
│                                                      │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ AGENTS.md   │  │ .skills/     │  │ task()     │ │
│  │ (contract)  │  │ (procedures) │  │ (dispatch) │ │
│  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                │                │         │
└─────────┼────────────────┼────────────────┼─────────┘
          │                │                │
          ▼                ▼                ▼
┌──────────────────────────────────────────────────────┐
│              Engineering OS Bridge                    │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ 1. Context Load (pre-flight)                 │   │
│  │    - Read engineering/intelligence/MEMORY.md │   │
│  │    - Read engineering/os/COMPLIANCE.md       │   │
│  │    - Read engineering/gates/ACTIVE_GOVERNANCE│   │
│  │    - Read engineering/knowledge/ADR_REGISTRY │   │
│  │    - Read engineering/knowledge/PATTERN_LIB  │   │
│  └──────────────────────────────────────────────┘   │
│                      │                               │
│                      ▼                               │
│  ┌──────────────────────────────────────────────┐   │
│  │ 2. Governance Gate (pre-execution)           │   │
│  │    - Check GOV-01 through GOV-12            │   │
│  │    - BLOCK on violation or WARN + document   │   │
│  └──────────────────────────────────────────────┘   │
│                      │                               │
│                      ▼                               │
│  ┌──────────────────────────────────────────────┐   │
│  │ 3. Skill Selection                          │   │
│  │    - Load product skills (.skills/aqliya/)   │   │
│  │    - Load engineering skills (.skills/eng-*) │   │
│  └──────────────────────────────────────────────┘   │
│                      │                               │
│                      ▼                               │
│  ┌──────────────────────────────────────────────┐   │
│  │ 4. Agent Dispatch (parallel)                 │   │
│  │    - database-agent → schema work             │   │
│  │    - security-agent → auth work               │   │
│  │    - testing-agent → test work                │   │
│  │    - infra-agent → cache/queue work           │   │
│  │    - docs-agent → documentation work          │   │
│  │    - observability-agent → metrics work       │   │
│  └──────────────────────────────────────────────┘   │
│                      │                               │
│                      ▼                               │
│  ┌──────────────────────────────────────────────┐   │
│  │ 5. Verification                             │   │
│  │    - npx tsc --noEmit                       │   │
│  │    - npm run build                           │   │
│  │    - npm test (scoped)                       │   │
│  │    - npm run lint (scoped)                   │   │
│  └──────────────────────────────────────────────┘   │
│                      │                               │
│                      ▼                               │
│  ┌──────────────────────────────────────────────┐   │
│  │ 6. Memory Update                            │   │
│  │    - Record decisions in DECISION_LOG.md     │   │
│  │    - Update patterns in PATTERN_LIBRARY.md   │   │
│  │    - Update ADR_REGISTRY.md if new ADR       │   │
│  └──────────────────────────────────────────────┘   │
│                      │                               │
│                      ▼                               │
│  ┌──────────────────────────────────────────────┐   │
│  │ 7. Skill Extraction                         │   │
│  │    - Did we solve something new?             │   │
│  │    - Can this solution become a Skill?       │   │
│  │    - Create .skills/aqliya/eng-*.md          │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────┐
│            Engineering Platform (Cursor)              │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ engineering/agents/  (15 script agents)      │   │
│  │ engineering/data/    (data lake)             │   │
│  │ engineering/intelligence/ (learning outputs) │   │
│  │ engineering/os/      (OS modules)            │   │
│  │ engineering/dashboard/ (scorecards)          │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## Bridge Operations

### Before Any Task (Load Context)

```
1. Read engineering/intelligence/MEMORY.md → what does the platform know?
2. Read engineering/os/COMPLIANCE.md → what are current compliance scores?
3. Read engineering/gates/ACTIVE_GOVERNANCE_RULES.md → what rules apply?
4. Read engineering/knowledge/ADR_REGISTRY.md → what decisions constrain us?
5. Read engineering/knowledge/PATTERN_LIBRARY.md → what patterns should we use?
```

### During Task (Governance Checks)

```
1. Before modifying src/: check GOV-01 through GOV-12
2. Before creating new route: check GOV-04, GOV-05, GOV-12
3. Before adding AI feature: check GOV-08
4. Before committing: run validation (tsc, lint, build)
```

### After Task (Memory Update)

```
1. Record any new decisions in engineering/knowledge/DECISION_LOG.md
2. If new pattern discovered: add to engineering/knowledge/PATTERN_LIBRARY.md
3. If ADR needed: create in engineering/knowledge/ADR_REGISTRY.md
4. If skill can be extracted: create in .skills/aqliya/eng-*.md
```

---

## Subagent Mapping

| OpenCode Agent | Engineering Layer | Typical Task |
|---------------|------------------|--------------|
| `database-agent` | Layer 2 (DB Mapper) + Layer 5 (DB Optimizer) | Schema changes, migrations, seed data |
| `security-agent` | Layer 4 (Security) | Auth, RBAC, middleware, tenant checks |
| `testing-agent` | Layer 6 (Testing) | Unit, integration, E2E tests |
| `infra-agent` | Layer 5 (Cache) + Layer 9 (Infra) | Redis, queues, rate limiting |
| `docs-agent` | Layer 7 (Product/Docs) | Documentation, runbooks, ADRs |
| `observability-agent` | Layer 9 (Observability) | Metrics, tracing, alerting, logging |

---

## Skill → Layer Mapping

| Skill | Layer | When to load |
|-------|-------|-------------|
| `aqliya-execution-protocol` | Layer 1 (Executive) | Every task |
| `aqliya-security-gate` | Layer 4 (Security) | Auth/RBAC/route changes |
| `aqliya-docs-authority` | Layer 7 (Product) | Documentation changes |
| `aqliya-product-completion` | Layer 7 (Product) | Product completion work |
| `aqliya-release-checklist` | Layer 1 (Executive) + Layer 9 (DevOps) | Before release |
| `aqliya-ai-feature-gate` | Layer 8 (AI) | AI feature changes |
| `aqliya-data-discipline` | Layer 2 (DB) + Layer 5 (DB) | Schema changes |
| `aqliya-export-gate` | Layer 4 (Security) | Export/download changes |
| `aqliya-parallel-director` | Layer 1 (Executive) | Multi-agent coordination |
| `eng-code-review` | Layer 3 (Quality) | Code review / quality check |
| `eng-architecture-review` | Layer 2 (Intel) + Layer 3 (Quality) | Architecture changes |
| `eng-security-audit` | Layer 4 (Security) | Security posture check |
| `eng-governance-compliance` | Layer 12 (Governance) | Pre-execution gate |

---

## Cycle Trigger

The Engineering OS cycle is triggered:

1. **On every OpenCode session start** — load context
2. **Before every code change** — run governance gates
3. **After every code change** — run verification
4. **After every task completion** — update memory

Long-running audits (`npm run eng:audit`, `npm test` full suite) are run on explicit request or schedule, not every cycle.
