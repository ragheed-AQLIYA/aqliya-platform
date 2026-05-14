# Runtime Escalation Framework

## Escalation Philosophy

Escalations are governance events, not failures. An escalation does not indicate that the system or a reviewer has broken; it indicates that the governance framework is functioning as designed. Every escalation is a structured handoff that moves a decision to a higher authority level where greater interpretive weight, broader doctrinal knowledge, or commercial-signoff authority resides. The absence of escalations is not a sign of health — it is a sign of governance atrophy. Healthy runtime governance produces a steady, auditable stream of escalations, each with a recorded trigger, resolution, and provenance trail.

## Escalation Triggers

All triggers are defined on the principle that uncertainty must be surfaced, not suppressed. Each trigger corresponds to a specific governance condition that the current authority level cannot safely resolve alone.

### 1. Weak Evidence

**Definition:** The evidence supporting a proposed accounting treatment, disclosure, or governance assertion fails to meet the minimum confidence threshold defined by the governing doctrine.

**Severity:** Medium  
**Escalation Level:** Reviewer → Manager  
**Required Resolution:** Manager must either locate supplementary evidence, downgrade the assertion confidence, or escalate further to Partner if evidence remains insufficient across available sources.

### 2. Uncertain Mapping

**Definition:** The mapping between a fact pattern or transaction characteristic and the applicable doctrine provision is ambiguous — i.e., more than one reasonable interpretation exists and the choice materially affects the output.

**Severity:** High  
**Escalation Level:** Reviewer → Manager; automatic escalation to Partner if the mapping question has precedent implications.  
**Required Resolution:** Manager must document both interpretations, assess materiality of the divergence, and either resolve through doctrinal analysis or escalate to Partner for a binding interpretive decision.

### 3. Governance Ambiguity

**Definition:** It is unclear which governance framework, doctrinal source, or approval workflow applies to the item under review. This differs from uncertain mapping in that the ambiguity is jurisdictional or procedural, not substantive.

**Severity:** High  
**Escalation Level:** Reviewer → Manager  
**Required Resolution:** Manager must determine the correct governance jurisdiction and applicable framework. If jurisdiction is contested between two or more frameworks, escalate to Partner for resolution.

### 4. Unsupported Accounting Treatment

**Definition:** A proposed accounting treatment lacks explicit support in the governing doctrine. It is not explicitly prohibited, but no affirmative doctrinal basis can be cited.

**Severity:** Critical  
**Escalation Level:** Reviewer → Manager → Partner (mandatory Partner review)  
**Required Resolution:** Partner must evaluate whether the treatment is permissible under general principles, document the basis-in-conclusion, and approve or reject with written rationale. Treatments approved under this trigger must carry a permanent "unsupported treatment" provenance tag.

### 5. Commercial Overclaim Risk

**Definition:** A commercial or marketing claim embedded in an output document appears to exceed what the underlying accounting or governance evidence can support. The claim may be technically defensible but presents reputational or regulatory risk.

**Severity:** High  
**Escalation Level:** Reviewer → Manager; automatic escalation to Partner if the claim involves regulated disclosures.  
**Required Resolution:** Manager must compare the claim against the evidence record. If the evidence gap is material, the claim must be withdrawn or amended. If the claim is retained despite the gap, Partner must sign off with a documented risk acceptance.

### 6. Policy Conflict

**Definition:** Two or more applicable policies, doctrinal sources, or governance rules produce contradictory guidance for the same transaction or disclosure.

**Severity:** Critical  
**Escalation Level:** Reviewer → Manager → Partner (mandatory Partner review)  
**Required Resolution:** Partner must resolve the conflict by determining hierarchy of sources, issuing a temporary interpretive ruling, and recording the conflict for doctrinal maintenance review. The resolution must specify which policy governs and why.

### 7. Reviewer Disagreement

**Definition:** Two reviewers at the same authority level reach materially different conclusions on the same item and cannot reconcile their positions after structured discussion.

**Severity:** Medium (becomes High if the disagreement is on a material item)  
**Escalation Level:** Reviewer → Manager  
**Required Resolution:** Manager must review both positions, make a binding decision, and document the rationale for the chosen position. The dissenting reviewer's position must be recorded in the provenance trail.

### 8. Low-Confidence AI Output

**Definition:** An AI-generated governance analysis, classification, or recommendation carries a confidence score below the operational threshold defined for automated acceptance. This trigger applies regardless of whether the AI output is ultimately correct.

**Severity:** Low (becomes Medium if the item is material)  
**Escalation Level:** Reviewer → Manager (if material) or reviewer self-resolution with documented override rationale (if non-material).  
**Required Resolution:** Reviewer must either (a) independently verify and confirm the AI output with documented rationale, or (b) escalate to Manager for human-led analysis. AI outputs escalated under this trigger must carry the low-confidence provenance tag even if ultimately accepted.

## Escalation Levels

### Reviewer (Level 1)

The Reviewer is the first-line governance authority. Reviewers perform initial classification, evidence sufficiency checks, mapping validity assessments, and AI-output verification. A Reviewer may self-resolve only when:
- All evidence thresholds are met.
- The mapping to doctrine is unambiguous.
- AI confidence exceeds the operational threshold.
- No policy conflict or governance ambiguity is present.
- No commercial overclaim risk is identified.

### Manager (Level 2)

The Manager holds broader interpretive authority and may resolve escalations involving weak evidence, uncertain mapping (with documented rationale), governance ambiguity, reviewer disagreement, and low-confidence AI output on material items. The Manager must escalate to Partner when:
- The mapping question has precedent-setting implications.
- The accounting treatment is unsupported.
- A policy conflict exists.
- A commercial overclaim involves regulated disclosures.
- The Manager cannot resolve the escalation to their own satisfaction.

### Partner (Level 3)

The Partner holds final interpretive authority and commercial-signoff authority. Partner-level escalation is mandatory for unsupported accounting treatments, policy conflicts, and commercial overclaim risks involving regulated disclosures. Partner decisions create binding precedent within the governance system and must be recorded with full provenance.

## Goal

Safe operational behavior. The escalation framework exists to ensure that no decision is made at an authority level insufficient to bear its risk. Every escalation is a structured, auditable governance event that moves the system toward a safer resolution state while preserving a complete record of who decided what and why.
