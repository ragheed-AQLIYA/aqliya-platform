# AQLIYA Skills Refactor Plan

**Date:** 2026-07-12
**Author:** Skills Auditor Agent
**Status:** DONE — Awaiting human approval before implementation
**Predecessor:** `SKILLS_AUDIT.md` (this directory)

---

## 1. Proposed Target Architecture

### Current State (8 skills, 1,548 lines)

```
.skills/aqliya/
├── aqliya-demo-safety.md          (148L)  SRP: 5  ★★★ dup with security-gate §5
├── aqliya-docs-authority.md        (126L)  SRP: 4
├── aqliya-low-load-dev.md          (132L)  SRP: 5  ★ dup with security-gate
├── aqliya-opencode-agent.md        (257L)  SRP: 2  ★★★ dup with AGENTS.md
├── aqliya-parallel-director.md     (431L)  SRP: 3  NOT in skill map; 25% historical
├── aqliya-product-completion.md    (146L)  SRP: 4
├── aqliya-release-checklist.md     (167L)  SRP: 4
└── aqliya-security-gate.md         (141L)  SRP: 3  ★★★ dup with demo-safety §5
```

### Target State (8 skills, ~1,200 lines)

```
.skills/aqliya/
├── aqliya-demo-safety.md           (~130L)  Trim: remove now-covered auth rules
├── aqliya-docs-authority.md         (~110L)  Trim: remove hardcoded skill list
├── aqliya-low-load-dev.md           (~120L)  Trim: remove duplicate protected files
├── aqliya-opencode-agent.md         (~80L)   CUT: reduce to thin task router only
├── aqliya-product-completion.md     (~130L)  Keep: minor clarifications
├── aqliya-release-checklist.md      (~140L)  Keep: add deployment steps
├── aqliya-security-gate.md          (~100L)  CUT: remove demo §5; delegate to demo-safety
├── aqliya-ai-feature-gate.md        (~100L)  NEW: AI feature rules from AGENTS.md §12
├── aqliya-data-discipline.md        (~100L)  NEW: Prisma discipline from AGENTS.md §13
├── aqliya-export-gate.md            (~80L)   NEW: Export/file/evidence rules from §17
└── aqliya-parallel-director.md      (~150L)  CUT: extract cycles to ops; register in map

Extracted to docs/operations/:
├── parallel-execution-cycles-archive.md   (historical cycles 2-15)
└── parallel-execution-director.md         (already exists as human reference)
```

---

## 2. Skills to Merge

| Merge | Rationale | New Name | Priority |
|---|---|---|---|
| NONE recommended | Overlaps are duplication, not shared purpose. De-duplicate by trimming, not merging. Merging would violate SRP. | — | — |

**Decision:** Merging skills is NOT recommended. The overlaps are instances of content duplication (same text in two files), not conceptual overlap (two skills doing the same thing). The correct fix is deduplication: each skill keeps its unique content, delegates to the authoritative skill for shared content.

---

## 3. Skills to Split

| Split | Rationale | New Skills | Priority |
|---|---|---|---|
| `aqliya-parallel-director.md` (431L) | 25% is historical cycle records, 25% is reusable protocol. Split to keep skill lean and operational records in docs. | `aqliya-parallel-director.md` (trimmed to ~150L of reusable protocol) + `docs/operations/parallel-execution-cycles-archive.md` (historical cycles 2-15) | Wave 2 |
| `aqliya-opencode-agent.md` (257L) | Acts as both a skill-loading router AND a task execution protocol. Split concerns. | `aqliya-opencode-agent.md` (trimmed to ~80L task router only — classification header, skill matching, report format) — execution protocol already exists in AGENTS.md §8 | Wave 1 |

---

## 4. New Skills to Create

| New Skill | Rationale | Priority | Source Material |
|---|---|---|---|
| `aqliya-ai-feature-gate.md` | AGENTS.md §12 (12 AI rules) is not loadable as a skill. AI features are high-risk and need a dedicated gate. | **Wave 1 (Critical)** | AGENTS.md §12, `docs/official/aqliya-implementation-rules-v1.1.md` |
| `aqliya-data-discipline.md` | AGENTS.md §13 (Prisma discipline) governs all schema changes. Destructive migrations need a loadable gate. | **Wave 1 (Critical)** | AGENTS.md §13, `prisma/schema.prisma` conventions |
| `aqliya-export-gate.md` | Export/evidence/file rules (§17) are governance-critical but have no dedicated skill. | **Wave 2** | AGENTS.md §17, existing export utilities in `src/lib/platform/export.ts` |
| `aqliya-bilingual-ux.md` | Arabic-first UX (§16) is a core identity tenet with zero skill enforcement. | **Wave 3** | AGENTS.md §16, existing RTL/i18n patterns |
| `aqliya-external-toolchain.md` | AGENTS.md §37 is 300+ lines of detailed toolchain policy with no loadable skill. MCP permissions, provider routing, command restrictions all need a gate. | **Wave 2** | AGENTS.md §37, existing low-load-dev classifications |

### Skill Map Update (AGENTS.md §32)

After refactor, the skill map table will grow from 7 to 10 entries:

| Skill File | Auto-Load When Task Involves | Change |
|---|---|---|
| `aqliya-low-load-dev.md` | Heavy commands, permission gates, RAM issues | Unchanged |
| `aqliya-security-gate.md` | Auth, security, middleware, API routes, downloads | Trimmed |
| `aqliya-docs-authority.md` | Documentation updates, conflicts, status matrix | Trimmed |
| `aqliya-demo-safety.md` | `/auditos` demo route, public access, mock data | Trimmed |
| `aqliya-product-completion.md` | Product completion, v0.1 gates, DoD enforcement | Unchanged |
| `aqliya-release-checklist.md` | Release, deployment, pre-flight verification | Enhanced |
| `aqliya-opencode-agent.md` | Agent behavior, task classification, reporting | **Cut by 70%** |
| `aqliya-ai-feature-gate.md` | AI features, model calls, AI output, evidence | **NEW** |
| `aqliya-data-discipline.md` | Schema changes, migrations, seeds, Prisma | **NEW** |
| `aqliya-export-gate.md` | File uploads, downloads, PDF/XLSX exports, evidence | **NEW** |
| `aqliya-parallel-director.md` | Parallel execution, multi-agent coordination | **Trimmed + registered** |

---

## 5. Skills to Deprecate

| Skill | Reason | Replacement |
|---|---|---|
| None recommended | All 8 skills serve valid purposes. The issue is content quality, not relevance. | — |

---

## 6. Implementation Waves

### Wave 1 (Critical — 4 changes)

**Goal:** Fix duplication, fill AI/data gaps, trim the bloated default skill.

#### 1.1 Trim `aqliya-opencode-agent.md` (257 → ~80 lines)

**Remove:**
- §1 (Identity & Role): duplicates AGENTS.md §0 — remove, add 1-line reference
- §3 (Context Gathering): duplicates AGENTS.md §31.3 — replace with 1-line reference
- §4 (Preventing Random Modifications): duplicates security-gate §2-3 and low-load-dev §3 — remove, delegate
- §5 (Execution Protocol): duplicates AGENTS.md §8 — replace with 1-line reference
- §7 (Completion Statuses): duplicates AGENTS.md §31.4 — keep the table, remove prose
- §8 (Hard Stops): duplicates AGENTS.md §23 — replace with 1-line reference
- §9 (Evidence & Reporting): duplicates AGENTS.md §11 — replace with 1-line reference
- §10 (Skill Directory Layout): remove entirely — AGENTS.md §32 is the canonical map

**Keep:**
- §2 (Starting a Task): classification header + skill matching table — this is unique
- §6 (Final Report Format): unique to this skill, keep

**Result:** ~80 lines of unique content. Lightweight default skill that routes to specifics.

#### 1.2 Trim `aqliya-security-gate.md` (141 → ~100 lines)

**Remove:**
- §5 (Demo Route Safety, lines 119-129): duplicates `demo-safety.md` Rules 1-7. Replace with: `> For demo route safety rules, load aqliya-demo-safety.md.`

**Result:** 100 lines. Clear single responsibility.

#### 1.3 Create `aqliya-ai-feature-gate.md` (~100 lines)

Extract from AGENTS.md §12 and `docs/official/aqliya-implementation-rules-v1.1.md`:

```markdown
---
name: aqliya-ai-feature-gate
description: AI feature safety gate for AQLIYA. Enforces evidence, human review, audit logging, permission checks, and output boundaries before any AI-assisted feature implementation.
version: 0.1.0
date: 2026-07-12
status: Active
---

# AQLIYA AI Feature Gate

> **Purpose:** Enforce evidence, human review, and governance for every AI-assisted feature. Prevent black-box AI, autonomous decisions, and evidence-free outputs.

## 1. Mandatory AI Checks

Before implementing any AI feature:

- [ ] Source input references documented
- [ ] Prompt or action type specified
- [ ] Model/provider identified where available
- [ ] Generated output framed as suggestion/draft/analysis
- [ ] Confidence or limitation note included
- [ ] Human review status tracked
- [ ] Audit log entry created
- [ ] Permission checks enforced
- [ ] No autonomous final decision

## 2. AI Must Not

- Approve outputs automatically
- Override reviewer decisions
- Export final documents without approval
- Invent evidence
- Hide uncertainty
- Claim local/private processing unless implemented
- Send sensitive data to external providers without routing rules

## 3. AI Output Language

AI output must be framed as:
- Suggestion, draft, analysis, assistant output, reviewer aid

Never as:
- Final decision, certified audit opinion, legal advice, autonomous approval

## 4. Decision Trees

### Should this AI feature proceed?
→ Does it have source evidence? → Does it require human review? → Is it logged? → Is output framed correctly?

## 5. Verification Checklist

- [ ] Evidence linked to every AI output
- [ ] Review/approval status visible
- [ ] Audit event created
- [ ] Confidence score present
- [ ] No autonomous decisions
```

#### 1.4 Create `aqliya-data-discipline.md` (~100 lines)

Extract from AGENTS.md §13:

```markdown
---
name: aqliya-data-discipline
description: Prisma schema and migration discipline. Enforces safe schema changes, tenant scoping, seed data integrity, and client/server boundary rules.
version: 0.1.0
date: 2026-07-12
status: Active
---

# AQLIYA Data & Schema Discipline

> **Purpose:** Prevent unsafe migrations, speculative schema changes, missing tenant fields, and client-side database access.

## 1. Before Adding a Model

Ask:
1. Can this use an existing model?
2. Can this use AuditEvent?
3. Can this use metadata/config?
4. Is this future speculation?
5. Is this product being built now?

## 2. Every New Business Model Must Consider

- `id`
- `organizationId` or tenant ownership
- `workspaceId` where applicable
- `createdBy`, `updatedBy`
- Timestamps (createdAt, updatedAt)
- Status/workflow state
- Audit events
- Evidence links where relevant

## 3. Forbidden

- Schema changes for hypothetical features
- Future product tables before product implementation
- Migrations not tied to active scope
- Breaking seed data without updating seed scripts
- Exposing Prisma to Client Components

## 4. Migration Safety

Before `prisma migrate dev`:
- [ ] Migration tied to active feature scope
- [ ] Seed scripts updated
- [ ] No breaking changes to existing data
- [ ] Rollback plan documented
- [ ] Explicit approval obtained

## 5. Verification

- [ ] `npx prisma validate` passes
- [ ] Seed data runs successfully
- [ ] No client-side Prisma imports
```

### Wave 2 (Structural — 3 changes)

**Goal:** Clean up parallel-director, create export/toolchain skills, deduplicate protected files.

#### 2.1 Extract and trim `aqliya-parallel-director.md`

- **Extract** §§11-16 (Cycles 2-6) to `docs/operations/parallel-execution-cycles-archive.md`
- **Keep** §§1-10, §§17-18 (reusable protocol) — trim to ~150 lines
- **Add** to AGENTS.md §32 skill map
- **Add** `version`, `date`, `status` to frontmatter
- **Update** `opencode-agent.md` §10 to include it

#### 2.2 Create `aqliya-export-gate.md` (~80 lines)

Extract from AGENTS.md §17 (Evidence, Files, and Export Rules):

```markdown
---
name: aqliya-export-gate
description: Export, file, and evidence handling rules. Enforces permission checks, disclaimer output, audit logging, and approval gates.
version: 0.1.0
date: 2026-07-12
status: Active
---
```

#### 2.3 Deduplicate protected files across skills

Create a single canonical source. Either:
- **Option A (recommended):** Keep the authoritative list in `security-gate.md` §2. Other skills reference it by name (e.g., "See `aqliya-security-gate.md` §2 for protected files list").
- Option B: Extract protected files to a shared `aqliya-protected-files.md` that all skills reference.

### Wave 3 (Polish — 3 changes)

**Goal:** Add versioning, create bilingual/toolchain skills, add examples.

#### 3.1 Add version/dates to all frontmatter

Update every skill's frontmatter to:
```yaml
---
name: aqliya-<name>
description: <one-line>
version: 0.1.0
date: 2026-07-12
status: Active
last_reviewed: 2026-07-12
owner: Governance Team
---
```

Also update AGENTS.md §32 (Skill Format) to require these fields.

#### 3.2 Create `aqliya-bilingual-ux.md` (~80 lines)

From AGENTS.md §16:
- Arabic-first copy requirements
- RTL layout rules
- English term usage rules
- Direction bug prevention
- Empty/error/loading state language requirements
- Financial/official term consistency with glossary

#### 3.3 Create `aqliya-external-toolchain.md` (~100 lines)

From AGENTS.md §37:
- MCP permission matrix
- Provider routing rules (Anthropic-only for sensitive tasks)
- Tool activation sequence
- New tool addition workflow (STOP → REVIEW → APPROVAL → INSTALL → DOCUMENT)

---

## 7. Skill Template Standard

### Proposed Required Frontmatter

```yaml
---
name: aqliya-<descriptive-kebab-name>
description: <one-line description for AGENTS.md §32 auto-matching>
version: <semver>          # NEW: required
date: <YYYY-MM-DD>          # NEW: required
status: Active | Draft | Deprecated  # NEW: required
last_reviewed: <YYYY-MM-DD> # NEW: required
owner: <team or role>       # NEW: required
---
```

### Proposed Body Structure

```markdown
# AQLIYA <Skill Name>

> **Purpose:** <1-2 sentence clear statement of what this skill enforces>
> **Loads for:** <task description keywords, matching AGENTS.md §32>
> **Version:** <semver> | **Date:** <YYYY-MM-DD> | **Status:** <Active|Draft|Deprecated>

---

## 1. <First concern area>

Clear, binary rules. Decision trees preferred.

## 2. <Second concern area>

...

## N. Verification Checklist

- [ ] Checklist item 1
- [ ] Checklist item 2

## N+1. Output Contract

Expected deliverables when this skill is loaded:

| Deliverable | Format | When Required |
|---|---|---|
| <name> | <format> | <when> |

## N+2. Related Skills

- `aqliya-<related>.md` — <why loaded together>
- `aqliya-<related>.md` — <delegates when overlapping>

## N+3. Few-Shot Examples

### Example 1: <scenario>
**Task:** <description>
**Skill behavior:** <what agent should do>
**Expected output:** <what should be produced>
```

---

## 8. Dependency Graph (Target State)

```
aqliya-opencode-agent.md (default router)
├── loads aqliya-security-gate.md (when touching routes/auth/data)
│   └── delegates demo safety to aqliya-demo-safety.md
├── loads aqliya-low-load-dev.md (when running commands)
├── loads aqliya-docs-authority.md (when changing docs)
├── loads aqliya-product-completion.md (when completing products)
├── loads aqliya-release-checklist.md (when releasing)
├── loads aqliya-ai-feature-gate.md (when building AI features)
│   └── references AGENTS.md §12
├── loads aqliya-data-discipline.md (when changing schema)
│   └── references AGENTS.md §13
├── loads aqliya-export-gate.md (when handling files/exports)
│   └── references AGENTS.md §17
├── loads aqliya-parallel-director.md (when coordinating agents)
│   └── references docs/operations/parallel-execution-cycles-archive.md
└── (optional) loads aqliya-bilingual-ux.md (when building UI)
```

---

## 9. Effort Estimate

| Wave | Changes | Files Touched | Risk | Effort |
|---|---|---|---|---|
| Wave 1 | Trim 2 skills, create 2 new | 4 skills, 1 AGENTS.md update | Low | ~500 lines changed |
| Wave 2 | Extract cycles, create export/toolchain | 3 skills, 1 new ops doc, 1 AGENTS.md update | Low | ~400 lines changed |
| Wave 3 | Version all, create bilingual | 8 skills updated, 2 new skills | Low | ~300 lines changed |
| **Total** | — | **8 modified + 4 new skills + 2 new docs** | Low | **~1,200 lines** |

---

## 10. Verification Plan

After each wave, run:

```bash
# Verify all skills have valid frontmatter
grep -l "^---$" .skills/aqliya/*.md

# Verify all skills referenced in AGENTS.md §32 exist
# (manual: cross-check skill map table against filesystem)

# Verify no broken cross-references between skills
grep -r "aqliya-" .skills/aqliya/*.md | grep -v "^\.skills/aqliya/aqliya-"

# Verify total line count is reasonable (<250 per skill, <1500 total)
wc -l .skills/aqliya/*.md

# Verify no skill duplicates AGENTS.md content beyond 1-line references
# (manual review)
```

---

## 11. Rollback Plan

If refactored skills cause agent misbehavior:
1. Original skills exist in git history — revert to pre-refactor commit
2. New skills are additive — removing them has no impact on existing skills
3. Trimmed skills preserve all unique content — reverting trims restores full AGENTS.md duplication (not worse than current state)
4. Wave-by-wave deployment allows isolating which change caused issues

---

## 12. Success Criteria

After full refactor:

| Metric | Current | Target |
|---|---|---|
| Total skill lines | 1,548 | ~1,200 |
| Skills with version/date | 0 of 8 | 10 of 10 |
| Skills in AGENTS.md §32 | 7 of 8 | 10 of 10 |
| Duplicated content blocks | 5 (security§5, opencode §§1,3,4,5,7,8,9) | 0 |
| AI features covered by skill | No | Yes (`aqliya-ai-feature-gate.md`) |
| Schema changes covered by skill | No | Yes (`aqliya-data-discipline.md`) |
| Exports covered by skill | No | Yes (`aqliya-export-gate.md`) |
| Skills >250 lines | 2 (opencode 257, parallel 431) | 0 |
| Average SRP score | 3.75 | ≥4.0 |
| Average clarity score | 4.00 | ≥4.0 |
| Historical cycles in skill files | 106 lines (parallel-director) | 0 |
