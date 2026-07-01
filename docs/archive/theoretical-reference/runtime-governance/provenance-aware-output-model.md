# Provenance-Aware Output Model

## Output Provenance Philosophy

Every output must carry its origin trace. In a governance system that blends human judgment, doctrinal reasoning, and AI-generated analysis, the consumer of any output — whether a reviewer, manager, partner, auditor, or downstream system — must be able to answer four questions without consulting the author: Where did this come from? Who reviewed it? What was the confidence level? Was it approved? Provenance metadata is not documentation added after the fact; it is a structural property of the output itself, inseparable from the content it describes.

## Conceptual Metadata

Every governance output must carry the following conceptual metadata fields. These fields form the minimum viable provenance envelope.

### 1. Doctrine Source

**Description:** The governing doctrinal framework(s) from which the output's substantive conclusions are derived (e.g., IFRS 15, ASC 606, internal policy document reference, jurisdictional regulation citation).

**Requirement:** Must be a resolvable reference. Doctrine sources must be cited at the provision level where available, not merely at the standard level.

### 2. Evidence Source

**Description:** The specific evidence items that support the output's factual assertions and classifications. This includes contract excerpts, transaction records, representations, and external data.

**Requirement:** Evidence sources must be traceable to a controlled evidence repository. Each evidence source reference must include a retrieval identifier and a timestamp of when the evidence was accessed.

### 3. Confidence Level

**Description:** The assessed confidence in the output's correctness, expressed on a defined ordinal scale. This is a composite of evidence sufficiency, mapping certainty, and reviewer judgment.

**Scale:** High | Medium | Low  
- **High:** Evidence is complete, mapping is unambiguous, reviewer concurs.  
- **Medium:** Evidence is sufficient but mapping involves interpretive judgment, or evidence is incomplete but mapping is straightforward.  
- **Low:** AI output below operational threshold, evidence is weak, mapping is uncertain, or reviewer has reservations. Any output with confidence below High must carry a documented rationale for the downgrade.

### 4. Reviewer Status

**Description:** Whether the output has been reviewed, and if so, by whom and at what level.

**States:**
- **Unreviewed:** Output has not undergone human review.
- **Under Review:** Review is in progress; reviewer identity and start timestamp recorded.
- **Reviewed — Concur:** Reviewer agrees with the output without modification.
- **Reviewed — Modified:** Reviewer made substantive changes to the output.
- **Reviewed — Rejected:** Reviewer rejected the output; it must not be consumed.

### 5. Approval State

**Description:** The governance approval status of the output, independent of review status. An output may be reviewed but not yet approved, or approved at a lower level than reviewed.

**States:**
- **Draft:** Output is in preparation; not for consumption.
- **Pending Approval:** Output has been reviewed and submitted for approval.
- **Approved — Reviewer Level:** Approved at Reviewer authority.
- **Approved — Manager Level:** Approved at Manager authority.
- **Approved — Partner Level:** Approved at Partner authority.
- **Rejected:** Output was reviewed and rejected at the approval stage.

### 6. Escalation History

**Description:** A chronological record of all escalation events associated with the output, including the trigger, escalation level reached, resolution, and resolved-by identity.

**Requirement:** Each escalation entry must include trigger type, timestamp, escalating authority, receiving authority, resolution summary, and resolution timestamp. The escalation history must be append-only.

### 7. Generation Timestamp

**Description:** The UTC timestamp of when the output was generated or last materially modified.

**Requirement:** Must be recorded at the point of generation with sufficient precision to establish ordering relative to other governance events. Modifications that change substantive content must update the generation timestamp; metadata-only changes must not.

## Draft vs Final Distinction

The governance system must formally distinguish between draft and final outputs. The distinction is governed by the following rules:

| Property | Draft | Final |
|---|---|---|
| Consumption | Internal only; not for decision-making | Authorized for governance consumption |
| Review | Optional; may be pre-review | Mandatory; review status must be recorded |
| Approval | Not required | Required; approval state must be Final |
| Provenance | Partial; metadata may be incomplete | Complete; all metadata fields populated |
| Mutation | Mutable; content and metadata may change | Immutable; content is frozen |
| Visibility | Restricted to author and direct reviewers | Visible to all authorized governance consumers |

Transition from draft to final is a one-way, irreversible governance event. Once an output is marked final, neither its substantive content nor its approval state (for that version) may be altered. Corrections require a new version with its own provenance trail.

## Explainability Concepts

Provenance metadata serves as the foundation for explainability. When a governance decision is challenged — whether in an audit, a regulatory review, or an internal quality assessment — the provenance trail must support the following explainability queries:

1. **Source attribution:** Which doctrine provisions and evidence items support this conclusion?
2. **Decision path:** Who reviewed this output, at what levels, and with what outcomes?
3. **Uncertainty disclosure:** Where along the chain was confidence flagged, and what was done about it?
4. **Escalation trace:** Was this output escalated? If so, why, to whom, and how was it resolved?
5. **Alternative reasoning:** Were dissenting views recorded? What were they and why were they not adopted?
6. **Temporal context:** When was each governance action taken relative to the transaction timeline?

Explainability is not a post-hoc reconstruction. It is a direct query against the provenance metadata that was recorded at each step. A system that cannot answer these queries at the time of output generation will not be able to answer them at the time of audit.

## Provenance Principles

All provenance metadata must satisfy four non-negotiable principles:

### 1. Traceable

Every assertion in the output must be traceable to at least one doctrine source or evidence item. The traceability chain must be continuous: output → evidence → source document → controlled repository. Gaps in the chain are governance defects and must be escalated.

### 2. Attributable

Every governance action — generation, review, modification, approval, escalation, rejection — must be attributable to an identified actor (human or system) with a timestamp. Anonymous or unattributed actions are not permitted in the governance record.

### 3. Reviewable

The provenance metadata must be structured such that an independent reviewer can assess the sufficiency of the governance process without access to the original actors. This requires that the metadata alone communicates the decision path, confidence assessments, and escalation history.

### 4. Challengeable

Any output that carries provenance metadata must be challengeable through a defined challenge process. A challenge is a formal governance event that asserts a defect in the provenance trail (missing source, insufficient review, unresolved escalation, etc.). Challenges themselves carry provenance and must be resolved and recorded.

## Goal

Future explainable-AI readiness. The provenance-aware output model ensures that every governance output — whether generated by a human, an AI, or a human-AI collaboration — carries the structural metadata required for downstream explainability, auditability, and challenge. When AI systems become capable of generating governance outputs autonomously, the provenance model described here will be the minimum requirement for those outputs to be accepted into the governance record.
