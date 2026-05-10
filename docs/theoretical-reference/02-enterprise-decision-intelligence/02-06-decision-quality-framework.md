---
title: Decision Quality Framework
document_id: 02.06
status: Reviewed
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 3 - Model / Framework
related_documents: 02.01, 02.05, 02.08, 02.09, 17.04, 20.01
---

# Decision Quality Framework

## 1. Purpose

This document defines the Decision Quality Framework — the model for measuring, evaluating, and improving decision quality within Enterprise Decision Intelligence. It establishes what decision quality means, how it is measured, how it relates to traceability and confidence, and how organizations use it to improve their decision processes over time.

Decision quality is the central metric of EDI. Everything the platform does — evidence management, governance enforcement, intelligence augmentation, traceability, learning — is in service of improving decision quality. Without a quality framework, the platform lacks a definition of success.

## 2. Thesis

**Decision quality is a composite measure of evidence completeness, traceability depth, governance compliance, outcome alignment, and learning capture.**

Quality is not a subjective judgment about whether a decision was "good" or "bad." It is an objective, measurable property of the decision lifecycle. A high-quality decision is one that is evidence-backed, traceable, governance-compliant, outcome-aware, and learnable. A low-quality decision is one that is implicit, undocumented, ungoverned, and disconnected from outcomes.

The framework applies at three levels: individual decision quality, engagement-level decision quality, and organizational decision quality. Each level feeds the next.

## 3. Problem

Organizations lack a definition of decision quality:

- **No quality standard.** There is no accepted framework for measuring whether a decision was well-made, independent of whether the outcome was favorable. A good outcome can follow a poor decision process. A bad outcome can follow an excellent one. Without a quality framework, organizations evaluate decisions by results alone — the most misleading measure.
- **Confusion with data quality.** Organizations measure data quality, model accuracy, and process efficiency. These are inputs to decisions. They are not decision quality.
- **Confusion with user satisfaction.** Product teams measure NPS, feature adoption, and user sentiment as proxies for quality. These measure user experience, not decision quality.
- **Confusion with speed.** Faster decisions are not better decisions. Speed without evidence and governance is recklessness.
- **No learning signal.** Without a quality framework, organizations cannot identify patterns of good and poor decision-making. Every decision is a one-off, not part of a learnable system.

## 4. Why Existing Systems Fail

| Category | What It Measures | Quality Gap |
|---|---|---|
| **Business Intelligence** | Data accuracy, query performance, dashboard usage | Does not measure decision quality. Shows metrics, not whether decisions using those metrics were sound. |
| **AI / ML Platforms** | Model accuracy, precision, recall, F1 score | Measures intelligence quality, not decision quality. A highly accurate model can produce poor decisions if humans override or ignore it. |
| **Workflow Systems** | Process completion rate, cycle time, throughput | Measures process efficiency, not decision quality. A decision can be fast, compliant with workflow, and still be poor. |
| **Compliance Platforms** | Policy violation rate, audit findings, remediation time | Measures governance adherence, not decision quality. Compliance does not equal quality. |
| **Survey / Feedback Tools** | User satisfaction, NPS | Measures subjective perception, not structural quality. Users can be satisfied with poor decisions. |
| **ERP Systems** | Transaction accuracy, reconciliation status | Measures operational accuracy, not decision quality. An accurate transaction does not mean it was a good decision to make it. |

**The common failure pattern:** every existing category measures something related to decisions — data, intelligence, process, compliance, satisfaction — but none measures decision quality itself. The framework fills this gap.

## 5. AQLIYA Philosophy

**Decision quality is structural, not subjective.** It is not about whether the decision was "right" in hindsight. It is about whether the decision process met standards of evidence, governance, and learnability at the time it was made.

**Quality is measured at the lifecycle level.** The decision lifecycle — evidence, recommendation, review, approval, action, outcome, learning — defines the dimensions of quality. Each dimension is measured by the system as part of normal operation.

**Quality is independent of outcome.** A decision can be high-quality and produce a bad outcome (the evidence was sound, the reasoning was correct, but unforeseeable factors intervened). A decision can be low-quality and produce a good outcome (lucky guess). The framework distinguishes process quality from outcome quality.

**Quality improves through measurement.** What is measured is managed. The framework provides the measurement. The platform provides the feedback loop. Organizations improve decision quality by systematically measuring it and acting on the patterns.

**Quality is a differentiator.** Enterprises that can demonstrate decision quality — to regulators, clients, and internal stakeholders — have a structural advantage over those that cannot.

## 6. Core Principles

1. **Decision quality is multidimensional.** Evidence completeness, traceability depth, governance compliance, outcome alignment, and learning capture are separate but related dimensions. A decision may score well on some and poorly on others.

2. **Quality is measured at the lifecycle stage level.** Each stage of the decision lifecycle has its own quality criteria. Evidence quality is measured differently from recommendation quality or review quality.

3. **Quality is context-dependent.** The quality criteria for a high-risk, high-materiality decision differ from those for a low-risk, routine decision. The framework supports configurable quality thresholds per decision type.

4. **Quality is measurable automatically.** The system measures quality dimensions as a byproduct of lifecycle execution. No manual quality scoring is required.

5. **Quality trends matter more than absolute scores.** The framework emphasizes quality trajectories — is an organization, team, or domain improving over time? — over point-in-time scores.

6. **Quality drives learning.** Quality gaps are learning opportunities. The framework connects quality measurement to the learning loop.

## 7. Key Concepts

- **Decision Quality Score (DQS):** A composite score (0-100) calculated from weighted dimension scores. The DQS is the top-line quality metric for a decision, engagement, or organization.

- **Evidence Completeness:** The degree to which all required evidence for a decision type has been gathered, verified, and referenced in the decision trace. Measured by coverage against the evidence standard.

- **Traceability Depth:** The number of lifecycle stages with complete, verifiable trace entries. Maximum depth is full lifecycle coverage.

- **Governance Compliance Rate:** The proportion of governance rules that were satisfied at each decision point. Measured automatically by the decision engine against configured governance policies.

- **Outcome Alignment:** The correlation between the decision's expected outcome (as stated at decision time) and the actual outcome. Measures decision calibration, not luck.

- **Learning Capture Rate:** Whether lessons from a decision — outcome data, pattern signals, reasoning insights — were captured in the learning loop for future use.

- **Quality Dimension Weight:** A configurable value that determines the contribution of each dimension to the composite DQS. Weights vary by decision type, domain, and risk level.

## 8. Operational Implications

1. Every customer engagement defines quality dimension weights for each decision type during onboarding. An audit findings decision has different quality priorities than a financial approval decision.
2. Quality scores are reported in customer success reviews. The conversation is: "your decision quality score improved 12 points this quarter. Here is the evidence quality dimension that drove the improvement."
3. Implementation teams configure quality thresholds for automated governance actions. Decisions that fall below a quality threshold may be routed for additional review.
4. Professional services include quality framework configuration and quality baseline measurement in every deployment.
5. Support teams use quality scores to triage issues. A sudden drop in governance compliance rate may indicate a misconfigured governance rule rather than a user behavior problem.
6. Training programs cover quality dimensions and how users can improve their quality scores through better evidence practices and governance adherence.

## 9. Product Implications

1. Every decision object displays a Decision Quality Score visible to authorized users — reviewers, managers, quality assurance teams.
2. Dimension breakdowns are interactive: users expand the composite score to see evidence completeness, traceability depth, governance compliance, and learning capture as separate metrics.
3. Quality trends are visualized over time — by individual, team, engagement, domain, and organization.
4. Quality alerts fire when a decision type consistently scores below threshold. The system surfaces these alerts to governance administrators.
5. Quality comparison views allow benchmarking across teams, offices, and engagement types.
6. Quality improvement recommendations are generated by the intelligence layer: "evidence completeness for revenue recognition decisions is 23% below the organization average. Recommended action: update evidence standard for this decision type."
7. Quality dashboards are configurable per role. Reviewers see their personal quality trends. Managers see team-level quality. Governance sees organization-wide quality patterns.

## 10. Architecture Implications

1. Quality scores are calculated by the decision engine at lifecycle completion, using configurable dimension weights and thresholds per decision type.
2. The quality calculation engine is a separate module within the decision engine, processing quality scores asynchronously to avoid impacting lifecycle execution performance.
3. Quality data is stored in a time-series data store optimized for trend analysis and aggregation across multiple dimensions.
4. Quality baselines are computed per decision type, per domain, per tenant, and per organizational unit. Baselines update as new decision data accumulates.
5. Dimension weights and thresholds are governance-controlled configuration objects, versioned and auditable.
6. Quality score recalculation is triggered by lifecycle stage transitions — evidence upload, recommendation generation, review action, outcome capture.
7. The quality engine supports what-if analysis: "what would the quality score be if evidence completeness improved from 60% to 80%?"
8. Quality trend computation queries are optimized for dashboard performance, using pre-aggregated materialized views for common time ranges and dimensions.

## 11. Governance Implications

1. Quality thresholds are governance parameters. A decision type may require a minimum quality score to proceed to the next lifecycle stage.
2. Governance rules can reference quality dimensions independently. "Revenue recognition decisions require evidence completeness of at least 80% before review."
3. Quality score changes are governed events. A material change to dimension weights or thresholds requires approval through the governance workflow.
4. Quality data access is governed. Who can see whose quality scores is determined by role and organizational hierarchy governance rules.
5. Quality baselines are subject to governance retention policies. Historical quality data must be retained for regulatory periods and purged according to policy.
6. Multi-jurisdictional quality configuration is supported. Different jurisdictions may require different quality dimensions or thresholds.

## 12. AI / Intelligence Implications

1. The intelligence layer produces quality predictions — estimated quality scores for decisions in progress, based on evidence gathered so far and historical patterns.
2. Quality-based recommendations are generated: "this decision has a low estimated quality score. Consider gathering additional evidence before proceeding to review."
3. The intelligence layer learns quality patterns across decisions — which evidence combinations correlate with high-quality outcomes, which governance configurations reduce quality gaps.
4. Quality score trends are intelligence inputs. A declining quality trend in a specific domain triggers an intelligence-driven investigation recommendation.
5. AI-generated recommendations include estimated quality impact — "adopting this recommendation is estimated to improve your evidence completeness by 15%."
6. The intelligence layer never overrides quality thresholds. If a decision does not meet quality standards, the intelligence layer cannot force it through.

## 13. UX Implications

1. Quality scores are displayed as a prominent, color-coded indicator on every decision object. Green (high), yellow (moderate), red (low).
2. Dimension breakdowns are accessible as an expandable section — users see which dimensions are driving the score up or down.
3. Quality improvement suggestions appear contextually when quality scores are below threshold.
4. Trend charts show quality trajectories over configurable time periods with annotation for significant events (process changes, team changes, policy updates).
5. Quality comparison views support peer benchmarking while respecting access control — users see anonymized or aggregated comparison data.
6. Quality alerts and notifications are actionable — clicking an alert navigates to the decision or decision type with quality issues.
7. The quality view is available on mobile with the same dimensions and trends, optimized for smaller screens.

## 14. Commercial Implications

1. Decision quality improvement is the primary value proposition. The commercial narrative is: "your organization's decision quality score is X. Here is how we improve it to Y within 12 months."
2. Quality benchmarks across customers become an asset. Anonymized, aggregated quality benchmarks let customers compare their decision quality against industry peers.
3. Proof-of-concept engagements measure quality baselines before and after platform deployment. The quality delta is the commercial proof point.
4. Quality-based pricing is a future option: pricing tiers aligned with quality score targets or quality dimension coverage.
5. Quality reporting is a retention and expansion tool. Customers who see measurable quality improvement are less likely to churn and more likely to expand to new decision types.

## 15. Anti-Patterns

1. **Quality as User Satisfaction.** Using NPS, CSAT, or user sentiment scores as proxies for decision quality. User satisfaction measures user experience, not whether decisions are evidence-backed and governance-compliant. A user can be satisfied with a poorly governed decision process.

2. **Quality as Outcome.** Evaluating decision quality by whether the outcome was favorable. A high-quality decision can produce a bad outcome. Outcome-based quality evaluation penalizes good process and rewards lucky guesses.

3. **Quality as Speed.** Measuring how fast decisions are made and calling it quality. Speed without evidence completeness and governance compliance is not quality — it is velocity without accountability.

4. **Quality as Data Quality.** Equating data accuracy or completeness with decision quality. Clean data is a necessary condition for quality decisions but not sufficient. A decision using perfect data can still be poorly reasoned or governed.

5. **Single-Dimensional Quality.** Scoring decisions on a single quality axis (e.g., "governance compliance"). A decision can be fully governance-compliant and still be low quality because it lacked evidence or learning capture.

6. **Static Quality Thresholds.** Using the same quality thresholds for all decision types regardless of risk or materiality. This either overburdens low-risk decisions or underprotects high-risk ones.

7. **Quality Without Action.** Measuring quality scores without connecting them to improvement mechanisms. A quality score that nobody acts on is a vanity metric.

8. **Comparing Quality Across Domains.** Comparing quality scores between fundamentally different decision types (audit findings vs. financial approvals) without contextualizing by domain-specific weights and thresholds.

## 16. Examples

**Example 1: Quality Baseline Measurement.** An audit firm deploys the Decision Quality Framework across 10 pilot engagements. The quality engine measures their baseline: evidence completeness averages 55% (evidence missing for 45% of decisions), traceability depth averages 4 of 8 lifecycle stages, governance compliance is 78%, and learning capture is near zero — no outcome data is being captured. The firm establishes a quality improvement program targeting evidence completeness and learning capture. After six months, evidence completeness has improved to 78%, learning capture is at 45%, and the composite DQS has increased from 52 to 71.

**Example 2: Quality-Driven Intervention.** A financial intelligence deployment shows a declining quality trend for high-materiality journal entry approvals. The governance compliance dimension has dropped 15 points. The quality engine alerts the governance administrator. Investigation reveals that a governance rule was changed two weeks prior, inadvertently lowering the evidence standard for high-materiality entries. The rule is corrected, and the dimension returns to baseline within one week. The quality trend caught a governance error that would have persisted undetected without measurement.

**Example 3: Cross-Organizational Quality Benchmarking.** Multiple audit firms using the platform participate in an anonymized quality benchmark. The benchmark reveals that firms using structured evidence standards consistently score 20-30 points higher on the evidence completeness dimension than firms using unstructured evidence approaches. This insight drives industry-wide adoption of structured evidence standards, improving decision quality across the sector.

## 17. Enterprise Impact

1. **Measurable improvement.** Organizations can track decision quality improvement over time — by team, domain, engagement, and organization-wide. Quality becomes a managed metric, not an amorphous concept.
2. **Risk identification.** Quality dimension breakdowns identify specific risk areas — a team with low governance compliance, a decision type with poor evidence completeness, an engagement with no learning capture.
3. **Governance confidence.** Regulators, clients, and internal auditors can see quality scores and quality trends as evidence of decision process maturity.
4. **Resource optimization.** Quality data reveals where investment in decision process improvement will have the greatest impact — which dimension, which team, which decision type.
5. **Learning acceleration.** The learning capture dimension creates accountability for capturing decision outcomes and patterns. Over time, this builds the organizational learning library.
6. **Competitive differentiation.** Organizations with high decision quality scores can differentiate themselves in regulated markets. "We can prove our decision quality" is a powerful client assurance message.

## 18. Long-Term Strategic Importance

The Decision Quality Framework is the measurement system for Enterprise Decision Intelligence. Without it, the category has no definition of success. The framework converts decision-making from an implicit, unmeasured activity into a managed, measurable, improvable discipline.

As organizations adopt EDI, the quality framework becomes the common language for evaluating decision processes across domains, teams, and industries. Quality benchmarks become industry standards. Quality improvement becomes a recognized professional discipline, like quality management in manufacturing or software quality assurance in engineering.

AQLIYA's long-term position as category leader depends on the quality framework becoming the accepted standard for decision quality measurement — the way GAAP is the accepted standard for financial reporting or ISO 9000 is the standard for quality management. The framework is not just product instrumentation. It is category infrastructure.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 02.01 | Enterprise Decision Intelligence Theory | Defines the category; quality is the central metric of EDI |
| 02.05 | Decision Traceability Theory | Traceability is a quality dimension; complete traces are prerequisite to quality measurement |
| 02.08 | Decision Confidence Model | Confidence is a related but distinct concept; quality measures lifecycle completeness, confidence measures decision certainty |
| 02.09 | Decision Outcome Tracking | Outcome alignment is a quality dimension; outcome tracking provides the data for outcome alignment measurement |
| 17.04 | Quality | Defined term for the quality concept |
| 20.01 | Decision Model | The decision object schema includes quality score as a computed field |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial definition of Decision Quality Framework |
| 0.2 | 2026-05-08 | Founding Team | Status promoted to Reviewed — frontmatter and metadata update |
