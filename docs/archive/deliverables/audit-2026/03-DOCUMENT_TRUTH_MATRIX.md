# DOCUMENT TRUTH MATRIX — AQLIYA
**Date:** 2026-06-20

Maps every major document against its authority level, current status, and relationship to code reality.

---

## 1. Authority Classification System

```
AUTHORITATIVE  → Must be followed; highest authority for its domain
SUPPORTING    → Reference/guidance; complements authoritative docs
HISTORICAL    → Past decisions; may be outdated
DEPRECATED    → Explicitly replaced; should not be used
ARCHIVE       → Preserved for reference; not active
```

## 2. Official Doctrine Documents (docs/official/)

| Document | Classification | Status | Notes |
|----------|---------------|--------|-------|
| `aqliya-vision-v1.1.md` | **AUTHORITATIVE** | ✅ Current | Core identity document |
| `AQLIYA_MASTER_REFERENCE.md` | **AUTHORITATIVE** | ✅ Current | Master reference, synced after hardening |
| `aqliya-product-taxonomy-v1.1.md` | **AUTHORITATIVE** | ✅ Current | Product boundaries |
| `aqliya-core-architecture-v1.1.md` | **AUTHORITATIVE** | ✅ Current | Architecture doctrine |
| `aqliya-glossary-v1.1.md` | **AUTHORITATIVE** | ✅ Current | Terminology |
| `aqliya-implementation-rules-v1.1.md` | **AUTHORITATIVE** | ✅ Current | Implementation guardrails |
| `aqliya-skill-context-v1.1.md` | **AUTHORITATIVE** | ✅ Current | Skill taxonomy |
| `aqliya-agent-context-v1.1.md` | **AUTHORITATIVE** | ✅ Current | Agent context |
| `aqliya-roadmap-v1.1.md` | **AUTHORITATIVE** | ✅ Current | Roadmap (v1.1) |
| `AQLIYA_ROADMAP_v1.2.md` | **AUTHORITATIVE** | ⚠️ Supersedes v1.1 | v1.2 exists alongside v1.1 |
| `aqliya-opencode-operating-system.md` | **AUTHORITATIVE** | ✅ Current | OpenCode system |
| `aqliya-skill-os-v1.0.md` | **AUTHORITATIVE** | ✅ Current | Skill OS definition (109KB) |
| `audit-arabic-terminology-glossary-v1.md` | **AUTHORITATIVE** | ✅ Current | Arabic terminology |

## 3. Source of Truth Documents (docs/source-of-truth/)

| Document | Classification | Status | Notes |
|----------|---------------|--------|-------|
| `PRODUCT_STATUS_MATRIX.md` | **AUTHORITATIVE** (product status) | ✅ Current | Synced after hardening |
| `ROUTE_STRATEGY.md` | **AUTHORITATIVE** (routes) | ✅ Current | Synced after hardening |
| `AQLIYA_ARCHITECTURE.md` | **AUTHORITATIVE** (architecture) | ✅ Current | Synced after hardening |
| `AQLIYA_SYSTEM_TAXONOMY.md` | **SUPPORTING** | ✅ Current | System taxonomy |
| `ROUTE_REGISTRY.md` | **SUPPORTING** | ✅ Current | Route detail |
| `READINESS_GATES.md` | **SUPPORTING** | ✅ Current | Gates definition |
| `CORE_PLATFORM_ARCHITECTURE.md` | **SUPPORTING** | ✅ Current | Core architecture detail |
| `PILOT_RUNBOOK.md` | **SUPPORTING** | ✅ Current | Pilot operations |
| `AI_CAPABILITY_MATRIX.md` | **SUPPORTING** | ✅ Current | AI capabilities |
| `ACTION_GUARD_MATRIX.md` | **SUPPORTING** | ✅ Current | Action guards |
| `AI_CONTEXT.md` | **SUPPORTING** | ✅ Current | AI context |
| `CURRENT_REALITY_MATRIX.md` | **SUPPORTING** | ✅ Current | Reality matrix |
| `AQLIYA_CURRENT_STATE.md` | **SUPPORTING** | ✅ Current | Current state |
| `EXECUTION_DEPENDENCY_GRAPH.md` | **SUPPORTING** | ✅ Current | Dependencies |
| `L6_COMPLETION_PROGRAM.md` | **SUPPORTING** | ✅ Current | L6 program |
| `L6_PRODUCTION_ROADMAP.md` | **SUPPORTING** | ✅ Current | L6 roadmap |
| `OPERATIONAL_FREEZE_STATUS.md` | **SUPPORTING** | ✅ Current | Freeze status |
| `PARALLEL_REMEDIATION_GATES.md` | **SUPPORTING** | ✅ Current | Remediation gates |
| `ROADMAP_CONFLICT_MATRIX.md` | **SUPPORTING** | ✅ Current | Roadmap conflict |
| `PRODUCT_STATUS_AUTHORITY_MATRIX.md` | **SUPPORTING** | ✅ Current | Status authority |
| `ENTERPRISE_COMPLETION_ROADMAP.md` | **SUPPORTING** | ✅ Current | Enterprise roadmap |
| `DOCUMENTATION_LINEAGE.md` | **SUPPORTING** | ✅ Current | Doc lineage |
| `aqliya-auditos-boundaries.md` | **SUPPORTING** | ✅ Current | AuditOS boundaries |
| `AQLIYA-company-product-architecture-official.md` | **SUPPORTING** | ✅ Current | Company architecture |

## 4. Root-Level Documents

| Document | Classification | Status | Notes |
|----------|---------------|--------|-------|
| `AGENTS.md` | **AUTHORITATIVE** (agent behavior) | ✅ Current | Primary operating contract |
| `CLAUDE.md` | **AUTHORITATIVE** (Claude sessions) | ✅ Current | Secondary agent config |
| `DOCUMENTATION_AUTHORITY.md` | **AUTHORITATIVE** (conflict resolution) | ✅ Current | Authority hierarchy |
| `README.md` | **SUPPORTING** | ✅ Current | Project README |
| `DOCUMENTATION_CONFLICT_REPORT.md` | **SUPPORTING** | ✅ Current | Conflict registry |
| `DOCUMENTATION_GOVERNANCE.md` | **SUPPORTING** | ✅ Current | Doc governance |
| `DOCUMENTATION_INVENTORY.md` | **SUPPORTING** | ✅ Current | Doc inventory |

## 5. Audit & Reality Documents

| Document | Classification | Status | Notes |
|----------|---------------|--------|-------|
| `AQLIYA_REALITY_AUDIT_2026-06-05.md` | **REPORT** (evidence) | ✅ Current | Evidence not doctrine |
| `AQLIYA_SKEPTICAL_AUDIT_2026-06-03.md` | **REPORT** (evidence) | ✅ Current | Evidence not doctrine |
| `SECURITY_AUDIT_2026-05-23.md` | **REPORT** (evidence) | ✅ Current | Duplicated in archive |
| `FACTORY_ACCURACY_AUDITED_FS_V4.md` | **REPORT** (evidence) | ✅ Current | Audit evidence |
| `docs/audits/forensic-audit-2026-06-17/*` | **REPORT** (evidence) | ✅ Current | 30+ files |

## 6. Knowledge Documents

| Document | Classification | Status | Notes |
|----------|---------------|--------|-------|
| `docs/theoretical-reference/**` (352 files) | **THEORETICAL** | ✅ Current | Background reference |
| `knowledge-foundation/**` (364 files) | **KNOWLEDGE BASE** | ✅ Current | Operational knowledge |
| `knowledge/**` (11 files) | **KNOWLEDGE BASE** | ✅ Current | Knowledge references |

## 7. Product Documents (docs/products/)

| Product | Files | Classification | Status |
|---------|-------|---------------|--------|
| AuditOS | ~50 files | **SUPPORTING** (product-specific) | ✅ Mix of current/stale |
| LocalContentOS | ~90 files | **SUPPORTING** | ✅ Mix |
| Sombol/WorkflowOS | ~12 files | **SUPPORTING** | ⚠️ Some legacy |
| Pilot control | ~18 files | **HISTORICAL** | ⚠️ Most executed |

## 8. Archive Documents (docs/archive/)

| Section | Files | Classification | Recommendation |
|---------|-------|---------------|----------------|
| Root docs (legacy) | 18 | **ARCHIVE** | Keep as archive |
| `deprecated/` | Multiple | **DEPRECATED** | Move to clearly marked deprecated |
| `legacy/` | Multiple | **ARCHIVE** | Keep |
| `pilot-history/` | Multiple | **ARCHIVE** (historical) | Preserve |
| `notion-export-2026/` | Multiple | **ARCHIVE** | Prune if Notion live |
| `execution-stale/` | Multiple | **ARCHIVE** | Archive clearly |
| `commercial-legacy/` | Multiple | **ARCHIVE** | Keep for reference |

## 9. Key Truth Gaps

| Gap | Details | Severity |
|-----|---------|----------|
| **v1.1 vs v1.2 roadmap** | Two roadmap versions exist; v1.2 supersedes but v1.1 still referenced | MEDIUM |
| **Product status vs code reality** | SalesOS labeled "prototype" in docs but has 270 lib files (largest area) | HIGH |
| **Product status vs code reality** | RiskOS labeled "do not build" in taxonomy but has routes | MEDIUM |
| **Duplicate root docs** | 8 documents have exact duplicates in `docs/archive/` | LOW |
| **Parallel Director authority conflict** | `.skills/aqliya/aqliya-parallel-director.md` puts PRODUCT_STATUS_MATRIX above DOCUMENTATION_AUTHORITY | HIGH |
| **CLAUDE.md vs AGENTS.md taxonomy** | CLAUDE.md has richer L-level status; AGENTS.md has simpler handling rules | MEDIUM |

## 10. Recommendations

1. **Resolve v1.1/v1.2 roadmap conflict** — archive v1.1, update all references to point to v1.2
2. **Fix Parallel Director authority conflict** — update `.skills/aqliya/aqliya-parallel-director.md` §2 to align with AGENTS.md §2 hierarchy
3. **Prune root-level duplicates** — remove 8 exact duplicate files from root where archive copies exist
4. **Align SalesOS documentation** — update status to reflect actual code investment
5. **Clean archive directory** — clearly separate "archive" (historical reference) from "deprecated" (do not use)
6. **Sync CLAUDE.md product taxonomy** with AGENTS.md and PRODUCT_STATUS_MATRIX.md
