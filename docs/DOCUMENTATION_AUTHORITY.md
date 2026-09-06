# AQLIYA Documentation Authority

**Status:** Active — Highest documentation conflict-resolution authority  
**Version:** 1.1  
**File location:** `docs/DOCUMENTATION_AUTHORITY.md`  
**Effective date:** 2026-05-22  
**Owner:** Documentation Team  
**Last Reviewed:** 2026-09-06

---

## 1. Purpose

This file defines the AQLIYA documentation hierarchy, conflict resolution rules, and the distinction between doctrine authority and implementation reality. It is the single highest authority for documentation conflicts.

For AI agents and new team members, the recommended entry point is `docs/AI_ENTRYPOINT.md`, which provides platform identity and repository orientation before diving into this authority hierarchy.

All other documentation files, READMEs, AGENTS.md, official docs, source-of-truth docs, reports, theoretical reference, and archived material derive from this hierarchy.

---

## 2. Documentation Hierarchy

| Level | Directory / File                                   | Role                          | Authority                                                     |
| ----- | -------------------------------------------------- | ----------------------------- | ------------------------------------------------------------- |
| **0** | `docs/DOCUMENTATION_AUTHORITY.md`                  | Conflict-resolution authority | Defines the hierarchy and rules                               |
| **1** | `docs/official/AQLIYA_MASTER_REFERENCE.md`         | Current master reference      | Summarizes current official project reality                   |
| **2** | `docs/official/*.md` (active doctrine)             | Official doctrine docs        | Identity, governance, trust principles, strategic positioning |
| **2** | `docs/archive/governance/aqliya-knowledge-governance-charter-v1.md` | Knowledge governance rules (archived 2026-07-01; `docs/governance/` was removed) | Defines document types, authority rules, conflict resolution, and lifecycle metadata for all documentation |
| **3** | `README.md`                                        | Project entry point           | Entry-level orientation, not highest authority                |
| **3** | `AGENTS.md`                                        | Agent operating contract      | Execution instructions for AI agents                          |
| **3** | `docs/README.md`                                   | Documentation index           | Navigation aid                                                |
| **4** | `docs/source-of-truth/*`                           | Supporting references         | Architecture, taxonomy, route strategy, product status        |
| **5** | `docs/products/README.md` (restored 2026-07-12), `docs/pilot/*` | Product / pilot docs | Product-specific detail and operations. `docs/systems/` removed 2026-07-01 — see `docs/assets/auditos/`, `docs/runbooks/`, `docs/architecture/` |
| **6** | `docs/evidence/reports/*`, `docs/reports/*` | Reports and evidence | Implementation status evidence, not doctrine. `docs/reports/` empty — primary reports at `docs/evidence/reports/` |
| **7** | `docs/archive/theoretical-reference/*` | Background theory (archived 2026-07-01) | Intellectual foundation, background only. Active `docs/theoretical-reference/` was removed; material archived. |
| **8** | `docs/archive/*`                                   | Historical docs               | Historical reference only                                     |

---

## 3. What Each Folder Controls

| Folder / File                  | Controls                                                                                                    | Does NOT Control                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `docs/official/*`              | Identity, naming, trust principle, governance boundaries, strategic positioning, product taxonomy framework | Implementation status, route reality, validated code behavior |
| `README.md`                    | Entry-level project orientation                                                                             | Product status, detailed architecture, conflict resolution    |
| `AGENTS.md`                    | Agent execution contract, coding rules                                                                      | Product taxonomy, implementation status                       |
| `docs/source-of-truth/*`       | Architecture model, system taxonomy, route strategy, product status matrix, readiness gates                 | Doctrine, identity, governance principles                     |
| `docs/products/README.md`     | Product documentation index (restored 2026-07-12 after cleanup removed directory) | Taxonomy classification, architecture decisions |
| `docs/evidence/reports/*`     | Evidence of implementation progress, validation results | Doctrine, taxonomy, product status definitions |
| `docs/archive/theoretical-reference/*` | Intellectual foundation, domain theory (archived 2026-07-01) | Implementation status, product claims, route decisions |
| `docs/archive/*`               | Historical record                                                                                           | Current policy, status, or doctrine                           |

---

## 4. Doctrine Authority vs. Implementation Reality

A fundamental distinction:

- **Doctrine authority** — what AQLIYA should be, its identity, governance principles, trust rules, strategic positioning. These come from `docs/official/*` doctrine docs.
- **Implementation reality** — what is actually built, deployed, and validated in the code repository. This is determined by inspecting code, schema, routes, actions, seeds, tests, and validation reports.

Doctrine defines the target. Code proves the current state.

---

## 5. Conflict Resolution Rules

### 5.1 Identity, Naming, Trust, Governance, Strategy Conflicts

Follow `docs/official/*` doctrine docs. These define the non-negotiable platform identity.

### 5.2 Implementation Status Conflicts

Inspect current code, schema, routes, actions, seeds, tests, and latest validation reports.

If official docs claim a product is "not implemented" but code proves otherwise, **code reality wins**.

The correction process:

1. Document the conflict.
2. Update the stale official docs to match reality.
3. Reference the evidence (routes, actions, tests, validation reports).

### 5.3 Doctrine vs. Code Conflicts

If a doctrine document makes an implementation-status claim that contradicts validated code, update the doctrine document.

If a doctrine document makes an identity/governance claim that is correct doctrine but has not yet been implemented in code, preserve the doctrine claim and document the gap.

### 5.4 Reports Are Evidence, Not Doctrine

Reports in `docs/reports/*` provide evidence of implementation progress. They do not define product taxonomy, identity, or doctrine. A report may prove that a product has been implemented to a certain level. That evidence can be used to correct stale product-status claims in doctrine docs.

### 5.5 Theoretical Docs Are Background Only

`docs/archive/theoretical-reference/*` provides intellectual foundation and domain theory. It does not govern implementation status, product taxonomy, route decisions, or architectural authority. If a theoretical document claims final authority over implementation decisions, that claim is superseded by this file.

### 5.6 Archived Docs Are Historical

`docs/archive/*` is retained for historical reference only. Archived documents must not be cited as current authority for any decision.

### 5.7 No Silent Interpretations

When documents conflict, do not silently choose an interpretation. Document the conflict, apply these rules, and if ambiguity remains, escalate.

---

## 6. Conflict Resolution Priority — Document Hierarchy

This section defines the **priority order for resolving documentation conflicts**. It is NOT a reading order for AI agents. The canonical reading order is defined in `docs/AI_ENTRYPOINT.md` (§"Reading Order (Mandatory Reading for Every Session)").

When documents conflict, resolve using this priority (highest first):

| Priority | Level | Directory / File | Role |
|----------|-------|------------------|------|
| 1 | L0 | `docs/DOCUMENTATION_AUTHORITY.md` | Conflict-resolution rules (this file) |
| 2 | L1 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Current master reference |
| 3 | L2 | `docs/official/*.md` (active doctrine) | Official doctrine docs |
| 4 | L3 | `README.md`, `AGENTS.md`, `docs/README.md` | Agent contract / entry points |
| 5 | L4 | `docs/source-of-truth/*` | Supporting references |
| 6 | L5 | `docs/products/README.md`, `docs/pilot/*` | Product details. `docs/systems/` removed 2026-07-01. |
| 7 | L6 | `docs/evidence/reports/*` | Reports and evidence. `docs/reports/` exists but is empty; active reports at `docs/evidence/reports/`. |
| 8 | L7 | `docs/archive/theoretical-reference/*` | Background theory (archived 2026-07-01) |
| 9 | L8 | `docs/archive/*` | Historical only |

**Rule:** For reading order, always follow `docs/AI_ENTRYPOINT.md`. For conflict resolution, follow the hierarchy above.

---

## 7. Website Copy Authority Order

Website copy authority (in order of precedence):

1. `docs/official/aqliya-vision-v1.1.md` — Identity and positioning
2. `docs/official/aqliya-product-taxonomy-v1.1.md` — Product claims
3. `docs/official/AQLIYA_MASTER_REFERENCE.md` — Current reality
4. `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` — Detailed status

Marketing copy must not claim capabilities that are not validated in code.

---

## 8. Product/Status Authority Order

When determining product implementation status:

1. Inspect code (routes, actions, schema, tests, seed data).
2. Inspect validation reports in `docs/evidence/reports/*`.
3. Consult `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` for detailed matrix.
4. Consult `docs/official/AQLIYA_MASTER_REFERENCE.md` for summary.
5. Consult `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` for detailed matrix.
6. Consult `docs/official/aqliya-product-taxonomy-v1.1.md` for taxonomy classification.

If doctrine doc status contradicts code evidence, code evidence governs.

---

## 9. Route/Status Authority Order

When determining route status:

1. Inspect `src/app/` for actual route files.
2. Consult `docs/source-of-truth/ROUTE_STRATEGY.md`.
3. Consult `docs/official/AQLIYA_MASTER_REFERENCE.md`.

---

## 10. Rule for Outdated Official Docs

Official docs that contain stale implementation-status claims must be updated when:

- Code evidence proves a different status.
- Validation reports confirm the change.
- The correction is documented in a reports file.

Do not leave official docs in a state where they contradict validated code reality.

---

## 11. Rule for Pre-v1.1 / Archived Concepts

Products or concepts that existed in pre-v1.1 documentation but are not in the current official taxonomy (e.g., Edit OS, Content Authority OS) must be:

- Removed from active product listings.
- Moved to a "Pre-v1.1 / Removed Concepts" section if retained for historical context.
- Archived if they have no ongoing relevance.

They must not appear as current active official products.

---

## 12. Relationship Between v1.1 Doctrine Docs and v0.1 Operational Baseline

The v1.1 doctrine docs define the long-term platform identity and governance framework. The v0.1 operational baseline (code, routes, schema, deployed surfaces) represents the current implementation reality.

- v1.1 doctrine is the target.
- v0.1 code is the current state.
- When they diverge on implementation status, code reality governs.
- When they diverge on identity/governance principles, doctrine governs.

---

## 12a. Glossary Precision Rule

> **Adopted per Sprint M2 (2026-06-29).**

### The Rule

Ambiguous terms describing product status are **prohibited** in all governance, official, and source-of-truth documents.

**Forbidden terms:**
- "Strategic Future"
- "Planned"
- "Coming Soon"
- "Future Product"
- Any phrase that combines a timeline with a non-specific status

**Required replacement:** Use explicit values from the Four Dimensions model:

| Dimension | Allowed Values |
|-----------|----------------|
| Implementation Reality | Implemented / Partially Implemented / Not Implemented |
| Product Maturity | L0–L6 (with rubric reference) |
| Commercial Claim | Claimable / Not Claimable / Conditional |
| Strategic Intent | Approved / Deferred / Frozen / Experimental |

### Examples

| Instead of... | Write... |
|---------------|---------|
| "Institutional Memory is a strategic future product" | "Institutional Memory: Implementation Reality = Implemented (4 routes, 4 models). Strategic Intent = Deferred (not yet approved for commercial claim)." |
| "RiskOS is planned" | "RiskOS: Implementation Reality = Implemented (9 routes, KPI dashboard, audit trail). Commercial Claim = Not Claimable." |
| "Local AI Provider is a future offering" | "Local AI Provider: Implementation Reality = Partially Implemented (architecture doc exists, no production routes). Strategic Intent = Experimental." |

### Enforcement

- This rule applies to all documents at Levels 0–4 in the hierarchy
- Violations found during review must be flagged as P2 (cosmetic) or P1 (if they cause confusion) priority
- The Knowledge Governance Gate (future CI check) will validate compliance

---

## 13. Amendment

This file may only be amended by:

1. Documented decision.
2. Updated version with changelog entry.
3. Preservation of the core hierarchy and conflict rules.

Do not bypass this file by creating new "highest authority" documents.

---

## 14. Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2026-05-22 | 1.0 | Initial creation | OpenCode |
| 2026-06-26 | 1.1 | §6 redefined from "Agent Loading Order" to "Conflict Resolution Priority" — canonical reading order moved to AI_ENTRYPOINT.md. Added Owner, Last Reviewed, Change Log. | OpenCode |
| 2026-06-29 | 1.2 | §12a added — Glossary Precision Rule. Bans ambiguous terms (Strategic Future, Planned, Coming Soon). Requires explicit Four Dimensions values. | OpenCode |
| 2026-07-12 | 1.3 | §2, §3, §6 — Updated hierarchy to reflect directory cleanup (2026-07-01): docs/products/ restored with index README; docs/systems/, docs/governance/, docs/theoretical-reference/ noted as removed/archived; docs/evidence/reports/ noted as primary reports location. Fixed 18 cross-document broken links and 5 docs/products/-referencing links. | OpenCode (docs-agent) |
