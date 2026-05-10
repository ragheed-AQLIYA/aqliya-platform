---
title: Theory Document Template
document_id: 21.02
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08


# Theory Document Template

## 1. Purpose

This document extends the generic template defined in 00-document-template.md with practical section-by-section guidance for authors. While 00-document-template.md defines what sections must exist, this document defines what each section should contain, at what depth, and with what emphasis — organized by depth level. It also provides templates for frontmatter metadata and version history. The goal is to eliminate ambiguity about what a complete, publication-ready theory document looks like.

## 2. Thesis

A template is only useful if it is usable. The 00-document-template.md defines the canonical 20-section structure. 21.02 makes that structure operational by providing per-section guidance, depth-level expectations, and frontmatter defaults. Authors writing a Level 4 definition do not need to guess how much depth section 16 requires — the template tells them. Authors writing a Level 2 domain theory do not need to guess whether section 15 (Anti-Patterns) is required — the template tells them when to include it and when to skip it.

## 3. Problem

Theoretical reference documents suffer from three template-related problems: (1) authors do not know what depth to target for their depth_level, producing Level 4 definitions that are too shallow or Level 5 narratives that are too technical; (2) authors omit sections that should be included because the generic template does not specify which sections are mandatory per document type; (3) frontmatter metadata varies in completeness and consistency, making automated processing difficult.

## 4. Why Existing Systems Fail

Single-page templates (like 00-document-template.md) define structure but not practice. They tell authors what sections exist but not how to write each section. This works for documents with a single author but fails when multiple authors contribute to a system. Each author interprets the template differently, producing documents that follow the same 20-section structure but read like they belong to different systems.

## 5. AQLIYA Philosophy

The template exists to serve the theory, not constrain it. Per-section guidance ensures consistency without uniformity. Two documents at different depth levels should have different emphasis, different depth, and different section treatment — while both being recognizably part of the same system. The template provides enough guidance for consistency and enough flexibility for substance.

## 6. Core Principles

1. **Template compliance is not optional.** Every document must use the 20-section structure. No section may be omitted without justification.

2. **Depth level determines emphasis.** Level 1 documents emphasize sections 2 (Thesis), 4 (Why Existing Systems Fail), 5 (AQLIYA Philosophy), and 6 (Core Principles). Level 4 definitions emphasize sections 6 (Core Principles) and 7 (Key Concepts). Level 5 narratives emphasize sections 15 (Anti-Patterns) and 16 (Examples) less than other levels.

3. **Sections are not equal in required depth.** Sections 7 (Key Concepts), 15 (Anti-Patterns), and 16 (Examples) should be the longest in most documents. Sections 1 (Purpose) and 2 (Thesis) should be the shortest. This is not a fixed rule but a useful guideline.

4. **Frontmatter completeness is mandatory.** Every metadata field must be filled. No blank values. Status, owner, version, last_updated, and priority are operational requirements.

## 7. Key Concepts

### Section-by-Section Guidance

**Section 1 — Purpose (1-3 paragraphs):** Why this document exists. What problem it addresses. What reader should expect to understand after reading. Must not exceed 3 paragraphs. Be specific: "defines X concept" not "discusses important topics related to X."

**Section 2 — Thesis (1 paragraph):** The single core position this document takes. One paragraph. Bold the thesis statement. Every other section must connect back to this thesis.

**Section 3 — Problem (3-6 bullet points or paragraphs):** The specific problems that motivate this theory. Problems, not symptoms. Each problem should be concrete, not abstract. Level 4 definitions may use 2-4 problems.

**Section 4 — Why Existing Systems Fail (4-8 paragraphs or sub-sections):** Analysis of why current approaches are inadequate. One sub-section per current approach. Each sub-section specifies the failure mechanism, not just the limitation.

**Section 5 — AQLIYA Philosophy (3-6 principles or paragraphs):** How AQLIYA's approach differs. The philosophical commitment. What makes AQLIYA's position distinctive. Should connect to 01.01 (Foundational Thesis) where relevant.

**Section 6 — Core Principles (5-8 principles):** The fundamental principles. Each principle is one clear sentence followed by 1-2 sentences of explanation. Principles are numbered. They should be actionable, not abstract.

**Section 7 — Key Concepts (6-12 terms):** The essential concepts introduced or used. Each term is bolded and followed by a definition. Definitions should be 1-3 sentences. Concepts should be listed alphabetically or logically grouped.

**Section 8 — Operational Implications (4-8 points):** How this affects daily operations. Concrete, specific, actionable. Each point begins with a verb or describes a specific operational change.

**Section 9 — Product Implications (4-8 points):** How this affects product decisions. Specific enough that a product manager could translate each implication into a feature or requirement.

**Section 10 — Architecture Implications (4-8 points):** How this affects system architecture. Specific enough that an engineer could translate each implication into an architectural decision. Level 5 narratives may omit (do not include architecture implications if none exist).

**Section 11 — Governance Implications (4-6 points):** How this affects governance and compliance. Required for all documents. If no governance implications exist, state that explicitly — do not omit the section.

**Section 12 — AI / Intelligence Implications (4-6 points):** How this affects AI and intelligence design. Required for all documents. If no AI implications exist, state that explicitly.

**Section 13 — UX Implications (4-6 points):** How this affects user experience. Level 4 definitions may use 2-4 points. Level 5 narratives may omit.

**Section 14 — Commercial Implications (4-6 points):** How this affects commercial strategy. Level 4 definitions may use 2-4 points. Required for all documents.

**Section 15 — Anti-Patterns (4-8 items):** Common mistakes related to this topic. Each anti-pattern has a name and a description of the failure mechanism. Level 4 definitions should include at least 4; Level 5 narratives may include fewer.

**Section 16 — Examples (2-4 examples):** Real or illustrative examples. Each example should demonstrate a concept, principle, or implication in action. Examples should be specific and concrete. Not required for Level 5 narratives.

**Section 17 — Enterprise Impact (3-5 points):** Measurable impact on enterprise customers. Each point states a specific benefit with implied or explicit measurement.

**Section 18 — Long-Term Strategic Importance (2-5 paragraphs):** Why this matters beyond the current context. Connects to AQLIYA's long-term positioning. Level 4 definitions may use fewer paragraphs.

**Section 19 — Related Documents:** Table with columns: ID, Document, Relationship. Each row specifies a related document and the nature of the relationship. All documents referenced in the text should appear here.

**Section 20 — Version History:** Table with columns: Version, Date, Author, Changes. The initial entry shows 0.1. Updates add rows. No entry is ever deleted.

## 8. Operational Implications

1. Authors must read 21.01 (Writing Standards) and this document before starting a new theory document. The template guidance is not optional — it is the operational specification.

2. Document reviewers verify template compliance: all 20 sections present, each section following the depth guidance appropriate to the document's depth_level.

3. Documents that consistently deviate from template guidance are returned to Draft with specific feedback on which sections need revision.

4. Template guidance may be updated as the system matures. Authors should check for the latest version of 21.02 before starting a new document.

## 9. Product Implications

1. The template structure should be encoded in the document creation workflow. When an author creates a new document, the system should pre-populate the 20-section structure with section headings and embedded guidance.

2. The product should display depth_level and section expectations so authors know what depth to target.

## 10. Architecture Implications

1. Template metadata (section headings, required sections per depth_level) should be machine-readable. Automated template compliance checking is a desirable tooling investment.

2. The template should be versioned alongside the documents. When the template changes, affected documents should be flagged for potential update.

## 11. Governance Implications

1. Template compliance is a governance requirement. No document may be promoted from Draft to Reviewed without template compliance verification.

2. Deviations from the template must be explicitly justified and documented. A document that omits section 15 (Anti-Patterns) for a Level 2 domain theory must state why.

3. Template changes are governed changes. Any change to the required section structure or per-section guidance must be reviewed, approved, and communicated to all document owners.

## 12. AI / Intelligence Implications

1. AI-assisted document authoring should use the template structure and per-section guidance as part of the generation prompt. The AI should be instructed on which sections to emphasize based on depth_level.

2. AI linting for template compliance — checking that all required sections exist, that section content matches expected depth — is a feasible automation target.

## 13. UX Implications

1. Authors should see the template sections as a guided writing interface, not as a blank page with headings. When they start section 7 (Key Concepts), they should see guidance: "List 6-12 terms. Bold each term. Provide 1-3 sentence definition."

2. The template should be available as a reference view whenever the author is writing. Guidance is context, not a separate document to consult.

## 14. Commercial Implications

1. Template consistency signals professional rigor to customers and partners. Documents that follow the same structure are easier to read, easier to reference, and easier to trust.

2. Template compliance reduces the cost of onboarding new authors. They do not need to learn system-specific writing conventions by reading dozens of examples.

## 15. Anti-Patterns

1. **Section Padding.** Writing long, content-free sections to fill the template. A section that adds nothing should be acknowledged as having minimal content, not padded with generic statements.

2. **Section Misplacement.** Writing sections out of the defined order. The order exists for a reason; reordering breaks the reading flow.

3. **Template Override.** Deviating from the template structure without documenting the deviation. If an author believes a section should be omitted, the omission must be justified and documented.

4. **Depth Level Mismatch.** Writing a Level 4 definition with the depth and emphasis of a Level 2 domain theory, or vice versa. The depth level must determine the treatment.

5. **Copy-Paste Sections.** Reusing section content from one document in another without adapting it. Each document must be self-contained; reused content must be contextualized to the new document.

## 16. Examples

**Example 1: Section 6 Correct Depth (Level 4 Definition).** Six core principles, each 2-3 sentences. Concrete, specific, directly relevant to the term being defined.

**Example 2: Section 15 Anti-Patterns Correct Format.** "**Anti-Pattern Name.** Description of the failure mechanism. Why it is wrong. What it produces instead of the correct behavior." Consistent format across all anti-patterns.

## 17. Enterprise Impact

1. **Author productivity.** Clear template guidance reduces writing time by eliminating ambiguity about what each section should contain.

2. **Document consistency.** All documents follow the same structure, making the system coherent regardless of the number of authors.

3. **Review efficiency.** Template compliance is verifiable before deep review. Non-compliant documents are returned for structural fixes before theory review begins.

4. **Scalability.** As the system grows, the template ensures that new documents fit the established structure without requiring each author to infer the pattern from existing documents.

## 18. Long-Term Strategic Importance

The template is the structural backbone of the theoretical reference system. As the system grows from 21 parts to more, from dozens of documents to hundreds, the template is what ensures every document fits the system architecture. It is not a constraint — it is the interface contract that makes the system composable. A document that follows the template can be integrated into the system, cross-referenced, and maintained by any author.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 00.01 | 00-document-template.md | The canonical template this document extends |
| 00.02 | 00-governance-rules.md | Governance rules referenced in template guidance |
| 21.01 | Documentation Writing Standards | Writing voice and quality standards |
| 21.04 | Versioning Rules | How template versions relate to document versions |
| 21.10 | Documentation Quality Checklist | Quality checklist includes template compliance |

## 20. Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.2 | 2026-05-08 | Founding Team | Reviewed for documentation governance consistency and promoted to Reviewed |
| 0.1 | 2026-05-08 | Founding Team | Initial draft |
