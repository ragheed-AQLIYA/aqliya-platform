---
title: Review Cadence
document_id: 21.03
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 2 - Domain Theory
related_documents: 00.02, 21.01, 21.04, 21.05, 21.10
---

# Review Cadence

## 1. Purpose

This document defines the review cadence for the AQLIYA Theoretical Reference System — the schedule, triggers, and procedures for reviewing, updating, and maintaining theory documents. A review cadence ensures that the theoretical system remains accurate, relevant, and aligned with product development, market feedback, and strategic evolution. Without a defined cadence, documents are reviewed reactively — when someone complains, when a contradiction is discovered, or when a strategic shift makes documents obviously outdated.

## 2. Thesis

A theoretical reference system that is not actively maintained is a theoretical reference system that is gradually becoming inaccurate. Review cadence is the maintenance discipline that prevents this decay. It defines not just when reviews happen but what triggers them, who performs them, what they examine, and what outcomes they produce. The cadence transforms review from an exception into a routine.

## 3. Problem

Theoretical documents in most organizations follow a "write once, never update" pattern. They are created during a strategic initiative, reviewed once, approved, and then forgotten. The organization evolves. The market shifts. Product direction changes. But the theory documents remain frozen at the moment of their creation. New team members read outdated theory and draw incorrect conclusions. Strategic decisions reference outdated frameworks. The theoretical system becomes a source of confusion rather than clarity.

## 4. Why Existing Systems Fail

Wiki-based documentation lacks review cadence entirely. Documents are written and never revisited. Corporate policy documents have annual review requirements but these are compliance exercises, not substantive theory reviews. Product documentation is updated alongside releases but covers features, not theory. The AQLIYA Theoretical Reference System is different: it contains foundational theory that must remain accurate to serve as a reliable reference. Generic documentation practices cannot maintain this type of system.

## 5. AQLIYA Philosophy

Review cadence is a governance mechanism, not an administrative calendar. It ensures that every document in the theoretical system is periodically examined for accuracy, relevance, and alignment with current AQLIYA positions. The cadence is not a suggestion — it is a structural requirement that the system enforces through status tracking and ownership accountability.

## 6. Core Principles

1. **Every document has a review cycle.** No document is exempt from periodic review. Even foundational documents (Part 01) are reviewed at defined intervals.

2. **Review triggers are both scheduled and event-driven.** Scheduled reviews happen at defined intervals. Event-driven reviews are triggered by strategic changes, product changes, or identified contradictions.

3. **Review outcome is documented.** Every review produces an outcome: Approved, Needs Revision, or Deprecated. The outcome is recorded in the document's version history and status field.

4. **Review is performed by the document owner or a designated reviewer.** Ownership accountability is maintained. The document owner is responsible for ensuring the review happens.

5. **Review checks both content and compliance.** The reviewer examines theory accuracy (is the thesis still correct?), relevance (is this document still needed?), and compliance (does it follow current template and standards?).

## 7. Key Concepts

- **Scheduled Review:** A review triggered by calendar interval. Critical documents are reviewed quarterly. High priority documents are reviewed semi-annually. Medium and Low priority documents are reviewed annually.

- **Event-Driven Review:** A review triggered by a specific event: a strategic shift (new part or major thesis change), a product change (new feature that contradicts a theory position), a contradiction discovery (two documents that disagree), or a market feedback (customer or partner confusion traced to a theory document).

- **Review Outcome:** The result of a review: Approved (document is current and accurate), Needs Revision (document requires substantive update but the thesis is sound), or Deprecated (document is no longer accurate and should not be referenced as current position).

- **Review Window:** The period within which a review must be completed. Reviews open 30 days before the due date and close on the due date. Overdue reviews are escalated.

- **Review Backlog:** The accumulated documents whose review dates have passed without completion. Review backlog is a governance metric that indicates maintenance health.

## 8. Operational Implications

1. The review schedule is defined per document based on its priority:
   - Critical: Quarterly review (every 3 months)
   - High: Semi-annual review (every 6 months)  
   - Medium: Annual review (every 12 months)
   - Low: Annual review (every 12 months)

2. Review windows open 30 days before the due date. The document owner receives notification that review is due.

3. Event-driven reviews override the scheduled cadence. If a strategic event triggers a review in month 2, the scheduled quarterly review in month 3 is superseded (or may still proceed if the event-driven review was partial).

4. Review outcomes are recorded in the document's version history and the status field is updated. An Approved review does not change the version number. A Needs Revision outcome creates a task to update the document.

5. Overdue reviews are escalated: at 30 days overdue, the owner's manager is notified. At 60 days overdue, the founding team is notified.

6. Review completion rate is tracked as a system health metric. Target: 95% of reviews completed within the review window.

## 9. Product Implications

1. The theory reference system should track review dates, send notifications when reviews are due, and enforce review completion for status transitions.

2. Review dashboards should show upcoming reviews, overdue reviews, and review completion rates by owner and by part.

3. Review workflows should guide the reviewer through the review process: confirm accuracy, check compliance, update status, and record outcome.

## 10. Architecture Implications

1. Review metadata (review_date, next_review_date, review_outcome, reviewer) should be stored alongside document metadata.

2. Review notifications should be automated through the system's event infrastructure. Notifications should integrate with calendar systems and task management.

3. The review status should feed into document status transitions. An overdue review should be visible in the document's metadata and in system dashboards.

## 11. Governance Implications

1. Review cadence compliance is a governance requirement. Documents with overdue reviews may not be referenced as "current" in external communications.

2. Review outcomes that change document status (Approved → Needs Revision, Needs Revision → Deprecated) are governance events that require documented rationale.

3. Skipping a review is not permitted. If a document is to be deprecated, that decision must be made through the review process, not by skipping the review.

4. Review records are part of the governance trail. They demonstrate that the theoretical system is actively maintained and that document accuracy is regularly verified.

## 12. AI / Intelligence Implications

1. AI can assist document review by flagging potential inconsistencies between documents, identifying sections that may contradict more recent documents, and suggesting updates.

2. AI-driven contradiction detection can trigger event-driven reviews when two documents present conflicting positions.

3. AI should not make review decisions. The human reviewer determines whether a document is accurate, relevant, and compliant.

## 13. UX Implications

1. Review notifications should be actionable: "Document X is due for review. Click to start review." The review interface should guide the reviewer through the process.

2. Review status should be visible on document pages. Readers should see when a document was last reviewed and what the outcome was.

3. Review dashboards should be accessible to document owners and administrators. Review backlog should be prominently displayed.

## 14. Commercial Implications

1. A maintained theoretical system signals ongoing intellectual investment. Customers and partners who reference AQLIYA's theory benefit from accurate, current documentation.

2. Review cadence documentation (this document) demonstrates to customers that AQLIYA takes intellectual quality seriously — it is not a write-and-forget organization.

## 15. Anti-Patterns

1. **Review as checkbox.** Performing a review without substantive examination. The reviewer marks "Approved" without reading the document or verifying its accuracy.

2. **Review avoidance.** Letting reviews pile up until they become unmanageable. A review backlog of dozens of documents is a maintenance crisis, not an administrative backlog.

3. **Document hoarding.** Keeping documents at Reviewed status when they should be Deprecated. Outdated documents that remain in Reviewed status mislead readers.

4. **Event-driven over-scheduling.** Triggering event-driven reviews for every minor change. Event-driven reviews should be reserved for significant events that genuinely affect theory documents.

5. **Owner drift.** Changing document ownership without updating the owner field. The review notification goes to the wrong person.

## 16. Examples

**Example 1: Scheduled Review.** 17.05 (Evidence) was last reviewed on 2026-05-08. Its priority is High, so its next scheduled review is 2026-11-08. On 2026-10-09, the review window opens. The document owner receives a notification. They have 30 days to complete the review.

**Example 2: Event-Driven Review.** A new product feature changes how evidence is ingested, contradicting the position stated in 17.05 section 9 (Product Implications). The product team flags the contradiction. An event-driven review is triggered for 17.05. The document owner updates section 9 to reflect the new product direction.

## 17. Enterprise Impact

1. **Accuracy maintenance.** Regular reviews ensure that theory documents reflect current AQLIYA positions, not historical positions.

2. **Risk reduction.** Outdated theory documents can lead to incorrect product decisions, misaligned engineering, and confused customer communication. Review cadence reduces this risk.

3. **Intellectual credibility.** A maintained theoretical system signals that AQLIYA treats its theory as a living framework, not a static document set.

4. **Onboarding reliability.** New team members can trust that the documents they read are current and accurate.

## 18. Long-Term Strategic Importance

Review cadence is the maintenance discipline that prevents the theoretical reference system from decaying. Without it, the system gradually becomes inaccurate, then irrelevant, then abandoned. With it, the system remains a living, accurate, trustworthy reference that compounds in value as it matures.

The review cadence is also the mechanism through which the system adapts to strategic evolution. As AQLIYA's product, market, and theory evolve, the review cadence ensures that the theory documents evolve with them — not through a single rewrite, but through continuous, governed maintenance.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 00.02 | 00-governance-rules.md | Governance rules that review cadence supports |
| 21.01 | Documentation Writing Standards | Reviews include standards compliance check |
| 21.04 | Versioning Rules | How reviews affect document versions |
| 21.05 | Ownership Rules | Document owner is responsible for review |
| 21.10 | Documentation Quality Checklist | Review checklist used during reviews |

## 20. Version History

| Version | Date | Author | Changes |
|---|---|---|---|
| 0.2 | 2026-05-08 | Founding Team | Reviewed for documentation governance consistency and promoted to Reviewed |
| 0.1 | 2026-05-08 | Founding Team | Initial draft |
