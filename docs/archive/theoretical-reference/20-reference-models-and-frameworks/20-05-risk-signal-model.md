---
title: Risk Signal Model
document_id: 20.05
status: Reviewed v0.2
owner: Founding Team
version: 0.2
last_updated: 2026-05-08
priority: Medium
depth_level: Level 3 - Model / Framework
related_documents: 17.01, 17.05, 17.07, 20.03, 20.04, 20.07, 20.11, 05.09
---

# Risk Signal Model

## 1. Purpose

This document defines the canonical Risk Signal Model — the structural specification for how AQLIYA identifies, generates, qualifies, routes, and resolves risk signals within governed workflows. A risk signal is a structured indication that a condition, pattern, or anomaly warrants professional attention. Risk signals are not findings; they are pre-finding intelligence that surfaces conditions a reviewer should evaluate. They are not decisions; they are inputs to decisions. The Risk Signal Model defines how the system detects risk, how it qualifies the signal, how it surfaces it to the right reviewer at the right time, and how it tracks whether the signal resulted in a finding, a dismissal, or further investigation.

## 2. Thesis

Risk signals in AQLIYA are not alerts on a dashboard. They are structured intelligence objects with provenance, confidence, evidence, escalation rules, and resolution tracking. A risk signal has an identity, a source (what detected it), a context (what engagement, entity, and period it applies to), a confidence qualification (how strong and consistent the signal is), an evidence bundle (what data supports it), and a resolution (what the reviewer decided about it). The Risk Signal Model bridges the gap between raw data analysis and professional judgment: it flags conditions that merit attention, provides the evidence and context the reviewer needs to evaluate them, and tracks whether the reviewer's response corroborated or dismissed the signal.

## 3. Problem

In current audit and governance practice, risk detection is manual and inconsistent. Reviewers rely on their experience to identify what to look at, on checklists to ensure coverage, and on sampling to manage volume. Risk signals — conditions that indicate something may be wrong — are detected by individuals, not by systems. When a reviewer misses a signal, there is no system backup. When two reviewers look at the same data, they may identify different signals because detection depends on individual knowledge, attention, and workload.

Existing risk assessment tools produce risk scores without context. A "high risk" score tells a reviewer that something is wrong but not what, why, or what to do about it. The result is either false alarm fatigue (too many alerts without actionable context) or dangerous silence (signals that should have been surfaced but were not).

## 4. Why Existing Systems Fail

**Risk scoring engines** produce numeric scores without evidence, context, or actionability. They tell you risk is "high" but not what evidence drives the score, what the signal pattern is, or what the reviewer should evaluate.

**Rule-based monitoring systems** detect predefined conditions but cannot adapt to novel patterns. They find what they are programmed to find and miss everything else.

**Anomaly detection tools** identify statistical outliers but cannot distinguish between anomalies that represent business-as-usual variation and anomalies that represent genuine risk. They generate noise.

**Dashboard alerting** floods reviewers with alerts organized by urgency but without the evidence, context, or workflow integration needed to evaluate them. Alerts that require the reviewer to leave the workflow to investigate are alerts that get ignored.

**Spreadsheet-based risk assessment** relies on manual data compilation, subjective scoring, and individual reviewer judgment. It is inconsistent, unscalable, and unauditable.

The common failure: risk signals are either numeric scores without substance or alerts without actionability. AQLIYA produces structured, evidence-backed, confidence-qualified, context-rich signals that integrate into the reviewer's workflow.

## 5. AQLIYA Philosophy

Risk signals are intelligence, not alerts. The purpose of a risk signal is to provide a reviewer with what they need to exercise professional judgment: the condition, the evidence, the context, the confidence, and the recommended action. The reviewer then decides whether the signal warrants a finding, requires further investigation, or can be dismissed.

Risk signals are earned through evidence, not generated through speculation. A risk signal without supporting evidence is not a signal — it is noise. The model enforces evidence requirements: every signal must be backed by data, patterns, or conditions that a professional reviewer can evaluate.

Risk signals are inputs to human judgment, not outputs of automated action. The system surfaces signals; the reviewer evaluates them. The system never automatically escalates a signal to a finding or a decision without human review.

## 6. Core Principles

1. **Risk signals are structured objects.** A risk signal has identity, source, context, evidence, confidence, and resolution tracking. It is not a numeric score or a dashboard alert.

2. **Every signal has evidence.** A risk signal without supporting evidence is invalid. The evidence bundle explains why the signal was generated and gives the reviewer the data needed to evaluate it.

3. **Signals are confidence-qualified.** Confidence is expressed in domain-meaningful dimensions: evidence strength, pattern consistency, historical corroboration, and materiality relevance.

4. **Signals are context-rich.** Every signal carries its engagement context, entity context, period context, and regulatory context. A signal without context is uninterpretable.

5. **Signals are routed, not broadcast.** Signals are directed to the reviewer with the appropriate authority and context, not broadcast to all reviewers. Routing is governed by signal type, risk level, and engagement assignment.

6. **Signals are resolvable.** Every signal reaches a resolution: investigated (resulted in a finding), dismissed (reviewed and determined not to warrant a finding, with documented reason), or deferred (requires further information before evaluation).

7. **Signal resolution is feedback.** How reviewers resolve signals — what they investigate, what they dismiss, what they defer — is the primary training data for improving signal detection quality.

8. **Signals are composable.** Individual signals can be aggregated into composite risk assessments. Multiple weak signals about the same entity or account may constitute a strong composite signal.

9. **Signals cross engagements.** Patterns detected across multiple engagements are surfaced as firm-level risk signals. Organizational risk intelligence emerges from signal aggregation.

## 7. Key Concepts

- **Risk Signal Object:** The canonical data entity. Fields: signal_id, type, source, context_ref, evidence_bundle, confidence, routing, resolution, resolution_reason, reviewer, engagement_ref, entity_ref, period_ref.

- **Signal Type:** A taxonomy of signal categories. Examples: anomaly_detected, threshold_exceeded, pattern_deviation, evidence_gap, cross_engagement_pattern, regulatory_change, materiality_indicator, control_deficiency_indicator.

- **Signal Source:** The mechanism that generated the signal: AI model, rule engine, manual flag, cross-engagement pattern detector, regulatory update. Source transparency enables reviewers to evaluate signal reliability.

- **Signal Confidence:** A structured assessment of signal strength. Dimensions: evidence_strength (sparse, moderate, strong), pattern_consistency (isolated, recurring, systematic), historical_corroboration (first_observed, previously_observed, well_established), materiality_relevance (below_threshold, at_threshold, above_threshold).

- **Signal Routing:** The governance-governed mechanism for directing a signal to the appropriate reviewer. Routing considers: signal type, risk level, engagement assignment, and reviewer authority.

- **Signal Resolution:** The outcome of reviewer evaluation. Resolutions: investigated_resulted_in_finding, dismissed_no_risk, dismissed_business_as_usual, deferred_needs_more_evidence, escalated.

- **Signal Aggregation:** The composition of multiple individual signals into a composite risk assessment when individual signals about the same entity, account, or pattern collectively indicate elevated risk.

- **Cross-Engagement Signal:** A signal generated by pattern detection across multiple engagements, identifying risk conditions that are not visible at the individual engagement level.

- **Signal Lifecycle:** The state machine: Detected → Qualified → Routed → Under Review → Resolved. Each transition is tracked with actor, timestamp, and governance context.

## 8. Operational Implications

1. Signal detection models must be configured per engagement type and risk profile before deployment. What constitutes a relevant signal in a financial services audit differs from a manufacturing audit.

2. Signal routing rules must be defined per governance context: who receives which signal types at which confidence levels. Routing misconfiguration leads to signal fatigue or missed signals.

3. Signal resolution tracking must be enforced by governance. Every signal must be resolved within a defined timeframe. Unresolved signals are governance exceptions.

4. Cross-engagement signal aggregation requires firm-level data sharing policies. What signal data crosses engagement boundaries and under what governance must be defined.

5. Operations must monitor signal quality metrics: detection rate, false positive rate, time to resolution, and resolution pattern distribution.

## 9. Product Implications

1. Signal surfacing must be integrated into the reviewer's workflow, not pushed to a separate alert queue. The reviewer encounters signals within the engagement context they are already working in.

2. Signal cards must display: signal type, confidence summary, evidence count, and resolution actions at minimum. The reviewer can evaluate and resolve a signal without leaving the workflow.

3. Signal grouping must organize related signals by entity, account area, risk category, or timeframe. Reviewers facing 50 signals need them organized, not listed chronologically.

4. Signal resolution must be as smooth as signal detection. Accept, dismiss, defer, escalate — each with a reason, each tracked, each feeding back into model improvement.

5. Cross-engagement signals must be surfaced at the firm level with appropriate governance. Engagement-level reviewers see engagement signals; partners and quality reviewers see cross-engagement patterns.

6. Signal confidence must be visualized in domain-meaningful terms. Reviewers evaluate signals based on evidence and context, not numerical probabilities.

## 10. Architecture Implications

1. Signal detection is an event-driven process. Models and rules evaluate data as it is ingested, as evidence is verified, and as findings are created. Signal generation is triggered by conditions, not by manual initiation.

2. Signal confidence is computed by the Confidence Model (20.11) and attached to the signal at generation time. Confidence is recalculated when evidence changes or new corroborating data arrives.

3. Signal routing is governed by configurable rules: signal type, confidence level, risk category, and engagement assignment determine which reviewer or team receives the signal.

4. Signal resolution events are emitted as feedback signals to the AI layer. Resolution data (what was investigated, what was dismissed, and why) is the highest-value training data for signal quality improvement.

5. Cross-engagement signal aggregation requires a service that analyzes signals across engagement boundaries while respecting tenant isolation and data governance. Firm-level signals are generated without exposing individual engagement data.

6. Signal data must support temporal queries: "show all signals about this entity in the last three years" and "show the resolution pattern for signals of this type across all engagements."

7. The architecture must support both real-time signal generation (for anomalies detected during evidence processing) and batch signal generation (for cross-engagement patterns analyzed periodically).

## 11. Governance Implications

1. Signal routing rules are governance artifacts. Who receives which signals, at which confidence levels, under which engagement contexts is a governance decision, not a technical configuration.

2. Signal resolution is a governed process. High-risk signals cannot be dismissed without partner-level review. Critical signals cannot be deferred beyond a defined timeframe.

3. Signal audit trails are immutable. Every signal, its evidence, its routing, its resolution, and its impact on downstream findings and decisions is recorded permanently.

4. Cross-engagement signal sharing is governed by data access policies. What signal data crosses engagement boundaries, what is aggregated at the firm level, and what remains engagement-specific are governance decisions.

5. Signal threshold configuration is a governance responsibility. What confidence level triggers a signal, what evidence count is required, and what materiality threshold applies are professional judgments, not technical settings.

6. Signal resolution rates are quality metrics. High dismissal rates may indicate model calibration issues. High escalation rates may indicate threshold configuration problems. Both are governance-quality indicators.

## 12. AI / Intelligence Implications

1. Signal detection models are domain-specific. Audit signals, financial reporting signals, and compliance signals are generated by different models trained on different evidence patterns.

2. Models generate signals, not findings. The AI layer identifies conditions that warrant professional attention. It does not conclude that a finding exists. That determination is a human professional judgment.

3. Signal quality improves through feedback. Resolution data — what was investigated and what was dismissed — is the primary training signal for improving detection models and reducing false positives.

4. Composite signal aggregation is an AI-driven capability. Individual signals that are weak in isolation may constitute a strong composite signal. The AI layer identifies these aggregations across entities, accounts, and timeframes.

5. Signal confidence calibration is continuous. The system monitors whether signal confidence ratings are predictive of resolution outcomes. Overconfident signals (high confidence, dismissed as no risk) trigger model recalibration.

6. Cold-start signals in new engagement types or client domains are labeled as low-confidence. The system does not pretend certainty in unfamiliar territory.

## 13. UX Implications

1. Signals must appear in the reviewer's workflow context, not in a separate alert inbox. The reviewer encounters signals while reviewing evidence, creating findings, or assessing risk.

2. Signal cards must be scannable: type icon, confidence indicator, evidence count, and one-click resolution actions. At a glance, the reviewer knows what the signal is, how strong it is, and what to do about it.

3. Signal grouping and filtering must support the reviewer's cognitive workflow: group by entity, group by risk category, group by confidence, filter by resolution status. Signal management is a review task, not an administration task.

4. Signal resolution must not require navigating away from the engagement workflow. Dismiss with reason, investigate, escalate, or defer — all within the current context.

5. Signal history must be accessible from any point in the engagement. "Show me all signals about this account" and "Show me all dismissed signals from this period" must be one-query operations.

6. Signal fatigue must be actively managed. The system must not surface more signals than a reviewer can process. Signal volume is controlled by confidence thresholds and relevance filtering.

## 14. Commercial Implications

1. Risk Signal Model value is measured in detection quality: how many relevant signals are detected, how few false positives are generated, and how efficiently reviewers resolve them.

2. Proof-of-value metrics: signal detection rate, false positive rate, average time to resolution, percentage of findings that originated from system-generated signals, and signal coverage improvement.

3. Cross-engagement signal detection is a differentiating capability. Firms using AQLIYA can detect patterns across their client portfolio that firms using engagement-only tools cannot.

4. Signal quality creates a retention moat. As models improve through feedback, the system generates more accurate signals. Competing systems start from zero feedback data.

5. Signal coverage expands with domain depth. As AQLIYA adds financial reporting, compliance, and governance signal types, the value compound for clients who operate across these domains.

## 15. Anti-Patterns

1. **Alert Flooding.** Surfacing too many low-confidence signals without relevance filtering. This creates fatigue, trains reviewers to ignore the system, and undermines trust in signal quality.

2. **Signal Without Evidence.** Generating risk signals without supporting evidence. A "high risk" indicator that the reviewer cannot evaluate because there is no supporting data is noise, not intelligence.

3. **Signal Without Resolution.** Allowing signals to accumulate without required resolution. Unresolved signals are governance gaps — they represent conditions that were flagged but never evaluated.

4. **Automated Finding Creation.** Allowing signals to automatically become findings without human evaluation. A signal is intelligence for a reviewer, not a conclusion to be reported.

5. **Broadcast Routing.** Routing all signals to all reviewers regardless of relevance, authority, or engagement assignment. This creates information overload and diffuses accountability.

6. **Static Confidence.** Failing to update signal confidence as evidence changes, new data arrives, or similar signals are resolved. Confidence should reflect current information, not initial assessment.

7. **Engagement Isolation.** Preventing signals from crossing engagement boundaries when the same entity, pattern, or risk appears across multiple clients. Engagement isolation prevents organizational intelligence.

## 16. Examples

**Example 1: Anomaly Signal.** The system analyzes a client's journal entries and detects a pattern: 23 entries posted to the same expense account in the last week of the fiscal year, totaling 180% of the account's average monthly activity. A risk signal is generated with type `anomaly_detected`, source `journal_entry_pattern_model`, and confidence: evidence_strength=strong (23 independent entries), pattern_consistency=recurring (similar pattern in prior year), materiality_relevance=above_threshold (amount exceeds 2% of total expenses). The signal is routed to the engagement reviewer with the specific journal entries linked as evidence.

**Example 2: Cross-Engagement Signal.** Over 20 audit engagements, the system identifies that clients in the construction sector consistently show late-period revenue recognition patterns that correlate with subsequent restatements. No single engagement shows a material signal, but the aggregated pattern is significant. A cross-engagement risk signal is generated with type `cross_engagement_pattern`, source `portfolio_pattern_detector`, and routed to the firm's quality review team. The signal includes aggregated anonymized evidence from all affected engagements.

**Example 3: Evidence Gap Signal.** During an audit, the system detects that an account balance exceeding the materiality threshold lacks supporting confirmations. A signal is generated with type `evidence_gap`, source `evidence_sufficiency_engine`, and confidence: evidence_strength=moderate (absence of evidence is not affirmative evidence but is a coverage gap), materiality_relevance=above_threshold. The signal is routed to the engagement reviewer with a suggested list of confirmations to request.

## 17. Enterprise Impact

1. **Risk Coverage.** The system detects risk conditions that individual reviewers might miss due to workload, experience gaps, or attention limitations. Signal coverage supplements professional judgment.

2. **Risk Consistency.** The same evidence patterns produce the same signals regardless of which reviewer examines the data. Consistency improves audit quality and reduces variability across engagements.

3. **Early Detection.** Signals are generated during evidence processing, not after manual review. Reviewers encounter relevant signals during their workflow, not after the fact.

4. **Organizational Intelligence.** Cross-engagement signal aggregation produces firm-level risk insights that no individual reviewer could identify. Patterns visible at the portfolio level emerge as organizational intelligence.

5. **Quality Metrics.** Signal detection rate, resolution distribution, and false positive rate provide quantitative measures of risk management quality across the firm.

6. **Training Data.** Signal resolution data creates a feedback loop that improves detection quality over time. The system learns from every resolution: investigated, dismissed, or deferred.

## 18. Long-Term Strategic Importance

The Risk Signal Model is how AQLIYA delivers intelligence to the professional reviewer. It is the interface between AI analysis and human judgment. If signals are poor — too many false positives, too little evidence, no context — reviewers will ignore the system. If signals are good — relevant, evidence-backed, confidence-qualified, and actionable — reviewers will depend on them as an essential professional tool.

The long-term strategic value lies in signal depth and quality. As the system accumulates resolution data across engagements, detection models improve, false positive rates drop, and signal relevance increases. This creates a compounding advantage: firms that use AQLIYA longer receive better signals, which produce better decisions, which produce better outcomes, which justify continued investment.

Over time, the Risk Signal Model extends beyond audit into any domain where early risk detection creates value: financial reporting, compliance monitoring, vendor risk management, and operational risk. The same structural model — detect, qualify, route, resolve, learn — applies across domains.

## 19. Related Documents

| ID | Document | Relationship |
|---|---|---|
| 20.03 | Finding Model | Signals may become findings after reviewer evaluation |
| 20.04 | Evidence Model | Evidence bundles support risk signals |
| 20.07 | Financial Entity Model | Signals are often generated about financial entities |
| 20.11 | Confidence Model | Confidence qualifies signal strength |
| 05.09 | Audit Risk Scoring Theory | Risk scoring applied to signal generation and qualification |

## 20. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2026-05-07 | Founding Team | Initial reference model specification |
| 0.2 | 2026-05-08 | Final Editor | Promoted to Reviewed v0.2. Evidence-backed signals, AI-assistive (not autonomous), governed routing. Added cross-references to 17.01, 17.05, 17.07. |