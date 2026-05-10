---
title: Recommendation
document_id: 17.03
status: Reviewed v0.2
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: High
depth_level: Level 4 — Definition
related_documents: 17.01, 17.02, 17.05, 17.15, 10.04, 15.11
---

# Recommendation

## 1. Purpose

This document defines "Recommendation" as a structured concept within AQLIYA. Recommendations are the primary output of the intelligence layer and the primary input to human decisions. Without a precise definition, the boundary between what the system recommends and what the human decides becomes blurred — a confusion that leads to accountability drift, liability transfer, and governance failure. This definition ensures that recommendations are always understood as assistive inputs, never autonomous conclusions.

## 2. Thesis

A recommendation in AQLIYA is an evidence-backed, structured proposal produced by the intelligence layer within a governed workflow, presented to a professional human reviewer for judgment, modification, or rejection. Recommendations are not decisions. They are not conclusions. They are not autonomous actions. They are assistive inputs that carry evidence provenance, confidence assessments, and explicit boundaries. Every recommendation must be traceable to its underlying evidence, explainable in domain-relevant terms, and subject to human review and decision.

## 3. Problem

In current practice, recommendations exist in an ambiguous space. An auditor's "recommendation" to a client is a professional opinion with liability. A system's "recommendation" to flag an anomaly is a technical output with no professional standing. In regulated domains, this ambiguity is dangerous:

1. **Accountability confusion**: When a system "recommends" an action and a human follows it without independent judgment, professional accountability is compromised.
2. **Liability transfer**: If a recommendation is treated as a conclusion, liability shifts from the professional to the system — a shift that regulatory frameworks do not support.
3. **Trust erosion**: Recommendations without evidence provenance appear arbitrary. Reviewers either blindly follow them or dismiss them — neither improving decision quality.

## 4. Why Existing Systems Fail

**Audit management platforms** produce checklists and status updates, not structured recommendations with evidence backing. Reviewers work from experience and intuition, not from system-generated proposals.

**AI chatbots** produce natural language outputs called "recommendations" but without evidence traces, governance boundaries, or professional domain framing. They are generated text, not professional proposals.

**Rule engines** produce alerts called "recommendations" but without the context, alternatives, or confidence assessment that makes a recommendation useful for professional judgment.

**Spreadsheets and manual processes** produce "recommendations" embedded in analyst notes — unstructured, untraceable, and disconnected from the decision workflow.

The common failure: recommendations are either unstructured (natural language), untraceable (no evidence chain), ungoverned (no review/approval), or unauthorized (presented as conclusions rather than proposals).

## 5. AQLIYA Philosophy

AQLIYA's approach to recommendations follows four principles:

1. **Recommendations are structured proposals, not conclusions.** They present a course of action with supporting evidence, alternatives considered, and confidence assessment — but they require human judgment to become decisions.
2. **Recommendations are evidence-backed.** Every recommendation links to the evidence that supports it. A recommendation without an evidence trace is not a recommendation — it is an assertion.
3. **Recommendations are explainable.** The reasoning behind a recommendation must be presentable in domain-relevant terms that a professional reviewer can evaluate, challenge, and validate.
4. **Recommendations are bounded.** Every recommendation has explicit boundaries — what it covers, what it does not cover, what confidence level it carries, and what alternatives exist. Recommendations do not claim universal applicability.

## 6. Core Principles

1. **Assistive, not autonomous.** Recommendations propose; reviewers decide. The system never presents a recommendation as a final action.
2. **Evidence is mandatory.** A recommendation must link to the evidence that supports it. The reviewer must be able to inspect, validate, and challenge the evidence.
3. **Confidence is explicit.** Every recommendation carries a confidence assessment communicated in domain-relevant terms (strong, moderate, weak evidence) — not raw probabilities.
4. **Alternatives are visible.** Recommendations present the primary proposal alongside alternatives considered, with evidence for and against each.
5. **Human action is recorded.** Whether the reviewer accepts, modifies, rejects, or escalates the recommendation, the action and its reasoning become part of the decision record.
6. **Feedback loops are structural.** Reviewer actions on recommendations (accept, modify, reject) feed back into the intelligence layer for continuous improvement.

## 7. Key Concepts

- **Recommendation Object:** A structured output containing: the proposal, supporting evidence references, confidence assessment, alternatives considered, domain context, and governance constraints.
- **Recommendation Confidence:** The system's assessment of how strongly the evidence supports the recommendation, expressed in professional terms rather than statistical percentages.
- **Recommendation Boundary:** The explicit scope of what the recommendation covers, what it does not cover, and the conditions under which it applies.
- **Recommendation Action:** The human reviewer's response to a recommendation — accept, modify, reject, or escalate — recorded with reasoning and linked to the corresponding decision object.
- **Recommendation Feedback:** The structured signal generated when a reviewer acts on a recommendation, used to improve future intelligence outputs.

## 8. Operational Implications

1. Implementation teams must define recommendation types for each domain — what the system will recommend, in what context, with what evidence requirements, and at what confidence thresholds.
2. Reviewers must be trained to treat recommendations as proposals requiring professional judgment, not as pre-decided conclusions to rubber-stamp.
3. Operations teams must track recommendation quality metrics: acceptance rates, modification rates, rejection rates, and the correlation between recommendation confidence and reviewer agreement.
4. When a recommendation is modified, the modification and reasoning must be documented as part of the decision record — this is not optional overhead, it is professional documentation.
5. Engagement-level governance must define which recommendation types require escalation beyond the initial reviewer.

## 9. Product Implications

1. Recommendations appear within workflow steps, not in separate AI panels. The reviewer encounters recommendations in the natural course of their professional workflow.
2. Every recommendation displays its evidence trace by default or via one-click expansion. The reviewer should not have to search for supporting evidence.
3. Confidence levels are communicated through structured visual indicators and domain language — not through technical metrics that require AI expertise to interpret.
4. Reviewer actions (accept, modify, reject, escalate) are primary workflow interactions. The product makes it easy to act on recommendations and document reasoning.
5. Recommendation history is retained and accessible. Reviewers can see what the system recommended, what action was taken, and what the outcome was — across engagements.

## 10. Architecture Implications

1. The recommendation object has a defined schema: proposal, evidence references, confidence, alternatives, context, governance boundaries, and feedback records.
2. Recommendations are generated by the intelligence layer and routed through the workflow engine, which applies governance rules and assigns them to appropriate reviewers.
3. Recommendation storage is immutable. Modified recommendations create new versions with references to the prior version, preserving the full history.
4. The recommendation data model supports linking to evidence objects, decision objects, and organizational memory entries.
5. Recommendation generation must support both real-time (inline during workflow execution) and batch (pre-computed during data processing) modes.

## 11. Governance Implications

1. Recommendations carry governance metadata: what domain rules constrained their generation, what evidence thresholds were applied, and what approval paths they follow.
2. Governance configuration defines which recommendation types are generated, for which user roles, at what confidence thresholds, and with what review requirements.
3. Recommendations that fall below a minimum confidence threshold are suppressed rather than surfaced — low-confidence outputs that waste reviewer time erode trust.
4. Recommendation audit trails are maintained for regulatory inspection: what was recommended, when, with what evidence, and what action was taken.
5. Governance rules may require that certain recommendation types (e.g., materiality-related) receive additional review regardless of initial acceptance.

## 12. AI / Intelligence Implications

1. Recommendations are the primary output type of the intelligence layer. All other intelligence outputs (risk signals, operational signals) feed into recommendation generation.
2. The intelligence layer must produce structured recommendations — not unstructured text — that conform to the recommendation schema and integrate into the workflow engine.
3. Recommendation generation must be explainable. When a reviewer asks "why was this recommended?", the system provides the evidence chain, the pattern detected, and the reasoning.
4. The intelligence layer does not optimize for recommendation acceptance rate. It optimizes for recommendation quality — the correlation between recommendation confidence and reviewer agreement.
5. When a recommendation is modified or rejected, the feedback is incorporated into model improvement. Rejections are as valuable as acceptances for learning.

## 13. UX Implications

1. Recommendations appear inline within workflow steps. The reviewer sees the recommendation, the evidence, and the action options without navigating to a separate view.
2. Acceptance is not a rubber stamp. The interface prompts the reviewer to confirm their understanding of the recommendation and its evidence basis.
3. Modification is supported with structured input — the reviewer indicates what they changed and why, using domain-relevant categories, not free-text notes alone.
4. Rejection requires a reason. The interface captures rejection reasoning in a structured format that feeds back to the intelligence layer.
5. Recommendation history is accessible from any point in the workflow, allowing reviewers to see past recommendations and how they were resolved.

## 14. Commercial Implications

1. The commercial value of recommendations is measured by decision quality improvement, not by recommendation accuracy metrics. "Reviewers made better decisions with our recommendations" is the value proposition.
2. Pilot engagements must demonstrate that recommendations improve reviewer efficiency, reduce evidence gaps, and increase risk detection — measurable outcomes, not model metrics.
3. Self-hosted deployments generate recommendations locally using domain-specific models. The recommendation capability is not degraded by deployment model — cloud, private, or air-gapped.
4. Recommendation capability deepens over time as organizational memory accumulates, creating compounding value and switching costs.

## 15. Anti-Patterns

1. **Recommendation as decision.** Presenting a recommendation as a final action rather than a proposal requiring human judgment. This blurs the line between assistive intelligence and autonomous decision-making.
2. **Recommendation without evidence.** Surfacing a proposal without linking it to the evidence that supports it. An unsupported recommendation is an assertion, and assertions erode trust.
3. **Recommendation overload.** Generating so many recommendations that reviewers experience fatigue, leading to rubber-stamp acceptance or blanket rejection. Quantity reduces quality.
4. **Recommendation without alternatives.** Presenting a single recommended action without showing the alternatives considered. This removes the professional's ability to evaluate options.
5. **Recommendation rubber-stamping.** Organizational culture or product design that makes accept the default path. Every recommendation must require active professional judgment.
6. **Recommendation without feedback.** Generating recommendations but not capturing reviewer actions as feedback. Without feedback, intelligence cannot improve.

## 16. Examples

**Example 1: Anomaly Recommendation.** The system identifies an unusual journal entry pattern in accounts payable. It generates a recommendation: "Investigate 3 journal entries in AP for potential duplicate payment patterns." The recommendation includes: the specific entries, the anomaly pattern detected, the evidence (source documents, vendor history, prior engagement findings), confidence assessment (moderate — pattern consistent with duplication but could be legitimate timing difference), and alternatives (flag for sampling, flag for full confirmation, flag as immaterial observation). The reviewer accepts the recommendation with a note: "Confirmed — two are duplicates, one is a timing difference." The acceptance and reasoning are recorded in the decision object and fed back to the intelligence layer.

**Example 2: Sampling Methodology Recommendation.** During engagement planning, the system recommends a sampling approach based on the client's risk profile, account composition, and prior year findings. The recommendation includes: the risk assessment, the account data analysis, the proposed sample size and selection method, and alternatives (different confidence levels, different risk tolerances). The engagement manager modifies the sample size based on professional judgment and documents the reasoning. The modification becomes part of the engagement decision record.

**Example 3: Materiality Threshold Recommendation.** The system recommends a materiality range based on regulatory benchmarks, client financial data, and industry norms. The recommendation shows: the financial data used, the benchmarks applied, the calculated range, and alternatives (different base measures, different percentages, qualitative adjustments). The partner selects a threshold within the range, adjusts for qualitative risk factors, and documents the reasoning. The system applies the threshold consistently throughout the engagement.

## 17. Enterprise Impact

1. **Reviewer productivity**: Recommendations pre-process evidence and pattern detection, allowing reviewers to focus on professional judgment rather than data sorting.
2. **Decision quality**: Recommendations present structured, evidence-backed proposals that improve the quality of professional judgment — not replace it.
3. **Evidence completeness**: Recommendations identify evidence gaps and suggest what evidence is needed, reducing the risk of incomplete audit documentation.
4. **Institutional learning**: Recommendation feedback creates a growing dataset of professional decisions that improves future recommendations and preserves organizational memory.
5. **Regulatory defensibility**: Every recommendation, its evidence basis, and the reviewer's action are documented in auditable form.

## 18. Long-Term Strategic Importance

Recommendations are the connective tissue between intelligence and decisions. They translate analytical capability into professional utility. If AQLIYA gets recommendations right — structured, evidence-backed, governed, assistive — it creates a defensible position in enterprise workflows that generic AI tools cannot replicate because they lack the governance infrastructure, domain depth, and human-in-the-loop design.

Long-term, recommendation quality compounds through organizational memory. As the system accumulates reviewer feedback, its recommendations become more relevant, more evidence-specific, and more aligned with professional norms. This creates a network effect within each firm: more engagements improve recommendations, which improve reviewer productivity, which attracts more engagements.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 17.01 | Intelligence | Intelligence produces recommendations |
| 17.02 | Decision | Decisions are informed by recommendations |
| 17.05 | Evidence | Evidence backs every recommendation |
| 17.15 | Explainability | Recommendations must be explainable |
| 10.04 | AI Assistance Theory | Recommendations operate as AI-assisted inputs |
| 15.11 | AI Recommendation Boundary | Professional and ethical boundaries on recommendations |
| 02.07 | Recommendation-To-Decision Model | Model connecting recommendations to decisions |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial draft |
| 0.2 | 2026-05-08 | Final Editor | Promoted to Reviewed v0.2. Doctrinal anchors confirmed: evidence-backed, AI-assistive (not autonomous), governance-enforced. Cross-references verified. |