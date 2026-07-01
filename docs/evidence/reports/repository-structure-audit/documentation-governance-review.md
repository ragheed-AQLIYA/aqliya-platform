# Documentation Governance Review

## Official Docs (Highest Authority)

| Doc | Status | Notes |
|-----|--------|-------|
| `docs/official/aqliya-vision-v1.1.md` | ✅ Keep | Core identity — AQLIYA is NOT AuditOS-only, NOT SaaS-only |
| `docs/official/aqliya-implementation-rules-v1.1.md` | ✅ Keep | Mandatory coding rules |
| `docs/official/aqliya-product-taxonomy-v1.1.md` | ✅ Keep | Product boundaries and status |
| `docs/official/aqliya-core-architecture-v1.1.md` | ✅ Keep | Architecture layers and engine status |
| `docs/official/aqliya-glossary-v1.1.md` | ✅ Keep | Terminology reference |
| `docs/official/aqliya-roadmap-v1.1.md` | ✅ Keep | Execution roadmap |
| `docs/official/aqliya-agent-context-v1.1.md` | ✅ Keep | Agent context |
| `docs/official/aqliya-skill-context-v1.1.md` | ✅ Keep | Development skills |

## Source-of-Truth Docs (v1.0, Aligned)

| Doc | Status | Notes |
|-----|--------|-------|
| `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` | ✅ Keep | Route model |
| `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` | ✅ Keep | System classification |
| `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | ✅ Keep | Implementation status |
| `docs/source-of-truth/ROUTE_STRATEGY.md` | ✅ Keep | Route rules |
| `docs/source-of-truth/AQLIYA_THEORETICAL_DOCUMENTATION_SYSTEM.md` | ✅ Keep | Theoretical doc system reference |
| `docs/source-of-truth/AQLIYA-company-product-architecture-official.md` | 🔶 Review | May duplicate v1.1 product taxonomy |
| ~~`docs/source-of-truth/aqlia-auditos-boundaries.md`~~ → `docs/source-of-truth/aqliya-auditos-boundaries.md` | ✅ Fixed | Typo corrected in Phase 1 |
| `docs/source-of-truth/OPERATIONAL_FREEZE_STATUS.md` | ✅ Keep | Operational status |
| `docs/source-of-truth/PILOT_RUNBOOK.md` | ✅ Keep | Pilot runbook |
| `docs/source-of-truth/READINESS_GATES.md` | ✅ Keep | Readiness gates |
| `docs/source-of-truth/AI_CONTEXT.md` | 🔶 Review | May duplicate AGENTS.md — needs comparison |

## System Docs

| Doc | Status | Notes |
|-----|--------|-------|
| `docs/systems/auditos/README.md` | ✅ Keep | AuditOS system docs |
| `docs/systems/AUDITOS_OPERATOR_MANUAL.md` | ✅ Keep | Operator manual |
| `docs/systems/decisionos/` (14 files) | ✅ Keep | DecisionOS system docs |
| `docs/systems/salesos/README.md` | ✅ Keep | SalesOS (shell only) |
| `docs/systems/local-content-os/README.md` | ✅ Keep | LocalContentOS (marketing only) |
| `docs/systems/simulationos/README.md` | ✅ Keep | SimulationOS (marketing only) |

## Docs with Potential Issues

### 1. Pre-v1.1 Numbered Documentation Folders

These numbered folders (e.g., `docs/01-product-foundation/`, `docs/04-financial-statements/`) were written before v1.1 and may contain:
- Positioning AQLIYA as AuditOS-only
- Positioning AQLIYA as SaaS-only
- Naming inconsistencies

**Recommendation:** Archive these folders under `docs/archive/legacy-numbered/`.

**Status:** ✅ **Completed in Phase 1.** Four folders (`01-product-foundation`, `04-financial-statements`, `06-evidence-and-review`, `07-ai-governance`) moved to `docs/archive/legacy-numbered/`. Remaining numbered folders (`02-accounting-methodology`, `03-audit-methodology`, `05-notes-system`) still in root — evaluation pending.

### 2. AuditOS-Specific Folders in `docs/auditos/`

Many files in `docs/auditos/` describe AQLIYA through an AuditOS-only lens. They are operationally useful for the pilot but should not be used as company-wide reference.

**Recommendation:** Keep in place but ensure they are clearly scoped to AuditOS operations, not AQLIYA platform identity.

### 3. `docs/product/` Files

| Doc | Status | Notes |
|-----|--------|-------|
| `docs/product/decisionos-product-definition-pack.md` | 🔶 Review | May duplicate v1.1 product definitions |
| `docs/product/salesos-product-definition-pack.md` | 🔶 Review | May duplicate v1.1 product definitions |
| `docs/product/simulationos-product-definition-pack.md` | 🔶 Review | Marketing-only product |
| `docs/product/aqliya-product-comparison-and-recommendation.md` | 🔶 Review | May need alignment with v1.1 taxonomy |

### 4. `docs/content/` — Website Content Drafts

Multiple draft versions (v1, v2, v3-chatGPT, v3-hybrid, etc.) — many outdated. The `IMPLEMENTATION_CHECKLIST.md` may refer to old site structure.

**Recommendation:** Archive old drafts; keep current version only.

### 5. `docs/reports/` — Reports

| Doc | Status | Notes |
|-----|--------|-------|
| `docs/reports/stabilization/` (5 phase reports) | ✅ Keep | Historical record of v1.1 alignment work |
| `docs/reports/audits/AQLIYA_FULL_PROJECT_AUDIT_REPORT.md` | ✅ Keep | Historical audit |
| `docs/reports/audits/AQLIYA_CONTROLLED_PILOT_EXECUTION_REPORT.md` | ✅ Keep | Pilot audit |

### 6. `docs/theoretical-reference/` — Massive but Intentional

This 21-section library (~400 files) is the full theoretical foundation. It was generated as a comprehensive knowledge base. While massive, it is intentional and serves as the philosophical underpinning.

**Recommendation:** Keep as-is. Do not delete. Do not move. It is referenced by `docs/official/` hierarchy as the fourth-level supporting docs.

### 7. `docs/commercial/` vs `docs/commercial-pack/`

Two commercial folders exist — one tracked (likely older), one untracked (newer commercial pack).

**Recommendation:** Review for duplicates; archive older versions.

### 8. `docs/runtime-prototypes/` — Heavy Weight

~30 files documenting runtime governance prototyping (phases 6-7-8, various observations).

**Recommendation:** Keep; contains valuable human-review behavioral observations. Consider archiving completed phases.

### 9. `docs/pilot/` vs `docs/pilot/controlled-execution/` vs `docs/pilot/execution-pack/`

Three sub-areas within pilot docs. Some duplication likely.

**Recommendation:** Consolidate during Phase 1.

## Potential Conflicting Claims with v1.1

1. Older docs describing AQLIYA as "an AI audit assistant" or "AuditOS platform" — contradict v1.1 identity
2. Older docs describing SaaS-only deployment — contradict Cloud + Private dual strategy
3. `docs/source-of-truth/AQLIYA-company-product-architecture-official.md` may claim On-Prem as implemented — v1.1 says strategic/future
4. `docs/source-of-truth/aqlia-auditos-boundaries.md` — typo in name ("aqlia" not "aqliya") ✅ **Fixed in Phase 1** → renamed to `aqliya-auditos-boundaries.md`

## Summary of Actions (Phase 1 Completed)

| Action | Count | Status | Examples |
|--------|-------|--------|---------|
| ✅ Keep as-is | ~15 folders | ✅ Done | `official/`, `source-of-truth/`, `systems/`, `theoretical-reference/` |
| 🔶 Review for conflicts | ~8 files | Pending | `product/*.md`, `aqliya-auditos-boundaries.md` (typo fixed), `AI_CONTEXT.md` |
| 📦 Archive old/duplicate | ~4 folders | ✅ Phase 1 done | Numbered doc folders, old content drafts now in `archive/` |
| 🔀 Merge duplicates | ~3 pairs | Partial | `commercial/` + `commercial-pack/` reviewed; `COMMERCIAL_DUPLICATION_REVIEW.md` created |
