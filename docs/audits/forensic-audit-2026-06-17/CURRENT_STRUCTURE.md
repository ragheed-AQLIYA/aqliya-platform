# CURRENT STRUCTURE — AQLIYA Forensic Audit

**Generated:** 2026-06-17  
**Evidence:** REPOSITORY_TREE.md, Phase 3 codebase analysis

---

## Root Layout

```
Aqliya/
├── src/                    # Application (app, actions, components, lib)
├── prisma/                 # Schema, migrations, seeds
├── docs/                   # 1,735 markdown files
├── scripts/                # 154 operational scripts
├── infra/terraform/        # AWS IaC (~20 files)
├── knowledge-foundation/   # ~292 reference files
├── runbooks/               # 6 operational runbooks
├── .github/workflows/      # 5 CI/CD workflows
├── public/                 # Static assets
├── cypress/                # E2E (NOT VERIFIED)
└── [config files]          # package.json, tsconfig, eslint, jest, next.config
```

**Total tracked files (excl. node_modules/.git):** ~27,925 (inventory-report)

---

## Application Structure (`src/`)

| Path | Files | Purpose | Health |
|------|------:|---------|--------|
| `src/app/` | 457 | Next.js App Router | Moderate — `.bak`, dual routes |
| `src/lib/` | 1,051 | Domain + platform logic | **Sales-heavy** |
| `src/components/` | 323 | UI | NOT VERIFIED depth |
| `src/actions/` | 69 | Server actions | Duplicate `(1)` actions |
| `src/core/` | Small | CoreAccessControl stub | **Poor** |
| `src/products/` | Present | Product adapters | Sales adapters |

---

## Product Placement (Actual)

| Product | App | Lib | Boundary quality |
|---------|-----|-----|------------------|
| AuditOS | `app/audit/` | `lib/audit/` | **Good** |
| LocalContentOS | `app/local-content/` | `lib/local-content/` | **Good** |
| SalesOS | `app/sales/` | `lib/sales/` (358) | **Poor** — sprawl |
| DecisionOS | `app/(dashboard)/decisions/` + `app/decision/` | `lib/decision/` | **Mixed** |
| WorkflowOS | `app/workflowos/` | `lib/workflowos/` | Good |
| LocalContactOS | `app/contacts/` | `lib/localcontactos/` (2) | Thin lib |
| Office AI | `app/office-ai/`, dashboard assistant | `lib/office-ai/` | Good |
| Risk | `app/risk/` | `lib/risk/` **empty** | **Misplaced** |
| Demo | `app/auditos/` | mocks | Good (demo rules) |
| Marketing | `app/(marketing)/` | `lib/marketing/` | `.bak` pollution |

---

## Shared Core Placement

| Concern | Location | Notes |
|---------|----------|-------|
| Platform | `lib/platform/` (194 files) | Largest shared layer |
| AI | `lib/ai/` (73) + `lib/governance/` (25) + `lib/rag/` (11) | Intelligence Core |
| Auth | `lib/auth/` (12) | MFA, SCIM helpers |
| Integration | `lib/integration/` (20) | ERP/CRM |
| TB Intelligence | `lib/tb-intelligence/` (28) | Audit-adjacent |

---

## Misplaced / Mixed Concern Signals

| Issue | Location | Evidence |
|-------|----------|----------|
| Sales dominates lib | 34% of lib files | FOLDER_DENSITY_REPORT |
| Risk UI without lib | `app/risk/` vs empty `lib/risk/` | Phase 3 |
| Contacts empty lib dir | `lib/contacts/` vs `lib/localcontactos/` | Naming inconsistency |
| Debug API in production tree | `api/test-token/` | SECURITY_AUDIT |
| Archived code linted | `docs/archive/code/` | CONFIG_AUDIT |
| Org admin under app root | `app/organizations/` | NOT VERIFIED vs dashboard settings |

---

## Documentation Structure

| Folder | Role | Risk |
|--------|------|------|
| `docs/official/` | Doctrine | Stale §9 |
| `docs/source-of-truth/` | Status/routes | Build claims stale |
| `docs/theoretical-reference/` | 352 files | Mis-citation |
| `docs/archive/` | 227 files | Mis-citation |
| `docs/audits/` | Evidence | Multiple overlapping audits |
| `docs/reports/` | **Missing** | Hierarchy gap |

---

## Infrastructure Structure

| Path | Purpose |
|------|---------|
| `infra/terraform/` | ECS, RDS, Redis, CloudFront |
| `.github/workflows/deploy.yml` | AWS pipeline |
| `Dockerfile` | Container build (NOT opened) |
| `docker-compose.yml` | Local DB (NOT opened) |

---

## Naming Inconsistencies (VERIFIED)

| Pattern | Examples |
|---------|----------|
| Product suffix OS | AuditOS, LocalContentOS, SalesOS vs `local-content` route |
| Legacy names | Sunbul vs WorkflowOS |
| Version dirs | `v02`, `_v02`, `vnext` |
| Windows copies | `file (1).ts` |
| Backup pages | `page.tsx.bak` |

---

## NOT VERIFIED

- Full `src/components/` organization by product
- `cypress/` structure
- `.skills/aqliya/` layout
