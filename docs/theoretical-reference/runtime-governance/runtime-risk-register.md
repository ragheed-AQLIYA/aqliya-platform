# Runtime Risk Register

The Runtime Risk Register catalogues the operational risks inherent in an agent-driven governance system. Each risk is assessed for severity, likelihood, and residual exposure after controls are applied. The register is reviewed on the cadence specified and updated as the system evolves.

---

## Risk Assessment Scale

| Axis | Levels |
|---|---|
| **Severity** | Critical / High / Medium / Low |
| **Likelihood** | Almost Certain / Likely / Possible / Unlikely / Rare |
| **Residual Risk** | The risk level remaining after controls and mitigations are applied |

---

## Risk Register

| ID | Risk | Severity | Likelihood | Control | Mitigation | Owner | Review Cadence | Residual Risk |
|---|---|---|---|---|---|---|---|---|
| R01 | **AI Overreach** — Agent exceeds its authority, performing actions reserved for human decision-makers (e.g., publishing without approval, asserting unverified claims). | Critical | Possible | Role-bound action gating; pre-action approval check at retrieval layer; prohibited-action blocklist. | Immediate escalation on gating violation; session termination for Critical-severity overreach; post-incident review within 24 hours. | Governance Lead | Monthly | High |
| R02 | **Approval Bypass** — Agent executes a gated action without valid approval, either through a code path error or context manipulation. | Critical | Unlikely | Hard enforcement at the retrieval runtime layer (not application layer); cryptographic approval tokens; dual-channel verification. | Action blocked pre-execution; audit log entry with full trace; mandatory re-approval required; root-cause analysis within 48 hours. | Governance Lead | Monthly | Medium |
| R03 | **Retrieval Hallucination** — The retrieval runtime injects context that appears authoritative but was fabricated, misattributed, or drawn from an invalid source. | Critical | Possible | Provenance verification on every context block; source whitelisting; confidence scoring on retrieval results. | Retrieved block flagged with hallucination marker; agent instructed to disregard; source re-verification triggered; incident logged for retrieval model tuning. | Evidence Steward | Weekly | High |
| R04 | **Evidence Misuse** — Agent cites evidence out of context, cherry-picks favourable data, suppresses contradictory evidence, or applies evidence to the wrong claim type. | Critical | Possible | Contradiction detection at retrieval layer; mandatory dual-evidence injection when conflicts exist; staleness and relevance gates. | Misused evidence flagged in output; contradiction surfaced to human reviewer; agent confidence downgraded for the session; misuse pattern tracked for retraining. | Evidence Steward | Weekly | High |
| R05 | **Governance Omission** — Applicable governance rules are not retrieved or injected, causing the agent to act without knowledge of its constraints. | Critical | Unlikely | Governance rules are in the mandatory-retention tier and cannot be pruned; retrieval boundary enforcement; pre-action governance checklist. | Agent enters restricted mode on governance-context loss; action blocked until governance context is restored; omission logged and escalated to Governance Lead. | Governance Lead | Monthly | Medium |
| R06 | **Escalation Failure** — Agent encounters a situation requiring escalation but either does not recognise the trigger or the escalation path is unavailable. | High | Possible | Explicit escalation triggers defined per task class; escalation path injected with every retrieval cycle; heartbeat check on escalation channel availability. | Fallback escalation to default authority; agent enters safe-idle state; failed escalation queued for retry; incident reviewed within 4 hours. | Operations Lead | Monthly | Medium |
| R07 | **Provenance Failure** — Context is injected without source metadata, breaking the audit trail and making downstream decisions unverifiable. | High | Possible | Provenance metadata is a retrieval boundary (never omitted); automated provenance completeness check before injection; rejection of sourceless context blocks. | Affected evidence quarantined; agent restricted to read-only until provenance restored; gap reported to Evidence Steward; retrospective provenance reconstruction attempted. | Evidence Steward | Weekly | Medium |
| R08 | **Excessive Automation** — Agent automates a sequence that should have been stepwise with human checkpoints, compressing multi-stage review into a single unsupervised run. | High | Likely | Workflow stage gating; mandatory human checkpoints between stages; maximum-automation-depth limit per task class. | Automation depth exceeded triggers session pause; human reviewer notified; stage outputs preserved for incremental review; automation boundary reviewed monthly. | Operations Lead | Monthly | High |
| R09 | **Prompt Stripping** — Governance or safety instructions injected via system prompt are stripped, truncated, or overridden by a later prompt or by agent self-modification. | High | Unlikely | Immutable context tier for governance instructions; cryptographic integrity check on prompt assembly; prompt-layer isolation. | Session terminated on integrity violation; stripped prompt reconstructed from secure store; incident escalated to Governance Lead; root-cause analysis within 24 hours. | Governance Lead | Monthly | Low |
| R10 | **Context Overload** — Too much context is injected, causing the agent to miss critical governance rules or evidence contradictions buried in noise. | Medium | Likely | Relevance scoring with hard cutoff; tiered trimming (bottom-up); summarisation fallback; maximum token budget enforcement. | Agent confidence check on key governance items post-retrieval; overload events logged; retrieval budget adjusted per task class; pattern analysed for budget tuning. | Operations Lead | Monthly | Medium |
| R11 | **False Confidence** — Agent reports high confidence on an output that is in fact wrong, misleading, or unsupported, leading human reviewers to trust the output without scrutiny. | High | Likely | Confidence calibration against ground truth; mandatory low-confidence escalation; confidence score breakdown by evidence item; "trust but verify" watermark on all agent outputs. | High-confidence outputs subjected to spot-check sampling; false-confidence incidents trigger recalibration; reviewer training on confidence scepticism; agent confidence model retrained quarterly. | Evidence Steward | Monthly | Medium |
| R12 | **Draft-as-Final Usage** — A draft output is treated or presented as final, bypassing required review stages, either through mislabelling or premature publication. | High | Possible | Watermark injection on all draft outputs ("DRAFT — NOT FOR PUBLICATION"); stage-state enforcement at the workflow layer; publication gate tied to review completion status. | Draft misrepresented as final triggers withdrawal and correction notice; affected consumers notified; stage reversion enforced; incident reviewed within 4 hours. | Operations Lead | Monthly | Medium |

---

## Risk Heat Map Summary

|  | Almost Certain | Likely | Possible | Unlikely | Rare |
|---|---|---|---|---|---|
| **Critical** | — | — | R01, R03, R04 | R02, R05 | — |
| **High** | — | R08, R11 | R06, R07, R12 | R09 | — |
| **Medium** | — | R10 | — | — | — |
| **Low** | — | — | — | — | — |

---

## Top Risks by Residual Exposure

1. **R01 — AI Overreach** (Critical × Residual High): The highest-exposure risk. Despite controls, the possible likelihood and critical severity demand continuous vigilance.
2. **R03 — Retrieval Hallucination** (Critical × Residual High): Retrieval fabrications can corrupt the entire downstream chain.
3. **R04 — Evidence Misuse** (Critical × Residual High): Cherry-picking and decontextualisation are hard to detect in real time.
4. **R08 — Excessive Automation** (High × Residual High): The most likely high-severity risk; requires strong stage gating.

---

## Review and Maintenance

- **Monthly review** by the Governance Lead for all risks.
- **Weekly review** by the Evidence Steward for evidence-related risks (R03, R04, R07).
- **Ad-hoc review** triggered by any Critical-severity incident within 24 hours.
- **Quarterly recalibration** of confidence scores and risk ratings based on incident data.

All changes to this register must be approved by the Governance Lead and recorded in the audit trail.
