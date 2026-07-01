# Canonical Product Registry

> **Part of:** Sprint v2 — P1: Product Inventory  
> **Status:** ✅ Registered — active Sprint v2 baseline  
> **Date:** 2026-06-29  
> **Governance Rule:** This registry is the **single source of truth** for product identity. No product name, entity type, or KnowledgeArea may change without a Governance Decision.

---

## 1. Registry Schema

| Field | Required | Description |
|-------|----------|-------------|
| PROD-ID | Yes | Permanent product identifier (`PROD-{NAME}`) |
| Product Name | Yes | Official name (Arabic + English) |
| Entity Type | Yes | Platform / Product / Workspace / Engine / Foundation / Runtime / Service / Library |
| KnowledgeArea | Yes | KA-XXX (from AUTHORITY_MATRIX.md) |
| Authority | Yes | AUTH-XXX (governing authority document) |
| Current L-Level | Yes | As documented in PRODUCT_STATUS_MATRIX.md (pre-Governance Review) |
| L-Level Status | Yes | Verified / Disputed / Frozen |
| Strategic Intent | Yes | Approved / Deferred / Frozen / Experimental |
| Parent System | Conditional | If this is a Workspace or sub-entity, its parent Product name |
| Evidence Status | Yes | Not Started / Partial / Complete |
| Manifest Status | Yes | Missing / Generated |
| Dossier Status | Yes | Missing / Generated |
| Last Verification | Yes | Date of last evidence check |

---

## 2. Registry

| PROD-ID | Product Name | Entity Type | KA | Authority | Current L-Level | L-Level Status | Strategic Intent | Parent | Evidence | Manifest | Dossier | Last Verified |
|---------|-------------|-------------|----|-----------|-----------------|----------------|------------------|--------|----------|----------|---------|---------------|
| PROD-AUDITOS | AuditOS (نظام التدقيق) | Product | KA-10 | AUTH-AUDIT | L5 | Verified | Approved | — | Complete | Generated | Generated | 2026-06-29 |
| PROD-DECISIONOS | DecisionOS (نظام القرارات) | Product | KA-11 | AUTH-DECISION | L4–L5 | Disputed | Frozen | — | Not Started | Missing | Missing | 2026-06-29 |
| PROD-WORKFLOWOS | WorkflowOS (نظام سير العمل) | Workspace | KA-14 | AUTH-WORKFLOW | L4–L5 | Disputed | Frozen | — | Complete (11 claims, GR-009 validated) | Generated | Generated | 2026-06-29 |
| PROD-OFFICEAI | Office AI Assistant (مساعد الذكاء الاصطناعي) | Workspace | KA-15 | AUTH-OFFICEAI | L4–L5 | Disputed | Frozen | — | Partial (scalability baseline set) | Missing | Missing | 2026-06-29 |
| PROD-SALESOS | SalesOS (نظام المبيعات) | Product | KA-13 | AUTH-SALES | L3–L5 | Disputed | Frozen | — | Partial (Governance Resolution plan created) | Missing | Missing | 2026-06-29 |
| PROD-IM | Institutional Memory (الذاكرة المؤسسية) | Engine | KA-16 | AUTH-IM | L0–L5 | Disputed | Frozen | — | Partial (Knowledge Engine pattern selected) | Missing | Missing | 2026-06-29 |
| PROD-LOCALCONTACT | LocalContactOS (نظام العلاقات المحلية) | Product | KA-18 | AUTH-LOCALCONTACT | L0–L5 | Disputed | Frozen | — | Partial (Relationship Domain pattern started) | Missing | Missing | 2026-06-29 |
| PROD-RISKOS | RiskOS (نظام المخاطر) | Workspace | KA-17 | AUTH-RISK | L0–L5 | Disputed | Frozen | — | Partial (Workspace pattern selected) | Missing | Missing | 2026-06-29 |
| PROD-CONTENTSTUDIO | ContentStudio (استوديو المحتوى) | Workspace | KA-21 | AUTH-CONTENTSTUDIO | L3–L4 | Disputed | Frozen | LocalContentOS | Partial (historical timeline created) | Missing | Missing | 2026-06-29 |
| PROD-LOCALCONTENT | LocalContentOS (نظام المحتوى المحلي) | Product | KA-12 | AUTH-LOCALCONTENT | L4–L5 | Disputed | Frozen | — | Not Started | Missing | Missing | 2026-06-29 |
| PROD-KNOWLEDGE-FDN | Knowledge Foundation (أساس المعرفة) | Foundation | KA-19 | AUTH-KNOWLEDGE-FDN | L4 | Verified | Approved | — | Not Started | Missing | Missing | 2026-06-29 |
| PROD-INTELLIGENCE-CORE | Intelligence Core (النواة الذكية) | Engine | KA-20 | AUTH-INTELLIGENCE | L3–L4 | Verified | Approved | — | Complete (11 claims, 11 EV) | Generated | Generated | 2026-06-29 |
| PROD-LOCAL-AI | Local AI Runtime (بيئة تشغيل الذكاء المحلي) | Runtime | KA-25 | AUTH-LOCAL-AI | L0–L4 | Disputed | Experimental | — | Not Started | Missing | Missing | 2026-06-30 |
| PROD-AQLIYA-CORE | AQLIYA Core (النواة الأساسية) | Platform | KA-03 | AUTH-ARCHITECTURE | L5 | Verified | Approved | — | Not Started | Missing | Missing | 2026-06-29 |

---

## 3. Validation Gates

### P1-G1: No duplicate identity or role
| Check | Result |
|-------|--------|
| All PROD-IDs unique | ✅ 14 unique IDs |
| No two products claim the same role | ✅ All entity types correctly assigned |
| No two products share the same route namespace | ⚠️ ContentStudio is a Workspace under LocalContentOS — routes are nested, not competing |

### P1-G2: Every product linked to exactly one KnowledgeArea and one Authority
| PROD-ID | KA Count | AUTH Count | Status |
|---------|----------|------------|--------|
| PROD-AUDITOS | 1 (KA-10) | 1 (AUTH-AUDIT) | ✅ |
| PROD-DECISIONOS | 1 (KA-11) | 1 (AUTH-DECISION) | ✅ |
| PROD-WORKFLOWOS | 1 (KA-14) | 1 (AUTH-WORKFLOW) | ✅ |
| PROD-OFFICEAI | 1 (KA-15) | 1 (AUTH-OFFICEAI) | ✅ |
| PROD-SALESOS | 1 (KA-13) | 1 (AUTH-SALES) | ✅ |
| PROD-IM | 1 (KA-16) | 1 (AUTH-IM) | ✅ |
| PROD-LOCALCONTACT | 1 (KA-18) | 1 (AUTH-LOCALCONTACT) | ✅ |
| PROD-RISKOS | 1 (KA-17) | 1 (AUTH-RISK) | ✅ |
| PROD-CONTENTSTUDIO | 1 (KA-21) | 1 (AUTH-CONTENTSTUDIO) | ✅ |
| PROD-LOCALCONTENT | 1 (KA-12) | 1 (AUTH-LOCALCONTENT) | ✅ |
| PROD-KNOWLEDGE-FDN | 1 (KA-19) | 1 (AUTH-KNOWLEDGE-FDN) | ✅ |
| PROD-INTELLIGENCE-CORE | 1 (KA-20) | 1 (AUTH-INTELLIGENCE) | ✅ |
| PROD-LOCAL-AI | 0 (unassigned) | 0 (unassigned) | ⚠️ Needs KA and AUTH assignment |
| PROD-AQLIYA-CORE | 1 (KA-03) | 1 (AUTH-ARCHITECTURE) | ✅ |

### P1-G3: Every product classified into exactly one entity type
| Type | Count | Products |
|------|-------|----------|
| **Platform** | 1 | AQLIYA Core |
| **Product** | 6 | AuditOS, DecisionOS, SalesOS, LocalContentOS, LocalContactOS, RiskOS |
| **Workspace** | 3 | WorkflowOS, Office AI Assistant, ContentStudio |
| **Engine** | 2 | Institutional Memory, Intelligence Core |
| **Foundation** | 1 | Knowledge Foundation |
| **Runtime** | 1 | Local AI Runtime |
| **Service** | 0 | — |
| **Library** | 0 | — |

### P1-Qual: Products assigned to Sprint v2 scope
| Scope | Count | Products |
|-------|-------|----------|
| **In Sprint v2 (disputed L-levels)** | 10 | DecisionOS, WorkflowOS, Office AI, SalesOS, IM, LocalContactOS, RiskOS, ContentStudio, LocalContentOS, Local AI Runtime |
| **Already verified (L5/L4 stable)** | 3 | AuditOS (✅ seed done), Knowledge Foundation, Intelligence Core |
| **Platform (not under review)** | 1 | AQLIYA Core |

---

## 4. Entity Type Definitions

| Type | Definition | Example | L-Level Criteria |
|------|-----------|---------|-----------------|
| **Platform** | The shared foundation that all products build upon. Not a product itself. | AQLIYA Core | N/A — platform health is measured differently |
| **Product** | A named operational system with its own route namespace, data model, workflow, and governance. | AuditOS, SalesOS | Full AGENTS.md §21 DoD |
| **Workspace** | A governed surface within a product or platform, with its own workflow but dependent on a parent. | WorkflowOS (client workspace), ContentStudio (content workspace) | AGENTS.md §21 DoD, but scope limited to workspace boundaries |
| **Engine** | A shared capability that multiple products depend on, with its own data model but no independent route surface. | Intelligence Core, Institutional Memory | Engine maturity rubric (different from product DoD) |
| **Foundation** | A foundational layer for knowledge assets, primarily storage and retrieval. | Knowledge Foundation | Foundation maturity rubric (stability + API surface) |
| **Runtime** | A technical execution environment with infrastructure dependencies. | Local AI Runtime | Runtime maturity rubric (deployment + performance + security) |
| **Service** | A cross-cutting service consumed by multiple products. | (future) | Service maturity rubric (uptime + API + SLAs) |
| **Library** | A reusable code library without independent deployment. | (future) | Library maturity rubric (API stability + test coverage) |

---

## 5. P1 Closure Checklist

| # | Criterion | Status |
|---|-----------|--------|
| 1 | All entities have permanent PROD-ID | ✅ 14 IDs assigned |
| 2 | All entities have Entity Type | ✅ 8 types, all assigned |
| 3 | All entities linked to exactly one KA | ⚠️ PROD-LOCAL-AI needs KA assignment |
| 4 | All entities linked to exactly one AUTH | ⚠️ PROD-LOCAL-AI needs AUTH assignment |
| 5 | No duplicate names | ✅ All unique |
| 6 | No unclassified entities | ✅ All classified |
| 7 | All Sprint v2 target products present in registry | ✅ 10 disputed + 3 stable + 1 platform |

**P1-G1:** ✅ Passed  
**P1-G2:** ✅ Passed — PROD-LOCAL-AI assigned KA-25 and AUTH-LOCAL-AI per ADR-002  
**P1-G3:** ✅ Passed

---

## References

- Sprint v2 Charter: `docs/governance/aqliya-knowledge-governance-charter-v2.md`
- M2 Data Model: `docs/governance/aqliya-knowledge-governance-charter-m2.md`
- Authority Matrix: `docs/governance/AUTHORITY_MATRIX.md`
- Product Status Matrix: `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`
