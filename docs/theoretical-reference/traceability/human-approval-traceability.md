# Human Approval Traceability

## Approval actions and their governance footprint

### Approval: Evidence verification

- **Action:** Human reviews candidate evidence and confirms or rejects its content validity
- **Authority Level:** Standard reviewer — any auditor assigned to the engagement may perform this action
- **Record:** Approval event with `action: evidence.verify`, evidence hash, reviewer ID, decision (accept / reject), and optional comment
- **Governance Implication:** This is the gate that converts structurally sound evidence into accepted evidence; an incorrect acceptance may propagate error through the entire audit chain. The 4-eyes principle does not apply at this level unless the evidence class is flagged as high-risk.

### Approval: Finding approval

- **Action:** Human reviews an AI-generated or human-drafted finding and determines whether the analysis is sound and the severity rating appropriate
- **Authority Level:** Senior reviewer — must hold a designation above the auditor who produced the underlying evidence collection
- **Record:** Approval event with `action: finding.approve`, finding ID, reviewer ID, severity confirmation, and supporting rationale
- **Governance Implication:** This is the first binding human judgement on analytical output. An incorrect finding approval can lead to a false-positive or false-negative audit conclusion. The 4-eyes principle applies if the finding was AI-generated (distinct from the AI recommendation).

### Approval: Recommendation sign-off

- **Action:** Human reviews and accepts or rejects a recommendation (remediation, adjustment, or disclosure)
- **Authority Level:** Lead reviewer or partner — must have authority commensurate with the recommendation's materiality level
- **Record:** Approval event with `action: recommendation.sign`, recommendation ID, reviewer ID, decision (accept / reject / accept-with-modification), and modification details if applicable
- **Governance Implication:** This is the most consequential approval — it commits the organisation to a course of action. The 4-eyes principle is mandatory: two distinct humans must sign off. The second sign-off must be at a higher authority level than the first.

### Approval: Publication release

- **Action:** Human authorises the public release of the completed audit package
- **Authority Level:** Partner or designated officer — the highest authority level in the governance hierarchy
- **Record:** Approval event with `action: publication.release`, package hash, authoriser ID, confirmation of completeness check, and binding signature
- **Governance Implication:** This action transitions the audit from private to public. Once published, the audit package is immutable; retraction requires a new audit cycle. The publication event itself becomes evidence for future audit cycles.
