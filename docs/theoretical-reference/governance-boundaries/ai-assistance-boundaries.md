# AI Assistance Boundaries

## Purpose

Defines the structural boundaries of AI assistance within AQLIYA governed workflows. These boundaries are derived from approved doctrine and enforced at the architecture level. AI assists. Humans decide. Evidence governs.

---

## Permitted AI Actions

| Action | Source Doctrine | Enforcement | Violation Risk |
|--------|----------------|-------------|----------------|
| **Suggest** — Propose findings, recommendations, or actions based on evidence | Part 10 §5 (10.04 §5, 10.01 §6) | AI suggestions carry evidence references and confidence indicators; workflow engine prevents auto-advance into governed states | Hidden authority gradient — AI shapes outcomes without accountable human decision |
| **Classify** — Assign type, risk level, or category to evidence or findings | Part 10 §7, Part 15 §6 | Classification outputs are reviewable and overridable; reviewer must attest before classification enters evidence lifecycle | Systematic bias undetected; professional judgment bypassed by automated labeling |
| **Flag** — Surface anomalies, missing evidence, or policy violations | Part 05 §12, Part 09 §6 | Flags appear as reviewable notifications only; they do not auto-trigger workflow transitions | Critical signals lost in noise; false flags erode reviewer trust in system |
| **Extract candidate evidence** — Identify and surface potential evidence from source data | Part 10 §5, Part 09 §6 | Extracted candidates enter a review queue, not the evidence store; human confirmation required for promotion | Untrusted data enters evidence lifecycle; tainted downstream decisions |
| **Summarize with provenance** — Condense evidence or findings while preserving source traceability | Part 10 §5, Part 09 §5, Part 08 §5 | Summaries must include source references and confidence bounds; summary without provenance is blocked at the data model layer | Reviewer acts on incomplete or misleading synthesis; defensibility of decision collapses |
| **Rank queues** — Order review items by priority, risk, or evidence sufficiency | Part 07 §7, Part 10 §4 | Ranking algorithms are transparent and configurable; reviewer may reorder; override rationale is logged | Unaccountable prioritization distorts review outcomes; low-ranked items systematically ignored |
| **Draft with evidence** — Generate draft findings, reports, or communications anchored to specific evidence | Part 10 §4, Part 15 §6, Part 05 §12 | Drafts are locked as "AI-generated — requires human review" until reviewer attests; workflow gate prevents publication without attestation | Draft enters publication without professional scrutiny; professional liability transfers to platform |

---

## Prohibited AI Actions

| Action | Source Doctrine | Enforcement | Violation Risk |
|--------|----------------|-------------|----------------|
| **Approve** — Grant final authorization on any material decision | Part 10 §2, Part 10 §6, Part 15 §6 | Workflow engine requires human actor with defined authority at every approval joint; AI cannot execute approve transitions | Unaccountable decisions in regulated domains; regulatory and professional liability |
| **Sign** — Execute digital signature or attestation | Part 08 §6, Part 15 §3 | Signature authority is bound to authenticated human identity; system rejects AI-originated signature events | Non-repudiation broken; no attributable human author for legal or regulatory review |
| **Finalize** — Lock a decision, finding, or report as complete and non-draft | Part 07 §8, Part 05 §12 | Finalize transitions require human decision at a decision joint; AI cannot trigger final state transitions | Irreversible actions without human accountability; rework and reputation damage |
| **Conclude** — Determine materiality, sufficiency, or final judgment | Part 15 §2, Part 15 §6, Part 10 §2 | Conclusion is a human-only decision joint; AI outputs are labeled as recommendations, never conclusions | Professional judgment replaced by statistical inference; no one bears liability for the conclusion |
| **Bypass human** — Route around a required human decision point | Part 10 §3, Part 07 §4, Part 01 §5 | Decision joints are architecturally unskippable; no automation or role configuration can remove a human-required transition | Governance theater — humans nominally in loop but structurally excluded |
| **Operate as black-box** — Produce outputs without explainable reasoning or evidence trace | Part 10 §11, Part 08 §4, Part 18 §10 | Every AI output carries metadata: evidence references, reasoning trace, confidence calibration, limitation disclosure | Outputs cannot be challenged or verified; trust in system erodes; regulatory non-compliance |

---

## Boundary Enforcement Summary

| Layer | Enforcement Mechanism |
|-------|----------------------|
| Workflow engine | Decision joints cannot be occupied by AI; state transitions requiring human authority are structurally enforced |
| Data model | AI-generated content is typed distinctly from human-confirmed content; provenance metadata is mandatory |
| Governance evaluator | Boundary violations are governance events requiring review; they are not user errors or configuration warnings |
| Audit trail | Every AI-human interaction point records boundary status (within/breached), actor identity, and override rationale |

## Doctrine Sources

- Part 10 — Human + AI Operating Model (10.01 Thesis, 10.04 AI Assistance Theory, 10.05 Reviewer Trust Theory, 10.10 Evidence-Backed AI Theory, 10.11 Black-Box AI Rejection Doctrine)
- Part 15 — Responsible Intelligence Doctrine (15.01, 15.02, 15.03, 15.04, 15.06)
- Part 08 — Governance & Trust (08.01 Thesis, 08.04 Explainability Doctrine, 08.06 Accountability Doctrine, 08.10 AI Governance Doctrine)
- Part 05 — Audit Intelligence (05.01 Thesis, 05.12 Audit Review Lifecycle)
- Part 07 — Workflow Intelligence (07.01 Theory, 07.04 Human-In-The-Loop Theory, 07.07 Review Lifecycle, 07.08 Approval Lifecycle)
- Part 09 — Data Trust & Data Quality (09.01 Theory, 09.05 Data Provenance Theory, 09.06 Data Quality Scoring Theory)
- Part 01 — Foundational Doctrine (01.01 Foundational Thesis, 01.05 AI-Native Enterprise Infrastructure Thesis)
- Part 18 — Anti-Patterns (18.01 AI Wrapper Anti-Pattern)

---

*This document is governed doctrine. No feature, model update, or commercial requirement may override these boundaries without a formal doctrine amendment.*
