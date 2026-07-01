# AQLIYA Product & Commercial Docs Structure Review

**Date:** 2026-05-16
**Task:** Documentation structure review — product, commercial, systems, pilot, and reports directories.

---

## 1. Executive Summary

| Metric | Count |
|--------|-------|
| Directories reviewed | 17 |
| Total files reviewed | ~150 |
| Main documentation clusters found | 6 (AuditOS, DecisionOS, LocalContentOS, SalesOS, SimulationOS, GovernanceOS) |
| Duplicates / overlaps found | **11** (critical overlap: 3 concurrent pilot success criteria + 3 client onboarding checklists) |
| High-risk conflicts found | **0** (no brand term conflicts detected in reviewed directories) |
| Recommended cleanup approach | Phase-based: Index Pass → Archive superseded duplicates → Consolidate commercial → Normalize product folders |

### Key Findings Summary

1. **Major overlap cluster:** Pilot commercial content exists in **3 parallel locations** (`docs/commercial-pack/`, `docs/commercial/pilot-pack/`, `docs/pilot/execution-pack/`) with substantial duplication of onboarding checklists, success criteria, and required files lists.
2. **Demo storyline duplication:** The demo script exists in `docs/commercial/demo-storyline/` (modular), `docs/commercial/demo-storyline-auditos.md` (single file), and `docs/pilot/CLIENT-DEMO-SCRIPT.md` (different version).
3. **Product docs are AuditOS-heavy:** 19 of 23 files in `docs/product/` are AuditOS-specific; the other 4 products each have a single definition pack.
4. **Systems docs uneven:** DecisionOS has 15 files (detailed architecture); AuditOS, LocalContentOS, SalesOS, SimulationOS each have only a README.
5. **No brand conflicts found** across reviewed directories — the legacy `Mind The Future` term has been fully cleaned.
6. **No claim severity found** across reviewed directories — conservative language maintained.

---

## 2. Directory Map

| Directory | Purpose | Current Status | Notes |
|-----------|---------|----------------|-------|
| `docs/product/` | Product definitions, commercial assets, sales ops, pilot management, proof system, market proof | Active — AuditOS-heavy | 23 entries, 19 for AuditOS. Contains both product definition and commercial operations. |
| `docs/commercial/` | Client-facing commercial assets (demo storyline, pilot pack) | Active — small | Contains `demo-storyline/` (7-file modular), `demo-storyline-auditos.md` (single-file), `pilot-pack/` (10 files). |
| `docs/commercial-pack/` | Complete pilot commercial pack (offer, scope, checklists) | Active — overlaps with commercial/pilot-pack | 13 files with README index. 90% overlap with `docs/commercial/pilot-pack/`. |
| `docs/systems/` | Operator manuals, architecture docs, system specs | Active — DecisionOS-heavy | AuditOS has operator manual + README; DecisionOS has 15 files; others have README only. |
| `docs/pilot/` | Pilot session reports, execution packs, demo assets | Active — mixed | 32 entries. Contains pilot execution pack, session reports, dry-run docs, and dataset files. |
| `docs/reports/` | Stabilization, audit, QA, documentation reports | Active — well-structured | 4 subdirectories with README index. `qa/` is empty. |

### Classification

| Directory | Classification |
|-----------|---------------|
| `docs/product/` | Active product docs + commercial assets + sales operations |
| `docs/product/auditos-commercial-assets/` | Commercial assets |
| `docs/product/auditos-outbound-kit/` | Sales operations |
| `docs/product/auditos-sales-ops/` | Sales operations |
| `docs/product/auditos-first-customer-loop/` | Pilot operations |
| `docs/product/auditos-live-pilot-management/` | Pilot operations |
| `docs/product/auditos-market-proof-system/` | Market proof |
| `docs/product/auditos-customer-conversion-reference/` | Commercial assets |
| `docs/commercial/` | Commercial assets |
| `docs/commercial/demo-storyline/` | Commercial assets |
| `docs/commercial/pilot-pack/` | Commercial assets — overlaps with `docs/commercial-pack/` |
| `docs/commercial-pack/` | Commercial assets — superset of `docs/commercial/pilot-pack/` |
| `docs/systems/AUDITOS_OPERATOR_MANUAL.md` | System/operator docs |
| `docs/systems/auditos/` | System/operator docs (README only) |
| `docs/systems/decisionos/` | System/operator docs (detailed) |
| `docs/systems/local-content-os/` | System/operator docs (README only) |
| `docs/systems/salesos/` | System/operator docs (README only) |
| `docs/systems/simulationos/` | System/operator docs (README only) |
| `docs/pilot/execution-pack/` | Pilot operations |
| `docs/pilot/controlled-execution/` | Pilot operations (historical) |
| `docs/pilot/dry-run/` | Pilot operations (historical) |
| `docs/pilot/session-reports/` | Pilot operations (historical) |
| `docs/pilot/runs/` | Pilot operations (historical) |
| `docs/reports/stabilization/` | QA/reporting (completed/stabilization closed) |
| `docs/reports/audits/` | QA/reporting |
| `docs/reports/documentation/` | QA/reporting |
| `docs/reports/qa/` | QA/reporting (empty — placeholder) |

---

## 3. Product Documentation Clusters

### AuditOS

| Product | File / Directory | Type | Status | Keep / Consolidate / Archive Candidate | Notes |
|---------|-----------------|------|--------|---------------------------------------|-------|
| AuditOS | `docs/product/auditos-product-packaging.md` | Product foundation | Active | Keep — central product definition | Source of truth for positioning |
| AuditOS | `docs/product/auditos-mvp-prd.md` | Product foundation | Active | Keep — PRD | 850 lines, detailed spec |
| AuditOS | `docs/product/auditos-mvp-architecture-spec.md` | Product foundation | Active | Keep — architecture | Technical architecture |
| AuditOS | `docs/product/auditos-technical-baseline.md` | Product foundation | Active | Keep — technical baseline | |
| AuditOS | `docs/product/auditos-phase-1-completion.md` | Release/readiness | Historical | Archive candidate | Phase 1 completed |
| AuditOS | `docs/product/auditos-phase-2-plan.md` | Release/readiness | Historical | Archive candidate | Phase 2 plan, superseded by current state |
| AuditOS | `docs/product/auditos-demo-dataset.md` | Commercial | Active | Consolidate candidate | Dataset info |
| AuditOS | `docs/product/auditos-pilot-demo-flow-v1.md` | Technical | Historical | Archive candidate | v1, now source code is built |
| AuditOS | `docs/product/auditos-reviewer-workflow-v1.md` | Technical | Historical | Archive candidate | v1 workflow spec |
| AuditOS | `docs/product/auditos-notes-engine-v1.md` | Technical | Historical | Archive candidate | v1 notes engine spec |
| AuditOS | `docs/product/auditos-commercial-operating-system.md` | Commercial | Active | Keep — central commercial ops doc | Commercial operating system reference |
| AuditOS | `docs/product/auditos-commercial-assets/` | Commercial | Active | Consolidate candidate — merge into commercial index | Contains demo-script, ICP, objection handling, one-pager, sales deck |
| AuditOS | `docs/product/auditos-outbound-kit/` | Sales operations | Active | Consolidate candidate — move to commercial | Outbound templates, demo scripts |
| AuditOS | `docs/product/auditos-sales-ops/` | Sales operations | Active | Consolidate candidate — move to commercial | CRM fields, deal stages, pipeline review |
| AuditOS | `docs/product/auditos-first-customer-loop/` | Pilot operations | Active | Consolidate candidate — move to pilot or commercial/pilot | Customer journey, conversion |
| AuditOS | `docs/product/auditos-live-pilot-management/` | Pilot operations | Active | Consolidate candidate — move to pilot | Pilot management trackers |
| AuditOS | `docs/product/auditos-customer-conversion-reference/` | Commercial | Active | Consolidate candidate — move to commercial | Conversion materials |
| AuditOS | `docs/product/auditos-market-proof-system/` | Market proof | Active | Keep — proof/market system | |
| AuditOS | `docs/product/aqliya-product-comparison-and-recommendation.md` | Comparison | Active | Keep — cross-product comparison | Compares all products |
| AuditOS | `docs/systems/AUDITOS_OPERATOR_MANUAL.md` | Operator manual | Active | Keep — move under systems/auditos/ | Operator manual at root of systems/ |
| AuditOS | `docs/systems/auditos/README.md` | System docs | Active | Keep — expand with operator manual link | Currently just README |

### DecisionOS

| Product | File / Directory | Type | Status | Keep / Consolidate / Archive Candidate | Notes |
|---------|-----------------|------|--------|---------------------------------------|-------|
| DecisionOS | `docs/product/decisionos-product-definition-pack.md` | Product foundation | Active | Keep — product definition | 366 lines |
| DecisionOS | `docs/systems/decisionos/README.md` | System docs | Active | Keep | 14 sibling files |
| DecisionOS | `docs/systems/decisionos/decisionos-core-engine.md` | System/architecture | Active | Keep | |
| DecisionOS | `docs/systems/decisionos/decisionos-architecture-report.md` | System/architecture | Active | Keep | |
| DecisionOS | `docs/systems/decisionos/decision-timeline-export.md` | System | Active | Keep | |
| DecisionOS | `docs/systems/decisionos/decisionos-approval-snapshot.md` | System | Active | Keep | |
| DecisionOS | `docs/systems/decisionos/decisionos-data-driven-scoring.md` | System | Active | Keep | |
| DecisionOS | `docs/systems/decisionos/decisionos-generic-recommendation-engine.md` | System | Active | Keep | |
| DecisionOS | `docs/systems/decisionos/decisionos-generic-simulation-engine.md` | System | Active | Keep | |
| DecisionOS | `docs/systems/decisionos/decisionos-inputs-ux.md` | System | Active | Keep | |
| DecisionOS | `docs/systems/decisionos/decisionos-publishing-policy.md` | System | Active | Keep | |
| DecisionOS | `docs/systems/decisionos/decisionos-review-approval-layer.md` | System | Active | Keep | |
| DecisionOS | `docs/systems/decisionos/decisionos-scenario-architecture.md` | System | Active | Keep | |
| DecisionOS | `docs/systems/decisionos/decisionos-templates.md` | System | Active | Keep | |
| DecisionOS | `docs/systems/decisionos/decision-creation-stabilization-report.md` | Report | Active | Keep | |
| DecisionOS | `docs/systems/decisionos/decision-engine-abstraction-report.md` | Report | Active | Keep | |

### LocalContentOS

| Product | File / Directory | Type | Status | Keep / Consolidate / Archive Candidate | Notes |
|---------|-----------------|------|--------|---------------------------------------|-------|
| LocalContentOS | `docs/product/` (no dedicated file) | — | Missing | Needs product definition | No product file found in product/ |
| LocalContentOS | `docs/systems/local-content-os/README.md` | System docs | Active | Keep | Just README placeholder |

### SalesOS

| Product | File / Directory | Type | Status | Keep / Consolidate / Archive Candidate | Notes |
|---------|-----------------|------|--------|---------------------------------------|-------|
| SalesOS | `docs/product/salesos-product-definition-pack.md` | Product foundation | Active | Keep — product definition | 312 lines |
| SalesOS | `docs/systems/salesos/README.md` | System docs | Active | Keep | Just README placeholder |

### SimulationOS

| Product | File / Directory | Type | Status | Keep / Consolidate / Archive Candidate | Notes |
|---------|-----------------|------|--------|---------------------------------------|-------|
| SimulationOS | `docs/product/simulationos-product-definition-pack.md` | Product foundation | Active | Keep — product definition | 360 lines |
| SimulationOS | `docs/systems/simulationos/README.md` | System docs | Active | Keep | Just README placeholder |

### GovernanceOS

| Product | File / Directory | Type | Status | Keep / Consolidate / Archive Candidate | Notes |
|---------|-----------------|------|--------|---------------------------------------|-------|
| GovernanceOS | `docs/product/governanceos-product-definition-pack.md` | Product foundation | Active | Keep — product definition | 298 lines. Note: GovernanceOS is a shared platform layer, not a separate product. |
| GovernanceOS | `docs/systems/` | System docs | Missing | Needs system folder | No systems/governanceos/ directory exists |

---

## 4. Commercial Documentation Review

### Current Commercial Locations

| Location | Contents | Status |
|----------|----------|--------|
| `docs/commercial/demo-storyline-auditos.md` | Complete AuditOS demo storyline (single file, 511 lines, moved from root by cleanup Phase 1) | Active — comprehensive |
| `docs/commercial/demo-storyline/` | Modular demo storyline split into 7 files (opening pitch, pain statement, demo flow, screen script, questions, objections, closing) | Active — modular alternative |
| `docs/commercial/pilot-pack/` | 10-file pilot commercial pack (offer, scope, checklists, messages) | Active — duplicates commercial-pack |
| `docs/commercial-pack/` | 13-file pilot commercial pack with README index (superset of pilot-pack) | Active — recommended as source |
| `docs/product/auditos-commercial-assets/` | 5 files: demo script, ICP messaging, objection handling, one-pager, sales deck outline | Active — overlaps with commercial/ |
| `docs/product/auditos-outbound-kit/` | 7 files: discovery questions, 5-min/15-min demo, follow-up templates, founder pitch, email/SMS templates | Active — sales ops |
| `docs/product/auditos-sales-ops/` | 10 files: CRM fields, deal stages, lead status, pipeline review, scoring sheet, proposal template | Active — sales ops |
| `docs/product/auditos-customer-conversion-reference/` | 7 files: objection handling, proof library, case study pack, conversion offer, extension framework, reference kit, renewal signals | Active — commercial |

### Overlap Assessment

| Topic | Files Involved | Count | Recommendation |
|-------|---------------|-------|---------------|
| **Demo storyline** | `docs/commercial/demo-storyline-auditos.md`, `docs/commercial/demo-storyline/` (7 files), `docs/pilot/CLIENT-DEMO-SCRIPT.md`, `docs/product/auditos-commercial-assets/demo-script.md` | 4 variants | Consolidate to single source: `docs/commercial/demo-storyline/` (modular). Archive or link others. |
| **Pilot offer/scope** | `docs/commercial-pack/01-pilot-offer-onepager.md`, `docs/commercial-pack/02-pilot-scope-document.md`, `docs/commercial/pilot-pack/01-offer-one-pager.md`, `docs/commercial/pilot-pack/02-scope-of-pilot.md` | 4 files across 2 dirs | Consolidate to `docs/commercial-pack/` as source. Archive `docs/commercial/pilot-pack/`. |
| **Client onboarding checklist** | `docs/commercial-pack/03-client-onboarding-checklist.md`, `docs/commercial/pilot-pack/04-client-onboarding-checklist.md`, `docs/pilot/execution-pack/02-customer-onboarding-checklist.md` | 3 files | Consolidate to single checklist. Each has different emphasis (customer-facing vs internal). |
| **Required files / data checklist** | `docs/commercial-pack/04-required-data-files-checklist.md`, `docs/commercial/pilot-pack/03-required-files-checklist.md`, `docs/pilot/execution-pack/01-trial-balance-intake-checklist.md` | 3 files | Consolidate. TB intake checks differ from required files list. |
| **Pilot success criteria** | `docs/commercial-pack/07-pilot-success-criteria.md`, `docs/commercial/pilot-pack/05-success-criteria.md`, `docs/pilot/execution-pack/09-pilot-success-criteria.md`, `docs/pilot/PILOT-SUCCESS-CRITERIA.md` | 4 files across 3 dirs | **Highest overlap.** Consolidate to single source. |
| **Objection handling** | `docs/product/auditos-commercial-assets/objection-handling.md`, `docs/product/auditos-customer-conversion-reference/conversion-objection-handling.md`, `docs/commercial/demo-storyline/06-objections-and-responses.md` | 3 files | Consolidate or link from master commercial index. |
| **Post-pilot conversion** | `docs/commercial-pack/10-post-pilot-conversion-plan.md`, `docs/commercial/pilot-pack/08-post-pilot-conversion-plan.md`, `docs/pilot/execution-pack/10-post-pilot-review-memo.md`, `docs/product/auditos-first-customer-loop/pilot-to-paid-conversion-memo.md` | 4 files | Consolidate conversion plan under commercial-pack. |

---

## 5. Duplicate / Overlap Detection

| Topic | Files Involved | Overlap Type | Risk | Recommendation |
|-------|---------------|-------------|------|---------------|
| Pilot success criteria | 4 files across 3 dirs | Direct duplicate — different versions | Medium — conflicting criteria could confuse pilot evaluation | Consolidate to `docs/commercial-pack/07-pilot-success-criteria.md` as source |
| Client onboarding | 3 files across 3 dirs | Semantic duplicate | Low — different audiences (internal vs customer) | Keep both but add cross-references |
| Demo storyline | 4 variants across 2 dirs | Content overlap — different granularity | Medium — maintenance burden, risk of drift | Keep modular `docs/commercial/demo-storyline/` as source; link from others |
| Pilot pack offers | 2 parallel dirs | Direct duplicate | Medium — identical purpose, different details | Archive `docs/commercial/pilot-pack/`, keep `docs/commercial-pack/` |
| Objection handling | 3 files | Content overlap | Low — different contexts | Keep but index in commercial README |
| Post-pilot conversion | 4 files | Semantic duplicate | Medium — conversion path risks inconsistency | Consolidate under commercial-pack |
| Trial balance requirements | 3 files | Content overlap — different emphasis | Low | Keep distinct purposes (internal QA vs customer-facing) |
| AuditOS pilot demo flow v1 | `docs/product/auditos-pilot-demo-flow-v1.md` | Historical technical spec | Low — already implemented in code | Archive candidate |
| AuditOS reviewer workflow v1 | `docs/product/auditos-reviewer-workflow-v1.md` | Historical technical spec | Low — already implemented | Archive candidate |
| AuditOS notes engine v1 | `docs/product/auditos-notes-engine-v1.md` | Historical technical spec | Low — already implemented | Archive candidate |
| Phase 1/2 plans | `docs/product/auditos-phase-1-completion.md`, `auditos-phase-2-plan.md` | Historical | Low — superseded by current state | Archive candidate |

---

## 6. Conflict Detection

No brand conflicts (`Mind The Future`) were detected in any reviewed directories. The legacy term has been fully cleaned from active docs.

### Term Scan Results

| Term | Status | Severity | Notes |
|------|--------|----------|-------|
| `Mind The Future` | Not found in reviewed dirs | Historical/no action | Already cleaned in commit `ac00dde` |
| `AQLIYA AuditOS` | Used consistently | No conflict | Correct branding |
| `AQLIYA SalesOS` | Used consistently | No conflict | |
| `AQLIYA DecisionOS` | Used consistently | No conflict | |
| `On-Prem` | Found (architecture spec only — Docker/Single VM) | Low — technical context | `auditos-mvp-architecture-spec.md` line 134 — acceptable technical context |
| `Air-Gapped` | Not found | No action | |
| `Docker` | Found (technical architecture only) | Low — technical context | Acceptable in architecture docs |
| `Kubernetes` | Not found | No action | |
| `Local AI` | Not found | No action | |
| `Studio` | Found (Prisma Studio references only) | Low — operational tooling | Acceptable in operator manual |
| `SAMA` | Not found | No action | |
| `PDPL` | Not found | No action | |
| `SOC 2` | Not found | No action | |
| `Azure` | Not found | No action | |
| `production-ready` | Not found | No action | |
| `ready now` | Not found | No action | |
| `active development` | Not found | No action | |
| `%` / `70` / `80` | Found (success criteria thresholds only) | Low — acceptable | Used in pilot success criteria as measurable targets |
| `real-time` | Found (product definition packs — DecisionOS, SimulationOS, GovernanceOS) | Medium — aspirational language | 9 occurrences in product definition packs (Phase 2 items, not current claims) |
| `continuous audit` | Not found | No action | |
| `KYC` / `AML` | Not found | No action | |

### Medium-Severity Findings

| File | Term / Claim | Context | Severity | Recommendation |
|------|-------------|---------|----------|---------------|
| `governanceos-product-definition-pack.md` | `real-time` | "compliance status is a real-time system state" | Medium — aspirational | Acceptable as product vision (not current state). Monitor for drift in customer-facing docs. |
| `decisionos-product-definition-pack.md` | `real-time` | "Collaborative real-time editing" (listed as Phase 2) | Low | Explicitly marked as Phase 2, not current. No action. |
| `simulationos-product-definition-pack.md` | `real-time` | "Collaborative real-time simulation" (listed as Phase 2) | Low | Explicitly marked as Phase 2, not current. No action. |

---

## 7. Recommended Target Structure

### Proposed Structure

```
docs/
  product/
    auditos/
      product-packaging.md          ← from docs/product/auditos-product-packaging.md
      mvp-prd.md                    ← from docs/product/auditos-mvp-prd.md
      mvp-architecture-spec.md      ← from docs/product/auditos-mvp-architecture-spec.md
      technical-baseline.md         ← from docs/product/auditos-technical-baseline.md
      demo-dataset.md               ← from docs/product/auditos-demo-dataset.md
      commercial-operating-system.md ← from docs/product/auditos-commercial-operating-system.md
      comparative-analysis.md       ← from docs/product/aqliya-product-comparison-and-recommendation.md
    decisionos/
      product-definition-pack.md    ← from docs/product/decisionos-product-definition-pack.md
    localcontentos/
      product-definition-pack.md    ← (needs creation)
    salesos/
      product-definition-pack.md    ← from docs/product/salesos-product-definition-pack.md
    simulationos/
      product-definition-pack.md    ← from docs/product/simulationos-product-definition-pack.md
    governanceos/
      product-definition-pack.md    ← from docs/product/governanceos-product-definition-pack.md
    custom-systems/
      README.md
  commercial/
    README.md                       ← master commercial index
    auditos/
      demo-storyline/               ← from docs/commercial/demo-storyline/
      outbound-kit/                 ← from docs/product/auditos-outbound-kit/
      sales-ops/                    ← from docs/product/auditos-sales-ops/
      commercial-assets/            ← from docs/product/auditos-commercial-assets/
      customer-conversion/          ← from docs/product/auditos-customer-conversion-reference/
      market-proof/                 ← from docs/product/auditos-market-proof-system/
    pilot-pack/                     ← from docs/commercial-pack/ (single source)
  systems/
    auditos/
      operator-manual.md            ← from docs/systems/AUDITOS_OPERATOR_MANUAL.md
      README.md
    decisionos/                     ← keep as-is (15 files)
    local-content-os/               ← keep as-is (README)
    salesos/                        ← keep as-is (README)
    simulationos/                   ← keep as-is (README)
    governanceos/                   ← create folder
  pilot/
    execution-pack/                 ← keep as-is
    datasets/                       ← keep as-is
    reports/                        ← session reports, run reports
    controlled-execution/           ← archive candidate
    dry-run/                        ← archive candidate
  reports/                          ← keep as-is
```

### Proposed Moves (no implementation)

| Current Path | Proposed Path | Reason | Risk | Safe to Move Later? |
|-------------|---------------|--------|------|---------------------|
| `docs/product/auditos-commercial-assets/` | `docs/commercial/auditos/commercial-assets/` | Commercial assets belong under commercial/ | Low — no source code references | Yes |
| `docs/product/auditos-outbound-kit/` | `docs/commercial/auditos/outbound-kit/` | Sales outbound belongs under commercial/ | Low — no source code references | Yes |
| `docs/product/auditos-sales-ops/` | `docs/commercial/auditos/sales-ops/` | Sales operations belong under commercial/ | Low — no source code references | Yes |
| `docs/product/auditos-first-customer-loop/` | `docs/pilot/first-customer-loop/` | Pilot operations belong under pilot/ | Low — no source code references | Yes |
| `docs/product/auditos-live-pilot-management/` | `docs/pilot/live-pilot-management/` | Pilot management belongs under pilot/ | Low — no source code references | Yes |
| `docs/product/auditos-customer-conversion-reference/` | `docs/commercial/auditos/customer-conversion/` | Conversion materials are commercial | Low — no source code references | Yes |
| `docs/product/auditos-market-proof-system/` | `docs/commercial/auditos/market-proof/` | Market proof is commercial | Low — no source code references | Yes |
| `docs/product/auditos-product-packaging.md` | `docs/product/auditos/product-packaging.md` | Normalize product folder | Low — check internal cross-references | Yes (check product definition packs for links) |
| `docs/product/auditos-mvp-prd.md` | `docs/product/auditos/mvp-prd.md` | Normalize product folder | Low — no source code references | Yes |
| `docs/product/auditos-mvp-architecture-spec.md` | `docs/product/auditos/mvp-architecture-spec.md` | Normalize product folder | Low — no source code references | Yes |
| `docs/product/auditos-technical-baseline.md` | `docs/product/auditos/technical-baseline.md` | Normalize product folder | Low | Yes |
| `docs/product/auditos-demo-dataset.md` | `docs/product/auditos/demo-dataset.md` | Normalize product folder | Low | Yes |
| `docs/product/auditos-commercial-operating-system.md` | `docs/product/auditos/commercial-operating-system.md` | Normalize product folder | Low | Yes |
| `docs/product/aqliya-product-comparison-and-recommendation.md` | `docs/product/auditos/comparative-analysis.md` | Normalize product folder | Low — check cross-references | Yes |
| `docs/product/decisionos-product-definition-pack.md` | `docs/product/decisionos/product-definition-pack.md` | Normalize product folder | Low — check cross-references | Yes |
| `docs/product/salesos-product-definition-pack.md` | `docs/product/salesos/product-definition-pack.md` | Normalize product folder | Low — check cross-references | Yes |
| `docs/product/simulationos-product-definition-pack.md` | `docs/product/simulationos/product-definition-pack.md` | Normalize product folder | Low — check cross-references | Yes |
| `docs/product/governanceos-product-definition-pack.md` | `docs/product/governanceos/product-definition-pack.md` | Normalize product folder | Low — check cross-references | Yes |
| `docs/commercial/demo-storyline-auditos.md` | `docs/commercial/auditos/demo-storyline.md` (or remove) | Duplicate of modular demo-storyline/ | Low | Yes — or delete if modular version is source |
| `docs/commercial/pilot-pack/` | `docs/archive/commercial/pilot-pack/` | Superseded by docs/commercial-pack/ | Low | Yes |
| `docs/systems/AUDITOS_OPERATOR_MANUAL.md` | `docs/systems/auditos/operator-manual.md` | Normalize under product system folder | Low — check internal links | Yes |
| `docs/product/auditos-phase-1-completion.md` | `docs/archive/product/` (or delete) | Historical — completed | None | Yes |
| `docs/product/auditos-phase-2-plan.md` | `docs/archive/product/` (or delete) | Historical — superseded | None | Yes |

---

## 8. Recommended Cleanup Phases

### Phase A — Add Indexes Only (Safest Next Step)

Create README/index files for major directories without moving anything:

1. Create `docs/commercial/README.md` — list all commercial assets across directories with cross-references
2. Create `docs/product/README.md` — list all product docs grouped by product
3. Create `docs/pilot/execution-pack/README.md` — already exists, update with cross-reference to commercial-pack
4. Create `docs/product/auditos/README.md` — placeholder for future normalization

**Risk:** None — only adding index files, not moving anything.

### Phase B — Archive Superseded Duplicates

After approval, move these to `docs/archive/`:

1. `docs/commercial/pilot-pack/` → `docs/archive/commercial/pilot-pack/`
2. `docs/product/auditos-phase-1-completion.md` → `docs/archive/product/`
3. `docs/product/auditos-phase-2-plan.md` → `docs/archive/product/`
4. `docs/product/auditos-pilot-demo-flow-v1.md` → `docs/archive/product/`
5. `docs/product/auditos-reviewer-workflow-v1.md` → `docs/archive/product/`
6. `docs/product/auditos-notes-engine-v1.md` → `docs/archive/product/`

**Risk:** Low — all historical/superseded content.

### Phase C — Consolidate AuditOS Commercial Docs

1. Decide which pilot pack is the source (`docs/commercial-pack/` recommended — more complete)
2. Archive `docs/commercial/pilot-pack/`
3. Create `docs/commercial/README.md` with links to all commercial asset locations
4. Decide which demo storyline is the source (`docs/commercial/demo-storyline/` modular recommended)
5. Link or remove `docs/commercial/demo-storyline-auditos.md`

**Risk:** Medium — requires internal agreement on source of truth.

### Phase D — Product Folder Normalization

Move product-specific files into product subdirectories:
- `docs/product/auditos/`
- `docs/product/decisionos/`
- `docs/product/localcontentos/`
- `docs/product/salesos/`
- `docs/product/simulationos/`
- `docs/product/governanceos/`
- `docs/product/custom-systems/`

**Risk:** Low-Medium — check internal cross-references between product definition packs.

### Phase E — Link Validation

After all moves, check:
1. Internal links in README files
2. Cross-references between product definition packs
3. References in `docs/DOCUMENTATION_GOVERNANCE.md`
4. References in `docs/DOCUMENTATION_INVENTORY.md`

**Risk:** Low — documentation-only links.

---

## 9. Immediate Next Action

**`AQLIYA Docs Index Pass — Add READMEs Without Moving Files`**

This is the safest next step because:
- No files moved or deleted
- No content changed
- Creates navigation structure that makes current layout usable
- Prepares for future consolidation by documenting what exists where

After the Index Pass, the decision is:
- **If clean:** Proceed to **Phase B — Archive superseded duplicates**
- **If risky:** Roll back index files and reconsider approach

```txt
Created:
- docs/reports/product-commercial-docs-structure-review.md

Source code changed: No

Reviewed:
- directories: 17
- files: ~150

Key findings:
- 11 duplicates/overlaps detected across pilot commercial docs (highest: 4 parallel pilot success criteria)
- No brand conflicts found (Mind The Future fully cleaned)
- No high-risk claim conflicts in commercial docs
- Product docs are AuditOS-heavy; DecisionOS has detailed systems docs; other products have minimal docs
- `docs/commercial/pilot-pack/` and `docs/commercial-pack/` are near-duplicate directories
- Demo storyline exists in 4 variants

High-risk conflicts: None

Recommended next task:
- AQLIYA Docs Index Pass — Add READMEs Without Moving Files
```
