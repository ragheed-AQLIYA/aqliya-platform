---
title: Versioning Rules
document_id: 21.04
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 2 - Domain Theory
related_documents: 00.02, 21.01, 21.03, 21.06, 21.07
---

# Versioning Rules

## 1. Purpose

This document defines the versioning scheme and rules for all documents within the AQLIYA Theoretical Reference System. Versioning ensures that every reader — team members, customers, partners, and automated systems — can determine the currency, history, and significance of changes to any theory document. Without explicit versioning rules, document history is ambiguous, references to specific versions are impossible, and the system cannot support governed evolution.

## 2. Thesis

Every document in the theoretical reference system has a version number that communicates its history and maturity. Version numbers follow a structured scheme: major.minor (X.Y). Major version changes indicate thesis-level changes. Minor version changes indicate substantive updates without thesis change. Patch-level changes (typos, formatting, non-substantive updates) do not change the version number but are tracked in the version history. Versioning is not an administrative detail — it is a communication mechanism that enables governed evolution.

## 3. Problem

Without explicit versioning, document history is ambiguous. A reader who encounters a document cannot determine whether it reflects the current position or a historical one. When a document is updated, there is no way to reference the previous version. When two documents disagree, there is no way to determine which version of each was in effect when the contradiction was introduced. In a governed system that must support regulatory defensibility and intellectual coherence, version ambiguity is unacceptable.

## 4. Why Existing Systems Fail

Wiki-based documentation tracks page history but does not assign semantic versions. Git-based document repositories track every commit but do not distinguish between substantive changes (thesis update) and non-substantive changes (typo fix). Document management systems assign version numbers based on save events, not on change significance. None of these approaches produce version numbers that communicate meaning about the nature and significance of changes.

## 5. AQLIYA Philosophy

Version numbers in the theoretical reference system communicate meaning, not just history. A version number tells the reader: (1) has the thesis changed since the last version? (major version increment); (2) has the document been substantively updated? (minor version increment); (3) is this the current version? (compare to latest). Version numbers enable governed evolution by making change significance explicit.

## 6. Core Principles

1. **Semantic versioning.** Version = major.minor. Major version changes when the thesis, core principles, or foundational positions change. Minor version changes when substantive content is added, revised, or reorganized without thesis change.

2. **Patch changes do not bump version.** Typos, formatting fixes, link updates, and minor clarifications that do not change meaning do not require a version bump. They are recorded in the version history with zero-version notation (e.g., "0.1.1-typo").

3. **Version 0.x indicates Draft status.** Documents at version 0.x are in Draft. Documents at version 1.0 or higher have been formally approved.

4. **Version history is append-only.** Every entry is added to the table. No entry is deleted or modified. Corrections to a version history entry require a new entry.

5. **The version is part of the document's permanent record.** When a document is referenced in another document, the referenced version should be noted. Cross-document references should include version context where significant.

6. **Document ID does not change.** The document_id (e.g., 17.05) is permanent. Even if the document is deprecated, the ID is not reused.

## 7. Key Concepts

- **Major Version (X.0):** A version that changes the thesis, core principles, or foundational positions of the document. Requires documented rationale in the version history. Requires governance review and approval.

- **Minor Version (X.Y):** A version that adds, revises, or reorganizes substantive content without changing the thesis. New sections, revised examples, updated operational implications. Requires owner review but not governance approval.

- **Patch (X.Y.Z):** An informal notation for non-substantive changes. Not tracked in the official version number but recorded in version history. Includes typos, formatting, link updates, and minor clarifications.

- **Version History Table:** The permanent, append-only record of all versions, patches, and changes to a document. Located in section 20 of every document.

- **Version Context:** The state of the theoretical reference system at the time a specific version was current. Useful for understanding cross-document relationships at a point in time.

## 8. Operational Implications

1. Every substantive document change requires a version bump. The author determines whether the change is major, minor, or patch-level.

2. Major version bumps require documented rationale in the version history: what changed, why, and what the implications are for documents that reference this one.

3. Minor version bumps are recorded with a brief description of the changes. No formal rationale is required, but the change description should be specific.

4. Patch changes are recorded in version history with zero-version notation (e.g., "0.1-patch1: fixed typo in section 3"). No version number change.

5. Version history entries are never removed or modified. If a version history entry contains an error, a new entry corrects it.

6. The current version is always the last entry in the version history table and the value in the frontmatter version field.

## 9. Product Implications

1. The theory reference system viewer should display the current version prominently and provide access to version history.

2. Version comparison should be supported: readers should be able to see what changed between two versions.

3. Cross-document references should optionally include version context: "See 17.05 v0.2."

## 10. Architecture Implications

1. Document storage should support versioned retrieval. Any past version should be retrievable from the system.

2. Version metadata (version number, change type, change description) should be stored alongside document content for query and comparison.

3. The system should support version tagging: major versions are tagged; minor versions are recorded; patches are logged.

## 11. Governance Implications

1. Major version changes require governance approval. A document at 1.0 that is updated to 2.0 has changed its thesis — this is a governance event.

2. The version history is a governance record. Regulatory inquiries into document accuracy can reference version history to determine what was current at a specific time.

3. Deprecated documents retain their version history. Deprecation is recorded as a status change, not as deletion or archival of version history.

## 12. AI / Intelligence Implications

1. AI-assisted document updates should include version impact assessment: "This change modifies the thesis — this is a major version change."

2. AI can assist in version comparison, highlighting what changed between versions and summarizing the significance.

## 13. UX Implications

1. Version information should be visible on every document page: current version, last updated date, and a link to version history.

2. Version history should be presented as a readable timeline, not a raw table.

3. When a document is referenced, the reference should include version context where the referenced version is different from the current version.

## 14. Commercial Implications

1. Version discipline signals professional rigor. Customers and partners who audit the theoretical system can see that changes are tracked, significant changes are governed, and the system maintains a complete history.

2. Version numbers enable support for specific positions: "As of version 2.0 of 17.05, AQLIYA's position is..."

## 15. Anti-Patterns

1. **Version inflation.** Bumping the version number for every trivial change. Minor clarifications are patches, not minor versions.

2. **Version neglect.** Never bumping the version number despite substantive changes. The document evolves but the version number stays at 0.1.

3. **Major version avoidance.** Making thesis-level changes but calling them minor version updates to avoid governance review. This undermines the semantic purpose of versioning.

4. **History editing.** Modifying or deleting version history entries. The history is append-only; corrections are new entries.

5. **Version number in isolation.** Displaying the version number without the document ID or status. 17.05 v0.2 Draft is different from 17.05 v0.2 Reviewed.

## 16. Examples

**Example 1: Patch Change.** A typo is found in section 3 of 17.08. The author fixes the typo and records: "0.1-patch1: fixed typo in section 3, paragraph 2." Version stays at 0.1.

**Example 2: Minor Version Change.** New operational implications are added to section 8 of 17.10. Version bumps from 0.1 to 0.2. Version history records: "0.2: Added operational implications for engagement handoff and archival."

**Example 3: Major Version Change.** The thesis of 02.01 is revised following a strategic shift. Version bumps from 1.0 to 2.0. Version history records the rationale: "2.0: Thesis revised to reflect expansion from audit-only to enterprise-wide decision intelligence. See decision log 2026-Q2-003."

## 17. Enterprise Impact

1. **Version clarity.** Every reader can determine the currency and history of any document. No ambiguity about what version is current.

2. **Governed evolution.** Thesis-level changes require governance approval. The versioning system makes change significance explicit.

3. **Historical reference.** Past versions are retrievable and referenced when needed for regulatory inquiries, strategic reviews, or cross-document analysis.

4. **Cross-document consistency.** When documents reference each other with version context, readers can understand the state of the system at the time of reference.

## 18. Long-Term Strategic Importance

Versioning rules enable the theoretical reference system to evolve without losing its history. As the system grows and changes over years, versioning ensures that every document's evolution is trackable, every reference is contextualized, and every change is governed. Without versioning, the system cannot support long-term evolution — it can only support static publication.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 00.02 | 00-governance-rules.md | Governance rules for version approval |
| 21.01 | Documentation Writing Standards | Version history format per writing standards |
| 21.03 | Review Cadence | Reviews may trigger version bumps |
| 21.06 | Source of Truth Rules | Version determines current position |
| 21.07 | Update Rules | Update procedures include versioning |

## 20. Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.2 | 2026-05-08 | Founding Team | Reviewed for documentation governance consistency and promoted to Reviewed |
| 0.1 | 2026-05-08 | Founding Team | Initial draft |
