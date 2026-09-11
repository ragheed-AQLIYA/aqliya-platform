# AQLIYA Documentation Audit
**Date:** 2026-07-12  
**Auditor:** OpenCode (Documentation Auditor agent)  
**Scope:** All `docs/` directories — 2,312 markdown files across 40+ subdirectories  
**Authority:** `docs/DOCUMENTATION_AUTHORITY.md` v1.2

---

## 1. Executive Summary

AQLIYA documentation is **productively large** (2,312 Markdown files) but suffers from **hierarchy drift, inconsistent product-level claims between docs, and structural gaps**. The most significant issues are: (1) the `docs/products/` directory referenced at hierarchy Level 5 does not exist, (2) ~18 broken cross-document links across the archive and active surfaces, (3) multiple operator guides claim L5 while PRODUCT_STATUS_MATRIX claims L6 for the same product. The documentation foundation is strong, but synchronization between doctrine docs, operator guides, and product status claims needs attention.

---

## 2. Hierarchy Compliance

### 2.1 Hierarchy as Defined

The authority hierarchy in `docs/DOCUMENTATION_AUTHORITY.md` defines 9 levels:

| Level | Directory / File | Actual Status |
|-------|-----------------|---------------|
| L0 | `docs/DOCUMENTATION_AUTHORITY.md` | EXISTS, active |
| L1 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | EXISTS |
| L2 | `docs/official/*.md` (active doctrine) | EXISTS — 17 files |
| L2 | `docs/governance/aqliya-knowledge-governance-charter-v1.md` | NOT FOUND — `docs/governance/` does not exist |
| L3 | `README.md`, `AGENTS.md`, `docs/README.md` | EXISTS |
| L4 | `docs/source-of-truth/*` | EXISTS — 30+ files |
| L5 | `docs/products/*`, `docs/systems/*`, `docs/pilot/*` | `docs/products/` DOES NOT EXIST; `docs/systems/` DOES NOT EXIST; `docs/pilot/` exists |
| L6 | `docs/reports/*` | Directory exists but EMPTY (0 .md files) |
| L7 | `docs/theoretical-reference/*` | Archive contains this material; active directory NOT FOUND |
| L8 | `docs/archive/*` | EXISTS |

### 2.2 Hierarchy Violations Found

| Issue | Detail | Severity |
|-------|--------|----------|
| **Level 5 gap** | `docs/products/` directory does not exist but is referenced in hierarchy and linked from 20+ files | HIGH |
| **Level 5 gap** | `docs/systems/` directory does not exist | MEDIUM |
| **Level 6 migration** | `docs/reports/` exists but is empty — reports live in `docs/evidence/reports/` instead | MEDIUM |
| **Level 7 migration** | `docs/theoretical-reference/` moved to `docs/archive/theoretical-reference/` — active surface at L7 is empty | LOW |
| **L2 governance** | `docs/governance/` directory does not exist — governance charter listed in hierarchy is unfindable | MEDIUM |
| **Runbook index** | `docs/runbooks/README.md` does not exist — no index for scattered runbooks | MEDIUM |

### 2.3 Conflicting Claims Between Docs

| Conflict | Doc A | Doc B | Resolution |
|----------|-------|-------|------------|
| DecisionOS level | `decisionos-operator-guide.md`: "L5 Pilot-ready" | `PRODUCT_STATUS_MATRIX.md`: "L6 Production-hardened" | Matrix governs — operator guide is stale |
| WorkflowOS level | `workflowos-operator-guide.md`: "L5 Pilot-ready" | `PRODUCT_STATUS_MATRIX.md`: "L6 Production-hardened" | Matrix governs — operator guide is stale |
| ContentStudio L6 | `PRODUCT_STATUS_MATRIX.md` row 35: "L6 Production-hardened" | `PRODUCT_STATUS_MATRIX.md` reality note line 116: "Not classified as L6" | Internal contradiction within same file |
| SalesOS L6 | `PRODUCT_STATUS_MATRIX.md` row 36: "L6" | Reality note line 114: "Not L6 — no automated CRM sync" | Internal contradiction within same file |
| Roadmap versions | `aqliya-roadmap-v1.1.md`: Phase 12 not listed, 15 phases | `AQLIYA_ROADMAP_v1.2.md`: full repository reality edition, 12 layers | v1.2 supersedes v1.1 but v1.1 is in `docs/official/` (higher authority) |
| SalesOS frozen | `ENTERPRISE_COMPLETION_ROADMAP.md`: "Freeze as internal tool" | Code: 100+ files modified | Code reality governs — documented in ROADMAP_CONFLICT_MATRIX.md |

---

## 3. Product Status Accuracy

### 3.1 Claimed vs Actual Level Audit

| Product | Claimed Level (Matrix) | Operator Guide Level | Reality Notes | Discrepancy |
|---------|----------------------|---------------------|---------------|-------------|
| AQLIYA Platform | L6 | — | Dev + Prod live; pentest pending | L6 code-level accurate; production gate pending |
| AuditOS | L6 | — | 8 engines, 3,909 tests | L6 code-level accurate |
| DecisionOS | **L6** | **L5** | 42+ tests, full boundaries | Operator guide needs update to L6 |
| WorkflowOS | **L6** | **L5** | 31 action tests, full boundaries | Operator guide needs update to L6 |
| Office AI Assistant | L6 | — | 248 tests | L6 accurate |
| SalesOS | **L6** | — | Reality note line 114 says "Not L6" | **CONTRADICTION**: Matrix row says L6 but reality note disagrees |
| LocalContentOS | L6 | L6 (in guide) | 265+ tests, 27 routes | Consistent |
| LocalContactOS | L6 | — | 15 integration tests | L6 code-level; seed data limited (6 contacts) |
| RiskOS | L6 | — | 4 routes, 1 model, 1 assessment | L6 boundaries met; data volume thin |
| ContentStudio | **L6** | — | Reality note line 116 says "Not classified as L6" | **CONTRADICTION**: Matrix says L6, reality note says not |
| Institutional Memory | L6 | — | 4 routes, graph + events | L6 boundaries met |
| Knowledge Foundation | L6 | — | 87 tests, release pipeline | L6 accurate |
| SSO (SAML/OIDC) | L6 | — | 65 tests | L6 accurate |
| SCIM v2 | L6 | — | Audit trail + API key auth | L6 accurate |
| Platform audit logs | L4 | — | — | Accurate |
| Organizations surface | L5 | — | Real Prisma data | Accurate |
| auditos demo | L1 | — | Demo only | Accurate |
| Generic settings | L2 | — | Shell | Accurate |
| AI Governance | L4 | — | Real engine, real routing | Accurate |
| Local AI runtime | L4 | — | Pilot connectivity only | Accurate |
| SimulationOS | L1 | — | Marketing only | Accurate |
| ComplianceOS/LegalOS/GovOS | L0 | — | Not implemented | Accurate |

### 3.2 "L6 Production-hardened" — Does It Hold?

The term "L6 Production-hardened" is used for 14 systems in the current matrix. Close inspection reveals:

- **Code-level L6 is met** for all 14: tests pass, error/loading/not-found boundaries exist, audit trail implemented, build passes
- **Production-operational L6**: The platform itself, DevOps infrastructure, and Intelligence Core have production deployment (dev + prod live). Other "L6" products have only code-level L6 — production operational validation varies
- **ContentStudio** and **SalesOS** have internal contradictions in their own reality notes questioning L6 classification
- The roadmap explicitly qualifies: "L6 is code-level only" and "not regulator-certified"
- **Risk**: "L6 Production-hardened" label may create false sense of production readiness for products that have never been deployed to production infrastructure

---

## 4. ADR Inventory

### 4.1 ADR Files Found

| ID | File | Location | Status |
|----|------|----------|--------|
| ADR-001 | `docs/architecture/ADR-001-AI-RUNTIME-STRATEGY.md` | `docs/architecture/` (root) | Accepted, 2026-06-09 |
| ADR-003 | `docs/archive/phase2/ADR-003-authorization-consolidation.md` | `docs/archive/phase2/` (archived) | Accepted, 2026-06-25 |
| ADR-028 | `docs/architecture/adr/ADR-028-KNOWLEDGE-FOUNDATION-BRIDGE.md` | `docs/architecture/adr/` | Accepted, 2026-06-21 |
| ADR-DEPLOY-001 | `docs/adr/ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT.md` | `docs/adr/` (separate directory) | Accepted, 2026-07-08 |

### 4.2 ADR Index vs Reality

The `docs/architecture/ARCHITECTURE_DECISION_INDEX.md` claims 16 ADRs (ADR-001 through ADR-016). Only 4 ADR files actually exist on disk. The remaining 12 ADRs (ADR-002 through ADR-013) exist **only as sections within `AQLIYA_ARCHITECTURE_CONSTITUTION.md`** — they are constitutional principles, not standalone ADR documents.

| Issue | Detail |
|-------|--------|
| **ADR template non-compliance** | No ADR file follows the template prescribed in the index (§"ADR Template") — none use the YAML frontmatter format specified |
| **Scattered locations** | ADRs exist in 4 different directories: `docs/architecture/`, `docs/architecture/adr/`, `docs/adr/`, `docs/archive/phase2/` |
| **Missing ADR-002** | The index says 16 but lacks ADR-002 (jumps 001 → 003 in files) |
| **ADR-DEPLOY-001 not indexed** | `docs/adr/ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT.md` exists but is not in the architecture decision index |
| **Archived ADR** | ADR-003 lives in `docs/archive/phase2/` — should active authorization specs cite an archived ADR? |
| **ADR Validation** | `engineering/os/ADR_VALIDATION.md` exists but its contents were not readable for this audit |

### 4.3 Code Compliance

| ADR | Code Traceable? | Evidence |
|-----|----------------|----------|
| ADR-001 (AI Runtime) | YES | `src/lib/ai/`, `src/lib/tb-intelligence/` |
| ADR-003 (Authorization) | YES | `src/lib/authorization/` |
| ADR-028 (Knowledge Bridge) | YES | `src/lib/tb-intelligence/knowledge-mining/`, `src/lib/knowledge-foundation/` |
| ADR-DEPLOY-001 (WAF) | YES | `infra/terraform/` — `web_acl_id` parameter |

---

## 5. Runbook Assessment

### 5.1 Runbook Inventory

Runbooks are scattered across **6 directories** with no central index (`docs/runbooks/README.md` does not exist):

| Directory | Runbook Files Found |
|-----------|-------------------|
| `docs/runbooks/` | 7 files (localcontentos-*, decisionos-*, workflowos-*, production-support, intelligence-core-rag, institutional-memory) |
| `docs/operations/` | 45 files (production-deployment, backup-restore, cypress-local, pgvector, firm-memory, customer-demo, etc.) |
| `docs/deployment/` | 20+ files (PRODUCTION_CUTOVER, POST_DEPLOY_SMOKE_TESTS, STATE_RECOVERY, INCIDENT_ROLLBACK, etc.) |
| `docs/pilot/` | customer-tb-intake-runbook.md |
| `docs/auditos/` | limited-production-pilot-runbook.md |
| `docs/assets/` | pilot-operating-runbook.md, pilot-session-runbook.md |

### 5.2 Actionability Assessment

| Runbook | Actionable? | Tested? | Gaps |
|---------|------------|---------|------|
| `production-support-runbook.md` (v1.0, 2026-06-21) | YES — has startup sequences, health checks, backup/recovery commands | PARTIAL — dev-tested only | References health endpoints (`/api/health/live`, `/api/health/ready`) without confirming they exist in code |
| `localcontentos-operator-guide.md` (v1.0, 2026-06-30) | YES — 340 lines, bilingual, full routes, workflow lifecycle, config, troubleshooting | LIKELY — comprehensive | Claims L6 but internal reconciliation deferred |
| `decisionos-operator-guide.md` (2026-06-18) | YES — 216 lines, bilingual, states, evidence mgmt, export flow | LIKELY | Claims L5 — stale vs L6 matrix |
| `workflowos-operator-guide.md` (2026-06-18) | YES — 260 lines, template creation, SLA monitoring, export | LIKELY | Claims L5 — stale vs L6 matrix |
| `localcontentos-deployment-runbook.md` | EXISTS | UNKNOWN | Not audited in depth |
| `localcontentos-dr-plan.md` | EXISTS | UNKNOWN | Not audited in depth |
| `production-deployment-runbook.md` (in `docs/operations/`) | YES | PARTIAL | Infrastructure-specific; needs live verification |
| `INCIDENT_ROLLBACK_RUNBOOK.md` (in `docs/deployment/`) | YES | PARTIAL | Operational governance pack; IaC-dependent |
| Deployment governance pack (9 files) | YES — PROD_DEPLOYMENT_CHECKLIST, RELEASE_ROLLBACK_POLICY, etc. | PARTIAL — IaC code-complete, needs AWS credentials | Most not tested against live production |
| `pgvector-staging-runbook.md` | YES | UNKNOWN | Infrastructure-dependent |
| `firm-memory-deployment-runbook.md` | YES | UNKNOWN | Infrastructure-dependent |

---

## 6. Broken Links Report

18 broken cross-document links found:

| File | Broken Link | Type |
|------|-------------|------|
| `docs/architecture/adr/ADR-028-*.md` | `../../audits/PHASE_28_ARCHITECTURE_AUDIT.md` | MISSING FILE |
| `docs/archive/2026-06/RELEASE_DECISION-audits-copy.md` | `../../review/RELEASE_DECISION.md` | MISSING FILE |
| `docs/archive/deliverables/PHASE_29_P2_ENTERPRISE_OPERATIONS.md` | `../operations/knowledge-foundation/TABLETOP_READINESS_CHECKLIST.md` | WRONG RELATIVE PATH |
| `docs/archive/deliverables/PHASE_29_TABLETOP_EXIT_GATE.md` | `../operations/knowledge-foundation/TABLETOP_READINESS_CHECKLIST.md` | WRONG RELATIVE PATH |
| `docs/archive/deliverables/PILOT_EXECUTION_READINESS_PHASE7.md` | `../operations/PILOT_OPERATIONAL_HANDBOOK.md` | WRONG RELATIVE PATH |
| `docs/archive/governance/BROKEN_REFERENCES.md` | `../BASELINE_REPORT.md` | MISSING FILE |
| `docs/archive/old-reports/README.md` | `../../reports/eid-continuous-build-index-2026-05-28.md` | WRONG RELATIVE PATH |
| `docs/archive/strategic/EXECUTION_KICKOFF.md` | `../commercial/WHAT_WE_DO_NOT_CLAIM.md` | WRONG RELATIVE PATH |
| `docs/assets/auditos-pilot-execution-index.md` | `../reports/eid-continuous-build-index-2026-05-28.md` | WRONG RELATIVE PATH |
| `docs/assets/auditos/PHASE_8_1_CANONICAL_COA.md` | `../../audits/TB_CLOSING_ADJUSTMENT_ANALYSIS.md` | MISSING FILE |
| `docs/commercial/README.md` | `../products/auditos-commercial-master-index.md` | `docs/products/` DOES NOT EXIST |
| `docs/demo/aqliya-controlled-demo-package-2026-05-24.md` | `../reports/aqliya-demo-to-pilot-final-readiness-2026-05-24.md` | WRONG RELATIVE PATH |
| `docs/evidence/audits/RELEASE_DECISION.md` | `../review/RELEASE_DECISION.md` | WRONG RELATIVE PATH |
| `docs/evidence/audits/truth-reconciliation-*/FINAL_TRUTH_RECONCILIATION.md` | `../../source-of-truth/AQLIYA_CURRENT_STATE.md` | WRONG RELATIVE PATH |
| `docs/evidence/reports/eid-continuous-build-index-*.md` | `../archive/old-reports/eid-continuous-build-wave-1-*.md` | WRONG RELATIVE PATH |
| `docs/evidence/validation/cycle-6/CERTIFICATION_BLOCKERS.md` | `../../operations/parallel-execution-cycle-2026-06-06-cycle-6-close.md` | FILE MOVED TO ARCHIVE |
| `docs/pilot/PILOT-PACK-INDEX.md` | `../products/auditos-commercial-master-index.md` | `docs/products/` DOES NOT EXIST |
| `docs/programs/localcontentos-production-readiness/PROGRAM_CHARTER.md` | `../../PROGRAM_CLOSURE.md` | MISSING FILE |

**Root causes:**
- 7 links: target file doesn't exist at all
- 8 links: wrong relative path (archive files pointing to pre-move locations)
- 3 links: `docs/products/` references — directory never existed

---

## 7. Outdated Documentation

### 7.1 Files With Stale Claims

| File | Issue | Last Updated |
|------|-------|-------------|
| `decisionos-operator-guide.md` | Claims "L5 Pilot-ready" — product is L6 per matrix | 2026-06-18 |
| `workflowos-operator-guide.md` | Claims "L5 Pilot-ready" — product is L6 per matrix | 2026-06-18 |
| `aqliya-roadmap-v1.1.md` | Missing Phase 10a-15 (LocalContactOS, RiskOS, ContentStudio, Knowledge Foundation, Institutional Memory) present in v1.2 | 2026-07-03 |
| `aqliya-glossary-v1.1.md` | Line 31 uses banned term "Planned direction" per §12a; line 45 says LocalContentOS is "L5" — now L6 | 2026-06-29 |
| `docs/official/AQLIYA_MASTER_REFERENCE.md` | References "L5 Pilot-ready" for some products now at L6 — needs full L6 sync | Unknown |
| `PRODUCT_STATUS_MATRIX.md` | Internal contradiction: ContentStudio row claims L6 but reality note line 116 says "Not classified as L6"; SalesOS row claims L6 but reality note line 114 says "Not L6" | 2026-07-03 |

### 7.2 Pre-v1.1 Removed Concepts Still Referenced

| File | Stale Reference |
|------|----------------|
| `docs/archive/theoretical-reference/institutional-memory/strategic-doctrine-map.md` | Lists "Edit OS" and "Content Authority OS" as current products — line 16 |
| `docs/evidence/reports/project-organization/02-source-of-truth-review.md` | Documents the above as an open issue (C9) — not yet resolved |

These are both in archived docs and flagged with historical banners, but the `strategic-doctrine-map.md` lacks a prominent historical warning.

### 7.3 Date Stamp Audit

| Directory | Most Recent Update | Stalest File |
|-----------|-------------------|-------------|
| `docs/official/` | 2026-07-03 (roadmap) | Unclear — some files lack date stamps in body |
| `docs/source-of-truth/` | 2026-07-03 (PRODUCT_STATUS_MATRIX) | Some files predate 2026-06 |
| `docs/runbooks/` | 2026-06-30 (localcontentos) | 2026-06-18 (decisionos, workflowos) |
| `docs/operations/` | Mixed — some as recent as 2026-07 | Varies |
| `docs/archive/` | 2026-06-28 (latest archival) | 2026-05-24 (earliest wave reports) |

### 7.4 Archive Hygiene

The `docs/archive/` directory is **well-maintained**:
- `docs/archive/README.md` properly states "historical only" status
- Pre-v1.1 product concepts properly archived under `sunbul-product-legacy/`
- Old reports properly archived under `old-reports/`
- Parallel execution cycles properly archived under `operations/`
- Theoretical reference material properly archived under `theoretical-reference/`

**Issue:** Some archived operations files still have active-looking links to non-archived files, creating the 8 broken links with wrong relative paths (see §6).

---

## 8. Coverage Gaps

### 8.1 Missing Documentation Types

| Product/Area | Missing Doc Type | Priority |
|-------------|------------------|----------|
| `docs/products/` | Entire directory — product-specific detail docs | HIGH — hierarchy Level 5 gap |
| `docs/systems/` | Entire directory — system-level detail docs | MEDIUM — hierarchy Level 5 gap |
| `docs/runbooks/README.md` | Runbook index — no way to navigate 50+ runbooks across 6 directories | HIGH |
| `docs/reports/` | Directory exists but EMPTY — reports live in `docs/evidence/reports/` | MEDIUM |
| RiskOS | Operator guide | MEDIUM |
| LocalContactOS | Operator guide | MEDIUM |
| ContentStudio | Operator guide | MEDIUM |
| Institutional Memory | Operator guide exists? Checked: `docs/runbooks/institutional-memory-guide.md` — lightweight, no full operator guide | LOW |
| Knowledge Foundation | Operator guide | LOW |
| SalesOS | Operator guide | MEDIUM |
| Arabic documentation | Glossaries are English-only except `audit-arabic-terminology-glossary-v1.md` | HIGH |
| onboarding | No new-developer onboarding guide in docs (exists in skills directory) | LOW |
| operators | `docs/user/MANUAL.md` exists and is bilingual but covers platform-level only | LOW |

### 8.2 Products Without Product Docs

Per hierarchy Level 5 (`docs/products/*`), every product should have dedicated documentation. Since the directory doesn't exist:

| Product | Has dedicated doc? | Location if exists |
|---------|-------------------|-------------------|
| AuditOS | Partial | `docs/02-accounting-methodology/`, `docs/03-audit-methodology/`, `docs/05-notes-system/` |
| DecisionOS | YES | `docs/runbooks/decisionos-operator-guide.md` |
| LocalContentOS | YES | `docs/runbooks/localcontentos-operator-guide.md`, `docs/runbooks/localcontentos-*` |
| WorkflowOS | YES | `docs/runbooks/workflowos-operator-guide.md` |
| SalesOS | Partial | Architecture docs at `docs/architecture/SALESOS_*.md` |
| RiskOS | NO | — |
| LocalContactOS | NO | — |
| ContentStudio | NO | Taxonomy definition only |

### 8.3 APIs Without Docs

`docs/api/API_REFERENCE.md` is comprehensive (650 lines, updated 2026-07-11) with full endpoint catalog. It is the single strongest documentation artifact found. API coverage is **not a gap**.

---

## 9. Traceability Matrix

| Capability | Spec/Doctrine Doc | Code Evidence | Tests | Traceable? |
|-----------|-------------------|---------------|-------|------------|
| Platform tenant isolation | `aqliya-core-architecture-v1.1.md` | `src/middleware.ts`, `src/lib/authorization/` | Integration tests | YES |
| AuditOS 8 engines | `PRODUCT_STATUS_MATRIX.md` §AuditOS | `src/lib/audit/*`, `src/lib/tb-intelligence/` | 3,909 tests | YES |
| DecisionOS lifecycle | `PRODUCT_STATUS_MATRIX.md` §DecisionOS | `src/actions/decision-*.ts` | 42+ tests | YES |
| LocalContentOS scoring | `PRODUCT_STATUS_MATRIX.md` §LocalContentOS | `src/lib/local-content/workbook/` | 265+ tests | YES |
| AI Governance | `ADR-001-AI-RUNTIME-STRATEGY.md` | `src/lib/ai/` | Eval gate tests | YES |
| SalesOS intelligence hub | `PRODUCT_STATUS_MATRIX.md` §SalesOS | `src/lib/sales/intelligence/` | 45 test files | PARTIAL — module imports flagged as phantom in reality notes |
| Knowledge Foundation release pipeline | `ADR-028-KNOWLEDGE-FOUNDATION-BRIDGE.md` | `src/lib/knowledge-foundation/` | 87 tests | YES |
| SSO/SAML | `PRODUCT_STATUS_MATRIX.md` §SSO | `src/lib/auth/sso/` | 65 tests | YES |
| SCIM v2 | `PRODUCT_STATUS_MATRIX.md` §SCIM | `src/app/api/scim/` | Provisioning tests | YES |
| Institutional Memory graph | `PRODUCT_STATUS_MATRIX.md` §Institutional Memory | `src/lib/core/intelligence-graph/` | D3.js visualization, not unit-tested | PARTIAL |
| AQLIYA Studio | `aqliya-product-taxonomy-v1.1.md` | — | — | NO — L0 only |
| On-Prem deployment | Roadmap Phase 8 | — | — | NO — L0 only |
| Air-Gapped mode | Roadmap | — | — | NO — L0 only |

---

## 10. Documentation Health Score

| Dimension | Score (1-10) | Rationale |
|-----------|-------------|-----------|
| **Hierarchy Adherence** | 6 | Well-defined hierarchy but 2 directory levels are missing; scattered runbooks |
| **Cross-Doc Consistency** | 6 | Multiple L5/L6 contradictions between operator guides and status matrix; internal contradictions within matrix reality notes |
| **Completeness** | 7 | Strong API docs, good operator guides for major products; missing for 4 products; no `docs/products/` |
| **Link Integrity** | 5 | 18 broken links found; 3 from non-existent `docs/products/` directory; 8 from archive path drift |
| **Freshness** | 7 | Most active docs updated by 2026-07-03; some operator guides stale since 2026-06-18; 1 unresolved banned term |
| **Bilingual Coverage** | 5 | User manual and audit terminology are bilingual; main glossary is English-only; operator guides have Arabic headers but English bodies |
| **ADR Discipline** | 5 | Index claims 16 ADRs; only 4 standalone files exist; scattered across 4 directories; no template compliance |
| **Runbook Actionability** | 7 | Deployment runbooks are detailed and actionable; operator guides for major products are solid; no central index |
| **Archive Hygiene** | 8 | Properly organized; historical banners present; old concepts properly archived |
| **Traceability** | 7 | Strong for active products; gaps for future/strategic claims (expected); partial for newer systems |
| **Commercial Truthfulness** | 8 | L6 label appropriately qualified as "code-level only"; future products clearly marked; roadmap honest about contract-gated items |
| **OVERALL** | **6.5/10** | Documentation is functional but needs: (1) directory structure alignment with hierarchy, (2) operator guide L5→L6 sync, (3) broken link fixes, (4) central runbook index |

---

## Top 3 Findings (Priority Order)

### 1. CRITICAL: `docs/products/` Directory Does Not Exist

The documentation hierarchy (Level 5) defines `docs/products/*` as the location for product-specific detail docs. This directory does not exist anywhere in the repository. Twenty-plus files reference `docs/products/` paths that resolve to nothing. Product documentation is instead scattered across `docs/runbooks/`, `docs/architecture/`, `docs/02-accounting-methodology/`, and `docs/03-audit-methodology/`. Either create the directory with proper product docs OR update the hierarchy to reflect reality.

### 2. HIGH: Operator Guide Level Discrepancies (L5 vs L6)

Three operator guides (`decisionos-operator-guide.md`, `workflowos-operator-guide.md`, `localcontentos-operator-guide.md`) claim "L5 Pilot-ready" while PRODUCT_STATUS_MATRIX.md claims "L6 Production-hardened" for the same products. Additionally, PRODUCT_STATUS_MATRIX.md contains internal contradictions: ContentStudio row (line 35) says "L6" but reality note (line 116) says "Not classified as L6"; SalesOS row (line 36) says "L6" but reality note (line 114) says "Not L6." These contradictions erode trust in the product status matrix as a single source of truth.

### 3. HIGH: Glossary §12a Precision Rule Violation + Bilingual Gap

`docs/official/aqliya-glossary-v1.1.md` line 31 uses "Planned direction" — a term banned by DOCUMENTATION_AUTHORITY.md §12a (adopted 2026-06-29). Also, only the Audit Arabic terminology glossary exists; the main platform glossary is English-only despite AQLIYA's Arabic-first positioning mandate. The glossary should use explicit Four Dimensions values and be fully bilingual.

---

## Methodology

- **Files inspected:** 2,312 `.md` files across all `docs/` subdirectories
- **Deep-read files:** `DOCUMENTATION_AUTHORITY.md`, `PRODUCT_STATUS_MATRIX.md`, `aqliya-roadmap-v1.1.md`, `AQLIYA_ROADMAP_v1.2.md`, `aqliya-glossary-v1.1.md`, all ADR files, 4 operator guides, `API_REFERENCE.md`, `MANUAL.md`, `ARCHITECTURE_DECISION_INDEX.md`, `ROADMAP_CONFLICT_MATRIX.md`, `AQLIYA_SYSTEM_TAXONOMY.md`, `ROUTE_STRATEGY.md`, `production-support-runbook.md`
- **Pattern searches:** Broken links (relative-path targets resolving to existing files), banned terms (Strategic Future, Coming Soon, Planned), pre-v1.1 concept references (Edit OS, Content Authority OS), `docs/products/` references
- **Limitations:** Not all 2,312 files were read in full; broken link detection was based on relative `../` paths only, not absolute paths or anchor links; ADR code compliance verification was cursory; runbook actionability was assessed by inspection only (no live execution)
