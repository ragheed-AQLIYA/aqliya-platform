# Wave 3 Change Plan — Knowledge Governance Sprint v1

> **Part of:** Knowledge Governance Sprint v1  
> **Phase:** 10 — Wave 3 Change Plan  
> **Charter:** docs/governance/aqliya-knowledge-governance-charter-v1.md  
> **Owner:** Governance Team  
> **Date:** 2026-06-29  
> **Status:** Revised after Governance Decision — plan only, no edits yet

> **⚠️ Governance Decision (2026-06-29):** All changes affecting maturity levels (L0–L6) are **FROZEN** until independent Governance Review. Only structural/editorial changes may proceed.

---

## 1. Revised Scope

The original 19 planned changes have been split into two tracks:

| Track | Count | Scope | Status |
|-------|-------|-------|--------|
| **Wave 3A — Structural/Editorial** | 9 | Broken links, metadata, navigation, glossary additions (no L-levels), reference fixes, duplicate cleanup | **Approved for execution** |
| **Wave 3B — Governance Pending** | 10 | Any change touching L0–L6 maturity levels | **Frozen until Governance Review** |

### Rationale

Per the Governance Decision (2026-06-29):

> *"There are at least three types of truth in AQLIYA: Implementation Reality, Product Maturity, and Commercial Claim. They may differ. Code volume is not evidence of L5. All maturity level changes must go through independent review."*

---

## 2. Wave 3A — Structural/Editorial (EXECUTE NOW)

These changes involve **no maturity level claims**. They fix infrastructure, navigation, references, and metadata.

| # | File | Change | Reason | Reference | Risk |
|---|------|--------|--------|-----------|------|
| A01 | `docs/programs/repository-quality/PROGRAM_CHARTER.md` | Fix 2 broken links: `../BASELINE_REPORT.md` → correct path, `../phases/PHASE_1_CLOSURE.md` → correct path | Broken reference | BROKEN_REFERENCES.md §3 | None |
| A02 | `docs/theoretical-reference/gateways/*.md` (5 files) | Fix "theoretical-reference-mapping.md" → "../theoretical-reference-mapping.md" in all 5 gateway files | Broken See Also reference | BROKEN_REFERENCES.md §4 | None |
| A03 | `docs/DOCUMENTATION_GOVERNANCE.md` | Add `**Superseded By:** docs/DOCUMENTATION_GOVERNANCE_v2.md` header | Missing superseded declaration | BROKEN_REFERENCES.md §5 | None |
| A04 | `docs/governance/` (add README.md) | Create governance directory README with index of all governance files | Missing navigation entry | NAVIGATION_ANALYSIS.md §4 | None |
| A05 | `docs/architecture/` (add README.md) | Create architecture directory README with index of 25 architecture files | Missing navigation entry | NAVIGATION_ANALYSIS.md §4 | None |
| A06 | `docs/operations/` (add README.md) | Create operations directory README (110 files — largest unindexed dir) | Missing navigation entry | NAVIGATION_ANALYSIS.md §4 | None |
| A07 | `docs/releases/` (add README.md) | Create releases directory README (95 files) | Missing navigation entry | NAVIGATION_ANALYSIS.md §4 | None |
| A08 | `docs/official/aqliya-glossary-v1.1.md` | Add entries for **Knowledge Foundation** and **ContentStudio** — factual descriptions only, **NO maturity level claims** | Missing glossary terms | GLOSSARY_GAP_ANALYSIS.md §3 | Low — must ensure no implied L-level |
| A09 | All product/architecture/official docs | Update `**Last Reviewed:**` dates where stale (>14 days since last update) | Stale metadata | METADATA_AUDIT.md §3 | None |

### A08 Guidance — Glossary Entry Template (Maturity-Neutral)

```
**Knowledge Foundation**
Governance capability under AQLIYA Intelligence Core. Provides knowledge versioning,
diff tracking, integrity verification (SHA-256), and release management for institutional
knowledge assets. Route: `/knowledge-foundation/*`. Prisma models exist. Seed data exists.

**ContentStudio**
Content workspace subsystem within LocalContentOS. Provides content creation, versioning,
templates, and publishing workflow. Prisma models: ContentWorkspace, ContentItem,
ContentVersion, ContentTemplate. Route: `/local-content/*` (integrated).
Sidebar entry: "استوديو المحتوى". Seed data exists.
```

No L-levels. No "pilot-ready" claims. No comparison to other products.

---

## 3. Wave 3B — Governance Pending (FROZEN)

These changes affect **maturity level claims (L0–L6)** and are frozen until an independent Governance Review determines the correct level for each product based on **all three types of truth**: Implementation Reality, Product Maturity, and Commercial Claim.

| # | File | Planned Change | L-Levels Affected | Waits For |
|---|------|---------------|-------------------|-----------|
| B01 | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | Resolve SalesOS internal contradiction (row vs Reality Note) | L5 vs <L4 | **SalesOS Decision** |
| B02 | `docs/official/aqliya-core-architecture-v1.1.md` | Update Engine Status: IM from "Not implemented" | L0 → ? | Governance Review |
| B03 | `docs/official/aqliya-glossary-v1.1.md` | Update RiskOS, LocalContactOS, IM from "Not implemented" | L0 → ? | Governance Review |
| B04 | `docs/official/aqliya-roadmap-v1.1.md` | Update "Not Included" list for IM, RiskOS, LocalContactOS, Local AI | L0 → ? | Governance Review |
| B05 | `docs/official/aqliya-vision-v1.1.md` | Update "Do Not Claim" list | L0 → ? | Governance Review |
| B06 | `docs/official/aqliya-agent-context-v1.1.md` | Update "Do Not Claim" list | L0 → ? | Governance Review |
| B07 | `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` | Align 5 stale product levels with code reality | Various | Governance Review |
| B08 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Update ContentStudio L3→L4, IM L3→L5, DecisionOS L4→L5, Office AI L4→L5, WorkflowOS L4→L5 | Various | Governance Review |
| B09 | `docs/official/aqliya-product-taxonomy-v1.1.md` | Update 6 stale product levels | Various | Governance Review |
| B10 | `docs/source-of-truth/ROUTE_STRATEGY.md` | Fix ContentStudio L3 vs L4 self-contradiction | L3 vs L4 | Governance Review |

### Duplicate rule cleanup in ROUTE_STRATEGY.md

**Note:** The duplicate rules 17/18 (appearing 3 times at lines ~451-461) are a **structural error** (duplicate text, not a maturity dispute). However, fixing them requires touching the same section that contains L-level claims. Decision: **defer to Governance Review** to avoid partial edits.

---

## 4. Execution Order

### Wave 3A — Immediate

```
Phase 1: A01 + A02 (broken links — 6 files, ~5 min each)
Phase 2: A03 (superseded header — 1 file, ~2 min)
Phase 3: A04 + A05 + A06 + A07 (README indexes — 4 files, ~30 min each)
Phase 4: A08 (glossary entries — 1 file, ~15 min)
Phase 5: A09 (stale dates — ~10-15 files, ~2 min each)
```

### Wave 3B — After Governance Review

```
Phase 6: Governance Review determines correct maturity per product
Phase 7: Apply B01–B10 based on review outcomes
Phase 8: Final alignment pass across all authority docs
```

---

## 5. Pre-Flight Checklist (before executing any change)

- [ ] File read before editing
- [ ] Change matches approved scope (structural only for Wave 3A)
- [ ] No L0–L6 level introduced or implied
- [ ] Change backed by Sprint evidence
- [ ] Related docs checked for consistency
- [ ] `npx tsc --noEmit` after any file that could affect imports
- [ ] Commit with descriptive message referencing Sprint + change ID

---

## 6. Status

| Change | Status | Notes |
|--------|--------|-------|
| A01 | ✅ Done | `../BASELINE_REPORT.md` → `./BASELINE_REPORT.md`, `../phases/` → `./phases/` |
| A02 | ✅ Done | 5 gateway files: `theoretical-reference-mapping.md` → `../theoretical-reference-mapping.md` (converted to active links) |
| A03 | ✅ Done | Added **Superseded By:** header + **Last Reviewed:** date |
| A04 | ✅ Done | `docs/governance/README.md` — full index of all 20 governance files |
| A05 | ✅ Done | `docs/architecture/README.md` — full index of 23 architecture files |
| A06 | ✅ Done | `docs/operations/README.md` — full index of 90+ operations files |
| A07 | ✅ Done | `docs/releases/README.md` — full index of released programs |
| A08 | ✅ Done | Knowledge Foundation + ContentStudio added — maturity-neutral, factual only |
| A09 | ✅ Done | Updated dates on 3 modified files (glossary, governance, program charter) |
| B01–B10 | 🧊 Frozen | Awaiting Governance Review (Sprint v3) |
