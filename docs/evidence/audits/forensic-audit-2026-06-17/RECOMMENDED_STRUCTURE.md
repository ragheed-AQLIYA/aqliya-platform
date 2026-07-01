# RECOMMENDED STRUCTURE — AQLIYA Forensic Audit

**Generated:** 2026-06-17  
**Basis:** CURRENT_STRUCTURE.md findings + CLEANUP_ROADMAP  
**Implementation:** NOT STARTED — recommendation only

---

## Target Principles

1. **One canonical path per product** (no dual route trees)
2. **Lib layer matches app layer** (no empty product lib dirs with active routes)
3. **Shared core only in `lib/platform/`, `lib/governance/`, `lib/ai/`**
4. **No debug routes in `src/app/api/`**
5. **Documentation hierarchy matches disk** (`docs/reports/` exists or authority amended)

---

## Recommended `src/` Layout

```
src/
├── app/
│   ├── (marketing)/          # Public only — no .bak files
│   ├── (dashboard)/          # All authenticated platform + DecisionOS
│   ├── audit/                # AuditOS
│   ├── auditos/              # Demo only
│   ├── local-content/        # LocalContentOS
│   ├── sales/                # SalesOS
│   ├── workflowos/           # WorkflowOS (sunbul → redirect only)
│   ├── contacts/             # LocalContactOS
│   ├── office-ai/            # Office AI
│   ├── content-studio/       # If retained as product
│   ├── audit/risk/           # MOVE: risk under audit OR populate lib/risk
│   └── api/                  # No test-token; auth on all sensitive routes
├── actions/
│   └── {product}/            # Group by product prefix
├── components/
│   └── {product}/            # Already partially done
├── lib/
│   ├── platform/             # Shared infra
│   ├── governance/           # Shared governance
│   ├── ai/                   # Intelligence core
│   ├── rag/
│   ├── audit/                # Includes risk submodule OR audit/risk/
│   ├── local-content/
│   ├── sales/
│   │   ├── core/             # MERGE: single sales core (not v02/_v02)
│   │   └── vnext/            # Active experiments
│   ├── decision/
│   ├── workflowos/
│   ├── localcontactos/       # RENAME optional: local-contact/
│   └── office-ai/
└── core/
    └── access/               # Real RBAC matrix — not stub
```

---

## Route Consolidation

| Current | Recommended |
|---------|-------------|
| `(dashboard)/decisions/*` + `decision/*` | `(dashboard)/decisions/*` only + redirects |
| `sunbul/*` pages | Redirect-only (already in next.config) |
| `organizations/sunbul/` | Migrate to workflowos settings |

---

## SalesOS Lib Consolidation

| Current | Recommended |
|---------|-------------|
| `sales/v02/` | **Delete or archive** after merge |
| `sales/_v02/` | Merge into `sales/core/signals/` |
| `sales/vnext/` | Keep as `sales/vnext/` until promoted |
| `* (1).ts` | Delete |

---

## Documentation Structure

```
docs/
├── DOCUMENTATION_AUTHORITY.md
├── official/                 # Doctrine only
├── source-of-truth/          # Status, routes, architecture
├── reports/                  # CREATE — validation evidence outputs
├── product/                  # Product specs
├── operations/               # Runbooks (single backup doc)
├── audits/                   # Point-in-time audits (dated folders)
├── architecture/             # ADRs
├── theoretical-reference/    # Background — clear banner in README
└── archive/                  # Historical — never linked from README status
```

**Merge:** `runbooks/` into `docs/operations/` OR cross-link single canonical backup doc.

---

## Config Structure

| Change | Rationale |
|--------|-----------|
| ESLint ignore `docs/**`, `knowledge-foundation/**` | CONFIG_AUDIT |
| Dedupe eslint.config.mjs ignores | Maintenance |
| CI: `tsc` + `npm test` + scoped lint | Align with deploy gate |
| Remove stale `.next/types` on clean build | build-audit |

---

## Governance Structure

| Artifact | Owner | Review cadence |
|----------|-------|----------------|
| PRODUCT_STATUS_MATRIX.md | Platform eng | After each validation run |
| AQLIYA_MASTER_REFERENCE.md | Product/arch | Monthly or on major release |
| ROUTE_REGISTRY.md | Platform eng | On route change |
| ADRs | Architecture | On decision |

**Add frontmatter:** `owner`, `last-reviewed`, `evidence-ref`

---

## Migration Priority

1. P0: Security routes + build TS fixes
2. P1: Delete dead files + ESLint scope
3. P2: Doc authority sync
4. P3: Sales lib merge
5. P4: Decision route consolidation

---

## NOT VERIFIED

- Team capacity to execute restructure
- Breaking changes to external integrations (SCIM, ERP)
- Customer bookmark impact for route moves
