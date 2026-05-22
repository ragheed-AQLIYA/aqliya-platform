# AQLIYA Systems Documentation Audit

**Date:** 2026-05-16
**Task:** Systems documentation maturity audit — DecisionOS normalization and product gap analysis.

---

## 1. Executive Summary

| Metric | Count |
|--------|-------|
| System folders reviewed | 6 (AuditOS, DecisionOS, LocalContentOS, SalesOS, SimulationOS, GovernanceOS) |
| System files reviewed | 26 |
| Well-documented systems | DecisionOS (15 files), AuditOS (1 operator manual + README) |
| Under-documented systems | LocalContentOS, SalesOS, SimulationOS, GovernanceOS |
| Intentionally minimal (future/planning) | 3 of 4 under-documented systems |
| High-risk conflicts found | 0 critical, 1 medium (GovernanceOS definition pack aspirational language) |
| Recommended approach | Normalize DecisionOS index; improve AuditOS system docs; leave future systems minimal |

### Key Findings

1. **DecisionOS is the most documented system** (15 files) because it is an active adjacent system with real workspace at `/decisions`. Its documentation depth matches its maturity.
2. **LocalContentOS, SalesOS, SimulationOS are intentionally under-documented** per their official status (planning/prototype/concept). Creating production-level docs would overstate readiness.
3. **GovernanceOS has no `docs/systems/governanceos/` folder** — its documentation exists only in `docs/product/governanceos-product-definition-pack.md` which uses aspirational language (e.g., "real-time compliance"). This is the highest-risk gap.
4. **No `docs/systems/governance-layer/` folder exists** — the v1.1 taxonomy uses "governance layer" not "GovernanceOS" as a product.
5. **AuditOS operator manual** (797 lines) is comprehensive but sits at `docs/systems/` root instead of inside `docs/systems/auditos/`.
6. **DecisionOS README** is brief (23 lines) for 15 files — needs a proper index.

---

## 2. Current Systems Map

| System | Official Status | Current Folder | Files Count | Documentation Maturity | Recommendation |
|--------|---------------|----------------|:-----------:|----------------------|----------------|
| AuditOS | First proof product — pilot-ready | `docs/systems/auditos/` + `AUDITOS_OPERATOR_MANUAL.md` at root | 2 (1 operator manual + 1 README) | Strong | Normalize operator manual into `auditos/` folder later |
| DecisionOS | Adjacent active system | `docs/systems/decisionos/` | 15 | Full | Add proper README index; keep files as-is |
| LocalContentOS | Strategic second product — in planning | `docs/systems/local-content-os/` | 1 (README only) | Minimal — intentional | Keep minimal; add planning docs only if approved |
| SalesOS | Prototype / future | `docs/systems/salesos/` | 1 (README only) | Minimal — intentional | Keep minimal; add prototype-scope only if approved |
| SimulationOS | Concept / future | `docs/systems/simulationos/` | 1 (README only) | Minimal — intentional | Keep minimal; add concept-scope only if approved |
| GovernanceOS | Shared governance layer (NOT a standalone product per v1.1 taxonomy) | **Missing folder** | 0 | Missing — needs clarification | Create `docs/systems/governance-layer/README.md` (not GovernanceOS) to avoid product confusion |
| Custom Systems / Studio | Activated per institutional scope | No folder | 0 | Missing | Create `docs/systems/custom-systems/README.md` later if needed |

---

## 3. DecisionOS Documentation Audit

| File | Purpose | Status | Recommendation |
|------|---------|--------|---------------|
| `README.md` | System overview (23 lines) | Needs improvement | Expand as proper table of contents |
| `decisionos-core-engine.md` (197 lines) | Core engine architecture | Aligned | Keep — core reference |
| `decisionos-architecture-report.md` (239 lines) | Architecture report | Aligned | Keep — architecture reference |
| `decisionos-approval-snapshot.md` | Approval layer design | Aligned | Keep |
| `decisionos-data-driven-scoring.md` (243 lines) | Scoring engine | Aligned | Keep |
| `decisionos-generic-recommendation-engine.md` | Recommendation engine | Aligned | Keep |
| `decisionos-generic-simulation-engine.md` | Simulation engine | Aligned | Keep |
| `decisionos-inputs-ux.md` (175 lines) | Input UX | Aligned | Keep |
| `decisionos-publishing-policy.md` | Publishing rules | Aligned | Keep |
| `decisionos-review-approval-layer.md` | Review/approval | Aligned | Keep |
| `decisionos-scenario-architecture.md` | Scenario engine | Aligned | Keep |
| `decisionos-templates.md` (200 lines) | Decision templates | Aligned | Keep |
| `decisionos-timeline-export.md` | Timeline/export | Aligned | Keep |
| `decision-creation-stabilization-report.md` (138 lines) | Implementation report | Historical | Keep as reference; mark as historical |
| `decision-engine-abstraction-report.md` (124 lines) | Implementation report | Historical | Keep as reference; mark as historical |

**Assessment:**

- **v1.1 alignment:** The DecisionOS docs describe a real, working system at `/decisions`. They correctly avoid claiming it is the primary product.
- **No outdated naming:** Uses "DecisionOS" consistently, not old names.
- **No duplication of official docs:** These are system implementation docs, not positioning docs.
- **No overstatement:** The docs describe an active tender decision system accurately.
- **Improvement needed:** `README.md` should be expanded to serve as a proper index for the 15 files, and the two stabilization reports should be clearly marked as historical implementation records.

---

## 4. AuditOS Systems Documentation Audit

| File / Directory | Purpose | Status | Recommendation |
|-----------------|---------|--------|---------------|
| `docs/systems/AUDITOS_OPERATOR_MANUAL.md` (797 lines) | Full bilingual operator manual | Active — comprehensive | Keep; later move into `docs/systems/auditos/operator-manual.md` |
| `docs/systems/auditos/README.md` (27 lines) | System overview with status, exists/not-exists, forbidden claims | Active — well-structured | Keep; improve to link to operator manual |

**Assessment:**

- **Discoverability:** The operator manual is at `docs/systems/` root, not inside `auditos/` folder. This is inconsistent with other systems.
- **Separation from commercial:** The operator manual is purely operational (Prisma, seed, deployment). Good separation.
- **Pilot-ready alignment:** The README correctly states "Controlled Pilot" status and includes explicit "Forbidden Claims."
- **Outdated phase docs:** Phase 1/2 completion docs in `docs/product/` are separate and already marked as historical candidates in the consolidation plan.

---

## 5. LocalContentOS Documentation Gap

**Status:** Strategic second product — in planning. Marketing-only per `docs/systems/local-content-os/README.md`.

**Current docs:** README only (26 lines with status, exists, not-exists, forbidden claims).

**Assessment:**
- The current README is well-written: it correctly states "Marketing-only" and forbids claims of functional readiness.
- Creating full production docs would contradict the planning-stage status.
- No action needed now. If planning progresses, a minimal set could include:
  - `product-scope.md` — What LocalContentOS would do
  - `governance-boundaries.md` — What it would NOT do
  - `roadmap-notes.md` — Planning progress

**Risk:** Low — current docs match official status.

---

## 6. SalesOS Documentation Gap

**Status:** Prototype / future. Dashboard exists but is not operational for customers per `docs/systems/salesos/README.md`.

**Current docs:** README only (26 lines with status, exists, not-exists, forbidden claims).

**Assessment:**
- The README correctly forbids customer demos and production claims.
- The `/sales` route EXISTS but is prototype-only. This is documented clearly.
- No action needed now. If development advances, a minimal set could include:
  - `prototype-scope.md` — What SalesOS currently does
  - `non-goals.md` — What SalesOS explicitly does not do

**Risk:** Low — current docs match official status.

---

## 7. SimulationOS Documentation Gap

**Status:** Concept / future. Marketing-only per `docs/systems/simulationos/README.md`.

**Current docs:** README only (26 lines with status, exists, not-exists, forbidden claims).

**Assessment:**
- README correctly states marketing-only status.
- No workspace, no code, no demo. This is the correct level of documentation.
- No action needed now.

**Risk:** Low — current docs match official status.

---

## 8. GovernanceOS / Governance Layer Question

**Official status per v1.1 taxonomy (`docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md`):**
- The taxonomy uses **"Governance layer"** — not "GovernanceOS" — as a cross-cutting control shared by all workspaces.
- It is **not listed as a standalone product** in the product taxonomy.
- It is described as shared infrastructure: audit trail, validation, publication.

**Current documentation state:**
- No `docs/systems/governanceos/` folder exists.
- A product definition pack exists at `docs/product/governanceos-product-definition-pack.md` (298 lines) — this is the only dedicated doc.
- The product definition pack uses aspirational language: "real-time compliance status" (lines 90, 103, 219, 237) which could overstate current capabilities.

**Assessment:**
- Creating `docs/systems/governanceos/` as a product folder would contradict the v1.1 taxonomy, which explicitly names it a "governance layer" not a product.
- The product definition pack at `docs/product/governanceos-product-definition-pack.md` should be reviewed for aspirational language.
- **Recommended action:** Create `docs/systems/governance-layer/README.md` that:
  - References the v1.1 taxonomy definition
  - Links to cross-cutting governance mechanisms (audit trail, approval, evidence)
  - Notes that GovernanceOS as a standalone product name is aspirational and currently inaccurate
- **Do NOT create** `docs/systems/governanceos/` as a product folder.

---

## 9. Custom Systems / Studio Documentation Gap

**Official status per v1.1 taxonomy:**
- "AQLIYA Studio" is defined as "the custom systems builder layer" — not a standalone product.
- Custom systems are "activated per institutional scope."

**Current documentation:**
- No dedicated folder in `docs/systems/`.
- References exist in `docs/product/` for specific custom product implementations.
- The website content references Studio as a concept.

**Assessment:**
- Creating a full Studio documentation set would overstate availability.
- A minimal `docs/systems/custom-systems/README.md` could be useful later, stating:
  - Custom systems are built per institutional scope on the AQLIYA platform.
  - Studio is a builder concept, not a packaged product.

**Recommended action:** No folder creation now. Add `docs/systems/custom-systems/README.md` only if there is an active custom system engagement requiring documentation.

---

## 10. Conflict Search

| File | Term / Claim | Context | Severity | Recommendation |
|------|-------------|---------|----------|---------------|
| `docs/systems/decisionos/decisionos-data-driven-scoring.md:243` | `real-time` | "Show real-time score impact" — technical UX goal | Low | Acceptable — technical description of scoring UX |
| `docs/systems/decisionos/decisionos-inputs-ux.md:175` | `real-time` | "No real-time score updates" — stating current limitation | Low | Acceptable — documenting current limitation |
| `docs/systems/AUDITOS_OPERATOR_MANUAL.md:68,73,119,779` | `Studio` (Prisma Studio) | Operational tool reference | Low | Acceptable — Prisma Studio is a database GUI tool, not AQLIYA Studio |
| `docs/product/governanceos-product-definition-pack.md` | `real-time` (4 occurrences) | "real-time system state", "real-time dashboard", "continuous compliance" | **Medium** | Aspirational language in a product definition pack could overstate current GovernanceOS capabilities. Recommend adding "future/aspirational" disclaimer. |
| `docs/product/decisionos-product-definition-pack.md:248` | `real-time` | "Collaborative real-time editing" — listed as Phase 2 | Low | Properly scoped as Phase 2 |
| `docs/product/simulationos-product-definition-pack.md:231` | `real-time` | "Collaborative real-time simulation" — listed as Phase 2 | Low | Properly scoped as Phase 2 |
| `docs/product/auditos-pilot-demo-flow-v1.md` | `real-time` / `No real-time` | Technical implementation note | Low | Historical spec; not actionable |

**No critical or high-severity conflicts found.** The only medium-severity finding is the GovernanceOS product definition pack's aspirational language.

---

## 11. Recommended Target Structure

### Proposed future state (do not implement)

```
docs/systems/
  README.md                              ← maturity-aware navigation (improve existing)
  auditos/
    README.md                            ← improve (link to operator manual)
    operator-manual.md                   ← move from docs/systems/ root
    workflow.md                          ← (future, if needed)
    governance-boundaries.md             ← (future, if needed)
  decisionos/
    README.md                            ← improve as proper index/ToC
    decisionos-core-engine.md            ← keep
    decisionos-architecture-report.md    ← keep
    decisionos-approval-snapshot.md      ← keep
    decisionos-data-driven-scoring.md    ← keep
    decisionos-generic-recommendation-engine.md  ← keep
    decisionos-generic-simulation-engine.md      ← keep
    decisionos-inputs-ux.md             ← keep
    decisionos-publishing-policy.md     ← keep
    decisionos-review-approval-layer.md ← keep
    decisionos-scenario-architecture.md ← keep
    decisionos-templates.md             ← keep
    decisionos-timeline-export.md       ← keep
    decision-creation-stabilization-report.md   ← keep, mark as historical
    decision-engine-abstraction-report.md       ← keep, mark as historical
  local-content-os/
    README.md                            ← keep as-is
    (planning docs only if approved)
  salesos/
    README.md                            ← keep as-is
    (prototype docs only if approved)
  simulationos/
    README.md                            ← keep as-is
    (concept docs only if approved)
  governance-layer/
    README.md                            ← (create — new, with careful naming)
    shared-governance.md                 ← (future, if needed)
  custom-systems/
    README.md                            ← (future, only when needed)
```

### Proposed additions (links only, no moves)

| Proposed Path | Reason | Priority | Risk | Create Now? |
|--------------|--------|----------|------|-------------|
| `docs/systems/governance-layer/README.md` | Clarify governance is a layer, not a standalone product; link to v1.1 taxonomy | High | Low — adds clarity without overstating | **Yes — recommended as next task** |
| `docs/systems/decisionos/README.md` improvement | Proper index for 15 files | High | None | **Yes — recommended as next task** |
| `docs/systems/README.md` improvement | Reflect actual maturity levels per this audit | Medium | None | **Yes — included in next task** |
| `docs/systems/auditos/README.md` improvement | Link to operator manual location | Low | None | Yes — simple link update |
| `docs/systems/custom-systems/README.md` | Only when active engagement | Low | None | No — wait for need |
| Move operator manual into auditos/ folder | Consistency | Low | Low — check internal links | No — Phase B later |

---

## 12. Recommended Cleanup Phases

### Phase A — Systems README + index improvement (IMMEDIATE NEXT TASK)

- Update `docs/systems/README.md` to reflect actual maturity per this audit
- Improve `docs/systems/decisionos/README.md` as a proper table of contents for 15 files
- Add `docs/systems/governance-layer/README.md`to clarify governance is a shared layer, not a product
- Update `docs/systems/auditos/README.md` to link to operator manual

### Phase B — AuditOS operator manual normalization

- Move `docs/systems/AUDITOS_OPERATOR_MANUAL.md` into `docs/systems/auditos/operator-manual.md`
- Only after Phase A is committed and link-checked

### Phase C — Minimal planning/prototype docs (if approved)

- LocalContentOS: product-scope.md, governance-boundaries.md
- SalesOS: prototype-scope.md, non-goals.md
- SimulationOS: concept-scope.md, non-goals.md

### Phase D — Governance layer reference docs (if needed)

- shared-governance.md — cross-cutting governance mechanisms

### Phase E — Custom systems documentation (if needed)

- README.md — activation model for institutional custom systems

---

## 13. Immediate Next Recommended Task

**`AQLIYA Systems README Improvement — Add Maturity Map and DecisionOS Index Links`**

This task should:
1. Update `docs/systems/README.md` with maturity-aware navigation
2. Improve `docs/systems/decisionos/README.md` as a proper file index
3. Create `docs/systems/governance-layer/README.md` with careful naming
4. Update `docs/systems/auditos/README.md` to link to operator manual
