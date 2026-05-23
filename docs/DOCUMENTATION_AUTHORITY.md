# AQLIYA Documentation Authority

**Status:** Highest documentation conflict-resolution authority  
**Version:** 1.0  
**File location:** `docs/DOCUMENTATION_AUTHORITY.md`  
**Effective date:** 2026-05-22

---

## 1. Purpose

This file defines the AQLIYA documentation hierarchy, conflict resolution rules, and the distinction between doctrine authority and implementation reality. It is the single highest authority for documentation conflicts.

All other documentation files, READMEs, AGENTS.md, official docs, source-of-truth docs, reports, theoretical reference, and archived material derive from this hierarchy.

---

## 2. Documentation Hierarchy

| Level | Directory / File                                   | Role                          | Authority                                                     |
| ----- | -------------------------------------------------- | ----------------------------- | ------------------------------------------------------------- |
| **0** | `docs/DOCUMENTATION_AUTHORITY.md`                  | Conflict-resolution authority | Defines the hierarchy and rules                               |
| **1** | `docs/official/AQLIYA_MASTER_REFERENCE.md`         | Current master reference      | Summarizes current official project reality                   |
| **2** | `docs/official/*.md` (active doctrine)             | Official doctrine docs        | Identity, governance, trust principles, strategic positioning |
| **3** | `README.md`                                        | Project entry point           | Entry-level orientation, not highest authority                |
| **3** | `AGENTS.md`                                        | Agent operating contract      | Execution instructions for AI agents                          |
| **3** | `docs/README.md`                                   | Documentation index           | Navigation aid                                                |
| **4** | `docs/source-of-truth/*`                           | Supporting references         | Architecture, taxonomy, route strategy, product status        |
| **5** | `docs/product/*`, `docs/systems/*`, `docs/pilot/*` | Product / system / pilot docs | Product-specific detail and operations                        |
| **6** | `docs/reports/*`                                   | Reports and evidence          | Implementation status evidence, not doctrine                  |
| **7** | `docs/theoretical-reference/*`                     | Background theory             | Intellectual foundation, background only                      |
| **8** | `docs/archive/*`                                   | Historical docs               | Historical reference only                                     |

---

## 3. What Each Folder Controls

| Folder / File                  | Controls                                                                                                    | Does NOT Control                                              |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `docs/official/*`              | Identity, naming, trust principle, governance boundaries, strategic positioning, product taxonomy framework | Implementation status, route reality, validated code behavior |
| `README.md`                    | Entry-level project orientation                                                                             | Product status, detailed architecture, conflict resolution    |
| `AGENTS.md`                    | Agent execution contract, coding rules                                                                      | Product taxonomy, implementation status                       |
| `docs/source-of-truth/*`       | Architecture model, system taxonomy, route strategy, product status matrix, readiness gates                 | Doctrine, identity, governance principles                     |
| `docs/product/*`               | Product-specific detail, commercial specs                                                                   | Taxonomy classification, architecture decisions               |
| `docs/reports/*`               | Evidence of implementation progress, validation results                                                     | Doctrine, taxonomy, product status definitions                |
| `docs/theoretical-reference/*` | Intellectual foundation, domain theory                                                                      | Implementation status, product claims, route decisions        |
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

`docs/theoretical-reference/*` provides intellectual foundation and domain theory. It does not govern implementation status, product taxonomy, route decisions, or architectural authority. If a theoretical document claims final authority over implementation decisions, that claim is superseded by this file.

### 5.6 Archived Docs Are Historical

`docs/archive/*` is retained for historical reference only. Archived documents must not be cited as current authority for any decision.

### 5.7 No Silent Interpretations

When documents conflict, do not silently choose an interpretation. Document the conflict, apply these rules, and if ambiguity remains, escalate.

---

## 6. Agent Loading Order

AI agents must load documentation in this order:

1. `docs/DOCUMENTATION_AUTHORITY.md` (this file)
2. `docs/official/AQLIYA_MASTER_REFERENCE.md`
3. `AGENTS.md`
4. Relevant `docs/official/*.md` doctrine docs
5. Relevant `docs/source-of-truth/*` support docs
6. Relevant `docs/product/*` or `docs/systems/*` docs
7. Relevant `docs/reports/*` for implementation evidence

---

## 7. Website Copy Authority Order

Website copy authority (in order of precedence):

1. `docs/official/aqliya-vision-v1.1.md` — Identity and positioning
2. `docs/official/aqliya-product-taxonomy-v1.1.md` — Product claims
3. `docs/official/aqliya-master-reference.md` — Current reality
4. `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` — Detailed status

Marketing copy must not claim capabilities that are not validated in code.

---

## 8. Product/Status Authority Order

When determining product implementation status:

1. Inspect code (routes, actions, schema, tests, seed data).
2. Inspect validation reports in `docs/reports/*`.
3. Consult `docs/official/AQLIYA_MASTER_REFERENCE.md` for current status summary.
4. Consult `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` for detailed matrix.
5. Consult `docs/official/aqliya-product-taxonomy-v1.1.md` for taxonomy classification.

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

## 13. Amendment

This file may only be amended by:

1. Documented decision.
2. Updated version with changelog entry.
3. Preservation of the core hierarchy and conflict rules.

Do not bypass this file by creating new "highest authority" documents.
