# AuditOS Commercial Documentation Consolidation Plan

**Date:** 2026-05-16
**Task:** Choose primary AuditOS commercial set — analysis and decision plan only.

---

## 1. Executive Summary

| Metric | Count |
|--------|-------|
| Commercial docs/directories reviewed | 14 (9 product subdirectories + 3 commercial dirs + 2 pilot dirs) |
| Main overlap areas | **4**: Pilot packs, demo storylines, success criteria, client messages |
| Recommended primary commercial set | `docs/product/auditos-commercial-operating-system.md` as master + 8 supporting packages under `docs/product/auditos-*` |
| Archive candidates | `docs/commercial/pilot-pack/` (superseded by `docs/commercial-pack/`), `docs/commercial/demo-storyline-auditos.md` (superseded by modular version) |
| Docs to preserve as historical/reference | `docs/pilot/PILOT-SUCCESS-CRITERIA.md`, `docs/pilot/execution-pack/09-pilot-success-criteria.md` |
| Docs requiring future merge | All 4 pilot success criteria files → single canonical source |

### Key Decision

The primary AuditOS commercial set is already well-defined in `docs/product/auditos-commercial-operating-system.md`, which explicitly lists 10 commercial stages and links to 8 supporting package directories. The problem is **not missing structure** — it is **parallel duplicate packs** in `docs/commercial/` and `docs/commercial-pack/` that are not linked from the primary set.

---

## 2. Commercial Source Candidates

| Path | Current Role | Strength | Weakness / Overlap | Recommended Status |
|------|-------------|----------|-------------------|-------------------|
| `docs/product/auditos-commercial-operating-system.md` | Master commercial ops document (507 lines) | Explicitly references all 8 commercial packages; defines stages, roles, and usage order; bilingual | Does not reference `docs/commercial/` or `docs/commercial-pack/` at all | **Primary** |
| `docs/product/auditos-commercial-assets/` | Commercial assets (one-pager, demo script, ICP, objection handling, sales deck) | Well-structured; each file has clear purpose | Overlaps with `docs/commercial/demo-storyline/` (demo script) | **Supporting** — referenced by primary |
| `docs/product/auditos-outbound-kit/` | Outbound templates (emails, WhatsApp, discovery, pitches, demo variants) | Practical templates for every outreach stage | Some demo content overlaps with commercial-assets/demo-script.md | **Supporting** — referenced by primary |
| `docs/product/auditos-sales-ops/` | Sales operations (CRM fields, deal stages, pipeline review, scoring) | Operational detail not found elsewhere | No direct overlap | **Supporting** — referenced by primary |
| `docs/product/auditos-first-customer-loop/` | First customer operating rules, conversion memo | Unique operational guidance | Partial overlap with commercial-pack/post-pilot-conversion | **Supporting** — referenced by primary |
| `docs/product/auditos-live-pilot-management/` | Pilot trackers, issue register, success review | Unique operational tools | Overlaps with `docs/commercial-pack/` and `docs/pilot/execution-pack/` | **Supporting** — referenced by primary |
| `docs/product/auditos-customer-conversion-reference/` | Objection handling, proof library, conversion offer, reference kit | Unique conversion-stage materials | Objection handling overlaps with commercial-assets/ and demo-storyline/ | **Supporting** — referenced by primary |
| `docs/product/auditos-market-proof-system/` | Case study workflow, proof index, reference account program | Unique proof system | No direct overlap | **Supporting** — referenced by primary |
| `docs/commercial/` (root) | Demo storyline (modular + single-file), pilot pack | Clean structure for demo-storyline/ | Pilot pack duplicates `docs/commercial-pack/` | **Supporting** for demo-storyline; archive candidate for pilot-pack |
| `docs/commercial/demo-storyline/` | Modular demo storyline (7 files) | Best-structured demo narrative | Overlaps with `docs/commercial/demo-storyline-auditos.md` (single-file duplicate) | **Primary demo narrative** |
| `docs/commercial/demo-storyline-auditos.md` | Single-file demo storyline (511 lines, moved from root) | Comprehensive standalone script | Duplicate of modular `docs/commercial/demo-storyline/`; all content exists in modular form | **Archive candidate** (superseded by modular version) |
| `docs/commercial/pilot-pack/` | Pilot commercial pack (10 files, bilingual) | Good Arabic content | Near-duplicate of `docs/commercial-pack/` which is more complete (13 files vs 10) | **Archive candidate** |
| `docs/commercial-pack/` | Pilot commercial pack (13 files, bilingual) | More complete than pilot-pack; has README index; has client messages | Overlaps with product commercial packages (auditos-live-pilot-management, auditos-first-customer-loop) | **Keep as operational pack** — primary pilot commercial set |
| `docs/pilot/CLIENT-DEMO-SCRIPT.md` | Client demo walkthrough (377 lines, English) | Detailed technical walkthrough | Different audience (internal pilot execution vs external sales); overlaps with all demo variants | **Keep as operational template** — pilot execution internal use |
| `docs/pilot/PILOT-SUCCESS-CRITERIA.md` | Pilot success criteria (86 lines, English) | Functional/technical focus | Overlaps with 3 other success criteria files | **Historical/reference** |
| `docs/pilot/execution-pack/09-pilot-success-criteria.md` | Pilot execution success criteria (187 lines, English) | Decision framework + detailed criteria | Overlaps with 3 other success criteria files | **Keep as operational** — internal pilot QA |
| `docs/pilot/` (root README mentions) | Several demo assets | Session-specific content | CLIENT-DEMO-SCRIPT overlaps with commercial demo storylines | **Keep as operational** |

---

## 3. Recommended Primary Commercial Set

**Primary master document:** `docs/product/auditos-commercial-operating-system.md`

This file is already designed as the master operating document. It defines 10 stages and links to 8 supporting packages. The recommendation is to use it as-is and **add links from it to the commercial-pack and demo-storyline locations** that it currently does not reference.

**Supporting packages (already referenced by primary):**

| Package | Path | Purpose |
|---------|------|---------|
| Commercial Assets | `docs/product/auditos-commercial-assets/` | One-pager, demo script, ICP, objection handling, sales deck |
| Outbound Kit | `docs/product/auditos-outbound-kit/` | Emails, WhatsApp, discovery, pitches, demos |
| Sales Pipeline | *(Note: directory not found at expected path)* | May be integrated into sales-ops |
| Sales Ops | `docs/product/auditos-sales-ops/` | CRM fields, deal stages, pipeline review, proposal |
| Execution Environment | *(Note: directory not found at expected path)* | Referenced by commercial-operating-system as "integrated in sales-ops" |
| Live Pilot Management | `docs/product/auditos-live-pilot-management/` | Trackers, issue register, success review |
| First Customer Loop | `docs/product/auditos-first-customer-loop/` | Operating rules, conversion memo |
| Customer Conversion | `docs/product/auditos-customer-conversion-reference/` | Objection handling, proof library, reference kit |
| Market Proof | `docs/product/auditos-market-proof-system/` | Case study workflow, proof index |

**Note:** `auditos-sales-pipeline` and `auditos-execution-environment` directories do not exist on disk. The commercial-operating-system.md references them as stages 4 and 6, but they appear to be either conceptual stages or their content is merged into `auditos-sales-ops/`.

**Recommended additions to primary set:**
- Link to `docs/commercial/pilot-pack/` or `docs/commercial-pack/` from the commercial-operating-system.
- Link to `docs/commercial/demo-storyline/` as the canonical demo narrative.
- Link to `docs/pilot/execution-pack/` for internal pilot execution checklists.

---

## 4. Near-Duplicate Analysis: `commercial/pilot-pack` vs `commercial-pack`

| Topic | `commercial/pilot-pack` | `commercial-pack` | Product Commercial Docs | Recommendation |
|-------|------------------------|-------------------|------------------------|----------------|
| Pilot offer | `01-offer-one-pager.md` (57 lines) | `01-pilot-offer-onepager.md` (79 lines) | Referenced implicitly via commercial-operating-system | Primary: commercial-pack (more complete) |
| Pilot scope | `02-scope-of-pilot.md` | `02-pilot-scope-document.md` | — | Primary: commercial-pack |
| Client onboarding | `04-client-onboarding-checklist.md` (89 lines) | `03-client-onboarding-checklist.md` (60 lines) | `product/auditos-first-customer-loop/` has separate onboarding guidance | Both have different strengths; commercial-pack is more structured |
| Required files | `03-required-files-checklist.md` (97 lines) | `04-required-data-files-checklist.md` (80 lines) | — | Primary: commercial-pack (better structured) |
| TB submission | — (merged into required files) | `05-trial-balance-submission-requirements.md` (96 lines) | — | commercial-pack has dedicated TB doc |
| Evidence checklist | — | `06-evidence-request-checklist.md` | `product/auditos-live-pilot-management/pilot-evidence-checklist.md` | Merge later |
| Success criteria | `05-success-criteria.md` (86 lines) | `07-pilot-success-criteria.md` (99 lines, 5-axis) | 2 more variants in pilot/ | See section 6 |
| Timeline | — | `08-pilot-timeline.md` | — | commercial-pack has timeline |
| Roles | — | `09-roles-and-responsibilities.md` | — | commercial-pack has RACI |
| Post-pilot conversion | `08-post-pilot-conversion-plan.md` | `10-post-pilot-conversion-plan.md` | `product/auditos-first-customer-loop/pilot-to-paid-conversion-memo.md` | Merge into commercial-pack as primary |
| Client messages | `09-whatsapp-message.md`, `10-email-message.md` | `12-13-14-client-messages.md` (single file) | — | commercial-pack (single file, cleaner) |
| Risk disclosure | — | `11-risk-limitation-disclosure.md` | — | commercial-pack has risk disclosure |
| README index | No | **Yes** — with usage sequence | — | commercial-pack is better organized |

**Verdict:** `docs/commercial-pack/` is more current, more complete (13 files vs 10), has a README index, and includes risk disclosure and timeline that pilot-pack lacks. **Recommend archiving `docs/commercial/pilot-pack/`** and keeping `docs/commercial-pack/` as the primary pilot commercial operational pack.

---

## 5. Demo Storyline Consolidation

| File | Audience | Best Use | Overlap | Recommended Status |
|------|----------|----------|---------|-------------------|
| `docs/commercial/demo-storyline/` (7 moduler files) | External prospect (partner/manager/CFO) | Full guided demo (10-15 min) | Single-file duplicate below | **Primary demo narrative** — best structured, modular |
| `docs/commercial/demo-storyline-auditos.md` | External prospect | Same as above, single file | **Direct duplicate** of modular version | **Archive candidate** — all content in modular version |
| `docs/product/auditos-commercial-assets/demo-script.md` (136 lines) | External prospect | Quicker demo flow without pain statement deep dive | Overlaps with both above | **Keep as supporting variant** — lighter, faster |
| `docs/product/auditos-outbound-kit/five-minute-demo.md` (52 lines) | External prospect | Ultra-rapid pitch (5 min) | Intentionally short variant | **Keep as supporting** — unique length |
| `docs/product/auditos-outbound-kit/fifteen-minute-demo.md` (72 lines) | External prospect | Moderate demo with discovery (15 min) | Overlaps with full demo storyline | **Keep as supporting** — different structure |
| `docs/pilot/CLIENT-DEMO-SCRIPT.md` (377 lines) | Internal pilot execution team | Technical walkthrough during pilot | Different audience and purpose | **Keep as operational** — internal use |

**Decision:**
- **Primary:** `docs/commercial/demo-storyline/` (modular, 7 files) — best structured, most complete, bilingual.
- **Supporting:** `docs/product/auditos-commercial-assets/demo-script.md` (faster variant), `five-minute-demo.md`, `fifteen-minute-demo.md` (different lengths).
- **Archive candidate:** `docs/commercial/demo-storyline-auditos.md` — superseded by modular version.
- **Operational:** `docs/pilot/CLIENT-DEMO-SCRIPT.md` — internal pilot execution, not for external sales.

---

## 6. Pilot Success Criteria Consolidation

| File | Approach | Audience | Criteria Count | Risk | Recommendation |
|------|----------|----------|---------------|------|---------------|
| `docs/commercial-pack/07-pilot-success-criteria.md` | 5-axis framework with scoring | Client-facing + internal | 28 criteria across 5 axes (99 lines) | Medium — most complete | **Primary** — most structured, client-ready |
| `docs/commercial/pilot-pack/05-success-criteria.md` | Technical + commercial criteria | Client-facing | ~24 criteria (86 lines) | Medium — overlaps heavily with commercial-pack | **Archive candidate** — superseded by commercial-pack |
| `docs/pilot/PILOT-SUCCESS-CRITERIA.md` | Functional test criteria | Internal QA | ~20 criteria (86 lines) | Low — functional focus | **Historical/reference** — first version |
| `docs/pilot/execution-pack/09-pilot-success-criteria.md` | Decision framework + detailed criteria | Internal pilot execution | Go/Conditional/No-Go (187 lines) | Low — operational focus | **Keep as operational** — internal QA use |

**Decision:**
- **Primary:** `docs/commercial-pack/07-pilot-success-criteria.md` — most complete, client-ready.
- **Operational (internal):** `docs/pilot/execution-pack/09-pilot-success-criteria.md` — pilot execution QA.
- **Archive candidate:** `docs/commercial/pilot-pack/05-success-criteria.md` — superseded.
- **Historical:** `docs/pilot/PILOT-SUCCESS-CRITERIA.md` — first version, reference only.

**Future merge recommendation:** Create a single canonical success criteria source that both client-facing and internal variants reference. Do not merge now.

---

## 7. Recommended Target Structure

### Proposed future state (do not implement)

```
docs/product/auditos/
  README.md
  product-packaging.md
  commercial-operating-system.md        ← PRIMARY: master commercial document
  mvp-prd.md
  mvp-architecture-spec.md
  technical-baseline.md
  demo-dataset.md
  commercial/
    README.md                           ← COMMERCIAL INDEX: links to packages below
    assets/                             ← from auditos-commercial-assets/
    outbound/                           ← from auditos-outbound-kit/
    sales-ops/                          ← from auditos-sales-ops/
    pilot-execution/                    ← from auditos-first-customer-loop/ + auditos-live-pilot-management/
    conversion/                         ← from auditos-customer-conversion-reference/
    market-proof/                       ← from auditos-market-proof-system/
  pilot/
    README.md
    success-criteria.md                 ← canonical source
    datasets/
  operator/
    README.md

docs/commercial/
  README.md                             ← COMMERCIAL ENTRYPOINT
  demo-storyline/                       ← PRIMARY demo narrative
  pilot-pack/                           ← from commercial-pack/ (renamed or linked)

docs/commercial-pack/                   ← KEEP AS-IS until Phase 4
```

### Proposed future moves

| Current Path | Proposed Path | Reason | Risk | Phase |
|-------------|---------------|--------|------|-------|
| `docs/product/auditos-commercial-assets/` | `docs/product/auditos/commercial/assets/` | Normalize under product subfolder | Low | 5 |
| `docs/product/auditos-outbound-kit/` | `docs/product/auditos/commercial/outbound/` | Normalize under product subfolder | Low | 5 |
| `docs/product/auditos-sales-ops/` | `docs/product/auditos/commercial/sales-ops/` | Normalize under product subfolder | Low | 5 |
| `docs/product/auditos-first-customer-loop/` | `docs/product/auditos/commercial/pilot-execution/` | Normalize + rename for clarity | Low | 5 |
| `docs/product/auditos-live-pilot-management/` | `docs/product/auditos/commercial/pilot-execution/` | Merge with first-customer-loop | Low | 5 |
| `docs/product/auditos-customer-conversion-reference/` | `docs/product/auditos/commercial/conversion/` | Normalize + rename | Low | 5 |
| `docs/product/auditos-market-proof-system/` | `docs/product/auditos/commercial/market-proof/` | Normalize | Low | 5 |
| `docs/commercial/demo-storyline-auditos.md` | `docs/archive/commercial/` | Superseded by modular version | Low | 4 |
| `docs/commercial/pilot-pack/` | `docs/archive/commercial/pilot-pack/` | Superseded by commercial-pack | Low | 4 |
| `docs/commercial/pilot-pack/05-success-criteria.md` | `docs/archive/commercial/pilot-pack/` | Superseded by commercial-pack | Low | 4 |
| `docs/pilot/PILOT-SUCCESS-CRITERIA.md` | `docs/archive/pilot/` | Historical — first version | Low | 4 |

---

## 8. Cleanup Decision Matrix

| Item | Decision | Timing | Reason |
|------|----------|--------|--------|
| `docs/product/auditos-commercial-operating-system.md` | Keep active — **make primary** | Now | Already the master commercial ops doc; add links to commercial-pack and demo-storyline |
| `docs/product/auditos-commercial-assets/` | Keep active — supporting | Now | Referenced by primary |
| `docs/product/auditos-outbound-kit/` | Keep active — supporting | Now | Referenced by primary |
| `docs/product/auditos-sales-ops/` | Keep active — supporting | Now | Referenced by primary |
| `docs/product/auditos-first-customer-loop/` | Keep active — supporting | Now | Referenced by primary |
| `docs/product/auditos-live-pilot-management/` | Keep active — supporting | Now | Referenced by primary |
| `docs/product/auditos-customer-conversion-reference/` | Keep active — supporting | Now | Referenced by primary |
| `docs/product/auditos-market-proof-system/` | Keep active — supporting | Now | Referenced by primary |
| `docs/commercial/demo-storyline/` | Keep active — **primary demo narrative** | Now | Best structured, modular, bilingual |
| `docs/commercial/demo-storyline-auditos.md` | **Archive later** | Phase 4 | Superseded by modular version |
| `docs/commercial/pilot-pack/` | **Archive later** | Phase 4 | Superseded by commercial-pack |
| `docs/commercial-pack/` | Keep active — **primary pilot commercial pack** | Now | More complete than pilot-pack |
| `docs/commercial-pack/07-pilot-success-criteria.md` | Keep active — **primary success criteria** | Now | Most complete, client-ready |
| `docs/pilot/execution-pack/09-pilot-success-criteria.md` | Keep active — operational | Now | Internal pilot QA use |
| `docs/pilot/PILOT-SUCCESS-CRITERIA.md` | **Archive later** | Phase 4 | Historical, superseded |
| `docs/pilot/CLIENT-DEMO-SCRIPT.md` | Keep active — operational | Now | Internal pilot execution use |
| `docs/product/auditos-phase-1-completion.md` | **Archive later** | Phase 4 | Historical |
| `docs/product/auditos-phase-2-plan.md` | **Archive later** | Phase 4 | Historical |
| `docs/product/auditos-pilot-demo-flow-v1.md` | **Archive later** | Phase 4 | Historical |
| `docs/product/auditos-reviewer-workflow-v1.md` | **Archive later** | Phase 4 | Historical |
| `docs/product/auditos-notes-engine-v1.md` | **Archive later** | Phase 4 | Historical |
| `docs/product/auditos-sales-pipeline/` | Do not touch | N/A | Does not exist on disk; stage 4 in commercial-operating-system is conceptual |
| `docs/product/auditos-execution-environment/` | Do not touch | N/A | Does not exist on disk; stage 6 is described as "integrated in sales-ops" |

---

## 9. Recommended Cleanup Phases

### Phase 1 — Add master links only (IMMEDIATE NEXT TASK)

Update `docs/product/auditos-commercial-operating-system.md` to add links to:
- `docs/commercial-pack/` — as the primary pilot commercial pack
- `docs/commercial/demo-storyline/` — as the canonical demo narrative

Also update `docs/commercial/README.md` and `docs/product/README.md` to explicitly reference the commercial-operating-system.md as the master commercial document.

**No moves. No deletes. No rewrites. Just link additions.**

### Phase 2 — Create master AuditOS commercial README

Create `docs/product/auditos/commercial/README.md` that:
- Points to commercial-operating-system.md as the master
- Lists all supporting packages
- Links to commercial-pack and demo-storyline
- Notes overlaps and recommends primary sources

### Phase 3 — Merge duplicate pilot success criteria

- Choose `docs/commercial-pack/07-pilot-success-criteria.md` as canonical
- Add a comment/header to other variants pointing to the canonical source
- Do not delete other variants

### Phase 4 — Archive duplicate commercial packs

After approval and link validation:
- Move `docs/commercial/pilot-pack/` → `docs/archive/commercial/pilot-pack/`
- Move `docs/commercial/demo-storyline-auditos.md` → `docs/archive/commercial/`
- Move `docs/pilot/PILOT-SUCCESS-CRITERIA.md` → `docs/archive/pilot/`
- Move historical product docs → `docs/archive/product/`

### Phase 5 — Normalize product folder structure

After all archives are stable:
- Create `docs/product/auditos/commercial/` subdirectory structure
- Move supporting packages into it
- Update all cross-references
- Validate with tsc + lint + build

---

## 10. Immediate Next Recommended Task

**`AQLIYA AuditOS Commercial Master Index — Add Links Only`**

This is the safest next step because:
- No files moved or deleted
- Only adds cross-reference links to the existing primary commercial operating document
- Makes the navigation structure explicit in the source documents themselves
- No risk of breaking anything

The task should:
1. Update `docs/product/auditos-commercial-operating-system.md` to add links to `docs/commercial-pack/` and `docs/commercial/demo-storyline/`
2. Update `docs/commercial/README.md` to explicitly reference `auditos-commercial-operating-system.md` as the master
3. Update `docs/product/README.md` to reference the commercial operating system as the starting point for AuditOS commercial work
