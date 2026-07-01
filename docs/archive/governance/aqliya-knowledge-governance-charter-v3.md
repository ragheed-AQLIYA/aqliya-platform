# AQLIYA Knowledge Governance Sprint v3 — Governance Sprint

> **Status:** Draft — pending Project Owner confirmation  
> **Version:** 1.0 | **Date:** 2026-06-29 | **Owner:** Governance Team  
> **Prerequisite:** Sprint v2 Wave 1 complete (P1–P7 + Decision Registry)  
> **Gate to:** Wave 3B (Maturity Alignment) + Documentation Freeze v2

---

## 1. Why Sprint v3?

Sprint v1 built governance infrastructure. Sprint M2 defined the data model. Sprint v2 populated it with evidence. **Sprint v3 makes decisions.**

Without Sprint v3:
- All 14 Wave 1 claims have evidence but no governance decisions
- 10 disputed L-levels remain frozen indefinitely
- Wave 3B maturity changes cannot proceed
- Documentation Freeze v2 cannot be declared

Sprint v3 transforms the evidence base into **authoritative governance decisions** — the final step before the Knowledge Governance Gate goes live.

---

## 2. Sprint v3 Objective

> **Produce governance decisions (DEC-YYYY-NNNN) for all Wave 1 products, based on independent review of the evidence package, to enable Wave 3B maturity alignment and Documentation Freeze v2.**

### What Sprint v3 Does NOT Do

- ❌ Create new claims (Sprint v2 already did this)
- ❌ Collect new evidence (Sprint v2 already did this)
- ❌ Generate manifests or dossiers (these are derived artifacts, not produced in Sprint v3)
- ❌ Change document content directly (Wave 3B does this after decisions)
- ❌ Build software or automation (future phase)

---

## 3. Three-Tier Role Separation

Per Governance Review structure (adopted M1):

| Role | Responsible | Scope |
|------|-------------|-------|
| **Evidence Producer** | OpenCode | Provides the complete evidence package (this charter + governance-review-brief.md). **Does NOT make L-level decisions.** |
| **Independent Governance Reviewer** | ChatGPT (or second agent) | Reviews evidence for consistency, completeness, methodology compliance, and contradictions. Produces a **Review Report** with recommendations. **Does NOT make final L-level decisions.** |
| **Final Decision Authority** | Project Owner (human) | Makes binding L-level decisions based on the evidence brief + review report. Issues DEC-IDs. **Has final authority.** |

**Rule:** No single agent may both produce evidence and decide L-levels for the same product.

---

## 4. Sprint v3 Phases

The Sprint executes in 5 sequential sessions:

### V3-1: Independent Evidence Validation

| Input | Activity | Output |
|-------|----------|--------|
| Governance Review Brief (P7) | Independent Reviewer examines all claims, evidence, manifests, dossiers | **Independent Review Report** — findings, gaps, methodology checks, recommendations for each product |

**Pass criteria:** No critical contradictions found. All evidence chains verified independently.

### V3-2: Governance Findings

| Input | Activity | Output |
|-------|----------|--------|
| Governance Review Brief + Review Report | Formalize all findings as FND-REV-2026-NNNN entries in the registry | **Governance Findings Log** — signed FND-IDs linked to specific claims |

### V3-3: Governance Decisions

| Input | Activity | Output |
|-------|----------|--------|
| Findings + Dossiers + Review Report | Decision Authority issues DEC-IDs for each product | **DEC-2026-NNNN entries** in Decision Registry — one per product decision |

**Decision Preconditions (binding rule):** No MAT decision may be issued unless:
- ✅ Manifest exists
- ✅ Dossier exists
- ✅ Provenance Gate = PASS
- ✅ Integrity = 100%
- ✅ Independent Review complete
- ✅ No high-severity open findings

### V3-4: Wave 3B Authorization

| Input | Activity | Output |
|-------|----------|--------|
| DEC-IDs from V3-3 | Identify which frozen maturity changes are authorized. Update WAVE3_CHANGE_PLAN.md. | **Wave 3B Execution Authorization** — list of approved changes per product |

### V3-5: Documentation Freeze v2

| Input | Activity | Output |
|-------|----------|--------|
| All previous phase outputs | Declare Documentation Freeze v2. All governance artifacts become version-frozen. | **Freeze v2 Certificate** — new baseline for all future work |

---

## 5. Decision Preconditions Rule

> **Adopted as binding governance rule, effective Sprint v3.**

### The Rule

No **Maturity Assignment (MAT)** decision may be issued unless **all** of the following preconditions are met:

| # | Precondition | Verification | Applicable To |
|---|-------------|--------------|---------------|
| 1 | **Manifest exists** | MANIFEST-Product.md present in evidence-catalog/manifests/ | All MAT decisions |
| 2 | **Dossier exists** | DOSSIER-Product.md present in evidence-catalog/dossiers/ | All MAT decisions |
| 3 | **Provenance Gate = PASS** | provenance-gate-report.md shows all chains complete for this product | All MAT decisions |
| 4 | **Integrity = 100%** | Manifest shows 100% across all 6 integrity components | All MAT decisions |
| 5 | **Independent Review complete** | V3-1 completed for this product | All MAT decisions |
| 6 | **No high-severity open findings** | No open FND with severity > Medium for this product | All MAT decisions |

### Evidence Independence Check (Added V3-1)

**Purpose:** Ensure every evidence chain terminates at a **Primary Source** — not at a derived artifact.

| Check | Rule | Violation |
|-------|------|-----------|
| EIC-01 | Every Manifest must reference only Claims (CLM-IDs) and Evidence (EV-IDs) | Manifest referencing another Manifest = prohibited |
| EIC-02 | Every Dossier must reference only its source Manifest + rubric data | Dossier referencing another Dossier = prohibited |
| EIC-03 | Every Evidence (EV) must reference a Source (SRC-ID), not another EV | EV-to-EV reference = prohibited |
| EIC-04 | Every Source (SRC) must reference an existing document or verifiable code/operation | Source with no document/operation anchor = prohibited |
| EIC-05 | No circular dependencies | Claim→Evidence→Source must not loop back to original Claim |

**Rationale:** Derived Artifacts Rule (M2 §5) already prohibits manual editing of Manifests and Dossiers. Evidence Independence Check extends this to ensure the entire chain is acyclic and rooted in primary sources.

### Exceptions

- **STR (Strategic Intent)** decisions do not require preconditions 1–4 (Strategic Intent is executive, not evidence-based)
- **FRZ (Freeze/Unfreeze)** decisions require only precondition 5 (Independent Review)
- **GRC (Grace)** decisions may override any precondition with Project Owner sign-off

---

## 6. Decision Flow (Per Product)

```text
Governance Review Brief
        ↓
V3-1: Independent Review ──→ Review Report
        ↓
V3-2: Findings ──→ FND-REV-2026-NNNN
        ↓
V3-3: Decision Preconditions Check ──→ PASS/FAIL
        ↓
    Decision (DEC-2026-NNNN)
        ↓
    Decision Registry Entry
        ↓
V3-4: Wave 3B Authorization
        ↓
V3-5: Freeze v2 Certificate
```

---

## 7. Sprint v3 Deliverables

| # | Deliverable | Description | Owner |
|---|-------------|-------------|-------|
| V3-D1 | **Independent Review Report** | Review of all Wave 1 evidence by independent reviewer | ChatGPT / second agent |
| V3-D2 | **Governance Findings Log** | All FND-REV-2026-NNNN entries | OpenCode (recording) |
| V3-D3 | **Governance Decisions (DEC)** | DEC-2026-NNNN entries in Decision Registry | Project Owner |
| V3-D4 | **Wave 3B Authorization** | Approved changes for execution | Project Owner |
| V3-D5 | **Freeze v2 Certificate** | Documentation baseline freeze | Governance Team |

---

## 8. Sprint v3 Exit Criteria

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | All Wave 1 products have Independent Review | V3-D1 exists |
| 2 | All findings documented as FND-IDs | V3-D2 exists |
| 3 | All Wave 1 products have DEC-IDs in Decision Registry | V3-D3 complete |
| 4 | Wave 3B authorized with specific changes per product | V3-D4 exists |
| 5 | Freeze v2 declared | V3-D5 exists |
| 6 | Knowledge Governance Gate design ready for CI | Gate spec updated |

---

## 9. Post-Sprint v3

```text
Sprint v3 ──→ Wave 3B ──→ Documentation Freeze v2 ──→ Knowledge Governance Gate (CI)
                   │                                         │
                   │ Apply maturity changes                   │ Enforce rules
                   │ Update docs per decisions                │ Block violations
                   │                                          │
                   └──→ Sprint v2 Waves 2+3 continue ────────┘
                         (WorkflowOS, Office AI, SalesOS, ...)
```

---

## References

- Sprint v2 Charter: `docs/governance/aqliya-knowledge-governance-charter-v2.md`
- Governance Review Brief: `evidence-catalog/governance-review-brief.md`
- Decision Registry: `evidence-catalog/decision-registry.md`
- Three-tier Review Model: `docs/governance/MILESTONE_M1.md` (D7)
