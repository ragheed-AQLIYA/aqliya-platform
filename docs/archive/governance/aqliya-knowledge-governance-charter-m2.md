# Knowledge Governance Sprint M2 — Knowledge Data Model

> **Status:** ✅ Phase B — Population Bootstrap in Progress  
> **Version:** 1.2 | **Date:** 2026-06-29 | **Owner:** Governance Team  
> **Prerequisite:** Milestone M1 (accepted), Phase A complete (frozen)  
> **Current Phase:** Phase B — Population Bootstrap (AuditOS seed)  
> **Gate to:** Sprint v2 (Evidence Authority)

---

## 1. Why Sprint M2?

Sprint v1 built the governance infrastructure. Sprint v2 will build the Evidence Catalog. But between them lies a gap: **we have not defined the data model that governs how claims, evidence, decisions, and authorities relate to each other.**

Without this model:

- Claim IDs will need restructuring when the catalog grows (we already have `CR-NNN` which is flat)
- Evidence will be duplicated across manifests (same evidence proving multiple claims)
- Manifests will become monolithic product files instead of composable aggregations
- Automated governance gates will be harder to build (no canonical entity definitions)
- The system will not scale from 10 products to 30+

### Target state

```text
Claim ──references──► Evidence
  │                      │
  ├── has_authority──► Authority
  │                      │
  └── results_in──► Decision ──approved_by──► Reviewer
```

This Sprint defines these entities and their relationships. It produces **zero new claims or evidence** — only the schema that Sprint v2 will populate.

---

## 2. The Knowledge Data Model

### 2.1 Entity Definitions

| Entity | Description | Identifier Pattern | Versioned | Example |
|--------|-------------|-------------------|-----------|---------|
| **KnowledgeArea** | Top-level domain of knowledge within AQLIYA | `KA-SALES`, `KA-AUDIT`, `KA-GOV` | No (stable) | `KA-SALES` |
| **Product** | Named system under AQLIYA | `Product.name` | No (stable) | `SalesOS` |
| **Claim** | A factual statement about a product or system. The **atomic unit of governance.** | `CLM-{AREA}-{NNNN}` | **Yes** — SemVer (1.0, 2.0...) | `CLM-SALES-0001` |
| **Evidence** | A verifiable piece of data supporting or contradicting a claim | `EV-{NNNN}` | **Yes** — SemVer | `EV-0042` |
| **Source** | The **origin** of information — code, test, CI report, Prisma schema, route, command output, official doc content. Different from Document: Source is what produced the information; Document is the file container. | `SRC-{TYPE}-{NNNN}` | **Yes** — SemVer | `SRC-CODE-0001` |
| **Authority** | A document with governance authority over a knowledge area | `AUTH-{AREA}` | **Yes** — matches document version | `AUTH-SALES` |
| **Document** | Any `.md` file in `docs/` — may contain claims, evidence, or authority | `filepath` | Yes (doc version) | `docs/official/AQLIYA_MASTER_REFERENCE.md` |
| **Decision** | A governance decision about a claim's validity, maturity, or status | `DEC-{YYYY}-{NNNN}` | **Yes** — incremented on revision | `DEC-2026-0001` |
| **Review** | A governance review event (Sprint v3) | `REV-{YYYY}-{NNNN}` | No (single event) | `REV-2026-0001` |
| **Finding** | A finding from a review — links Claim → Decision | `FND-{REV}-{NNNN}` | No (single event) | `FND-REV20260001-01` |
| **Manifest** | **Derived artifact** — auto-generated aggregation of all Claims for a Product. Never manually edited. | `MANIFEST-{Product}` | Yes (derived from source versions) | `MANIFEST-SalesOS` |
| **Dossier** | **Derived artifact** — auto-generated from Manifest + rubric scoring + context. May be reviewed but never manually edited. | `DOSSIER-{Product}` | Yes (derived) | `DOSSIER-SalesOS` |

### 2.2 Relationships

```
KnowledgeArea (1) ──has_many──► Product (N)
KnowledgeArea (1) ──has_many──► Claim (N)
KnowledgeArea (1) ──has_many──► Authority (N)

Product (1) ──has_many──► Claim (N)
Product (N) ──belongs_to──► KnowledgeArea (1)

Claim (N) ──references──► Evidence (M)    [many-to-many: one claim can reference multiple evidence items; one evidence item can support multiple claims]
Claim (N) ──has_authority──► Authority (1) [one authority governs each claim]
Claim (1) ──results_in──► Decision (1)     [each claim has one current decision]
Claim (N) ──contained_in──► Document (M)   [a claim may appear in multiple documents; a document may contain multiple claims]

Evidence (1) ──sourced_from──► Source (1)   [each evidence item comes from one source — code, test, CI, schema, route, doc content]
Source (N) ──contained_in──► Document (M)   [a source may appear in multiple documents; a document may contain multiple sources]
Evidence (1) ──has_type──► Tier (1)         [T1–T7]

Authority (1) ──governs──► KnowledgeArea (N)
Authority (N) ──supersedes──► Authority (1) [chain link]

Decision (1) ──approved_by──► Reviewer (1)
Decision (1) ──based_on──► Evidence (M)     [decision references evidence]

Review (1) ──produces──► Finding (N)
Finding (1) ──references──► Claim (1)
Finding (1) ──recommends──► Decision (1)

Manifest (1) ──aggregates──► Claim (N)     [auto-generated from claims for a product]
Dossier (1) ──extends──► Manifest (1)      [enhanced by human]
```

#### Cardinality Table (Machine-Verifiable)

| # | Source Entity | Relationship | Target Entity | Cardinality | Description |
|---|---------------|-------------|---------------|-------------|-------------|
| C01 | KnowledgeArea | has_many | Product | 1:N | One area contains many products |
| C02 | KnowledgeArea | has_many | Claim | 1:N | One area contains many claims |
| C03 | KnowledgeArea | has_many | Authority | 1:N | One area may have multiple authorities |
| C04 | Product | has_many | Claim | 1:N | One product has many claims |
| C05 | Product | belongs_to | KnowledgeArea | N:1 | Products belong to one area each |
| C06 | Claim | references | Evidence | **N:M** | Many claims reference many evidence items |
| C07 | Claim | has_authority | Authority | N:1 | Many claims governed by one authority |
| C08 | Claim | results_in | Decision | 1:1 | Each claim has one current decision |
| C09 | Claim | contained_in | Document | N:M | Claims may appear in multiple documents |
| C10 | Evidence | sourced_from | Source | N:1 | Many evidence items come from one source |
| C11 | Source | contained_in | Document | N:M | Sources may appear in multiple documents |
| C12 | Evidence | has_type | Tier | N:1 | Each evidence has one T1–T7 type |
| C13 | Authority | governs | KnowledgeArea | 1:N | One authority governs many claims in an area |
| C14 | Authority | supersedes | Authority | N:1 | Authorities form a supersession chain |
| C15 | Decision | approved_by | Reviewer | N:1 | Many decisions by one reviewer |
| C16 | Decision | based_on | Evidence | 1:M | One decision references multiple evidence |
| C17 | Review | produces | Finding | 1:N | One review produces many findings |
| C18 | Finding | references | Claim | N:1 | Many findings reference one claim |
| C19 | Finding | recommends | Decision | N:1 | Many findings recommend one decision |
| C20 | Manifest | aggregates | Claim | 1:N | One manifest aggregates many claims (auto) |
| C21 | Dossier | extends | Manifest | 1:1 | One dossier extends one manifest (auto) |

### 2.3 Claim Structure

```text
CLAIM: CLM-{AREA}-{NNNN}
──────────────────────────
  Version: SemVer (1.0, 1.1, 2.0...)  ← incremented on content change (ID stays same)
  Hash: SHA256(fields...)             ← changes if claim content changes
  KnowledgeArea: KA-XXX
  Product: Product.name
  Dimension: Implementation Reality | Product Maturity | Commercial Claim | Strategic Intent
  ClaimText: "..."
  SourceDocuments: [doc paths]
  Authorities: [AUTH-XXX]
  EvidenceRefs: [EV-NNNN, ...]
  AssessmentConfidence: High | Medium | Low
  CurrentDecision: DEC-YYYY-NNNN
  EvidenceFreshness:
    - Evidence Date
    - Commit
    - Verification Date
    - Reviewer
    - Expires
  Created: YYYY-MM-DD
  History: [list of superseded versions]
```

### 2.4 Evidence Structure

```text
EVIDENCE: EV-{NNNN}
────────────────────
  Version: SemVer (1.0, 1.1...)
  Type: T1 (Static Code) | T2 (UX) | T3 (Dynamic) | T4 (Governance) | T5 (Tests) | T6 (Docs) | T7 (Operational)
  SourceRef: SRC-{TYPE}-{NNNN}    ← the origin that produced this evidence
  Description: "What this evidence proves"
  Score: 0 | 1 | 2 | 3
  SupportsClaims: [CLM-XXX-NNNN, ...]
  Freshness:
    - Evidence Date
    - Commit
    - Verification Date
    - Reviewer
    - Expires
```

### 2.5a Source Structure

```text
SOURCE: SRC-{TYPE}-{NNNN}
──────────────────────────
  Version: SemVer (1.0, 1.1...)
  Type: CODE | TEST | CI | SCHEMA | ROUTE | COMMAND | DOC | CONFIG | OPERATION
  Location: file path, URL, command, schema reference
  Description: "What this source contains"
  ProducesEvidence: [EV-NNNN, ...]
  ContainedIn: [doc paths]
```

### 2.5 Authority Structure

```text
AUTHORITY: AUTH-{AREA}
───────────────────────
  Version: matches document version (e.g., 1.1)
  KnowledgeArea: KA-XXX
  Document: path to authoritative doc
  Type: Doctrine | Reference | Working | Historical | Archive
  Supersedes: AUTH-XXX (optional)
  SupersededBy: AUTH-XXX (optional)
  ChainPosition: L0 (charter) | L1 (doctrine) | L2 (reference) | L3 (working) | L4 (sprint) | L5 (historical)
```

### 2.6 Decision Structure

```text
DECISION: DEC-{YYYY}-{NNNN}
────────────────────────────
  Version: incremented on revision (1.0, 1.1...)
  Date: YYYY-MM-DD
  Type: Accept | Reject | Defer | Freeze | Override
  Claim: CLM-XXX-NNNN
  EvidenceRefs: [EV-NNNN, ...]
  ApprovedBy: Reviewer name / agent
  Rationale: "Why this decision was made"
  Authority: AUTH-XXX
  Expires: YYYY-MM-DD (default +180 days)
```

---

## 3. Execution Phases

Sprint M2 is split into two sequential phases:

### Phase A — Foundation (Run First, Freeze After)

Goal: **Stabilize the data model** before any population begins. No claims are created, no evidence is collected — only the model itself is built and validated.

| # | Deliverable | Description | Format |
|---|-------------|-------------|--------|
| M2-D1 | **Data Model Definition** | This document — defines all entities, relationships, identifiers, and structures | `docs/governance/aqliya-knowledge-governance-charter-m2.md` |
| M2-D2 | **Claim Registry v3** | CLAIM_REGISTRY.md restructured with new ID scheme (CLM-AREA-NNNN), permanent hash, entity relationships | Updated `CLAIM_REGISTRY.md` |
| M2-D4 | **Glossary Precision Rule** | Ban on ambiguous terms (Strategic Future, Planned, Coming Soon, Future Product). Replacement requirement: use explicit values from the four dimensions. | Added to `DOCUMENTATION_AUTHORITY.md` |
| M2-D5 | **Authority Chain Update** | AUTH-XXX identifiers assigned to all existing authorities from AUTHORITY_MATRIX.md | Updated `AUTHORITY_MATRIX.md` |
| M2-D6 | **Cycle Structure Update** | M2 inserted into program cycle: M1 → M2 → Sprint v2 → Sprint v3 → Wave 3B | Updated `MILESTONE_M1.md` |

**Phase A exit criteria — Architecture Freeze Gate:**

| Gate | Criterion | How to Verify |
|------|-----------|---------------|
| **Data Model Freeze** | All entities (KnowledgeArea, Product, Claim, Evidence, Source, Authority, Document, Decision, Review, Finding, Manifest, Dossier) and their relationships are stable with no open changes | Each entity reviewed against M2 charter §2.1–2.5a |
| **Identifier Freeze** | CLM-AREA-NNNN, EV-NNNN, SRC-TYPE-NNNN, AUTH-XXX, DEC-YYYY-NNNN formats are final and adopted | All ID patterns documented in M2 charter §2 |
| **Relationship Validation** | All relationship types verified theoretically: Claim↔Evidence (many-to-many), Evidence→Source (one), Source→Document (many), Claim→Authority (one), Claim→Decision (one), Review→Finding→Claim | Each relationship traced through the chain in §2.2 |
| **Governance Rules Freeze** | Immutable IDs Rule (§4), Evidence Manifest Rule, Glossary Precision Rule are binding and enforced | Rules documented in M2 charter §4 + DOCUMENTATION_AUTHORITY.md §12a |
| **Change Control** | Any future model change requires an ADR or Governance Decision — direct edits to entity definitions are prohibited | Change Control rule documented and acknowledged |

**After freeze:** Phase A declared complete, data model is **frozen**. No entity, relationship, or ID pattern may change without a documented governance decision. Phase B may begin.

#### Architecture Freeze Certificate

Upon satisfying all 5 gates, the following certificate is issued. This is the **single document** that declares the Architecture Freeze complete.

```text
╔══════════════════════════════════════════════════════════════╗
║           ARCHITECTURE FREEZE CERTIFICATE                    ║
║           Knowledge Data Model — M2 Phase A                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Model Version:    M2 Model v1.2                             ║
║  Freeze Date:      2026-06-29                                ║
║  Governing Ref:    Project Owner Decision (session 2026-06-29)║
║  Issued By:        Governance Team                           ║
║                                                              ║
║  ┌───── GATE STATUS ──────────────────────────────────────┐  ║
║  │ G01 Data Model Freeze       ■ PASS                     │  ║
║  │ G02 Identifier Freeze       ■ PASS                     │  ║
║  │ G03 Relationship Validation ■ PASS                     │  ║
║  │ G04 Governance Rules Freeze ■ PASS                     │  ║
║  │ G05 Change Control          ■ PASS                     │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                              ║
║  ┌───── APPROVED ENTITIES ───────────────────────────────┐  ║
║  │ 1. KnowledgeArea       7. Authority                    │  ║
║  │ 2. Product             8. Document                     │  ║
║  │ 3. Claim               9. Decision                     │  ║
║  │ 4. Evidence           10. Review                       │  ║
║  │ 5. Source             11. Finding                      │  ║
║  │ 6. Manifest           12. Dossier                      │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                              ║
║  ┌───── APPROVED RELATIONSHIPS ──────────────────────────┐  ║
║  │ 21 relationships (C01–C21)                             │  ║
║  │ N:M: Claim↔Evidence, Claim↔Document, Source↔Document   │  ║
║  │ N:1: Evidence→Source, Claim→Authority, Decision→Review │  ║
║  │ 1:1: Claim→Decision, Dossier→Manifest                  │  ║
║  │ 1:N: KnowledgeArea→Product, Review→Finding, etc.       │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                              ║
║  ┌───── BINDING GOVERNANCE RULES ────────────────────────┐  ║
║  │ 1. Immutable IDs Rule (M2 §4)                         │  ║
║  │ 2. Derived Artifacts Rule (M2 §5)                     │  ║
║  │ 3. Evidence Manifest Rule (M1)                        │  ║
║  │ 4. Glossary Precision Rule (DOC_AUTHORITY §12a)       │  ║
║  │ 5. Three-tier Review Separation (M1)                  │  ║
║  └────────────────────────────────────────────────────────┘  ║
║                                                              ║
║  ─────────────────────────────────────────────────────────    ║
║  This certificate confirms that the AQLIYA Knowledge Data    ║
║  Model is frozen as of 2026-06-29. Any modification to       ║
║  entities, relationships, identifiers, or governance rules   ║
║  requires a documented Architecture Decision Record (ADR)    ║
║  or Governance Decision (DEC-YYYY-NNNN).                     ║
║                                                              ║
║  Status: ENFORCED — 2026-06-29                               ║
║  Authority: Project Owner (session 2026-06-29)                ║
╚══════════════════════════════════════════════════════════════╝
```

### Phase B — Population Bootstrap (Run After Phase A Freeze)

Goal: **Validate the model works in practice** with a small initial dataset before handing off to Sprint v2.

| # | Deliverable | Description | Format |
|---|-------------|-------------|--------|
| M2-D3 | **Evidence Inventory** | Pre-populated evidence items (EV-NNNN) from Sprint v1 findings — each evidence item has type, source, score | Evidence section in `CLAIM_REGISTRY.md` |
| M2-B1 | **Claim Seed** | First batch of Claims (CLM-AREA-NNNN) for one reference product (AuditOS — undisputed maturity) to validate the model end-to-end | Registry seed entries |
| M2-B2 | **Claim↔Evidence Links** | Link seed Claims to their supporting Evidence items (EV-NNNN). Verify many-to-many relationship works. | Registry link entries |
| M2-B3 | **Model Validation Report** | Document any issues found during population: missing fields, relationship gaps, ID collisions, clarity problems | Validation note in this document |

**Phase B exit criteria:**
- Seed product (AuditOS) has complete Claim→Evidence mapping
- All relationship types exercised (Claim references Evidence, Claim has Authority, Evidence has type)
- No model changes needed — or if needed, they are made and frozen before proceeding
- Model validated → **Sprint v2 authorized**

---

## 4. Immutable IDs Rule

> **Adopted as binding governance rule for all entities in the Knowledge Data Model.**

### The Rule

| Entity | ID Pattern | Immutable? | On Change |
|--------|-----------|------------|-----------|
| **Claim** | `CLM-{AREA}-{NNNN}` | ✅ **Never changes** | Create new Claim, link via `SupersededBy` |
| **Evidence** | `EV-{NNNN}` | ✅ **Never changes** | Create new Evidence item |
| **Authority** | `AUTH-{AREA}` | ✅ **Never changes** | Update supersession chain |
| **Decision** | `DEC-{YYYY}-{NNNN}` | ✅ **Never changes** | Create new Decision |
| **Review** | `REV-{YYYY}-{NNNN}` | ✅ **Never changes** | N/A (single event) |

### Rationale

- Preserves **traceability**: historical references remain valid even when content changes
- Enables **audit**: a claim's full lineage (including superseded versions) is always recoverable
- Prevents **reference breakage**: no link in any manifest, dossier, or decision ever points to a deleted or recycled ID
- Complements `CLAIM-HASH`: if content changes, hash changes but ID stays — the combination provides both stability and integrity verification

### Enforcement

- If a claim's text, dimension, or scope changes: do NOT edit in place. Create a new `CLM-{AREA}-{NNNN+1}` and set the old claim's `SupersededBy` to the new ID.
- If an evidence item's source or score changes: create a new `EV-{NNNN+1}`. The old EV remains as historical record.
- This rule applies to ALL claims and evidence created during Sprint v2, v3, and beyond.

---

## 5. Derived Artifacts Rule

> **Adopted to prevent the contradiction problem from re-emerging.**

### The Rule

**Manifests and Dossiers are derived artifacts.** They must never be manually created or edited.

```text
Claims
    ↓
Evidence (EV-NNNN)
    ↓
Decisions (DEC-YYYY-NNNN)
    ↓
[auto-generate] Manifest      ← machine-generated, never hand-written
    ↓
[auto-generate] Dossier       ← machine-generated, never hand-written
```

### Rationale

- If manifests are hand-edited, they will inevitably diverge from the claims they aggregate — recreating the exact contradiction problem that Sprint v1 was built to solve
- Auto-generation ensures that the manifest is always an accurate reflection of the underlying claims and evidence
- Dossiers add rubric scores and context, but these are structured fields on top of the manifest, not free-form edits

### Enforcement

- The `evidence-catalog/manifests/` directory is **read-only** for humans
- The `evidence-catalog/dossiers/` directory is **append-only** — new fields may be added programmatically, but existing content is never overwritten by hand
- Any proposed manual edit to a manifest or dossier must go through a Governance Decision (DEC-YYYY-NNNN)

---

## 6. What Sprint M2 Does NOT Do

- ❌ Generate new claims (Sprint v2 does that)
- ❌ Collect new evidence (Sprint v2 does that)
- ❌ Change any document content (already done in Wave 3A)
- ❌ Make any L-level decisions (Sprint v3 does that)
- ❌ Build any software or automation (future phase)

---

## 7. After M2

```text
Sprint v1: Foundation + Infrastructure
    ↓
M1: Governance Acceptance (DONE ✅)
    ↓
M2: Knowledge Data Model ⬅️ WE ARE HERE
    │
    ├── Phase A: Foundation (freeze model, IDs, rules)
    │     ├── Entity definitions reviewed
    │     ├── Immutable IDs Rule adopted
    │     ├── CLM/EV/AUTH/DEC formats confirmed
    │     └── Relationships verified
    │     │
    │     └── Phase B: Population Bootstrap
    │           ├── Seed product (AuditOS) Claim→Evidence mapped
    │           ├── All relationship types exercised
    │           └── Model validated → Sprint v2 authorized
    │
    ↓
Sprint v2: Evidence Authority (populate all 10 products)
    │
    ├── Create Claims (CLM-XXX-NNNN) for all disputed products
    ├── Create Evidence (EV-NNNN) for all T1–T7 data
    ├── Link Claims → Evidence (many-to-many)
    ├── Auto-generate Manifests from Claims
    ├── Create Dossiers (Manifest + Rubric)
    └── Produce Governance Review Brief
    │
    ↓
Sprint v3: Governance Review
    │
    ├── Review evidence per product
    ├── Create Decisions (DEC-YYYY-NNNN) per Claim
    └── Produce Findings (FND-REV-NNN)
    │
    ↓
Wave 3B: Apply maturity-level changes
    │
    ↓
Documentation Freeze v2 + Knowledge Governance Gate (CI)
```

---

## 8. Pending ADRs (Pre-Automation)

These items are identified but intentionally deferred. They must be resolved BEFORE implementing any automated database, knowledge graph, or governance gate software.

### ADR-001: Version vs Immutable IDs — Operational Policy

**Tension:** Immutable IDs Rule (§4) says "create new ID on change." Version field (§2.3–2.6) says "increment version, keep same ID."

**Resolution needed:** Define the boundary between a "minor change" (version increment, same ID) and a "substantive change" (new ID + SupersededBy).

| Change Type | Examples | Rule |
|-------------|----------|------|
| **Metadata only** | Fix typo in description, update freshness date | Version increment only |
| **Scope adjustment** | Expand or narrow claim scope, change dimension | New ID + SupersededBy |
| **Score change** | Evidence score changes (0→1, 2→3) | New EV-ID + SupersededBy |
| **Authority change** | Claim's governing authority document updated | Version increment (authority ref changes, claim substance stays) |

**Priority:** Pre-automation. Not blocking Phase B or Sprint v2 but must be decided before any code is written.

---

## 9. Backlog — Future Extensions

These are not required for Sprint v2 but should be implemented as the system scales:

### 7.1 Claim Lifecycle States

The current model uses `Status` (Verified, Contradicted, etc.) and `CurrentDecision` independently. A unified Claim Lifecycle would add:

```text
- Draft      (claim identified, not yet verified)
- Verified   (evidence collected, not yet decided)
- Approved   (governance decision accepted)
- Superseded (replaced by newer claim)
- Archived   (historical only, no longer active)
```

**When to implement:** When the number of claims exceeds ~100 and manual status tracking becomes ambiguous.

### 7.2 Internal UUID per Entity

While CLM-AREA-NNNN, EV-NNNN, and DEC-YYYY-NNNN are human-readable, a system-assigned UUID should be stored internally for:

- Database integration (graph DB, relational)
- Knowledge graph relationships
- Cross-reference stability even if the human-readable ID format changes
- Machine-parsing without regex dependency

```text
CLM-SALES-0001
    ↕ maps to
550e8400-e29b-41d4-a716-446655440000
```

**When to implement:** When the Evidence Catalog is migrated to a database or knowledge graph.

---

## References

- `docs/governance/MILESTONE_M1.md` — M1 checkpoint (accepted)
- `docs/governance/CLAIM_REGISTRY.md` — Current claim registry (to be restructured)
- `docs/governance/aqliya-knowledge-governance-charter-v2.md` — Sprint v2 charter (depends on M2)
- `docs/governance/AUTHORITY_MATRIX.md` — Authority matrix (to get AUTH-XXX IDs)
- `docs/governance/WAVE3_CHANGE_PLAN.md` — Wave 3 plan
