# AQLIYA Cursor Operating System

Project-scoped Cursor configuration for the AQLIYA repository.

## Layout

```txt
.cursor/
  rules/          # Project Rules (.mdc) — identity, low-load, boundaries, validation, security, UI, Prisma
  skills/         # Agent Skills (SKILL.md) — product-specific playbooks
  agents/         # Subagent definitions — architect, implementation, QA, security, copy, release
  hooks.json      # Windows hooks (PowerShell)
  hooks.linux.json # Linux/macOS/Cloud hooks (bash) — copy to hooks.json if needed
  hooks/          # Hook scripts (.ps1 + .sh)
  mcp.json        # MCP servers (Playwright first; add GitHub/Postgres read-only later)
```

## Quick start

1. **User Rules** (Cursor Settings → Rules → User Rules): paste the general operator rules from the AQLIYA Cursor OS spec (direct, evidence-based, low-load, product boundaries).
2. **Project Rules**: loaded automatically from `.cursor/rules/` when this repo is open.
3. **AGENTS.md**: full OpenCode contract + Cursor start-of-task protocol at repo root.
4. **Hooks (optional)**: enable when ready. On Windows use `hooks.json` as committed. On Linux/Cloud, replace or symlink: `cp .cursor/hooks.linux.json .cursor/hooks.json` (or merge manually).

## Hooks behavior

- `beforeShellExecution`: blocks heavy commands (`npm run build`, full test suite, prisma migrate/generate, package installs) until user approves in chat.
- `afterFileEdit`: reminds agent to report changed files; blocks suspicious `.env`/secret edits.
- Exit code `2` = deny (Cursor Hooks convention).

**Monitor mode:** If hooks feel too strict during early adoption, temporarily remove `beforeShellExecution` entries and keep only `protect-env-files`.

## Subagents

Invoke by name or description in Cursor Agent:

| Agent | File |
|-------|------|
| aqliya-architect | `.cursor/agents/architect.md` |
| aqliya-implementation | `.cursor/agents/implementation.md` |
| aqliya-qa | `.cursor/agents/qa.md` |
| aqliya-security | `.cursor/agents/security.md` |
| aqliya-product-copy | `.cursor/agents/product-copy.md` |
| aqliya-release-manager | `.cursor/agents/release-manager.md` |

## Skills

| Skill | When |
|-------|------|
| auditos-change | AuditOS workflow/routes/exports |
| salesos-change | SalesOS pipeline/intelligence |
| decisionos-change | DecisionOS/tenders |
| website-copy-review | Marketing/Arabic copy |
| release-hardening | Go/no-go, validation gates |
| qa-smoke | Route/browser smoke |
| strategic-audit | Repo/product reality audit |

## MCP

Start with Playwright MCP only for browser smoke. Do **not** add Postgres MCP with write access. Add GitHub MCP if using issues/PRs from Cursor.

## Daily workflow

Ask → Plan → Agent (small patch) → targeted validation → atomic commit → handoff report.

## Cloud Agents

Allowed automations: docs drift, route map reports, PR risk summary, marketing copy review (read-only unless asked).

Not allowed by default: migrations, auth changes, env edits, dependency upgrades, broad refactors.

See `AGENTS.md` → **Cursor Cloud specific instructions** for VM/database/dev-server notes.
