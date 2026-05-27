# AQLIYA OpenCode Operating System v0.1

> **Status:** Official — Agent Operating Protocol  
> **Purpose:** Define how OpenCode (and AI coding agents) operate on the AQLIYA repository with discipline, governance, and evidence-based execution.

---

## 1. Why Skills?

The AQLIYA repository is complex. It contains:

- Multiple products (AuditOS, LocalContentOS, DecisionOS, SalesOS, etc.)
- Governance requirements (RBAC, audit logs, evidence, review/approval)
- Security constraints (tenant isolation, auth middleware, demo safety)
- Documentation hierarchy (doctrine docs, source-of-truth, reports)
- Command discipline (low-load protocol, migration safety)

Without operating skills, an AI agent will:

- Run heavy commands unnecessarily
- Break auth or security configuration
- Contradict high-authority documents
- Leave products as incomplete demos
- Skip validation and reporting

Skills solve this by providing **context-specific operating instructions** that auto-load based on task description.

---

## 2. How OpenCode Operates on AQLIYA

### Execution Flow

```
User Task
    │
    ▼
┌─────────────────────────────┐
│ 1. Task Classification       │ ← Load aqliya-opencode-agent
│    - Product/system          │
│    - Task type               │
│    - Current level           │
│    - Target level            │
│    - Data/route/governance   │
│    - Validation plan         │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 2. Skill Auto-Load           │
│    - Match task → skill      │
│    - Load ALL matching       │
│    - Default: opencode-agent │
│    - Always: security-gate   │
│      if routes/data touched  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 3. Context Gathering         │
│    - git log, git status     │
│    - Official docs read      │
│    - Existing patterns       │
│    - Protected files check   │
│    - Pre-existing errors     │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 4. Gate Check                │
│    - Security gate?          │
│    - Demo gate?              │
│    - Docs gate?              │
│    - Release gate?           │
│    - Any gate fails → STOP   │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 5. Implement                  │
│    - Smallest complete set    │
│    - Existing architecture    │
│    - End-to-end, not just UI  │
│    - Governance included      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 6. Validate (light)          │
│    - npx tsc --noEmit        │
│    - Check for new errors    │
│    - Verify routes           │
│    - Report results          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 7. Document                   │
│    - Update product status    │
│    - Update doc references    │
│    - Sync with code reality   │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│ 8. Report                     │
│    - Summary                  │
│    - Files changed            │
│    - Governance check         │
│    - Validation results       │
│    - Known limitations        │
│    - Next step                │
└─────────────────────────────┘
```

---

## 3. Skill Map

| Skill File                     | When Auto-Loaded                    | Purpose                                        |
| ------------------------------ | ----------------------------------- | ---------------------------------------------- |
| `aqliya-low-load-dev.md`       | Heavy commands, RAM issues, builds  | Prevent resource abuse, enforce approval gates |
| `aqliya-security-gate.md`      | Routes, auth, data, middleware      | Protect auth/tenant/audit integrity            |
| `aqliya-docs-authority.md`     | Doc changes, conflicts, status      | Maintain doc hierarchy and truth               |
| `aqliya-demo-safety.md`        | `/auditos` touches                  | Protect public demo from data leaks            |
| `aqliya-product-completion.md` | Product work, feature additions     | Enforce v0.1 DoD, prevent demos                |
| `aqliya-release-checklist.md`  | Releases, deployments               | Verify pre-flight readiness                    |
| `aqliya-opencode-agent.md`     | Default, task start, agent behavior | Guide agent discipline and reporting           |

### Selection Algorithm

1. Parse task description → match keywords against skill `description` fields
2. Load all matching skills (multiple can apply)
3. If no match → load `aqliya-opencode-agent.md`
4. If routes/data/auth touched → always load `aqliya-security-gate.md`
5. Apply skill rules as constraints during execution

---

## 4. Command Discipline

### Light (always allowed)

Commands that are fast, non-destructive, and require no approval.

| Command                     | When             |
| --------------------------- | ---------------- |
| `npx tsc --noEmit`          | TypeScript check |
| `npm run lint -- --quiet`   | Quick lint       |
| `npx prettier --check`      | Format check     |
| `npx prisma validate`       | Schema syntax    |
| `git status/diff/log`       | Git inspection   |
| Read, grep, glob operations | File inspection  |

### Medium (justify)

Commands that consume moderate resources or have side effects.

| Command               | Justification Required         |
| --------------------- | ------------------------------ |
| `npm run build`       | After server-affecting changes |
| `npm test -- <file>`  | Testing specific module        |
| `npx prisma generate` | After schema changes           |

### Heavy (approval required)

Commands that are destructive, expensive, or change dependencies.

| Command                  | Approval Needed Because        |
| ------------------------ | ------------------------------ |
| `npm run build` (full)   | Resource-heavy, long execution |
| `npm run lint` (full)    | May produce large errors list  |
| `npm test` (full suite)  | Very long execution            |
| `npx prisma migrate dev` | Destructive DB changes         |
| `npm install`            | Dependency changes             |

---

## 5. Evidence & Reporting

Every task must produce a final report with:

- **Summary** — what was done
- **Product/System affected** — name, area, levels
- **Files changed** — paths and what changed
- **Governance check** — RBAC, tenant, evidence, audit, review, export, AI boundary
- **Validation** — commands and results (never omit)
- **Known limitations** — what remains
- **Next step** — one clear recommendation

### Completion Statuses

| Status             | Meaning                            |
| ------------------ | ---------------------------------- |
| DONE               | Completed with evidence            |
| DONE_WITH_CONCERNS | Completed, but list concerns       |
| BLOCKED            | Cannot proceed; state blocker      |
| NEEDS_CONTEXT      | Missing info; state what is needed |

---

## 6. Example Task Flows

### Example 1: Bug Fix on AuditOS

**Task:** "The trial balance upload button shows error for all users"

**Classification:**

- Product: AuditOS
- Type: Bug fix
- Level: L5 (pilot-ready, fix a bug)
- Data: Read-only (inspect queries)
- Route: No change
- Governance: No change

**Skills Loaded:**

- `aqliya-security-gate` (routes/data touched)
- `aqliya-opencode-agent` (default)

**Execution:**

1. Check recent git history for upload changes
2. Read the upload Server Action
3. Identify the error (e.g., missing `organizationId` filter)
4. Fix (add filter)
5. Validate: `npx tsc --noEmit`
6. Report: what was wrong, what was fixed, affected files

### Example 2: LocalContentOS Completion

**Task:** "Complete LocalContentOS supplier management"

**Classification:**

- Product: LocalContentOS
- Type: Product completion
- Current Level: L3 (prototype)
- Target Level: L4 (v0.1)
- Data: Schema change likely
- Route: Route additions
- Governance: RBAC, audit logs needed

**Skills Loaded:**

- `aqliya-product-completion` (primary)
- `aqliya-security-gate` (routes/data)
- `aqliya-docs-authority` (status matrix update)
- `aqliya-opencode-agent` (default)

**Execution:**

1. Read LocalContentOS DoD (AGENTS.md §21.3)
2. Assess current state against DoD
3. Identify gaps: no audit trail, no RBAC, no exports
4. Fill gaps in order: governance → persistence → UI
5. Update schema if needed (with approval)
6. Validate with light commands
7. Update PRODUCT_STATUS_MATRIX.md
8. Report

### Example 3: Doc Update Only

**Task:** "Update README to add sales product"

**Classification:**

- Product: Platform identity
- Type: Documentation
- Data: None
- Route: None
- Governance: None

**Skills Loaded:**

- `aqliya-docs-authority` (primary)
- `aqliya-opencode-agent` (default)

**Execution:**

1. Read docs authority hierarchy
2. Check commercial truthfulness rules
3. Verify sales product status before claiming
4. Update README
5. Check for stale references
6. Report

---

## 7. Protected Files

| File                                | Why Protected                                      |
| ----------------------------------- | -------------------------------------------------- |
| `prisma/schema.prisma`              | DB schema — migration impact                       |
| `src/middleware.ts`                 | Auth/proxy — breaking this breaks login            |
| `src/auth.ts` + `src/app/api/auth/` | Auth configuration                                 |
| `.env`, `.env.example`              | Secrets structure                                  |
| `next.config.mjs`                   | Build/redirect/header config                       |
| `docker-compose.yml`, `Dockerfile`  | Deployment config                                  |
| `AGENTS.md`                         | Agent operating contract — must sync documentation |

---

## 8. Forbidden Without Explicit Report

- Changing auth bypass on any route
- Removing `organizationId` filter
- Exposing download routes without permission checks
- Adding public API for private data
- Removing audit event logging
- Modifying middleware rewrite/proxy rules
- Exposing env vars to client bundle
- Running migrations without approval
- Modifying Prisma schema for speculative features

---

## 9. Relationship to Other Docs

| Doc                                          | Relationship                                                       |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `AGENTS.md`                                  | Master operating contract — supersedes this doc for agent behavior |
| `.skills/aqliya/*.md`                        | Skill implementations — this doc explains the skill system         |
| `docs/DOCUMENTATION_AUTHORITY.md`            | Doc hierarchy — this doc is official operating protocol            |
| `docs/official/aqliya-agent-context-v1.1.md` | Agent context — this doc is the operating system reference         |
| `docs/reports/`                              | Evidence reports — this doc is not a report                        |
