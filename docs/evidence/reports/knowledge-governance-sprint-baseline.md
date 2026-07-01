# Knowledge Governance Sprint v1 — Baseline Inventory

> **Phase:** 1 — Reality Sync | **Wave:** 1 — Inventory Only  
> **Date:** 2026-06-29  
> **Charter:** `docs/governance/aqliya-knowledge-governance-charter-v1.md`  
> **Status:** Baseline only — no modifications made

---

## 1. Baseline Counts

| Metric | Value |
|---|---|
| Total `.md` files in `docs/` | **2,092** |
| Archived (in `docs/archive/`) | **233** |
| Active (non-archive) | **~1,859** |
| `docs/official/` (Authority-level) | **14** |
| `docs/source-of-truth/` (Reference-level) | **26** |
| `docs/governance/` (Governance docs) | **9** |

### Active Knowledge Surface Estimate

| Category | Estimated Count |
|---|---|
| Authority (official/ + governance/ + select top-level) | ~25 |
| Reference (source-of-truth/ + systems/ + operations/) | ~80 |
| Working (drafts, designs, in-progress) | ~50 |
| Historical (reports, deliverables, execution logs) | ~250 |
| Archive | 233 |
| Theoretical / Background | ~352 |

---

## 2. Key Claim Extraction — PRODUCT_STATUS_MATRIX.md

> **Document:** `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`  
> **Charter Type:** Authority — Product Status  
> **Current Version:** 1.0 | **Last Reviewed:** 2026-06-26  
> **Owner:** Documentation Team

### 2.1 Product Maturity Claims

| # | Product/System | Claimed Maturity | Claimed Customer Status | Claimed Routes |
|---|---|---|---|---|
| P01 | AQLIYA Platform | L4 Usable v0.1 | Safe to show with explanation | `/`, shared authenticated surfaces |
| P02 | AQLIYA Intelligence Core | L4 (Tier 2 exit + Tier 3 prep) | Safe to show with explanation | `/intelligence`, `/monitoring`, `/operator`, `/api/platform/*` |
| P03 | Knowledge Foundation Versioning | L4 Usable v0.1 | Safe to show with explanation | `/knowledge-foundation/*` |
| P04 | AuditOS | L5 Pilot-ready | Safe to show | `/audit`, `/audit/portfolio`, `/audit/archived`, `/auditos` |
| P05 | DecisionOS | L5 Pilot-ready | Safe to show with explanation | `/decisions`, `/decisions/[id]/*`, `/intelligence/sectors` |
| P06 | Office AI Assistant | L5 Pilot-ready | Safe to show | `/assistant`, `/assistant/[taskId]`, `/assistant/stats` |
| P07 | WorkflowOS | L5 Pilot-ready | Safe to show with explanation | `/workflowos`, `/workflowos/records/[id]`, `/api/workflowos/*` |
| P08 | Sunbul | Redirect alias (N/A) | Internal only | `/sunbul`, `/sunbul/admin`, `/sunbul/clients/*` |
| P09 | Platform audit logs / diagnostics | L4 Usable v0.1 | Internal only | `/settings/workspaces`, `/settings/platform-organization`, `/settings/audit-logs`, `/monitoring` |
| P10 | auditOS demo | L1 Marketing | Demo only | `/auditos/*` |
| P11 | Organizations surface | L5 Pilot-ready | Safe to show | `/organizations`, `/organizations/[id]`, `/organizations/sunbul` |
| P12 | Generic settings surface | L2 Shell | Internal only | `/settings` |
| P13 | ContentStudio | L4 Usable v0.1 | Internal only | `/content-studio/*` |
| P14 | SalesOS | L5 Pilot-ready | Safe to show with explanation | `/sales/*` |
| P15 | LocalContentOS | L5 Pilot-ready (100%) | Safe to show with explanation | `/local-content/*` |
| P16 | SimulationOS | L1 Marketing | Do not show as implemented | `/products/simulation` |
| P17 | LocalContactOS | L5 Pilot-ready | Safe to show with explanation | `/contacts/*` |
| P18 | RiskOS | L5 Pilot-ready | Safe with context | `/risk/*` |
| P19-P21 | ComplianceOS / LegalOS / GovOS | L0 Concept | Do not show as implemented | — |
| P22 | AQLIYA Studio | L0 Concept | Do not show as implemented | — |
| P23 | SSO (SAML/OIDC) | L4 Usable v0.1 | Internal demo only | `/settings/sso`, `/login` |
| P24 | SCIM Provisioning | L4 Usable v0.1 | Internal only | `/api/scim/v2/*` |
| P25 | Private / On-Prem | L0 Concept | Do not show as implemented | — |
| P26 | Air-Gapped | L0 Concept | Do not show as implemented | — |
| P27 | Local AI runtime | L4 Usable v0.1 (pilot) | Operator required | Ollama REST + hybrid routing |
| P28 | AI Governance | L4 Usable v0.1 | Safe to show with explanation | `src/lib/ai/*` |
| P29 | Model Governance | L0 Concept | Do not show as implemented | — |
| P30 | Institutional Memory | L5 Pilot-ready | Safe to show with explanation | `/institutional-memory/*` |
| P31 | Custom Product Inquiry | L4 Usable v0.1 | Safe to show | `/custom-product`, `/api/custom-product-submit` |

### 2.2 Key Reality Notes Claims

| # | Claim | Source Line |
|---|---|---|
| RN01 | Office AI Assistant is "real code and real data-backed workflow" but "shared application, not primary product" | Reality Notes |
| RN02 | WorkflowOS is "canonical product name for governed workflow workspace" | Reality Notes |
| RN03 | Sunbul is "redirect alias over WorkflowOS — permanentRedirect(302) wrappers" | Reality Notes |
| RN04 | SalesOS "not yet L4 production-usable, not L5 pilot-ready" (contradicts P14 L5 claim) | Reality Notes §82 |
| RN05 | Generic /settings "client-side-only local-state shell (L2)" | Reality Notes §85 |
| RN06 | DecisionOS "L5 with full lifecycle" | Reality Notes §86 |
| RN07 | ContentStudio "Missing: test coverage. Not classified in official taxonomy" | Reality Notes §101 |
| RN08 | SSO and SCIM "both upgraded from L0 to L4" | Reality Notes §90 |
| RN09 | Institutional Memory "upgraded from L4 to L5" | Reality Notes §98 |
| RN10 | SalesOS "upgraded from L4 to L5 Pilot-ready" | Reality Notes §99 |

---

## 3. Cross-Document Contradictions (Authority vs. Authority)

These are **blocking conflicts** per Charter §4 — must be resolved before Phase 4.

| # | Knowledge Area | Document A | Claim A | Document B | Claim B | Notes |
|---|---|---|---|---|---|---|
| C01 | ContentStudio maturity | PRODUCT_STATUS_MATRIX (Authority) | **L4 Usable v0.1** — seed data, sidebar entry, PDF export | MASTER_REFERENCE §11 (Authority) | **L3 prototype** — "Missing: seed data, sidebar entry, PDF/export, test coverage" | MASTER_REFERENCE appears stale (last updated 2026-06-09); PRODUCT_STATUS_MATRIX updated 2026-06-26 |
| C02 | SalesOS maturity | PRODUCT_STATUS_MATRIX (Authority) | **L5 Pilot-ready** | MASTER_REFERENCE §9 (Authority) | **L4 internal workspace** — "not production CRM" | MASTER_REFERENCE also says L4 in §9; Reality Note RN04 within same doc says "not L4 production-usable, not L5" — triple conflict within same document |
| C03 | Institutional Memory maturity | PRODUCT_STATUS_MATRIX (Authority) | **L5 Pilot-ready** | MASTER_REFERENCE §9 (Authority) | **L3→L4 partial** | MASTER_REFERENCE last reviewed 2026-06-09; IM upgraded on 2026-06-19 |
| C04 | Institutional Memory status | PRODUCT_STATUS_MATRIX (Authority) | **L5 Pilot-ready** | Core Architecture v1.1 (Authority) | **"Not implemented. Strategic/future."** | Core Architecture §Engine Status table; MASTER_REFERENCE confirms partial implementation |
| C05 | SalesOS Reality Note | PRODUCT_STATUS_MATRIX row | **L5 Pilot-ready** | PRODUCT_STATUS_MATRIX Reality Note §82 | **"Not yet L4 production-usable, not L5 pilot-ready"** | Internal contradiction within same document — row claims L5 but note contradicts it |

### 3.1 Contradiction Severity

| ID | Severity | Impact |
|---|---|---|
| C01 | **High** | Two Authority documents give conflicting maturity for ContentStudio |
| C02 | **Critical** | Three conflicting statements about SalesOS across two Authority docs |
| C03 | **High** | IM maturity differs by 2 levels between Authorities |
| C04 | **High** | Core Architecture declares IM "not implemented" while other docs say L5/L4 |
| C05 | **Critical** | Internal contradiction in PRODUCT_STATUS_MATRIX about SalesOS |

---

## 4. Documents by Type (Current Classification)

Based on the Charter's 5-type system, preliminary classification of key documents:

### Authorities (15 identified)

| Document | Knowledge Area |
|---|---|
| `docs/DOCUMENTATION_AUTHORITY.md` | Documentation Hierarchy |
| `docs/governance/aqliya-knowledge-governance-charter-v1.md` | Knowledge Governance |
| `docs/official/AQLIYA_MASTER_REFERENCE.md` | Master Reference (cross-area) |
| `docs/official/aqliya-vision-v1.1.md` | Platform Identity |
| `docs/official/aqliya-product-taxonomy-v1.1.md` | Product Taxonomy |
| `docs/official/aqliya-core-architecture-v1.1.md` | Architecture |
| `docs/official/aqliya-glossary-v1.1.md` | Glossary |
| `docs/official/aqliya-roadmap-v1.1.md` | Roadmap (partially superseded) |
| `docs/official/AQLIYA_ROADMAP_v1.2.md` | Roadmap (active) |
| `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | Product Status |
| `docs/source-of-truth/ROUTE_STRATEGY.md` | Routes |
| `docs/source-of-truth/READINESS_GATES.md` | Readiness |
| `docs/governance/ai-governance.md` | AI Governance |
| `docs/governance/SECURITY_REVIEW.md` | Security Governance |
| `AGENTS.md` | Agent Execution |

### References (need full inventory)

| Document | References Authority |
|---|---|
| `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` | Core Architecture |
| `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` | Product Taxonomy |
| `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` | Master Reference |
| `docs/source-of-truth/AQLIYA_THEORETICAL_DOCUMENTATION_SYSTEM.md` | Documentation Authority |
| `docs/README.md` | Documentation Authority |

---

## 5. Superseded / Historical Documents Identified

These documents declare themselves superseded or are confirmed historical:

| Document | Superseded By | Status in Document |
|---|---|---|
| `docs/source-of-truth/L6_PRODUCTION_ROADMAP.md` | `AQLIYA_ROADMAP_v1.2.md` + `L6_COMPLETION_PROGRAM.md` | Explicitly declared superseded |
| `docs/source-of-truth/ENTERPRISE_COMPLETION_ROADMAP.md` | `AQLIYA_ROADMAP_v1.2.md` | Explicitly declared superseded |
| `docs/official/aqliya-roadmap-v1.1.md` | `AQLIYA_ROADMAP_v1.2.md` | Version says "partially superseded" |
| `docs/official/aqliya-opencode-operating-system.md` | `AGENTS.md` | Explicitly cites AGENTS.md as superseding |

---

## 6. Claims Requiring Verification (Wave 2 Candidate List)

These claims in PRODUCT_STATUS_MATRIX need code reality verification:

| # | Claim | Verification Method |
|---|---|---|
| V01 | AuditOS: L5 Pilot-ready | Check routes, workflow, seed data, tests |
| V02 | DecisionOS: 42 action tests | Count test files in `src/actions/decisions/` |
| V03 | Office AI Assistant: 6 task types, 7 seed tasks | Check `prisma/seed.ts` and assistant routes |
| V04 | WorkflowOS: 31 action tests | Count test files |
| V05 | ContentStudio: seed data, sidebar, PDF export | Check `prisma/seed-content-studio.ts`, sidebar, export action |
| V06 | SalesOS: 13 Prisma models | Check `prisma/schema.prisma` for sales models |
| V07 | SalesOS: L5 Pilot-ready | Check actual route status, tests, seed data |
| V08 | LocalContentOS: 265 passing tests | Run local content test suite |
| V09 | Institutional Memory: L5 Pilot-ready | Check routes, graph, seed data |
| V10 | RiskOS: L5 Pilot-ready | Check routes, tests, seed |
| V11 | LocalContactOS: 15 integration tests | Check test files |
| V12 | ContentStudio: "Not classified in official taxonomy" | Check taxonomy docs |
| V13 | ContentStudio: PDF export exists | Check export service |
| V14 | `Master_Reference` ContentStudio claim (L3) vs Matrix claim (L4) | Determine which is correct |
| V15 | SalesOS claim contradiction (L5 row vs "not L5" Reality Note) | Determine actual status |

---

## 7. Baseline Summary

### What We Know

- **2,092 total files** — active knowledge surface is too large for effective governance
- **5 Authority documents conflict** — 5 cross-doc contradictions identified, 2 critical
- **PRODUCT_STATUS_MATRIX has internal contradiction** — SalesOS row says L5, Reality Note says not L5
- **MASTER_REFERENCE is stale** — last reviewed 2026-06-09, missing ~20 days of updates
- **Core Architecture declares IM "not implemented"** — contradicts later upgrades

### What Wave 2 Must Verify

1. Resolve the 5 contradictions through code reality inspection
2. Verify all 15 maturity level claims against actual routes and tests
3. Determine true status of SalesOS (L4 or L5?)
4. Determine true status of ContentStudio (L3 or L4?)
5. Update MASTER_REFERENCE to match reality

### What Wave 3 Must Remediate

1. Fix all contradicted claims
2. Update or annotate all stale statements
3. Resolve internal contradictions within documents
4. Realign MASTER_REFERENCE with PRODUCT_STATUS_MATRIX and code reality

---

*End of Baseline Inventory — no files modified.*
