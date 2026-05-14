# Human Approval Query Map

This document defines the boundaries, principles, and operational queries governing when and how human approval is required across all AQLIYA systems.

---

## Why Human Approval Is Required

Human approval is the mechanism by which accountability is anchored to a natural person with professional, legal, or fiduciary standing. It is not a bottleneck to be bypassed — it is a structural requirement derived from:

1. **Accountability (Taklif):** In Islamic ethics, moral and legal responsibility (taklif) attaches to the human agent, not the tool. An AI system can assist preparation but cannot own accountability.
2. **Professional Standards:** Audit, legal, and Shariah advisory professions require a qualified human to exercise judgment and sign off on outputs that affect clients, stakeholders, or the public.
3. **Regulatory Compliance:** Regulators recognize only natural persons or registered entities as responsible parties. AI-generated output without human approval is not a regulated professional service.
4. **Risk Allocation:** Liability frameworks (professional indemnity, malpractice, breach of duty) require an identifiable human decision-maker.
5. **Ethical Imperative:** Matters affecting people's wealth, compliance status, or institutional standing demand human conscience and contextual judgment that AI cannot replicate.

AI can assist preparation. AI cannot own accountability. This distinction is foundational to every AQLIYA product and process.

---

## Where Human Approval Applies

Human approval is required for **all outputs that cross a defined boundary from "assistance" to "determination."** These boundaries are encoded in each product's doctrine lookup map and operationalized through the following universal categories:

### Category 1 — Client-Facing Outputs
Any document, report, finding, or recommendation that will be delivered to an external client in AQLIYA's name.
- **Trigger:** Output module is marked `audience=client`
- **Approver:** Engagement lead or designated reviewer with line-of-sight to the client relationship

### Category 2 — Regulatory Submissions
Any output filed with or submitted to a regulator, exchange, or statutory body.
- **Trigger:** Output module is marked `audience=regulator`
- **Approver:** Compliance officer or partner with regulatory signing authority

### Category 3 — Shariah Determinations
Any output that asserts a transaction, product, or practice is Shariah-compliant or non-compliant.
- **Trigger:** Output module is marked `domain=shariah_ruling`
- **Approver:** Shariah committee member or designated shariah reviewer

### Category 4 — Financial or Commercial Commitments
Any output that creates, modifies, or terminates a financial obligation or commercial relationship.
- **Trigger:** Output module is marked `domain=financial_commitment`
- **Approver:** Authorized signatory per delegation of authority schedule

### Category 5 — Risk or Materiality Judgments
Any output that rates, scores, or classifies risk or materiality where that classification influences downstream decisions.
- **Trigger:** Output module is marked `domain=risk_assessment`
- **Approver:** Risk committee delegate or engagement partner

### Category 6 — Production Gate Decisions
Any output that triggers a product transition (pilot → production, feature activation, system-wide change).
- **Trigger:** Output module is marked `domain=production_gate`
- **Approver:** Product governance body or technical authority

---

## Draft Output Boundary

All AI-generated content that has not yet received human approval is classified as **DRAFT**. The draft boundary is enforced technically and visually:

| Property | DRAFT State | APPROVED State |
|---|---|---|
| Watermark | "AI-GENERATED DRAFT — PENDING HUMAN REVIEW" | Removed |
| Audit log | `status=draft`, `approver=null` | `status=approved`, `approver=[user_id]`, `timestamp=[datetime]` |
| PDF export | Watermark rendered on every page | Clean export |
| API delivery | Blocked for `audience=client` or `audience=regulator` | Released |
| Version label | `v0-draft-{generation_id}` | `v1-approved-{approval_id}` |
| Editability | Locked (requires explicit edit mode with versioning) | Unlocked for subsequent revision |

**Re-draft rule:** If a human reviewer makes substantive content changes (beyond formatting), a new draft version is created and must itself be approved. Minor corrections (typos, formatting) are version-annotated but do not reset approval status.

---

## Professional Judgment Boundary

The professional judgment boundary demarcates what the AI can compute, estimate, or deduce from what requires a qualified human professional to weigh, interpret, and conclude.

### AI-Computable (Assistance Domain)
- Numeric calculations (ratios, thresholds, aggregations)
- Pattern matching (control deviations, anomaly detection)
- Rule-based classification (where rules are complete and unambiguous)
- Data retrieval and structured summarization
- Consistency checking across documents
- Regulatory checklist compliance (binary criteria)

### Human-Judgment Required (Determination Domain)
- Interpretation of ambiguous or incomplete evidence
- Contextual significance of findings (materiality in context)
- Exercise of professional skepticism
- Application of principles where rules are silent or contradictory
- Client-specific nuance (history, relationship, non-documented knowledge)
- Balancing competing stakeholder interests
- Ethical dilemmas and conflicts of interest
- Shariah ruling where multiple valid opinions exist (ikhtilaf)

**Boundary enforcement rule:** When the system is uncertain which domain a particular step falls into, it must default to the Human-Judgment side and escalate.

---

## Reviewer Responsibility

The human reviewer bears the following non-delegable responsibilities upon approving AI-assisted output:

1. **Comprehension:** The reviewer must have read and understood the content, not merely skimmed or trust-delegated to the AI.
2. **Verification:** Key facts, calculations, and source references must be spot-checked to the reviewer's professional satisfaction.
3. **Judgment Ownership:** The reviewer must be willing to stand behind the output in a professional, regulatory, or legal context — as if they had authored it without AI assistance.
4. **Rationale Documentation:** If the reviewer overrides the AI's recommendation, the rationale must be documented. If the reviewer accepts the AI's recommendation, that acceptance is itself a judgment.
5. **Escalation:** If the reviewer believes the output is beyond their competence, authority, or the system's intended use, they must escalate — not approve under pressure.

**The reviewer is not a rubber stamp.** Approval implies affirmative professional endorsement. If a reviewer would not sign the same content prepared by a junior team member without review, they should not approve the AI-generated equivalent without equivalent review.

---

## Approval vs. Generation Distinction

| Activity | AI Role | Human Role | Approval Required? |
|---|---|---|---|
| Research & data gathering | Primary | Direction | No |
| Computation & analysis | Primary | Configuration | No |
| Draft narrative generation | Primary | Review & edit | No (during drafting) |
| Draft narrative finalization | Assist | **Approve** | **Yes** |
| Finding classification | Recommend | **Approve** | **Yes** |
| Risk scoring | Calculate | **Set thresholds & approve** | **Yes** |
| Shariah compliance screening | Apply rules | **Configure rules & adjudicate grey cases** | **Yes** |
| Workpaper assembly | Auto-populate | **Review completeness & sign** | **Yes** |
| Internal analysis for human use only | Generate | Interpret | No (internal work product) |
| Data transformations | Execute | Validate | No |

**Principle:** Generation is unregulated. Approval is controlled. The line is crossed when output leaves the internal human review loop and acquires external effect.

---

## AI Assistance Boundaries

AI systems within AQLIYA operate within the following non-negotiable boundaries:

### AI May:
- Retrieve, organize, and summarize information
- Perform computations and present results
- Draft natural-language narratives, reports, and workpapers
- Flag anomalies, patterns, and potential indicators
- Apply pre-configured rules and policies
- Suggest classifications, ratings, and recommendations
- Maintain audit trails and evidence chains
- Enforce workflow states and approval gates

### AI Must Not:
- Issue binding opinions, rulings, or certifications
- Represent itself as a qualified professional
- Make unilateral decisions that affect client relationships or regulatory standing
- Override or bypass human approval gates
- Interpret Shariah sources independently (ijtihad)
- Exercise professional judgment in ambiguous contexts
- Accept or decline engagements
- Communicate with clients, regulators, or external parties autonomously
- Self-modify its doctrine boundaries or approval rules

**System-level enforcement:** Each AI capability must be mapped to a corresponding human approval gate. No capability may exist without an associated accountability anchor. The system must refuse (with explanation) any request that would cause it to cross these boundaries.

---

## Example Approval Questions

The following are concrete examples of questions a human reviewer must address when reviewing AI-assisted output. These are not exhaustive but illustrate the expected depth of review.

### AuditOS — Audit Report Review
- Does the audit opinion accurately reflect the evidence collected?
- Are there findings or indicators that the AI flagged but I believe are not material — and why?
- Conversely, are there areas where I believe the AI's coverage was insufficient?
- Would I sign this report if I had prepared it entirely manually?
- Have I verified the three highest-risk findings against primary source evidence?

### Decision OS — Investment Recommendation
- Does this recommendation align with the institution's stated risk appetite?
- Is the Shariah screening consistent with the board's most recent resolutions?
- What assumptions in the model would change the recommendation if altered?
- Do I have visibility into data sources the AI used that may be stale or unreliable?
- Am I comfortable defending this recommendation to the Shariah board and risk committee?

### Pilot Management — Production Gate
- Has the system met the pre-defined readiness criteria objectively?
- Are there client feedback signals that contradict the system's readiness assessment?
- What is the worst-case consequence of a false positive (declaring ready when not)?
- Has the pilot covered sufficient diversity of scenarios, clients, and data conditions?
- Am I prepared to accept liability risk for production outputs based on the pilot evidence?

### General — Any Approval
- Do I understand this output well enough to explain it to a client or regulator?
- Is there anything in this output that I do not understand or that gives me pause?
- Have I documented my approval rationale sufficiently for a subsequent reviewer?
- If I were cross-examined on this output, could I defend it?
- Should I escalate any part of this to a higher authority or specialist?

---

## Red Flags Requiring Escalation

The following situations must trigger escalation to a higher authority (partner, compliance officer, shariah board, or ethics committee). They must not be resolved within the reviewer's sole discretion.

### Technical Red Flags
- AI confidence score below system-configured threshold for any material assertion
- Evidence marked as contradictory (ta'arud) by the system without clear resolution
- Data source flagged as potentially stale, corrupted, or unauthorized
- System anomaly or unexpected behavior during the generation of the output
- Approval workflow bypass or override detected (even if attempted innocently)

### Professional Red Flags
- Output contains a finding or opinion that the reviewer knows (or strongly suspects) is incorrect
- Pressure (internal or client) to approve output without adequate review time
- Output covers a domain outside the reviewer's professional competence
- Client relationship dynamics that could impair objectivity (familiarity, intimidation, self-interest)
- Reviewer has a personal or financial interest in the output's conclusion

### Shariah Red Flags
- AI's classification contradicts a relevant fatwa or standing shariah board resolution
- Matter involves novel financial product with no clear precedent
- Jurisdictional conflict: AAOIFI standard vs. local shariah board position vs. conventional regulation
- Output touches on maslahah-mafsadah trade-off without explicit shariah board guidance
- Client challenge to shariah classification that requires scholarly response, not just restatement

### Governance Red Flags
- Request to approve output for a purpose not originally scoped or configured
- Attempt to use draft output in a client meeting or regulatory submission before approval
- Output that may trigger regulatory notification obligations (e.g., suspicious transaction, fraud)
- Cross-border output where hosting jurisdiction's laws may conflict with content
- Output that could be interpreted as a legal opinion unless specifically covered by professional legal privilege

### Escalation Protocol
1. **Stop:** Do not approve the output. Do not override system warnings.
2. **Document:** Record the reason for escalation in the approval queue with supporting notes.
3. **Route:** Assign to the appropriate escalation authority based on the red flag category.
4. **Preserve:** Maintain the full system state at time of escalation (data, model version, inputs, draft output) for subsequent review.
5. **Disclose:** If the output has already been shared externally in draft form, notify the recipient of the hold and the pending review.

---

## Summary Table

| Concept | Definition |
|---|---|
| Approval is | An affirmative human act of professional endorsement |
| Approval is not | A checkbox, a rubber stamp, or a trust delegation to AI |
| AI generates | Content, analysis, recommendations, drafts |
| Human approves | Judgments, commitments, certifications, external communications |
| Draft boundary | Unapproved output is watermarked, locked, and blocked from external delivery |
| Professional judgment | The non-automatable domain of human expertise, skepticism, and ethical reasoning |
| Escalation | Required when competence, confidence, or authority boundaries are reached |
| Accountability | Always and exclusively human — AI can assist preparation but cannot own accountability |

---

*This document is part of the AQLIYA theoretical reference library. All approval workflows and boundaries must be consistent with this map. Any deviation requires Product Doctrine governance body approval.*
