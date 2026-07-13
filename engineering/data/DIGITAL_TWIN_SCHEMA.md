# AEOS Repository Digital Twin

**Status:** Active  
**Version:** 1.1  
**Owner:** Layer 2 (Repository Intelligence)  

## What is the Digital Twin?

The Digital Twin is a **complete model** of the AQLIYA repository — products, modules, routes, entities, APIs, events, dependencies, tests, tables, migrations, agents, skills, and their relationships. It is built once and **incrementally updated** — never rebuilt from scratch.

---

## Twin Schema

```json
{
  "version": "1.1",
  "generated": "2026-07-13T00:00:00Z",
  "cycleId": "cycle-002",
  "repository": {
    "name": "AQLIYA",
    "sourceFiles": 2976,
    "testFiles": 397,
    "docsFiles": 2536,
    "prismaModels": 244,
    "prismaEnums": 35,
    "dependencies": 49,
    "scripts": 235
  },
  "products": [
    {
      "id": "auditos",
      "name": "AuditOS",
      "type": "specialized_operating_system",
      "maturity": "L6",
      "routes": [],
      "modules": [],
      "models": [],
      "tests": 0,
      "dependencies_on_core": []
    }
  ],
  "modules": [
    {
      "id": "src/lib/core/ai",
      "name": "AI Orchestration",
      "layer": "core",
      "files": 15,
      "exports": ["AIOrchestrator", "sanitizeTaskInput"],
      "imported_by": ["auditos", "decisionos", "localcontentos", "office_ai"],
      "depends_on": ["src/lib/security"]
    }
  ],
  "routes": [
    {
      "path": "/audit",
      "product": "auditos",
      "type": "governed_workspace",
      "auth": "protected",
      "has_error_boundary": true,
      "has_loading_boundary": true,
      "has_not_found_boundary": true
    }
  ],
  "agents": [
    {
      "id": "chief-architect",
      "layer": 1,
      "status": "active",
      "skills": ["eng-architecture-review"],
      "dependencies": []
    }
  ],
  "skills": [
    {
      "id": "eng-code-review",
      "layer": 3,
      "status": "active",
      "quality_score": 85,
      "compatible_agents": ["code-quality"]
    }
  ],
  "dependencies_graph": {
    "nodes": [],
    "edges": []
  },
  "test_coverage": {
    "branches": 24,
    "functions": 27,
    "lines": 27,
    "statements": 33
  },
  "governance": {
    "overall_score": 82,
    "rules": {
      "GOV-01": 99,
      "GOV-02": 52,
      "GOV-03": 100
    }
  }
}
```

---

## Incremental Update Strategy

Instead of rebuilding the entire twin every cycle:

1. **Initial build** (Cycle 0): Scan entire repository → produce full twin
2. **Incremental update** (Cycle N): Only scan files changed since last cycle
3. **Delta detection**: Compare current twin vs. previous → detect drift
4. **Invalidation**: When `prisma/schema.prisma` changes → rescan all models
5. **Cache key**: `git diff --stat HEAD~N..HEAD` determines what to rescan

---

## Twin Storage

```
engineering/data/twin/
├── latest.json              # Current Digital Twin
├── cycle-001.json            # Snapshot at cycle end
├── cycle-002.json
└── diffs/
    └── cycle-001_to_cycle-002.json  # What changed
```

---

## Twin Queries

The Digital Twin answers questions like:

- "Which products depend on `src/lib/core/ai/orchestrator.ts`?"
- "How many routes are missing `error.tsx`?"
- "Which agents have `eng-security-audit` in their skills?"
- "How has test coverage changed over the last 5 cycles?"
- "Which modules have the most cross-product dependencies?"
- "What is the governance score trend for GOV-02?"
