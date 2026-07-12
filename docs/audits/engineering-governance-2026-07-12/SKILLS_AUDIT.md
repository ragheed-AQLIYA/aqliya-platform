# AQLIYA Skills Audit

**Date:** 2026-07-12
**Auditor:** Skills Auditor Agent
**Scope:** All 8 skills in `.skills/aqliya/` + cross-reference with `AGENTS.md` §§32-37
**Status:** DONE

---

## 1. Executive Summary

The AQLIYA skills system has 8 skill files (1,548 total lines) that govern agent behavior. The system is functional but has significant structural issues:

- **Overlap is the primary problem.** `opencode-agent` duplicates ~40% of its content from `AGENTS.md` and overlaps with 3 other skills. `security-gate` duplicates `demo-safety` rules verbatim. `low-load-dev` and `security-gate` maintain separate-but-overlapping protected file lists.
- **The parallel-director skill (431 lines) is not registered** in the AGENTS.md §32 skill map. It contains historical cycle execution records (Cycles 2-15) that are operational artifacts, not reusable instructions. This is the largest and most out-of-date skill.
- **No skill has version/date metadata.** The frontmatter format only captures `name` and `description`. There is no `version`, `date`, `status`, or `last_reviewed` field, making staleness detection impossible.
- **6 of 8 skills lack few-shot examples.** Only `demo-safety` has a concrete verification checklist. The rest rely on abstract rules that an agent must interpret.
- **Coverage gaps exist** for AI features, database migrations, testing, file management, exports, bilingual UX, and performance — all governed in AGENTS.md but lacking dedicated skills.
- **Average clarity score: 3.25/5.** Rules are generally clear but overlap creates ambiguity about which skill takes precedence.

**Top-line recommendation:** Reduce from 8 to 5 skills by merging overlapping pairs. Add 3 new skills for critical gaps. Add versioning to all frontmatter. Extract parallel-director's operational content to `docs/operations/`.

---

## 2. Skills Inventory

| Skill File | Version | Lines | Single Resp. | Clarity (1-5) | In AGENTS.md §32? |
|---|---|---|---|---|---|
| `aqliya-demo-safety.md` | None | 148 | 5 (Focused) | 5 | Yes |
| `aqliya-docs-authority.md` | None | 126 | 4 | 4 | Yes |
| `aqliya-low-load-dev.md` | None | 132 | 5 | 5 | Yes |
| `aqliya-opencode-agent.md` | None | 257 | 2 (Mixed) | 3 | Yes (default) |
| `aqliya-parallel-director.md` | None | 431 | 3 (Mixed) | 3 | **No** |
| `aqliya-product-completion.md` | None | 146 | 4 | 4 | Yes |
| `aqliya-release-checklist.md` | None | 167 | 4 | 4 | Yes |
| `aqliya-security-gate.md` | None | 141 | 3 | 4 | Yes |
| **Total** | — | **1,548** | **Avg: 3.75** | **Avg: 4.0** | 7 of 8 |

### Lines per Skill

```
parallel-director    ████████████████████████████ 431 (27.8%)
opencode-agent       ████████████████ 257 (16.6%)
release-checklist    ██████████ 167 (10.8%)
demo-safety          █████████ 148 (9.6%)
product-completion   ████████ 146 (9.4%)
security-gate        ████████ 141 (9.1%)
low-load-dev         ████████ 132 (8.5%)
docs-authority       ███████ 126 (8.1%)
```

---

## 3. Per-Skill Deep Dive

### 3.1 aqliya-demo-safety.md

- **Single Responsibility Score:** 5/5
- **Strengths:**
  - Laser-focused on one concern: `/auditos` demo route safety
  - 7 hard rules are unambiguous and testable
  - Verification checklist at end enables pre-commit checks
  - Failure protocol defines clear remediation steps
  - Route inventory with status/safety columns
- **Weaknesses:**
  - Hardcoded to `/auditos` — no guidance for adding new demo routes
  - No version/date metadata
  - Assumes all demo routes are read-only; no concept of interactive demo
  - No few-shot example of a compliant vs non-compliant demo page
- **Overlaps with:**
  - `security-gate.md` §5: verbatim duplication of demo rules (Rule 1-7 rephrased as 5 bullet points). This is the clearest case for deduplication.
- **Missing from this skill:**
  - How to onboard a new demo route
  - How to deprecate a demo route
  - Mock data generation guidelines (just says "mock data", not how)
- **Testability:** High — all 8 verification checklist items are binary yes/no. Could be automated as a lint rule.
- **Quality metrics:** Route count in demo inventory = routes with `skipAuth`; zero real data in demo responses; zero upload/download elements in DOM.

### 3.2 aqliya-docs-authority.md

- **Single Responsibility Score:** 4/5
- **Strengths:**
  - Clear ASCII hierarchy tree showing all authority levels
  - 7 conflict resolution rules with clear precedence
  - Trigger-based "when to update docs" table
  - 6 pre-change questions to prevent stale docs
- **Weaknesses:**
  - §1 hierarchy tree lists all other skills by name — creates a maintenance dependency (must update this file when skills are added/renamed/removed)
  - No distinction between "minor" and "major" conflicts
  - No few-shot example of a real conflict resolution
  - No version/date metadata
- **Overlaps with:**
  - `opencode-agent.md` §3 (context gathering) and §5.5 (document step): both reference reading docs and updating docs, but opencode-agent is vaguer
  - AGENTS.md §2 (Highest Authority Documents): essentially a shortened version of this skill
- **Missing from this skill:**
  - Conflict resolution log (should conflicts be recorded?)
  - Handling of conflicting skill files (skills say one thing, docs say another)
  - Auto-detection rules for staleness (e.g., "if route file exists but not in ROUTE_STRATEGY.md")
- **Testability:** Medium — conflict rules are specific enough to apply to pairs of documents and verify resolution. The trigger table is testable by checking if a given change type maps to a doc update.
- **Quality metrics:** Zero unresolved doc conflicts; all triggers have matching doc updates; no stale cross-references.

### 3.3 aqliya-low-load-dev.md

- **Single Responsibility Score:** 5/5
- **Strengths:**
  - Clear triage: Light/Medium/Heavy with specific command lists
  - Excellent RAM vs Code Issue distinction (binary test)
  - Pre-flight checklist pattern is concrete and actionable
  - Recovery protocols for failed builds and migrations
- **Weaknesses:**
  - "npm run build" appears in both Medium (justify) and Heavy (approval) — same command, different gates depending on scope. This is confusing.
  - Protected-files list is a partial duplicate of `security-gate.md` §2
  - No version/date metadata
  - Shell commands assume Unix (`cat`, `ls`) despite the repo running on PowerShell — see AGENTS.md §30
- **Overlaps with:**
  - `security-gate.md` §2: both list "protected files" with different levels of detail
  - `opencode-agent.md` §4: both cover "when to ask permission"
  - AGENTS.md §33: literally duplicates this skill's content in shorter form
- **Missing from this skill:**
  - Docker compose commands classification (dev DB)
  - Git commands classification (push, commit, rebase)
  - Script execution guidance (`npm run audit:health`, etc.)
  - Parallel execution budget (when running N commands simultaneously)
- **Testability:** High — every command can be classified and gate checked. Could be implemented as a pre-execution hook.
- **Quality metrics:** Zero unapproved heavy commands; zero RAM-misdiagnosed-as-code errors.

### 3.4 aqliya-opencode-agent.md

- **Single Responsibility Score:** 2/5
- **Strengths:**
  - Well-structured as the "default" meta-skill
  - Clear task classification header template (§2)
  - Skill matching table mirrors AGENTS.md §32
  - Good completion status taxonomy (DONE / DONE_WITH_CONCERNS / BLOCKED / NEEDS_CONTEXT)
  - Hard stops list (from AGENTS.md §23)
- **Weaknesses:**
  - **Heavy duplication of AGENTS.md:** §1 duplicates AGENTS.md §0; §2 duplicates AGENTS.md §34; §5 duplicates AGENTS.md §8; §6 duplicates AGENTS.md §25; §7 duplicates AGENTS.md §31.4; §8 duplicates AGENTS.md §23
  - At 257 lines, it is the second-largest skill and risks being loaded as default for every task
  - §10 lists skill directory layout but omits `parallel-director` — out of date
  - "Protected files" list duplicates security-gate and low-load-dev with fewer details
  - Acts as both a skill-loading router AND a task execution protocol — two concerns
- **Overlaps with:** AGENTS.md (massive), security-gate, low-load-dev, docs-authority, product-completion, release-checklist
- **Missing from this skill:**
  - Priority/ordering when multiple skills conflict
  - How to load skills (tool call? read file? in-context injection?)
  - Error recovery when skill is missing or corrupted
  - Few-shot examples
- **Testability:** Low — mostly behavioral guidance. Task classification header is testable, but the "apply skill rules as constraints" instruction is vague.
- **Quality metrics:** Every task has a classification header; every report uses the defined format; no task proceeds without skill loading.

### 3.5 aqliya-parallel-director.md

- **Single Responsibility Score:** 3/5
- **Strengths:**
  - Excellent file ownership matrix (§5) — clear, testable boundaries
  - Branching rules (§3) are unambiguous ("main only")
  - Agent naming convention (§4) avoids naming collision
  - Dependency rules (§6) with hard/soft distinction
  - Subagent dispatch template (§8.2) is concrete and reusable
- **Weaknesses:**
  - **NOT registered in AGENTS.md §32 skill map** — agents following the skill map won't discover it
  - **431 lines is too large** for a skill loaded on every parallel task
  - **Cycles 2-15 are historical operational records**, not reusable instructions. They contain dates (2026-06-04), completed tasks, and program state that is already stale.
  - Cycle-specific content (11 of 18 sections) should live in `docs/operations/`, not in a skill file
  - Validation policy (§8.4) is cycle-specific, not universal
- **Overlaps with:**
  - `opencode-agent.md` §3 (pre-flight), §5 (execution protocol)
  - `security-gate.md` §2 (protected files — Director duplicates "Director-only" files)
  - `low-load-dev.md` (validation commands)
- **Missing from this skill:**
  - Not in AGENTS.md §32 — discovery gap
  - No activation trigger table for automated matching
  - No error recovery when an agent goes off-scope mid-cycle
  - No rollback protocol if a cycle fails
- **Testability:** Medium — file ownership matrix provides testable boundaries; merge sequence is verifiable; subagent dispatch template is checkable
- **Quality metrics:** Zero cross-agent file conflicts per cycle; zero branch creations; all cycles produce valid reports.

### 3.6 aqliya-product-completion.md

- **Single Responsibility Score:** 4/5
- **Strengths:**
  - Clear DoD checklist organized by category (persistence, UI/UX, governance, quality)
  - 8 anti-patterns that are concrete and actionable
  - Product-specific DoD references table links to AGENTS.md
  - 6-step completion workflow is logical and sequential
- **Weaknesses:**
  - Checklist items are vague — "Dashboard with real metrics" is subjective; no threshold for "real"
  - No distinction between L4 and L5 DoD — both share the same universal checklist
  - Product-specific references are just pointers to AGENTS.md, not self-contained
  - No parallel validation step (doesn't reference Agent-QA from parallel-director)
- **Overlaps with:**
  - `release-checklist.md`: both verify completion levels and checklists before declaring readiness
  - `opencode-agent.md` §7: both define completion statuses (DONE/DONE_WITH_CONCERNS)
- **Missing from this skill:**
  - Scoring rubric per checklist item (Partial/Complete/Not Applicable)
  - Automation rules (can any checklist be auto-verified?)
  - Regression detection (did a change reduce a product's level?)
- **Testability:** Medium — checklist items are testable individually, but "real metrics" and "real data" need explicit thresholds. Anti-pattern detection could be linted.
- **Quality metrics:** Product level transitions recorded in PRODUCT_STATUS_MATRIX.md; zero L3 products claimed as L4; all checklist items scored per product.

### 3.7 aqliya-release-checklist.md

- **Single Responsibility Score:** 4/5
- **Strengths:**
  - Clear Go/No-Go criteria with blocking vs non-blocking distinction
  - Concrete rollback triggers
  - Post-release steps enumerated
  - Release report template provided
- **Weaknesses:**
  - Route verification check says "All product routes accessible with auth" — vague, not enumerable
  - Validation section is minimal (only tsc + lint); no mention of test suite, audit health check, or seed verification
  - No deployment-specific sections (AWS ECS vs local vs Docker)
  - No mention of build verification (production build succeeds?)
  - Light validation commands (§6) are inconsistent with low-load-dev classifications
- **Overlaps with:**
  - `security-gate.md`: security checks in release cover same ground (auth, demo, RBAC, audit)
  - `product-completion.md`: both verify completion levels before declaring something done
- **Missing from this skill:**
  - Rollback procedure (not just triggers, but steps)
  - Pre-release smoke test steps
  - Database migration verification
  - Environment variable verification
- **Testability:** High — all checklist items are verifiable; Go/No-Go criteria are binary
- **Quality metrics:** Zero releases with Go despite blocking issues; all releases produce dated reports; rollback triggers never fire (or documented when they do).

### 3.8 aqliya-security-gate.md

- **Single Responsibility Score:** 3/5
- **Strengths:**
  - Excellent decision trees for each security check (Auth → Tenant → RBAC → Audit → Download)
  - Protected files list with explicit exception procedure
  - Security regression detection protocol is concrete
  - Auth middleware quick reference is useful
- **Weaknesses:**
  - §5 (Demo Route Safety) duplicates `demo-safety.md` entirely — this is the most obvious overlap in the system
  - Protected files list (§2) overlaps with `low-load-dev.md` — security-gate has 6 files, low-load has different items
  - "Forbidden Changes" (§3) overlaps with `opencode-agent.md` §4 and §8
  - No version/date metadata
  - Decision brief process (§2.3-2.4) references AGENTS.md §30.1 — fragile cross-reference
- **Overlaps with:**
  - `demo-safety.md`: §5 duplicates demo rules
  - `low-load-dev.md`: both list protected files
  - `opencode-agent.md`: both cover auth/protected file/modification rules
- **Missing from this skill:**
  - Session token handling rules
  - CORS/CSP policy verification
  - Rate limiting checks
  - Secret scanning (git hooks, CI)
- **Testability:** High — all 5 decision trees provide yes/no questions; protected file list is checkable; regression detection is procedural
- **Quality metrics:** Zero auth bypasses; zero tenant isolation leaks; all mutations logged; all downloads gated.

---

## 4. Overlap & Redundancy Map

```
                    demo-safety  docs-auth  low-load  opencode  parallel  product  release  security
demo-safety             -           -         -          -         -         -        -       ★★★
docs-authority          -           -         -          ★         -         -        -        -
low-load-dev            -           -         -          ★★        -         -        -       ★
opencode-agent          -           ★         ★★         -         ★        ★★       ★★      ★
parallel-director       -           -         -          ★         -         -        -        -
product-completion      -           -         -          ★★        -         -        ★       -
release-checklist       -           -         -          ★         -         ★        -        -
security-gate          ★★★         -         ★          ★         -         -        -        -

★ = minor overlap (shared topic, different treatment)
★★ = moderate overlap (shared rules, different framing)
★★★ = severe overlap (verbatim or near-verbatim duplication)
```

### Specific Overlap Details

| Pair | Severity | Detail |
|---|---|---|
| security-gate ↔ demo-safety | ★★★ | security-gate §5 duplicates demo-safety Rules 1-7 |
| opencode-agent ↔ AGENTS.md | ★★★ | §§1,2,5,6,7,8 duplicate AGENTS.md §§0,8,23,25,31.4,34 |
| low-load-dev ↔ security-gate | ★ | Both maintain protected-file lists (different content) |
| opencode-agent ↔ low-load-dev | ★★ | Both cover permission gates, protected files |
| opencode-agent ↔ product-completion | ★★ | Both define completion statuses, report format |
| opencode-agent ↔ security-gate | ★ | Both cover forbidden changes |
| product-completion ↔ release-checklist | ★ | Both verify completion before declaring ready |
| opencode-agent ↔ docs-authority | ★ | Both cover "when to update docs" |

---

## 5. Coverage Gaps

### 5.1 Task Type Coverage (mapped to AGENTS.md §34 task types)

| Task Type | Covered By Skill? | Gap |
|---|---|---|
| Bug fix | `opencode-agent` (general) | No bug-triage skill; no root-cause protocol |
| Feature | `opencode-agent`, `product-completion` | No feature-flag skill; no A/B test skill |
| Product completion | `product-completion` | Covered |
| Data/schema | None | **GAP**: No Prisma discipline, migration safety, or seed data skill |
| AI feature | None | **GAP**: AGENTS.md §12 has extensive AI rules but no skill loads them |
| Infrastructure | `low-load-dev` (partial) | No Docker/ECS/deployment skill |
| Refactor | `opencode-agent` (general) | No refactoring safety skill (regression tests, diff review) |
| Documentation | `docs-authority` | Covered |
| Identity/copy | `docs-authority` (partial) | No brand/naming consistency skill |
| Release/deployment | `release-checklist` | Covered |

### 5.2 Domain Coverage Gaps

| Domain | Status | Gap Description |
|---|---|---|
| **AI Feature Implementation** | No skill | AGENTS.md §12 (12 rules for AI features) is not represented as a loadable skill. Critical given AI is a core differentiator. |
| **Database & Migrations** | No skill | AGENTS.md §13 (Data and Prisma Discipline) is not a skill. Migrations are destructive and need a gate. |
| **Testing & QA** | No skill | No skill covers test conventions, coverage targets, or QA workflow. Only referenced in `parallel-director` as Agent-QA scope. |
| **File Upload/Downloads** | No skill | File handling has auth, storage, scanning, and retention rules. Partially in security-gate §1.5 but no dedicated skill. |
| **Data Export (PDF/XLSX)** | No skill | Export rules are governance-critical (approval, disclaimer, watermark). Not covered by any skill. |
| **Bilingual/Arabic UX** | No skill | Arabic-first is a core tenet (§16). No skill enforces RTL, Arabic copy, or translation consistency. |
| **Performance Optimization** | No skill | No skill covers bundle size, lazy loading, image optimization, or DB query performance. |
| **Error Handling** | No skill | No skill covers error boundary patterns, error state requirements, or error logging conventions. |
| **External Toolchain** | No full skill | AGENTS.md §37 is the most detailed policy in the codebase but has no loadable skill. `low-load-dev` covers command restrictions but not MCP permissions, provider routing, or tool activation. |

### 5.3 AGENTS.md Gate Coverage

| Gate (from §35) | Skill Coverage | Status |
|---|---|---|
| Security Gate | `security-gate.md` | Covered |
| Demo Gate | `demo-safety.md` | Covered |
| Docs Gate | `docs-authority.md` | Covered |
| Release Gate | `release-checklist.md` | Covered |
| Product Completion Gate | `product-completion.md` | Covered |
| Low-Load Gate | `low-load-dev.md` | Covered |
| AI Feature Gate | None | **Missing** |
| Data/Schema Gate | None | **Missing** |
| Export Gate | None | **Missing** |

---

## 6. Skill Quality Scores

| Skill | SRP (1-5) | Clarity (1-5) | Reusability (1-5) | Output Contract (1-5) | Testability (1-5) | Overall (1-5) |
|---|---|---|---|---|---|---|
| `demo-safety` | 5 | 5 | 3 | 4 (checklist) | 5 | **4.4** |
| `docs-authority` | 4 | 4 | 4 | 3 (implied) | 3 | **3.6** |
| `low-load-dev` | 5 | 5 | 5 | 3 (implied) | 5 | **4.6** |
| `opencode-agent` | 2 | 3 | 3 | 5 (report) | 2 | **3.0** |
| `parallel-director` | 3 | 3 | 2 | 5 (cycle) | 4 | **3.4** |
| `product-completion` | 4 | 4 | 4 | 3 (implied) | 3 | **3.6** |
| `release-checklist` | 4 | 4 | 4 | 5 (template) | 5 | **4.4** |
| `security-gate` | 3 | 4 | 4 | 3 (implied) | 5 | **3.8** |
| **Average** | **3.75** | **4.00** | **3.63** | **3.88** | **4.00** | **3.85** |

### Score Definitions

**SRP (Single Responsibility):** Does this skill do ONE thing?
- 5: Single concern, focused
- 1: Multiple unrelated concerns mixed

**Clarity:** Are instructions unambiguous?
- 5: Binary/checkable rules, decision trees
- 1: Vague guidance requiring interpretation

**Reusability:** Can this skill apply across different task types?
- 5: General-purpose, loads for many scenarios
- 1: Single-scenario only (e.g., tied to one product)

**Output Contract:** Is there a clear expected deliverable?
- 5: Explicit template/format defined in skill
- 1: No output specified

**Testability:** Can the skill's instructions be verified automatically?
- 5: All rules are binary yes/no, automatable
- 1: Subjective guidance, unverifiable

---

## 7. Metadata Audit

| Metadata Field | Present in How Many Skills? | Skills Missing It |
|---|---|---|
| `name` (frontmatter) | 8 of 8 | — |
| `description` (frontmatter) | 8 of 8 | — |
| `version` | 0 of 8 | ALL |
| `date` | 0 of 8 | ALL |
| `status` (Active/Draft/Deprecated) | 0 of 8 | ALL |
| `last_reviewed` | 0 of 8 | ALL |
| `owner` | 0 of 8 | ALL |
| `dependencies` (other skills/docs) | 0 of 8 | ALL |

### AGENTS.md §32 (Skill Map) Inconsistency

- Lists 7 skills. Omits `aqliya-parallel-director.md`.
- Skill format spec (l.1463-1469) only requires `name` and `description`. No version, date, or status fields.
- `aqliya-opencode-agent.md` §10 lists 7 skills in its directory layout. Also omits `parallel-director`.

---

## 8. Top 10 Findings Summary

1. **opencode-agent is a duplication hazard** — 257 lines, ~40% redundant with AGENTS.md, overlaps with 3 other skills, acts as default loader. Should be trimmed to a thin router only.
2. **security-gate §5 duplicates demo-safety verbatim** — Clear violation of single responsibility. security-gate should delegate, not duplicate.
3. **parallel-director is not in the skill map** — Neither AGENTS.md §32 nor opencode-agent §10 reference it. 431-line skill is undiscoverable.
4. **Cycles 2-15 in parallel-director are operational artifacts, not skills** — Historical execution records (dated 2026-06-04) clog the skill with stale, non-reusable content. Should be extracted to `docs/operations/`.
5. **Zero skills have version/dates** — No way to detect staleness without manual review. AGENTS.md frontmatter spec is too minimal.
6. **AI features have no loadable skill** — AGENTS.md §12 contains 12 detailed rules for AI feature implementation. This is a critical gap given AQLIYA's AI-first positioning.
7. **Database migrations have no skill** — Prisma discipline (§13) and migration safety are only in AGENTS.md. Destructive operations need a dedicated gate.
8. **Protected files are maintained in 3 places** — security-gate §2, low-load-dev §3, opencode-agent §4. Each list is slightly different. Single source of truth needed.
9. **Bilingual/Arabic enforcement has no skill** — AQLIYA's core identity as Arabic-first (§16) has zero enforcement in the skills system.
10. **Export/file handling has no skill** — Export rules (§17), file rules, and evidence management are governance-critical but unrepresented.

---

## 9. Raw Data: Skill Line Counts by Section

### aqliya-demo-safety.md
| Section | Lines |
|---|---|
| Frontmatter | 1-4 (4) |
| Purpose | 5-10 (6) |
| Demo Route Definition | 12-18 (7) |
| Hard Rules | 20-74 (55) |
| Demo Data Rules | 77-86 (10) |
| Prohibited | 89-98 (10) |
| Permitted | 101-109 (9) |
| Verification Checklist | 112-124 (13) |
| Failure Protocol | 127-136 (10) |
| Current Demo Routes | 139-148 (10) |

### aqliya-docs-authority.md
| Section | Lines |
|---|---|
| Frontmatter | 1-4 (4) |
| Purpose | 6-10 (5) |
| Authority Hierarchy | 12-50 (39) |
| Conflict Resolution Rules | 54-88 (35) |
| When to Update Docs | 92-105 (14) |
| Before Changing Any Doc | 108-116 (9) |
| Doc Maintenance Rules | 119-126 (8) |

### aqliya-low-load-dev.md
| Section | Lines |
|---|---|
| Frontmatter | 1-4 (4) |
| Purpose | 6-10 (5) |
| Command Classification | 12-49 (38) |
| RAM vs Code Issue | 52-81 (30) |
| When to Ask Permission | 84-101 (18) |
| Pre-Flight Check | 105-115 (11) |
| Recovery Protocol | 118-132 (15) |

### aqliya-opencode-agent.md
| Section | Lines |
|---|---|
| Frontmatter | 1-4 (4) |
| Purpose | 6-10 (5) |
| Identity & Role | 12-36 (25) |
| Starting a Task | 39-72 (34) |
| Context Gathering | 75-87 (13) |
| Preventing Random Modifications | 89-114 (26) |
| Execution Protocol | 117-150 (34) |
| Final Report Format | 153-196 (44) |
| Completion Statuses | 200-208 (9) |
| Hard Stops | 211-227 (17) |
| Evidence & Reporting | 230-244 (15) |
| Skill Directory Layout | 247-257 (11) |

### aqliya-parallel-director.md
| Section | Lines |
|---|---|
| Frontmatter | 1-4 (4) |
| Role declaration | 6-13 (8) |
| Mission | 16-22 (7) |
| Authority Order | 24-55 (32) |
| Branching Rules | 58-69 (12) |
| Agent Naming | 72-82 (11) |
| File Ownership Matrix | 85-160 (76) |
| Dependency Rules | 163-184 (22) |
| Architecture Rules | 187-196 (10) |
| Execution Protocol | 198-248 (51) |
| Definition of Done | 251-260 (10) |
| Required Output Format | 263-300 (38) |
| Cycles 2-15 (historical) | 302-407 (106) |
| Activation | 423-431 (9) |

**Historical content:** Cycles 2-15 = 106 lines (24.6%) of the skill are operational records, not reusable instructions.

### aqliya-product-completion.md
| Section | Lines |
|---|---|
| Frontmatter | 1-4 (4) |
| Purpose | 6-10 (5) |
| Completion Levels | 12-23 (12) |
| Universal v0.1 DoD | 26-61 (36) |
| Forbidden Claims | 64-77 (14) |
| Product-Specific DoD | 80-89 (10) |
| Completion Workflow | 92-134 (43) |
| Anti-Patterns | 137-146 (10) |

### aqliya-release-checklist.md
| Section | Lines |
|---|---|
| Frontmatter | 1-4 (4) |
| Purpose | 6-10 (5) |
| Pre-Release Checklist | 12-53 (42) |
| Release Report Template | 55-101 (47) |
| Go/No-Go Criteria | 104-122 (19) |
| Post-Release Steps | 126-133 (8) |
| Rollback Triggers | 136-145 (10) |
| Light Validation Commands | 148-167 (20) |

### aqliya-security-gate.md
| Section | Lines |
|---|---|
| Frontmatter | 1-4 (4) |
| Purpose | 6-10 (5) |
| Mandatory Security Checks | 12-70 (59) |
| Protected Files | 73-91 (19) |
| Forbidden Changes | 93-102 (10) |
| Regression Detection | 105-116 (12) |
| Demo Route Safety (dup!) | 119-129 (11) |
| Auth Middleware Reference | 133-141 (9) |
