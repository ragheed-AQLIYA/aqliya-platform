# AEOS Roadmap — v1.0 to v2.0

**Status:** Active  
**Owner:** Chief Architect  
**Last Updated:** 2026-07-13

---

## Version History

| Version | Date | Theme | Status |
|---------|------|-------|--------|
| v1.0 | 2026-07-13 | Documentation OS — Architecture, Skills, Memory | ✅ Complete |
| **v1.1** | **2026-07-13** | **Kernel + Registry + Runtime + Data Lake** | **🚀 Active** |
| v1.2 | TBD | Memory Engine + Knowledge Graph + Metrics Engine | Planned |
| v1.3 | TBD | Digital Twin + Event Bus + Cross-Agent Collaboration | Planned |
| v2.0 | TBD | Autonomous Engineering Platform | Planned |

---

## AEOS v1.1 (Current — Execution-Centric)

### ✅ Completed this Cycle

| Component | Status |
|-----------|--------|
| AEOS Kernel (9 engines designed, 4 built) | ✅ |
| State Machine (agent, skill, task, cycle transitions) | ✅ |
| Event Engine (cross-engine communication bus) | ✅ |
| Runtime Engine (scheduler, queue, cycle execution) | ✅ |
| Metrics Engine (22 metrics, health score, trends) | ✅ |
| Agent Registry (11 agents across 8 layers) | ✅ |
| Skill Registry (4 skills with quality scoring) | ✅ |
| Data Lake schema (12+ data streams, JSONL format) | ✅ |
| Digital Twin schema (12 dimensions, incremental updates) | ✅ |
| Kernel Index (boot sequence, module exports) | ✅ |

### ⏳ Remaining for v1.1

| Component | Priority |
|-----------|----------|
| Agent Engine (`agent-engine.mjs`) | High |
| Skill Engine (`skill-engine.mjs`) | High |
| Memory Engine (`memory-engine.mjs`) | High |
| Governance Engine (`governance-engine.mjs`) | Medium |
| Planning Engine (`planning-engine.mjs`) | Medium |
| Knowledge Engine (`knowledge-engine.mjs`) | Medium |
| Registry Loader (`registry-loader.mjs`) | High |
| `eng:os bootstrap` CLI command | Medium |

---

## AEOS v1.2 — Memory & Metrics (planned)

- Memory Engine (ADR store, pattern library, decision log automation)
- Knowledge Graph Engine (incremental graph updates)
- Metrics Dashboard (real-time health score)
- Trend Analysis Engine
- Benchmark Pipeline
- Incident Response Engine

## AEOS v1.3 — Digital Twin & Collaboration (planned)

- Digital Twin Builder (incremental scan)
- Cross-Agent Collaboration Graph
- Planning Engine (autonomous sprint/epic/story generation)
- Governance Auto-Enforcement (CI-integrated)
- Automated Release Validation

## AEOS v2.0 — Autonomous Platform (vision)

- Self-Improving Skills (auto-extract from cycles)
- Continuous Learning Engine
- Automatic Governance Enforcement
- Autonomous Planning & Execution
- Automatic Repository Evolution
- Engineering AI (recommendations → autonomous fixes)
