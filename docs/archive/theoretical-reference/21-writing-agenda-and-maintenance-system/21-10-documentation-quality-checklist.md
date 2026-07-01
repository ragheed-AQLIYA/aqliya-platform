---
title: Documentation Quality Checklist
document_id: 21.10
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 4 - Definition
related_documents: 00.01, 00.02, 21.01, 21.02, 21.04, 21.09
---

# Documentation Quality Checklist

## 1. Purpose

This document defines the quality checklist that every document in the AQLIYA Theoretical Reference System must pass before it can be promoted from Draft to Reviewed. The checklist covers structural compliance (template), writing standards (voice, terminology), content quality (thesis clarity, reasoning completeness), cross-document consistency, and metadata completeness. It serves as both a quality gate and a quality reference: authors use it to self-assess their documents before submitting for review; reviewers use it to perform structured reviews.

## 2. Thesis

Document quality is not subjective. A document either meets the defined quality criteria or it does not. The quality checklist makes quality evaluation objective, consistent, and repeatable across documents and reviewers. It eliminates the "I know it when I see it" approach to quality assessment and replaces it with a structured checklist that any trained reviewer can apply.

## 3. Problem

Document quality reviews are inconsistent across reviewers and documents. One reviewer focuses on writing quality; another focuses on theory accuracy. One document is approved with typos; another is held up for formatting nits. The lack of a standard checklist means that quality is reviewer-dependent: what passes one review might fail another. This inconsistency frustrates authors and undermines confidence in the review process.

## 4. Why Existing Systems Fail

Editorial checklists in publishing are designed for narrative works, not for structured theory documents. Corporate documentation checklists focus on administrative completeness (does it have the right header, footer, branding?) rather than intellectual quality (is the thesis clear? are the implications specific?). Code review checklists focus on technical correctness and style. The AQLIYA system needs a checklist that covers structural, intellectual, and standards dimensions.

## 5. AQLIYA Philosophy

Quality is defined by the checklist, not by the reviewer's intuition. The checklist encodes the system's quality standards in an objective, verifiable form. A document that passes all checklist items is quality-compliant, regardless of which reviewer performs the check. A document that fails any checklist item is not quality-compliant, regardless of how well it reads. The checklist makes quality assessment transparent and consistent.

## 6. Core Principles

1. **Quality is defined by the checklist, not by opinion.** A document that passes all items meets the quality standard. A document that fails any item does not — regardless of subjective impressions.

2. **The checklist covers structural, intellectual, and standards dimensions.** Structural: template compliance, metadata completeness. Intellectual: thesis clarity, reasoning completeness, argument coherence. Standards: writing voice, terminology discipline, cross-reference format.

3. **Checklist items are binary.** Each item is pass/fail. No partial credit, no "close enough." Binary evaluation eliminates ambiguity.

4. **The checklist is applied consistently.** Every document, every review, every reviewer uses the same checklist. No reviewer-specific variations.

5. **The checklist evolves through governed updates.** If a checklist item proves too strict or too lenient, it is revised through a governed change process.

6. **Failed items produce actionable feedback.** The reviewer specifies which item failed and what must be changed to pass. "Needs improvement" is not feedback — "Section 7 lists only 4 terms; minimum is 6" is feedback.

## 7. Key Concepts

### Quality Dimensions

- **Structural Quality:** The document follows the 20-section template. All required sections are present. The section order matches the template. No section is omitted without documented justification.

- **Metadata Quality:** Frontmatter is complete. All fields are filled. Status, owner, version, and last_updated are current. Priority and depth_level match the document's role in the system.

- **Intellectual Quality:** The thesis is clearly stated in section 2. Every section connects back to the thesis. Claims are supported by reasoning. Reasoning connects to AQLIYA philosophy or doctrine.

- **Standards Quality:** Writing voice follows 21.01 standards. Terminology is consistent with Part 17 definitions. Cross-references use correct format. Depth level is appropriate for the document type.

- **Relationship Quality:** Section 19 uses standard relationship types. All in-text references appear in section 19. Reciprocal relationships exist where applicable.

### Quality Checklist (Complete)

#### Structural Items

| # | Item | Pass/Fail |
|---|---|---|
| S1 | All 20 sections are present in template order | |
| S2 | No section is omitted without documented justification | |
| S3 | Section headings match template exactly | |
| S4 | Each section is at least 3 sentences long (except section 1 which may be shorter) | |
| S5 | Section 20 (Version History) has at least one entry | |

#### Metadata Items

| # | Item | Pass/Fail |
|---|---|---|
| M1 | Frontmatter title is non-empty | |
| M2 | Frontmatter status is non-empty and valid status value | |
| M3 | Frontmatter owner is non-empty (individual, not team) | |
| M4 | Frontmatter version matches latest version history entry | |
| M5 | Frontmatter last_updated is a valid date | |
| M6 | Frontmatter priority is consistent with the document's role | |
| M7 | Frontmatter depth_level matches document content depth | |

#### Intellectual Items

| # | Item | Pass/Fail |
|---|---|---|
| I1 | Section 2 (Thesis) states a single, clear position | |
| I2 | Every section provides content relevant to the thesis | |
| I3 | Claims in sections 3-5 are supported by reasoning | |
| I4 | Section 6 (Core Principles) has 5-8 numbered principles | |
| I5 | Section 7 (Key Concepts) defines at least 6 terms (Level 4) or at least 8 terms (Level 2-3) | |
| I6 | Section 15 (Anti-Patterns) lists at least 4 anti-patterns (Level 2-4) | |
| I7 | Section 16 (Examples) provides at least 2 concrete examples | |

#### Standards Items

| # | Item | Pass/Fail |
|---|---|---|
| W1 | Writing voice follows 21.01 standards: no first-person, no marketing language, no hedging | |
| W2 | Terminology is consistent with Part 17 definitions | |
| W3 | No invented terms that are not defined in this document or Part 17 | |
| W4 | Cross-references use document_id format (not document title) | |
| W5 | Depth level is appropriate for the document's scope and specificity | |

#### Relationship Items

| # | Item | Pass/Fail |
|---|---|---|
| R1 | Section 19 is a valid table with ID, Document, Relationship columns | |
| R2 | All documents referenced in the body appear in section 19 | |
| R3 | Relationship types are from the standard set (hierarchy, depends_on, applies, references, conflict) | |
| R4 | Reciprocal relationships exist for all hierarchy and depends_on relationships | |
| R5 | No documents are referenced in section 19 that are not referenced in the body | |

## 8. Operational Implications

1. Before submitting a document for review, the author performs a self-assessment using the checklist. They identify any failing items and correct them.

2. The reviewer performs a formal assessment using the same checklist. They mark each item as pass or fail and provide feedback for any failing item.

3. A document with any failing item cannot be promoted to Reviewed. The author must correct failing items and resubmit.

4. The checklist is applied at the Draft → Reviewed transition. It is also applied at the Reviewed → Approved transition if the organization elects to use that status level.

5. Checklist results are recorded alongside the document review record. They document the quality assessment that was performed and the outcome.

## 9. Product Implications

1. The theory reference system should embed the quality checklist in the document workflow. When an author submits a document for review, the system presents the checklist.

2. The system should support checklist item tracking: which items passed, which failed, and what feedback was provided.

3. The system should prevent status transitions if the checklist is not complete. A document cannot move from Draft to Reviewed without a completed checklist.

4. The system should provide checklist templates that adapt to the document's depth_level. Some items are required only for certain levels.

## 10. Architecture Implications

1. Checklist metadata (items, pass/fail status, feedback) should be stored alongside document metadata and review records.

2. The checklist should be versioned. When the checklist is updated, documents that were reviewed under the previous version should be flagged for potential re-assessment.

3. Automation of checklist items should be supported where feasible. Structural items (S1, S2, S3) and metadata items (M1-M7) can be automatically checked.

## 11. Governance Implications

1. The quality checklist is a governance instrument. It enforces the quality standards defined in 00-governance-rules.md, 21.01, and 21.02.

2. Skipping the checklist is a governance violation. No document may be promoted without a completed checklist assessment.

3. Checklist results are governance records. They can be referenced in quality reviews, system audits, and process improvement analyses.

4. Changes to the checklist are governed changes. They require documented rationale, review by the founding team, and notification to all document owners.

## 12. AI / Intelligence Implications

1. AI can automate several checklist items: structural items (S1-S5), metadata items (M1-M7), and some standards items (W1, W4). Automated checking would reduce manual review time and improve consistency.

2. AI cannot fully replace human review for intellectual items (I1-I7). Thesis clarity, reasoning completeness, and concept definition quality require human evaluation.

3. AI-assisted checklist completion should flag potential issues for human confirmation, not make definitive pass/fail determinations for non-automatable items.

## 13. UX Implications

1. The checklist should be presented as an interactive form, not a static document. Authors and reviewers check items, add feedback, and submit.

2. Automated items should be checked in real time, with pass/fail status updating as the document changes.

3. Failed items should display actionable feedback: what is wrong and what needs to change. Generic "improve quality" feedback is not acceptable.

## 14. Commercial Implications

1. The quality checklist demonstrates the rigor of the theoretical reference system to customers and partners. They can see that quality is defined, measured, and enforced.

2. Checklist discipline improves document quality across the system. Higher-quality documents build trust with readers.

3. The checklist is a scaling tool. As the system grows and more authors contribute, the checklist ensures consistent quality standards across all documents.

## 15. Anti-Patterns

1. **Checklist as checkbox.** Going through the motions of the checklist without substantive evaluation. Each item must be genuinely assessed.

2. **Self-assessment bypass.** Submitting a document for review without performing a self-assessment. The author should correct obvious issues before the reviewer sees the document.

3. **Item negotiation.** Arguing that a failed item should not apply to this particular document. The items apply universally. If an item is genuinely not applicable, the checklist should be updated for all documents, not waived for one.

4. **Feedback without action.** The reviewer provides feedback but the author does not correct the issue. The checklist is not complete until all items pass.

5. **Checklist inflation.** Adding items to the checklist without removing outdated ones. The checklist should be periodically pruned to ensure it remains focused on meaningful quality dimensions.

## 16. Examples

**Example 1: Passing Checklist.** A Level 4 definition document is submitted for review. The author self-assesses and finds all items pass. The reviewer confirms: 20 structural items pass, 7 metadata items pass, 7 intellectual items pass, 5 standards items pass, 5 relationship items pass. The document is promoted to Reviewed.

**Example 2: Failing Checklist.** A Level 2 domain theory document is submitted. The reviewer finds: I5 fails (section 7 has only 4 key concepts; minimum for Level 2 is 8), W2 fails (uses "decision artifact" instead of the standard "decision object"), R2 fails (three documents referenced in the body are not in section 19). The document is returned to Draft with specific feedback on each failing item. The author corrects the issues and resubmits.

## 17. Enterprise Impact

1. **Consistent quality.** Every document meets the same quality standard, regardless of author, reviewer, or subject matter.

2. **Objective assessment.** Authors know exactly what is expected. No ambiguity about what "good enough" means.

3. **Efficient reviews.** Reviewers focus on meaningful issues rather than rediscovering the same problems in every document.

4. **Scalable quality.** As the system grows, the checklist ensures that new documents meet the same standards as existing ones.

5. **Continuous improvement.** The checklist evolves based on experience, incorporating lessons learned from past reviews.

## 18. Long-Term Strategic Importance

The quality checklist is the mechanism that makes document quality objective and verifiable. As the theoretical reference system grows, the checklist ensures that every new document meets the same standards as every existing document. Without the checklist, quality would be reviewer-dependent; with it, quality is system-defined.

The checklist also serves as a training tool for new authors and reviewers. It encodes the system's quality standards in a form that can be learned, applied, and reinforced. New authors use the checklist to understand what quality means. New reviewers use the checklist to perform consistent assessments.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 00.01 | 00-document-template.md | Checklist S items reference the template |
| 00.02 | 00-governance-rules.md | Checklist enforces governance rules |
| 21.01 | Documentation Writing Standards | Checklist W items reference writing standards |
| 21.02 | Theory Document Template | Checklist M and S items reference template guidance |
| 21.04 | Versioning Rules | Checklist M4 references versioning rules |
| 21.09 | Relationship Between Docs | Checklist R items reference relationship types |

## 20. Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.2 | 2026-05-08 | Founding Team | Reviewed for documentation governance consistency and promoted to Reviewed |
| 0.1 | 2026-05-08 | Founding Team | Initial draft |
