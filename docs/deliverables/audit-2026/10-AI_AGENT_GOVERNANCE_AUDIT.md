# AI AGENT GOVERNANCE AUDIT — AQLIYA
**Date:** 2026-06-20  
**Scope:** AGENTS.md, CLAUDE.md, .cursor/, .opencode/, .skills/, .claude/

---

## 1. Configuration Files Inventory

| File | Target Agent | Lines | Primary Function |
|------|-------------|-------|-----------------|
| `AGENTS.md` | OpenCode (primary) | 1,767 | Operating contract |
| `CLAUDE.md` | Claude (secondary) | 241 | Session instructions |
| `.cursor/rules/aqliya-parallel-director.mdc` | Cursor | 37 | Parallel execution rule |
| `.cursor/hooks.json` | Cursor | — | Heavy command blocker |
| `.cursor/hooks/block-heavy-commands.ps1` | Cursor | — | PS1 blocker script |
| `.cursor/hooks/block-heavy-commands.sh` | Cursor | — | Bash blocker script |
| `.skills/aqliya/aqliya-opencode-agent.md` | OpenCode | 257 | Default operating skill |
| `.skills/aqliya/aqliya-low-load-dev.md` | OpenCode/Cursor | 132 | Low-load protocol |
| `.skills/aqliya/aqliya-security-gate.md` | OpenCode/Cursor | 141 | Security enforcement |
| `.skills/aqliya/aqliya-docs-authority.md` | OpenCode/Cursor | 126 | Docs hierarchy |
| `.skills/aqliya/aqliya-demo-safety.md` | OpenCode/Cursor | 148 | Demo constraints |
| `.skills/aqliya/aqliya-product-completion.md` | OpenCode/Cursor | 146 | DoD enforcement |
| `.skills/aqliya/aqliya-release-checklist.md` | OpenCode/Cursor | 167 | Release gates |
| `.skills/aqliya/aqliya-parallel-director.md` | Cursor | 417 | Program Director |
| `.skills/registry/index.yaml` | All | — | Skill index |
| `.skills/governance/access-policies.yaml` | All | — | RBAC for skills |
| `.skills/governance/lifecycle-policies.yaml` | All | — | Skill lifecycle |

## 2. Answer Key Questions

### Q1: Do Claude, Cursor, and OpenCode operate with the same truth?

| Dimension | Agreement | Notes |
|-----------|-----------|-------|
| AQLIYA identity | ✅ Consistent | All use "Private Governed Institutional Intelligence Platform" |
| Trust principle | ✅ Consistent | "AI assists. Humans decide. Evidence governs." |
| Stack assumptions | ✅ Consistent | Next.js 16, Prisma 7, TypeScript 5, PostgreSQL |
| L0-L6 framework | ✅ Consistent | All reference the same completion levels |
| Governance requirements | ✅ Consistent | RBAC, audit trail, evidence, review/approval |
| Low-load protocol | ✅ Consistent | Same light/medium/heavy classification |
| Report format | ⚠️ Slightly different | AGENTS.md §25 vs CLAUDE.md required format |
| Authority hierarchy | ⚠️ **CONFLICT** | See Q3 |

**Verdict:** Mostly consistent. One significant authority hierarchy conflict.

### Q2: Are there conflicting instructions?

| Conflict | Sources | Impact |
|----------|---------|--------|
| **Authority priority** | `aqliya-parallel-director.md` §2 puts `PRODUCT_STATUS_MATRIX.md` first; AGENTS.md §2 puts `DOCUMENTATION_AUTHORITY.md` + `docs/official/*` first | **HIGH** — could lead to wrong decisions |
| **Section numbering** | AGENTS.md jumps from §35 to §37, then §36 after §37 | **LOW** — cosmetic |
| **Product status** | CLAUDE.md has L-levels in taxonomy; AGENTS.md has handling rules without levels | **MEDIUM** — inconsistency |
| **Command thresholds** | Cursor hooks **deny** heavy commands; AGENTS.md says "require approval" | **LOW** — hooks are stricter (safe) |

### Q3: Is there Prompt Drift?

| Source | Original Intent | Current State | Drift |
|--------|----------------|---------------|-------|
| AGENTS.md | Primary contract for all agents | Has grown to 37 sections | ⚠️ Some sections feel appended (Cursor Cloud, Toolchain) |
| CLAUDE.md | Secondary reviewer | References docs that may be out of sync | ⚠️ Product taxonomy table needs update |
| `.skills/` | Skills augment AGENTS.md | One skill (`parallel-director`) contradicts AGENTS.md | **DRIFT DETECTED** |
| `.cursor/hooks` | Block heavy commands | Working correctly | ✅ No drift |

### Q4: Is there Authority Conflict?

| Source | Claims Highest Authority For | Actual Highest Authority |
|--------|------------------------------|-------------------------|
| AGENTS.md §2 | `DOCUMENTATION_AUTHORITY.md` → `docs/official/*` | ✅ Correct |
| `aqliya-docs-authority.md` §1 | `DOCUMENTATION_AUTHORITY.md` → `docs/official/*` | ✅ Consistent |
| `aqliya-parallel-director.md` §2 | `PRODUCT_STATUS_MATRIX.md` | ❌ **CONFLICT** |
| `.cursor/rules/aqliya-parallel-director.mdc` | Inherits from skill | ❌ **INHERITED CONFLICT** |

**Resolution needed:** Update `.skills/aqliya/aqliya-parallel-director.md` §2 to align with AGENTS.md §2 hierarchy.

### Q5: Are there expired/stale files still in use?

| File | Age | Still Referenced? | Risk |
|------|-----|-------------------|------|
| `AQIYA_ROADMAP_v1.1.md` | Outdated (v1.2 exists) | Possibly by older configs | MEDIUM |
| `docs/archive/` root duplicates | Legacy | In AGENTS.md archive section | LOW |
| `.claude/worktrees/*` | Session snapshots | Not active config | LOW |
| `.opencode/` | Never created | Referenced in `.cursorignore` | LOW |

### Q6: Do agents read outdated documents?

| Agent | Document Referenced | Current Version? |
|-------|-------------------|------------------|
| AGENTS.md §2 | `aqliya-roadmap-v1.1.md` | ❌ v1.2 exists |
| CLAUDE.md | `docs/source-of-truth/ROUTE_REGISTRY.md` | ⚠️ Needs sync |
| CLAUDE.md | `docs/source-of-trout/READINESS_GATES.md` | ⚠️ Typo in path ("trout" vs "truth") |

### Q7: Do agents work from outdated or superseded roadmaps?

| Agent | Roadmap Used | Status |
|-------|-------------|--------|
| AGENTS.md | References v1.1 | ⚠️ Should update to v1.2 |
| CLAUDE.md | References roadmap docs | ✅ Implicit |
| Skills | Not specifically | ✅ Recent |

## 3. Hard Stop Conditions Check

| Condition | Status | Notes |
|-----------|--------|-------|
| AQLIYA reduced to AuditOS-only | ✅ Not happening | Multiple products in code |
| AQLIYA described as SaaS-only | ✅ Not happening | Private/On-Prem in docs |
| AI output makes final decisions | ✅ Not implemented | Human review enforced |
| Missing tenant/permission strategy | ✅ Covered | Consistent patterns |
| Mutation without audit trail | ✅ Not found | All products have audit events |

## 4. Conflict Resolution Recommendation

The most critical finding is the **authority hierarchy conflict** between the Parallel Director skill and AGENTS.md. 

**Recommended fix:**
1. In `.skills/aqliya/aqliya-parallel-director.md`, change §2 from:
   ```
   1. PRODUCT_STATUS_MATRIX.md
   2. AQLIYA_ARCHITECTURE.md
   ...
   ```
   To:
   ```
   1. docs/DOCUMENTATION_AUTHORITY.md + docs/official/* (for identity/governance)
   2. PRODUCT_STATUS_MATRIX.md (for product status)
   3. AQLIYA_ARCHITECTURE.md (for architecture)
   ...
   ```
2. Update the Cursor rule to reference the corrected skill
3. Add a note clarifying that skills do not override AGENTS.md

## 5. Overall AI Governance Score

| Dimension | Score | Notes |
|-----------|-------|-------|
| Configuration consistency | 7/10 | One significant conflict |
| Authority hierarchy clarity | 6/10 | Conflict needs resolution |
| Coverage completeness | 9/10 | All agents have instructions |
| Protection against drift | 5/10 | No automated drift detection |
| Skill system maturity | 8/10 | Comprehensive but one conflict |
| Lockdown effectiveness | 9/10 | Hooks work, low-load enforced |
| **Overall** | **7.3/10** | **Good, but conflict must be resolved** |
