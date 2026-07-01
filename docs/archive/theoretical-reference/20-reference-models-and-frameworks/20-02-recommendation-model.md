---
title: Recommendation Model
document_id: 20.02
status: Reviewed v0.2
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: High
depth_level: Level 3 - Model / Framework
related_documents: 20.01, 20.04, 20.11, 02.07, 17.01, 17.05
---

# Recommendation Model

## 1. Purpose

This document defines the canonical Recommendation Model — the structural specification for how AQLIYA generates, presents, evaluates, and tracks AI-generated and human-authored recommendations within governed workflows. The Recommendation Model is the interface between the AI intelligence layer and the human decision-maker. It governs how intelligence outputs are formulated, how they are presented with evidence, how they are accepted or overridden, and how the feedback from human judgment flows back into the system. A recommendation is not a prediction. It is a structured, evidence-backed, confidence-qualified suggestion presented to an accountable human for review and decision.

## 2. Thesis

Recommendations in AQLIYA are not raw AI outputs presented to a user. They are structured enterprise objects with identity, provenance, evidence traces, confidence qualifications, and lifecycle states. A recommendation exists within a workflow context, is tied to a specific decision point, and is subject to governance rules. It carries three non-negotiable properties: it is evidence-backed (no recommendation without supporting evidence), it is confidence-qualified (the system communicates how strong the recommendation is and why), and it is human-resolvable (every recommendation is presented to a human who can accept, modify, or reject it). The Recommendation Model ensures that AI intelligence serves professional judgment, never overrides it.

## 3. Problem

In current enterprise systems, the gap between intelligence and action is unmanaged. AI models produce outputs — anomaly scores, classifications, predictions — but these outputs are disconnected from the decision context. They lack provenance (why was this recommended?), they lack evidence traces (what data supports this?), and they lack feedback mechanisms (what happened after the human acted on this?). 

In audit specifically, recommendations carry professional liability. A recommendation to classify a transaction as a material misstatement must be backed by evidence, must be explainable to a partner or regulator, and must be traceable to the data that generated it. Current tools either present black-box AI outputs that reviewers cannot trust or provide no intelligence at all, leaving reviewers to manually scan for what AI should surface.

## 4. Why Existing Systems Fail

**Rule-based alert systems** flag conditions but do not recommend actions. They tell you something is unusual but not what to do about it, what evidence supports the alert, or how confident the system is.

**ML scoring models** output numbers without context. A risk score of 0.84 tells you nothing about what evidence drives it, what the system is comparing it to, or what action the reviewer should take.

**AI chatbots** generate fluent text that sounds authoritative but cannot provide evidence traces, confidence qualifications, or governance context. Their outputs are unstructured, unverifiable, and unsuitable for regulated environments.

**Expert systems** encode rules but lack adaptability. They cannot learn from reviewer feedback, cannot adjust confidence based on new evidence, and cannot operate in novel situations outside their rule base.

**Dashboard annotations** annotate data visualizations but do not connect to workflows, governance, or outcomes. They are observations, not recommendations.

The common failure: intelligence outputs are treated as endpoints rather than inputs to a governed decision process. AQLIYA treats recommendations as structured, governable, traceable intermediaries between intelligence and decision.

## 5. AQLIYA Philosophy

The Recommendation Model embodies the AQLIYA principle that AI assists and humans decide. A recommendation is the mechanism through which AI intelligence interacts with human judgment. Three philosophical commitments govern this model:

**Intelligence is earned, not assumed.** Recommendations start at a low confidence level and earn trust through demonstrated accuracy over time. Reviewer feedback — acceptances, modifications, rejections — is the trust signal.

**Explainability before autonomy.** Every recommendation must be explainable to a professional reviewer. The system must answer: what evidence supports this? What logic produced it? What alternatives were considered? What is the confidence level and why?

**Human ownership of outcomes.** The human reviewer owns the decision that results from a recommendation. The system's role is to present the best available evidence and analysis; the reviewer's role is to exercise professional judgment. The model preserves this boundary explicitly.

## 6. Core Principles

1. **Recommendations are structured objects.** A recommendation has identity, type, source, evidence bundle, confidence level, explanation, lifecycle state, and resolution. It is not freeform text.

2. **Every recommendation requires an evidence trace.** A recommendation without evidence provenance is invalid. The evidence trace connects the recommendation to the underlying data, documents, and patterns that generated it.

3. **Confidence is qualified, not just quantified.** Confidence is expressed in domain-meaningful dimensions — evidence strength, pattern consistency, anomaly severity, materiality implication — not just a numerical probability.

4. **Recommendations are resolvable.** Every recommendation reaches a resolution: accepted, modified, rejected, or deferred. Unresolved recommendations are governance exceptions that require attention.

5. **Overrides are feedback, not failures.** When a reviewer rejects or modifies a recommendation, it is not an error — it is a training signal. Override data improves the recommendation models over time.

6. **Recommendations are contextual.** A recommendation is generated within a specific workflow, engagement, entity, and governance context. It is not a standalone output detached from its operational setting.

7. **Recommendations are versioned.** If evidence changes, context evolves, or the reviewer requests an updated analysis, the recommendation is versioned rather than overwritten. The full recommendation history is preserved.

8. **Recommendation types are governed.** Different recommendation types carry different evidence thresholds, confidence requirements, and approval rules. A low-risk classification recommendation and a material misstatement recommendation are not held to the same standard.

## 7. Key Concepts

- **Recommendation Object:** The canonical data entity. Fields: recommendation_id, type, source_model, context_ref, evidence_bundle, confidence, explanation, state, resolution, reviewer, resolution_timestamp, decision_ref.

- **Recommendation Type:** A taxonomy that classifies recommendations by domain and action. Types include: anomaly_flag, finding_candidate, risk_assessment, evidence_gap_alert, classification_suggestion, materiality_flag.

- **Evidence Trace:** The chain of evidence objects that support a recommendation. Each trace links to specific data, documents, or patterns that the AI model used to generate the recommendation.

- **Confidence Qualification:** A structured assessment of recommendation certainty. Includes: evidence strength (sparse, moderate, strong), pattern consistency (isolated, recurring, systematic), and domain applicability (narrow, contextual, broad).

- **Recommendation Lifecycle:** The state machine: Generated → Presented → Under Review → Resolved (Accepted / Modified / Rejected / Deferred). Each transition is an event with an actor and timestamp.

- **Override:** A resolution where the reviewer rejects or modifies the recommendation. Overrides are preserved with the reviewer's justification and routed back to model improvement.

- **Recommendation Context:** The workflow, engagement, entity, and governance environment in which a recommendation was generated. Context determines which evidence, rules, and thresholds apply.

- **Recommendation Explanation:** A structured, human-readable summary of why the recommendation was generated, what evidence supports it, what alternatives were evaluated, and what the confidence assessment means.

- **Feedback Signal:** The data produced when a human resolves a recommendation — accepted (positive signal), modified (partial signal with correction data), rejected (negative signal with reason). This is the primary mechanism for model improvement.

## 8. Operational Implications

1. Implementation teams must define recommendation types specific to each engagement context before deploying workflows. Not all recommendation types apply to all engagements.

2. Recommendation confidence thresholds must be calibrated per domain. In audit, a recommendation about material misstatement requires higher evidence thresholds than a recommendation about documentation completeness.

3. Customer success teams must train reviewers on how to interact with recommendations: when to trust, when to override, and why overrides improve the system.

4. Quality teams must monitor recommendation resolution rates, override rates, and override reasons as system health metrics. High override rates for a specific recommendation type indicate model calibration issues.

5. The team must maintain a recommendation type registry that catalogs all supported types, their evidence requirements, confidence thresholds, and governance profiles.

## 9. Product Implications

1. The recommendation interface must present three things simultaneously: the recommendation itself, the evidence that supports it, and the confidence qualification. The reviewer should never need to ask "why is this recommended?"

2. Override workflows must be as smooth as acceptance workflows. Friction in override creates pressure to accept bad recommendations, which undermines both decision quality and model improvement.

3. The product must surface override history to reviewers making similar decisions. "In the last 20 similar cases, reviewers modified this recommendation 15 times" is actionable context.

4. Recommendations must be actionable — each recommendation must suggest a specific action, not just flag a condition. "This journal entry appears anomalous" is a flag. "Consider reclassifying this entry based on the following evidence" is a recommendation.

5. Recommendation batching must group related recommendations for efficient review. A reviewer reviewing 50 anomalies in a single engagement should see them organized by risk area, account group, or entity.

6. The product must support recommendation persistence across sessions. A deferred recommendation must be resurfaced when the reviewer returns to the relevant workflow context.

## 10. Architecture Implications

1. Recommendation generation is a service that consumes workflow context, evidence, and governance rules, and produces a structured recommendation object. This service is event-driven: it activates when a decision point is reached in a workflow.

2. The recommendation store is append-only. Recommendations are never overwritten. New evidence or updated models produce new recommendation versions linked to the original.

3. Evidence references in a recommendation are foreign keys to the Evidence Model (20.04). Evidence integrity is maintained by the Evidence Model; the Recommendation Model references it.

4. Confidence scoring is computed by the Confidence Model (20.11) and attached to the recommendation at generation time. Confidence is recalculated when evidence changes.

5. Override and resolution data is emitted as feedback signals to the AI intelligence layer. This data is the primary training and calibration signal for recommendation models.

6. Recommendation queries must support contextual filtering: "show me all unresolved recommendations for this engagement," "show me recommendations about this entity in the last quarter," "show me recommendations I overrode last month."

7. The architecture must support recommendation generation in both cloud and edge deployments. In air-gapped environments, recommendations are generated locally by models deployed at the edge.

## 11. Governance Implications

1. Every recommendation type has a governance profile that specifies: minimum evidence threshold, minimum confidence threshold, required reviewer qualifications, and escalation conditions.

2. The system must prevent recommendations from being resolved by unqualified reviewers. A material misstatement recommendation requires a reviewer with the appropriate professional authority.

3. Override patterns are governance events. Systematic overrides of a specific recommendation type by specific reviewers may indicate either model deficiencies or reviewer behavior that warrants quality review.

4. Recommendation explanations must be audit-grade. A regulator inspecting a decision must be able to trace the recommendation that preceded it, the evidence that supported the recommendation, the confidence qualification, and the reviewer's resolution.

5. Recommendations generated in one engagement context must not be assumed to apply in another. Cross-engagement patterns are surfaced as risk signals, not as direct recommendations, to prevent context-inappropriate recommendations.

## 12. AI / Intelligence Implications

1. Recommendation models are domain-specific. Audit recommendations, financial reporting recommendations, and compliance recommendations use different models, different training data, and different evidence patterns.

2. The intelligence layer must produce structured recommendation objects, not unstructured text. The output format is dictated by the Recommendation Model, not by the model's default generation format.

3. Every recommendation must include an explanation module that produces a human-readable rationale. The explanation must reference specific evidence, describe the pattern detected, and articulate why the recommended action is appropriate.

4. Confidence calibration is continuous. The system monitors prediction-outcome alignment and adjusts confidence scoring to reduce systematic over- or under-confidence.

5. Model improvement is driven by feedback signals, not by retraining on all data. Override data, outcome data, and reviewer annotations are the highest-value training signals.

6. Cold-start recommendations (in new engagement types or new client domains with limited data) are explicitly labeled as low-confidence. The system does not pretend certainty where it has none.

7. The recommendation layer must produce alternative hypotheses when evidence is ambiguous. Presenting a single recommendation when multiple interpretations are equally supported is a disservice to reviewer judgment.

## 13. UX Implications

1. The recommendation card must be compact, scannable, and actionable. At minimum: recommendation text, confidence level, evidence count, and resolution actions (accept, modify, reject, defer).

2. Evidence must be expandable from the recommendation card without navigating away. The reviewer sees the recommendation, clicks to inspect evidence, and resolves — all in a single workflow context.

3. Confidence must be visualized in a way that is immediately interpretable by domain professionals. Three evidence markers, a pattern strength indicator, and a textual confidence summary are more useful than a probability percentage.

4. Override must require a reason. The reason selector provides common override categories (insufficient evidence, contrary evidence, professional judgment, context not captured) plus a free-text option.

5. Recommendation history must be accessible from any decision point. "What recommendations were generated for this entity?" and "What did reviewers decide about similar patterns?" must be one-query operations.

6. Keyboard-first interaction for high-volume reviewers: tab through recommendations, one-key accept/modify/reject/defer, one-key expand evidence.

## 14. Commercial Implications

1. The Recommendation Model is a primary source of measurable value. Pilots demonstrate value through: number of relevant recommendations generated, reduction in missed anomalies, and time saved per review cycle.

2. Proof-of-value metrics are recommendation-centric: recommendation accuracy rate, reviewer acceptance rate, override pattern analysis, and time-to-resolution improvement.

3. The commercial narrative shifts from "AI that automates your work" to "intelligence that augments your judgment." This distinction is critical in regulated markets where autonomous AI is a liability, not a feature.

4. Enterprise buyers assess recommendation quality before deployment. The model must support shadow-mode operation: generating recommendations for comparison against existing manual processes without replacing them, until trust is established.

5. Recommendation intelligence deepens over time. Customers who use the system longer receive more accurate, more calibrated, and more contextually relevant recommendations. This creates a retention moat.

## 15. Anti-Patterns

1. **Black-Box Recommendation.** Generating recommendations without evidence traces, confidence qualifications, or explanations. This forces reviewers to trust or reject blind, undermining both decision quality and model improvement.

2. **Recommendation Fatigue.** Surfacing too many low-value recommendations that overwhelm the reviewer. Quantity without quality trains reviewers to ignore the system entirely.

3. **Override Blindness.** Failing to capture, analyze, and learn from override data. Overrides are the most valuable feedback signal; treating them as noise wastes the primary mechanism for model improvement.

4. **Autonomous Recommendation Execution.** Allowing recommendations to be auto-accepted and auto-executed without human review. This violates the fundamental principle that AI assists and humans decide.

5. **Context-Free Recommendation.** Generating recommendations without engagement context, entity context, or governance context. A recommendation that ignores materiality thresholds, engagement type, or regulatory jurisdiction is worse than no recommendation.

6. **Confidence Inflation.** Systematically overstating confidence levels to appear more capable than the evidence supports. This erodes reviewer trust when outcomes do not match confidence claims.

7. **One-Size-Confidence.** Using a single numeric confidence score without domain-specific qualification. A "0.78 confidence" means nothing to an auditor. "Three independent evidence points and a recurring pattern across two fiscal years" is meaningful.

## 16. Examples

**Example 1: Audit Anomaly Recommendation.** The system analyzes a client's journal entries and identifies an unusual revenue recognition pattern in Q4. A recommendation is generated with type `anomaly_flag`. The recommendation reads: "Consider reviewing the following journal entries for potential revenue recognition irregularity. Three entries posted to account 4200 in the last week of December exceed the materiality threshold by 15%. The pattern is consistent with channel stuffing observed in prior engagements." The evidence trace links to the specific journal entries, the materiality calculation, and pattern data from prior engagements. Confidence is qualified: evidence strength = strong (three independent entries), pattern consistency = recurring (observed in similar form in prior periods), domain applicability = contextual (specific to this entity's industry). The reviewer accepts the recommendation, inspects the entries, and approves a finding.

**Example 2: Evidence Gap Recommendation.** During an audit engagement, the system identifies that accounts receivable confirmations are missing for three material balances. A recommendation is generated with type `evidence_gap_alert`. The recommendation reads: "Three accounts receivable balances totaling SAR 4.2M lack supporting confirmation evidence. Current evidence sufficiency is 72% against the engagement threshold of 90%." The evidence trace shows the entity balances, the confirmation status, and the engagement evidence threshold. The reviewer defers the recommendation, requests confirmations from the client, and the system tracks the evidence gap until resolved.

**Example 3: Classification Override Learning.** The system recommends reclassifying a lease-related expense. The reviewer overrides with the reason "Operating lease treatment consistent with IFRS 16 policy election." The override, along with the reason and the reviewer's credentials, is captured as a feedback signal. In future engagements, the system adjusts its classification model for similar lease structures. After 12 similar overrides with consistent reasoning, the model updates its recommendation pattern, and override rates for this classification type decrease by 78%.

## 17. Enterprise Impact

1. **Reviewer Productivity.** Structured recommendations reduce the time reviewers spend searching for anomalies and compiling evidence. The intelligence layer surfaces what matters; the reviewer exercises judgment.

2. **Decision Quality.** Evidence-backed, confidence-qualified recommendations provide reviewers with better information than they could assemble manually in the same time, improving the quality of their professional judgment.

3. **Consistency.** The recommendation layer applies the same evidence patterns and risk signals across all reviewers and engagements, reducing the variability that comes from individual experience and attention.

4. **Model Improvement.** Systematic feedback from overrides and outcomes creates a continuous improvement loop. The recommendation system becomes more accurate over time, increasing its value to the organization.

5. **Auditability.** Every recommendation, its evidence trace, its confidence qualification, and its resolution are preserved. Regulators can inspect not just the decision but the intelligence that informed it.

6. **Knowledge Transfer.** Recommendation patterns encode institutional knowledge about what constitutes risk, what evidence matters, and what professional judgment looks like. New reviewers benefit from accumulated patterns before building their own experience.

## 18. Long-Term Strategic Importance

The Recommendation Model is the primary interface between AQLIYA's intelligence layer and the human professional. It is the mechanism through which AI earns trust: by being evidence-backed, confidence-qualified, and transparently explainable. If recommendations are poor, reviewers distrust the system and stop using it. If they are good, reviewers rely on them as a professional tool and the system becomes embedded in daily practice.

The long-term competitive advantage lies in recommendation quality and depth. Generic AI can produce plausible text; only domain-specific models trained on audit, financial, and governance evidence patterns can produce recommendations that meet professional standards. This depth is the moat.

Over time, the Recommendation Model expands from audit-specific recommendations to financial reporting recommendations, compliance recommendations, and strategic risk recommendations. Each expansion deepens the decision intelligence category. Each new domain generates new feedback signals that improve the models across all domains.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 20.01 | Decision Model | Recommendations are inputs to the decision lifecycle |
| 20.04 | Evidence Model | Evidence traces are mandatory for every recommendation |
| 20.11 | Confidence Model | Confidence qualifies recommendation strength |
| 02.07 | Recommendation-to-Decision Model | Theoretical flow from recommendation to decision |
| 17.01 | Intelligence | Foundational definition of intelligence in AQLIYA context |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial reference model specification |
| 0.2 | 2026-05-08 | Final Editor | Promoted to Reviewed v0.2. Doctrinal anchors confirmed: evidence traces mandatory, AI assists/humans decide, explainability requirement. Added 17.05 (Evidence) cross-reference. |