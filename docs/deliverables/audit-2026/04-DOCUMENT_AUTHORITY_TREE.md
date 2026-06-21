# DOCUMENT AUTHORITY TREE — AQLIYA
**Date:** 2026-06-20

Hierarchical mapping of all document authority relationships.

---

## 1. Authority Hierarchy (Highest → Lowest)

```
Level 1 — DOCTRINE (docs/official/*)
  ├── aqliya-vision-v1.1.md              (Platform identity, trust principle)
  ├── AQLIYA_MASTER_REFERENCE.md          (Master reference — all-domain)
  ├── aqliya-product-taxonomy-v1.1.md     (Product boundaries)
  ├── aqliya-core-architecture-v1.1.md    (Architecture)
  ├── aqliya-implementation-rules-v1.1.md (Implementation guardrails)
  ├── aqliya-glossary-v1.1.md             (Terminology)
  ├── aqliya-roadmap-v1.1.md / v1.2.md   (Strategic direction)
  └── aqliya-agent-context-v1.1.md        (Agent context)

Level 2 — AGENT CONTRACTS (root level)
  ├── AGENTS.md                           (Primary — OpenCode)
  ├── CLAUDE.md                           (Secondary — Claude)
  └── .skills/aqliya/*.md                 (Skills — augment, do not override)

Level 3 — SOURCE OF TRUTH (docs/source-of-truth/*)
  ├── PRODUCT_STATUS_MATRIX.md            (Product completion status)
  ├── ROUTE_STRATEGY.md                   (Route map)
  ├── AQLIYA_ARCHITECTURE.md             (Architecture — synced to code)
  ├── AQLIYA_SYSTEM_TAXONOMY.md          (System map)
  ├── ROUTE_REGISTRY.md                  (Route detail)
  ├── READINESS_GATES.md                 (Release gates)
  └── ... (remaining 20 files)

Level 4 — CONFLICT RESOLUTION
  └── docs/DOCUMENTATION_AUTHORITY.md     (Authority & conflict rules)

Level 5 — CONFIGURATION
  ├── next.config.mjs, tsconfig.json
  ├── eslint.config.mjs, jest.config.js
  ├── .env.example
  ├── Dockerfile, docker-compose.yml
  ├── .github/workflows/*
  └── .cursor/*

Level 6 — PRODUCT DOCS (docs/products/*)
  ├── auditos-*/
  ├── localcontentos-*/
  ├── salesos-*/
  └── workflowos-*/

Level 7 — AUDIT / REVIEW / VALIDATION (docs/audits/*, docs/review/*, docs/validation/*)
  ├── Reality audits
  ├── Factory accuracy audits
  ├── Cycle validations
  └── Evidence files

Level 8 — REPORTS (docs/reports/*)
  └── All report files

Level 9 — ARCHIVE (docs/archive/*)
  └── Historical / legacy / deprecated

Level 10 — THEORETICAL (docs/theoretical-reference/*)
  └── Background theory (no authority over implementation)
```

## 2. Conflict Resolution Rules

### Rule 1 — Identity & Governance
When docs conflict on identity, naming, trust principles, or governance boundaries:
→ **FOLLOW**: `docs/official/*` doctrine documents  
→ **EXAMPLE**: If roadmap says one thing and vision says another, vision wins

### Rule 2 — Product Status
When docs conflict on product completion or implementation status:
→ **FOLLOW**: `PRODUCT_STATUS_MATRIX.md` OR inspect current code reality  
→ **IF code reality contradicts docs**: Update the stale docs  
→ **RULE**: Reports are evidence, not doctrine

### Rule 3 — Agent Behavior
When AGENTS.md conflicts with skills or Cursor rules:
→ **FOLLOW**: AGENTS.md (primary operating contract)  
→ Skills augment, they do not override  
→ **EXCEPTION**: `aqliya-security-gate.md` skills take precedence on security matters

### Rule 4 — Route Definitions
When route strategy documents conflict:
→ **FOLLOW**: `ROUTE_STRATEGY.md` (source of truth)  
→ Verify against actual app/ directory structure

### Rule 5 — Architecture
When architecture docs conflict:
→ **FOLLOW**: `AQLIYA_ARCHITECTURE.md` (source of truth)  
→ Verify against actual code in src/

### Rule 6 — Theoretical vs Implementation
When theoretical docs suggest one approach and code implements another:
→ **FOLLOW**: Code reality (implementation wins over theory)  
→ Update theoretical docs to reflect actual implementation

### Rule 7 — Parallel Director Exception
The `.skills/aqliya/aqliya-parallel-director.md` currently places `PRODUCT_STATUS_MATRIX.md` as highest authority.
→ **THIS CONFLICTS** with Rule 1 above  
→ **RESOLUTION NEEDED**: Update parallel director skill to align with this tree

## 3. Authority by Domain

| Domain | Highest Authority | Secondary | Verification |
|--------|------------------|-----------|--------------|
| Platform Identity | `aqliya-vision-v1.1.md` | AGENTS.md §1 | — |
| Product Boundaries | `aqliya-product-taxonomy-v1.1.md` | PRODUCT_STATUS_MATRIX.md | Code check |
| Route Architecture | `ROUTE_STRATEGY.md` | ROUTE_REGISTRY.md | App directory |
| Architecture | `AQLIYA_ARCHITECTURE.md` | `aqliya-core-architecture-v1.1.md` | Code check |
| Database Schema | `prisma/schema.prisma` | Migrations | `prisma validate` |
| AI Behavior | AGENTS.md §12 | AI_CAPABILITY_MATRIX.md | Code check |
| Security | AGENTS.md §18 | `.skills/aqliya-security-gate.md` | Middleware audit |
| Agent Behavior | AGENTS.md | CLAUDE.md | Skill check |
| Product Status | PRODUCT_STATUS_MATRIX.md | Code reality | Test pass |
| Roadmap | `AQLIYA_ROADMAP_v1.2.md` | L6_PRODUCTION_ROADMAP.md | Status matrix |

## 4. Conflicts Detected

| Conflict | Sources | Severity | Resolution |
|----------|---------|----------|------------|
| Authority hierarchy | `aqliya-parallel-director.md` §2 vs AGENTS.md §2 | **HIGH** | Update parallel director |
| Roadmap version | v1.1 (official) vs v1.2 (official) | **MEDIUM** | Archive v1.1 |
| Product status | CLAUDE.md taxonomy vs PRODUCT_STATUS_MATRIX.md | **MEDIUM** | Sync tables |
| Route definitions | ROUTE_STRATEGY.md vs actual app/ | **LOW** | Verified as synced |
| Architecture | Architecture docs vs code | **LOW** | Verified after hardening |

## 5. Document Lifecycle Recommendations

| Action | Documents | Reason |
|--------|-----------|--------|
| **Archive** | `aqliya-roadmap-v1.1.md` | Superseded by v1.2 |
| **Update** | `aqliya-parallel-director.md` §2 | Authority hierarchy conflict |
| **Sync** | CLAUDE.md product taxonomy | Out of sync with PRODUCT_STATUS_MATRIX |
| **Prune** | 8 root-level duplicates | Exact copies in archive |
| **Tag** | 307 archive files | Add clear classification headers |
| **Mark deprecated** | Legacy pilot docs in archive/sunbul/ | Superseded by new workflows |
