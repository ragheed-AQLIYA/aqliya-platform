# AQLIYA Knowledge Governance Sprint v2 — Evidence Authority

> **Status:** ✅ Wave 1 Complete — Handed off to Sprint v3 | **Version:** 1.2 | **Date:** 2026-06-29 | **Owner:** Governance Team  
> **Supersedes:** Nothing — this Sprint v2 runs *after* Sprint v1's structural edits (Wave 3A)  
> **Charter Authority:** docs/governance/aqliya-knowledge-governance-charter-v1.md (§5 — Sprint charters are Level 4 Authority Documents)

---

## 1. Why Sprint v2?

Sprint v1 (Knowledge Governance Sprint) successfully:
- Inventoried **1860 docs**, extracted **192 maturity claims**
- Found **15 contradictions** across 18 authority documents
- Built governance infrastructure: Charter, Authority Matrix, Claim Registry, Duplicate Matrix, Metadata Audit, Navigation Analysis, Broken References, Glossary Audit, Gate Design
- **Applied structural/editorial fixes** (Wave 3A): broken links, README indexes, metadata dates, glossary entries

**But Sprint v1 hit a wall:** It assumed "code = truth" for maturity levels. The Sprint v1 Governance Decision (2026-06-29) identified that this is incorrect for two of the three truth types.

### The gap Sprint v2 must close

Current state:

```
Document → Document → Document
(Claims float without evidence anchors)
```

Target state:

```
Claim → Evidence → Code/Test/PR → Authority
(Every claim is traceable to verifiable evidence)
```

Sprint v2 does **not** change any document content. It builds the **evidence layer** that Sprint v3's Governance Review needs to make informed maturity decisions.

### Prerequisite: Milestone M1 + Sprint M2

Sprint v2 may only begin after:
1. **Milestone M1** is accepted — governance checkpoint accepting Sprint v1 outputs
2. **Sprint M2** (Knowledge Data Model) is complete — defines the entity-relationship model (Claim, Evidence, Decision, Authority, etc.), permanent claim IDs (CLM-AREA-NNNN), evidence IDs (EV-NNNN), and the Glossary Precision Rule

M1: [docs/governance/MILESTONE_M1.md](MILESTONE_M1.md) (accepted ✅)
M2: [docs/governance/aqliya-knowledge-governance-charter-m2.md](aqliya-knowledge-governance-charter-m2.md)

### Claim-Centric Architecture

Sprint v2 adopts a **Claim-centric** architecture (not Product-centric):

```text
Previously:                    Now:
Product                        Claim
    ↓                              ↓
Manifest                     Evidence (EV-NNNN)
    ↓                              ↓
T1...T7                      Decision (DEC-YYYY-NNNN)

Product is just an aggregation of Claims.
```

This means:
- **Claims** (CLM-AREA-NNNN) are the atomic unit of governance
- **Evidence** (EV-NNNN) is independent — one evidence item may support multiple claims across products
- **Manifests** are auto-generated aggregations of claims for a product
- **Dossiers** are enhanced manifests with rubric scoring
- The Evidence Catalog structure follows the M2 data model

---

## 2. Sprint v2 Objective

> **Connect every maturity claim (L0–L6) to traceable evidence, so that the Governance Review in Sprint v3 can make informed decisions — not guesses based on code volume alone.**

### Non-goals (explicitly excluded)

- Changing any document content — **not even metadata**
- Assigning maturity levels — that is the **Governance Review's** job
- Re-running Sprint v1 analyses — they are complete
- Judging product quality — only documenting what evidence exists

---

## 3. Deliverables

### Master Structure: Evidence Catalog

Sprint v2's output is not a set of separate files — it is a single **Institutional Evidence Base** organized as:

```
docs/governance/evidence-catalog/
│
├── manifests/               ← D6: Evidence Manifests (authoritative source)
│     ├── AuditOS.md
│     ├── SalesOS.md
│     ├── InstitutionalMemory.md
│     ├── LocalContactOS.md
│     ├── RiskOS.md
│     ├── ContentStudio.md
│     ├── DecisionOS.md
│     ├── OfficeAI.md
│     ├── WorkflowOS.md
│     ├── LocalContentOS.md
│     └── LocalAIRuntime.md
│
├── dossiers/                ← D3: Product Dossiers (rubric scoring + context)
│     └── *.md (same products)
│
├── evidence-index.md        ← Master index of all evidence (searchable)
│
├── evidence-coverage-matrix.md  ← T1–T7 scores per product (machine-readable)
│
├── evidence-freshness-report.md ← Expiry tracking for all manifests
│
└── governance-review-brief.md   ← D5: Single decision document
```

| # | Deliverable | Description | Format |
|---|-------------|-------------|--------|
| D1 | **Evidence-Oriented Claim Registry v2** | Every claim in CLAIM_REGISTRY.md upgraded with: truth dimension classification, Assessment Confidence (High/Medium/Low), Evidence Freshness (date, commit, verification, reviewer, expires), evidence links | Updated `docs/governance/CLAIM_REGISTRY.md` |
| D2 | **Evidence Coverage Matrix** | T1–T7 scores per product in machine-readable table. Each cell: 0/1/2/3 + justification. Covers all 10 disputed products. | `evidence-catalog/evidence-coverage-matrix.md` |
| D3 | **Product Dossiers** | One per disputed product: serialized evidence, DoD rubric scoring per AGENTS.md §21, **Strategic Intent section** (Approved/Deferred/Frozen/Experimental — executive input, not from code), **Assessment Confidence** per claim | `evidence-catalog/dossiers/PRODUCT_NAME.md` |
| D4 | **Maturity Rubric v2** | Refined L0–L6 rubric with evidence requirements per level — so that Governance Review has clear criteria | `docs/governance/MATURITY_RUBRIC.md` |
| D5 | **Governance Review Brief** | Single document that the Governance Review decision-maker reads. Contains: recommended L-levels per product, evidence summaries, Assessment Confidence per claim, open questions, risks, Strategic Intent status | `evidence-catalog/governance-review-brief.md` |
| D6 | **Evidence Manifest** | Unified manifest per disputed product — serializes all evidence into a single file. **This is the authoritative evidence source that all other deliverables reference.** Structured as: | `evidence-catalog/manifests/PRODUCT_NAME.md` |

### D6 Evidence Manifest Template

```markdown
# Evidence Manifest: [Product Name]

## 1. Implementation Reality
- Routes: [count + list]
- Prisma Models: [count + list]
- Seeds: [exists/size]
- Tests: [count + types]
- Build: [passing/failing]

## 2. Product Maturity
- UX: [workflow states, error/loading/empty, bilingual]
- Governance: [audit trail, approval gates, review steps, export controls]
- Evidence Date: [YYYY-MM-DD]
- Verification Date: [YYYY-MM-DD]

## 3. Commercial Claim
- Pilot: [yes/no + details]
- Customers: [count + details]
- Deployment: [type]
- Known Risks: [list]

## 4. Strategic Intent
- Status: [Approved / Deferred / Frozen / Experimental]
- Source: [executive input — not from code]
- Notes: [context]

## 5. Evidence Freshness
- Evidence Date: YYYY-MM-DD
- Repository Commit: <hash>
- Verification Date: YYYY-MM-DD
- Reviewer: <name/agent>
- Expires: YYYY-MM-DD

## 6. Assessment Confidence
- Overall: High / Medium / Low
- T1–T7 Completeness: [scores]
- Contradictions: [count]
- Independent Review: [yes/no]
```

---

## 4. Evidence Tiers

Sprint v2 introduces an explicit evidence hierarchy:

| Tier | Evidence Type | What It Proves | How to Collect |
|------|---------------|----------------|----------------|
| **T1** | Static code analysis | Implementation Reality (existence) | Route files count, Prisma models, seed size, test file count |
| **T2** | Static behavior analysis | UX Completeness | Check for workflow states, error/loading/empty/edge cases in components |
| **T3** | Dynamic analysis (runtime) | Working integration | Server action traces, form submission success, navigation flow |
| **T4** | Governance analysis | Institutional readiness | Audit trail coverage, approval gates, review steps, export controls |
| **T5** | Test analysis | Reliability | Test coverage, integration tests, edge case handling |
| **T6** | Documentation audit | Claim verifiability | Is the product's status documented? Is it accurate? |
| **T7** | **Operational evidence** | Runtime viability | Build passing, CI passing, migrations successful, seeds successful, production/preview deployment (if available), pilot execution, performance baselines, security validation, smoke tests |

### Caveat: T1–T7 Are Not Enough

Even complete T1–T7 evidence does not determine maturity level. **Strategic Intent** (the 4th dimension) is a business decision that can override all evidence tiers. A product may score 3/3 on all 7 tiers yet remain Deferred or Experimental if the organization has not committed to its release.

Evidence informs. Governance decides.

### Scoring

Each product gets a score per tier:

```
Score: 0 (absent) / 1 (partial) / 2 (present) / 3 (thorough)
```

No "overall" score — the Governance Review sees the full profile, not a single number.

---

## 5. Products Under Review

These products have disputed maturity levels and require full dossiers:

| Product | Current L-Level (status quo) | Dispute Type | Sprint v1 Finding |
|---------|---------------------------|-------------|-------------------|
| SalesOS | L4 (matrix) / L5 (code) / L3 (reality note) | Triple conflict — all three truth types in disagreement | Requires Governance Decision |
| Institutional Memory | L0 "Not implemented" (docs) / L5 (code) | Implementation Reality clearly exists, docs call it L0 | Critical contradiction C02 |
| LocalContactOS | L0 "Not implemented" (docs) / L5 (code) | Same pattern as IM | Critical contradiction C03 |
| RiskOS | L0 "Not included" (roadmap) / L5 (code) | Same pattern | Critical contradiction C04 |
| ContentStudio | L3 (master ref) / L4 (code + matrix) | Minor gap — likely L4 | High contradiction H10 |
| DecisionOS | L4 (6 docs) / L5 (code) | 1-level gap | High contradiction H07 |
| Office AI Assistant | L4 (master ref) / L5 (code) | 1-level gap | High contradiction H08 |
| WorkflowOS | L4 (master ref) / L5 (code) | 1-level gap | High contradiction H09 |
| LocalContentOS | L5 (matrix + code) / L4 (master ref) | Minor gap | High contradiction H11 |
| Local AI Runtime | L0 "Not claimed" (vision) / L4 (architecture doc) | Strategic ambiguity | High contradiction H13 |

### Products NOT under review (maturity undisputed)

- AuditOS — all docs agree L5 ✅
- Knowledge Foundation — all docs agree L4 ✅ (no glossary entry — will be fixed in Wave 3A)
- Intelligence Core — all docs agree L3–L4 ✅
- ComplianceOS — all docs agree Future/Not Implemented ✅
- LegalOS — all docs agree Future ✅
- GovOS — all docs agree Future ✅
- AQLIYA Studio — all docs agree Future ✅

---

## 6. Methodology

### Phase 1 — Evidence Collection (Parallel)

For each of the 10 disputed products, collect evidence according to the 7 tiers:

1. **T1 (Static code)**: Count route files, Prisma models, test files, seed data, sidebar entries, build participation
2. **T2 (UX analysis)**: Inspect components for workflow states, error/loading/empty patterns, bilingual/RTL support
3. **T3 (Dynamic)**: Run server actions, verify form submissions, check navigation paths
4. **T4 (Governance)**: Check for audit trail, approval gates, review steps, export controls, permission checks
5. **T5 (Tests)**: Review test coverage, test types (unit/integration/e2e), edge case coverage
6. **T6 (Docs)**: Check product status accuracy across all authority documents
7. **T7 (Operational)**: Build success, CI success, migration success, seed success, deployment (if available), pilot evidence

### Phase 2 — Evidence Manifest Creation (D6)

For each disputed product, create an Evidence Manifest in `evidence-catalog/manifests/` — a single unified file serializing all T1–T7 evidence. The manifest is structured by truth dimension:

```
Implementation Reality → T1, T3, T5, T7 (static + dynamic + tests + operational)
Product Maturity       → T2, T4 (UX + governance)
Commercial Claim       → T6 (documentation audit)
Strategic Intent       → executive input (not from code)
Evidence Freshness     → date, commit, verification, reviewer, expiry
Assessment Confidence  → overall score + T1–T7 completeness + contradictions + review status
```

The manifest becomes the **single authoritative evidence source** that all other deliverables reference.

### Phase 3 — Evidence Index + Coverage Matrix

Create:
- `evidence-catalog/evidence-index.md` — master index of all evidence (searchable by product, type, tier)
- `evidence-catalog/evidence-coverage-matrix.md` — T1–T7 scores per product in tabular format

### Phase 4 — Dossier Creation

One dossier per disputed product in `evidence-catalog/dossiers/`. Dossiers reference manifests but include DoD rubric scoring (AGENTS.md §21) and additional context.

### Phase 5 — Rubric Refinement

Refine the L0–L6 rubric with specific evidence requirements per level. Published as `docs/governance/MATURITY_RUBRIC.md`.

### Phase 6 — Evidence Freshness Report

Create `evidence-catalog/evidence-freshness-report.md` — tracks expiry dates for all manifests, flags stale evidence.

### Phase 7 — Governance Review Brief

Write `evidence-catalog/governance-review-brief.md` — the single document that the Governance Review decision-maker reads to make informed maturity decisions.

**Phase 8 — Wave 3B Execution**

After Governance Review determines correct maturity levels, apply the frozen changes.

---

## 7. Success Criteria

| # | Criterion | How to Verify |
|---|-----------|---------------|
| 1 | Every claim follows the M2 data model: CLM-AREA-NNNN ID, CLAIM-HASH, KnowledgeArea, Dimension | Spot-check all claims in registry |
| 2 | Evidence items are independent entities (EV-NNNN) — not embedded in claims | evidence-coverage-matrix.md shows EV-IDs cross-referenced |
| 3 | Every disputed claim has an evidence profile (T1–T7 scores) | evidence-coverage-matrix.md is complete |
| 4 | Each disputed product has an Evidence Manifest (auto-generated from claims) | evidence-catalog/manifests/ has 10 files |
| 5 | Each disputed product has a dossier | evidence-catalog/dossiers/ has 10 files |
| 6 | Every manifest includes Evidence Freshness (date, commit, verification, reviewer, expires) | Spot-check all 10 manifests |
| 7 | Every claim has Assessment Confidence (High/Medium/Low) | CLAIM_REGISTRY.md is updated |
| 8 | Rubric v2 is clear enough that two independent reviewers would agree on 80%+ of assignments | Peer review test |
| 9 | Governance Review Brief is the **single document** needed to decide all 10 disputed levels | No missing evidence or open questions |
| 10 | No claim in the brief cites another document without an Evidence (EV) anchor | Every citation traces to EV-NNNN |
| 11 | No ambiguous terms used (Strategic Future, Planned, Coming Soon — per Glossary Precision Rule) | Grep for forbidden terms — 0 matches |
| 12 | Evidence Freshness Report flags all manifests nearing or past expiry | evidence-freshness-report.md exists |
| 13 | **Evidence Manifest exists for every product before any L-level change** | Governance rule: No L-level change without manifest |

---

## 8. Governance Rule — Evidence Manifest Requirement

> **Adopted 2026-06-29 as binding governance rule for all future maturity-level changes.**

### The Rule

> **No maturity level (L0–L6) may be changed for any product unless an Evidence Manifest (D6) exists for that product.**

### Rationale

This rule prevents repetition of Sprint v1's methodological error: inferring maturity from code volume alone. An Evidence Manifest ensures that:

1. All three truth types are represented (Implementation Reality, Product Maturity, Commercial Claim)
2. T7 Operational Evidence is included (build, CI, deployment, pilot)
3. The decision-maker can see the full evidence profile, not a single metric
4. The manifest is auditable — any future reviewer can verify that the decision was evidence-based

### Enforcement

- The manifest directory (`docs/governance/manifests/`) is the gate
- If a product has no manifest, its L-level is **frozen** regardless of new code changes
- A new manifest is required whenever code changes could affect maturity (major feature additions, architecture changes)
- Manifests must be re-validated at least quarterly

---

## 9. Governance Review (Sprint v3)

Sprint v2 produces evidence. Sprint v3 (Governance Review) makes decisions:

```
Sprint v1: Discovery + Infrastructure + Structural fixes
    ↓
Sprint v2: Evidence collection + Dossiers + Rubric
    ↓
Sprint v3: Governance Review — decide L-levels for all 10 products
    ↓
Wave 3B Execution: Apply frozen maturity changes
```

### Who conducts the Governance Review?

**Decision:** The Governance Review follows a three-tier model of separation of concerns:

```
Evidence Producer                  → Gathers all T1–T7 evidence
        │
        ▼
Governance Reviewer (Independent)  → Reviews evidence for consistency, completeness, and cross-referencing
        │
        ▼
Final Decision Authority           → Makes the binding L-level decision
```

| Role | Responsible | Scope |
|------|-------------|-------|
| **Evidence Producer** | OpenCode / Agents | Collect T1–T7 evidence, create manifests (D6), build EVIDENCE_MAP.md (D2), write dossiers (D3), produce Governance Review Brief (D5). **No L-level assignments.** |
| **Governance Reviewer** | Independent review (e.g., ChatGPT, or a second agent) | Review evidence for consistency, completeness, internal contradictions, and cross-referencing. Validate that manifests are complete before decisions are made. Flag missing evidence. **No L-level assignments.** |
| **Final Decision Authority** | Project Owner (human) | Makes the binding L-level decision based on the evidence brief (D5) and reviewer's notes. May accept, adjust, or reject recommendations. **Has final authority.** |

**Rule:** No single agent may both produce evidence and decide L-levels for the same product.

The review may:
- Accept the brief's recommended levels
- Adjust levels based on additional context known to the decision authority
- Reject and request more evidence (loop back to Evidence Producer)

---

## 10. Execution Phases (Evidence Authority Program)

Sprint v2 is executed as the **Evidence Authority Program** in 7 sequential phases:

### P1 — Product Inventory
| Output | Criterion |
|--------|-----------|
| Finalized product list with KnowledgeArea and Authority per product | All products mapped to KA and AUTH |

### P2 — Claim Normalization & Extraction

Every Claim passes through a normalization pipeline before entry:

```text
Raw Statement → Normalized Claim → Type Assignment → Origin Tag → Completeness Check → Registry Entry
```

**Claim Type** (permanent classification):

| Type | Description | Example |
|------|-------------|---------|
| Implementation | Code existence, route count, model count | "SalesOS has 22 routes" |
| Architecture | Engine, system design, integration | "IM Engine exists as 4 models" |
| Governance | Authority, RBAC, audit trail, approval | "AUTH-SALES is sole authority" |
| Product | Maturity level, product status | "AuditOS is L5" |
| Commercial | Market positioning, pilot readiness | "Pilot-ready candidate" |
| Strategic | Business intent, deferral, freeze | "Deferred pending review" |
| Operational | Build, CI, deployment, smoke test | "Build passes, migrations OK" |
| Documentation | Doc accuracy, metadata freshness | "Master Reference §11 stale" |

**Claim Origin** (source of discovery):

| Origin | Meaning |
|--------|---------|
| Document | Found verbatim in a doc |
| Observation | Inferred from code or system behavior |
| Code Inspection | Directly verified against source |
| Governance Decision | Result of a DEC-YYYY-NNNN |
| Manual Review | Human expert assessment |
| Imported | Migrated from an earlier system |

**Claim Completeness** (required for Manifest entry):

| Field | Weight |
|-------|--------|
| ID | Required |
| Authority | Required |
| Evidence (≥1) | Required |
| Decision | Recommended |
| Confidence | Required |
| Freshness | Required |
| Origin | Required |
| Type | Required |
| Hash | Recommended |
| Version | Recommended |

**Rule:** Only Claims with ≥80% completeness (including all Required fields) may enter a Manifest.
Only Claims with 100% completeness may enter the Governance Review Brief.

| Output | Criterion |
|--------|-----------|
| All Claims normalized with Type, Origin, Completeness. No raw statements entered. | Every Claim has ≥80% completeness before Manifest generation |

### P3 — Evidence Collection
| Output | Criterion |
|--------|-----------|
| T1–T7 evidence per Claim. Evidence reuses across Claims where applicable (N:M). | Every Claim has ≥1 Evidence reference |

### P4 — Coverage Validation
| Output | Criterion |
|--------|-----------|
| Coverage gaps identified per product. Claims missing evidence flagged. | Evidence Coverage Matrix complete for all products |

### P5 — Manifest Generation
| Output | Criterion |
|--------|-----------|
| Auto-generated Manifest per product from Claims. **No manual editing** (Derived Artifacts Rule). | 100% of products have Manifests |

### P6 — Dossier Generation
| Output | Criterion |
|--------|-----------|
| Dossier per product with DoD Rubric scores (AGENTS.md §21) and Assessment Confidence. | 100% of products have Dossiers |

### Execution Waves (Product Scope)

Sprint v2 products are executed in 3 sequential waves to manage scope and validate the pipeline before tackling high-dispute products:

| Wave | Products | Rationale |
|------|----------|-----------|
| **Wave 1** | AuditOS (reference), DecisionOS, LocalContentOS | Stable L5 products with existing seed (AuditOS). Validate normalization pipeline. |
| **Wave 2** | WorkflowOS, Office AI, ContentStudio, Intelligence Core | Moderate dispute range. Test pipeline with multi-type entities (Workspace, Engine). |
| **Wave 3** | SalesOS, Institutional Memory, RiskOS, LocalContactOS, Local AI Runtime | Highest dispute concentration. Requires careful evidence handling. |

### P7 — Governance Review Package
| Output | Criterion |
|--------|-----------|
| Governance Review Brief + all supporting evidence. Ready for Sprint v3. | Single package that the Governance Reviewer needs — nothing more |

---

## 10a. Sprint v2 Exit Criteria

Sprint v2 is complete only when ALL 8 criteria are met:

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | **100% of products have Manifests** | evidence-catalog/manifests/ has 1 file per product |
| 2 | **Every Claim linked to ≥1 Authority** | CLAIM_REGISTRY.md: Authority Refs field populated |
| 3 | **Every Claim linked to ≥1 Evidence** | CLAIM_REGISTRY.md: Evidence Refs field populated |
| 4 | **No orphan Evidence** (EV with zero Claim refs) | Cross-reference check: every EV-NNNN appears in ≥1 Claim |
| 5 | **No orphan Claims** (CLM with zero Evidence refs) | Cross-reference check: every CLM-NNNN has ≥1 EV ref |
| 6 | **All 21 Cardinalities (C01–C21) exercised** at platform level | Each relationship type appears at least once across all products |
| 7 | **100% of products have Dossiers** | evidence-catalog/dossiers/ has 1 file per product |
| 8 | **Governance Review Package complete** | governance-review-brief.md ready for Sprint v3 without model redesign |

---

## 10b. Local AI Runtime — Status

**PROD-LOCAL-AI** (Local AI Runtime) is the only product without a KnowledgeArea or Authority assignment.

| Field | Value |
|-------|-------|
| PROD-ID | PROD-LOCAL-AI |
| Entity Type | Runtime |
| KA | **Unassigned** — no existing KA fits cleanly |
| AUTH | **Unassigned** — no existing AUTH covers AI Runtime |
| Rationale | Creating a new KA (e.g., KA-25 AI Runtime) during Sprint v2 would open the Authority Matrix for restructuring. Deferred. |
| Status | **Pending ADR** — to be resolved before Sprint v3 or before any automation |

**Impact on Sprint v2:** None. Local AI Runtime Claims may be collected without KA/AUTH assigned. The product registry entry explicitly marks this as a gap.

---

## 10c. Governance Rule GR-008 — Shared Evidence Canonicalization

> **Adopted 2026-06-29. Applies to Waves 2+3.**

### The Rule

If multiple products share the same underlying capability (engine, provider, runtime, RBAC, audit layer, export engine, workflow engine), **one canonical Evidence item (EV-NNNN) must be created and reused** — not duplicate evidence per product.

| Scenario | Before (Prohibited) | After (Required) |
|----------|--------------------|------------------|
| Intelligence Core powers DecisionOS + WorkflowOS | EV-0050: "IC supports DecisionOS" + EV-0051: "IC supports WorkflowOS" (duplicate) | **EV-0050**: "Intelligence Core engine exists with N routes, M models, X tests" — referenced by both products' claims |
| Shared audit layer (AuditEvent model) | EV for each product proving audit exists | **Single EV** referencing the AuditEvent model — reused across all product claims |
| Shared export engine | Multiple EV proving export capability | **Single EV** referencing `src/lib/platform/export.ts` — reused across all product claims |

### Enforcement

- Before creating a new EV for Wave 2 or 3, check:
  1. Does this evidence already exist from Wave 1?
  2. Does a shared source (SRC-ID) already cover this?
  3. Can the claim use an existing EV with a different interpretation?
- If the answer to any is YES: **reuse existing EV**, do not create new.
- Shared EV must be marked with `Reusable: Yes` in CLAIM_REGISTRY.md.

---

## 10d. Governance Rule GR-009 — Capability Evidence Canonicalization

> **Adopted 2026-06-29. Extends GR-008. Applies to all Engine-type products (Intelligence Core, Institutional Memory, Knowledge Foundation).**

### The Rule

Every shared platform capability owns **exactly one canonical Evidence record (EV-NNNN)**. Product maturity claims for Engine-type products must reference capability evidence rather than creating duplicate product-level evidence.

### How It Works

| Traditional (Product-centric) | Canonical (Capability-centric) |
|------------------------------|-------------------------------|
| Each product creates its own EV for "AI Orchestration" | **Single canonical EV-0038** for CAP-001 — reused by all consuming products |
| Product maturity has its own EV | **Product maturity is a Derived Claim** — aggregates capability evidence |
| N products = N duplicate evidence items | N products = 1 canonical EV + N-1 references |

### Derived Claim Pattern

For Engine-type products, the Product Maturity claim (e.g., CLM-INTELLIGENCE-0011) is a **Derived Claim**:

```text
CLM-INTELLIGENCE-0011 (Product Maturity: L3-L4)
    │
    ├── EV-0038 (CAP-001 AI Orchestration)
    ├── EV-0039 (CAP-002 Provider Router)
    ├── EV-0040 (CAP-003 Workflow Engine)
    ├── EV-0041 (CAP-004 Governance Engine)
    ├── EV-0042 (CAP-005 Evidence Layer)
    ├── EV-0007 (CAP-006 Audit Layer — reuse)
    ├── EV-0009 (CAP-007 Export Engine — reuse)
    ├── EV-0043 (CAP-008 Identity/RBAC)
    ├── EV-0044 (CAP-009 Knowledge Layer)
    └── EV-0034 (CAP-010 Runtime Services — reuse)
```

### Enforcement

- This rule applies to all Engine, Foundation, and Runtime entity types
- No product-level maturity EV may be created for Engine-type products
- Product maturity must be a Derived Claim referencing all capability evidence
- Violations are flagged as Medium-severity findings

---

## 10e. Governance Rule GR-011 — Knowledge Quality Preservation

> **Adopted 2026-06-29. Applies to all Scalability Validation phases.**

### The Rule

Reducing the number of new Evidence items (GR-009, GR-010) must not reduce evidence quality, confidence, or traceability.

### Gates

| Gate | Check | Target |
|------|-------|--------|
| GQ-01 | Evidence Sufficiency | 100% of claims have sufficient EV |
| GQ-02 | Confidence Stability | Confidence % does not decline with fewer EV |
| GQ-03 | Traceability Density | All chains (Claim→EV→Source→Doc) complete |
| GQ-04 | Reuse Safety | Reused EV must match original capability context |

### Knowledge Quality Index (KQI)

`KQI = (Evidence Quality × Confidence × Traceability) / Knowledge Cost`

Higher KQI = better quality per unit cost.

---

## 10f. Governance Rule GR-012 — Historical Consistency Preservation

> **Adopted 2026-06-29. Applies to all products with historical contradictions or documentation drift.**

### The Rule

Historical consistency must be preserved across all governance artifacts. No contradiction, supersession, or timeline entry may be deleted or rewritten without a Governance Decision.

### Gates

| Gate | Check | Target |
|------|-------|--------|
| HC-01 | Historical Contradictions documented | Every contradiction has an HC-ID, status, resolution, and DEC ref |
| HC-02 | Supersession Integrity | No deleted history — `SupersededBy` links preserved |
| HC-03 | Timeline Preservation | Full timeline rebuildable from governance logs + decisions |
| HC-04 | Documentation Synchronization | After any decision: MASTER_REFERENCE, PRODUCT_STATUS_MATRIX, Registry, Manifest, Dossier must match |

---

## 10g. Governance Rule GR-013 — Governance Conflict Preservation

> **Adopted 2026-06-29. Applies to all products with dimensional conflicts (different L-levels across dimensions).**

### The Rule

When facts conflict because they belong to different dimensions (Implementation Reality vs Product Maturity vs Commercial Claim vs Strategic Intent), ALL conflicting facts must be preserved as independent evidence until a Governance Decision resolves the conflict. No fact may be dropped, merged, or edited to create false consistency.

### Gates

| Gate | Check | Target |
|------|-------|--------|
| GC-01 | All dimensional conflicts documented as GCE items | Every conflict has a GCE-ID |
| GC-02 | No dimensional fact dropped | All conflicting facts preserved |
| GC-03 | Conflict resolution deferred to Governance Decision | No pre-emptive resolution in P1–P6 |
| GC-04 | GR-013 compliance visible in Dossier | Dossier explicitly lists all dimensional conflicts |

---

## 10h. Automation Gate — ADR-001

**ADR-001 (Version vs Immutable IDs)** must be resolved BEFORE any automated tooling (database, knowledge graph, CI gate):

| Scenario | Phase B (current) | Sprint v2 | Post-Automation |
|----------|-------------------|-----------|-----------------|
| Manual population | ✅ Allowed | ✅ Allowed | N/A |
| Database/Graph | ❌ Not needed | ❌ Not needed | ⛔ Blocked until ADR-001 resolved |
| Auto-generation | ❌ Not needed | ⚠️ Manifests/Dossiers follow Derived Artifacts Rule | ⛔ Blocked until ADR-001 resolved |
| CI Governance Gate | ❌ Not needed | ❌ Not needed | ⛔ Blocked until ADR-001 resolved |

**Manual population is unrestricted.** All Sprint v2 work can proceed without ADR-001 resolution.

---

## 11. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Evidence collection is too shallow (only T1, missing T2–T6) | Medium | High — brief would be incomplete | Explicit tier checklist per product |
| Rubric still ambiguous after refinement | Medium | Medium — review would need more iterations | Include edge case examples in rubric |
| Dossiers become too long to be useful | Low | Low — brief must be concise | Dossiers are appendices; brief is the decision document |
| Governance Review takes too long | Low | Medium — Wave 3B delayed | Time-box the review; unresolved items stay frozen |
| New contradictions found during evidence collection | Medium | Low — brief can surface them as open questions | Sprint v2 surfaces everything |
| Strategic Intent conflicts with T1–T7 evidence | Medium | High — code says L5, business says Deferred | Brief must present both facts clearly; Governance Review decides |
| Evidence Producer oversteps into Strategic Intent | Low | Medium — blurring evidence with business decision | Explicit constraint: Strategic Intent is NOT collected from code; it is an executive input |
| Assessment Confidence is inconsistent across manifests | Medium | Medium — Governance Review cannot compare products fairly | Confidence rubric must be applied consistently (see CLAIM_REGISTRY.md §3) |
| Evidence expires before Governance Review completes | Low | Medium — manifests become stale during Sprint v3 | Evidence Freshness Report tracks all expiry dates; flag at Sprint v3 start |
| ADR-001 unresolved when automation starts | Medium | High — Version vs New ID ambiguity breaks automated tools | ADR-001 resolution is a prerequisite gate before any automation; Sprint v2 manual work is unaffected |

---

## References

- `docs/governance/aqliya-knowledge-governance-charter-v1.md` — D0 Charter
- `docs/governance/WAVE3_CHANGE_PLAN.md` — Change plan with frozen/non-frozen split
- `docs/governance/CLAIM_REGISTRY.md` — Claim registry with four-dimension model + Assessment Confidence + Evidence Freshness
- `docs/governance/MILESTONE_M1.md` — M1 checkpoint (accepted 2026-06-29)
- `docs/reports/ARCHITECTURE_VERIFICATION_REPORT.md` — Sprint v1 Package C
- `docs/governance/GLOSSARY_GAP_ANALYSIS.md` — Glossary audit with stale entries
- `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` — Current product status authority
- `AGENTS.md §21` — L0–L6 rubric and DoD per product
