# AQLIYA — AI Reading Profiles

> **Purpose:** Define the mandatory reading, optional reading, skip list, and recommended workflow for each AI tool that may work on the AQLIYA repository.
>
> **Status:** Active | **Version:** 1.0 | **Date:** 2026-06-26 | **Owner:** Documentation Team | **Last Reviewed:** 2026-06-26

---

## How to Use These Profiles

1. Find your AI tool below
2. Read the **Mandatory** files in order (these are session-start requirements)
3. Consult **Optional** files based on task type
4. Respect the **Skip** list — these files should not be read
5. Follow the **Recommended Workflow**

---

## Profile: ChatGPT

| Aspect | Guidance |
|--------|----------|
| **Role** | Conversational assistant, code generation, analysis |
| **Context window** | Large (128K-1M tokens depending on version) |
| **Strength** | Broad reasoning, can handle full file inventory |

### Mandatory Reading

| # | File | Why |
|---|------|-----|
| 1 | `docs/AI_ENTRYPOINT.md` | Entry point — platform identity and navigation |
| 2 | `docs/DOCUMENTATION_AUTHORITY.md` | Conflict resolution rules |
| 3 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Platform identity and product list |
| 4 | `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` | Current operational truth |
| 5 | `docs/AI_KNOWLEDGE_MAP.md` | Full documentation inventory |

### Optional Reading

| When | File |
|------|------|
| Architecture work | `docs/official/aqliya-core-architecture-v1.1.md` |
| Product work | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` |
| Governance | `AGENTS.md` (key sections), `docs/DOCUMENTATION_GOVERNANCE_v2.md` |
| Commercial | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` |
| Deployment | `runbooks/README.md` |

### Skip

- `docs/archive/**` (historical only)
- `docs/theoretical-reference/**` (background only)
- Root-level stale reports (`BUILD_FAILURE_MATRIX.md`, etc.)
- Binary files (`.docx`, `.pptx`, `.xlsx`, `.pdf`)
- `desktop.ini` files

### Recommended Workflow

1. Read entrypoint + authority → understand platform identity
2. Read current state → understand project status
3. Read knowledge map → find relevant docs
4. Read domain-specific docs as needed
5. Always validate commercial claims against `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md`

---

## Profile: Claude Code

| Aspect | Guidance |
|--------|----------|
| **Role** | Primary AI agent for AQLIYA development |
| **Context window** | Large (200K tokens) |
| **Strength** | Reasoning, security awareness, multi-step tasks |

### Mandatory Reading

| # | File | Why |
|---|------|-----|
| 1 | `docs/AI_ENTRYPOINT.md` | Entry point |
| 2 | `docs/DOCUMENTATION_AUTHORITY.md` | Authority hierarchy |
| 3 | `AGENTS.md` | Full agent operating contract (1767 lines) |
| 4 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Platform identity |
| 5 | `docs/official/aqliya-vision-v1.1.md` | Strategic direction |
| 6 | `docs/official/aqliya-product-taxonomy-v1.1.md` | Product boundaries |
| 7 | `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` | Operational truth |
| 8 | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | Product status |
| 9 | `docs/source-of-truth/ROUTE_STRATEGY.md` | Route architecture |
| 10 | `docs/official/aqliya-implementation-rules-v1.1.md` | Implementation constraints |
| 11 | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` | Commercial boundaries |
| 12 | `docs/AI_KNOWLEDGE_MAP.md` | Documentation navigation |
| 13 | `README.md` | Project setup |

### Optional Reading

| When | File |
|------|------|
| Security work | `.skills/aqliya/aqliya-security-gate.md` |
| Demo work | `.skills/aqliya/aqliya-demo-safety.md` |
| Architecture work | `docs/official/aqliya-core-architecture-v1.1.md` |
| Skill context | .skills/aqliya/ (individual skill files) |
| Release | `.skills/aqliya/aqliya-release-checklist.md` |
| Product completion | `.skills/aqliya/aqliya-product-completion.md` |

### Skip

- `CLAUDE.md` (outdated, superseded by AGENTS.md)
- `docs/DOCUMENTATION_GOVERNANCE.md` (superseded by v2)
- `docs/archive/**` for current work
- Root-level stale reports

### Recommended Workflow

1. **Session start:** Read mandatory files 1-13
2. **Task classification:** Classify task using AGENTS.md §34
3. **Skill loading:** Load relevant skill from `.skills/aqliya/` (see AGENTS.md §32 for auto-load rules)
4. **Security gate:** Always load security gate for routes/auth
5. **Pre-flight audit:** Run `git log -10`, `git diff --stat`
6. **Validate:** `npx tsc --noEmit`, `npm run lint`, `npm run build`
7. **Report:** Use AGENTS.md §25 format

---

## Profile: OpenCode

| Aspect | Guidance |
|--------|----------|
| **Role** | Autonomous agent executing against AGENTS.md contract |
| **Context window** | Large |
| **Strength** | Multi-agent orchestration, documentation governance |

### Mandatory Reading

| # | File | Why |
|---|------|-----|
| 1 | `docs/AI_ENTRYPOINT.md` | Entry point |
| 2 | `docs/DOCUMENTATION_AUTHORITY.md` | Authority hierarchy |
| 3 | `AGENTS.md` | Agent operating contract (all sections) |
| 4 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Platform identity |
| 5 | `docs/official/aqliya-vision-v1.1.md` | Strategic direction |
| 6 | `docs/official/aqliya-product-taxonomy-v1.1.md` | Product boundaries |
| 7 | `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` | Operational truth |
| 8 | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | Product status |
| 9 | `docs/DOCUMENTATION_GOVERNANCE_v2.md` | Documentation lifecycle rules |
| 10 | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` | Commercial boundaries |
| 11 | `docs/AI_KNOWLEDGE_MAP.md` | Documentation inventory |

### Optional Reading

| When | File |
|------|------|
| Creating documentation | `docs/DOCUMENTATION_GOVERNANCE_v2.md` |
| Architecture decisions | `docs/official/aqliya-core-architecture-v1.1.md` |
| Route planning | `docs/source-of-truth/ROUTE_STRATEGY.md` |
| AI feature work | `docs/official/aqliya-agent-context-v1.1.md`, `docs/official/aqliya-skill-context-v1.1.md` |

### Skip

- `CLAUDE.md` (outdated)
- `docs/DOCUMENTATION_GOVERNANCE.md` (superseded by v2)
- `docs/archive/**` for current work
- Root-level stale reports

### Recommended Workflow

Follow AGENTS.md §8 Execution Lifecycle:
1. **Discover** — inspect files, read official docs
2. **Plan** — create execution plan
3. **Implement** — smallest complete set of changes
4. **Validate** — run required checks
5. **Document** — update docs
6. **Report** — use §25 format

---

## Profile: Cursor

| Aspect | Guidance |
|--------|----------|
| **Role** | IDE-integrated AI for code editing |
| **Context window** | Medium-large |
| **Strength** | In-file editing, real-time linting |

### Mandatory Reading

| # | File | Why |
|---|------|-----|
| 1 | `docs/AI_ENTRYPOINT.md` | Entry point |
| 2 | `docs/DOCUMENTATION_AUTHORITY.md` | Authority hierarchy |
| 3 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Platform identity |
| 4 | `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` | Current state |
| 5 | `README.md` | Project setup |
| 6 | `AGENTS.md` (key sections) | Operating rules |

### Optional Reading

| When | File |
|------|------|
| Editing code | `docs/official/aqliya-implementation-rules-v1.1.md` |
| Product work | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` |
| Architecture | `docs/official/aqliya-core-architecture-v1.1.md` |
| Security | `.skills/aqliya/aqliya-security-gate.md` |

### Skip

- Full `docs/archive/`
- Root-level reports
- `docs/theoretical-reference/`

### Recommended Workflow

1. Read entrypoint + authority + current state for context
2. Open relevant code files
3. Reference product status and architecture docs for context
4. Edit code with `AGENTS.md` rules in mind
5. Run `npx tsc --noEmit` to validate

---

## Profile: Codex (GitHub Copilot)

| Aspect | Guidance |
|--------|----------|
| **Role** | Inline code completion and generation |
| **Context window** | Limited (varies) |
| **Strength** | Real-time suggestions, low latency |

### Mandatory Reading (Summarized)

Codex has limited context. Provide these summaries as system prompts:

1. AQLIYA is a Private Governed Institutional Intelligence Platform
2. Trust principle: AI assists. Humans decide. Evidence governs.
3. Stack: Next.js 16, TypeScript strict, PostgreSQL, Prisma, NextAuth v5
4. Arabic-first, RTL layouts
5. No client-side Prisma imports
6. Every mutation must be audited

### Optional Reading

Not applicable — Codex works at the function/file level.

### Skip

Everything except summarized context above.

### Recommended Workflow

- Provide summarized context in a file named .github/copilot-instructions.md (create if needed for your fork)
- Codex handles inline suggestions only
- Every suggestion must be reviewed before acceptance
- Validate with `npx tsc --noEmit` after accepting

---

## Profile: Gemini

| Aspect | Guidance |
|--------|----------|
| **Role** | Long-context analysis, research, non-sensitive tasks |
| **Context window** | Very large (1M+ tokens) |
| **Strength** | Can ingest entire docs/ directory |

### Mandatory Reading

| # | File | Why |
|---|------|-----|
| 1 | `docs/AI_ENTRYPOINT.md` | Entry point |
| 2 | `docs/DOCUMENTATION_AUTHORITY.md` | Authority hierarchy |
| 3 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Platform identity |
| 4 | `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` | Current state |
| 5 | `docs/AI_KNOWLEDGE_MAP.md` | Full inventory |

### Optional Reading

| When | File |
|------|------|
| Comprehensive analysis | All `docs/official/`, all `docs/source-of-truth/` |
| Product deep-dive | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` |
| Architecture analysis | All architecture docs |

### Skip

- `docs/archive/**` (historical only)
- `docs/theoretical-reference/**`
- Binary files

### Security Note

**Gemini must not receive:**
- Auth logic, session handling, tokens
- RBAC or tenant isolation code
- Database schema or migration contents
- Secrets, API keys, environment variables
- Production data or customer records
- Security-sensitive route logic

Per AGENTS.md §37.4 External Toolchain Policy.

### Recommended Workflow

1. Ingest full `docs/AI_KNOWLEDGE_MAP.md` for navigation
2. Read entrypoint + current state for task context
3. Read domain-specific docs from inventory
4. Return analysis with citations
5. Do not write code — analysis only per policy

---

## Cross-Profile Reference

| Aspect | ChatGPT | Claude Code | OpenCode | Cursor | Codex | Gemini |
|--------|---------|-------------|----------|--------|-------|--------|
| **Reads AGENTS.md fully** | Optional | ✅ Mandatory | ✅ Mandatory | Key sections only | No | No |
| **Reads AI_ENTRYPOINT.md** | ✅ Mandatory | ✅ Mandatory | ✅ Mandatory | ✅ Mandatory | No | ✅ Mandatory |
| **Reads source-of-truth** | ✅ Mandatory | ✅ Mandatory | ✅ Mandatory | ✅ Mandatory | No | ✅ Optional |
| **Can write code** | Yes | Yes | Yes | Yes | Yes | No |
| **Security-sensitive allowed** | Yes | Yes | Yes | Yes | No | No |
| **Reads commercial docs** | ✅ Optional | ✅ Mandatory | ✅ Mandatory | No | No | Optional |

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-26 | Initial creation — AI Reading Profiles v1.0 | OpenCode |

---
