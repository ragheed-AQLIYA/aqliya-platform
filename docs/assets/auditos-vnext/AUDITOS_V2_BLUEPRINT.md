# AuditOS vNext — Product Blueprint (CPV-001 Phase 1)

> **Status:** Draft v0.1 | **Date:** 2026-06-28
> **Program:** CPV-001 (Cross-Product Validation)
> **Purpose:** Validate Engineering Standard v1.0 on a product outside SalesOS — not to design AuditOS in isolation.

---

## 1. Vision

AuditOS vNext is a governed audit intelligence platform that enables audit firms to plan, execute, review, and report on financial audits in compliance with Saudi regulatory standards (SOCPA, ISA).

It is the **second Reference Product** built on the AQLIYA Platform Kernel. Its purpose is **not** only to deliver AuditOS, but to **validate** that the Engineering Standard v1.0 generalizes beyond SalesOS.

### Validation Hypothesis

> The Engineering Standard v1.0 (Constitution, ADRs, Templates, ERR) remains valid when applied to AuditOS vNext without baseline modification.

---

## 2. Product Boundaries

### In Scope

| Area | Description |
|---|---|
| Engagement Management | Create, plan, execute, review, report audit engagements |
| Client Management | Client profiles, acceptance/continuance, independence checks |
| Working Papers | Structured evidence collection linked to audit programs |
| Audit Procedures | ISA-compliant procedure steps with sign-off |
| Findings Management | Identify, document, review, resolve audit findings |
| Materiality Engine | Compute and track materiality thresholds |
| Sampling | Statistical and judgmental sampling with documentation |
| Review & Approval | Multi-level review (senior → manager → partner) |
| Reporting | Draft audit opinion, management letter, disclosure checklists |
| Regulatory Compliance | SOCPA, ISA, IFRS compliance tracking |

### Out of Scope (v2.0)

| Area | Rationale |
|---|---|
| Full IFRS taxonomy | Complexity postponed to v2.1+ |
| Real-time auditor collaboration | Platform infrastructure dependency |
| Automated TB import from all ERPs | Integration scope, v2.1+ |

---

## 3. Business Capabilities

| Business Capability | Platform Capability | AuditOS Consumption |
|---|---|---|
| Identity & Access | `platform.auth` | RBAC per engagement role (auditor, manager, partner) |
| Business Workflow | `platform.workflow` | Engagement lifecycle (10+ non-linear stages) |
| Governed AI | `platform.ai` | Risk scoring, materiality, disclosure drafting, finding assist |
| Evidence & Audit | `platform.evidence` | Chain-of-custody, regulatory retention, multi-level linking |
| Cross-Product Events | `platform.event-bus` | Engagement state changes, finding resolution |
| Institutional Knowledge | `platform.knowledge` | Audit programs, regulatory rules, prior year data |
| Feature Rollout | `platform.features` | Phased rollout of AI features |

---

## 4. Domain Model

| Domain | Aggregate Root | Description |
|---|---|---|
| **Engagement** | Engagement | Audit engagement — client, period, team, status, materiality |
| **Client** | Client | Audit client — entity info, industry, risk profile, acceptance status |
| **Finding** | Finding | Audit finding — description, risk, evidence links, resolution |
| **Workpaper** | Workpaper | Evidence document — procedure, conclusion, reviewer sign-off |
| **Procedure** | Procedure (VO) | Audit step — description, ISA ref, sampling, conclusion |
| **Materiality** | Materiality | Planning/performance/clearly trivial thresholds |
| **Sample** | Sample (VO) | Selected items for testing — method, size, results |

**Aggregate boundaries:** Engagement owns the lifecycle. Workpapers and Findings are aggregates referenced by Engagement. Client is an independent aggregate.

---

## 5. Platform Capability Adoption

| Capability | Adoption Pattern | SalesOS Difference |
|---|---|---|
| `platform.auth` | Engagement-scoped RBAC (auditor, manager, partner, reviewer) | ✅ Same contract, richer role model |
| `platform.workflow` | Non-linear state machine with loops (plan → fieldwork → review → revise → re-review) | ✅ **New test** — SalesOS was linear |
| `platform.evidence` | Chain-of-custody linking: finding → workpaper → evidence → client source. Regulatory retention periods | ✅ **New test** — heavier linking |
| `platform.ai` | Risk scoring from TB, materiality computation, disclosure draft, finding assist | ✅ **New pattern** — regulatory AI |
| `platform.event-bus` | Engagement lifecycle events, finding resolution events | ✅ Same contract, new events |
| `platform.knowledge` | Audit programs, ISA rules, prior year data | ✅ Required (SalesOS had it optional) |

---

## 6. Product Workflows

### Engagement Lifecycle (High-Level)

```
Proposal → Acceptance → Planning → Risk Assessment
    → Fieldwork → Review → Reporting → Sign-off → Archival
        ↑_________| (review → revise loop)
```

| Stage | Key Action | Guard |
|---|---|---|
| Proposal | Create engagement | Client exists |
| Acceptance | Independence check, risk rating | Partner approval |
| Planning | Materiality set, audit program defined | Manager approval |
| Risk Assessment | Risk scoring, fraud discussion | Team meeting documented |
| Fieldwork | Procedure execution, workpaper completion | Evidence linked |
| Review | Workpaper review → finding identification | Senior → manager → partner |
| Reporting | Draft opinion, management letter | Partner sign-off |
| Sign-off | Final approval | Quality review required |
| Archival | Lock engagement | Regulatory retention period set |

---

## 7. AI Architecture

| AI Feature | Input | Governance | SalesOS Difference |
|---|---|---|---|
| Risk Scoring | TB data, industry, prior findings | confidence + model + reviewer check | ✅ Different input |
| Materiality Suggestion | TB, benchmarks | Human override required | ✅ Different computation |
| Disclosure Drafting | FS data, IFRS taxonomy | Reviewed by senior auditor | ✅ Different output |
| Finding Assistance | Workpaper evidence | Confidence + suggested finding + human review | ✅ Different format |

**AI Governance Model** follows the same governance template: confidence score, model metadata, human review status, disclaimer (AR+EN). Additional fields for regulatory audit may be needed (explainability, SOCPA compliance metadata).

---

## 8. Evidence Architecture

### Chain of Custody

```
Engagement
    ↓
    └── Finding
            ↓
            └── Workpaper
                    ↓
                    └── Evidence (Platform Evidence Network)
                            ↓
                            └── Client Source Document
```

### Regulatory Retention

| Evidence Type | Minimum Retention | Audit Trigger |
|---|---|---|
| Working papers | 5 years (SOCPA) | Engagement archival |
| Audit opinion | 10 years (regulatory) | Report sign-off |
| Client communication | 5 years | Per engagement |
| Independence documentation | 7 years | Annual |

**Evidence linking uses the same `platform.evidence` contract** but with additional metadata fields for chain-of-custody and retention. If the existing contract cannot support this, an ADR will be filed.

---

## 9. Success Metrics

| Metric | Target |
|---|---|
| Template Reuse (vs SalesOS) | ≥90% |
| Constitution Changes | 0 |
| ADRs due to framework weakness | 0 |
| Architecture Drift (Red) | 0 |
| Traceability Coverage | 100% |
| Platform Logic Leakage | 0 |

---

## 10. Traceability

| Element | Constitution | ADR | SalesOS Equivalent |
|---|---|---|---|
| Engagement Aggregate | P1 (Independence) | ADR-001, ADR-015 | Deal → Engagement |
| Workflow (non-linear) | P2 (Neutrality) | ADR-001 | 7-stage linear → 9-stage with loop |
| Evidence Chain | P5 (Extraction) | ADR-001 | Simple link → multi-level chain |
| AI Governance | P12 (Business First) | ADR-003 | Brief → Risk/Disclosure |
| Platform Consumption | P1 (Independence) | ADR-001 | Same contracts |

---

## Blueprint Review Checklist

| Question | Status |
|---|---|
| Any Platform bypass? | ⬜ |
| Any coupling with SalesOS? | ⬜ |
| Any Constitution change needed? | ⬜ |
| Any new ADR needed? | ⬜ |
| Any template gap found? | ⬜ |

---

## Document Metadata

- **Author:** OpenCode | **Program:** CPV-001 Phase 1
- **Version:** 0.1 | **Template:** SalesOS v2 Blueprint (adapted)
- **Template Reuse Target:** ≥90%
- **Status:** Draft — ready for review
