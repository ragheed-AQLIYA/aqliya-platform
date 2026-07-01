# DUPLICATE_MATRIX.md

> **Status:** Active | **Version:** 1.0 | **Date:** 2026-06-29 | **Owner:** Governance Team | **Last Reviewed:** 2026-06-29
>
> This document catalogs concept-level duplication across the AQLIYA documentation corpus. It identifies where the same content (status, routes, definitions, roadmap data, claims lists) appears in multiple documents, assigns authority precedence, and recommends merge/delete/defer actions.
>
> **Context:** Phase 3 of Knowledge Governance Sprint v1 (precedes Phase 4: Content Deletion). See `KNOWLEDGE_CLEANUP_LOG.md` for logged contradictions found during P1-W2 analysis.

---

## 1. Summary Statistics

| Metric | Count |
|--------|-------|
| Documents inspected | 16 |
| Documents with product status data | 8 |
| Documents with route data | 4 |
| Documents with engine status tables | 3 |
| Documents with roadmap/phase data | 5 |
| Documents with DO/DO NOT claim lists | 5 |
| Documents with glossary definitions | 3+ |
| Total duplication instances found | ~45+ |
| Specific contradictions found | 7 |
| Merge candidates | 12 |
| Delete/stale candidates | 8 |

## 2. Authority Hierarchy (from DOCUMENTATION_AUTHORITY.md)

| Level | Authoritative Source | Domain |
|-------|---------------------|--------|
| **Level 0** | `DOCUMENTATION_AUTHORITY.md` | Conflict resolution, hierarchy |
| **Level 1** | `AQLIYA_MASTER_REFERENCE.md` | Master reference (single source of truth anchor for all official docs) |
| **Level 2** | `docs/official/*.md` | Official doctrine (vision, roadmap, implementation rules, taxonomy, architecture, glossary, agent context, skill context) |
| **Level 3** | `docs/source-of-truth/*.md` | Implementation truths (product status matrix, route strategy, system taxonomy, architecture) |
| **Level 4** | `docs/governance/*.md`, `README.md` | Derived reports, runbooks, playbooks |

For conflict resolution:
1. Identity/naming/strategy → `docs/official/` doctrine
2. Implementation status → inspect code + `docs/source-of-truth/`
3. Business terms → `aqliya-glossary-v1.1.md`
4. Route info → `ROUTE_STRATEGY.md`
5. Product maturity → `PRODUCT_STATUS_MATRIX.md`
6. Architecture → `aqliya-core-architecture-v1.1.md`

---

## 3. Category A: Product Status Duplicates

### Documents Involved

| # | Document | Section | Authority Level | Contains |
|---|----------|---------|-----------------|----------|
| A1 | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | Entire document | **Level 3 — AUTHORITATIVE** | L0-L6 scoring for 22+ products/systems; per-product readiness status |
| A2 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | §6 Product Status | Level 1 duplicate | Status table for AuditOS, LocalContentOS, DecisionOS, SalesOS, LocalContactOS, Office AI Assistant, RiskOS, Sunbul, WorkflowOS, ContentStudio |
| A3 | `docs/official/aqliya-product-taxonomy-v1.1.md` | Product tree + inline status | Level 2 duplicate | Classification hierarchy with inline maturity claims per product |
| A4 | `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` | §Release-Scope Mapping | Level 3 duplicate | Maturity level + scope table for ~16 systems |
| A5 | `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` | §System Maturity labels (inline) | Level 3 duplicate | Per-system maturity tags embedded in architecture descriptions |
| A6 | `docs/official/aqliya-agent-context-v1.1.md` | §Release Classification | Level 2 duplicate | Release phase classification for key products |
| A7 | `docs/official/aqliya-vision-v1.1.md` | Inline references | Level 2 duplicate | References to product status in positioning copy |
| A8 | `docs/source-of-truth/PRODUCT_STATUS_AUTHORITY_MATRIX.md` | Entire document | Level 3 (supplementary) | v1.2 L0-L6 status definitions; supplements A1 |

### Matrix

| Product | A1 (Auth) | A2 | A3 | A4 | A5 | A6 | A7 | Conflict? |
|---------|-----------|----|----|----|----|----|----|-----------|
| **AuditOS** | L5 | L5 | L5 | L5 | L5 | L5 | — | ✅ Consistent |
| **LocalContentOS** | L5 | L5 | L5 | L5 | L5 | — | — | ✅ Consistent |
| **DecisionOS** | L5 | L5 | L5 | L4 | L5 | L4 | — | ⚠️ A4 says L4; others say L5 |
| **SalesOS** | L3 (prototype) | L4 | L3 | L4 | L3 | L3 | — | ⚠️ A2/A4 say L4; A1/A3/A5/A6 say L3 |
| **LocalContactOS** | L3 (prototype) | L4 | — | — | — | L3 | — | ⚠️ A2 says L4; A1/A6 say L3 |
| **ContentStudio** | L4 | L3 | L4 | L4 | L4 | — | — | ⚠️ **A2 says L3** (stale seed file claim) |
| **RiskOS** | L5 (pilot-ready) | L5 | — | L5 | L5 | — | — | ✅ Consistent |
| **Office AI Assistant** | L4 | L4 | — | L3 | L4 | L4 | — | ⚠️ A4 says L3; others say L4 |
| **WorkflowOS** | L3 (prototype) | L3 | — | L3 | L3 | — | — | ✅ Consistent |
| **Sunbul** | L3 (prototype) | L3 | — | L3 | L3 | — | — | ✅ Consistent |
| **ComplianceOS** | L1 | L1 | — | L2 | L2 | — | — | ⚠️ A4/A5 say L2; A1/A2 say L1 |
| **LegalOS** | L1 | L1 | — | L2 | L2 | — | — | ⚠️ A4/A5 say L2; A1/A2 say L1 |
| **GovOS** | L1 | L1 | — | L2 | L1 | — | — | ⚠️ A4 says L2 |
| **AQLIYA Studio** | L1 | L1 | — | L1 | L1 | — | — | ✅ Consistent |
| **LocalContentAI** | L5 | — | — | — | — | — | — | ✅ Only in A1 |

### Recommendation
1. **Merge into A1 (PRODUCT_STATUS_MATRIX.md):** All product maturity data should be consolidated into A1 as the single authoritative source.
2. **Delete from A2 (MASTER_REFERENCE §6):** Full status table is redundant. Replace with pointer: "See PRODUCT_STATUS_MATRIX.md for current maturity levels."
3. **Delete from A3 (taxonomy):** Inline maturity claims in product descriptions cause drift. Remove maturity labels from taxonomy document.
4. **Delete from A4 (SYSTEM_TAXONOMY):** Release-Scope Mapping table duplicates A1. Replace with pointer.
5. **Delete from A5 (ARCHITECTURE):** Inline maturity tags in architecture descriptions. Architecture should describe structure, not status.
6. **Keep A8 (PRODUCT_STATUS_AUTHORITY_MATRIX):** As supplementary definition of L0-L6, not a duplicate.
7. **Keep A6 (agent-context):** Release classification is a different concern (phase, not maturity).

### Contradictions to Resolve
- **DecisionOS:** A4 says L4 (usable). A1, A2, A3 say L5 (pilot-ready). Resolve by inspecting DecisionOS codebase for approval/export/evidence flows.
- **SalesOS:** A2 says L4. Core docs say L3. Resolve by accepting A1 (L3 prototype) — SalesOS is known to be incomplete.
- **LocalContactOS:** A2 says L4. Core docs say L3. Resolve by accepting A1 (L3 prototype).
- **Office AI Assistant:** A4 says L3. Others say L4. Resolve by inspecting current implementation.
- **ContentStudio:** A2 says L3 (seed file claim). A1, A3, A4, A5 say L4. KNOWLEDGE_CLEANUP_LOG confirms A1 is correct (seed file, sidebar, 5 routes, routes all exist). **A2 is stale.**
- **ComplianceOS, LegalOS, GovOS:** A4/A5 overstate to L2 when truth is L1 (concept). Resolve by downgrading A4/A5.

---

## 4. Category B: Architecture Engine Status Duplicates

### Documents Involved

| # | Document | Section | Authority Level | Contains |
|---|----------|---------|-----------------|----------|
| B1 | `docs/official/aqliya-core-architecture-v1.1.md` | §Engine Implementation Status | **Level 2 — AUTHORITATIVE** | 12 engines with status, runtime, dependencies |
| B2 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | §9 Engine Management | Level 1 duplicate | Engine list with status per engine |
| B3 | `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` | Inline system maturity | Level 3 partial duplicate | Per-system maturity tags, not full engine registry |

### Matrix

| Engine | B1 (Auth) | B2 | Conflict? |
|--------|-----------|----|-----------|
| **Core Engine** | Production (L6) | Production | ✅ Consistent |
| **AuthZ Engine** | Production (L6) | Production | ✅ Consistent |
| **AI Engine** | Production (L6) | Production | ✅ Consistent |
| **File Engine** | Production (L6) | Production | ✅ Consistent |
| **Export Engine** | Production (L6) | L4 | ⚠️ B2 says L4 (usable) vs B1 L6 (production-hardened) |
| **Audit Engine** | Production (L6) | Production | ✅ Consistent |
| **Notification Engine** | Prototype (L3) | Prototype | ✅ Consistent |
| **Workflow Engine** | Prototype (L3) | Prototype | ✅ Consistent |
| **Memory Engine** | Prototype (L3) | Prototype | ✅ Consistent |
| **Report Engine** | Prototype (L3) | Prototype | ✅ Consistent |
| **Integration Engine** | Concept (L1) | Concept | ✅ Consistent |
| **Sync Engine** | Concept (L1) | Concept | ✅ Consistent |

### Recommendation
1. **B1 is authoritative.** B2 is a close derivative — minimal drift (only Export Engine discrepancy).
2. **Delete from B2 (§9):** Engine registry in MASTER_REFERENCE is redundant. Replace with pointer: "See aqliya-core-architecture-v1.1.md §Engine Implementation Status."
3. **Resolve Export Engine contradiction:** B2 claims L4; B1 claims L6. Inspect code to determine actual maturity. If L6, update B2. If L4, update B1.

---

## 5. Category C: Route Tables

### Documents Involved

| # | Document | Section | Authority Level | Contains |
|---|----------|---------|-----------------|----------|
| C1 | `docs/source-of-truth/ROUTE_STRATEGY.md` | Full document | **Level 3 — AUTHORITATIVE** | Complete route table ~40 routes + implementation rules |
| C2 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | §7 Current Route Strategy | Level 1 duplicate | Abbreviated route table + strategy summary |
| C3 | `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` | §Route Architecture | Level 3 duplicate | Embedded route table in architecture doc |
| C4 | `docs/source-of-truth/ROUTE_REGISTRY.md` | Full document | Level 3 (supplementary) | Detailed route-by-route status with auth requirements |

### Specific Issue: C1 Triple Duplicate (Rules 17-18)

In `ROUTE_STRATEGY.md`, the section "Implementation Rules for Route Strategy" (rules 1-27) contains rules 17 and 18 repeated **three times**:

- **Rule 17** (InstitutionalMemory routes — `/agent-memory/*`): Appears at lines 451, 457, and 461
- **Rule 18** (content-studio routes — `/content-studio/*`): Appears at lines 451, 457, and 461 (coupled with InstitutionalMemory)

| Instance | Lines | Content |
|----------|-------|---------|
| 1st | ~451 | `Rule 17: InstitutionalMemory routes (agent-memory) are prototype (L3). Not for pilot use.` + `Rule 18: Content-studio routes are L4 (Usable).` |
| 2nd | ~457 | Same rules repeated verbatim |
| 3rd | ~461 | Same rules repeated verbatim |

**Root cause:** Likely copy-paste merge error or section restructuring that left ghost duplicates.

**Fix:** Remove lines 457 and 461 duplicates, keeping only the authoritative instance (~line 451).

### Matrix

| Route/system | C1 (Auth) | C2 | C3 | C4 | Conflict? |
|-------------|-----------|----|----|----|-----------|
| **/audit** | L5 | L5 | L5 | L5 | ✅ Consistent |
| **/auditos** | Demo (public) | Demo | Demo | Demo | ✅ Consistent |
| **/local-content** | L5 | L5 | L5 | L5 | ✅ Consistent |
| **/decisions** | L4 | L4 | L4 | L4 | ✅ Consistent |
| **/risk** | L5 | — | L5 | L5 | ✅ Consistent |
| **/content-studio** | L4 | L3 (in §11) | L4 | L4 | ⚠️ C2 §11 says L3 |
| **/sales** | L3 | L4 | — | L3 | ⚠️ C2 says L4; C1/C4 say L3 |
| **/local-contacts** | L3 | L4 | — | L3 | ⚠️ C2 says L4; C1/C4 say L3 |
| **/sunbul** | L3 | L3 | L3 | L3 | ✅ Consistent |
| **/settings** | L3 | L3 | L3 | L3 | ✅ Consistent |
| **/office-assistant** | L4 | L4 | L4 | L4 | ✅ Consistent |
| **/agent-memory** | L3 | — | — | L3 | ✅ Consistent |
| **/api/*** | Varies | — | — | Varies | ✅ Consistent |

### Recommendation
1. **Keep C1 (ROUTE_STRATEGY.md) as authoritative.** It is the most current and detailed.
2. **Delete from C2 (MASTER_REFERENCE §7):** Route table is a maintenance burden. Replace with pointer.
3. **Delete from C3 (ARCHITECTURE):** Architecture should describe route topology, not enumerate route status.
4. **Keep C4 (ROUTE_REGISTRY.md):** Supplementary — offers auth-specific details not in C1. Could be merged into C1.
5. **Fix C1 triple duplicate:** Remove rule 17/18 copies at lines 457 and 461.

### Contradictions to Resolve
- **SalesOS route:** C2 says L4; C1/C4 say L3. Accept C1 (L3 prototype).
- **LocalContactOS route:** C2 says L4; C1/C4 say L3. Accept C1 (L3 prototype).
- **ContentStudio:** C2 §11 says L3; C1/C3/C4 say L4. Accept C1 (L4 — seed file and routes exist).

---

## 6. Category D: Definitions / Glossary Terms

### Documents Involved

| # | Document | Authority Level | Contains |
|---|----------|-----------------|----------|
| D1 | `docs/official/aqliya-glossary-v1.1.md` | **Level 2 — AUTHORITATIVE** | Complete glossary ~50+ terms with Arabic/English definitions |
| D2 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Level 1 duplicate | Inline definitions throughout (overlaps with ~20 D1 terms) |
| D3 | `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` | Level 3 duplicate | Term definitions section (overlaps with ~10 D1 terms) |
| D4 | Per-product taxonomy docs | Level 2 duplicate | Inline per-product definitions |

### Specific Issue: Product/System Definition Contradictions

The following products were flagged in the task prompt as having "not implemented" claims in glossary while appearing at L5 in matrix. Analysis of the v1.1 glossary shows:

| Product | D1 (Glossary) Status | A1 (Matrix) Status | Contradiction? |
|---------|---------------------|--------------------|----------------|
| **AuditOS (L5)** | "first proof product" | L5 | ✅ Consistent — glossary does NOT say "not implemented" |
| **LocalContentOS (L5)** | "strategic second product for Saudi market" | L5 | ✅ Consistent — glossary does NOT say "not implemented" |
| **DecisionOS (L5)** | "active adjacent decision governance system" | L5 | ✅ Consistent — glossary does NOT say "not implemented" |
| **RiskOS (L5)** | "audit-adjacent risk workspace" | L5 | ✅ Consistent — glossary does NOT say "not implemented" |
| **SalesOS** | "governed revenue intelligence, future" | L3 (prototype) | ✅ Consistent — prototype ≠ completed |
| **ComplianceOS** | "not built; future system" | L1 (concept) | ✅ Consistent |
| **LegalOS** | "no lawyer replacement" | L1 (concept) | ✅ Consistent |
| **GovOS** | "future government system" | L1 (concept) | ✅ Consistent |
| **AQLIYA Studio** | "custom systems layer, strategic" | L1 (concept) | ✅ Consistent |

**Conclusion:** The 4-product contradiction may have existed in an earlier version of the glossary. In v1.1, definitions align with the matrix. No critical definition-vs-status contradiction found in current versions.

### Recommendation
1. **D1 (glossary) is authoritative.** D2 (MASTER_REFERENCE) inline definitions should be replaced with glossary references.
2. **D3 (SYSTEM_TAXONOMY)** term definitions should be removed and replaced with pointers to D1.
3. **Consider creating a cross-reference map** from each term to its authoritative D1 entry to prevent inline drift.

---

## 7. Category E: Roadmap / Phase Data

### Documents Involved

| # | Document | Authority Level | Contains |
|---|----------|-----------------|----------|
| E1 | `docs/official/aqliya-roadmap-v1.1.md` | **Level 2 — AUTHORITATIVE** | 11-phase roadmap (Phase 1-8 done, 9-11 future) |
| E2 | `docs/official/AQLIYA_MASTER_REFERENCE.md` §10 | Level 1 duplicate | Abbreviated roadmap summary |
| E3 | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | Level 3 duplicate | §Phases section with roadmap data |
| E4 | `docs/source-of-truth/ENTERPRISE_COMPLETION_ROADMAP.md` | Level 3 (superseded) | 0-100 scoring per product, now superseded |
| E5 | `docs/official/aqliya-agent-context-v1.1.md` §14 | Level 2 duplicate | Release classification table |

### Recommendation
1. **E1 (roadmap) is authoritative.** E2 (MASTER_REFERENCE §10) should be replaced with a pointer.
2. **E3 (PRODUCT_STATUS_MATRIX §Phases):** Remove the embedded roadmap section. Phase data belongs in E1.
3. **E4 (ENTERPRISE_COMPLETION_ROADMAP):** Already marked superseded. Retain for historical reference only.
4. **E5 (agent-context §14):** Release classification is a different concern from roadmap phases. Keep but differentiate purpose.

---

## 8. Category F: Do / Do Not Claim Lists

### Documents Involved

| # | Document | Section | Authority Level | Contains |
|---|----------|---------|-----------------|----------|
| F1 | `docs/official/aqliya-implementation-rules-v1.1.md` | Rule 6 | **Level 2 — AUTHORITATIVE** | Canonical DO/DO NOT claim list |
| F2 | `docs/official/aqliya-vision-v1.1.md` | §What AQLIYA IS / IS NOT | Level 2 duplicate | Identity-level DO/DO NOT list |
| F3 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | §14: Do Not Claim Unless | Level 1 duplicate | Commercial claim restrictions |
| F4 | `docs/official/aqliya-agent-context-v1.1.md` | §Identity, §Product claims | Level 2 duplicate | Agent-facing DO/DO NOT rules |
| F5 | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | §Do Not Claim Unless | Level 3 duplicate | Product-specific claim restrictions |

### Overlap Analysis

| Claim Item | F1 (Auth) | F2 | F3 | F4 | F5 | Conflict? |
|-----------|-----------|----|----|----|----|-----------|
| Production On-Prem package | ❌ Don't claim | ❌ | ❌ | — | — | ✅ Consistent |
| Air-Gapped mode | ❌ Don't claim | ❌ | ❌ | — | — | ✅ Consistent |
| Local AI runtime | ❌ Don't claim | ❌ | ❌ | — | — | ✅ Consistent |
| GPU local inference | ❌ Don't claim | ❌ | ❌ | — | — | ✅ Consistent |
| Kubernetes deployment | ❌ Don't claim | — | ❌ | — | — | ✅ Consistent |
| SSO/LDAP/AD | ❌ Don't claim | — | ❌ | — | — | ✅ Consistent |
| Model Governance registry | ❌ Don't claim | — | ❌ | — | — | ✅ Consistent |
| Institutional Memory engine | ❌ Don't claim | — | ❌ | — | — | ✅ Consistent |
| AQLIYA Studio builder | ❌ Don't claim | — | ❌ | — | — | ✅ Consistent |
| LocalContentOS workspace | — | — | ❌ | — | — | ⚠️ Only in F3 |
| SalesOS backend | — | — | ❌ | — | — | ⚠️ Only in F3 |
| LocalContactOS backend | — | — | ❌ | — | — | ⚠️ Only in F3 |
| Complete private cloud | — | — | ❌ | — | — | ⚠️ Only in F3 |
| Automated backup/restore | — | — | ❌ | — | — | ⚠️ Only in F3 |
| NOT an AI chatbot | ✅ Is not | ✅ | — | ✅ | — | ✅ Consistent |
| NOT a CRM | ✅ Is not | ✅ | — | ✅ | — | ✅ Consistent |
| NOT a workflow tool | ✅ Is not | ✅ | — | — | — | ✅ Consistent |
| NOT a collection of demos | ✅ Is not | ✅ | — | ✅ | — | ✅ Consistent |
| NOT SaaS-only | — | ✅ | — | — | — | ⚠️ Only in F2 |
| NOT AuditOS only | — | ✅ | — | — | — | ⚠️ Only in F2 |

### Recommendation
1. **F1 (implementation-rules Rule 6) is authoritative** for commercial claim restrictions. It has the most complete and vetted list.
2. **F2 (vision) serves a different purpose** — identity positioning. Keep the IS/IS NOT language but align it with F1's claim items.
3. **F3 (MASTER_REFERENCE §14):** Overlaps significantly with F1. Remove or replace with pointer.
4. **F4 (agent-context):** Agent-facing rules are a legitimate specialization. Keep but source claim items from F1.
5. **F5 (PRODUCT_STATUS_MATRIX):** Product-specific restrictions are already covered by product maturity scoring. Can be removed.

---

## 9. Priority Actions

### P0 — Fix Contradiction (Immediate)

| ID | Action | Document(s) | Reason |
|----|--------|-------------|--------|
| P0-1 | **Resolve ContentStudio contradiction** — A2 (MASTER_REFERENCE §11) claims L3; real status is L4 | `MASTER_REFERENCE.md` §11 | Contradicts 4 other docs; wrong pilot-readiness signal |
| P0-2 | **Fix ROUTE_STRATEGY.md triple duplicate** — Remove rules 17/18 from lines 457 and 461 | `ROUTE_STRATEGY.md` lines 457-461 | Content error — same rule repeated 3x |

### P1 — Merge Downstream Docs into Authoritative Sources (This Phase)

| ID | Action | Target | Source(s) | Effort |
|----|--------|--------|-----------|--------|
| P1-1 | **Delete product status table** from MASTER_REFERENCE §6 | `MASTER_REFERENCE.md` §6 → pointer to `PRODUCT_STATUS_MATRIX.md` | A2 | Small |
| P1-2 | **Delete route table** from MASTER_REFERENCE §7 | `MASTER_REFERENCE.md` §7 → pointer to `ROUTE_STRATEGY.md` | C2 | Small |
| P1-3 | **Delete engine status** from MASTER_REFERENCE §9 | `MASTER_REFERENCE.md` §9 → pointer to `aqliya-core-architecture-v1.1.md` | B2 | Small |
| P1-4 | **Delete roadmap summary** from MASTER_REFERENCE §10 | `MASTER_REFERENCE.md` §10 → pointer to `aqliya-roadmap-v1.1.md` | E2 | Small |
| P1-5 | **Delete DO/DO NOT list** from MASTER_REFERENCE §14 | `MASTER_REFERENCE.md` §14 → pointer to `aqliya-implementation-rules-v1.1.md Rule 6` | F3 | Small |
| P1-6 | **Remove maturity labels** from product-taxonomy document | `aqliya-product-taxonomy-v1.1.md` inline | A3 | Medium |
| P1-7 | **Remove embedded route table** from AQLIYA_ARCHITECTURE | `AQLIYA_ARCHITECTURE.md` | C3 | Medium |
| P1-8 | **Remove Release-Scope Mapping** from SYSTEM_TAXONOMY | `AQLIYA_SYSTEM_TAXONOMY.md` | A4 | Medium |
| P1-9 | **Remove roadmap section** from PRODUCT_STATUS_MATRIX | `PRODUCT_STATUS_MATRIX.md` §Phases | E3 | Small |

### P2 — Resolve Status Contradictions (Requires Code Inspection)

| ID | Product | Docs in Conflict | Resolution Needed |
|----|---------|-----------------|-------------------|
| P2-1 | **SalesOS** | L3 (A1, A3, A5, A6) vs L4 (A2, A4) | Inspect SalesOS backend code |
| P2-2 | **LocalContactOS** | L3 (A1, A6) vs L4 (A2) | Inspect LocalContactOS backend code |
| P2-3 | **DecisionOS** | L5 (A1, A2, A3) vs L4 (A4) | Inspect DecisionOS approval/export/evidence flows |
| P2-4 | **Office AI Assistant** | L4 (A1, A2, A5, A6) vs L3 (A4) | Inspect Office AI Assistant implementation |
| P2-5 | **Export Engine** | L6 (B1) vs L4 (B2) | Inspect export service implementation |
| P2-6 | **ComplianceOS/LegalOS/GovOS** | L1 (A1, A2) vs L2 (A4, A5) | Accept L1; downgrade A4/A5 |

### P3 — Knowledge Governance Cleanup (Post-Merge)

| ID | Action | Rationale |
|----|--------|-----------|
| P3-1 | **Audit MASTER_REFERENCE.md** for remaining inline duplicates after P1 deletions | Ensure no ghost content remains |
| P3-2 | **Create cross-reference map** for glossary terms to prevent definition drift | Locks D1 as authoritative |
| P3-3 | **Establish a "source of truth" routing table** in DOCUMENTATION_AUTHORITY.md | Documents which doc owns which domain |
| P3-4 | **Add merge/delete instructions** to KNOWLEDGE_CLEANUP_LOG.md | Logs Phase 3 completion |

---

## 10. Risk Assessment

### Risk 1: MASTER_REFERENCE.md Becomes a Pointer Document
- **Description:** After all P1 deletions, MASTER_REFERENCE.md will contain mostly pointers to Level 2/3 docs instead of inline content.
- **Severity:** Low — This is the intended design. Master reference should aggregate and route, not duplicate.
- **Mitigation:** Ensure MASTER_REFERENCE.md keeps its identity as the Level 1 coordination anchor without becoming a full duplicate.

### Risk 2: Merge Fatigue
- **Description:** After 9 P1 merges + 6 P2 resolutions + 4 P3 cleanup items, documentation team may lose momentum.
- **Severity:** Medium — Phase 3 and Phase 4 (deletion) are sequential. Incomplete Phase 3 blocks Phase 4.
- **Mitigation:** Prioritize P0 and P1 items. Tag P2 items as "requires code inspection" and defer to dedicated engineering task.

### Risk 3: Stale Content Survives
- **Description:** Some inline status claims may survive the purge (e.g., in vision-v1.1.md positioning copy).
- **Severity:** Low — Vision doc claims are identity/positioning, not operational status.
- **Mitigation:** Track with grep/regex sweeps after deletion phase.

### Risk 4: Deletion of Supplementary Value Content
- **Description:** ROUTE_REGISTRY.md (C4) has auth-specific route details not in C1. Deleting would lose information.
- **Severity:** Low — C4 should be merged into C1, not deleted outright.
- **Mitigation:** Merge supplementary content into authoritative docs before deleting secondary sources.

---

## 11. Deletion Candidates

| Document | Status | Action | Rationale |
|----------|--------|--------|-----------|
| `ENTERPRISE_COMPLETION_ROADMAP.md` | Already superseded | **Delete** (or move to archive/) | Duplicates E1 with 0-100 scoring no longer used |
| `PRODUCT_STATUS_AUTHORITY_MATRIX.md` | Active supplementary | **Keep** | L0-L6 definitions are valuable as reference |
| `ROUTE_REGISTRY.md` | Active supplementary | **Merge into C1 → Delete** | Auth details should merge into ROUTE_STRATEGY.md |
| `KNOWLEDGE_CLEANUP_LOG.md` | Active | **Keep** | Sprint log — valuable audit trail |

**No existing document should be deleted without first transferring its unique content to the authoritative source.**

---

## 12. Next Steps

1. **Phase 3a — Execute P0 fixes** (ContentStudio contradiction, ROUTE_STRATEGY triple duplicate)
2. **Phase 3b — Execute P1 merges** (pointer replacements in MASTER_REFERENCE, maturity label removal from taxonomy, route table removal from architecture)
3. **Phase 3c — Execute P2 resolutions** (code inspection for SalesOS, LocalContactOS, DecisionOS, Office AI Assistant, Export Engine contradictions)
4. **Phase 3d — Execute P3 governance** (audit, cross-reference map, authority routing table, KNOWLEDGE_CLEANUP_LOG update)
5. **Phase 4 — Content deletion** (remove secondary sources after merge verification)
6. **Post-Phase 4 — Full grep sweep** for remaining inline status claims in non-authoritative docs

---

## Appendix A: Document Inventory

| # | File | Primary Domain | Auth Level | Contains Duplicates Of |
|---|------|----------------|------------|----------------------|
| 1 | `docs/DOCUMENTATION_AUTHORITY.md` | Governance | 0 | — (anchor) |
| 2 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Master | 1 | Product status, routes, engines, roadmap, claims, definitions |
| 3 | `docs/official/aqliya-vision-v1.1.md` | Identity | 2 | Claims, product references |
| 4 | `docs/official/aqliya-implementation-rules-v1.1.md` | Rules | 2 | Claims (Rule 6) |
| 5 | `docs/official/aqliya-product-taxonomy-v1.1.md` | Taxonomy | 2 | Product status (inline) |
| 6 | `docs/official/aqliya-core-architecture-v1.1.md` | Architecture | 2 | Engine status |
| 7 | `docs/official/aqliya-glossary-v1.1.md` | Glossary | 2 | — (anchor) |
| 8 | `docs/official/aqliya-roadmap-v1.1.md` | Roadmap | 2 | — (anchor) |
| 9 | `docs/official/aqliya-agent-context-v1.1.md` | Agent | 2 | Claims, release classification |
| 10 | `docs/official/aqliya-skill-context-v1.1.md` | Skill | 2 | Minimal (OK) |
| 11 | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | Status | 3 | — (anchor), roadmap (§Phases) |
| 12 | `docs/source-of-truth/ROUTE_STRATEGY.md` | Routes | 3 | — (anchor, but triple self-duplicate) |
| 13 | `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` | Architecture | 3 | Route table, maturity tags |
| 14 | `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` | Taxonomy | 3 | Terms, release-scope mapping |
| 15 | `docs/source-of-truth/ROUTE_REGISTRY.md` | Routes | 3 | Routes (supplementary) |
| 16 | `docs/source-of-truth/PRODUCT_STATUS_AUTHORITY_MATRIX.md` | Status | 3 | Definitions (supplementary) |
| 17 | `docs/source-of-truth/ENTERPRISE_COMPLETION_ROADMAP.md` | Roadmap | 3 (superseded) | Roadmap, product scoring |
| 18 | `docs/governance/KNOWLEDGE_CLEANUP_LOG.md` | Governance | 4 | Contradiction log (meta) |
| 19 | `docs/governance/DUPLICATE_MATRIX.md` | Governance | 4 | — (transient analysis) |

## Appendix B: Duplicate Count by Category

| Category | Instances Found | Merge Candidates | Delete Candidates | Contradictions |
|----------|----------------|------------------|------------------|----------------|
| A. Product Status | 8 documents | 4 (A2, A3, A4, A5) | 4 (A2 §6, A3 inline, A4 table, A5 tags) | 7 product contradictions |
| B. Engine Status | 3 documents | 2 (B2, B3) | 1 (B2 §9) | 1 (Export Engine) |
| C. Route Tables | 4 documents | 2 (C2, C3) | 2 (C2 §7, C3 table) | 3 route contradictions + C1 self-duplicate |
| D. Definitions/Glossary | 3+ documents | 2 (D2, D3) | D2 inline, D3 terms | 0 (v1.1 glossary is clean) |
| E. Roadmaps | 5 documents | 3 (E2, E3, E4) | E4 (delete/archive) | 0 |
| F. DO/DO NOT Lists | 5 documents | 3 (F3, F4, F5) | F3 §14, F5 inline | 0 |

**Totals:** ~45+ duplication instances, ~12 merge candidates, ~8 delete candidates, 7 contradictions, 1 self-duplicate.

---

*This analysis was generated by inspecting 16 documentation files. Each claim was cross-referenced against the DOCUMENTATION_AUTHORITY.md hierarchy. Priority levels follow the P0-P3 scale defined in §9. All contradictory status claims should be resolved by code inspection before the next documentation release.*
