---
title: AI Recommendation Boundary
document_id: 15.11
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 2 - Domain Theory
related_documents: 01.01, 02.01, 05.01, 08.10, 10.01, 10.04, 15.01, 15.02, 15.04, 15.07, 15.10
---

# AI Recommendation Boundary

## 1. Purpose

This document defines the boundary between what AI may recommend and what AI may not approach in AQLIYA. It establishes explicit limits on AI recommendation scope, ensuring that recommendations are bounded, disclosed, and structurally prevented from becoming decisions.

## 2. Thesis

**AI recommendations in AQLIYA are bounded contributions to professional decision-making. There is a line that recommendations must not cross: they may not become conclusions, they may not determine outcomes, and they may not carry decision authority. This boundary is structural, not aspirational.**

## 3. Problem

AI recommendations, when unbounded, tend to expand their scope and influence. A system that recommends transaction anomalies may come to recommend risk assessments. A system that suggests evidence links may come to suggest findings. A system that flags patterns may come to determine audit scope. Each expansion is incremental and often well-intentioned, but the cumulative effect is that AI recommendations drift toward decision authority they cannot bear.

In audit and financial domains, this creates:
- recommendations that effectively determine decisions because professionals lack the time or information to challenge them
- AI influence over critical outcomes without the accountability that must attend those outcomes
- erosion of professional judgment through repeated default acceptance of recommendations
- regulatory exposure from decisions influenced by unbounded AI recommendations without disclosed AI involvement

## 4. Why Existing Systems Fail

- AI tools that recommend findings presented as conclusions awaiting approval
- risk assessment platforms that assign risk levels that determine audit scope without human determination
- document review tools that recommend conclusions that professionals ratify without scrutiny
- financial analysis tools that recommend positions that effectively become decisions
- workflow systems where AI recommendations auto-advance to the next step without professional assessment

The common failure is that recommendation boundaries are left to user discretion and system defaults rather than structural enforcement.

## 5. AQLIYA Philosophy

AQLIYA holds that AI recommendations are valuable contributions to professional decision-making, but only when they operate within defined boundaries. The recommendation boundary defines:
- what AI may recommend: signals, candidates, links, patterns, observations
- what AI may not approach: conclusions, decisions, approvals, opinions, determinations
- how recommendations must be presented: bounded, disclosed, challengeable, and subordinate to professional judgment

AI assists. Humans decide. The recommendation boundary is the structural enforcement of this principle at the output level.

## 6. Core Principles

1. AI may recommend; it may not decide, conclude, approve, or determine.
2. Recommendations must be labeled as recommendations with clear authority limits.
3. Recommendation boundaries must be defined per workflow step and enforced structurally.
4. Recommendations must include their limitations, confidence, and evidence gaps.
5. Professional judgment must be the final authority on all material matters.
6. Recommendations must never be designed or presented as decisions awaiting ratification.

## 7. Key Concepts

- **Recommendation Boundary:** The defined line separating what AI may recommend from what requires human decision authority.
- **Recommendation Classification:** The explicit labeling of AI outputs as recommendations, signals, or candidates, never as conclusions or decisions.
- **Recommendation Disclosure:** The mandatory presentation of recommendation scope, limitations, and confidence alongside the recommendation itself.
- **Decision Boundary:** The space where only human professional authority may operate, which AI may not approach with recommendation language.
- **Bounded Recommendation:** A recommendation that explicitly states what it covers, what it does not cover, and what professional action it supports but cannot determine.

## 8. Operational Implications

1. Implementation teams must define the recommendation boundary for each AI output type in each workflow.
2. Training must teach professionals to distinguish recommendations from decisions and to exercise judgment on both.
3. Quality reviews must assess whether recommendations stayed within their defined boundaries.
4. Monitoring must track how recommendations influence decisions to detect boundary drift.
5. Recommendation boundary configurations must be governed, not left to user preference.

## 9. Product Implications

1. AI recommendations must display their classification, boundary, and authority level.
2. Recommendations must not auto-advance workflows; human decision is required at defined steps.
3. The interface must make it clear that recommendations require professional assessment.
4. Recommendation outputs must include limitation disclosure, confidence bounds, and evidence references.
5. Override and alternative paths must be as prominent as the recommended path.

## 10. Architecture Implications

1. AI outputs must carry a classification: recommendation, signal, or candidate, never conclusion or decision.
2. Recommendation boundaries must be defined as governance rules enforced by the workflow engine.
3. The system must prevent recommendations from carrying decision-level authority in any context.
4. Recommendation and decision records must be stored separately but linked for auditability.
5. Recommendation boundary violations must be detected and flagged as governance issues.

## 11. Governance Implications

- recommendation boundaries must be defined and approved for each AI output type
- recommendations may not carry language that implies conclusion, determination, or decision authority
- governance must define which matters may only be decided by human professionals
- recommendation boundary changes must go through governance review
- recommendation influence on decisions must be tracked and reported

## 12. AI / Intelligence Implications

AI in AQLIYA must:
- classify every output within its defined recommendation boundary
- use language appropriate to its classification: suggest, flag, identify, not conclude, determine, or decide
- include limitation disclosure and confidence bounds in every recommendation
- present recommendations as inputs to professional judgment, not as conclusions awaiting approval
- never output language that could be interpreted as a decision, conclusion, or determination

## 13. UX Implications

- recommendations must be visually distinct from decisions and conclusions
- classification labels must appear on every AI output: "AI Recommendation," "AI-Flagged Candidate," etc.
- recommendations must display their boundaries: what they cover and what they do not
- the workflow must require a separate human decision step after recommendation review
- alternative paths to the recommendation must be visible and accessible

## 14. Commercial Implications

Clear recommendation boundaries protect AQLIYA customers from regulatory and liability risk. Organizations in regulated domains need to know that AI recommendations have defined limits and that decisions remain with professionals. This doctrine supports AQLIYA's positioning as governed infrastructure rather than autonomous AI software, which is essential for adoption in audit, financial, and regulated enterprise markets.

## 15. Anti-Patterns

1. **Decision Language in Recommendations.** Using language like "concludes," "determines," or "decides" in AI outputs.
2. **Auto-Advancement.** Allowing AI recommendations to advance workflow steps without human decision.
3. **Recommendation Inflation.** Gradually expanding recommendation scope to cover decisions that should require human authority.
4. **Boundary Ambiguity.** Presenting recommendations without clear boundaries so professionals are unsure what is AI-suggested and what is human-decided.
5. **Default Acceptance Path.** Designing workflows where accepting the recommendation is the easy path and challenging it requires extra effort.
6. **Conclusion Framing.** Presenting recommendations in a format that looks like a conclusion that needs only approval rather than a suggestion that requires assessment.

## 16. Examples

**Example 1:** AQLIYA identifies unusual transactions and presents them as "AI-flagged candidates for review" with supporting evidence, methodology description, and limitation disclosure. The auditor reviews the candidates, applies professional judgment, and decides which to investigate. The findings carry the auditor's authority; the candidates carry the system's classification.

**Example 2:** The system generates a risk assessment recommendation for an audit area. The recommendation is labeled "AI Risk Recommendation" with confidence 76%, methodology described, and a note that controls testing data was incomplete. The audit manager reviews the recommendation, adjusts the risk level based on client context, and records their own risk determination.

**Example 3:** A controller receives a recommendation for accrual adjustments. The recommendation states the suggested amounts, the methodology, and that it does not cover year-end adjusting events. The controller modifies two amounts, adds an adjustment the system did not recommend, and approves. The final adjustments carry the controller's authority, not the system's.

## 17. Enterprise Impact

1. Clear recommendation boundaries prevent AI from overstepping into decision territory.
2. Professional judgment is preserved because recommendations require explicit assessment.
3. Regulatory defensibility is maintained because decisions carry human authority.
4. Liability is reduced because AI recommendations are clearly bounded and labeled.
5. Organizational trust increases because recommendation influence is transparent.

## 18. Long-Term Strategic Importance

As AI capabilities expand, the recommendation boundary will be tested repeatedly by market pressure, user expectations, and competitive dynamics. AQLIYA's doctrinal commitment to bounded recommendations ensures the platform remains suitable for regulated domains and protects against the regulatory and liability risks that follow unbounded AI recommendations. The recommendation boundary is a long-term trust moat.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 01.01 | AQLIYA Foundational Thesis | Foundational doctrine for bounded intelligence |
| 02.01 | Enterprise Decision Intelligence Theory | Decision infrastructure with recommendation boundaries |
| 05.01 | AuditOS Thesis | Audit domain with strictest recommendation boundaries |
| 08.10 | AI Governance Doctrine | Governance rules controlling AI behavior |
| 10.01 | Human + AI Thesis | Human decision authority over AI recommendations |
| 10.04 | AI Assistance Theory | AI as assistant with bounded scope |
| 15.01 | Responsible Intelligence Doctrine | Responsible intelligence governs recommendation scope |
| 15.02 | AI Responsibility Doctrine | AI responsibility bounded by recommendation scope |
| 15.04 | No-Autonomous-Audit Decision Rule | Audit decisions beyond recommendation boundary |
| 15.07 | Explainable Limitation Disclosure | Limitations must accompany recommendations |
| 15.10 | Responsible Automation Philosophy | Automation boundaries parallel recommendation boundaries |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.2 | 2026-05-08 | Founding Team | Reviewed for doctrinal consistency; cross-references corrected; promoted to Reviewed |
| 0.1 | 2026-05-07 | Founding Team | Initial draft |