# Agent Freeze — Engineering Tooling

**Effective:** 2026-07-11  
**Status:** Active  

## Decision

AQLIYA Engineering tooling has reached **company-grade operating shape**:

| System | Role |
| ------ | ---- |
| OpenCode | Implementation |
| EngineeringOS (Cursor) | Quality · Intelligence · Verification · Findings |
| Program Governance | Vision · ADR · Execution Programs · Priorities |

**No new Engineering agents** should be added unless Program Governance opens an explicit exception (ADR) with a clear gap that existing modules cannot cover.

## Allowed after freeze

- Run existing agents (`eng:audit`, `eng:os`, `eng:programs`)
- Tune thresholds / fix false positives
- Sync ADRs / lifecycle / delivery board
- Product completion work (OpenCode — Program B)

## Not allowed without ADR exception

- New scan agents
- New dashboard frameworks
- Parallel “report factories”
- Replacing OpenCode or Program Governance with automation

## Last agents admitted (this closure)

1. Delivery Planner  
2. ROI Optimizer  
3. Enterprise Readiness  

These close the loop: **find → rank → plan waves → estimate enterprise readiness**.
