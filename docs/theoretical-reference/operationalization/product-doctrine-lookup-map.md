# Product Doctrine Lookup Map

This document maps each AQLIYA product line to its governing doctrine layers, principles, decision boundaries, and related system-intelligence documentation from Phase 3.

---

## AuditOS

### Purpose
Automated audit workflow orchestration, evidence collection, control testing, and audit report drafting for Islamic finance institutions. Operates within Shariah, regulatory, and professional audit standards.

### Relevant Doctrine Layers
- **Layer 1 — Epistemic Foundation:** Islamized epistemology (tawhidic coherence, adab-aligned inquiry)
- **Layer 2 — Governance Layer:** Shariah audit governance, AAOIFI governance standards, ISSB/IFRS S1-S2 alignment
- **Layer 3 — Evidence & Judgment:** Islamic evidentiary hierarchy (bayyinah, qarinah, ta'arud wa tarjih rules)
- **Layer 4 — Operational Constraints:** Professional independence, materiality thresholds, fraud escalation protocols
- **Layer 5 — Human Oversight:** Auditor-in-charge sign-off, partner review chain, regulatory reporting obligations

### Governance Principles
- Audit independence is non-negotiable; the system must flag conflicts of interest
- Shariah compliance findings carry separate authority from conventional regulatory findings
- All automated opinions must be traceable to source evidence with an auditable chain
- Materiality thresholds are configurable per engagement but bounded by professional standards
- Peer review workflows require designated qualified reviewers (not automatable)

### Evidence Principles
- Evidence classification: conclusive (qat'i), probable (zanni), circumstantial (qarinah)
- Conflicting evidence (ta'arud) must be escalated for human reconciliation
- Sampling methodology must be disclosed and justified in every workpaper
- Evidence sufficiency is a professional judgment — the system can quantify but not certify
- Digital evidence chain-of-custody metadata must be preserved immutably

### Human Decision Boundaries
| Domain | AI Role | Human Role |
|---|---|---|
| Control classification | Suggest | Approve |
| Finding severity rating | Recommend | Decide |
| Materiality judgment | Calculate | Override with rationale |
| Fraud indicators | Flag | Investigate & conclude |
| Final audit opinion | Draft language | Sign & issue |
| Engagement acceptance | Risk score | Accept/decline |

### Commercial Positioning Boundaries
- AuditOS is a **software-as-a-service** tool; it does not replace the audit firm's legal entity obligations
- Output branding must clearly indicate "AI-assisted draft" until human approval is recorded
- Professional liability insurance coverage depends on human sign-off; this must be communicated to users
- Pricing model must reflect that ultimate accountability rests with the human auditor, not the tool
- Market claims must not imply certification, guarantee, or replacement of professional judgment

### Related Phase 3 System-Intelligence Docs
- `system-intelligence/auditos/evidence-classification-model.md`
- `system-intelligence/auditos/shariah-control-taxonomy.md`
- `system-intelligence/auditos/materiality-calibration-algorithm.md`
- `system-intelligence/common/human-sign-off-state-machine.md`
- `system-intelligence/common/evidence-chain-immutability.md`

---

## DecisionOS

### Purpose
Decision-support platform for Islamic financial institutions covering product structuring, risk assessment, capital allocation, and Shariah-compliant investment screening.

### Relevant Doctrine Layers
- **Layer 1 — Epistemic Foundation:** Maqasid al-Shariah as decision filter, maslahah-mafsadah calculus
- **Layer 2 — Governance Layer:** Shariah board authority, regulatory capital rules (IFSB, Basel), institutional risk appetite
- **Layer 3 — Evidence & Judgment:** Fatwa hierarchy, market data interpretation, counterparty due diligence
- **Layer 4 — Operational Constraints:** Position limits, concentration risk, liquidity buffers, halal universe filters
- **Layer 5 — Human Oversight:** Shariah committee approval, risk committee sign-off, board-level authorizations

### Governance Principles
- Shariah board resolutions are binding inputs; the system cannot override or reinterpret fatwa
- Risk appetite metrics are set by the institution's board; the system enforces but does not set them
- Capital allocation decisions above delegable thresholds require committee-level human approval
- Screening methodology (negative/positive) must be configured at institution level, not per-transaction
- All decisions must be replayable — full input-to-output traceability for regulatory examination

### Evidence Principles
- Shariah ruling source (fatwa, ijtihad, qiyas) must be cited for every compliance determination
- Market data provenance: exchange-sourced, broker-quoted, or estimated — disclosed per data point
- Counterparty risk ratings must reference both conventional credit scores and Shariah qualitative factors
- Contradictory signals (e.g., compliant per AAOIFI but non-compliant per local shariah board) must surface both
- Sensitivity analysis inputs and assumptions must be transparent and challengeable

### Human Decision Boundaries
| Domain | AI Role | System Role |
|---|---|---|
| Product structuring proposal | Generate alternatives | Approve final structure |
| Risk exposure calculation | Compute & visualize | Set limits & override |
| Shariah screening | Apply rules | Configure rules & handle grey cases |
| Capital allocation | Optimize within constraints | Set constraints & approve allocations |
| Investment recommendation | Score & rank | Accept/reject & document rationale |
| Stress testing | Run scenarios | Design scenarios & interpret results |

### Commercial Positioning Boundaries
- Decision OS provides **recommendations**, not executable orders; trade execution is a separate controlled layer
- Disclaimers must state that historical optimization does not guarantee future outcomes
- Responsibility for losses rests with the institution's decision-makers, not the software
- Competitor differentiation: Shariah-native decision logic vs. conventional platforms with Islamic "add-ons"
- Regulatory disclosure: if model output influences published financial statements, the model must be registered

### Related Phase 3 System-Intelligence Docs
- `system-intelligence/decision-os/maqasid-decision-filter.md`
- `system-intelligence/decision-os/fatwa-resolution-engine.md`
- `system-intelligence/decision-os/halal-universe-screener.md`
- `system-intelligence/decision-os/capital-optimization-constraints.md`
- `system-intelligence/common/decision-replay-engine.md`

---

## Commercial Operating System

### Purpose
End-to-end operational platform for the AQLIYA commercial entity itself — billing, client lifecycle, contract management, resource scheduling, and internal compliance.

### Relevant Doctrine Layers
- **Layer 1 — Epistemic Foundation:** Amanah (trust) principle in commercial dealings, full disclosure (suhubah)
- **Layer 2 — Governance Layer:** Corporate governance code, partner agreements, regulatory licenses
- **Layer 3 — Evidence & Judgment:** Contract enforceability, client acceptance risk, engagement scoping
- **Layer 4 — Operational Constraints:** Revenue recognition rules, data residency, confidentiality agreements
- **Layer 5 — Human Oversight:** Managing partner approvals, legal review gates, client acceptance committee

### Governance Principles
- Client confidentiality walls must be programmatically enforced across engagements
- Revenue recognition must follow applicable accounting standards and local regulations
- Contract amendments require authorized signatory approval — no auto-renewal or auto-scoping
- Resource allocation must not create conflicts (same team member on competing clients)
- Internal compliance self-monitoring must be subject to external audit

### Evidence Principles
- Client communications relevant to scope or billing must be retained in system of record
- Time recording is evidence for billing; aggregate patterns may be analyzed, individual entries require human attestation
- Engagement acceptance risk scoring uses objective criteria; override requires documented rationale
- Contract metadata (parties, scope, fees, term) is structured; full text is reference

### Human Decision Boundaries
| Domain | AI Role | Human Role |
|---|---|---|
| Client risk scoring | Calculate & flag | Accept/reject client |
| Resource scheduling | Optimize & propose | Confirm & handle exceptions |
| Invoice generation | Draft from timesheets | Review & approve before send |
| Contract expiry monitoring | Alert | Decide renew/amend/terminate |
| Internal compliance checks | Auto-monitor | Investigate & remediate |
| Pricing proposals | Calculate cost-based floor | Set final price |

### Commercial Positioning Boundaries
- The COS is an **internal** system; its design decisions reflect AQLIYA's commercial strategy, not a productized offering
- Data segregation between AQLIYA's own operations and any client-audit data is architecturally mandatory
- Internal system boundaries must mirror the organizational chart of authority
- COS may serve as a reference architecture for an eventual "Practice Management" product but is not one today

### Related Phase 3 System-Intelligence Docs
- `system-intelligence/commercial/client-lifecycle-state-machine.md`
- `system-intelligence/commercial/revenue-recognition-rules-engine.md`
- `system-intelligence/commercial/resource-conflict-detector.md`
- `system-intelligence/commercial/contract-amendment-workflow.md`

---

## Pilot Management System

### Purpose
System for planning, executing, and evaluating pilot engagements with early-adopter clients. Captures feedback, measures system performance, and gates progression to production readiness.

### Relevant Doctrine Layers
- **Layer 1 — Epistemic Foundation:** Tawaqquf (suspension of judgment) where evidence is insufficient; iterative learning
- **Layer 2 — Governance Layer:** Pilot agreement terms, data handling restrictions, client consent framework
- **Layer 3 — Evidence & Judgment:** Performance benchmarking criteria, feedback classification, readiness gates
- **Layer 4 — Operational Constraints:** Sandboxed environment boundaries, live-data prohibitions, client communication protocols
- **Layer 5 — Human Oversight:** Pilot review board, production gate approval, client escalation paths

### Governance Principles
- Pilot data must never flow into production models without explicit decommissioning and re-validation
- Client consent for pilot participation is specific and time-bound — not a blanket R&D authorization
- Feedback that reveals product deficiencies must trigger root-cause analysis before remediation
- Production readiness gates are human-decided; the system provides evidence and recommendations only
- Pilot exit criteria (success, extension, termination) must be defined before pilot commencement

### Evidence Principles
- Pilot outcomes are classified: validated, inconclusive, refuted — per hypothesis
- Client feedback is primary evidence; system telemetry is corroborating evidence
- False positive / false negative rates must be tracked per feature with confidence intervals
- User satisfaction metrics require direct human collection; inferred satisfaction from interaction data is supplementary
- All pilot findings must be preserved as a knowledge base for future product development

### Human Decision Boundaries
| Domain | AI Role | Human Role |
|---|---|---|
| Pilot scope definition | Propose hypotheses | Approve scope & success criteria |
| Client matching | Score fit | Select & approach clients |
| Feedback categorization | Auto-classify | Validate classification & add context |
| Readiness assessment | Compute metrics | Decide go/no-go for production |
| Incident response | Detect & alert | Triage, investigate, resolve |
| Pilot termination | Recommend | Decide & communicate to client |

### Commercial Positioning Boundaries
- Pilot terms must explicitly state that the system is under evaluation and may produce errors
- No fees may be charged for pilot-influenced outputs without explicit pilot agreement provisions
- Pilot clients must receive a clear path to exit without penalty if the system does not meet expectations
- Marketing use of pilot results requires client consent and must not overstate statistical significance
- Internal pilot (dogfooding) results must be clearly distinguished from external client pilot results

### Related Phase 3 System-Intelligence Docs
- `system-intelligence/pilot/hypothesis-tracking-model.md`
- `system-intelligence/pilot/readiness-gate-criteria.md`
- `system-intelligence/pilot/feedback-classification-engine.md`
- `system-intelligence/pilot/pilot-data-sandbox-architecture.md`
- `system-intelligence/pilot/production-gate-decision-protocol.md`

---

## Future Product Lines

### Purpose
Anticipated product expansions derived from AQLIYA's intellectual property, market demand signals, and strategic roadmap. Doctrine mapping ensures future products align with foundational principles from inception.

### Relevant Doctrine Layers
- **Layer 1 — Epistemic Foundation:** All future products must ground in the same Islamized epistemological framework
- **Layer 2 — Governance Layer:** Product-specific governance models must be defined before development begins
- **Layer 3 — Evidence & Judgment:** New evidence taxonomies and judgment frameworks are inherited, then specialized
- **Layer 4 — Operational Constraints:** Boundary conditions must be established during concept phase, not retrofitted
- **Layer 5 — Human Oversight:** Human accountability points must be designed into the architecture before code is written

### Governance Principles
- New product lines require a formal Product Doctrine Charter before entering Phase 1 development
- Each product must identify its unique doctrine layer specializations while inheriting common layers
- Product-specific Shariah board engagement terms must be documented (standing approval, per-product review, advisory only)
- Cross-product interactions (e.g., AuditOS findings feeding into Decision OS risk models) require interface governance agreements
- Product sunset or pivot decisions must preserve doctrinal learnings for the organization's knowledge base

### Evidence Principles
- Market demand signals must distinguish between validated need, expressed interest, and speculative assumption
- Competitive landscape analysis must be evidence-based — not hearsay or vendor claims
- Product feasibility evidence must cover: technical, Shariah, regulatory, commercial, and operational dimensions
- Build-buy-partner decisions require comparative evidence of doctrinal alignment, not just cost or speed
- Pre-development user research must follow ethical data collection standards consistent with Islamic principles

### Human Decision Boundaries
| Domain | AI Role | Human Role |
|---|---|---|
| Product concept generation | Synthesize market signals & IP | Select which concepts to pursue |
| Feasibility analysis | Model dimensions & trade-offs | Interpret results & decide |
| Doctrine mapping | Propose doctrine layer inheritance | Approve doctrine charter |
| Build vs. buy vs. partner | Cost & risk analysis | Strategic decision |
| Investment case | Project returns & risks | Approve funding |
| Launch readiness | Assess against gate criteria | Authorize launch |

### Commercial Positioning Boundaries
- Future products must define their positioning relative to existing AQLIYA products (complementary, overlapping, or independent)
- White-label, OEM, and reseller models require separate doctrine consideration from direct-to-market products
- Geographic expansion products must address jurisdiction-specific regulatory and Shariah variances
- Future products should not undermine the commercial positioning of existing products without explicit strategic review

### Related Phase 3 System-Intelligence Docs
- `system-intelligence/future/product-doctrine-charter-template.md`
- `system-intelligence/future/cross-product-interface-governance.md`
- `system-intelligence/future/market-signal-validation-framework.md`
- `system-intelligence/future/build-buy-partner-decision-model.md`
- `system-intelligence/common/doctrine-inheritance-taxonomy.md`

---

## Cross-Cutting References

| Principle | Docs |
|---|---|
| Human accountability architecture | `system-intelligence/common/human-sign-off-state-machine.md` |
| Evidence immutability & chain of custody | `system-intelligence/common/evidence-chain-immutability.md` |
| Decision replayability | `system-intelligence/common/decision-replay-engine.md` |
| Doctrine inheritance taxonomy | `system-intelligence/common/doctrine-inheritance-taxonomy.md` |
| Shariah governance integration | `system-intelligence/common/shariah-governance-interface.md` |

---

*This document is part of the AQLIYA theoretical reference library. All product doctrine mappings must be reviewed and approved by the Product Doctrine governance body before binding application.*
