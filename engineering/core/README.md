# AEOS Platform Core v1.0

**Status:** Active  
**Architecture:** Contract-First  
**Principle:** Kernel → Contract ← Plugin  

---

## Core Architecture

```
engineering/core/
│
├── contracts/                          # ★ PURE INTERFACES
│   └── platform-contracts.ts           #   12 contracts: Agent, Skill, Memory, Event,
│                                       #   Registry, Task, Cycle, Governance, Metric,
│                                       #   Plugin, Workflow, DigitalTwin
│                                       #   + Collaboration Protocol
│                                       #   + Capability System
│
├── plugin-sdk.mjs                      # Plugin registration & lifecycle
├── registry.mjs                        # Universal registry for ALL types
├── workflow-engine.mjs                 # DAG-based parallel workflow execution
├── memory-system.mjs                   # 6 memory types
├── governance-engine.mjs               # Evidence-based governance
├── collaboration-protocol.mjs          # Agent-to-agent communication
├── capability-system.mjs               # Capability → Skill → Procedure → Task → Action
├── digital-twin.mjs                    # 11 independently-versioned layers
└── index.mjs                           # Boot sequence & module exports
```

---

## Architecture Principle

```
  ┌──────────┐
  │ Kernel   │  (state machine, event bus, runtime, metrics)
  └────┬─────┘
       │ depends on
       ▼
  ┌──────────┐
  │ Contract │  (pure interfaces — no implementation)
  └────┬─────┘
       │ implemented by
       ▼
  ┌──────────┐
  │ Plugin   │  (agents, skills, dashboards, reports...)
  └──────────┘
```

**The kernel NEVER knows about specific plugins.**  
**Plugins implement contracts.**  
**New plugins can be added without modifying the kernel.**

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Contracts are TypeScript interfaces | Type-safe, self-documenting, compilable |
| Registry is universal | Agents, skills, policies, metrics, plugins, workflows, products — all use the same registration mechanism |
| Workflow is DAG-based | Enables parallel execution of independent steps |
| Memory has 6 types | Working, Episodic, Semantic, Repository, Decision, Skill — prevents knowledge type mixing |
| Governance is evidence-based | Policy → Rule → Validator → Evidence → Decision → Action — aligns with AQLIYA philosophy |
| Collaboration has a protocol | Request → Context → Evidence → Recommendation → Decision → Approval → Execution → Verification |
| Capabilities bundle skills | Capability → Skill → Procedure → Task → Action — skills are reusable within larger capabilities |
| Digital Twin is layered | 11 layers with independent versioning — each changes at its own rate |

---

## Boot Sequence

```
1. Contracts loaded (type definitions)
2. Kernel boots (event bus, state machine, runtime, metrics)
3. Plugin SDK activates
4. Registry mounts (ready for registrations)
5. Workflow Engine registers 3 standard workflows
6. Memory System initializes 6 stores
7. Governance Engine registers 3 policies + 12 rules
8. Collaboration Protocol activates
9. Capability System registers 4 capabilities
10. Digital Twin initializes 11 layers
11. Platform ready
```

---

## Version

**AEOS Platform Core v1.0.0** — Contract-First Architecture.
