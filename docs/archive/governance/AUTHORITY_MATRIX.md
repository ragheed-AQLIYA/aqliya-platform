# AUTHORITY_MATRIX.md

## Knowledge Governance Sprint v1 — Phase 2
> Designated Authority per Knowledge Area

| AUTH ID | Area ID | Knowledge Area | Authority Document | Type | Secondary References | Gap? | Notes |
|---------|---------------|-------------------|------|---------------------|------|-------|
| AUTH-VISION | KA-01 | Platform Identity & Positioning | docs/official/aqliya-vision-v1.1.md | Authority | docs/official/AQLIYA_MASTER_REFERENCE.md §2–3 | NO | Vision doc is the canonical identity source |
| KA-02 | Product Status & Maturity | docs/source-of-truth/PRODUCT_STATUS_MATRIX.md | Authority | docs/official/AQLIYA_MASTER_REFERENCE.md §6, docs/official/aqliya-product-taxonomy-v1.1.md | MAJOR | Contradicts 9+ docs on 6 products. See C01–C15. Internal SalesOS self-contradiction. |
| KA-03 | Architecture & System Design | docs/official/aqliya-core-architecture-v1.1.md | Authority | docs/source-of-truth/AQLIYA_ARCHITECTURE.md, docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md | MAJOR | Engine table claims Institutional Memory "Not implemented" — code reality is L5. Stale IM, Model Gov, Local AI statuses. |
| KA-04 | Route Strategy & Navigation | docs/source-of-truth/ROUTE_STRATEGY.md | Authority | docs/official/AQLIYA_MASTER_REFERENCE.md §7, docs/source-of-truth/ROUTE_REGISTRY.md | MAJOR | Self-contradictions: rules 17/18 triplicated (lines 452–461), ContentStudio listed as both L3 and L4. |
| KA-05 | AI Governance & Ethics | docs/governance/ai-governance.md | Authority | docs/official/aqliya-implementation-rules-v1.1.md Rule 5, docs/official/aqliya-vision-v1.1.md Trust Principle | NO | Single authority, aligned across docs |
| KA-06 | Security & Auth | docs/governance/SECURITY_REVIEW.md + docs/governance/tenant-security-governance.md | Authority | docs/official/aqliya-implementation-rules-v1.1.md Rule 6, docs/source-of-truth/ACTION_GUARD_MATRIX.md | MINOR | Two-file authority (grouped per charter); SSO/SCIM at L4 not reflected in all docs |
| KA-07 | Data & Schema | prisma/schema.prisma (canonical) + docs/official/aqliya-core-architecture-v1.1.md §Schema | Reference | docs/source-of-truth/AQLIYA_ARCHITECTURE.md §Schema v0.2 | MAJOR | No single Authority document for schema. Schema changes not documented in any one doc. 3+ docs reference different schema versions. |
| KA-08 | Deployment & Infrastructure | docs/source-of-truth/CORE_PLATFORM_ARCHITECTURE.md | Reference | docs/official/AQLIYA_MASTER_REFERENCE.md §4, docs/official/aqliya-vision-v1.1.md Operating Models | MAJOR | No single Authority. Deployment claims scattered across 5+ docs with contradictions. Roadmap has 7 stale "not included" items. |
| KA-09 | Pilot & Readiness | docs/source-of-truth/READINESS_GATES.md | Authority | docs/source-of-truth/PILOT_RUNBOOK.md, docs/source-of-truth/AQLIYA_CURRENT_STATE.md | NO | Aligned. PDP readiness at 100% (7/7 GREEN) per current state. |
| KA-10 | AuditOS Domain | docs/source-of-truth/aqliya-auditos-boundaries.md | Reference | docs/official/AQLIYA_MASTER_REFERENCE.md §8, docs/source-of-truth/PRODUCT_STATUS_MATRIX.md | MINOR | No dedicated Authority doc. Status consistent at L5 across majority of docs. |
| KA-11 | DecisionOS Domain | docs/official/AQLIYA_MASTER_REFERENCE.md §8 | Reference | docs/source-of-truth/PRODUCT_STATUS_MATRIX.md, docs/source-of-truth/ROUTE_STRATEGY.md §DecisionOS | MINOR | No dedicated Authority. Maturity varies L4↔L5 across docs (Master Reference says L4, Product Status says L5, Route Strategy says L5). |
| KA-12 | LocalContentOS Domain | docs/official/AQLIYA_MASTER_REFERENCE.md §8 | Reference | docs/source-of-truth/PRODUCT_STATUS_MATRIX.md, docs/source-of-truth/ROUTE_STRATEGY.md §LocalContentOS | MINOR | L5 Pilot-ready consistent across most docs. Vision doc had conditions noted. |
| KA-13 | SalesOS Domain | docs/source-of-truth/PRODUCT_STATUS_MATRIX.md (SalesOS row) | Reference | docs/official/AQLIYA_MASTER_REFERENCE.md §11, docs/source-of-truth/ROUTE_STRATEGY.md §SalesOS | CRITICAL | Maturity ranges L0→L5 across 9 docs. Vision doc says "do not claim", Glossary says "prototype only", Taxonomy says L3, Status says L5, Route says L5, Roadmap v1.2 says L4. |
| KA-14 | WorkflowOS Domain | docs/official/AQLIYA_MASTER_REFERENCE.md §8 | Reference | docs/source-of-truth/PRODUCT_STATUS_MATRIX.md, docs/source-of-truth/ROUTE_STRATEGY.md §WorkflowOS | MINOR | Maturity varies L4↔L5. Charter Maturity Matrix says L5, AQLIYA_ARCHITECTURE says L5 Pilot-ready, Master Reference says L4. |
| KA-15 | Office AI Domain | docs/official/AQLIYA_MASTER_REFERENCE.md §8 | Reference | docs/source-of-truth/PRODUCT_STATUS_MATRIX.md, docs/source-of-truth/ROUTE_STRATEGY.md §Office AI | MINOR | Maturity varies L4↔L5. Status matrix says L5, Master Reference says L4. Consistent on being "shared application." |
| KA-16 | Institutional Memory Domain | docs/source-of-truth/AQLIYA_ARCHITECTURE.md §Institutional Memory | Reference | docs/source-of-truth/PRODUCT_STATUS_MATRIX.md (IM row), docs/source-of-truth/ROUTE_STRATEGY.md §IM | CRITICAL | Maturity ranges L0→L5 across 12+ docs. Vision/Glossary/Impl Rules/Core Arch say "not implemented"/"strategic future". Product Status says L5, Route says L5, Current State says L4 partial. |
| KA-17 | RiskOS Domain | docs/source-of-truth/PRODUCT_STATUS_MATRIX.md (RiskOS row) | Reference | docs/source-of-truth/ROUTE_STRATEGY.md §RiskOS, docs/source-of-truth/AQLIYA_CURRENT_STATE.md | CRITICAL | Maturity ranges L0→L5. Glossary says "not implemented". Product Status says L5, Route says L5, Master Reference says L5 (not standalone). |
| KA-18 | LocalContactOS Domain | docs/source-of-truth/PRODUCT_STATUS_MATRIX.md (LocalContactOS row) | Reference | docs/source-of-truth/ROUTE_STRATEGY.md §LocalContactOS, docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md | CRITICAL | Maturity ranges L0→L5. Vision/Glossary/Taxonomy say "not implemented". Product Status says L5, Route says L5, Current State says L5. |
| KA-19 | Knowledge Foundation | docs/source-of-truth/PRODUCT_STATUS_MATRIX.md (Knowledge Foundation row) | Reference | docs/source-of-truth/ROUTE_STRATEGY.md §Knowledge Foundation | MINOR | L4 consistent. No dedicated Authority doc. Referenced in product status + route strategy only. |
| KA-20 | Intelligence Core | docs/official/aqliya-core-architecture-v1.1.md §Core Engine | Authority | docs/source-of-truth/AQLIYA_ARCHITECTURE.md §Intelligence Core, docs/official/AQLIYA_MASTER_REFERENCE.md §5 | MAJOR | Engine table has 3 stale statuses (Institutional Memory, Model Governance, Local AI). Needs alignment with PRODUCT_STATUS_MATRIX. |
| KA-21 | ContentStudio Domain | docs/source-of-truth/PRODUCT_STATUS_MATRIX.md (ContentStudio row) | Reference | docs/source-of-truth/ROUTE_STRATEGY.md §ContentStudio | MINOR | Self-contradiction: Route strategy rule 18 says L3, route table says L4. No standalone Authority doc. |
| KA-22 | Commercial & Marketing | docs/official/aqliya-vision-v1.1.md (Website Positioning) | Authority | docs/official/aqliya-product-taxonomy-v1.1.md, docs/official/AQLIYA_MASTER_REFERENCE.md §5b | MINOR | Website positioning consistent. Vision doc "Do Not Claim" list has 4 items now implemented (IM, SalesOS, LocalContactOS, RiskOS). |
| KA-23 | Documentation Governance | docs/DOCUMENTATION_AUTHORITY.md | Authority | docs/governance/aqliya-knowledge-governance-charter-v1.md | NO | Single authority. Charter at Level 2 (subordinate). Both aligned. |
| KA-24 | Glossary & Terminology | docs/official/aqliya-glossary-v1.1.md | Authority | docs/official/aqliya-product-taxonomy-v1.1.md, docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md | MAJOR | 3 stale terms: RiskOS (§47), LocalContactOS (§46), Institutional Memory (§62) — all claim "not implemented" but code reality is L5. |
| KA-25 | AI Runtime | docs/governance/adr-local-ai-runtime.md | Authority | docs/source-of-truth/PRODUCT_STATUS_MATRIX.md (Local AI runtime row) | MINOR | New KA per ADR-002 (DEC-2026-0019). Covers local/cloud AI runtime operations, provider integration, model loading, inference. Not a Deployment concern. |

---

### AUTH-XXX ID Mapping

Per Sprint M2 Knowledge Data Model, each Authority document is assigned a permanent AUTH ID:

| AUTH ID | Area ID | Document |
|---------|---------|----------|
| AUTH-VISION | KA-01 | aqliya-vision-v1.1.md |
| AUTH-PRODUCT-STATUS | KA-02 | PRODUCT_STATUS_MATRIX.md |
| AUTH-ARCHITECTURE | KA-03 | aqliya-core-architecture-v1.1.md |
| AUTH-ROUTE | KA-04 | ROUTE_STRATEGY.md |
| AUTH-AI-GOV | KA-05 | ai-governance.md |
| AUTH-SECURITY | KA-06 | SECURITY_REVIEW.md |
| AUTH-SCHEMA | KA-07 | prisma/schema.prisma (with doc) |
| AUTH-DEPLOY | KA-08 | CORE_PLATFORM_ARCHITECTURE.md |
| AUTH-PILOT | KA-09 | READINESS_GATES.md |
| AUTH-AUDIT | KA-10 | aqliya-auditos-boundaries.md |
| AUTH-DECISION | KA-11 | AQLIYA_MASTER_REFERENCE.md §8 |
| AUTH-LOCALCONTENT | KA-12 | AQLIYA_MASTER_REFERENCE.md §8 |
| AUTH-SALES | KA-13 | PRODUCT_STATUS_MATRIX.md (SalesOS row) |
| AUTH-WORKFLOW | KA-14 | AQLIYA_MASTER_REFERENCE.md §8 |
| AUTH-OFFICEAI | KA-15 | AQLIYA_MASTER_REFERENCE.md §8 |
| AUTH-IM | KA-16 | AQLIYA_ARCHITECTURE.md §IM |
| AUTH-RISK | KA-17 | PRODUCT_STATUS_MATRIX.md (RiskOS row) |
| AUTH-LOCALCONTACT | KA-18 | PRODUCT_STATUS_MATRIX.md (LocalContactOS row) |
| AUTH-KNOWLEDGE-FDN | KA-19 | PRODUCT_STATUS_MATRIX.md (Knowledge Foundation row) |
| AUTH-INTELLIGENCE | KA-20 | aqliya-core-architecture-v1.1.md §Core Engine |
| AUTH-CONTENTSTUDIO | KA-21 | PRODUCT_STATUS_MATRIX.md (ContentStudio row) |
| AUTH-COMMERCIAL | KA-22 | aqliya-vision-v1.1.md (Website Positioning) |
| AUTH-DOC-GOV | KA-23 | DOCUMENTATION_AUTHORITY.md |
| AUTH-GLOSSARY | KA-24 | aqliya-glossary-v1.1.md |
| AUTH-LOCAL-AI | KA-25 | adr-local-ai-runtime.md |

These AUTH IDs are referenced in Claim Registry entries (`Authority Refs` field) and in Evidence Manifests.

## Duplicate Authorities Detected

The following Knowledge Areas have 2+ documents claiming authority:

| Area ID | Knowledge Area | Conflicting Documents | Resolution |
|---------|---------------|----------------------|------------|
| D01 | Product Status (KA-02) | PRODUCT_STATUS_MATRIX.md (charter-designated), AQLIYA_MASTER_REFERENCE.md §6 (Master status table), qliya-product-taxonomy-v1.1.md (§Current Classification Matrix), ROUTE_STRATEGY.md (per-route status claims), AQLIYA_SYSTEM_TAXONOMY.md (§Release-Scope Mapping), AQLIYA_CURRENT_STATE.md, AQLIYA_ROADMAP_v1.2.md (§Part 3) | 7 documents claim product status authority. Charter designates PRODUCT_STATUS_MATRIX.md. Others must demote to Reference. |
| D02 | Architecture (KA-03) | qliya-core-architecture-v1.1.md (charter-designated), AQLIYA_ARCHITECTURE.md (source-of-truth), AQLIYA_SYSTEM_TAXONOMY.md (classification), CORE_PLATFORM_ARCHITECTURE.md (deployment) | Charter designates Core Architecture. AQLIYA_ARCHITECTURE duplicates engine tables and route maps. Must cite, not duplicate. |
| D03 | Route Strategy (KA-04) | ROUTE_STRATEGY.md (charter-designated), AQLIYA_MASTER_REFERENCE.md §7 (master route map), AQLIYA_ARCHITECTURE.md (§Route Model), ROUTE_REGISTRY.md | Master Reference §7 and Architecture §Route Model both maintain route status tables. Must redirect to ROUTE_STRATEGY.md. |
| D04 | Security (KA-06) | SECURITY_REVIEW.md + 	enant-security-governance.md (charter-designated), qliya-implementation-rules-v1.1.md Rule 6, ACTION_GUARD_MATRIX.md | Charter groups as two-file authority. Implementation Rules and Action Guard must cite, not duplicate. |
| D05 | SalesOS Status (KA-13) | PRODUCT_STATUS_MATRIX.md (L5), AQLIYA_MASTER_REFERENCE.md (L4), qliya-product-taxonomy-v1.1.md (L3), qliya-vision-v1.1.md (L0 — not claimed), qliya-glossary-v1.1.md (L3), AQLIYA_SYSTEM_TAXONOMY.md (L3), AQLIYA_ROADMAP_v1.2.md (L4), AQLIYA_CURRENT_STATE.md (L5), ROUTE_STRATEGY.md (L5) | 9 docs with conflicting maturity claims. Code reality is L5. All must align to PRODUCT_STATUS_MATRIX. |
| D06 | Institutional Memory Status (KA-16) | PRODUCT_STATUS_MATRIX.md (L5), AQLIYA_MASTER_REFERENCE.md (L3→L4 partial), qliya-core-architecture-v1.1.md (L0 — "Not implemented"), qliya-vision-v1.1.md (L0 — "Do not claim"), qliya-glossary-v1.1.md (L0), qliya-implementation-rules-v1.1.md (L0), AQLIYA_SYSTEM_TAXONOMY.md (L3), AQLIYA_CURRENT_STATE.md (L4 partial), ROUTE_STRATEGY.md (L5) | 12+ docs with range L0→L5. Code reality is L5 (seeds, routes, graph, export). Critical chain break. |
| D07 | RiskOS Status (KA-17) | PRODUCT_STATUS_MATRIX.md (L5), qliya-glossary-v1.1.md (L0 — "not implemented"), qliya-core-architecture-v1.1.md (L0 — "Future products"), AQLIYA_MASTER_REFERENCE.md (L5 partial), AQLIYA_CURRENT_STATE.md (L4), ROUTE_STRATEGY.md (L5) | 6 docs with range L0→L5. Code reality is L5 with seeds, assessment detail, procedure tracking, audit trail, export. |
| D08 | LocalContactOS Status (KA-18) | PRODUCT_STATUS_MATRIX.md (L5), qliya-product-taxonomy-v1.1.md (L0 — "not implemented"), qliya-glossary-v1.1.md (L0), qliya-vision-v1.1.md (L0), AQLIYA_MASTER_REFERENCE.md (L4→L5 partial), AQLIYA_CURRENT_STATE.md (L5), ROUTE_STRATEGY.md (L5) | 7 docs with range L0→L5. Code reality is L5 with Saudi-market seeds, risk flags, dashboard, 15 tests. |

---

## Missing Authorities

The following Knowledge Areas have NO designated Authority document:

| Area ID | Knowledge Area | Current Coverage | Recommended Action |
|---------|---------------|-----------------|-------------------|
| M01 | AuditOS Domain (KA-10) | Referenced in 7+ docs, no single Authority | Promote docs/source-of-truth/aqliya-auditos-boundaries.md to Authority, or create new doc |
| M02 | Data & Schema (KA-07) | Schema changes documented in bits across 3+ docs | Create Authority doc referencing prisma/schema.prisma as canonical source |
| M03 | Deployment & Infrastructure (KA-08) | Claims scattered across 5+ docs with contradictions | Create Authority doc, or designate docs/source-of-truth/CORE_PLATFORM_ARCHITECTURE.md |
| M04 | DecisionOS Domain (KA-11) | No dedicated doc; referenced in Master Reference §8 + status matrix | Create Domain doc or designate docs/products/decisionos.md |
| M05 | Knowledge Foundation (KA-19) | Listed in product status + route strategy only | Create Domain doc |
| M06 | ContentStudio Domain (KA-21) | Listed in product status + route strategy with L3/L4 self-contradiction | Create Domain doc. Resolve L3 vs L4 first. |
| M07 | SalesOS Domain (KA-13) | 9 conflicting documents; no single Authority | Create Domain Authority. Must resolve the L0→L5 contradiction first. |
| M08 | LocalContentOS Domain (KA-12) | Referenced in Master Reference §8 + status matrix; no dedicated Authority | Create Domain doc referencing existing evidence |
| M09 | WorkflowOS Domain (KA-14) | No dedicated Authority doc | Create Domain doc |
| M10 | Office AI Domain (KA-15) | No dedicated Authority doc | Create Domain doc |
| M11 | Institutional Memory Domain (KA-16) | No dedicated Authority; 12+ conflicting docs | Create Domain Authority — critical priority given the L0→L5 conflict |
| M12 | RiskOS Domain (KA-17) | No dedicated Authority; 6 conflicting docs | Create Domain Authority |
| M13 | LocalContactOS Domain (KA-18) | No dedicated Authority; 7 conflicting docs | Create Domain Authority |
| M14 | Intelligence Core (KA-20) | Partially covered by Core Architecture; engine table stale | Update Core Architecture engine table. Create dedicated Knowledge Area doc. |

---

## Broken Authority Chains

Areas where the designated Authority document is stale vs code reality:

| Area ID | Knowledge Area | Stale Authority | Stale Claim | Code Reality | Impact |
|---------|---------------|----------------|-------------|--------------|--------|
| B01 | Product Status (KA-02) | PRODUCT_STATUS_MATRIX.md (SalesOS) | Not yet L4 production-usable, not L5 pilot-ready (Reality Notes) | L5 — 13 Prisma models, 80 components, seeds, sidebar, dashboard | Internal self-contradiction |
| B02 | Architecture (KA-03) | qliya-core-architecture-v1.1.md Engine Table | Institutional Memory: Not implemented — Strategic/future | L5 — routes, models, seeds, D3 graph, export, audit trail | Misleading developers. Already used in 3+ integrations. |
| B03 | Architecture (KA-03) | qliya-core-architecture-v1.1.md Engine Table | AI Orchestration: Partial / deterministic — no live cloud/local runtime | L5 — Provider factory, router, cost mapping, spend tracker, eval framework, governed executor all implemented | Understates Core maturity |
| B04 | Route Strategy (KA-04) | ROUTE_STRATEGY.md Rules 17/18 | ContentStudio: L3 prototype — Not L4 usable v0.1 (Rule 18), vs route table: Usable v0.1 (L4) | L4 — seed data added (Phase 22), PDF export added (Phase 23), sidebar entry | Self-contradiction within same doc |
| B05 | Glossary (KA-24) | qliya-glossary-v1.1.md §RiskOS | RiskOS: Future risk intelligence system. Not implemented. | L5 — dashboard, assessment detail, procedure tracking, audit trail, JSON export | Blocks pilot conversations |
| B06 | Glossary (KA-24) | qliya-glossary-v1.1.md §LocalContactOS | LocalContactOS: Future institutional relationship intelligence system. Not implemented. | L5 — Saudi-market seeds, dashboard, risk flags, export workflow, 15 tests | Blocks pilot conversations |
| B07 | Glossary (KA-24) | qliya-glossary-v1.1.md §Institutional Memory | Institutional Memory: Strategic future memory engine. Not implemented. | L5 — 10 cross-product events, 13 graph nodes, collections, export, audit | Blocks pilot conversations |
| B08 | Vision (KA-01) | qliya-vision-v1.1.md §Do Not Claim | Institutional Memory engine — do not claim as implemented | L5 — see B07 | Commercial risk: under-selling |
| B09 | Vision (KA-01) | qliya-vision-v1.1.md §Do Not Claim | SalesOS backend/workflow — do not claim as implemented | L5 — 30 routes, 13 Prisma models, seeds, sidebar | Commercial risk: under-selling |
| B10 | Vision (KA-01) | qliya-vision-v1.1.md §Do Not Claim | LocalContactOS backend — do not claim as implemented | L5 — see B06 | Commercial risk: under-selling |
| B11 | Roadmap v1.1 (KA-08) | qliya-roadmap-v1.1.md §Not Included | SalesOS — not included as implemented product release | L5 Pilot-ready | Roadmap is misleading |
| B12 | Roadmap v1.1 (KA-08) | qliya-roadmap-v1.1.md §Not Included | LocalContactOS — not included as implemented product release | L5 Pilot-ready | Roadmap is misleading |
| B13 | Roadmap v1.1 (KA-08) | qliya-roadmap-v1.1.md §Not Included | RiskOS — not included as implemented product release | L5 Pilot-ready | Roadmap is misleading |
| B14 | Roadmap v1.1 (KA-08) | qliya-roadmap-v1.1.md §Not Included | Institutional Memory engine — not included as implemented product release | L5 Pilot-ready | Roadmap is misleading |
| B15 | Roadmap v1.1 (KA-08) | qliya-roadmap-v1.1.md §Not Included | Local AI runtime — not included as implemented product release | L4 pilot with conditions | Roadmap is misleading |
| B16 | Implementation Rules (KA-05) | qliya-implementation-rules-v1.1.md Rule 6 | Institutional Memory engine — not yet supported by code | L5 — see B07 | Agents told IM is not implemented |
| B17 | Implementation Rules (KA-05) | qliya-implementation-rules-v1.1.md Rule 6 | SalesOS backend/workflow — not yet supported by code | L5 Pilot-ready | Agents told SalesOS is not implemented |
| B18 | Implementation Rules (KA-05) | qliya-implementation-rules-v1.1.md Rule 6 | SSO/LDAP/AD integration — not yet supported by code | L4 — SSO at L4 with operator setup | Understates current capability |
| B19 | Agent Context (KA-23) | qliya-agent-context-v1.1.md §8 | Institutional Memory — not implemented | L5 | Agents misinformed about IM availability |
| B20 | Product Taxonomy (KA-22) | qliya-product-taxonomy-v1.1.md §Classification | SalesOS: L3 Prototype — Do not show as implemented | L5 Pilot-ready | Misinforms marketing and sales |
| B21 | Product Taxonomy (KA-22) | qliya-product-taxonomy-v1.1.md §Classification | LocalContactOS: L0 Concept — Not implemented | L5 Pilot-ready | Misinforms marketing and sales |
| B22 | Product Taxonomy (KA-22) | qliya-product-taxonomy-v1.1.md §Classification | ContentStudio: L3 Prototype — Internal only | L4 usable v0.1 (seed data + PDF export + sidebar) | Understates current capability |
| B23 | System Taxonomy (KA-03) | AQLIYA_SYSTEM_TAXONOMY.md §Release-Scope | Institutional Memory: L3 Prototype — Internal only | L5 Pilot-ready | Understates capability |
| B24 | System Taxonomy (KA-03) | AQLIYA_SYSTEM_TAXONOMY.md §Release-Scope | SalesOS: L3 Prototype — Do not show as implemented | L5 Pilot-ready | Misinforms marketing |
| B25 | System Taxonomy (KA-03) | AQLIYA_SYSTEM_TAXONOMY.md §Release-Scope | LocalContactOS: Not listed in release-scope mapping | L5 Pilot-ready | Missing entirely from taxonomy by maturity |

---

## Summary

- **Total Areas:** 24
- **Clear Authorities:** 8 (KA-01 Platform Identity, KA-05 AI Governance, KA-09 Pilot & Readiness, KA-20 Intelligence Core partial, KA-22 Commercial & Marketing, KA-23 Documentation Governance, KA-24 Glossary — though stale)
- **Duplicates (2+ docs claiming authority for one area):** 8 (D01–D08)
- **Missing Authorities (no designated Authority doc):** 14 (M01–M14)
- **Broken Authority Chains (Authority stale vs code):** 25 (B01–B25)
- **Critical Broken Chains (L0→L5 gap):** 12 (B01–B03, B05–B07, B08–B10, B16–B17, B20–B21)
- **Docs with 4+ contradictions:** 7 (Vision, Glossary, Implementation Rules, Product Taxonomy, Roadmap v1.1, System Taxonomy, Core Architecture)
