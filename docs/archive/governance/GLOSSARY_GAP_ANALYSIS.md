# Glossary Gap Analysis — Knowledge Governance Sprint v1

> **Part of:** Knowledge Governance Sprint v1  
> **Phase:** 7 — Glossary Gap Analysis  
> **Charter:** docs/governance/aqliya-knowledge-governance-charter-v1.md  
> **Owner:** Governance Team  
> **Date:** 2026-06-29  
> **Status:** Active — Evidence-based gap analysis for glossary v1.2

---

## 1. Executive Summary

The official glossary (docs/official/aqliya-glossary-v1.1.md) contains **37 terms across 6 sections** and serves as the Authority document for terminology under the Knowledge Governance Charter.

This analysis identified:

| Category | Count | Severity |
|---|---|---|
| **Missing Terms** (active systems not in glossary) | 2 | High |
| **Critical Definition Conflicts** (glossary says L0, reality L5) | 3 | Critical |
| **Moderate Definition Conflicts** (status out of date) | 2 | Medium |
| **Consistent Terms** (no action needed) | ~20 | None |

**Bottom line:** The glossary has **not been updated since May 2026** and contradicts the PRODUCT_STATUS_MATRIX.md (the Authority for product status) on **5 separate products/systems**. Three of those are critical commercial-misrepresentation risks.

---

## 2. Official Glossary Term Count & Coverage

### Source: docs/official/aqliya-glossary-v1.1.md (77 lines)

| Section | Terms | Coverage |
|---|---|---|
| Company and Platform Terms | 5 | AQLIYA, Intelligence Core, Cloud, Private/On-Prem, Studio |
| Runtime Surface Terms | 6 | Product/System, Shared Application, Custom Workspace, Demo, Prototype, Strategic/Future |
| Product and System Terms | 13 | AuditOS, DecisionOS, Office AI, WorkflowOS, Sunbul, SalesOS, LocalContentOS, SimulationOS, LocalContactOS, RiskOS, ComplianceOS, LegalOS, GovOS |
| Governance and AI Terms | 6 | Evidence Graph, Governance Engine, Audit Logs, Model Governance, Institutional Memory, Local AI Provider |
| Release Terms | 7 | Included in v0.1, Included as pilot-ready, Included as active adjacent, Included as governed shared app, Included as custom/internal, Included as demo, Do not claim |
| **Total** | **37** | |

### Coverage gap

The glossary covers all **named products** from the taxonomy but misses two significant **capabilities/subsystems** that are active in code and docs:

- **Knowledge Foundation** (~130+ doc references, L4 governance capability, 5 routes, full promotion pipeline)
- **ContentStudio / Content Studio** (~280+ doc references, L4 workspace, 5 routes, 7 Prisma models, full workflow)

---

## 3. Missing Terms — Knowledge Foundation

### Evidence

| Dimension | Evidence |
|---|---|
| Doc references | ~130+ matches across docs/ (operations, audits, deliverables, architecture, source-of-truth) |
| Routes | /knowledge-foundation, /knowledge-foundation/[id], /knowledge-foundation/new, /knowledge-foundation/diff, /knowledge-foundation/history |
| Prisma models | KnowledgeFoundationVersion, KnowledgeCandidate, KFRelease, KFDiff, KFVersionCandidate, + enums |
| Implementation status | L4 Usable v0.1 (PRODUCT_STATUS_MATRIX) |
| Authority recognition | Listed in AQLIYA_SYSTEM_TAXONOMY.md, ROUTE_STRATEGY.md, AQLIYA_ARCHITECTURE.md |
| Tests | 35 passing tests |
| Lifecycle | DRAFT → APPROVED → RELEASED → ACTIVE → DEPRECATED |
| Governance | 7 audit event types, SHA-256 immutable release packages, structured diff engine, ADMIN-only rollback |

### Proposed glossary entry for v1.2

> **Knowledge Foundation** — Governed capability for versioned institutional knowledge release. L4 Usable v0.1. Full promotion pipeline at /knowledge-foundation/* with version lifecycle (DRAFT→APPROVED→RELEASED→ACTIVE→DEPRECATED), SHA-256 immutable release packages, structured diff engine with risk scoring, ADMIN-only rollback with reason, 7 audit event types, 35 tests. Part of the knowledge governance loop: mine → review → promote → version → release → deploy. Not standalone product — governance capability within AQLIYA Intelligence Core.

---

## 4. Missing Terms — ContentStudio / Content Studio

### Evidence

| Dimension | Evidence |
|---|---|
| Doc references | ~280+ matches across docs/ (including PRD at LC-PRD-09, spec at LC-SPEC-09a-e, production readiness docs) |
| Routes | /content-studio, /content-studio/[workspaceId], /content-studio/[workspaceId]/create, /content-studio/[workspaceId]/[contentId], /content-studio/templates |
| Prisma models | 7 models: ContentStudioProject, ContentStudioCampaign, ContentStudioItem, ContentStudioSource, ContentStudioReview, ContentStudioApproval, ContentStudioOutput |
| Implementation status | L4 Usable v0.1 (PRODUCT_STATUS_MATRIX) |
| Sidebar entry | "استوديو المحتوى" with FileText icon |
| Seed data | 3 workspaces, 7 content items, 12 versions, 2 templates |
| Export | PDF export via pdfkit with bilingual Arabic/English rendering |
| Audit trail | Via writePlatformAuditLog |
| Content lifecycle | DRAFT → IN_REVIEW → APPROVED → PUBLISHED → ARCHIVED |

### Proposed glossary entry for v1.2

> **Content Studio / ContentStudio** — Governed content production workspace within LocalContentOS. L4 Usable v0.1. Manages content projects, campaigns, items, sources, reviews, approvals, and output packages. Routes at /content-studio/*. Content lifecycle: DRAFT→IN_REVIEW→APPROVED→PUBLISHED→ARCHIVED. Versioning, template variable interpolation, bilingual PDF export, audit trail, sidebar entry "استوديو المحتوى". Not a standalone product — subsystem of LocalContentOS. Missing: dedicated test coverage.

---

## 5. Critical Definition Conflicts

These are glossary entries that claim a product is **"Not implemented" (L0)** when the PRODUCT_STATUS_MATRIX.md — the Authority for product status — shows **L5 Pilot-ready**. These cause commercial misrepresentation risk if the glossary is used as a reference.

### Conflict 1: RiskOS

| Source | Claim | Status |
|---|---|---|
| **Glossary v1.1** | "Future risk intelligence system. Not implemented." | ❌ **L0** |
| **PRODUCT_STATUS_MATRIX** | L5 Pilot-ready at /risk/* (audit-adjacent risk workspace) | ✅ **L5** |
| **AQLIYA_SYSTEM_TAXONOMY** | "L5 Pilot-ready — not marketed as standalone product" | ✅ **L5** |
| **AQLIYA_ARCHITECTURE** | "Future products (not yet implemented): RiskOS" ❌ | ❌ **Contradicts** |

**Code evidence:**
- Dashboard at /risk with 4 KPI cards, risk distribution bar chart, status summary
- Assessment detail at /risk/assessments/[id] with score bars, procedure step tracking, audit trail panel
- 3 routes total: /risk, /risk/[id], /risk/assessments/[id]
- Prisma models: AuditRiskModel, AuditRiskAssessment, AuditRiskProcedure
- Seed data: 1 model (3 categories, 9 questions), 1 assessment, 2 procedures
- JSON export with full assessment + procedures
- Audit trail events: RISK_ASSESSMENT_CREATED, REVIEWED, APPROVED, EXPORTED
- PRODUCT_STATUS_MATRIX Phase 19-20: L4→L5 upgrade (2026-06-19)

### Conflict 2: LocalContactOS

| Source | Claim | Status |
|---|---|---|
| **Glossary v1.1** | "Future institutional relationship intelligence system. Not implemented." | ❌ **L0** |
| **PRODUCT_STATUS_MATRIX** | L5 Pilot-ready at /contacts/* | ✅ **L5** |
| **AQLIYA_SYSTEM_TAXONOMY** | (Not listed as future — workspace exists) | ✅ **Active** |

**Code evidence:**
- 7 routes: /contacts, /contacts/dashboard, /contacts/new, /contacts/[id], /contacts/[id]/edit, /contacts/[id]/relations/new, /contacts/[id]/interactions/new
- Dashboard with 4 KPI cards + sensitivity/export/reviews charts
- Risk flags metadata store with add/resolve actions + audit trail
- Saudi-market seed data (6 contacts, 3 relations, 4 interactions)
- Compliance export workflow with legal review gate
- 15 integration tests
- Sidebar links for dashboard + contacts list
- PRODUCT_STATUS_MATRIX Phase 17: L5 Pilot-ready (2026-06-17)

### Conflict 3: Institutional Memory

| Source | Claim | Status |
|---|---|---|
| **Glossary v1.1** | "Strategic future memory engine. Not implemented." | ❌ **L0** |
| **PRODUCT_STATUS_MATRIX** | L5 Pilot-ready at /institutional-memory/* | ✅ **L5** |
| **MASTER_REFERENCE §9** | "L3→L4 partial" (stale — last reviewed 2026-06-09 before L5 upgrade) | ⚠️ **Stale** |

**Code evidence:**
- 4 routes: /institutional-memory, /institutional-memory/events, /institutional-memory/collections, /institutional-memory/graph
- 4 Prisma models: InstitutionalMemoryEvent, InstitutionalMemoryCollection, IntelligenceGraphNode, IntelligenceGraphEdge
- Cross-product entity linking (sourceProduct/sourceEntityId → targetProduct/targetEntityId)
- Event types: linked, referenced, generated_by, approved_by, related_to
- Collections via InstitutionalMemoryCollection model — saved query filters
- D3.js force-directed graph visualization via IntelligenceGraphNode/Edge
- Export memory events as JSON with audit trail
- Seed data: 10 cross-product events, 2 collections, 13 graph nodes, 10 edges
- Sidebar link "الذاكرة المؤسسية" with Network icon
- PRODUCT_STATUS_MATRIX Phase 18: L4 (2026-06-18), Phase 21: L5 (2026-06-19)

---

## 6. Moderate Definition Conflicts

### Conflict 4: Model Governance

| Source | Claim | Status |
|---|---|---|
| **Glossary v1.1** | "Strategic future model registry and policy layer. Not implemented." | **L0** |
| **PRODUCT_STATUS_MATRIX** | "Not implemented. L0 Concept. Strategic future." | **L0** ✅ |
| **Core Architecture v1.1** | "Not implemented" | **L0** ✅ |
| **AQLIYA_ARCHITECTURE.md** | Listed under "AQLIYA Intelligence Core" as a named engine | ⚠️ Architecture doc includes it in the hierarchy |

**Verdict:** Glossary is **accurate** that Model Governance is L0. However, AQLIYA_ARCHITECTURE.md lists "Model Governance" under the Intelligence Core hierarchy as if it were an active engine. This inconsistency creates confusion: is it an active Core engine (as the architecture diagram implies) or a strategic future capability (as the glossary states)?

**No change needed** to the glossary — but the architecture doc should be reviewed for consistency.

### Conflict 5: RiskOS Brand Categorization

| Source | Claim | Status |
|---|---|---|
| **Glossary v1.1** | Treats RiskOS as a standalone future product in the product list | ⚠️ Implied standalone |
| **Strategy docs** | "AuditOS submodule, not standalone brand" | ⚠️ Different frame |

**Verdict:** The glossary places RiskOS in the product list alongside ComplianceOS/LegalOS/GovOS, implying it is a future standalone product. The implemented reality (and strategy docs) treat it as an **audit-adjacent risk workspace** — not a standalone product brand. This needs clarification: the glossary should note RiskOS is an audit-adjacent workspace, not a future standalone product.

---

## 7. Consistent Terms (No Action Needed)

These glossary entries match the current PRODUCT_STATUS_MATRIX.md and code reality:

| Term | Glossary Status | Reality Status | Match |
|---|---|---|---|
| AQLIYA | Parent company/platform | Parent company/platform | ✅ |
| AQLIYA Intelligence Core | Shared platform layer | Shared platform layer (L4) | ✅ |
| AQLIYA Cloud | Implemented | Implemented | ✅ |
| AQLIYA Private / On-Prem | Future | L0 | ✅ |
| AQLIYA Studio | Not implemented | L0 | ✅ |
| AuditOS | First proof product, pilot-ready | L5 Pilot-ready | ✅ |
| DecisionOS | Real active adjacent system | L5 Pilot-ready | ✅ |
| Office AI Assistant | Governed shared application | L5 Pilot-ready | ✅ |
| WorkflowOS | Governed workspace at /workflowos/* | L5 Pilot-ready | ✅ |
| Sunbul | Legacy redirect to WorkflowOS | Redirect alias | ✅ |
| SalesOS | Prototype only | L5 Pilot-ready (internal preview) | ⚠️ Minor — glossary says prototype, Matrix says L5 |
| LocalContentOS | Strategic second product, L5 | L5 Pilot-ready with conditions | ✅ |
| SimulationOS | Marketing/category label | L1 Marketing | ✅ |
| ComplianceOS | Future | L0 | ✅ |
| LegalOS | Future | L0 | ✅ |
| GovOS | Future | L0 | ✅ |
| Evidence Graph | Partially real | Partial — strong in AuditOS | ✅ |
| Governance Engine | Shared runtime | Active | ✅ |
| Audit Logs | Domain and platform logs | Active | ✅ |
| Local AI Provider | Strategic future | L4 pilot with conditions | ⚠️ Minor — glossary says L0, reality is L4 pilot |

---

## 8. Recommended Updates — Glossary v1.2

### Immediate (Critical — fix before any glossary publication):

| # | Action | File | Priority |
|---|---|---|---|
| 1 | Update **RiskOS** from "Not implemented" → "AuditOS-adjacent risk workspace (L5 Pilot-ready). Dashboard, assessment workflow, procedure tracking, audit trail, JSON export. Not a standalone product." | Glossary | **P0** |
| 2 | Update **LocalContactOS** from "Not implemented" → "Institutional relationship workspace (L5 Pilot-ready). Contact registry, relations, interactions, evidence, review/export, risk flags, audit trail, Saudi-market seed data, 15 integration tests. Routes at /contacts/*." | Glossary | **P0** |
| 3 | Update **Institutional Memory** from "Strategic future — not implemented" → "Cross-product entity linking engine (L5 Pilot-ready). 4 routes at /institutional-memory/*, 4 Prisma models (InstitutionalMemoryEvent, InstitutionalMemoryCollection, IntelligenceGraphNode, IntelligenceGraphEdge), D3.js knowledge graph, JSON export, audit trail. Not L6 production-hardened." | Glossary | **P0** |

### High (fix in glossary v1.2):

| # | Action | File | Priority |
|---|---|---|---|
| 4 | Add **Knowledge Foundation** term (see §3 for proposed entry) | Glossary | **P1** |
| 5 | Add **ContentStudio / Content Studio** term (see §4 for proposed entry) | Glossary | **P1** |
| 6 | Clarify **RiskOS** positioning: not standalone product, but audit-adjacent workspace | Glossary | **P1** |
| 7 | Update **Model Governance** — keep L0 but add note that architecture hierarchy implies it | Glossary | **P2** |
| 8 | Update **SalesOS** from "Prototype only" to "L5 internal preview at /sales/* — not production CRM" | Glossary | **P2** |
| 9 | Update **Local AI Provider** from "Not implemented" to "L4 pilot with conditions — Ollama/hybrid router, operator-configured" | Glossary | **P2** |

---

## 9. Process Recommendation — Keeping Glossary in Sync

### Root Cause

The glossary went 6+ weeks without being updated (created May 2026, never refreshed for June product upgrades). This happened because:

1. **No automated sync** — glossary status was manually entered and never tied to PRODUCT_STATUS_MATRIX.md
2. **No review trigger** — there is no process that says "when PRODUCT_STATUS_MATRIX changes, check glossary"
3. **No version lock** — glossary v1.1 was treated as "final" rather than "living"

### Recommended Process

| # | Rule | Enforcement |
|---|---|---|
| 1 | **Glossary is a living document.** Version bumps must track any product status change. | Version field in header |
| 2 | **Matrix-to-Glossary sync rule.** Every product status change in PRODUCT_STATUS_MATRIX.md must trigger glossary review within 1 business day. | Check in validate-knowledge-governance.mjs |
| 3 | **Pre-commit glossary validation.** Pre-commit hook checks: Are all terms in active docs present in glossary? Do any glossary status claims contradict PRODUCT_STATUS_MATRIX? | Script rule |
| 4 | **Monthly review cadence.** Full glossary review every 30 days regardless of changes. | Calendar reminder |
| 5 | **New term gate.** Any new product/system/capability added to PRODUCT_STATUS_MATRIX must have a corresponding glossary entry or explicit exclusion note. | Documentation freeze rule |

---

## Appendix A: Conflict Resolution Record

Per Knowledge Governance Charter §4, all conflicts documented here follow the hierarchy:

| Conflict | Authority | Verdict |
|---|---|---|
| Glossary (L0) vs Matrix (L5) for RiskOS | PRODUCT_STATUS_MATRIX wins | Glossary must be updated |
| Glossary (L0) vs Matrix (L5) for LocalContactOS | PRODUCT_STATUS_MATRIX wins | Glossary must be updated |
| Glossary (L0) vs Matrix (L5) for Institutional Memory | PRODUCT_STATUS_MATRIX wins | Glossary must be updated |
| Core Architecture (L0) vs Matrix (L5) for Institutional Memory | PRODUCT_STATUS_MATRIX wins | Core Architecture Engine Status table must be updated |
| Master Reference §9 (L3→L4) vs Matrix (L5) for Institutional Memory | PRODUCT_STATUS_MATRIX wins | Master Reference must be updated |

