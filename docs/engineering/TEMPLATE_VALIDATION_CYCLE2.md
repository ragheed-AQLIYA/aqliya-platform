# Reference Template Validation — Cycle 2 Readiness

> **Date:** 2026-06-28 | **Method:** Map PRD-01/Specs structure to Account Intelligence domain
> **Decision:** Are Cycle 1 templates general or Opportunity-specific?

---

## PRD Template

| PRD-01 Section | Opportunity Mgmt content | Account Intelligence content | Reusable? |
|---|---|---|---|
| Purpose | Governed commercial deal lifecycle | Governed account intelligence and relationship management | ✅ Structure identical |
| Scope | Deal CRUD, stage transitions, evidence gates, review/approval | Account profiling, ICP scoring, relationship timeline, stakeholder mapping, health scoring, AI briefing | ✅ Structure identical |
| Business Outcomes | Review time ≤ 5d, evidence compliance ≥ 95% | Profile completeness ≥ 90%, ICP score coverage ≥ 80%, health score accuracy ≥ 85% | ✅ Structure identical |
| Product Capability Definition | Reference to Blueprint + ADR + Constitution | Same pattern, different references | ✅ |
| Actors | Sales Rep, Sales Manager, Sales Admin | Account Manager, Relationship Manager, Sales Admin | ✅ Structure identical |
| Functional Requirements | 7 FRs (Create, Update, Transition, Link Evidence, List, Detail, Delete) | Account CRUD, Score Account, Link Contacts, View Timeline, Request Brief | ✅ Structure identical |
| Domain Rules | 9 rules (DR-01 to DR-09) | Account-level rules (active account required, sensitivity levels, contact ownership) | ✅ Structure identical |
| Domain Invariants | 7 invariants | Account invariants (name required, org scoped, status valid) | ✅ Structure identical |
| Aggregate Root | Deal | Account | ✅ Structure identical |
| Workflow | 7-stage state machine with guards | Lighter workflow (active/dormant lifecycle) | ✅ Structure identical |
| Evidence Requirements | Evidence gate for In Review | Evidence links for compliance docs | ✅ Structure identical |
| AI Touchpoints | AI excluded from core, added in Wave 3 | AI brief generation, ICP scoring (core), health scoring | ✅ Structure identical |
| Platform Dependencies | auth, workflow, evidence, event-bus, features | auth, ai, evidence, knowledge, features, event-bus | ✅ Structure identical (different capabilities) |
| APIs | 7 Server Actions | account CRUD, scoreAccount, linkContact, requestBrief | ✅ Structure identical |
| Acceptance Criteria | 12 ACs | ACs mapped to FRs | ✅ Structure identical |
| Test Scenarios | 5 scenarios (happy, gov block, rejection, tenant, audit) | Same categories, domain-adjusted | ✅ Structure identical |
| Traceability | Constitution → ADR → Blueprint → PRD | Same chain | ✅ Structure identical |

**PRD template reuse rate: ~95%** — only domain-specific content changes, structure is fully reusable.

---

## Specification Templates

| Spec | Structure | Account Intelligence adaptation | Reusable? |
|---|---|---|---|
| SPEC-01a (Domain) | Aggregate, Value Objects, Events, Errors, Services, Repository | Account aggregate replaces Deal. Contacts replace deals. HealthScore replaces winProbability. Same VO patterns (Name, ICP, Sensitivity). Same event patterns. Same error hierarchy. | ✅ ~95% |
| SPEC-01b (API) | `ActionResult<T>`, `safe()`, DTO mapping, Authorization, Concurrency, Idempotency, Event publication | Same ActionResult, same safe(), same DTO pattern. Permission names change (`salesos:account.*`). Same concurrency via version. Same idempotency rules. | ✅ ~95% |
| SPEC-01c (Workflow) | State machine, Guard pipeline (Validation→Business→Governance), SLA, Escalation, Recovery | Lighter state machine (Active/Dormant). Same guard pipeline structure. Same SLA pattern (different thresholds). Same compensation. | ✅ ~90% |
| SPEC-01d (UX) | ViewModel layer (DTO→ViewModel), All UX states, Permission-based UI, Stage progress, Arabic-first | Same ViewModel pattern. Same UX states. Same permission model. Account detail replaces Deal detail. Same Arabic-first. | ✅ ~95% |
| SPEC-01e (Tests) | Domain tests, API contract tests, Workflow tests, UX contract tests, CI gates | Same test categories. Different domain entities. Same CI gate structure. Same regression matrix pattern. | ✅ ~95% |

**All 5 specification templates reusable at ≥90%.**

---

## What Changes (Domain-Specific Only)

| Element | Opportunity Mgmt | Account Intelligence |
|---|---|---|
| Aggregate Root | Deal | Account |
| Core Domain Events | DealCreated, DealStageChanged, DealClosedWon/Lost | AccountCreated, AccountScored, AccountStatusChanged, BriefGenerated |
| Value Objects | Amount, Probability, Stage, Currency | Name, IcpScore, Sensitivity, HealthScore |
| State Machine | 7 stages (Draft→...→Closed) | 4 stages (Prospect→Active→Dormant→Archived) |
| Platform Capabilities | workflow, evidence | ai, knowledge (additional) |
| Permissions | salesos:deal.* | salesos:account.* |

---

## Expected Cycle 2 Metrics

| Metric | Target | Rationale |
|---|---|---|
| Template Reuse Rate | ≥95% | Only domain content changes |
| Baseline Changes | 0 | Templates validated |
| New ADRs | 0 | No new architectural decisions needed |
| Architecture Drift | Green | Same discipline, same indicators |

---

## Decision

**Templates validated as general — not Opportunity-specific.** All 6 templates (PRD + 5 Specs) reuse at ≥90%. Cycle 2 can proceed with content change only. Ready for PRD-02: Account Intelligence.
