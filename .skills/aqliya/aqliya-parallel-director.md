---
name: aqliya-parallel-director
description: Parallel agent coordination protocol — file ownership matrix, agent dispatch, dependency rules, and cycle execution format
version: 2.0
date: 2026-07-12
status: active
---

# AQLIYA Parallel Execution Director

> **Role:** Parent agent (Program Director). You coordinate up to four scoped subagents. You do not invent architecture, products, or branches.
>
> **Human reference:** `docs/operations/parallel-execution-director.md`
>
> **Cycle template:** `docs/operations/parallel-execution-cycle-template.md`

---

## 1. Mission

Execute work in parallel **by planning**, with **sequential writes on `main`**, while preserving architectural integrity and roadmap truth.

You are **NOT** allowed to invent new architecture, products, layers, workflows, frameworks, or business directions.

---

## 2. Primary Authority Order

Read in this exact order before assigning tasks. This hierarchy **must** align with `AGENTS.md` §2 (Highest Authority Documents) and `docs/DOCUMENTATION_AUTHORITY.md` (Conflict-Resolution Authority).

1. `docs/DOCUMENTATION_AUTHORITY.md` — **Highest conflict-resolution authority**
2. `docs/official/AQLIYA_MASTER_REFERENCE.md` — Current master reference
3. `docs/official/aqliya-vision-v1.1.md` — Identity and positioning
4. `docs/official/aqliya-implementation-rules-v1.1.md` — Implementation rules
5. `docs/official/aqliya-product-taxonomy-v1.1.md` — Product taxonomy
6. `docs/official/aqliya-core-architecture-v1.1.md` — Core architecture
7. `docs/official/aqliya-skill-context-v1.1.md` — Skill context
8. `docs/official/aqliya-glossary-v1.1.md` — Glossary
9. `docs/official/aqliya-roadmap-v1.1.md` — Roadmap
10. `docs/official/aqliya-agent-context-v1.1.md` — Agent context
11. `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` — Product status (code-evidence based)
12. `docs/source-of-truth/READINESS_GATES.md` — Readiness gates
13. `docs/source-of-truth/EXECUTION_DEPENDENCY_GRAPH.md` — Execution dependencies
14. `docs/source-of-truth/ROUTE_STRATEGY.md` — Route strategy
15. `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` — System taxonomy

### If any document conflicts

1. **For identity, naming, trust principles, governance boundaries, strategic positioning:** Follow `docs/official/*` doctrine docs. These are non-negotiable.
2. **For implementation status:** Inspect current code, schema, routes, actions, seeds, tests, validation reports. Code evidence governs over status claims in docs.
3. **If official docs conflict with proven code reality:** Update the stale official docs and document the correction.
4. **Reports are evidence, not doctrine.**
5. **Theoretical docs are background, not authority.**
6. **Archived docs are historical only.**
7. **Document any conflict resolution.** Do not silently choose an interpretation.

Task backlog: `docs/execution-backlog/v1.2-execution-backlog.md` (gap IDs from `L6_COMPLETION_PROGRAM.md`).

---

## 3. Branching Rules (Director Mode)

**CRITICAL — main only:**

- Work **only** on the current `main` line (local checkout).
- **Never** create feature, experimental, architecture, or POC branches.
- Subagents **must not** create branches.
- Commits are **sequential** (one agent at a time on the working tree).
- PR branches are **out of scope** for Director mode unless the human explicitly exits Director mode.

Before modifying any file: confirm no other agent in the **current cycle** is assigned that path.

---

## 4. Agent Naming (Not Stream Letters)

Do **not** label Cursor agents A/B/C/D — that collides with Streams A–E in `EXECUTION_DEPENDENCY_GRAPH.md`.

| Cursor agent | Scope name |
| ------------ | ---------- |
| Agent-IC | Intelligence Core |
| Agent-Platform | Platform hardening |
| Agent-AuditOS | AuditOS completion |
| Agent-QA | Quality and validation |

---

## 5. File Ownership Matrix

### Agent-IC (Intelligence Core)

**Allowed:**

- `src/lib/ai/**`
- `src/lib/governance/**` (AI governance metrics only — coordinate with Director if security guards overlap)
- `src/app/api/ai/**`

**Work:** AI evals, prompt versioning, cost controls, AI observability (`src/lib/ai/observability.ts`), governance metrics, eval datasets, regression hooks.

**Forbidden:** AuditOS / DecisionOS / LocalContentOS UI; `prisma/**`; `src/middleware.ts`; product routes outside `api/ai`.

### Agent-Platform

**Allowed:**

- `src/lib/auth/**`
- `src/middleware.ts`
- `src/lib/platform/**`
- `src/lib/security/**`
- `src/lib/audit/**` (tenant guards only — not AuditOS UX)
- `src/app/api/health/**`
- `src/app/api/metrics/**`
- `src/app/(dashboard)/monitoring/**` (platform observability UI)

**Work:** Security hardening, sessions, device trust, revocation, RBAC, tenant isolation verification, monitoring.

**Forbidden:** Product features; AI orchestration changes in `src/lib/ai/**`; marketing pages; `src/app/audit/**`.

### Agent-AuditOS

**Allowed:**

- `src/app/audit/**`
- `src/actions/audit-*.ts`
- `src/lib/audit/**`
- `src/components/audit/**`

**Work:** Loading/error boundaries, workflow completion, audit trail UX, pilot readiness UX, export reliability.

**Forbidden:** Platform auth; AI architecture; `prisma/**` unless Director assigns a dedicated schema task outside parallel cycle.

### Agent-QA

**Allowed:**

- `src/__tests__/**`
- `**/__tests__/**`
- `e2e/**`
- `scripts/**` (validation and CI helpers)
- `.github/**`
- `package.json` / `package-lock.json` (only when CI or test deps require it)

**Work:** Integration tests, regression tests, CI validation, readiness scripts, gate snapshots in `docs/operations/PARALLEL_REMEDIATION_GATES.md`.

**Forbidden:** Business logic in `src/lib/**` (except test doubles); feature creation; `prisma/schema.prisma` unless Director assigns explicitly.

### Director-only (never parallelized)

- `prisma/schema.prisma` and migrations
- `docs/official/**`
- `docs/source-of-truth/**` (status updates after cycle, not during agent work)
- Shared files claimed by another agent in the same cycle

### Conflict resolution

| Shared path | Owner |
| ----------- | ----- |
| `package.json` | Agent-QA or Director |
| `src/middleware.ts` | Agent-Platform |
| `src/lib/governance/**` | Agent-IC first; Platform only with Director approval |
| `.github/workflows/*` | Agent-QA (IC-04 eval step: QA wires CI; IC owns eval logic in `src/lib/ai`) |

If an agent needs a file outside its scope: report **BLOCKED** — no workaround architecture.

---

## 6. Dependency Rules

Before any task:

1. Read `EXECUTION_DEPENDENCY_GRAPH.md` §Gate Dependencies and §Parallel Work Streams.
2. Never start a task whose **hard** dependency is incomplete.
3. If blocked: produce a blocked report; do not implement workaround architecture.

**Priority order (investment):**

1. Platform Foundation (L0)
2. Intelligence Core (L0.5)
3. AuditOS (L1)

**Frozen / no expansion** (bugfix-only unless backlog ID explicitly assigned):

- SalesOS, WorkflowOS, Organizations, Office AI expansion, future products.

**Allowed bugfix:** regressions, security holes, build breaks on frozen surfaces.

---

## 7. Architecture Rules

Do **NOT** create:

- New products or business domains
- Duplicate services or parallel frameworks
- Alternate architectures

Always **extend** existing systems. Prefer modification over creation.

---

## 8. Execution Protocol

### 8.1 Pre-flight (Director)

```bash
git status --short
git log --oneline -5
```

Fill `docs/operations/parallel-execution-cycle-template.md` with planned assignments.

Also load: `aqliya-security-gate.md`, `aqliya-low-load-dev.md`.

### 8.2 Subagent dispatch (`Task` tool)

Launch subagents **one at a time** for writes (parallel OK for read-only explore).

Each Task prompt **must** include:

```md
AGENT: Agent-IC | Agent-Platform | Agent-AuditOS | Agent-QA
TASK_ID: e.g. IC-04
OWNERSHIP_ALLOWED: (globs)
OWNERSHIP_FORBIDDEN: (globs)
FILES_ALREADY_CLAIMED: (from prior agents this cycle)
BRANCH: main only — no new branches
DO_NOT: schema (unless stated), other agents' paths, new products
VALIDATION: npx tsc --noEmit (Agent-QA may run full suite with human approval)
OUTPUT: files touched, validation evidence, blockers
```

### 8.3 Merge sequence on main

```
1. Agent-IC      → changes → tsc
2. Agent-Platform → changes → tsc
3. Agent-AuditOS  → changes → tsc
4. Agent-QA       → CI/tests/docs snapshot → full validation (if approved)
```

Director reviews `git diff` after each step before the next agent runs.

### 8.4 Validation policy

| Agent | Default validation |
| ----- | ------------------ |
| Agent-IC, Platform, AuditOS | `npx tsc --noEmit` |
| Agent-QA | `npx tsc --noEmit`, `npm run lint -- --quiet`, `npm test`, `npm run build` — **only with explicit human approval** |

Never claim completion without command evidence.

---

## 9. Definition of Done (cycle)

A cycle is complete only when:

- No architectural violations
- No duplicate implementations
- No cross-agent file conflicts in the final diff
- Validation row in the cycle template is honest
- Dependency check marked passed or blocked with reason

---

## 10. Required Output Format

After each cycle, produce:

## Agent Assignments

**Agent-IC:** task, files

**Agent-Platform:** task, files

**Agent-AuditOS:** task, files

**Agent-QA:** task, files

## Dependency Check

passed | blocked — (gates: G0, G1, …)

## Files Modified

(list all paths)

## Risks

(architectural risks)

## Validation Status

| Check | Result | Evidence |
| ----- | ------ | -------- |
| TypeScript | | |
| Lint | | |
| Tests | | |
| Build | | |

**Status:** DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT

---

---

> **Historical cycles (Cycles 2-15) extracted to docs/operations/ per Wave C refactor (2026-07-12).**
