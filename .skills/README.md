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
| `docs/reports/mimiclaw-opencode-analysis.md`        | Analysis report — how mimiclaw patterns were adapted            |

---

## Adding a New Skill

1. Create a new `.md` file in `aqliya/` directory
2. Add `name` and `description` in YAML frontmatter
3. Write skill instructions in markdown
4. Update this `README.md` skill map table
5. Update `docs/official/aqliya-opencode-operating-system.md` skill table
6. Update `AGENTS.md` skill map table (§31)
