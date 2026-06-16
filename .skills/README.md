# AQLIYA OpenCode Skills

> **Purpose:** Skills directory for OpenCode (AI coding agent) operating on AQLIYA.  
> **Format:** Each skill is a markdown file with YAML frontmatter (`name`, `description`).  
> **Selection:** OpenCode auto-loads skills based on task description matching.

---

## Skill Map

| Skill File                            | Auto-Load When Task Involves              | Purpose                                                                  |
| ------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| `aqliya/`                             | —                                         | All AQLIYA-specific operating skills (7 files)                           |
| `aqliya/aqliya-low-load-dev.md`       | Heavy commands, RAM issues, builds        | Command classification (light/medium/heavy), RAM vs code diagnosis       |
| `aqliya/aqliya-security-gate.md`      | Auth, routes, data, middleware, downloads | Auth coverage, tenant isolation, RBAC, audit trail, protected files      |
| `aqliya/aqliya-docs-authority.md`     | Documentation updates, conflicts          | Source-of-truth hierarchy, conflict resolution, sync rules               |
| `aqliya/aqliya-demo-safety.md`        | `/auditos` demo route, public access      | 7 hard rules: no auth, no real data, no mutations, no uploads/downloads  |
| `aqliya/aqliya-product-completion.md` | Product work, feature additions           | v0.1 DoD checklist, L0-L6 levels, anti-patterns                          |
| `aqliya/aqliya-release-checklist.md`  | Releases, deployments                     | Route/security/data/docs verification, Go/No-Go criteria                 |
| `aqliya/aqliya-opencode-agent.md`     | Default, agent behavior, task start       | Task classification, skill selection, execution lifecycle, report format |

---

## How Skills Work

1. **Task arrives** → OpenCode parses the task description
2. **Skill matching** → matches keywords against skill `description` fields
3. **Auto-load** → loads ALL matching skills (multiple can apply simultaneously)
4. **Always load** `aqliya/aqliya-security-gate.md` if task touches routes, auth, or data
5. **Default** → if no skill matches, load `aqliya/aqliya-opencode-agent.md`
6. **Apply constraints** → skill rules govern execution behavior

---

## Skill Format

Every skill follows this exact format (derived from mimiclaw/nanobot skill system):

```yaml
---
name: <skill-name>
description: <one-line description for auto-matching>
---
```

After the frontmatter, the body contains the full skill instructions in markdown.

---

## Reference Documents

| Document                                            | Relationship                                                    |
| --------------------------------------------------- | --------------------------------------------------------------- |
| `AGENTS.md`                                         | Master agent operating contract — defines skill selection rules |
| `docs/official/aqliya-opencode-operating-system.md` | OS documentation — explains the skill system architecture       |
| `docs/official/aqliya-agent-context-v1.1.md`        | Agent context — product-level agent awareness                   |
| `docs/official/aqliya-ai-infrastructure-map-v1.0.md`| Current AI infrastructure inventory and architecture map        |
| `docs/official/aqliya-skill-context-v1.1.md`        | Skill context — describes the AQLIYA skill model                |
| `docs/reports/mimiclaw-opencode-analysis.md`        | Analysis report — how mimiclaw patterns were adapted            |

---

## Adding a New Agent Skill

1. Create a new `.md` file in `aqliya/` directory
2. Add `name` and `description` in YAML frontmatter
3. Write skill instructions in markdown
4. Update this `README.md` skill map table
5. Update `docs/official/aqliya-opencode-operating-system.md` skill table
6. Update `AGENTS.md` skill map table (§31)

---

# AQLIYA Skill Operating System (v0.1)

> **Purpose:** Executable, measurable, versioned, composable skills for AI-assisted intelligence work.  
> **Status:** Usable (L4) — 25 skills registered across 5 levels, 25 evaluation datasets (3 samples each), 6 governance policies, 1 composition workflow, CLI+API+UI evaluation framework. Live AI evaluation (v4): 19/25 pass (76%), 0/75 JSON parse failures, avg 80.0%.  
> **Core principle:** Skills are not documentation. Skills are executable capabilities with manifests, evaluations, governance, and lifecycle.

## Architecture

```
.skills/
├── schemas/          # Canonical manifest schema
├── registry/         # Master index + capability map + dependency graph
├── manifests/        # Individual skill manifests by category/level
│   ├── foundation/   # L0: analysis, extraction, mapping
│   ├── engineering/  # L1: security, migration, testing, performance
│   ├── product/      # L2: AuditOS, LocalContent, Sales, Compliance
│   ├── business/     # L3: commercial, pricing, market, positioning
│   └── meta/         # L4: builder, evaluator, auditor, optimizer, composer
├── evaluations/      # Evaluation datasets per skill
├── governance/       # Access policies, lifecycle policies, audit config
├── workflows/        # Composed multi-skill workflows (DAGs)
├── templates/        # Base templates for Skill Builder
└── archive/          # Retired skill manifests
```

## Levels

| Level | Category      | Examples                                    | Governance |
|-------|---------------|---------------------------------------------|------------|
| L0    | Foundation    | repo-analysis, doc-analysis, arch-mapping   | Read-only, no auth |
| L1    | Engineering   | security-audit, test-coverage, migration    | Auth required, evidence |
| L2    | Product       | auditos-review, localcontent-review         | Auth + approval + evidence |
| L3    | Business      | commercial-validation, roi-analysis         | Executive auth + approval |
| L4    | Meta          | skill-builder, skill-evaluator              | Admin + full audit |

## Skill Lifecycle

```
concept → draft → validated → published → deprecated → retired
```

Each transition has gates defined in `.skills/governance/lifecycle-policies.yaml` with quality thresholds, approver requirements, and audit levels.

## Registry

| File                          | Content                                    |
|-------------------------------|--------------------------------------------|
| `registry/index.yaml`         | Master index of all 25 registered skills   |
| `registry/capability-map.yaml`| Business capability → skill ID mapping     |
| `registry/dependency-graph.yaml`| DAG of skill-to-skill dependencies      |

## Related Documents

| Document | Relationship |
|----------|-------------|
| `docs/official/aqliya-skill-context-v1.1.md` | Foundation context for skill model |
| `docs/official/aqliya-ai-infrastructure-map-v1.0.md` | Infrastructure this OS builds on |
| `docs/official/aqliya-skill-os-v1.0.md` | Full Skill OS architecture document |
| `docs/official/aqliya-core-architecture-v1.1.md` | Core platform architecture |
| `AGENTS.md §32` | Skill auto-load rules for OpenCode agent |
