# AQLIYA AI Knowledge Map

> **Purpose:** The definitive entry point for every AI assistant (ChatGPT, Claude Code, OpenCode, Cursor, Codex, etc.) working on the AQLIYA repository.  
> **Status:** Active — official knowledge navigation map  
> **Version:** 2.0 | **Date:** 2026-06-26 | **Owner:** Documentation Team | **Last Reviewed:** 2026-06-26  
> **Authority:** This file is a navigation aid. It does not override `docs/DOCUMENTATION_AUTHORITY.md`.  
> **Entry point:** Start with `docs/AI_ENTRYPOINT.md` for platform identity and repository orientation.

---

## How to Use This Map

1. **Start with the Critical Core** (Section 4) — always read these first.
2. **Use the Priority Index** (Section 3) to decide what else to read based on your task.
3. **Follow the Recommended Reading Order** (Section 5) for a sequential curriculum.
4. **Check the Document Classification** (Section 7) to understand what each doc type means.
5. **Avoid the Deprecated List** (Section 6) — do not read these for current decisions.
6. **When in doubt**, start with `docs/DOCUMENTATION_AUTHORITY.md`.

---

## 1. Quick Start — Minimum Viable Knowledge for Any AI

If you can only read 5 files, read these:

| # | File | Why |
|---|------|-----|
| 1 | `docs/DOCUMENTATION_AUTHORITY.md` | Conflict resolution, doc hierarchy, loading order |
| 2 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Current platform identity, status summary, trust principle |
| 3 | `AGENTS.md` | Agent operating contract, governance rules, completion standards |
| 4 | `README.md` | Entry-level project orientation |
| 5 | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | What is actually built and at what level |

Read them in this order. This will give you ~80% of the context needed for most tasks.

---

## 2. Complete File Inventory

### 2.1 Root-Level Entry Points

| # | File | Exists? | Source of Truth? | Priority |
|---|------|---------|-----------------|----------|
| R1 | `docs/DOCUMENTATION_AUTHORITY.md` | Yes | **Yes** | **Critical** |
| R2 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Yes | **Yes** | **Critical** |
| R3 | `AGENTS.md` | Yes | **Yes** | **Critical** |
| R4 | `README.md` | Yes | **Yes** | **Critical** |
| R5 | `CLAUDE.md` | Yes | **No** (Deprecated) | Low |
| R6 | `docs/README.md` | Yes | Yes | **High** |
| R7 | `docs/DOCUMENTATION_GOVERNANCE.md` | Yes | **No** (Deprecated, superseded by v2) | Low |
| R8 | `docs/DOCUMENTATION_GOVERNANCE_v2.md` | Yes | **Yes** | **High** |

### 2.2 Official Doctrine (`docs/official/`)

| # | File | Exists? | Source of Truth? | Priority |
|---|------|---------|-----------------|----------|
| D1 | `AQLIYA_MASTER_REFERENCE.md` (listed above as R2) | Yes | **Yes** | **Critical** |
| D2 | `aqliya-vision-v1.1.md` | Yes | **Yes** | **Critical** |
| D3 | `aqliya-product-taxonomy-v1.1.md` | Yes | **Yes** | **Critical** |
| D4 | `aqliya-core-architecture-v1.1.md` | Yes | **Yes** | **High** |
| D5 | `aqliya-implementation-rules-v1.1.md` | Yes | **Yes** | **High** |
| D6 | `aqliya-glossary-v1.1.md` | Yes | **Yes** | **High** |
| D7 | `aqliya-skill-context-v1.1.md` | Yes | Yes | Medium |
| D8 | `aqliya-agent-context-v1.1.md` | Yes | Yes | Medium |
| D9 | `AQLIYA_ROADMAP_v1.2.md` | Yes | **Yes** | **High** |
| D10 | `aqliya-roadmap-v1.1.md` | Yes | Partially superseded | Medium |
| D11 | `aqliya-skill-os-v1.0.md` | Yes | Yes | Low |
| D12 | `aqliya-ai-infrastructure-map-v1.0.md` | Yes | Yes | **High** (for AI work) |
| D13 | `audit-arabic-terminology-glossary-v1.md` | Yes | Yes | Low |
| D14 | `aqliya-opencode-operating-system.md` | Yes | Yes | Low |

### 2.3 Source of Truth (`docs/source-of-truth/`)

| # | File | Exists? | Source of Truth? | Priority |
|---|------|---------|-----------------|----------|
| S1 | `AQLIYA_CURRENT_STATE.md` | Yes | **Yes** (★ operational truth) | **Critical** |
| S2 | `PRODUCT_STATUS_MATRIX.md` | Yes | **Yes** | **Critical** |
| S3 | `DOCUMENTATION_LINEAGE.md` | Yes | **Yes** | **High** |
| S4 | `ROUTE_STRATEGY.md` | Yes | **Yes** | **High** |
| S5 | `ROUTE_REGISTRY.md` | Yes | **Yes** | **High** |
| S6 | `AQLIYA_ARCHITECTURE.md` | Yes | **Yes** | **High** |
| S7 | `AQLIYA_SYSTEM_TAXONOMY.md` | Yes | **Yes** | **High** |
| S8 | `AQLIYA-company-product-architecture-official.md` | Yes | Yes | Medium |
| S9 | `CORE_PLATFORM_ARCHITECTURE.md` | Yes | Yes | Medium |
| S10 | `READINESS_GATES.md` | Yes | Yes | Medium |
| S11 | `PRODUCT_STATUS_AUTHORITY_MATRIX.md` | Yes | Yes | Medium |
| S12 | `PILOT_RUNBOOK.md` | Yes | Yes | Medium |
| S13 | `AI_CONTEXT.md` | Yes | Yes | **High** (for AI work) |
| S14 | `AI_CAPABILITY_MATRIX.md` | Yes | Yes | **High** (for AI work) |
| S15 | `ACTION_GUARD_MATRIX.md` | Yes | Yes | Medium |
| S16 | `CURRENT_REALITY_MATRIX.md` | Yes | Yes | Medium |
| S17 | `L6_COMPLETION_PROGRAM.md` | Yes | Yes | Low |
| S18 | `EXECUTION_DEPENDENCY_GRAPH.md` | Yes | Yes | Low |
| S19 | `OPERATIONAL_FREEZE_STATUS.md` | Yes | Yes | Low |
| S20 | `PARALLEL_REMEDIATION_GATES.md` | Yes | Yes | Low |
| S21 | `AQLIYA_THEORETICAL_DOCUMENTATION_SYSTEM.md` | Yes | No (background) | Low |
| — | ~~`ENTERPRISE_COMPLETION_ROADMAP.md`~~ | Yes | **SUPERSEDED** | **Do not read** |
| — | ~~`L6_PRODUCTION_ROADMAP.md`~~ | Yes | **SUPERSEDED** | **Do not read** |

### 2.4 Deployment (`docs/deployment/`)

| # | File | Exists? | Source of Truth? | Priority |
|---|------|---------|-----------------|----------|
| DP1 | `auditos-v0.1-deployment-guide.md` | Yes | Yes | **High** (before deployment) |
| DP2 | `auditos-v0.1-environment-inventory.md` | Yes | Yes | Medium |
| DP3 | `auditos-v0.1-security-posture.md` | Yes | Yes | Medium |
| DP4 | `auditos-v0.1-internal-rehearsal.md` | Yes | No (report) | Low |
| DP5 | `DEPLOYMENT_READINESS_REPORT.md` | Yes | No (report) | Low |
| DP6 | `MIGRATION_VALIDATION_REPORT.md` | Yes | No (report) | Low |
| DP7 | `MIGRATION_ROOT_CAUSE_REPORT.md` | Yes | No (report) | Low |
| DP8 | `MIGRATION_REPAIR_PLAN.md` | Yes | No (report) | Low |

### 2.5 Runbooks (`runbooks/`)

| # | File | Exists? | Source of Truth? | Priority |
|---|------|---------|-----------------|----------|
| RB1 | `staging-environment.md` | Yes | Yes | **High** (before deployment) |
| RB2 | `rate-limiter.md` | Yes | Yes | Medium |
| RB3 | `monitoring.md` | Yes | Yes | Medium |
| RB4 | `disaster-recovery.md` | Yes | Yes | Medium |
| RB5 | `backup-restore.md` | Yes | Yes | Medium |
| RB6 | `alerting.md` | Yes | Yes | Medium |

### 2.6 Releases (`docs/releases/`)

| # | File | Exists? | Source of Truth? | Priority |
|---|------|---------|-----------------|----------|
| RL1 | `aqliya-v0.1-release-scope.md` | Yes | Yes | **High** |
| RL2 | `aqliya-v0.1-release-notes.md` | Yes | Yes | Medium |
| RL3 | `aqliya-v0.1-known-limitations.md` | Yes | **Yes** | **High** |
| RL4 | `aqliya-v0.1-release-checklist.md` | Yes | Yes | Medium |
| RL5 | `aqliya-v0.1-demo-safety-guide.md` | Yes | Yes | Medium |
| RL6 | `auditos-v0.1-release-notes-2026-05-28.md` | Yes | Yes | Low |
| RL7 | `auditos-v0.1-release-package-2026-05-28.md` | Yes | Yes | Low |
| RL8 | `aqliya-website-copy-v3-hybrid-release-note.md` | Yes | No (historical) | Low |
| RL9 | `aqliya-documentation-cleanup-and-governance-release-note.md` | Yes | No (historical) | Low |

Note: `docs/releases/` also contains ~10+ subdirectories with phased development artifacts (command-surface-completion, deep-product-integration, v1-completion-program, etc.). These are **historical execution tracking**, not current source of truth.

### 2.7 Systems (`docs/systems/`)

| # | File | Exists? | Source of Truth? | Priority |
|---|------|---------|-----------------|----------|
| SY1 | `auditos/` (directory) | Yes | Yes | **High** (for AuditOS work) |
| SY2 | `decisionos/` (directory) | Yes | Yes | **High** (for DecisionOS work) |
| SY3 | `local-content-os/` (directory) | Yes | Yes | **High** (for LocalContentOS work) |
| SY4 | `salesos/` (directory) | Yes | Yes | Medium |
| SY5 | `simulationos/` (directory) | Yes | Yes | Low |
| SY6 | `README.md` | Yes | Yes | Medium |

### 2.8 Products (`docs/products/`)

| # | File | Exists? | Source of Truth? | Priority |
|---|------|---------|-----------------|----------|
| PR1 | `localcontentos-v0.1/` (12 files + subdirs) | Yes | Yes | **High** (for LC work) |
| PR2 | `localcontentos-mvp-spec/` (11 files) | Yes | Yes | Medium |
| PR3 | `localcontentos-pilot-runbook/` (10 files) | Yes | Yes | Medium |
| PR4 | `localcontentos-sales-pack/` (8 files) | Yes | Yes | Medium |
| PR5 | `workflowos/` (3 files) | Yes | Yes | Medium |
| PR6 | `pilot-control-pack/` (12 files across auditos/) | Yes | Yes | Medium |
| PR7 | `office-ai-assistant-foundation-design.md` | Yes | Yes | Medium |
| PR8 | `office-ai-cloud-provider-risk-gate.md` | Yes | Yes | Medium |
| PR9 | `office-ai-file-content-extraction-design.md` | Yes | Yes | Medium |
| PR10 | `salesos-product-definition-pack.md` | Yes | Yes | Medium |
| PR11 | `salesos-l5-acceptance-criteria.md` | Yes | Yes | Medium |
| PR12 | `simulationos-product-definition-pack.md` | Yes | Yes | Low |
| PR13 | `sombol-*` (meeting, demo, cloud offer packs) | Yes | No (client-specific) | Low |

### 2.9 Pilot (`docs/pilot/`)

| # | File | Exists? | Source of Truth? | Priority |
|---|------|---------|-----------------|----------|
| PT1 | `PILOT-PACK-INDEX.md` | Yes | Yes | **High** (before pilot work) |
| PT2 | `PILOT-SCOPE.md` | Yes | Yes | Medium |
| PT3 | `PILOT-SUCCESS-CRITERIA.md` | Yes | Yes | Medium |
| PT4 | `GO-NOGO-CHECKLIST.md` | Yes | Yes | Medium |
| PT5 | `RISK-DISCLOSURE.md` | Yes | Yes | Medium |
| PT6 | `REHEARSAL-CHECKLIST.md` | Yes | Yes | Medium |
| PT7 | `CLIENT-DEMO-SCRIPT.md` | Yes | Yes | Medium |
| PT8 | `DEMO-AGENDA.md` | Yes | Yes | Medium |
| PT9 | `CLIENT-FAQ.md` | Yes | Yes | Medium |
| PT10 | `execution-pack/` (10 files) | Yes | Yes | Medium |
| PT11 | `controlled-execution/` (10 files) | Yes | No (historical) | Low |
| PT12 | `session reports` (5 files: pilot-session-5-*, etc.) | Yes | No (evidence) | Low |
| PT13 | `auditos-post-pilot-decision-memo-template.md` | Yes | No (template) | Low |
| PT14 | `AQLIYA_FIRST_CONTROLLED_PILOT_RUN_REPORT.md` | Yes | No (evidence) | Low |
| PT15 | `AQLIYA_PILOT_READINESS_EXPERIENCE_VALIDATION_REPORT.md` | Yes | No (evidence) | Low |
| PT16 | `AQLIYA_PILOT_EXECUTION_PACK_REPORT.md` | Yes | No (evidence) | Low |
| PT17 | `current-auditos-pilot-control-sheet.md` | Yes | Yes | Medium |

### 2.10 Commercial (`docs/commercial/` + `docs/commercial-pack/`)

| # | File | Exists? | Source of Truth? | Priority |
|---|------|---------|-----------------|----------|
| CM1 | `WHAT_WE_DO_NOT_CLAIM.md` | Yes | **Yes** | **Critical** |
| CM2 | `README.md` | Yes | Yes | Medium |
| CM3 | `PILOT_SOW_TEMPLATE.md` | Yes | Yes | Medium |
| CM4 | `demo-storyline/` (7 files) | Yes | Yes | Low |
| CM5 | `commercial-pack/` (13 files: 01-13 + README) | Yes | Yes | Medium |

### 2.11 Validation Reports (`docs/validation/`)

| # | File | Exists? | Source of Truth? | Priority |
|---|------|---------|-----------------|----------|
| V1 | `PILOT_VALIDATION_MASTER_REPORT.md` | Yes | No (evidence) | Medium |
| V2 | `PILOT_LAUNCH_CHECKLIST.md` | Yes | No (evidence) | Low |
| V3 | `PRODUCT_SURFACE_VALIDATION_REPORT.md` | Yes | No (evidence) | Low |
| V4 | `phase-1c/PGVECTOR_VALIDATION_REPORT.md` | Yes | No (evidence) | Low |
| V5 | `phase-1c/ENGINEERING_STABILITY_REPORT.md` | Yes | No (evidence) | Low |
| V6 | `phase-1c/CROSS_TENANT_VALIDATION_REPORT.md` | Yes | No (evidence) | Low |
| V7 | `testing/TEST_COVERAGE_AUDIT.md` | Yes | No (evidence) | Low |
| V8 | `security/RISK_ACCEPTANCE_REPORT.md` | Yes | No (evidence) | Low |
| V9 | `release/PILOT_GO_LIVE_CHECKLIST.md` | Yes | No (evidence) | Low |
| V10 | `performance/PERFORMANCE_AUDIT_REPORT.md` | Yes | No (evidence) | Low |
| V11 | `observability/OBSERVABILITY_REPORT.md` | Yes | No (evidence) | Low |
| V12 | `operations/DRY_RUN_REPORT.md` | Yes | No (evidence) | Low |
| V13 | `evidence/EVIDENCE_REPORT.md` | Yes | No (evidence) | Low |
| V14 | `docs/DOCUMENTATION_CONSOLIDATION.md` | Yes | No (evidence) | Low |
| V15 | `database/DATABASE_AUDIT_REPORT.md` | Yes | No (evidence) | Low |
| V16 | `cicd/CICD_AUDIT_REPORT.md` | Yes | No (evidence) | Low |
| V17 | `cycle-6/` (15 files) | Yes | No (evidence) | Low |
| V18 | `post-deploy-smoke-local.json` | Yes | No (evidence) | Low |

### 2.12 Deliverables (`docs/deliverables/`)

~55 files including:
- Implementation phase reports (PHASE_28_*, PHASE_29_*, etc.)
- Audit reports (audit-2026/ with 15 files)
- Platform assessments (PLATFORM_CORE_ASSESSMENT.md, etc.)
- Intelligence Core reports (INTELLIGENCE_*)
- Pilot readiness docs
- Executive recommendations
- Knowledge governance audits

**Status:** All are evidence/reports. None are current source of truth. Low priority for ongoing work.

### 2.13 Audits (`docs/audits/`)

~80+ files including:
- `reality-audit-2026-06-17/` (18 files) — **Snapshot, now stale**
- `forensic-audit-2026-06-17/` (17 files) — **Snapshot, now stale**
- `recovery-strategy-2026-06-17/` (9 files) — **Stale strategy**
- `truth-reconciliation-2026-06-18/` (3 files) — **Most recent, partially current**
- Various phase validation reports
- TB benchmark reports
- Security audits

**Status:** Evidence/archival. Only `truth-reconciliation-2026-06-18/FINAL_TRUTH_RECONCILIATION.md` has medium value.

### 2.14 Strategic Due Diligence (`docs/strategic-due-diligence-2026-06-19/`)

15 files: TECHNOLOGY_STRATEGY.md, PRODUCT_PORTFOLIO_REVIEW.md, MARKET_STRATEGY.md, COMPETITIVE_POSITIONING.md, AI_STRATEGY_FINAL.md, EXECUTION_PLAN_12_MONTHS.md, EXECUTION_RISK_REGISTER.md, etc.

**Status:** Strategic planning documents. Medium value for strategy context.

### 2.15 Execution (`docs/execution/`)

| # | File | Exists? | Source of Truth? | Priority |
|---|------|---------|-----------------|----------|
| EX1 | `engineering-operating-protocol.md` | Yes | Yes | Medium |
| EX2 | `implementation-prompts.md` | Yes | Yes | Medium |
| EX3 | `qa-prompts.md` | Yes | Yes | Low |
| EX4 | `ui-rules.md` | Yes | Yes | Low |
| EX5 | `auditos-next-build-plan.md` | Yes | No (stale) | Low |

### 2.16 Other Docs

| # | File | Exists? | Source of Truth? | Priority |
|---|------|---------|-----------------|----------|
| OT1 | `docs/DEVELOPER.md` | Yes | Yes | Medium |
| OT2 | `docs/AUDITOS_PROGRAM_STATUS.md` | Yes | Yes | Medium |
| OT3 | `docs/dev-low-load.md` | Yes | Yes | Low |
| OT4 | `docs/DOCUMENTATION_CONFLICT_REPORT.md` | Yes | No (evidence) | Low |
| OT5 | `docs/clients/sunbul/` (2 files) | Yes | No (client-specific) | Low |
| OT6 | `docs/company/README.md` | Yes | Yes | Low |
| OT7 | `docs/api/README.md` | Yes | Yes | Low |
| OT8 | `docs/notion/README.md` | Yes | No (redirect stub) | Low |
| OT9 | `docs/recovery/README.md` | Yes | No (redirect stub) | Low |
| OT10 | `docs/operations/knowledge-foundation/README.md` | Yes | Yes | Low |
| OT11 | `docs/theoretical-reference/` (21 directories + README) | Yes | No (background) | Low |
| OT12 | `docs/archive/` (14 directories + individual files) | Yes | No (historical) | **Do not read** |

---

## 3. Priority Index — What to Read Based on Your Task

### Always Read First (every session)

| # | File | Purpose |
|---|------|---------|
| 1 | `docs/DOCUMENTATION_AUTHORITY.md` | Conflict resolution, doc hierarchy |
| 2 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Current platform identity + status summary |
| 3 | `AGENTS.md` | Agent operating contract, governance, DoD |
| 4 | `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` | Latest operational snapshot |
| 5 | `README.md` | Entry-level orientation |

### Before Architecture Work

| # | File | Purpose |
|---|------|---------|
| 1 | `docs/official/aqliya-core-architecture-v1.1.md` | Architecture layers and design |
| 2 | `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` | System architecture detail |
| 3 | `docs/source-of-truth/CORE_PLATFORM_ARCHITECTURE.md` | Core platform primitives |
| 4 | `docs/source-of-truth/ROUTE_STRATEGY.md` | Route model and design |
| 5 | `docs/source-of-truth/ROUTE_REGISTRY.md` | Complete route table |

### Before Product Work

| # | File | Purpose |
|---|------|---------|
| 1 | `docs/official/aqliya-product-taxonomy-v1.1.md` | Taxonomy and classification |
| 2 | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | Detailed product status |
| 3 | `docs/official/aqliya-glossary-v1.1.md` | Terminology reference |
| 4 | `docs/source-of-truth/PRODUCT_STATUS_AUTHORITY_MATRIX.md` | Active/frozen/internal status |
| 5 | Relevant `docs/systems/*` or `docs/products/*` docs | Per-product detail |

### Before AI Work

| # | File | Purpose |
|---|------|---------|
| 1 | `docs/official/aqliya-ai-infrastructure-map-v1.0.md` | AI infrastructure map |
| 2 | `docs/source-of-truth/AI_CONTEXT.md` | AI context and capabilities |
| 3 | `docs/source-of-truth/AI_CAPABILITY_MATRIX.md` | AI capabilities detail |
| 4 | AGENTS.md §12 (AI Feature Rules) | AI governance requirements |
| 5 | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` | Commercial truth boundaries |

### Before Deployment

| # | File | Purpose |
|---|------|---------|
| 1 | `docs/deployment/auditos-v0.1-deployment-guide.md` | Current deployment guide |
| 2 | `runbooks/staging-environment.md` | Staging environment setup |
| 3 | `runbooks/disaster-recovery.md` | DR procedures |
| 4 | `runbooks/backup-restore.md` | Backup procedures |
| 5 | `docs/releases/aqliya-v0.1-known-limitations.md` | Known limitations |

### Before Security Work

| # | File | Purpose |
|---|------|---------|
| 1 | AGENTS.md §18 (Security and Privacy Rules) | Security rules |
| 2 | `docs/deployment/auditos-v0.1-security-posture.md` | Security posture |
| 3 | `docs/source-of-truth/ACTION_GUARD_MATRIX.md` | Action guard matrix |
| 4 | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` | What not to claim |

### Before Commercial Work

| # | File | Purpose |
|---|------|---------|
| 1 | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` | Commercial boundaries |
| 2 | `docs/commercial/PILOT_SOW_TEMPLATE.md` | SOW template |
| 3 | `docs/official/aqliya-vision-v1.1.md` | Official vision |
| 4 | `docs/commercial-pack/01-pilot-offer-onepager.md` | Pilot offer |
| 5 | `docs/releases/aqliya-v0.1-known-limitations.md` | What we can't do |

### Before Documentation Work

| # | File | Purpose |
|---|------|---------|
| 1 | `docs/DOCUMENTATION_AUTHORITY.md` | Authority hierarchy |
| 2 | `docs/DOCUMENTATION_GOVERNANCE.md` | Governance rules |
| 3 | `docs/source-of-truth/DOCUMENTATION_LINEAGE.md` | Supersession chain |
| 4 | `docs/README.md` | Current doc index |
| 5 | **This file** (`docs/AI_KNOWLEDGE_MAP.md`) | Knowledge navigation |

---

## 4. Critical Core — Files Every AI Must Read

These 10 files form the AI's foundational knowledge package. Read in this order.

### Step 1: Authority & Orientation

**File 1: `docs/DOCUMENTATION_AUTHORITY.md`**
- **Path:** `docs/DOCUMENTATION_AUTHORITY.md`
- **Exists:** Yes
- **Source of Truth:** Yes
- **Priority:** **Critical**
- **Purpose:** Defines the documentation hierarchy, conflict resolution rules, and agent loading order. The single highest authority for documentation conflicts. Every AI must read this first to understand which documents take priority.
- **Owner:** Architecture / Governance
- **When to read:** **Always** (file #1 every session)
- **Dependencies:** None (root authority)
- **Read next:** `AQLIYA_MASTER_REFERENCE.md`, `AGENTS.md`

**File 2: `docs/official/AQLIYA_MASTER_REFERENCE.md`**
- **Path:** `docs/official/AQLIYA_MASTER_REFERENCE.md`
- **Exists:** Yes
- **Source of Truth:** Yes
- **Priority:** **Critical**
- **Purpose:** Current master reference for AQLIYA v0.1 operational baseline. Summarizes platform identity, trust principle, deployment positioning, product status, and route strategy. The most important "state of the union" document.
- **Owner:** Architecture / Product
- **When to read:** **Always** (file #2 every session)
- **Depends on:** `DOCUMENTATION_AUTHORITY.md`
- **Read next:** `aqliya-vision-v1.1.md`, `PRODUCT_STATUS_MATRIX.md`

### Step 2: Agent Contract

**File 3: `AGENTS.md`**
- **Path:** `AGENTS.md`
- **Exists:** Yes
- **Source of Truth:** Yes
- **Priority:** **Critical**
- **Purpose:** The full agent operating contract (1767 lines). Defines the execution model, task classification, completion levels, governance requirements, AI feature rules, discipline rules, and change management protocols. This is the AI's primary set of instructions for how to operate on this repository.
- **Owner:** Architecture / Platform
- **When to read:** **Always** (file #3 every session)
- **Depends on:** `DOCUMENTATION_AUTHORITY.md`
- **Read next:** `aqliya-implementation-rules-v1.1.md`, `aqliya-product-taxonomy-v1.1.md`

### Step 3: Identity & Taxonomy

**File 4: `docs/official/aqliya-vision-v1.1.md`**
- **Path:** `docs/official/aqliya-vision-v1.1.md`
- **Exists:** Yes
- **Source of Truth:** Yes
- **Priority:** **Critical**
- **Purpose:** Official vision document. Defines what AQLIYA IS and IS NOT, the Trust Principle ("AI assists. Humans decide. Evidence governs."), operating models, and strategic positioning.
- **Owner:** Product / Architecture
- **When to read:** **Always** (file #4 every session)
- **Depends on:** `AQLIYA_MASTER_REFERENCE.md`
- **Read next:** `aqliya-product-taxonomy-v1.1.md`, `aqliya-glossary-v1.1.md`

**File 5: `docs/official/aqliya-product-taxonomy-v1.1.md`**
- **Path:** `docs/official/aqliya-product-taxonomy-v1.1.md`
- **Exists:** Yes
- **Source of Truth:** Yes
- **Priority:** **Critical**
- **Purpose:** Defines the complete product taxonomy: Intelligence Core, Specialized Operating Systems, Shared Applications, Custom Workspaces, Prototypes, and Future Systems. Essential for knowing what products exist, how they relate, and what naming to use.
- **Owner:** Product / Architecture
- **When to read:** **Always** (file #5 every session)
- **Depends on:** `aqliya-vision-v1.1.md`
- **Read next:** `PRODUCT_STATUS_MATRIX.md`, `AQLIYA_CURRENT_STATE.md`

### Step 4: Current Reality

**File 6: `docs/source-of-truth/AQLIYA_CURRENT_STATE.md`**
- **Path:** `docs/source-of-truth/AQLIYA_CURRENT_STATE.md`
- **Exists:** Yes
- **Source of Truth:** **Yes** (★ operational truth)
- **Priority:** **Critical**
- **Purpose:** The most frequently updated operational snapshot. Contains validation results (TypeScript PASS/FAIL, test counts, build status), product strength ratings, top issues, and recent incidents. This is the closest thing to "how are we doing right now."
- **Owner:** Operations / Platform
- **When to read:** **Always** (file #6 every session)
- **Depends on:** `DOCUMENTATION_LINEAGE.md`
- **Read next:** `PRODUCT_STATUS_MATRIX.md`, validation evidence

**File 7: `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`**
- **Path:** `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`
- **Exists:** Yes
- **Source of Truth:** **Yes**
- **Priority:** **Critical**
- **Purpose:** The most comprehensive product-by-product status document. 40+ rows covering all surfaces, maturity levels (L0-L6), routes, release inclusion status, and detailed implementation notes. Essential for understanding what is actually built, at what level, and what is planned.
- **Owner:** Product / Operations
- **When to read:** **Before product work** (also useful as first reference)
- **Depends on:** `AQLIYA_MASTER_REFERENCE.md`, `AQLIYA_CURRENT_STATE.md`
- **Read next:** Relevant `docs/systems/*` or `docs/products/*` docs

### Step 5: Entry Point

**File 8: `README.md`**
- **Path:** `README.md`
- **Exists:** Yes
- **Source of Truth:** Yes (entry-level)
- **Priority:** **Critical**
- **Purpose:** Project entry point. Provides platform identity, product table with routes and status, quickstart, and links to authority docs. Good for initial orientation.
- **Owner:** Platform
- **When to read:** **Always** (file #8 every session)
- **Depends on:** None
- **Read next:** `CLAUDE.md`, `docs/README.md`

### Step 6: Implementation Rules

**File 9: `docs/official/aqliya-implementation-rules-v1.1.md`**
- **Path:** `docs/official/aqliya-implementation-rules-v1.1.md`
- **Exists:** Yes
- **Source of Truth:** Yes
- **Priority:** **Critical** (before any code change)
- **Purpose:** Mandatory rules for any code change. Covers schema discipline, server/client boundaries, governance, AI features, documentation, Arabic/RTL, and route discipline. Must be read before any implementation task.
- **Owner:** Architecture / Platform
- **When to read:** **Before any code change**
- **Depends on:** `AQLIYA_MASTER_REFERENCE.md`, `AGENTS.md`
- **Read next:** `aqliya-core-architecture-v1.1.md`

### Step 7: Commercial Truth

**File 10: `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md`**
- **Path:** `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md`
- **Exists:** Yes
- **Source of Truth:** **Yes**
- **Priority:** **Critical**
- **Purpose:** Explicit list of what AQLIYA does NOT claim as implemented. Essential for preventing commercial overpromise. Must be consulted before any marketing copy, product claims, or customer communications.
- **Owner:** Commercial / Product
- **When to read:** **Before any commercial or marketing work**
- **Depends on:** `AQLIYA_MASTER_REFERENCE.md`, `PRODUCT_STATUS_MATRIX.md`
- **Read next:** `docs/releases/aqliya-v0.1-known-limitations.md`

---

## 5. Recommended Reading Order

This is the curriculum for a new AI to fully understand the project.

### Phase 1: Foundation (Always — every session)

```
1.  docs/DOCUMENTATION_AUTHORITY.md
2.  docs/official/AQLIYA_MASTER_REFERENCE.md
3.  AGENTS.md
4.  docs/official/aqliya-vision-v1.1.md
5.  docs/official/aqliya-product-taxonomy-v1.1.md
6.  docs/source-of-truth/AQLIYA_CURRENT_STATE.md
7.  docs/source-of-truth/PRODUCT_STATUS_MATRIX.md
8.  README.md
```

### Phase 2: Deep Context (read once, then reference)

```
 9.  docs/official/aqliya-implementation-rules-v1.1.md
10.  docs/official/aqliya-core-architecture-v1.1.md
11.  docs/official/aqliya-glossary-v1.1.md
12.  docs/source-of-truth/DOCUMENTATION_LINEAGE.md
13.  docs/source-of-truth/ROUTE_STRATEGY.md
14.  docs/source-of-truth/ROUTE_REGISTRY.md
15.  docs/source-of-truth/AQLIYA_ARCHITECTURE.md
16.  docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md
17.  docs/README.md
18.  docs/DOCUMENTATION_GOVERNANCE_v2.md
19.  docs/commercial/WHAT_WE_DO_NOT_CLAIM.md
20.  docs/releases/aqliya-v0.1-known-limitations.md
21.  docs/releases/aqliya-v0.1-release-scope.md
22.  docs/DEVELOPER.md
```

### Phase 3: Domain-Specific (read when relevant)

```
23.  docs/official/aqliya-ai-infrastructure-map-v1.0.md   (AI work)
24.  docs/source-of-truth/AI_CONTEXT.md                   (AI work)
25.  docs/source-of-truth/AI_CAPABILITY_MATRIX.md         (AI work)
26.  docs/source-of-truth/CORE_PLATFORM_ARCHITECTURE.md   (platform work)
27.  docs/official/aqliya-agent-context-v1.1.md           (agent work)
28.  docs/official/aqliya-skill-context-v1.1.md           (skill work)
29.  docs/official/AQLIYA_ROADMAP_v1.2.md                 (planning)
30.  docs/source-of-truth/READINESS_GATES.md              (release work)
31.  docs/source-of-truth/PRODUCT_STATUS_AUTHORITY_MATRIX.md  (product work)
```

### Phase 4: Per-Product Deep Dives

For each product, read the relevant system/product docs:

```
AuditOS:      docs/systems/auditos/*
DecisionOS:   docs/systems/decisionos/*
LocalContentOS: docs/systems/local-content-os/*, docs/products/localcontentos-v0.1/*
WorkflowOS:   docs/products/workflowos/*
SalesOS:      docs/systems/salesos/*
Office AI:    docs/products/office-ai-assistant-foundation-design.md
```

### Phase 5: Deployment & Operations (before deployment)

```
 32.  docs/deployment/auditos-v0.1-deployment-guide.md
 33.  runbooks/staging-environment.md
 34.  runbooks/disaster-recovery.md
 35.  runbooks/backup-restore.md
 36.  runbooks/monitoring.md
 37.  runbooks/alerting.md
 38.  runbooks/rate-limiter.md
```

### Phase 6: Pilot & Commercial (before customer work)

```
 39.  docs/pilot/PILOT-PACK-INDEX.md
 40.  docs/pilot/PILOT-SCOPE.md
 41.  docs/commercial/PILOT_SOW_TEMPLATE.md
 42.  docs/pilot/RISK-DISCLOSURE.md
 43.  docs/commercial-pack/01-pilot-offer-onepager.md
```

---

## 6. Document Classification System

### 6.1 Category Definitions

| Category | Description | Examples |
|----------|-------------|----------|
| **Source of Truth** | Canonical, maintained, authoritative documents that define current identity, architecture, status, and rules | `DOCUMENTATION_AUTHORITY.md`, `AQLIYA_MASTER_REFERENCE.md`, `AGENTS.md`, `PRODUCT_STATUS_MATRIX.md`, `WHAT_WE_DO_NOT_CLAIM.md` |
| **Architecture** | System design, route strategy, core platform primitives | `aqliya-core-architecture-v1.1.md`, `AQLIYA_ARCHITECTURE.md`, `CORE_PLATFORM_ARCHITECTURE.md`, `ROUTE_STRATEGY.md` |
| **Product** | Per-product documentation, specs, runbooks | `docs/systems/*`, `docs/products/*` |
| **Governance** | Rules, policies, authority hierarchy, conflict resolution | `DOCUMENTATION_AUTHORITY.md`, `DOCUMENTATION_GOVERNANCE_v2.md`, `DOCUMENTATION_LINEAGE.md`, `aqliya-implementation-rules-v1.1.md` |
| **Security** | Security posture, risk acceptance, action guards | `auditos-v0.1-security-posture.md`, `ACTION_GUARD_MATRIX.md`, `RISK_ACCEPTANCE_REPORT.md` |
| **AI** | AI infrastructure, context, capabilities, governance | `aqliya-ai-infrastructure-map-v1.0.md`, `AI_CONTEXT.md`, `AI_CAPABILITY_MATRIX.md` |
| **Operational** | Current state, validation status, runbooks | `AQLIYA_CURRENT_STATE.md`, `docs/releases/aqliya-v0.1-known-limitations.md`, `runbooks/*` |
| **Deployment** | Deployment guides, environment inventory, migration | `docs/deployment/*`, `runbooks/staging-environment.md` |
| **Commercial** | Sales materials, pilot packs, SOW templates | `docs/commercial/*`, `docs/commercial-pack/*` |
| **Roadmaps** | Strategic direction, phase plans, completion programs | `AQLIYA_ROADMAP_v1.2.md`, `aqliya-roadmap-v1.1.md`, `L6_COMPLETION_PROGRAM.md` |
| **Evidence/Reports** | Validation results, phase reports, audit findings (snapshots) | `docs/validation/*`, `docs/audits/*`, `docs/deliverables/*` |
| **Historical** | Superseded docs, archived content, pilot session records | `docs/archive/*` |
| **Background** | Theoretical foundation, domain theory (non-binding) | `docs/theoretical-reference/*` |
| **Strategic** | Forward-looking strategy, due diligence, planning | `docs/strategic-due-diligence-2026-06-19/*` |

### 6.2 Source of Truth Documents (Master List)

These are the ONLY documents that carry authoritative weight. All other docs are supporting, evidence, or historical.

**Canonical hierarchy defined in:** `docs/DOCUMENTATION_GOVERNANCE_v2.md §9`

| File | Category | Authority Level |
|------|----------|-----------------|
| `docs/DOCUMENTATION_AUTHORITY.md` | Governance | **L0 — Highest** |
| `docs/official/AQLIYA_MASTER_REFERENCE.md` | Architecture/Product | **L1** |
| `docs/official/AQLIYA_ROADMAP_v1.2.md` | Roadmap | **L1** |
| `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` | Operational | **L1 (★ operational truth)** |
| `docs/official/aqliya-vision-v1.1.md` | Governance/Identity | **L2** |
| `docs/official/aqliya-product-taxonomy-v1.1.md` | Product | **L2** |
| `docs/official/aqliya-core-architecture-v1.1.md` | Architecture | **L2** |
| `docs/official/aqliya-implementation-rules-v1.1.md` | Governance | **L2** |
| `docs/official/aqliya-glossary-v1.1.md` | Product | **L2** |
| `docs/official/aqliya-ai-infrastructure-map-v1.0.md` | AI | **L2** |
| `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | Product/Operational | **L3** |
| `docs/source-of-truth/ROUTE_STRATEGY.md` | Architecture | **L3** |
| `docs/source-of-truth/ROUTE_REGISTRY.md` | Architecture | **L3** |
| `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` | Architecture | **L3** |
| `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` | Architecture | **L3** |
| `docs/source-of-truth/DOCUMENTATION_LINEAGE.md` | Governance | **L3** |
| `docs/source-of-truth/AI_CONTEXT.md` | AI | **L3** |
| `docs/source-of-truth/AI_CAPABILITY_MATRIX.md` | AI | **L3** |
| `docs/source-of-truth/CORE_PLATFORM_ARCHITECTURE.md` | Architecture | **L3** |
| `AGENTS.md` | Governance | **L4** |
| `README.md` | Platform | **L4 (entry)** |
| `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` | Commercial | **L5** |

---

## 7. Document Issues — Duplicates, Obsolete, and Conflicts

### 7.1 Duplicate/Overlapping Documents

| Conflict | Files | Issue | Resolution |
|----------|-------|-------|------------|
| Overlapping authority | `docs/DOCUMENTATION_AUTHORITY.md` vs `docs/DOCUMENTATION_GOVERNANCE.md` vs `docs/DOCUMENTATION_GOVERNANCE_v2.md` | Both define hierarchy and rules. v1 is deprecated. v2 is active. | Follow `DOCUMENTATION_AUTHORITY.md` (highest authority). `DOCUMENTATION_GOVERNANCE_v2.md` is active governance. v1 is deprecated. |
| Two roadmaps | `docs/official/aqliya-roadmap-v1.1.md` vs `docs/official/AQLIYA_ROADMAP_v1.2.md` | v1.1 partially superseded by v1.2 | Read v1.2 for current strategy. v1.1 is historical. |
| Two architecture docs | `docs/official/aqliya-core-architecture-v1.1.md` vs `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` | Overlapping architecture descriptions | Core architecture (official) is doctrine. ARCHITECTURE.md (source-of-truth) is implementation detail. |
| Two product status docs | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` vs `docs/source-of-truth/PRODUCT_STATUS_AUTHORITY_MATRIX.md` | Different status listings | `PRODUCT_STATUS_MATRIX.md` is the primary. Authority matrix is supplementary for active/frozen/internal labels. |
| Two current state docs | `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` vs `docs/source-of-truth/CURRENT_REALITY_MATRIX.md` | Overlapping "current state" claims | `AQLIYA_CURRENT_STATE.md` (v1.6, 2026-06-18) is the maintained one. `CURRENT_REALITY_MATRIX.md` may be stale. |
| Overlapping contexts | `docs/official/aqliya-agent-context-v1.1.md` vs `AGENTS.md` | Both define agent behavior | `AGENTS.md` is the primary agent contract. `aqliya-agent-context-v1.1.md` is a supporting reference. |

### 7.2 Superseded Documents (Do Not Read for Current Decisions)

| File | Superseded By | Date |
|------|---------------|------|
| `docs/DOCUMENTATION_GOVERNANCE.md` | `docs/DOCUMENTATION_GOVERNANCE_v2.md` | 2026-06-26 |
| `docs/official/aqliya-roadmap-v1.1.md` | `docs/official/AQLIYA_ROADMAP_v1.2.md` | 2026-06-03 |
| `docs/source-of-truth/ENTERPRISE_COMPLETION_ROADMAP.md` | `AQLIYA_ROADMAP_v1.2.md`, `L6_COMPLETION_PROGRAM.md` | 2026-06-03 |
| `docs/source-of-truth/L6_PRODUCTION_ROADMAP.md` | `L6_COMPLETION_PROGRAM.md` | 2026-06-03 |
| `docs/audits/reality-audit-2026-06-17/FINAL_REALITY_AUDIT.md` | `AQLIYA_CURRENT_STATE.md` | 2026-06-18 |
| `docs/audits/forensic-audit-2026-06-17/` (all 17 files) | Repository cleanup (Phase 13) resolved most findings | 2026-06-17 |
| `docs/audits/recovery-strategy-2026-06-17/` (all 9 files) | Stale — replaced by ongoing operations | 2026-06-17 |
| `docs/audits/TB_CLASSIFICATION_BENCHMARK.md` (Phase 1A) | `TB_CLASSIFICATION_REBENCHMARK.md` | 2026-06-17 |
| Root-level: `BUILD_FAILURE_MATRIX.md`, `BUILD_STABILIZATION_REPORT.md` | Build has been stable since Phase 7 | 2026-05-28 |
| Root-level: `AQLIYA_Website_Content_Review_AR.md` | Archived in `docs/archive/root-docs/` | 2026-06-17 |
| Root-level: `AQLIYA_NOTION_MODERNIZATION_PROGRAM.md` | Archived in `docs/archive/root-docs/` | 2026-06-17 |
| Root-level: `WIP_CLUSTER_REPORT.md` | Archived in `docs/archive/root-docs/` | 2026-06-17 |
| `docs/audits/FACTORY_ACCURACY_AUDITED_FS_V1..V4.md` | Each superseded by next version | Various |
| `docs/execution/auditos-next-build-plan.md` | Execution docs flagged as stale by `docs/README.md` | Pre-2026-06 |

### 7.3 Archived Documents

All files under `docs/archive/` are historical. Key subdirectories:

| Archive Subdirectory | Contents |
|---------------------|----------|
| `sunbul-product-legacy/` (22 files + 2 subdirs) | Sunbul product definition, implementation reports, pilot execution board |
| `pilot-history/` (30+ files across 3 subdirs) | Pilot session reports, dry run materials |
| `root-docs/` (5 files) | Root-level docs that were moved here |
| `root-planning-scratch/` (6 files) | Early planning materials |
| `legacy-numbered/` | Pre-v1.1 numbered documentation |
| `historical-strategy/` | Historical strategy docs |
| `execution-stale/` | Stale execution documents |
| `content-drafts/` | Superseded website content |
| `commercial-legacy/` | Archived commercial materials |
| `agent-reports-2026-05/` | Agent-generated reports from May 2026 |
| `old-reports/` | Old reports |
| `retention/` | (Contains actual TypeScript code — unusual for archive) |
| Individual files: `TESTING_CHECKLIST.md`, `SYSTEM_STATUS.md`, `RELEASE_NOTES.md`, `PILOT_LAUNCH_CHECKLIST.md` | Individual archived files |

### 7.4 Temporary/Generated Reports (Evidence, Not Doctrine)

The following directories contain temporal snapshots. They are useful as evidence but must not be treated as current source of truth:

| Directory | Contents | When to Use |
|-----------|----------|-------------|
| `docs/validation/` | ~32 files across 10 subdirectories | Use for historical evidence only. Current status comes from `AQLIYA_CURRENT_STATE.md` |
| `docs/deliverables/` | ~55 files across 2 subdirectories | Phase implementation reports. Evidence for completion claims |
| `docs/audits/` | ~80+ files across 5 subdirectories | Historical audit snapshots. Only `truth-reconciliation-2026-06-18/` has medium currency |
| `docs/strategic-due-diligence-2026-06-19/` | 15 files | Strategic analysis — valuable context but not binding |
| `docs/releases/` subdirectories | 10+ phased program directories | Development artifacts, not current reference |

### 7.5 Files That Should Exist But Do Not Yet

| Missing File | Importance | Notes |
|-------------|------------|-------|
| `docs/ai-review-center-log.md` or similar | Low | Only `docs/deliverables/review-center-log-2026-06-17.md` exists |
| Single architecture diagram file | Medium | Architecture is text-only across multiple docs |
| Cross-reference index for all products/routes | Medium | `ROUTE_REGISTRY.md` and `ROUTE_STRATEGY.md` together serve this purpose |
| Consolidated Prisma schema reference doc | Low | Schema is in `prisma/schema.prisma` |

### 7.6 Anomalous Items

| Item | Path | Issue |
|------|------|-------|
| TypeScript source in archive | `docs/archive/retention/retention/*.ts` | Code files in a documentation directory. These appear to be a retention engine implementation stored in docs. Should be in `src/` or clearly identified. |
| Desktop.ini files everywhere | `docs/**/desktop.ini` | Windows shell configuration files. Harmless but noisy for AI scans. |
| Root-level `.docx` and `.pptx` files | `AQLIYA_Enterprise_Deck_v3.pptx`, `AQLIYA_Strategic_Audit_2026.docx`, `AQLIYA_Repositioning_Content_2026.docx` | Binary commercial documents at repo root. Not accessible to AI assistants. |
| Root-level `.xlsx` files | `TB 31-12-2025 Final.xlsx`, `TB.xlsx`, `TB_manufacturing_SAMA.xlsx`, `Local_Content_Verification_Audit_Matrix_v1.xlsx` | Data files at repo root. |
| `SOCPA_COMPLETE_ANALYSIS.md` at root | Root level | Single analysis doc that should likely be in `docs/` or `docs/deliverables/` |
| Root-level PDF | `Audited FSs 31-12-2025.pdf` | Audit financial statements at repo root |

---

## 8. Document Hierarchy Visualization

*(Canonical hierarchy defined in `docs/DOCUMENTATION_GOVERNANCE_v2.md §9`. This visualization extends with evidence, background, and archive layers.)*

```
L0  docs/DOCUMENTATION_AUTHORITY.md
 │
 ├── L1  docs/official/AQLIYA_MASTER_REFERENCE.md  (identity + operational summary)
 ├── L1  docs/official/AQLIYA_ROADMAP_v1.2.md      (strategy)
 ├── L1  docs/source-of-truth/AQLIYA_CURRENT_STATE.md  (★ operational truth)
 │
 ├── L2  docs/official/aqliya-vision-v1.1.md        (doctrine: vision)
 ├── L2  docs/official/aqliya-product-taxonomy-v1.1.md  (doctrine: taxonomy)
 ├── L2  docs/official/aqliya-core-architecture-v1.1.md (doctrine: architecture)
 ├── L2  docs/official/aqliya-implementation-rules-v1.1.md (doctrine: rules)
 ├── L2  docs/official/aqliya-glossary-v1.1.md      (doctrine: terminology)
 ├── L2  docs/official/aqliya-ai-infrastructure-map-v1.0.md (doctrine: AI)
 ├── L2  docs/official/aqliya-skill-context-v1.1.md (doctrine: skills)
 ├── L2  docs/official/aqliya-agent-context-v1.1.md (doctrine: agents)
 │
 ├── L3  docs/source-of-truth/* (20+ supporting docs: PRODUCT_STATUS_MATRIX.md,
 │       ROUTE_STRATEGY.md, ROUTE_REGISTRY.md, AQLIYA_ARCHITECTURE.md,
 │       AQLIYA_SYSTEM_TAXONOMY.md, DOCUMENTATION_LINEAGE.md, etc.)
 │       └── L3  PRODUCT_STATUS_MATRIX.md    (detailed per-product)
 │       └── L3  ROUTE_REGISTRY.md + ROUTE_STRATEGY.md (route map)
 │
 ├── L4  AGENTS.md                                  (agent operating contract)
 ├── L4  README.md                                  (project entry point)
 ├── L4  docs/README.md                             (documentation index)
 │
 ├── L5  docs/commercial/WHAT_WE_DO_NOT_CLAIM.md    (commercial boundaries)
 │
 ├── L6  docs/systems/*, docs/products/*, docs/pilot/*, docs/commercial/*,
 │       docs/deployment/*, docs/releases/*, runbooks/*
 │
 ├── L7  docs/validation/*, docs/deliverables/*, docs/audits/* (evidence)
 │
 ├── L8  docs/theoretical-reference/*              (background only)
 │
 └── L9  docs/archive/*                            (historical only)
```

---

## 9. Ownership by Domain

| Domain | Routes | Key Files |
|--------|--------|-----------|
| **Architecture** | `docs/official/aqliya-core-architecture-v1.1.md`, `docs/source-of-truth/AQLIYA_ARCHITECTURE.md`, `CORE_PLATFORM_ARCHITECTURE.md`, `ROUTE_STRATEGY.md`, `ROUTE_REGISTRY.md` |
| **Product** | `docs/official/aqliya-product-taxonomy-v1.1.md`, `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`, `docs/systems/*`, `docs/products/*` |
| **Governance** | `docs/DOCUMENTATION_AUTHORITY.md`, `docs/DOCUMENTATION_GOVERNANCE_v2.md`, `docs/source-of-truth/DOCUMENTATION_LINEAGE.md`, `AGENTS.md` |
| **Security** | `docs/deployment/auditos-v0.1-security-posture.md`, `docs/source-of-truth/ACTION_GUARD_MATRIX.md` |
| **AI** | `docs/official/aqliya-ai-infrastructure-map-v1.0.md`, `docs/source-of-truth/AI_CONTEXT.md`, `docs/source-of-truth/AI_CAPABILITY_MATRIX.md` |
| **Platform** | `AGENTS.md`, `README.md`, `docs/releases/aqliya-v0.1-known-limitations.md` |
| **Operations** | `docs/source-of-truth/AQLIYA_CURRENT_STATE.md`, `runbooks/*` |
| **Deployment** | `docs/deployment/*`, `runbooks/staging-environment.md` |
| **Commercial** | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md`, `docs/commercial/*`, `docs/commercial-pack/*` |
| **Documentation** | `docs/README.md`, `docs/AI_KNOWLEDGE_MAP.md` (this file) |

---

## 10. Recommended File Descriptions for AI Systems

Many AI coding tools (Cursor, Copilot, etc.) support file descriptions that are injected into context automatically. The following descriptions are recommended for the critical files:

| File | Recommended Description |
|------|------------------------|
| `docs/DOCUMENTATION_AUTHORITY.md` | Highest documentation authority. Defines hierarchy, conflict resolution, and AI loading order. Read first. |
| `AGENTS.md` | Agent operating contract. Governance, task classification, completion levels, AI rules, security, and discipline. Read every session. |
| `README.md` | Project entry point. Platform identity, product table, quickstart. |
| `docs/official/AQLIYA_MASTER_REFERENCE.md` | Current master reference. Platform identity, trust principle, product status, route strategy summary. |
| `docs/official/aqliya-vision-v1.1.md` | Official vision. What AQLIYA is/is not, trust principle, operating models. |
| `docs/official/aqliya-product-taxonomy-v1.1.md` | Product taxonomy. Intelligence Core, Specialized Operating Systems, Shared Apps, Workspaces classification. |
| `docs/official/aqliya-core-architecture-v1.1.md` | Architecture layers: Presentation, Actions, Intelligence Core (12 engines), Domain Surfaces, Infrastructure. |
| `docs/official/aqliya-implementation-rules-v1.1.md` | Mandatory implementation rules. Schema discipline, server/client boundaries, governance, AI features. |
| `docs/official/aqliya-glossary-v1.1.md` | Official terminology reference. Company, runtime, product, and governance terms. |
| `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` | ★ Operational truth. Current validation status, product strength ratings, recent incidents. |
| `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | Complete product status. 40+ rows, L0-L6 maturity, routes, implementation notes. |
| `docs/source-of-truth/ROUTE_STRATEGY.md` | Route model and workspace/demo separation. Complete route table. |
| `docs/source-of-truth/DOCUMENTATION_LINEAGE.md` | Documentation authority graph and supersession chain. |
| `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` | Explicit list of capabilities NOT claimed. Prevent commercial overpromise. |
| `docs/releases/aqliya-v0.1-known-limitations.md` | Known limitations and exclusions for v0.1 release. |

---

## 11. Validation

This map was produced by auditing the following locations:

- Root directory (`/`) — 127 entries inspected
- `docs/` — full recursive glob (200+ unique `.md` files)
- `docs/official/` — 14 files
- `docs/source-of-truth/` — 26 files
- `docs/systems/` — 5 product directories
- `docs/products/` — 10+ product directories
- `docs/pilot/` — 50+ files
- `docs/commercial/` — 10+ files
- `docs/deployment/` — 8 files
- `docs/releases/` — 10+ files + 10+ subdirectories
- `docs/validation/` — 32 files across 10 subdirectories
- `docs/deliverables/` — 55+ files across 2 subdirectories
- `docs/audits/` — 80+ files across 5 subdirectories
- `docs/theoretical-reference/` — 21 directories
- `docs/archive/` — 14 subdirectories + individual files
- `docs/strategic-due-diligence-2026-06-19/` — 15 files
- `docs/execution/` — 6 files
- `runbooks/` — 7 files
- Root metadata files (AGENTS.md, README.md, CLAUDE.md, etc.)
- `.skills/` — skill evaluation framework (100+ files)
- `.claude/` — worktrees with strategy docs

---

> **Next recommended step:** Consider creating a simple `docs/CONTEXT_FOR_AI.md` that can be loaded as a single context file by AI tools, containing condensed versions of the 10 critical core files listed in Section 4. This is optional — this map already provides the structured entry point.
