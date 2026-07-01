---
title: Update Rules
document_id: 21.07
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 2 - Domain Theory
related_documents: 00.02, 21.01, 21.03, 21.04, 21.08
---

# Update Rules

## 1. Purpose

This document defines the rules and procedures for updating documents within the AQLIYA Theoretical Reference System. Updates include substantive content changes, minor revisions, patch-level fixes, and deprecation. Each update type has defined procedures, required approvals, and documentation standards. Without explicit update rules, documents are updated inconsistently: some changes are made without tracking, some are over-scoped, some are under-reviewed, and the system's evolution is ungoverned.

## 2. Thesis

Every document update has a type, a trigger, a procedure, and a documentation requirement. The update rules define these dimensions so that every change to the theoretical reference system is governed, tracked, and reversible. An update is not just a change to a document — it is a governance event that may affect cross-document references, strategic alignment, and the system's intellectual coherence.

## 3. Problem

Document updates in most organizations are casual affairs. Someone notices an error, fixes it, and moves on. There is no tracking of what changed, why it changed, or what other documents might be affected. In a document collection, this casual approach is acceptable. In a governed theoretical reference system, it is not. An update to one document may contradict another document. An update that changes a thesis may affect dozens of downstream documents. An update that deprecates a concept may affect every document that references it.

## 4. Why Existing Systems Fail

Wiki-based editing allows anyone to change anything at any time. There is no concept of update types, required approvals, or cross-document impact assessment. Version control systems (Git) track changes but do not distinguish between substantive updates and typo fixes, do not enforce review requirements, and do not assess cross-document impact. Document management systems have check-in/check-out workflows but are designed for administrative documents, not for governed theory systems.

## 5. AQLIYA Philosophy

Document updates are governance events with defined types, procedures, and documentation requirements. The system distinguishes between: (1) patch updates (typos, formatting, links — no substantive change); (2) minor updates (new content, revisions without thesis change); (3) major updates (thesis revision, core principle change); (4) deprecation (document is no longer accurate). Each type has different review requirements, approval authority, and documentation standards.

## 6. Core Principles

1. **Every update has a type.** Patch, minor, major, or deprecation. The type determines the procedure, approval, and documentation required.

2. **Updates are governed, not casual.** Even a typo fix is recorded. No change is invisible.

3. **Cross-document impact is assessed.** An update to one document may affect others. The updater must identify affected documents and notify their owners.

4. **Updates are reversible.** The version history enables rollback. Previous versions are retrievable.

5. **Updates are documented.** Every update records: what changed, why, who approved it, and what the cross-document impact was.

6. **Deprecation is an active action.** A document is not deprecated by neglect — it is deprecated through a governed process with documented rationale.

## 7. Key Concepts

- **Patch Update:** A non-substantive change. Typos, formatting, link updates, and minor clarifications that do not change the document's meaning. No version number change. Requires only author action. No review required.

- **Minor Update:** A substantive change that does not revise the thesis or core principles. New sections, revised examples, updated implications, additional concepts. Minor version number increment (X.Y → X.(Y+1)). Requires owner approval.

- **Major Update:** A substantive change that revises the thesis, core principles, or foundational positions. Major version number increment (X.Y → (X+1).0). Requires governance approval from the founding team.

- **Deprecation:** The document is no longer accurate or relevant. Status changes to Deprecated. The document is not deleted — it remains in the system with a Deprecated status and a deprecation notice. Requires governance approval.

- **Cross-Document Impact Assessment:** Before any major or minor update, the updater identifies which other documents reference the document being updated and assesses whether those references are affected.

- **Update Notification:** After any update, the owners of affected documents are notified so they can assess whether their documents require updates.

## 8. Operational Implications

1. Patch updates are self-service. The author makes the change, records it in the version history, and moves on. No notification required.

2. Minor updates require owner approval. The owner reviews the changes, confirms they do not affect the thesis, and approves the version increment.

3. Major updates require founding team approval. The updater submits a change request with: the proposed changes, the rationale, and the cross-document impact assessment.

4. Deprecation requires founding team approval. The request documents: why the document is no longer accurate, what replaces it (if anything), and which documents reference it and need to be updated.

5. Cross-document impact assessment is the updater's responsibility. The system should support this by showing incoming references (documents that reference the document being updated).

6. After any minor or major update, the document owner notifies owners of affected documents. Affected document owners have 30 days to respond.

## 9. Product Implications

1. The theory reference system should support update workflows: initiate update, select type, make changes, submit for approval (if required), record version history.

2. The system should show incoming references: which documents reference the document being updated. This supports cross-document impact assessment.

3. The system should notify affected document owners automatically after an update is published.

4. The system should track update types and history alongside version history.

## 10. Architecture Implications

1. Update metadata (type, rationale, approver, cross-document impact) should be stored alongside version history.

2. Incoming reference resolution should be a system feature. The system should maintain a reference graph that can be queried: "which documents reference this one?"

3. Notification infrastructure should support update notifications: sending alerts to document owners when documents they own are affected by updates to other documents.

## 11. Governance Implications

1. Update types are governance categories. Major updates and deprecations require governance approval. Minor updates require owner approval. Patch updates require no approval.

2. Unauthorized major updates (changing a thesis without governance approval) are governance violations. The update should be reverted and the document restored to its previous version.

3. Deprecated documents remain in the system for reference. They are not deleted. The Deprecated status and deprecation notice inform readers that the document is no longer current.

4. Cross-document impact is a governance concern. An update that affects multiple documents without notifying their owners is a process violation, even if the update itself is valid.

## 12. AI / Intelligence Implications

1. AI can assist in cross-document impact assessment by identifying documents that reference the document being updated and summarizing the nature of the references.

2. AI can assist in update type classification by analyzing the proposed changes and suggesting the appropriate update type based on the nature and scope of the changes.

3. AI should not approve updates. Approval is a governance function.

## 13. UX Implications

1. The update workflow should guide the author through the process: select update type, make changes, assess cross-document impact, submit for approval (if required).

2. The version history should display update types alongside version numbers and descriptions. Readers should see: "0.2 (minor) — Added operational implications" not just "0.2."

3. Deprecated documents should display a prominent deprecation notice and a link to the replacement document (if one exists).

## 14. Commercial Implications

1. Governed updates demonstrate intellectual discipline. Customers and partners can see that the theoretical system evolves through a structured process, not through casual edits.

2. Deprecation transparency prevents readers from relying on outdated positions. A deprecated document with a clear notice is better than an outdated document that appears current.

3. Cross-document impact assessment prevents cascading errors. When a theory position changes, all affected documents are identified and updated.

## 15. Anti-Patterns

1. **Silent update.** Making a substantive change without recording it in the version history. Every substantive change, even a minor one, must be recorded.

2. **Scope creep.** Starting a patch update and making substantive changes without following the minor or major update procedure.

3. **Approval bypass.** Making a major change and calling it a minor update to avoid governance approval.

4. **Impact neglect.** Updating a document without assessing which other documents are affected.

5. **Deprecation by neglect.** Letting a document become outdated without formally deprecating it. Deprecation is an action, not a state of decay.

6. **Rollback without record.** Reverting a document to a previous version without recording the reversion as an update event.

## 16. Examples

**Example 1: Patch Update.** A reader finds a broken link in section 19 of 17.08. The author fixes the link and records: "0.1-patch1: Fixed broken link in section 19 (Related Documents)." No version change. No notification required.

**Example 2: Minor Update.** The product team adds a new evidence type. The owner of 17.05 (Evidence) updates section 7 (Key Concepts) to include the new evidence type and section 9 (Product Implications) to describe its product implications. Version bumps from 0.2 to 0.3. The owner approves.

**Example 3: Major Update.** A strategic shift changes AQLIYA's position on intelligence sovereignty. The owner of 12.06 proposes a major update: revised thesis, new core principles, updated operational implications. The change request includes cross-document impact assessment showing that 19.09, 19.08, and 08.01 are affected. The founding team approves the update. Version bumps from 1.0 to 2.0. Affected document owners are notified.

## 17. Enterprise Impact

1. **Governed evolution.** The theoretical system evolves through a structured process. Every change is tracked, reviewed, and documented.

2. **Cross-document consistency.** Updates to one document do not create contradictions with others because cross-document impact is assessed.

3. **Historical integrity.** The version history preserves the complete record of changes. Any past state can be reconstructed.

4. **Regulatory defensibility.** Regulators reviewing AQLIYA's theory evolution can see that changes were made through a governed process.

## 18. Long-Term Strategic Importance

Update rules ensure that the theoretical reference system can evolve without losing its coherence. As the system grows and changes over years, the update rules are what prevent it from becoming a patchwork of inconsistent changes. They are the governance mechanism that enables evolution without decay.

The update rules also protect the system from unauthorized drift. In a system with many authors, the rules ensure that no single author makes a change that contradicts the system's overall coherence. Updates are governed, not casual.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 00.02 | 00-governance-rules.md | Governance rules for update approvals |
| 21.01 | Documentation Writing Standards | Writing standards for update content |
| 21.03 | Review Cadence | Reviews may trigger updates |
| 21.04 | Versioning Rules | Version numbers track update significance |
| 21.08 | Decision Log Integration | Major updates logged in decision log |

## 20. Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.2 | 2026-05-08 | Founding Team | Reviewed for documentation governance consistency and promoted to Reviewed |
| 0.1 | 2026-05-08 | Founding Team | Initial draft |
