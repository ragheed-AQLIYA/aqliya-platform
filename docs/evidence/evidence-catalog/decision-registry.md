# Decision Registry

> **Part of:** Sprint v2 — Pre-P7: Decision Governance  
> **Date:** 2026-06-29  
> **Status:** Active — governs all governance decisions from Sprint v3 onward  
> **Governing Model:** M2 Knowledge Data Model v1.2 (§2.6 Decision Structure)

---

## 1. Purpose

The Decision Registry operationalizes the **Decision** entity from the M2 Knowledge Data Model. It provides the structure, lifecycle, and rules for all governance decisions. Without this registry, decisions are informal text — with it, decisions become **verifiable governance objects** with identity, authority, and traceability.

---

## 2. Decision Identity

### Pattern

`DEC-{YYYY}-{NNNN}`

- `YYYY` = Year of decision
- `NNNN` = Sequential number (reset yearly)
- **Immutable** — per Immutable IDs Rule (M2 §4)

### Examples

| DEC-ID | Description |
|--------|-------------|
| DEC-2026-0001 | Sprint v1: Wave 3B Frozen |
| DEC-2026-0002 | M1 Governance Acceptance |
| DEC-2026-0003 | M2 Model v1.2 Freeze |
| DEC-2026-0004 | Phase A Complete |
| DEC-2026-0005 | Phase B Authorized |

---

## 3. Decision Types

| Type | Code | Description | Authority Required | Example |
|------|------|-------------|-------------------|---------|
| **Maturity Assignment** | MAT | Assign L0–L6 to a product | Governance Review (Sprint v3) | "SalesOS → L4" |
| **Strategic Intent** | STR | Set Approved/Deferred/Frozen/Experimental | Project Owner | "Institutional Memory → Deferred" |
| **Commercial Claim** | COM | Permit or deny commercial claim | Project Owner + Commercial | "RiskOS → Not Claimable" |
| **Freeze/Unfreeze** | FRZ | Freeze or unfreeze a product's L-level | Governance Team | "Wave 3B Frozen" |
| **Model Change** | MOD | Change entity, relationship, or ID pattern | ADR + Governance Board | "Add new entity: Graph" |
| **Evidence Acceptance** | EVI | Accept or reject evidence for a claim | Governance Reviewer | "EV-0032 accepted for CLM-DECISION-0004" |
| **Grace** | GRC | Override or exception to governance rules | Project Owner | "Extend freshness window for Wave 3" |

---

## 4. Decision Lifecycle

```text
Draft ──→ Under Review ──→ Approved ──→ Active ──→ Superseded
                            │                         ↑
                            └── Rejected               │
                                    └──→ Archived ─────┘
```

| State | Description |
|-------|-------------|
| **Draft** | Decision identified, not yet reviewed |
| **Under Review** | Being evaluated by Governance Reviewer |
| **Approved** | Accepted by Decision Authority |
| **Rejected** | Denied by Decision Authority |
| **Active** | Approved + currently in effect |
| **Superseded** | Replaced by a newer decision (DEC-YYYY-NNNN+1) |
| **Archived** | Historical only, no longer referenced |

---

## 5. Decision Template

Every decision in the registry follows this structure:

```text
DEC-{YYYY}-{NNNN}
─────────────────
  Type:           MAT | STR | COM | FRZ | MOD | EVI | GRC
  Version:        1.0 (incremented on amendment before supersession)

  Title:          [Short description]
  Authority:      [Reviewer name / Governance Board / Project Owner]
  Decision Date:  YYYY-MM-DD
  Effective Date: YYYY-MM-DD
  Review Date:    YYYY-MM-DD (default +180 days)

  Affected Claims:  [CLM-XXX-NNNN, ...]
  Evidence Reviewed: [EV-NNNN, ...]
  Manifest Ref:   [MANIFEST-Product]
  Dossier Ref:    [DOSSIER-Product]

  Decision:
    - Accepted:   [list of accepted claims/proposals]
    - Rejected:   [list of rejected claims/proposals]
    - Conditions: [any conditions attached to this decision]

  Rationale:      [Why this decision was made]
  Governing Rule: [Which governance rule authorizes this decision]

  Supersedes:     [DEC-YYYY-NNNN — optional]
  Superseded By:  [DEC-YYYY-NNNN — optional, set on replacement]
  Status:         Draft | Under Review | Approved | Rejected | Active | Superseded | Archived
```

---

## 6. Existing Decisions (Pre-Populated)

These decisions were made during Sprint v1 and M1/M2. They are now formalized in this registry.

| DEC-ID | Type | Title | Authority | Date | Affected | Status |
|--------|------|-------|-----------|------|----------|--------|
| DEC-2026-0001 | FRZ | Wave 3B Frozen — all maturity-level changes deferred to Governance Review | Project Owner | 2026-06-29 | All 10 disputed products (SalesOS, IM, RiskOS, LocalContactOS, ContentStudio, DecisionOS, Office AI, WorkflowOS, LocalContentOS, Local AI Runtime) | **Active** |
| DEC-2026-0002 | GRC | M1 Governance Acceptance — all 10 Sprint v1 items accepted | Project Owner | 2026-06-29 | Sprint v1 outputs, Wave 3A, governance rules | **Active** |
| DEC-2026-0003 | MOD | M2 Knowledge Data Model v1.2 Frozen — entities, relationships, IDs, governance rules | Project Owner | 2026-06-29 | M2 charter, CLAIM_REGISTRY.md, AUTHORITY_MATRIX.md, DOCUMENTATION_AUTHORITY.md | **Active** |
| DEC-2026-0004 | FRZ | Phase A (Architecture Freeze) Complete — 5 gates passed | Project Owner | 2026-06-29 | M2 model entities, relationships, identifiers, governance rules | **Active** |
| DEC-2026-0005 | STR | Phase B (Population Bootstrap) Authorized — AuditOS seed | Project Owner | 2026-06-29 | AuditOS claims, evidence, manifest, dossier | **Superseded** (by DEC-2026-0006) |
| DEC-2026-0006 | STR | Sprint v2 Wave 1 Authorized — full P1→P7 execution | Project Owner | 2026-06-29 | All Wave 1 products (AuditOS, DecisionOS, LocalContentOS) | **Active** |

---

## 7. Decision Preconditions Rule

> **Adopted per Sprint v3 Charter (2026-06-29).** Binding for all **MAT** (Maturity Assignment) decisions.

| # | Precondition | Verification |
|---|-------------|--------------|
| 1 | Manifest exists | MANIFEST-Product.md present |
| 2 | Dossier exists | DOSSIER-Product.md present |
| 3 | Provenance Gate = PASS | provenance-gate-report.md: all chains complete |
| 4 | Integrity = 100% | Manifest Integrity Score = 100% |
| 5 | Independent Review complete | V3-1 completed for this product |
| 6 | No high-severity open findings | No open FND with severity > Medium |

**Exceptions:** STR (Strategic Intent) exempt from 1–4. FRZ (Freeze) requires only precondition 5. GRC (Grace) may override any precondition with Project Owner approval.

---

## 8. Supersession Rules

Per Immutable IDs Rule (M2 §4):

| Scenario | Action |
|----------|--------|
| Decision outcome changes | New DEC-ID, old set to Superseded |
| Decision conditions change | New DEC-ID, old set to Superseded |
| Decision review date extended | Amendment only (same DEC-ID, version bump) |
| Decision reaffirmed unchanged | Amendment only (same DEC-ID, version bump, new review date) |

---

## 8. Link to Other Entities

```text
Decision Registry
    │
    ├── DEC-2026-NNNN ──governs──► Claims (CLM-XXX-NNNN)
    ├── DEC-2026-NNNN ──reviews──► Evidence (EV-NNNN)
    ├── DEC-2026-NNNN ──references──► Manifest (MANIFEST-Product)
    ├── DEC-2026-NNNN ──extends──► Dossier (DOSSIER-Product)
    ├── DEC-2026-NNNN ──supersedes──► DEC-YYYY-NNNN (chain)
    └── DEC-2026-NNNN ──produced_by──► Review (REV-2026-NNNN)
```

---

## 9. Decision Registry Index

| DEC-ID | Type | Product | Status | Date | Review Date |
|--------|------|---------|--------|------|-------------|
| DEC-2026-0001 | FRZ | All 10 disputed | Active | 2026-06-29 | 2026-12-26 |
| DEC-2026-0002 | GRC | All | Active | 2026-06-29 | 2026-12-26 |
| DEC-2026-0003 | MOD | All | Active | 2026-06-29 | 2026-12-26 |
| DEC-2026-0004 | FRZ | All | Active | 2026-06-29 | 2026-12-26 |
| DEC-2026-0005 | STR | AuditOS | Superseded | 2026-06-29 | 2026-09-27 |
| DEC-2026-0006 | STR | AuditOS, DecisionOS, LocalContentOS | Active | 2026-06-29 | 2026-09-27 |

### New Decisions (Sprint v3 — V3-3)

| DEC-ID | Type | Product | Decision | Authority | Date | Status |
|--------|------|---------|----------|-----------|------|--------|
| DEC-2026-0007 | MAT | AuditOS | **L5 Confirmed** — no change. Reference product. | Project Owner | 2026-06-29 | **Active** |
| DEC-2026-0008 | MAT | DecisionOS | **L5 Pilot-ready** — not automatic Commercial GA. Commercial release is a separate decision. | Project Owner | 2026-06-29 | **Active** |
| DEC-2026-0009 | MAT | LocalContentOS | **L5 Governance Approved** — with Continuous Improvement Items (T2/T3/T5 enhancement, domain expert review) — NOT conditional approval. | Project Owner | 2026-06-29 | **Active** |
| DEC-2026-0010 | STR | Wave 1 | Strategic Intent: AuditOS→Approved, DecisionOS→Approved (unfrozen), LocalContentOS→Approved (unfrozen) | Project Owner | 2026-06-29 | **Active** |
| DEC-2026-0011 | FRZ | Wave 3B | **Wave 3B Authorized** — limited scope: PRODUCT_STATUS_MATRIX, MASTER_REFERENCE, ROUTE_STRATEGY, documentation alignment. M2 model, cardinalities, governance rules, identifiers are NOT modifiable. | Project Owner | 2026-06-29 | **Active** |

### Intelligence Core Decisions (Sprint v3 — Pattern Review)

| DEC-ID | Type | Product | Decision | Authority | Date | Status |
|--------|------|---------|----------|-----------|------|--------|
| DEC-2026-0012 | MAT | Intelligence Core | **L3–L4 Confirmed** — undisputed. Accept as is. | Independent Review → Project Owner | 2026-06-29 | **Active** |
| DEC-2026-0013 | MOD | GR-009 | **Production Pattern Approved** — Capability Evidence Canonicalization adopted as standard for all Engine-type products. Reuse projections require empirical validation after 2 consumer products. | Independent Review → Project Owner | 2026-06-29 | **Active** |
| DEC-2026-0014 | FRZ | Capability Model | **Pattern Freeze** — no changes to GR-009 without ADR or Governance Decision. G12 Pattern Freeze Certificate issued. | Independent Review → Project Owner | 2026-06-29 | **Active** |
| DEC-2026-0015 | STR | WorkflowOS | **WorkflowOS Authorized** — Wave 2 may proceed. WorkflowOS is the first Consumer Product of GR-009 and will serve as Validation Product. | Independent Review → Project Owner | 2026-06-29 | **Active** |
| DEC-2026-0016 | GRC | Pattern Metrics | **Pattern Validation Policy** — reuse ratios (60%, 82%, 63%) are forecasts, not institutional facts. Must be empirically validated after ≥2 consumer products. | Independent Review → Project Owner | 2026-06-29 | **Active** |

### WorkflowOS Decision

| DEC-ID | Type | Product | Decision | Authority | Date | Status |
|--------|------|---------|----------|-----------|------|--------|
| DEC-2026-0017 | GRC | GR-009 | **GR-009 Performance Validation** — WorkflowOS as first Consumer Product. Potential Reuse=55%, Actual=55%, Variance=0%, Violations=0, Consumer Override=0. GR-009 is now **Operationally Proven Pattern**. Future reuse forecasts must be compared against actuals after each consumer product. | Independent Review → Project Owner | 2026-06-29 | **Active** |

### ADR Decisions

| DEC-ID | Type | Product | Decision | Authority | Date | Status |
|--------|------|---------|----------|-----------|------|--------|
| DEC-2026-0018 | MOD | All | **ADR-001 (Version vs Immutable IDs)** — Operational policy adopted. Metadata-only changes use version increment; substantive changes (score, dimension, confidence, outcome) require new ID + SupersededBy. Bidirectional Supersedes/SupersededBy enforcement required. | Project Owner | 2026-06-30 | **Active** |
| DEC-2026-0019 | MOD | PROD-LOCAL-AI | **ADR-002 (Local AI Runtime)** — Runtime is Entity Classification, not Model Extension. KA-25 (AI Runtime) created. AUTH-LOCAL-AI created. PROD-LOCAL-AI assigned KA-25 and AUTH-LOCAL-AI. No M2 entity changes required. | Project Owner | 2026-06-30 | **Active** |

### SPEC-GOV-11 Engineering Decisions

| DEC-ID | Type | Product | Decision | Authority | Date | Status |
|--------|------|---------|----------|-----------|------|--------|
| DEC-2026-0020 | FRZ | M2 v1.2 | **M2 Baseline Freeze** — 12 entities, 21 relationships (C01–C21), 11 ID patterns, 13 governance rules (GR-001–GR-013) frozen. No entity, relationship, identifier, or governance rule changes without ADR. | Project Owner (ENG approved) | 2026-06-29 | **Active** |
| DEC-2026-0021 | STR | SPEC-GOV-11 ENG-001A | **Registry Extractor Approved** — Markdown → JSON extraction pipeline. M2-aligned types. No re-parsing of Markdown for validation. | Project Owner (ENG approved) | 2026-06-29 | **Active** |
| DEC-2026-0022 | STR | SPEC-GOV-11 ENG-001B | **Relationship Validator Approved** — 6-layer validation (Reference, Cardinality, Chain, Authority, Aggregator, Reporter). Error taxonomy with 10 codes. Pure functions, no I/O. | Project Owner (ENG approved) | 2026-06-30 | **Active** |
| DEC-2026-0023 | STR | SPEC-GOV-11 Pipeline | **Single Pipeline Authority** — Markdown→Extractor→JSON→Validator→Statistics→Readiness→Suitability→Decision. No validators re-parse Markdown. No parallel pipelines. | Project Owner (ENG approved) | 2026-06-30 | **Active** |
| DEC-2026-0024 | GRC | SPEC-GOV-11 Validator | **Validator Purity Rule (RV-01)** — Validators read only ExtractedRegistries JSON. No file I/O, no CLI, no cache, no mutation. Enforced via Jest module isolation. | Project Owner (ENG approved) | 2026-06-30 | **Active** |
| DEC-2026-0025 | MOD | SPEC-GOV-11 Error Model | **Error Taxonomy Adopted** — 10 stable codes: REF-001/002, CAR-001/002, CHN-001/002, AUTH-001/002, INT-001. String-based, not enum, for version stability. | Project Owner (ENG approved) | 2026-06-30 | **Active** |
| DEC-2026-0026 | STR | SPEC-GOV-11 Reporter | **Reporter Layer Approved** — JSON/Markdown/CLI formatters. No I/O responsibility. Pure formatting only. | Project Owner (ENG approved) | 2026-06-30 | **Active** |
| DEC-2026-0027 | GRC | SPEC-GOV-11 Statistics | **Statistics Neutrality Rule** — Graph Statistics reports measurements only. MUST NOT score, rank, classify, recommend, interpret, or decide. All metric names must be purely quantitative. | Project Owner (ENG approved) | 2026-06-30 | **Active** |
| DEC-2026-0028 | MAT | SPEC-GOV-11 ENG-001C | **ENG-001C Approved and Closed** — Graph Statistics complete. Statistics Neutrality verified. 35/35 tests passing. Build validated. No architectural violations (Single Pipeline, M2 Freeze, Zero Schema Change, Pure Functions, Statistics Neutrality all preserved). | Project Owner (ENG approved) | 2026-06-30 | **Active** |
| DEC-2026-0029 | GRC | SPEC-GOV-11 ENG-001D | **Readiness Explainability Rule** — Every point in the Readiness Score must be attributable to measurable contributors. Explanation MUST include dimension breakdown (score, weight, weighted contribution) and source references. Enforced via `buildExplanation` + 38 tests. | Project Owner (ENG approved) | 2026-06-30 | **Active** |
| DEC-2026-0030 | STR | SPEC-GOV-11 Pipeline | **Pipeline Orchestration Separation** — Pipeline orchestration SHALL be implemented as a dedicated orchestration layer (`graph-readiness-pipeline.ts`). Individual engines MUST NOT orchestrate other engines directly. This preserves engine isolation and prevents any engine from becoming a God Object. | Project Owner (ENG approved) | 2026-06-30 | **Active** |
| DEC-2026-0031 | GRC | SPEC-GOV-11 ENG-001E | **Suitability Neutrality** — Suitability SHALL evaluate architectural characteristics only. It SHALL NOT recommend specific technologies, vendors, or products. Technology recommendations are the responsibility of ENG-001F (Decision Framework) and subsequent ADR. | Project Owner (ENG approved) | 2026-06-30 | **Active** |
| DEC-2026-0032 | GRC | SPEC-GOV-11 Pipeline | **Pipeline Provenance** — Every pipeline stage MUST record: Input Version, Output Version, Execution Time, Engine Version, and Evidence IDs. This ensures any report is fully reproducible. | Project Owner (ENG approved) | 2026-06-30 | **Active** |
| DEC-2026-0033 | GRC | SPEC-GOV-11 Pipeline | **Pipeline Stage Contract** — Every pipeline stage SHALL return the same canonical contract (`PipelineStageResult<T>`). No stage-specific wrapper objects. This ensures all engines (present and future) follow an identical pattern. | Project Owner (ENG approved) | 2026-06-30 | **Active** |

### Readiness Rules (RR-01 to RR-04) — Established for ENG-001D

These rules govern the **Readiness Score** layer. They are binding for all ENG-001D implementation:

| Rule | Title | Description | Authority | Status |
|------|-------|-------------|-----------|--------|
| RR-01 | Readiness is Evidence-Based | Readiness reads only `ValidationSummary` + `GraphStatistics`. Does NOT read Markdown, raw JSON, registry, or graph directly. | Project Owner (ENG approved) | **Active** |
| RR-02 | No Metric Recalculation | Prohibits recalculation of density, degree, cycles, components, longest chain. These are consumed as produced by ENG-001C. | Project Owner (ENG approved) | **Active** |
| RR-03 | Deterministic Scoring | Same `ValidationSummary` + `GraphStatistics` inputs MUST always produce the same `ReadinessScore`. No randomness, no time-dependence. | Project Owner (ENG approved) | **Active** |
| RR-04 | Explainability | Every point in the Readiness Score must be explainable. Output includes contributor breakdown (e.g., Integrity +30, Completeness +25, Connectivity +18, Traceability +13). | Project Owner (ENG approved) | **Active** |

### Prohibited Behavior (ENG-001D)

ENG-001D (Readiness Score) MUST NOT:

- ❌ Suggest Neo4j
- ❌ Suggest PostgreSQL
- ❌ Issue Recommendation
- ❌ Issue Decision
- ❌ Evaluate Suitability

These belong to ENG-001E (Suitability Score) and ENG-001F (Decision Framework).

## ENG-001 End State

ENG-001 is considered complete only when a single invocation produces a full **Assessment Report**:

```text
governance assess

        │
        ▼

Extractor
        │
Validator
        │
Statistics
        │
Readiness
        │
Suitability
        │
Decision Framework

        │
        ▼

Assessment Report
```

Each engine retains its independence. The Pipeline orchestrates only. No engine calls another engine.

**Total: 33 decisions + 4 Readiness Rules | 33 Active | 1 Superseded**
