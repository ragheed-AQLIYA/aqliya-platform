---
title: Relationship Between Docs
document_id: 21.09
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 2 - Domain Theory
related_documents: 00.02, 21.01, 21.04, 21.06, 21.07, 21.08
---

# Relationship Between Docs

## 1. Purpose

This document defines how documents within the AQLIYA Theoretical Reference System relate to each other — the types of relationships, how they are expressed, how they are maintained, and how they enable the system to function as a coherent whole rather than a collection of independent documents. Without explicit relationship definitions, cross-document references are ambiguous: does a reference to 17.05 mean "see also," "this overrides," "this depends on," or "this is an application of"?

## 2. Thesis

Every cross-document reference has a specific relationship type. The system defines five relationship types: hierarchy, dependency, application, reference, and conflict. Each type has defined semantics: what it means for the reader, what it means for updates, and how it affects source of truth resolution. By standardizing relationship types, the system makes cross-document references meaningful rather than ornamental.

## 3. Problem

Cross-document references in most documentation systems are informal. A document contains a link to another document with no indication of what the relationship means. The reader must infer whether the referenced document is a prerequisite, a supporting argument, a contradictory position, or an unrelated tangent. This ambiguity becomes problematic at scale: readers cannot navigate the system efficiently, document owners cannot assess the impact of updates, and the system lacks the structure needed for automated analysis.

## 4. Why Existing Systems Fail

Hyperlinks connect documents but do not specify relationship semantics. The reader clicks a link and discovers the relationship through context — or does not discover it at all. Wiki backlinks show which pages link to a page but not why. Document management systems may have "related document" metadata fields but do not define relationship types. Academic citation systems have well-defined reference types (cites, supports, contradicts, extends) but these are not standardized in enterprise documentation.

## 5. AQLIYA Philosophy

A theoretical reference system is a network of relationships, not a collection of independent documents. Every document occupies a position in this network defined by its relationships to other documents. Making relationship types explicit transforms the system from a document library into a structured knowledge graph. Readers navigate by relationship type. Document owners assess update impact by relationship type. Automated tools analyze the system by relationship type.

## 6. Core Principles

1. **Every cross-document reference has a relationship type.** No bare links. Every reference in section 19 (Related Documents) specifies the type of relationship.

2. **Relationship types are defined and standardized.** The system uses a fixed set of relationship types. Custom types are not permitted.

3. **Relationships are bidirectional.** If document A has a relationship to document B, document B should have a reciprocal relationship to document A. Both directions are documented.

4. **Relationship types affect source of truth resolution.** "Overrides" relationships inform the source of truth hierarchy. "Depends on" relationships inform update impact assessment.

5. **Relationship metadata is maintained.** When a document is updated or deprecated, its relationships are reviewed and updated if necessary.

## 7. Key Concepts

### Standard Relationship Types

1. **hierarchy:** Documents at a higher abstraction level provide foundational principles. Documents at a lower level apply those principles to specific domains. Example: 01.01 (Foundational Thesis) —hierarchy→ 07.01 (Workflow Intelligence). Meaning: the higher-level document establishes principles that the lower-level document applies.

2. **dependency:** One document depends on concepts defined in another. Example: 17.05 (Evidence) —depends_on→ 17.01 (Intelligence). Meaning: the dependent document cannot be fully understood without the referenced document.

3. **application:** One document applies the concepts of another to a specific context. Example: 20.01 (Decision Model) —applies→ 02.01 (Enterprise Decision Intelligence Theory). Meaning: the applying document implements or operationalizes the referenced document's concepts.

4. **reference:** One document references another for context or background without hierarchy, dependency, or application. Example: 18.01 (AI Wrapper Anti-Pattern) —references→ 13.01 (Product Philosophy). Meaning: the referenced document provides relevant context but is not structurally related.

5. **conflict:** Two documents present positions that may appear contradictory (before resolution) or that have been resolved through the contradiction resolution process. Example: 07.01 —conflict→ 10.01 (resolved). Meaning: these documents addressed overlapping topics and required resolution.

### Relationship Table Format

Each document's section 19 (Related Documents) uses this format:

| ID | Document | Relationship |
|---|---|---|
| 17.01 | Intelligence | depends_on |
| 20.01 | Decision Model | applies |
| 01.01 | Foundational Thesis | hierarchy |

## 8. Operational Implications

1. Every document's section 19 must use the standard relationship types. Custom descriptions in the Relationship column are not permitted.

2. When a document is created, its author identifies relationships to existing documents and assigns relationship types.

3. When a document is updated, its relationships are reviewed. A change to a document may add, remove, or change relationship types.

4. When a document is deprecated, its relationships are reviewed. Documents that depended on the deprecated document may need updates.

5. Relationship type compliance is checked during document review. Incorrect or missing relationship types are flagged for correction.

## 9. Product Implications

1. The theory reference system viewer should display relationship types visually. Different relationship types should have different visual treatments (colors, icons, labels).

2. The system should support relationship graph views: a visual network showing documents and their relationships.

3. The system should support relationship-based navigation: "show me all documents that depend on this one" or "show me all documents that apply this concept."

4. The system should validate relationship types: if document A lists a dependency on document B, document B should have a reciprocal relationship to document A.

## 10. Architecture Implications

1. The relationship graph should be a first-class data structure. Relationships are stored as typed edges between document nodes.

2. The relationship graph should support queries: "find all documents that have a hierarchy relationship to Part 01" or "find all documents that depend on 17.05."

3. The relationship graph should be maintained alongside documents. When a document is updated or deprecated, its edges are reviewed.

4. Reciprocal relationship validation should be automated. The system should flag relationships where the reciprocal is missing or incorrectly typed.

## 11. Governance Implications

1. Relationship types are governance metadata. They determine how source of truth rules apply (hierarchy relationships) and how update impact is assessed (dependency relationships).

2. Missing or incorrect relationship types can lead to incorrect source of truth resolution or missed update notifications. They are governance errors.

3. Conflict relationships indicate a past or present intellectual issue. Conflict relationships that are marked "unresolved" require escalation.

4. The relationship graph is a governance asset. It can be analyzed to understand the structure of the theoretical system, identify clusters, and find orphaned documents.

## 12. AI / Intelligence Implications

1. AI can assist in relationship type suggestion by analyzing document content and identifying the nature of cross-document references.

2. AI can validate relationship types by checking that the type matches the content of the reference.

3. AI can identify missing relationships: documents that should be related but are not connected in the relationship graph.

4. AI should not assign relationship types autonomously. The author determines the correct relationship type based on their understanding of both documents.

## 13. UX Implications

1. Relationship types should be displayed in section 19 as clear labels, not implicit in the Relationship column text. "depends_on" should be styled as a tag or badge.

2. Relationship graph views should be interactive: clicking on a relationship node navigates to the related document.

3. Reciprocal relationship validation should be visible to authors. If document A lists a dependency on document B but document B does not list a reciprocal relationship, the author of document B is notified.

## 14. Commercial Implications

1. Explicit relationship types demonstrate intellectual structure. Customers and partners can see that the theoretical system is not a document collection but a structured knowledge network.

2. Relationship-based navigation enables efficient exploration. A customer reading one document can easily find related documents by relationship type, building a comprehensive understanding.

3. Conflict relationship transparency builds trust. Customers can see that AQLIYA identifies and addresses internal contradictions rather than hiding them.

## 15. Anti-Patterns

1. **Bare links.** Referencing another document without specifying the relationship type. "See 17.05" is insufficient.

2. **Incorrect relationship type.** Using "depends_on" when the relationship is actually "references." The type must match the actual relationship.

3. **Missing reciprocal.** Listing a relationship from document A to document B but not listing the reciprocal relationship in document B.

4. **Relationship inflation.** Listing every document remotely related as a reference. Section 19 should include documents with substantive relationships, not every document that was mentioned in passing.

5. **Relationship neglect.** Creating the relationship table during initial writing and never updating it. As the system evolves, relationships change.

## 16. Examples

**Example 1: Hierarchy Relationship.** 01.01 (Foundational Thesis, Part 01) has a hierarchy relationship to 07.01 (Workflow Intelligence, Part 07). 01.01 section 19 lists: "07.01 | Workflow Intelligence | applies" (the higher-level document sees the lower-level document as applying its principles). 07.01 section 19 lists: "01.01 | Foundational Thesis | hierarchy" (the lower-level document sees the higher-level document as its foundation).

**Example 2: Dependency Relationship.** 17.05 (Evidence) depends on 17.01 (Intelligence) because the concept of evidence builds on the concept of intelligence. 17.05 section 19 lists: "17.01 | Intelligence | depends_on." 17.01 section 19 lists: "17.05 | Evidence | referenced_by" (the reciprocal may use a different type if the dependency is not bidirectional).

## 17. Enterprise Impact

1. **Structured navigation.** Readers navigate the system by relationship type, finding related documents efficiently without guessing.

2. **Update impact clarity.** Document owners can assess which documents are affected by an update by following dependency relationships.

3. **Source of truth enforcement.** Hierarchy relationships inform source of truth resolution. Readers know which document is authoritative.

4. **System analysis.** The relationship graph enables analysis of the theoretical system: which concepts are most referenced, which parts are most interdependent, where gaps exist.

## 18. Long-Term Strategic Importance

Relationship types transform the theoretical reference system from a document collection into a knowledge graph. This graph becomes more valuable as the system grows. Analysis of the graph reveals structural patterns: which parts are most central, which concepts are most foundational, where the system is over- or under-connected.

As the system scales to hundreds of documents, the relationship graph becomes the primary navigation and analysis tool. Documents are not found by browsing a list — they are found by traversing typed relationships from known starting points.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 00.02 | Governance Rules | hierarchy (00.02 defines governance rules that this document applies) |
| 21.01 | Documentation Writing Standards | depends_on (this document's section 19 format is defined in 21.01) |
| 21.04 | Versioning Rules | references (versioning is referenced but not dependent on relationships) |
| 21.06 | Source of Truth Rules | depends_on (source of truth uses relationship types) |
| 21.07 | Update Rules | depends_on (update impact assessment uses relationships) |
| 21.08 | Decision Log Integration | references (decisions can affect relationships) |

## 20. Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.2 | 2026-05-08 | Founding Team | Reviewed for documentation governance consistency and promoted to Reviewed |
| 0.1 | 2026-05-08 | Founding Team | Initial draft |
