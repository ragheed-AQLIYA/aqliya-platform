---
name: aqliya-execution-protocol
description: Task classification, skill selection, command discipline, pre-flight checks, and final report format for all AQLIYA tasks
version: 2.0
date: 2026-07-12
status: active
---

# AQLIYA Execution Protocol

> **Merged from:** `aqliya-opencode-agent.md` + `aqliya-low-load-dev.md` (Wave C, 2026-07-12)
> **Purpose:** Single entry point for agent task discipline — classification, commands, and reporting.

---

## 1. Task Classification (Before Any Action)

```md
Task: <description>
Product/System: <name>
Task Type: Identity | Bug fix | Feature | Product completion | Data/schema | AI feature | Infrastructure | Refactor | Documentation
Current Level: L0-L6
Target Level: L0-L6
Data Impact: Schema change | No schema change | Read-only
Route Impact: New route | Route change | No route change
Governance Impact: Auth | RBAC | Audit | None
Docs Impact: <which docs>
Primary Risk: <what could break>
```

## 2. Skill Auto-Selection

| Task involves... | Load skill |
|---|---|
| Auth, security, API routes, downloads, RBAC | `aqliya-security-gate` |
| Documentation updates, conflicts, status | `aqliya-docs-authority` |
| Product completion, v0.1 DoD enforcement | `aqliya-product-completion` |
| Release, deployment, pre-flight verification | `aqliya-release-checklist` |
| AI features, prompts, providers, confidence | `aqliya-ai-feature-gate` |
| Schema, migrations, seeds, data integrity | `aqliya-data-discipline` |
| Exports, file downloads, evidence packages | `aqliya-export-gate` |
| Parallel agent coordination | `aqliya-parallel-director` |

## 3. Pre-Flight Context

1. `git log --oneline -10` + `git diff --stat`
2. Read relevant `docs/official/` or `docs/source-of-truth/` files
3. Scan for TODO/FIXME/XXX in affected area
4. Inspect existing patterns in neighboring files

## 4. Command Classification

### Light (always allowed)
`npx tsc --noEmit` · `npm run lint -- --quiet` · `npx prisma validate` · `git status/log/diff` · file read/search

### Medium (justify)
`npm run build` (after feature) · `npm test -- <file>` · `npx prisma generate` (after schema change)

### Heavy (require approval)
`npm run build` (full) · `npm test` (full) · `npx prisma migrate dev` · `npm install <pkg>` · destructive ops

## 5. RAM vs Code Issue

- **RAM:** error mentions `heap`/`allocation failure`, same code worked before → `node --max-old-space-size=4096`
- **Code:** stack trace to specific code, TypeScript/lint message, consistent across envs → fix the code
- Never blame RAM for code errors

## 6. Protected Files (Ask Before Modifying)

`prisma/schema.prisma` · `src/middleware.ts` · auth config · `.env` · `package.json`

## 7. Recovery from Failures

- **Build fails:** Identify new vs pre-existing errors. Report specific error. Don't retry blindly.
- **Migration fails:** Don't reset DB. Report error. Don't `--force` without approval.
- **TypeScript fails:** Fix new errors. Report pre-existing ones honestly.

## 8. Final Report Format

```md
## Summary
## Product/System Affected
## Files Changed
## Governance Check (RBAC, Tenant, Evidence, Audit, Review, Export, AI)
## Validation
| Command | Result |
## Known Limitations
## Next Recommended Step
```

## 9. Completion Statuses

| Status | Meaning |
|---|---|
| DONE | Completed with evidence |
| DONE_WITH_CONCERNS | Completed, list concerns |
| BLOCKED | Cannot proceed; state blocker |
| NEEDS_CONTEXT | Missing info needed |

## 10. Hard Stops

Stop if: AI makes final decisions · no tenant/permission strategy · mutation has no audit trail · export bypasses approval · client imports server-only code · product called complete while L1-L3 · validation skipped
