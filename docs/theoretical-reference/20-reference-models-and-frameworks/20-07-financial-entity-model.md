---
title: Financial Entity Model
document_id: 20.07
status: Reviewed v0.2
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 3 - Model / Framework
related_documents: 20.04, 20.05, 04.02, 04.03, 04.04
---

# Financial Entity Model

## 1. Purpose

This document defines the canonical Financial Entity Model — the structural specification for how AQLIYA represents, classifies, relates, and governs financial entities within decision intelligence workflows. A financial entity is any organizational structure, account, transaction, or financial concept that is the subject of analysis, evidence, findings, or decisions. In audit, the financial entity is the client organization, its accounts, its transactions, its related parties, and its reporting units. In financial intelligence, the entity is the ledger, the journal, the cost center, or the consolidation unit. The Financial Entity Model provides a common structural language for representing these entities so that evidence, signals, findings, and decisions can be consistently linked, compared, and aggregated across the entities they concern.

## 2. Thesis

Financial data is not flat. It is structured in hierarchies (groups contain companies, companies contain divisions, divisions contain cost centers), in relationships (entities transact with related parties, subsidiaries intercompany with parents), and in temporal sequences (entities exist across reporting periods, with opening and closing balances). The Financial Entity Model captures this structure so that AQLIYA can link evidence to the right entity, detect signals across entity relationships, identify findings at the correct entity level, and make decisions that are scoped to the right entity context. Without a structured entity model, evidence, signals, and findings are disconnected fragments that cannot be related, compared, or aggregated.

## 3. Problem

In current audit and financial analysis practice, entity information is embedded in document headings, spreadsheet rows, and narrative descriptions. The "entity" is implicit — it is the thing the audit is about, or the thing the account belongs to — but it is not explicitly modeled. When a reviewer refers to "the client," they might mean the consolidated group, the operating subsidiary, or the reporting segment. When a finding references an account, the account's entity context is assumed, not explicit.

This ambiguity creates problems at scale. Evidence gathered for one entity may be inappropriately applied to another. Signals detected across related entities may not be correlated. Findings about one subsidiary may not be connected to findings about its parent. Decisions about one reporting unit may not account for intercompany implications. Entity confusion is a source of audit error, regulatory finding, and analytical blind spot.

## 4. Why Existing Systems Fail

**ERP systems** manage entities as organizational structures for transaction processing, but they do not represent entities as subjects of audit, evidence, and decision intelligence. The ERP entity model serves accounting, not analysis.

**Audit management platforms** reference "the client" but rarely model the entity hierarchy, related party relationships, and reporting unit boundaries that are essential for scoping, evidence allocation, and finding attribution.

**Spreadsheets** model entity information as rows and columns in ad-hoc structures. There is no consistent entity model that links the hierarchy, the relationships, and the temporal dimensions.

**Consolidation tools** model parent-subsidiary relationships for financial reporting but do not connect these relationships to evidence, findings, or decisions. The consolidation entity exists for report generation, not for intelligence.

**Data warehouses** flatten entity information into star schemas optimized for reporting queries. The relational, hierarchical, and temporal properties of entities are lost in dimensional modeling.

The common failure: financial entities are modeled for specific operational purposes (accounting, reporting, consolidation) but not for decision intelligence. AQLIYA models entities as first-class objects that are the subject of evidence, signals, findings, and decisions.

## 5. AQLIYA Philosophy

The Financial Entity Model reflects AQLIYA's principle that financial intelligence is the first moat. Understanding the entity — its structure, its relationships, its financial behavior, and its temporal patterns — is the foundation of financial intelligence. An entity is not just a name and a legal identifier. It is a structured object with hierarchy, relationships, accounts, transactions, risk attributes, and temporal dimensions that enable evidence gathering, signal detection, finding identification, and decision making at the right level of aggregation.

Entities are also governance boundaries. Evidence gathered for one entity may not be appropriate for another. Findings about one entity may not apply to its subsidiaries. Decisions about one reporting unit may have intercompany implications. The entity model enforces these boundaries.

## 6. Core Principles

1. **Entities are first-class objects.** Financial entities have identity, classification, hierarchy, relationships, accounts, and temporal dimensions. They are not references in document headings.

2. **Entities have hierarchy.** Groups contain companies, companies contain divisions, divisions contain cost centers. Hierarchy determines aggregation, consolidation, and reporting levels.

3. **Entities have relationships.** Related parties, intercompany relationships, and control relationships are explicit, not implicit. Entity relationships enable cross-entity signal detection and finding correlation.

4. **Entities have temporal dimensions.** Entities exist across reporting periods. Opening and closing balances, year-over-year changes, and period-over-period comparisons are structured, not calculated on demand.

5. **Entities are governance boundaries.** Evidence, findings, and decisions are scoped to specific entities. Cross-entity application requires explicit governance authorization.

6. **Entities have financial attributes.** Each entity has financial data: accounts, balances, transactions, and ratios. These attributes enable entity-level analysis, signal detection, and risk assessment.

7. **Entities are comparable.** Structured entity representation enables comparison across entities, across periods, and across engagements. Comparison is the foundation of pattern detection and anomaly identification.

8. **Entities support aggregation.** Entity hierarchy enables aggregation of evidence, signals, findings, and decisions from subsidiary to parent, from division to group. Aggregation is controlled, not automatic.

## 7. Key Concepts

- **Entity Object:** The canonical data entity. Fields: entity_id, legal_name, type, parent_entity, hierarchy_level, jurisdiction, industry, reporting_currency, period_range, financial_attributes, governance_context.

- **Entity Type:** A taxonomy of entity classifications. Examples: consolidated_group, operating_company, subsidiary, joint_venture, branch, division, cost_center, reporting_segment, fund, trust.

- **Entity Hierarchy:** The parent-child structure that defines how entities aggregate. A group consists of subsidiaries, a company consists of divisions, a division consists of cost centers. Hierarchy determines consolidation and reporting levels.

- **Entity Relationship:** Explicit relationships between entities that are not hierarchical. Examples: related_party, intercompany_counterparty, guarantor, customer, supplier, common_control. Relationships enable cross-entity analysis and signal detection.

- **Entity-Period:** The representation of an entity across a specific reporting period. Entity-period objects capture opening balances, closing balances, period transactions, and period-specific attributes.

- **Entity Financial Profile:** The financial attributes of an entity: account structure, material balances, key ratios, risk indicators, and historical trends. The financial profile enables entity-level analysis and comparison.

- **Entity Governance Context:** The governance rules that apply to a specific entity based on its type, jurisdiction, industry, and regulatory environment. Governance context determines evidence requirements, approval authority, and reporting treatment.

- **Entity Aggregation:** The controlled rollup of evidence, signals, findings, and decisions from child entities to parent entities. Aggregation is explicit (the user specifies how to aggregate), not implicit (the system assumes summing).

- **Entity Comparison:** The structured comparison of financial attributes, evidence coverage, signal patterns, and finding profiles across entities, periods, and industry benchmarks.

## 8. Operational Implications

1. Entity setup must include hierarchy definition, relationship mapping, and financial profile initialization before engagement work begins. Entity modeling is part of engagement planning, not an afterthought.

2. Entity classification must be consistent across engagements. The same client entity should have the same classification, hierarchy, and relationship representation in every engagement.

3. Entity information must be maintained across periods. Opening balances, historical trends, and period-over-period comparisons require entity data persistence across reporting periods.

4. Cross-entity analysis requires explicit governance authorization. Reviewers analyzing related entities must have access governed by engagement scope and client confidentiality requirements.

5. Entity model changes (new subsidiaries, reorganizations, acquisitions) must be tracked as governance events that may affect engagement scope, evidence coverage, and risk assessment.

## 9. Product Implications

1. Entity visualization must show the hierarchy, relationships, and financial profile in an interactive, navigable format. Partners and reviewers need to understand the entity structure to scope and execute their work.

2. Entity selection must be a primary navigation dimension. Reviewers select the entity they are working on, and all evidence, signals, findings, and decisions are filtered to that entity context.

3. Entity comparison views must enable side-by-side comparison of financial attributes, evidence coverage, signal patterns, and finding profiles across entities and periods.

4. Entity aggregation views must enable partners to roll up findings and signals from subsidiary to group, from division to company, with appropriate governance controls.

5. Entity relationship visualization must show related parties, intercompany relationships, and control structures. This is essential for related-party testing and group audit scoping.

6. Entity search must support professional queries: "show me all entities in the construction sector with revenue over SAR 500M" and "show me all entities with common control with this subsidiary."

## 10. Architecture Implications

1. The Entity Object is a first-class entity in the data model with its own schema, hierarchy, and relationships. Entities are not embedded in transactions or accounts; they are referenced by them.

2. Entity hierarchy is modeled as a closure table or materialized path to support efficient ancestor, descendant, and sibling queries at scale.

3. Entity relationships are modeled as a graph structure. Related parties, intercompany counterparties, and control relationships permit traversal queries that enable cross-entity signal detection and finding correlation.

4. Entity-Period objects enable temporal queries. Financial attributes, evidence coverage, and signal patterns can be compared across periods for the same entity, controlled for entity structure changes.

5. Entity data imports from client ERP systems, financial databases, and external sources must be mapped to the AQLIYA entity model. Mapping is a configuration step, not a one-time load.

6. Cross-entity queries for signal detection and finding correlation must respect tenant isolation and data governance. A firm can analyze patterns across its own engagements but cannot access another firm's data.

7. Entity model changes are tracked as governance events. New subsidiaries, reorganizations, and acquisitions may trigger scope changes, risk reassessment, and evidence gap identification in active engagements.

## 11. Governance Implications

1. Entity model integrity is a governance requirement. Entity classification, hierarchy, and relationships must be verified during engagement planning and reviewed during quality review.

2. Cross-entity evidence sharing is governed. Evidence gathered for one entity may not be used to support a finding about another entity without re-verification in the new entity context.

3. Entity aggregation governance determines which findings, signals, and decisions roll up from subsidiary to group. Not all items aggregate; governance rules determine aggregation rules.

4. Related party identification is a governance responsibility. The entity model supports related party identification, but the completeness and accuracy of related party disclosure is a professional judgment.

5. Entity data accuracy is a shared responsibility between client and auditor. The entity model ingests client data, but verification of that data — including entity structure, ownership, and relationships — is an audit procedure.

6. Entity model changes during an active engagement are flagged for risk reassessment. New related parties may change scope; reorganizations may change hierarchy and reporting.

## 12. AI / Intelligence Implications

1. Entity hierarchy and relationships provide structural context for AI-driven signal detection. A signal about a subsidiary may be significant in the context of the parent's consolidated financials.

2. Cross-entity pattern detection identifies risk conditions that span related parties, intercompany transactions, and common control structures. These patterns are not visible at the individual entity level.

3. Entity financial profile analysis enables AI-driven benchmarking: comparing an entity's financial behavior to industry peers, prior periods, and group norms to detect anomalies.

4. Entity relationship analysis identifies related party transactions, intercompany balances, and control structures that warrant audit attention. AI surfaces relationships that may not be disclosed.

5. Entity model completeness checking identifies gaps: subsidiaries that are not in the entity model, related parties that are missing, and reporting segments that are not represented.

6. AI does not make entity classification or relationship determinations autonomously. Entity model construction is a professional judgment supported by AI assistance.

## 13. UX Implications

1. Entity visualization is the starting point for most engagement workflows. Partners, managers, and reviewers need to see the entity structure before they can scope, plan, or execute work.

2. Entity selection must be fast and precise. Reviewers type an entity name, select from a hierarchy, or filter by type, industry, or jurisdiction. Selection is a primary navigation action.

3. Entity comparison and aggregation must support the reviewer's analytical workflow. Compare this period to last, this entity to its parent, this subsidiary to industry benchmarks — all from the entity view.

4. Entity relationship visualization must be clear, interactive, and exportable. Related party disclosures, intercompany balances, and control structures are frequently referenced in audit documentation.

5. Entity changes in active engagements must be surfaced proactively. New subsidiaries, reorganizations, and acquisitions are flagged as events that may affect scope and risk assessment.

6. Entity search must be the primary way to find engagements, evidence, and findings related to a specific entity. "Everything about this entity" is a common professional query.

## 14. Commercial Implications

1. The Financial Entity Model is a core differentiator for AQLIYA's financial intelligence moat. Structured entity representation enables analysis, comparison, and pattern detection that flat data cannot support.

2. Proof-of-value metrics: entity model completeness, cross-entity signal detection, related party identification, and entity comparison accuracy.

3. Entity model persistence across engagements creates compounding value. Each engagement enriches the entity model, and future engagements benefit from the accumulated data.

4. Entity model portability across domains — from audit to financial reporting to risk management — expands the commercial footprint without requiring entirely new models.

5. Entity model accuracy is a trust driver. Clients who see that AQLIYA accurately represents their structure, relationships, and financial profile trust the system to handle their data correctly.

## 15. Anti-Patterns

1. **Flat Entity Representation.** Treating the entity as a name and identifier without modeling hierarchy, relationships, or financial attributes. This reduces entity intelligence to entity labeling.

2. **Implicit Entity Context.** Assuming the reader knows which entity a piece of evidence, finding, or decision refers to without explicit entity attribution. Entity context must be explicit, not assumed.

3. **Entity Model as Administrative Data.** Treating the entity model as a setup step rather than as an active intelligence foundation. The entity model must be maintained, verified, and updated throughout the engagement.

4. **Uncontrolled Entity Aggregation.** Automatically summing all subsidiary findings to the group level without governance rules. Not all findings aggregate; some are subsidiary-specific and should not be reported at the group level.

5. **Static Entity Model.** Defining the entity model at engagement start and never updating it. Acquisitions, reorganizations, and new related parties change the entity structure during the engagement period.

6. **Entity Data Trust Without Verification.** Importing client entity data and assuming it is complete and accurate. Entity model verification is an audit procedure, not a data import step.

## 16. Examples

**Example 1: Group Audit Entity Setup.** A group audit engagement is set up for a Saudi conglomerate with 12 subsidiaries across three industries. The entity model captures the group hierarchy, identifies three subsidiaries in a regulated industry that require separate regulatory compliance, maps six related party relationships that require specific testing, and flags two subsidiaries with intercompany balances that exceed the group materiality threshold. The partner uses the entity visualization to scope the audit, allocate team resources, and identify risk areas.

**Example 2: Cross-Entity Signal Detection.** During the audit, the system identifies that intercompany transactions between two subsidiaries have increased 340% over the prior year while both subsidiaries show declining profitability. A cross-entity risk signal is generated, connecting the intercompany transaction pattern to the profitability decline. The signal is only visible at the relationship level, not at the individual entity level.

**Example 3: Entity Comparison and Benchmarking.** The system compares the financial profile of a manufacturing subsidiary against industry benchmarks and against other manufacturing subsidiaries in the firm's client portfolio. The comparison reveals that this subsidiary's inventory days are 45% higher than the industry average and 30% higher than similar clients. An entity-level signal is generated for inventory obsolescence risk.

## 17. Enterprise Impact

1. **Entity Intelligence.** Structured entity representation enables analysis, comparison, and pattern detection that flat financial data cannot support. Entity intelligence is the foundation of financial intelligence.

2. **Cross-Entity Visibility.** Related party relationships, intercompany transactions, and control structures are explicitly modeled and visible. Reviewers and partners see the full entity context, not just individual subsidiaries in isolation.

3. **Consistent Entity Representation.** The same entity is represented consistently across engagements, periods, and reviewers. Consistency improves comparison quality and reduces entity confusion.

4. **Aggregation Governance.** Controlled aggregation from subsidiary to group ensures that findings, signals, and decisions are reported at the appropriate level, not automatically summed.

5. **Entity Change Detection.** Structural changes to the client entity — acquisitions, reorganizations, new related parties — are detected and flagged for risk reassessment.

6. **Benchmarking.** Entity financial profiles enable comparison against industry benchmarks, prior periods, and peer entities, supporting risk assessment and audit approach decisions.

## 18. Long-Term Strategic Importance

The Financial Entity Model is the foundation of AQLIYA's financial intelligence moat. It provides the structural language for representing, relating, and analyzing financial entities. Without it, financial data is flat numbers without context. With it, financial data becomes intelligence: entities can be compared, patterns can be detected across relationships, and findings can be attributed to the right level of the organization.

As AQLIYA expands beyond audit into financial reporting, compliance, and enterprise risk, the Financial Entity Model generalizes. Every domain that deals with organizational structures, financial relationships, and entity-level decisions needs the same structural representation. The model designed for audit scales to the broader enterprise.

The competitive moat is entity depth. Generic data platforms store financial data. AQLIYA understands financial entities: their hierarchy, their relationships, their financial behavior, and their risk attributes. This depth cannot be replicated by adding entity fields to a generic data model. It requires the entity to be a first-class object in the decision intelligence architecture.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 20.04 | Evidence Model | Evidence is scoped to specific entities |
| 20.05 | Risk Signal Model | Signals are often generated about or across entities |
| 04.02 | Financial Reality Layer | The conceptual layer that financial entities populate |
| 04.03 | Canonical Financial Model Theory | Defines the canonical financial data structures |
| 04.04 | Ledger Intelligence Theory | Ledger entities and their financial behavior |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial reference model specification |
| 0.2 | 2026-05-08 | Founding Team | Reviewed — promoted to v0.2 after doctrinal check |