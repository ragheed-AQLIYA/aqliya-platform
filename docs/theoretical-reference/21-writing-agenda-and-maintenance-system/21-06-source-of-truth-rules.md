---
title: Source of Truth Rules
document_id: 21.06
status: Approved
owner: Founding Team
version: 1.0
last_updated: 2026-05-08
priority: Medium
depth_level: Level 2 - Domain Theory
related_documents: 00.02, 21.01, 21.04, 21.05, 21.09
---

# Source of Truth Rules

## 1. Purpose

This document defines the source of truth rules for the AQLIYA Theoretical Reference System — how to determine which document is authoritative on a given topic, how to resolve apparent contradictions between documents, and how to handle conflicts between theory documents and other sources (product documentation, marketing materials, code comments). Without explicit source of truth rules, readers rely on assumption, recency, or personal preference to determine which source is authoritative. This produces inconsistent understanding and conflicting decisions.

## 2. Thesis

The AQLIYA Theoretical Reference System is the single source of truth for all AQLIYA theory. No document outside the system — product specifications, marketing copy, engineering documentation, sales presentations — overrides a theory document. Within the system, the hierarchy is: (1) higher-level theory (Part 01) overrides lower-level theory; (2) more specific documents take priority for their domain; (3) newer versions override older versions of the same document. These rules are not preferences — they are the mechanism that maintains a single, coherent intellectual system.

## 3. Problem

Enterprise organizations typically have multiple sources of truth that contradict each other. The product spec says one thing, the engineering document says another, the marketing page says a third, and the theory document says a fourth. When a team member encounters a contradiction, they have no rule for determining which source is authoritative. They guess, they ask, or they follow whichever source is most convenient. The result is inconsistent decisions, confused customers, and a system that fails to provide the clarity it was built to provide.

## 4. Why Existing Systems Fail

Wiki-based documentation has no source of truth hierarchy. Any page can be edited by anyone, and there is no rule for determining which page is authoritative when two pages disagree. Product requirements documents are often treated as authoritative for product decisions, but they may not reference theory documents at all. Marketing materials are written for communication, not accuracy, and may oversimplify or misstate theoretical positions. Engineering documentation follows code architecture, not theory structure, and may encode assumptions that contradict theory.

## 5. AQLIYA Philosophy

The theoretical reference system is the source of truth for AQLIYA theory. All other documents — product specs, engineering docs, marketing materials, sales decks — derive from theory and must be consistent with it. When a non-theory document contradicts a theory document, the theory document takes precedence. When two theory documents appear to contradict each other, the resolution rules defined in this document apply: hierarchy, specificity, version.

## 6. Core Principles

1. **The theoretical reference system is the authoritative source.** No document outside the system can override a theory document. Theory is the foundation; all other documentation is derived.

2. **Higher-level theory overrides lower-level theory.** Part 01 (Foundational Doctrine) overrides Part 02, which overrides Part 03, and so on. A document in Part 08 cannot contradict Part 01.

3. **Specific documents take priority for their domain.** Within the same hierarchy level, a more specific document (17.05 Evidence) takes priority over a more general document (17.01 Intelligence) for the specific topic. This is the specificity exception to the hierarchy rule.

4. **Newer versions override older versions.** Within the same document, the latest version is authoritative. Version precedence is determined by the version number, not by the date.

5. **Cross-part contradictions are escalated.** If two documents in different parts contradict each other and the resolution rules do not produce a clear answer, the contradiction is escalated to the founding team for resolution.

6. **The source of truth is versioned.** A statement about AQLIYA's position is only meaningful with a document ID and version. "Per 17.05 v0.2, AQLIYA's position is..."

## 7. Key Concepts

- **Theory Primacy:** The principle that the theoretical reference system is the authoritative source for all AQLIYA theory. No external document overrides it.

- **Hierarchy Rule:** The rule that a document in a lower-numbered part (higher-level theory) overrides a document in a higher-numbered part (lower-level application), except for the specificity exception.

- **Specificity Exception:** The rule that a more specific document within the same hierarchy level takes priority over a more general document for its specific topic. 17.05 (Evidence) overrides 17.01 (Intelligence) on evidence-related matters.

- **Version Precedence:** The rule that the latest version of a document is authoritative for that document. Version precedence is determined by comparing version numbers, not dates.

- **Contradiction Escalation:** The process for resolving contradictions that the standard rules cannot resolve. Escalated to the founding team. Resolution is documented in the decision log.

- **Authoritative Reference:** A specific statement that can be cited as the authoritative AQLIYA position. Format: "[Document ID] v[Version], Section [N]." Example: "17.05 v0.2, Section 2."

## 8. Operational Implications

1. Anyone who identifies a contradiction between two theory documents must report it. Contradictions are not tolerated — they are escalated and resolved.

2. Team members referencing theory documents for decisions should cite the specific document ID and version: "Per 17.05 v0.2, we require evidence provenance."

3. Product, engineering, and marketing teams must verify that their documents are consistent with theory documents before publishing. Theory primacy means theory documents set the boundaries.

4. When a theory document is updated, affected non-theory documents should be flagged for review. The theory owner is responsible for notifying affected teams.

5. The source of truth rules should be taught during onboarding. Every team member should know: (1) theory is the source of truth; (2) hierarchy, specificity, version; (3) contradictions are escalated.

## 9. Product Implications

1. The theory reference system viewer should display the hierarchy position of each document: its part number and relationship to higher and lower parts.

2. Cross-document references should show version context. When a document references another, the viewer should indicate whether the reference is to the current version or an older version.

3. Contradiction detection should be a system feature. Automated scanning for cross-document contradictions is a desirable tooling investment.

## 10. Architecture Implications

1. Document metadata should include hierarchy position (part number, depth level) to enable automated hierarchy rule checking.

2. Cross-document reference resolution should include version awareness. A reference to 17.05 v0.1 should resolve even if the current version is 17.05 v0.3.

3. Contradiction detection should be an automated or semi-automated pipeline that scans documents for conflicting statements and flags them for human review.

## 11. Governance Implications

1. Contradictions between theory documents are governance issues. They undermine the coherence that governance rules are meant to enforce.

2. Contradiction resolution must be documented. The outcome, the rationale, and any changes to affected documents are recorded in the decision log.

3. Theory primacy means that product and engineering decisions that contradict theory must be escalated. Theory is the governing framework; deviations require governance review.

4. Version precedence means that outdated versions should not be cited as current. If someone cites an old version, the governance response is to reference the current version.

## 12. AI / Intelligence Implications

1. AI can assist in contradiction detection by comparing statements across documents and flagging potential conflicts.

2. AI can help enforce theory primacy by checking that product and engineering documents are consistent with theory documents during authoring.

3. AI should not resolve contradictions. Contradiction resolution requires human judgment about which document is correct and whether a document needs to be updated.

## 13. UX Implications

1. Source of truth information should be visible on every document: hierarchy position, whether it is the current version, and whether it has any known contradictions.

2. Cross-references should indicate whether the referenced document is current or outdated.

3. Contradiction flags should be visible to document owners and administrators. Contradictions should not be hidden from readers.

## 14. Commercial Implications

1. Source of truth clarity enables confident external communication. When customers or partners ask about AQLIYA's position on a topic, the answer can reference a specific document and version.

2. Theory primacy prevents marketing and sales from making claims that theory does not support. Theory documents set the boundaries for external communication.

3. Contradiction resolution demonstrates intellectual rigor. Customers who encounter the theoretical system can see that contradictions are identified, escalated, and resolved.

## 15. Anti-Patterns

1. **Source of truth by recency.** Assuming that the most recently updated document is authoritative for all topics. Recency is not authority — hierarchy is.

2. **Source of truth by convenience.** Citing the document that is easiest to find or most convenient to reference, regardless of hierarchy position.

3. **Theory disregard.** Making product or engineering decisions without checking theory documents. Theory primacy means theory sets the boundaries.

4. **Contradiction tolerance.** Discovering a contradiction and not reporting it. Contradictions are defects that must be resolved, not differences of opinion to tolerate.

5. **Version ignorance.** Citing a theory document without referencing the version. "Per 17.05" is insufficient — it must be "Per 17.05 v0.2."

## 16. Examples

**Example 1: Hierarchy Resolution.** Document 17.05 (Evidence, Part 17, Level 4) states "evidence requires digital signature verification." Document 01.09 (Part 01, Level 1) states "trust is established through provenance, not signatures." The hierarchy rule applies: Part 01 overrides Part 17. The position is that provenance, not digital signatures, establishes trust.

**Example 2: Specificity Exception.** Document 17.01 (Intelligence, Part 17, Level 4) provides a general definition of intelligence. Document 17.05 (Evidence, Part 17, Level 4) provides a specific treatment of evidence as a type of intelligence. For evidence-specific questions, 17.05 takes priority over 17.01 because it is more specific within the same hierarchy level.

**Example 3: Contradiction Escalation.** Document 07.01 states "workflows are always linear sequences." Document 10.01 states "workflows may include parallel human-AI collaboration." Both are in different parts at different levels. The hierarchy rule does not clearly resolve the contradiction. Escalated to the founding team, which determines that 10.01's position is correct and 07.01 requires revision.

## 17. Enterprise Impact

1. **Decision clarity.** Team members can determine authoritative positions quickly and confidently. No guessing about which source to trust.

2. **Contradiction resolution.** Contradictions are identified and resolved rather than tolerated. The system remains coherent.

3. **External confidence.** Customers and partners can rely on theory documents as definitive statements of AQLIYA's position.

4. **Cross-functional alignment.** Product, engineering, and marketing all reference the same source of truth. Decisions are consistent across functions.

## 18. Long-Term Strategic Importance

Source of truth rules are the mechanism that maintains the theoretical reference system as a coherent intellectual system. Without them, the system is a collection of documents that may or may not agree with each other. With them, the system is a single, authoritative body of theory where every document occupies a known position in a known hierarchy.

As the system grows, source of truth rules become more important. More documents mean more opportunities for contradiction. The rules provide the framework for identifying and resolving contradictions before they undermine the system's authority.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 00.02 | 00-governance-rules.md | Governance rules that source of truth rules support |
| 21.01 | Documentation Writing Standards | Writing standards for clear, unambiguous positions |
| 21.04 | Versioning Rules | Version determines current authoritative version |
| 21.05 | Ownership Rules | Owner responds to contradiction escalations |
| 21.09 | Relationship Between Docs | Cross-document relationship mapping |

## 20. Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-05-08 | Founding Team | Approved as part of AQLIYA Core Doctrine v1.0 |
| 0.2 | 2026-05-08 | Founding Team | Reviewed for documentation governance consistency and promoted to Reviewed |
| 0.1 | 2026-05-08 | Founding Team | Initial draft |
