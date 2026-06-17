# TARGET REPOSITORY STRUCTURE — AQLIYA

**Date:** 2026-06-17  
**Principle:** Clarity over perfection. No monorepo split. No rewrite.

---

## Design Goals

1. **Onboarding in 15 minutes:** New engineer finds product code in predictable paths  
2. **Authority docs in one tree:** `docs/` with clear tiers  
3. **Research separated from runtime:** Non-authoritative corpus labeled  
4. **Products isolated in `src/lib/{product}` and `src/app/{product}`**  
5. **No duplicate trees** after phased consolidation  

---

## Target Root Layout

```
Aqliya/
├── src/                      # All production application code
├── prisma/                   # Schema, migrations, seeds
├── public/                   # Static assets (clean naming, no "(1)")
├── infra/                    # Terraform, deployment IaC
├── scripts/                  # Operational CLI (grouped by domain)
├── docs/                     # All documentation (see below)
├── research/                 # NEW alias target: non-runtime knowledge (optional Phase 4)
│   └── (symlink or move from knowledge-foundation/ — deferred)
├── archive/                  # Non-doc archived artifacts
├── runbooks/                 # DEPRECATE → merge into docs/operations/
├── cypress/                  # E2E tests
├── i18n/                     # next-intl request config
├── messages/                 # Translation files
├── package.json
├── next.config.mjs
├── tsconfig.json
├── jest.config.js
├── eslint.config.mjs
├── Dockerfile
├── docker-compose.yml
└── README.md                 # Entry only → DOCUMENTATION_AUTHORITY
```

**Not moved:** `node_modules/`, `.next/`, `uploads/`, tool dirs (`.cursor`, etc.)

---

## Target `src/` Layout

```
src/
├── app/                          # Next.js App Router ONLY
│   ├── (marketing)/              # Public site
│   ├── (dashboard)/                # Authenticated platform shell
│   ├── audit/                      # AuditOS
│   ├── auditos/                    # Public demo
│   ├── local-content/              # LocalContentOS
│   ├── sales/                      # SalesOS (frozen)
│   ├── workflowos/                 # WorkflowOS
│   ├── contacts/                   # LocalContactOS
│   ├── office-ai/                  # Office AI
│   ├── api/                        # Route handlers
│   └── ...                         # auth routes (login, signup)
│
├── actions/                        # Server actions
│   ├── audit/                      # TARGET: group by product (Phase 5)
│   ├── local-content/
│   ├── sales/
│   └── platform/
│
├── components/                     # UI components by product
│   ├── audit/
│   ├── local-content/
│   ├── platform/
│   └── ...
│
├── lib/
│   ├── platform/                   # Platform Core — shared infra
│   ├── governance/                 # Platform Core — AI governance
│   ├── ai/                         # Platform Core — orchestrator
│   ├── auth/                       # Platform Core
│   ├── rag/                        # Shared intelligence
│   ├── integration/              # Shared connectors
│   │
│   ├── audit/                      # Product: AuditOS
│   ├── local-content/              # Product: LocalContentOS
│   ├── sales/                      # Product: SalesOS
│   │   ├── core/                   # TARGET: merged v02 (not v02/_v02)
│   │   └── vnext/                  # Experiments until promoted
│   ├── decision/                   # Product: DecisionOS
│   ├── workflowos/
│   ├── localcontactos/
│   └── office-ai/
│
├── core/                           # Platform access abstractions
├── products/                       # Cross-product adapters (keep, document)
├── types/                          # Shared TS types
├── __tests__/                      # Cross-cutting tests
└── __mocks__/                      # Test mocks
```

**Removed targets (phased):**
- `src/app/decision/` → redirect to `(dashboard)/decisions/`
- `src/app/sunbul/` → redirect-only in next.config (delete pages)
- `src/lib/sales/_v02/` → merged into `sales/core/`
- `src/lib/contacts/`, `lib/risk/`, `lib/utils/` empty dirs → delete or populate
- All `* (1).ts` → deleted

---

## Target `docs/` Layout

```
docs/
├── DOCUMENTATION_AUTHORITY.md      # Tier 0
├── README.md                       # Navigation index
│
├── official/                       # Doctrine — identity, trust
├── source-of-truth/                # Status, routes, gates, claims register
├── architecture/                   # ADRs, integration plans
│
├── products/                       # TARGET: merge docs/product/ here (Phase 4)
│   ├── auditos/
│   ├── local-content/
│   └── sales/
│
├── systems/                        # Technical system READMEs
├── operations/                     # Runbooks, deploy, DR (canonical)
├── governance/                     # Governance policies
│
├── audits/                         # Point-in-time audits (dated folders)
├── reports/                        # Validation evidence ONLY
├── strategy/                       # CEO/board strategy
├── refactoring/                    # Repo cleanup plans
│
├── research/                       # TARGET: theoretical-reference/ content
│   └── (or keep theoretical-reference/ with banner — lower risk)
│
├── review/                         # Customer/pilot evidence packs
├── pilot/                          # Pilot procedures
├── releases/                       # Release records
│
└── archive/                        # Historical — never cite for status
```

---

## Target `scripts/` (grouping — Phase 6)

```
scripts/
├── platform/          # validate-env, backup, smoke
├── audit/             # TB, audit health
├── local-content/     # LC pilot scripts
├── deploy/            # post-deploy, staging
└── dev/               # local dev helpers
```

**Deferred:** Moving 154 scripts — high import path risk in package.json. Document grouping first.

---

## Target `infra/`

```
infra/
└── terraform/         # Keep as-is — AWS ECS/RDS/Redis
```

---

## Target `tests/`

Tests stay colocated: `src/**/__tests__/` + `src/__tests__/` + `cypress/`.  
**No top-level `tests/` migration** — breaks Jest roots.

---

## Ownership Matrix

| Path | Owner | Change policy |
|------|-------|---------------|
| `src/lib/platform/` | Platform team | RFC for breaking changes |
| `src/lib/audit/` | AuditOS | No destabilize during LC pilot |
| `src/lib/local-content/` | LocalContentOS | Primary investment |
| `src/lib/sales/` | SalesOS | **Freeze** — cleanup only |
| `docs/official/` | CTO + product | Doctrine review |
| `docs/source-of-truth/` | Platform eng | Every validation run |
| `docs/reports/` | QA / platform | Auto-generated snapshots |
| `docs/archive/` | None (read-only) | Archive only |
| `docs/theoretical-reference/` | Research | No status claims |

---

## What we are NOT doing

- Splitting into npm workspaces / turborepo  
- Moving tests to root `tests/`  
- Renaming all routes (`local-content` stays)  
- Deleting `knowledge-foundation/` (document as research)  
- Big-bang `docs/` restructure in one PR  
