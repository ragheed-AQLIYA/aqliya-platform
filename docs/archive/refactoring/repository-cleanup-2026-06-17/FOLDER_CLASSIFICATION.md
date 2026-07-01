# FOLDER CLASSIFICATION — AQLIYA Repository

**Date:** 2026-06-17  
**Basis:** Forensic audit + recovery strategy (no new audit)  
**Scope:** Top-level and primary `src/` / `docs/` folders

---

## Classification Legend

| # | Class |
|---|--------|
| 1 | Production Code |
| 2 | Product Code |
| 3 | Platform Core |
| 4 | Shared Libraries |
| 5 | Infrastructure |
| 6 | Tests |
| 7 | Documentation |
| 8 | Research |
| 9 | Archive |
| 10 | Temporary / Scratch |
| 11 | Duplicate |
| 12 | Unknown |

---

## Root Level

| Path | Class | Purpose | Notes |
|------|-------|---------|-------|
| `src/` | 1 Production Code | Next.js application | Primary runtime |
| `prisma/` | 1 + 5 | Schema, migrations, seeds | Data layer |
| `public/` | 1 | Static assets | Marketing + brand |
| `infra/` | 5 Infrastructure | Terraform AWS | Deploy |
| `.github/` | 5 Infrastructure | CI/CD workflows | 5 workflows |
| `scripts/` | 5 + 10 | Operational scripts | 154 files; mixed |
| `docs/` | 7 Documentation | Knowledge + authority | 1,735+ md |
| `knowledge-foundation/` | 8 Research | Institutional IP corpus | Non-runtime |
| `runbooks/` | 7 Documentation | Ops runbooks | Overlap with docs/operations |
| `archive/` (root) | 9 Archive | Non-docs archive | Verify contents |
| `backups/` | 9 Archive | Backup artifacts | Not runtime |
| `cypress/` | 6 Tests | E2E | |
| `i18n/` | 4 Shared Libraries | next-intl config | |
| `messages/` | 4 Shared Libraries | i18n messages | |
| `certificates/` | 5 Infrastructure | TLS/certs | Local dev |
| `verification/` | 7 Documentation | Verification outputs | Evidence |
| `test-results/` | 10 Temporary | Test output | Gitignore candidate |
| `uploads/` | 10 Temporary | Local file storage | Runtime data |
| `.next/` | 10 Temporary | Build output | Generated |
| `node_modules/` | 10 Temporary | Dependencies | Generated |
| `.local-cleanup/` | 10 Temporary | Scratch | Review for delete |
| `.claude`, `.cursor`, `.opencode` | 10 Temporary | Tooling | IDE/agent |
| `.skills/` | 7 Documentation | Agent skills | AGENTS.md refs |
| `.husky/` | 5 Infrastructure | Git hooks | |
| `.vercel/` | 10 Temporary | Vercel local | |
| `.data/` | 12 Unknown | Inspect before move | |
| `knowledge/` | 8 Research | Knowledge (non-foundation) | Overlap risk |

---

## `src/` Top Level

| Path | Class | Product / Owner |
|------|-------|-----------------|
| `src/app/` | 1 Production | All routes (457 files) |
| `src/actions/` | 2 Product + 3 Platform | Server actions by domain |
| `src/components/` | 2 Product | UI by product folders |
| `src/lib/platform/` | 3 Platform Core | Auth, audit, secrets, redis |
| `src/lib/governance/` | 3 Platform Core | AI governance |
| `src/lib/ai/` | 3 Platform Core | Orchestrator, providers |
| `src/lib/auth/` | 3 Platform Core | MFA, SCIM helpers |
| `src/lib/rag/` | 4 Shared | RAG/pgvector |
| `src/lib/integration/` | 4 Shared | ERP/CRM connectors |
| `src/lib/audit/` | 2 Product | **AuditOS** |
| `src/lib/local-content/` | 2 Product | **LocalContentOS** |
| `src/lib/sales/` | 2 Product | **SalesOS** (358 files) |
| `src/lib/decision/` | 2 Product | DecisionOS |
| `src/lib/workflowos/` | 2 Product | WorkflowOS |
| `src/lib/localcontactos/` | 2 Product | LocalContactOS |
| `src/lib/office-ai/` | 2 Product | Office AI |
| `src/lib/tb-intelligence/` | 2 Product | AuditOS-adjacent |
| `src/lib/marketing/` | 2 Product | Marketing helpers |
| `src/lib/skill-runtime/` | 4 Shared | Skill evaluation |
| `src/lib/simulation/` | 12 Unknown | Low use; eslint ignored |
| `src/lib/recommendation/` | 12 Unknown | Legacy |
| `src/lib/decisions/` | 11 Duplicate? | vs `decision/` — verify |
| `src/core/` | 3 Platform Core | CoreAccessControl |
| `src/products/` | 2 Product | Sales adapters |
| `src/__tests__/` | 6 Tests | Integration + unit |
| `src/__mocks__/` | 6 Tests | Jest mocks |

---

## `src/app/` Product Routes

| Path | Class | Product |
|------|-------|---------|
| `src/app/audit/` | 2 | AuditOS |
| `src/app/local-content/` | 2 | LocalContentOS |
| `src/app/sales/` | 2 | SalesOS |
| `src/app/(dashboard)/decisions/` | 2 | DecisionOS |
| `src/app/decision/` | 11 Duplicate | Legacy parallel tree |
| `src/app/workflowos/` | 2 | WorkflowOS |
| `src/app/sunbul/` | 9 Archive | Redirect alias pages |
| `src/app/contacts/` | 2 | LocalContactOS |
| `src/app/auditos/` | 2 (demo) | Public demo only |
| `src/app/(marketing)/` | 1 | Public marketing |
| `src/app/api/` | 3 Platform | API handlers |
| `src/app/risk/` | 2 | Audit risk submodule |
| `src/app/content-studio/` | 2 | Content Studio (partial) |
| `src/app/office-ai/` | 2 | Office AI |

---

## `docs/` Top Level

| Path | Class | Purpose |
|------|-------|---------|
| `docs/official/` | 7 | Doctrine (Tier 1) |
| `docs/source-of-truth/` | 7 | Status, routes, architecture |
| `docs/architecture/` | 7 | ADRs |
| `docs/operations/` | 7 | Runbooks, deploy |
| `docs/product/` | 7 | Product specs |
| `docs/products/` | 7 | Product marketing/spec overlap |
| `docs/systems/` | 7 | System READMEs |
| `docs/audits/` | 7 | Point-in-time audits |
| `docs/reports/` | 7 | Validation evidence (create/populate) |
| `docs/strategy/` | 7 | CEO/recovery strategy |
| `docs/refactoring/` | 7 | This cleanup program |
| `docs/theoretical-reference/` | 8 Research | Background only |
| `docs/archive/` | 9 Archive | Historical |
| `docs/review/` | 7 | Evidence packs |
| `docs/pilot/` | 7 | Pilot ops |
| `docs/releases/` | 7 | Release records |
| `docs/runtime-prototypes/` | 8 Research | Prototype notes |
| `docs/validation/` | 7 | Validation reports |
| `docs/recovery/` | 7 | Recovery notes |
| `docs/reality/` | 7 | Reality checks |
| `docs/demo/` | 7 | Demo docs |
| `docs/marketing/` | 7 | Marketing copy |
| `docs/governance/` | 7 | Governance docs |
| `docs/auditos/` | 7 | Demo product docs |
| `docs/archive/code/` | 9 + 11 | Archived TS — **lint noise** |

---

## Duplicate / Temporary Highlights

| Path | Class | Evidence |
|------|-------|----------|
| `src/**/* (1).ts` | 11 Duplicate | 19 files; no imports (grep 2026-06-17) |
| `src/**/*.bak` | 10 + 11 | 11 marketing backups; not routed |
| `src/lib/sales/v02/` + `_v02/` | 11 Duplicate | Mirror structures (DUPLICATION_REPORT) |
| `docs/audits/RELEASE_DECISION.md` vs `docs/review/` | 11 Duplicate | KNOWLEDGE_GOVERNANCE |
| `runbooks/` vs `docs/operations/` | 11 Duplicate | Overlapping backup docs |

---

## Empty / Misplaced (from audit)

| Path | Class | Action |
|------|-------|--------|
| `src/lib/contacts/` | 12 Unknown | Empty; use `localcontactos/` |
| `src/lib/risk/` | 12 Unknown | Empty; routes in `app/risk/` |
| `src/lib/i18n/` | 12 Unknown | Empty; i18n at repo root |
| `src/lib/utils/` | 12 Unknown | Empty |

---

## Summary Counts (approximate)

| Class | Major locations |
|-------|-----------------|
| Production Code | `src/app`, `src/actions`, `public` |
| Product Code | `src/lib/{audit,local-content,sales,...}`, `src/app/{product}` |
| Platform Core | `src/lib/platform`, `governance`, `ai`, `auth`, `core` |
| Shared Libraries | `rag`, `integration`, `skill-runtime`, `i18n`, `messages` |
| Infrastructure | `infra`, `.github`, `prisma/migrations`, `scripts` |
| Tests | `src/__tests__`, `**/__tests__`, `cypress` |
| Documentation | `docs/` (majority) |
| Research | `knowledge-foundation/`, `docs/theoretical-reference/` |
| Archive | `docs/archive/`, root `archive/`, `backups/` |
| Temporary | `.next`, `uploads`, `test-results`, tool dirs |
| Duplicate | `(1).ts`, `.bak`, sales v02/_v02, dual decision routes |
