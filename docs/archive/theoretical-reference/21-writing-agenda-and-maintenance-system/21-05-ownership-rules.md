---
title: Ownership Rules
document_id: 21.05
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 2 - Domain Theory
related_documents: 00.02, 21.03, 21.04, 21.06, 21.07
---

# Ownership Rules

## 1. Purpose

This document defines the ownership model for all documents within the AQLIYA Theoretical Reference System. Every document has a single owner who is accountable for its accuracy, currency, review, and evolution. Ownership is not authorship — the owner may not have written the document but is responsible for its maintenance. Without explicit ownership, documents drift: no one is accountable for updates, reviews are missed, and the system decays from neglected maintenance.

## 2. Thesis

Every document in the theoretical reference system must have exactly one owner. The owner is the person accountable for: (1) maintaining the document's accuracy and currency; (2) completing scheduled reviews; (3) approving substantive changes; (4) ensuring the document remains aligned with current AQLIYA positions. Ownership is a governance responsibility, not an administrative label. An owner who cannot perform these duties must transfer ownership before they are relieved of responsibility.

## 3. Problem

Documentation systems without explicit ownership degrade faster than they are maintained. Documents become orphaned — no one is accountable for keeping them current. When strategic changes occur, the documents that should be updated are not, because no one is responsible. When contradictions are discovered, no one is tasked with resolving them. When reviews are due, no one receives the notification. Orphaned documents undermine the entire system because readers cannot distinguish between documents that are maintained and documents that are abandoned.

## 4. Why Existing Systems Fail

Wiki-based documentation assigns ownership to the page creator by default but does not enforce maintenance accountability. When the creator leaves the organization or changes roles, the page becomes ownerless. Corporate document management systems assign document owners as metadata but do not enforce ownership responsibilities — reviews, updates, and accuracy checks are not tied to ownership. The AQLIYA system treats ownership as an active responsibility, not a metadata field.

## 5. AQLIYA Philosophy

Ownership is a governance role, not a recognition of authorship. The owner is the person who ensures the document remains accurate and useful. They may delegate writing, review, and update tasks to others, but they retain accountability for the document's quality. Ownership is assigned by the founding team or by the previous owner through a governed transfer process. Ownership must be filled at all times; if an owner leaves the organization, a new owner is assigned before they depart.

## 6. Core Principles

1. **Every document has exactly one owner.** No shared ownership, no group ownership, no orphaned documents. One person is accountable.

2. **Ownership is a governance role.** The owner is responsible for accuracy, currency, review, and alignment. These are maintenance responsibilities, not creative ones.

3. **Ownership is transferable.** An owner may transfer ownership to another qualified person. The transfer must be documented and approved by the founding team.

4. **Ownership is not authorship.** The owner may not have written the document. They may delegate writing tasks. They retain accountability regardless of who performs the work.

5. **Ownership cannot be abandoned.** If an owner leaves the organization, a new owner is assigned before the departure. Ownerless documents are not permitted.

6. **Ownership is recorded in frontmatter.** The owner field in every document's frontmatter identifies the accountable person. This field must be kept current.

## 7. Key Concepts

- **Document Owner:** The person accountable for a document's accuracy, currency, review, and alignment. Identified in the frontmatter owner field.

- **Ownership Accountability:** The owner's responsibility for: completing reviews on schedule, approving substantive changes, maintaining accuracy, and ensuring alignment with current AQLIYA positions.

- **Ownership Transfer:** The governed process of transferring ownership from one person to another. Requires documented agreement from both parties and founding team approval.

- **Owner Absence:** A period when a document has no assigned owner. Not permitted. If an owner leaves, a replacement must be assigned before departure.

- **Interim Owner:** A temporary owner assigned during a transition period. The interim owner has full ownership accountability for the duration of the assignment.

## 8. Operational Implications

1. Every document must have a non-empty owner field in its frontmatter. If the owner field is empty, the document is considered incomplete.

2. The owner receives all system notifications for the document: review due dates, update requests, contradiction flags, and cross-reference notifications.

3. The owner must respond to review notifications within the review window. Failure to complete review is escalated.

4. Ownership transfers must be documented in the version history of the affected document: "Ownership transferred from A to B on [date]."

5. If an owner is unavailable (leave, extended absence), an interim owner is assigned for the duration. The interim owner assumes full accountability.

6. The founding team maintains a document ownership roster. Changes to ownership are reflected in the roster within 5 business days.

## 9. Product Implications

1. The theory reference system should display the document owner on every document page, with contact information or a mechanism to contact the owner.

2. Ownership should be queryable: "Show me all documents owned by X" and "Show me documents with no owner."

3. Ownership transfer should be a system workflow: the current owner initiates, the proposed owner confirms, and the founding team approves.

## 10. Architecture Implications

1. The owner field is a required metadata attribute. Documents without an owner should be flagged as incomplete by the system.

2. Ownership information should be stored in a queryable registry that supports ownership reports and transfer tracking.

3. Notifications for reviews, updates, and cross-reference changes should be sent to the document owner automatically.

## 11. Governance Implications

1. Ownership is a governance requirement. Documents without owners are not compliant with governance rules and should not be referenced as current.

2. Ownership transfers must be governed. An owner cannot simply walk away — they must transfer ownership through the governed process.

3. The founding team has the authority to reassign ownership if the current owner is not fulfilling their responsibilities.

4. Ownership disputes (two people claiming ownership of the same document, or no one willing to accept ownership) are escalated to the founding team for resolution.

## 12. AI / Intelligence Implications

1. AI can assist by flagging documents with missing or stale owner information. "Document 17.08 has not been reviewed in 18 months and owner has not responded to notifications."

2. AI should not make ownership assignments. Ownership is a governance role that requires human accountability.

## 13. UX Implications

1. Owner information should be prominently displayed on document pages, not buried in frontmatter.

2. Contacting the owner should be straightforward: a "contact owner" link or button.

3. Ownership transfer should be a guided workflow with clear steps and confirmation requirements.

## 14. Commercial Implications

1. Ownership accountability signals professional rigor. Customers and partners who interact with the theoretical system can see that every document has an accountable person.

2. Ownership enables response: when a customer questions a theory document, the owner is the person who responds with authority.

## 15. Anti-Patterns

1. **Owner as author.** Treating the original author as the permanent owner. Authorship and ownership are separate roles.

2. **Group ownership.** Listing a team or department as the owner. "Engineering" or "Product" cannot be owners — only individuals can be accountable.

3. **Ghost ownership.** Listing an owner who has left the organization or changed roles. Frontmatter must be kept current.

4. **Ownership avoidance.** People refusing ownership because they do not want the accountability. Ownership is assigned, not volunteered.

5. **Ownership capture.** A single person owning a large number of documents and becoming a bottleneck for reviews and updates.

## 16. Examples

**Example 1: Ownership Transfer.** Alice is the owner of 17.05 (Evidence) but is moving to a different team. She initiates an ownership transfer to Bob: (1) Alice notifies Bob of the pending transfer; (2) Bob confirms acceptance; (3) the founding team approves; (4) the frontmatter owner field is updated; (5) the version history records: "Ownership transferred from Alice to Bob on 2026-08-15."

**Example 2: Interim Ownership.** Carlos is going on parental leave for six months. He transfers ownership to Diana as interim owner for the leave period. Diana assumes full ownership accountability. When Carlos returns, ownership transfers back to him through the same process.

## 17. Enterprise Impact

1. **Accountability clarity.** Every document has a person who is responsible for its quality. No document is orphaned.

2. **Maintenance reliability.** Owners receive and respond to review notifications. Reviews are completed on schedule.

3. **Response capability.** When questions arise about a document, the owner can respond with authority.

4. **System resilience.** When an owner leaves, the transfer process ensures continuity. No document becomes ownerless.

## 18. Long-Term Strategic Importance

Ownership rules ensure that the theoretical reference system is maintainable over the long term. As the organization grows and people change roles, ownership ensures that every document has an accountable person at all times. Without ownership rules, the system would accumulate orphaned documents that gradually become inaccurate and unreliable.

Ownership also creates a career development path. Taking ownership of a theory document is a professional responsibility that builds domain expertise, governance understanding, and cross-functional collaboration skills.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 00.02 | 00-governance-rules.md | Governance rules that ownership supports |
| 21.03 | Review Cadence | Owner is responsible for completing reviews |
| 21.04 | Versioning Rules | Owner approves version bumps |
| 21.06 | Source of Truth Rules | Owner ensures document is source of truth |
| 21.07 | Update Rules | Owner approves substantive updates |

## 20. Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.2 | 2026-05-08 | Founding Team | Reviewed for documentation governance consistency and promoted to Reviewed |
| 0.1 | 2026-05-08 | Founding Team | Initial draft |
