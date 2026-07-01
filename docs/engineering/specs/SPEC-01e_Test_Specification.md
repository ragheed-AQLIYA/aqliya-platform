# SPEC-01e: Test Specification — Opportunity Management

> **Status:** Draft v0.1 | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Test Specification — defines the complete test strategy for Opportunity Management, covering Domain, API, Workflow, UX, Integration, Governance, Observability, and Performance.
> **Parent:** `SPECIFICATION-01_Opportunity_Management.md` → `PRD-01_Opportunity_Management.md` v1.0 (FROZEN)
> **Depends On:** `SPEC-01a_Domain_Specification.md` v1.0, `SPEC-01b_API_Specification.md` v1.0, `SPEC-01c_Workflow_Specification.md` v1.0, `SPEC-01d_UX_Specification.md` v1.0
> **Next:** Engineering Readiness Review → Implementation-01
> **Status:** This is the final specification before implementation. After this: Engineering Readiness Review, then code.

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | SPEC-01a (Domain), SPEC-01b (API), SPEC-01c (Workflow), SPEC-01d (UX) — all FROZEN v1.0 |
| **Blocks** | Engineering Readiness Review, Implementation-01 |
| **Consumer** | QA Engineering Team, CI/CD Pipeline |

---

## Inputs

| Input | Source | Section Reference |
|---|---|---|
| Domain invariants, value objects, domain events | SPEC-01a | §1.3 (Invariants), §2 (Value Objects), §3 (Domain Events) |
| Server Action contracts, error codes, pagination | SPEC-01b | §2 (All Actions), §1.2 (Error Mapping), §6 (Pagination) |
| State machine, guards, SLA, escalation, recovery | SPEC-01c | §1 (State Machine), §2 (Guards), §3 (Evidence Gates), §4 (SLA), §7 (Recovery) |
| UX states, ViewModels, accessibility, navigation | SPEC-01d | §1 (UX States), §10 (ViewModels), §13 (Accessibility) |
| Acceptance criteria, test scenarios | PRD-01 | §13 (12 ACs), §14 (5 Test Scenarios) |
| Domain errors, error mapping | SPEC-01a §4, SPEC-01b §1.2 | Domain Error Model, Error Mapping |
| Observability matrix | PRD-01 | §14b (11 actions with metric/log/trace/audit) |

---

## Outputs

| Output | Description | Consumer |
|---|---|---|
| Test plan | Complete test strategy across all test types | QA Team |
| Test case inventory | All test cases mapped to requirements | QA Team, CI |
| Regression matrix | Traceability from PRD AC → test → code | Engineering |
| CI/CD test gates | What runs when, pass/fail criteria | CI Pipeline |
| Coverage targets | Minimum coverage per test type | Engineering |

---

## Dependencies

| Dependency | Type | Impact if Missing |
|---|---|---|
| SPEC-01a through SPEC-01d | Documents | No contracts to test against |
| PRD-01 | Document | No acceptance criteria to validate |
| Platform Kernel contracts | Runtime | No services to integrate with |
| CI/CD infrastructure | Infrastructure | No automated test execution |

---

# 1. Test Strategy Overview

## 1.1 Test Pyramid

```text
                    ╱╲
                   ╱  ╲
                  ╱ E2E╲              ← 5% — Critical user journeys
                 ╱──────╲
                ╱        ╲
               ╱Integration╲           ← 15% — Domain ↔ API ↔ Workflow
              ╱────────────╲
             ╱              ╲
            ╱   Contract     ╲         ← 30% — API contracts, ViewModels, Guards
           ╱──────────────────╲
          ╱                    ╲
         ╱    Unit / Domain     ╲       ← 50% — Value Objects, Invariants, Services
        ╱────────────────────────╲
```

## 1.2 Test Categories

| Category | Coverage Target | Run Frequency | Failure Impact |
|---|---|---|---|
| Domain Tests | 95%+ | Every commit | Blocks PR |
| API Contract Tests | 95%+ | Every commit | Blocks PR |
| Workflow Tests | 95%+ | Every commit | Blocks PR |
| UX Contract Tests | 90%+ | Every commit | Blocks PR |
| Integration Tests | 85%+ | Every PR | Blocks merge |
| Governance Tests | 100% | Every PR | Blocks merge |
| Observability Tests | 90%+ | Daily | Alert |
| Performance Tests | — | Weekly | Non-blocking |

---

# 2. Domain Tests

**Source:** SPEC-01a (Domain Specification)
**Focus:** Value Objects, Invariants, Domain Events, Aggregate behavior
**Level:** Unit tests — no external dependencies, no database, no network

## 2.1 Value Object Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| `Amount.create(0, "SAR")` | DI-01: amount >= 0 | SPEC-01a §2 |
| `Amount.create(-1, "SAR")` | DI-01: throws BusinessRuleError | SPEC-01a §2 |
| `Amount.create(100, "INVALID")` | Currency validation: 3-letter ISO | SPEC-01a §2 |
| `Amount.create(100, "SAR").add(Amount.create(50, "SAR"))` | Amount addition: same currency | SPEC-01a §2 |
| `Amount.create(100, "SAR").add(Amount.create(50, "USD"))` | Amount addition: different currency throws | SPEC-01a §2 |
| `Probability.create(0)` | DI-02: minimum valid | SPEC-01a §2 |
| `Probability.create(100)` | DI-02: maximum valid | SPEC-01a §2 |
| `Probability.create(-1)` | DI-02: throws BusinessRuleError | SPEC-01a §2 |
| `Probability.create(101)` | DI-02: throws BusinessRuleError | SPEC-01a §2 |
| `Probability.create(50).asDecimal()` | Returns 0.5 | SPEC-01a §2 |
| `Stage.create("Draft")` | Valid stage | SPEC-01c §1.2 |
| `Stage.create("Invalid")` | Invalid stage throws ValidationError | SPEC-01c §1.2 |
| `Stage.create("Closed Won").isClosed` | Returns true | SPEC-01c §1.2 |
| `Currency.SAR.equals(Currency.create("SAR"))` | Currency equality | SPEC-01a §2 |

## 2.2 Invariant Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| Create Deal with amount < 0 | DI-01 enforced | SPEC-01a §1.3 |
| Create Deal with probability > 100 | DI-02 enforced | SPEC-01a §1.3 |
| Create Deal without accountId | DI-03 enforced | SPEC-01a §1.3 |
| Update closed deal | DI-05 enforced: immutable | SPEC-01a §1.3 |
| Transition to invalid stage | DI-06 enforced | SPEC-01a §1.3 |
| Evidence count inconsistency detected | DI-07: computed on read | SPEC-01a §1.3 |

## 2.3 Domain Event Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| `DealCreated` event shape | All fields present, eventVersion = 1 | SPEC-01a §3 |
| `DealStageChanged` event shape | fromStage, toStage, action, actorId | SPEC-01a §3 |
| `DealClosedWon` event shape | amount, currency, accountId, closedAt | SPEC-01a §3 |
| Event sequence on happy path | 7 events published in correct order | PRD-01 §14 Scenario 1 |
| Event type matches action | `submit_for_review` → correct event type | SPEC-01c §1.3 |

## 2.4 Domain Error Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| `ValidationError` has correct code | code = "VALIDATION_ERROR", recoverable = true | SPEC-01a §4 |
| `BusinessRuleError` has correct code | code = "BUSINESS_RULE_FAILED", recoverable = true | SPEC-01a §4 |
| `GovernanceBlockedError` has correct code | code = "GOVERNANCE_BLOCKED", recoverable = true, guardType present | SPEC-01a §4 |
| `ConcurrencyError` has correct code | code = "CONFLICT", recoverable = true, versions present | SPEC-01a §4 |
| `NotFoundError` has correct code | code = "NOT_FOUND", recoverable = false | SPEC-01a §4 |

---

# 3. API Contract Tests

**Source:** SPEC-01b (API Specification)
**Focus:** Server Actions, Error mapping, Authorization, Idempotency, Concurrency
**Level:** Contract tests — mock domain layer, test API translation only

## 3.1 Server Action Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| `createDealAction` with valid input | Returns `{ ok: true, data: DealResponse }` | PRD-01 §6 FR-01 |
| `createDealAction` with missing accountId | Returns `VALIDATION_ERROR` | SPEC-01b §2.1 |
| `createDealAction` without permission | Returns `FORBIDDEN` | SPEC-01b §1.5 |
| `transitionDealAction` valid transition | Returns updated DealResponse | PRD-01 §6 FR-03 |
| `transitionDealAction` blocked by guard | Returns `GOVERNANCE_BLOCKED` with details | SPEC-01c §2 |
| `transitionDealAction` idempotent | Second call with same params returns success without side effects | SPEC-01b §2.2 |
| `transitionDealAction` version mismatch | Returns `CONFLICT` | SPEC-01b §4 |
| `listDealsAction` with filters | Returns filtered, paginated response | PRD-01 §6 FR-05 |
| `listDealsAction` empty result | Returns `{ items: [], page: 1, hasNext: false }` | SPEC-01b §6 |
| `getDealAction` not found | Returns `NOT_FOUND` | SPEC-01b §2.8 |
| `deleteDealAction` by admin | Success, deal archived | PRD-01 §6 FR-07 |

## 3.2 Authorization Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| Sales Rep can create deal | Permission: `salesos:deal.create` | SPEC-01b §1.5 |
| Sales Rep cannot approve deal | Permission: `salesos:deal.approve` missing | SPEC-01b §1.5 |
| Sales Manager can approve deal | Permission: `salesos:deal.approve` present | SPEC-01b §1.5 |
| Sales Admin can delete deal | Permission: `salesos:deal.admin` present | SPEC-01b §1.5 |
| Cross-tenant access blocked | User from Org A cannot access Org B's deals | SPEC-01b §1.4 (AuthContext) |

## 3.3 Concurrency Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| Version increment on create | New deal has version = 1 | SPEC-01b §4 |
| Version increment on update | After update, version = previous + 1 | SPEC-01b §4 |
| Concurrent update — first wins | First request succeeds, second gets CONFLICT | SPEC-01b §4 |
| Stale version rejected | Request with version < current gets CONFLICT | SPEC-01b §4 |

---

# 4. Workflow Tests

**Source:** SPEC-01c (Workflow Specification)
**Focus:** State machine, transition guards, evidence gates, SLA rules, escalation, recovery
**Level:** Unit + Integration tests — mock external dependencies

## 4.1 State Machine Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| All 7 transitions succeed with valid preconditions | Full happy path: Draft → Qualified → In Review → Approved → Negotiation → Closed Won | PRD-01 §14 Scenario 1 |
| Invalid transition (skip stage) blocked | Draft → In Review: cannot skip Qualified | SPEC-01c §1.2 |
| Terminal state immutability | Closed Won → Draft: blocked | SPEC-01a DI-05 |
| `close_lost` from multiple stages | From: Negotiation, Qualified, In Review, Approved — all allowed | SPEC-01c §1.2 |

## 4.2 Guard Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| `accountMustBeActive` — active account | Guard passes | SPEC-01c §2.2 |
| `accountMustBeActive` — dormant account | Guard fails with BUSINESS_RULE_FAILED | SPEC-01c §2.2 |
| `evidenceGate` — sufficient evidence | Guard passes | SPEC-01c §2.3 |
| `evidenceGate` — insufficient evidence | Guard fails with GOVERNANCE_BLOCKED + details | SPEC-01c §2.3 |
| `reviewerNotOwner` — different users | Guard passes | SPEC-01c §2.4 |
| `reviewerNotOwner` — same user | Guard fails with BUSINESS_RULE_FAILED | SPEC-01c §2.4 |
| `approvalAuditComplete` — audit exists | Guard passes | SPEC-01c §2.5 |
| `approvalAuditComplete` — no audit | Guard fails with GOVERNANCE_BLOCKED | SPEC-01c §2.5 |
| Guard pipeline — ordered execution | Validation → Business → Governance — fail fast | SPEC-01c §2.1 |
| Guard pipeline — fail fast | First failure stops pipeline, remaining guards skipped | SPEC-01c §2.1 |

## 4.3 Evidence Gate Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| Draft: no evidence required | Evidence gate not evaluated | SPEC-01c §3.1 |
| In Review: evidence required (≥ 1) | Gate enforced | SPEC-01c §3.1 |
| Evidence linked after gate passes | Deal stays in stage, no re-evaluation | SPEC-01c §3.3 |
| Evidence unlinked after gate passes | Deal stays in stage, re-evaluated on next transition | SPEC-01c §3.3 |

## 4.4 SLA Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| SLA timer starts on stage entry | Timer begins when stage is entered | SPEC-01c §4.2 |
| SLA timer resets on stage change | New timer for new stage | SPEC-01c §4.2 |
| SLA approached notification at 75% | Warning triggered | SPEC-01c §4.4 |
| SLA breached notification at 100% | Breach triggered, escalation Level 1 | SPEC-01c §4.4 |
| SLA extreme breach at 200% | Escalation Level 2 | SPEC-01c §4.4 |
| SLA policy by customer segment | Enterprise vs. SMB have different durations | SPEC-01c §4.1 |

## 4.5 Recovery Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| Guard failure → manual recovery | Deal stays in current stage, admin can override | SPEC-01c §7.1 |
| Network error → auto retry (max 3) | Retries with backoff, succeeds eventually | SPEC-01c §7.1 |
| Concurrency conflict → manual refresh | CONFLICT returned, user must refresh | SPEC-01c §7.1 |
| Event publication failure → no rollback | Aggregate saved despite event failure | SPEC-01c §7.2 |
| Admin override creates audit event | `salesos.governance.override` event created | SPEC-01c §7.3 |

---

# 5. UX Contract Tests

**Source:** SPEC-01d (UX Specification)
**Focus:** ViewModel mapping, state rendering, permission-based UI, accessibility
**Level:** Contract tests — test ViewModel mappers + component behavior with mocked API

## 5.1 ViewModel Mapping Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| `DealResponse` → `DealListViewModel` | All fields mapped correctly, amounts formatted | SPEC-01d §10.2 |
| `DealResponse` → `DealDetailViewModel` | All sections populated | SPEC-01d §10.2 |
| Empty deal list → empty ViewModel | `items: []`, `hasNext: false` | SPEC-01d §10.2 |
| SLABreached response → SLA status mapped | Status = "breached", remainingHours = 0 | SPEC-01d §10.2 |
| Allowed actions mapped from response | Actions list correctly reflects permissions | SPEC-01d §10.2 |

## 5.2 State Rendering Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| Loading state renders skeleton | Screen shows shimmer animation | SPEC-01d §9.1 |
| Empty state renders message + action | Shows illustration, text, and CTA button | SPEC-01d §9.3 |
| Error state renders message + retry | Shows error banner with retry button | SPEC-01d §9.2 |
| Governance blocked state shows inline error | Specific governance message with resolve action | SPEC-01d §6 |
| AI pending state shows progress | "Generating..." with skeleton text | SPEC-01d §7 |
| AI ready state shows disclaimer banner | Governance banner with confidence, model, disclaimer | SPEC-01d §7 |

## 5.3 Accessibility Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| All interactive elements keyboard-reachable | Tab order matches focus order spec | SPEC-01d §13.1 |
| ARIA labels present on dynamic elements | Loading, error, governance states have correct ARIA | SPEC-01d §13.3 |
| Color contrast meets WCAG AA | Text: 4.5:1 minimum | SPEC-01d §13.4 |
| Focus indicator visible on all interactive elements | 3px focus ring | SPEC-01d §13.4 |

## 5.4 Navigation Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| List → Detail preserves scroll position | Back button restores scroll | SPEC-01d §15.2 |
| List filters preserved in URL params | Refresh retains filters | SPEC-01d §15.2 |
| Modal closes on Escape | Dialog dismissed | SPEC-01d §15.2 |
| Unsaved changes prompt before navigation | `beforeunload` fires when form has changes | SPEC-01d §15.3 |

---

# 6. Integration Tests

**Source:** All specifications
**Focus:** End-to-end flows across Domain + API + Workflow + Platform Kernel
**Level:** Integration tests — real Prisma test database, mock external Kernel services

## 6.1 Core Integration Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| Create deal → save to DB → read back | Full CRUD cycle with persistence | PRD-01 §6 FR-01, FR-06 |
| Create deal → transition stages → verify state | State machine through all transitions | PRD-01 §14 Scenario 1 |
| Create deal → link evidence → verify gate | Evidence gate passes after linking | PRD-01 §9 |
| Create deal → submit for review → approve | Review/approval workflow complete | PRD-01 §6 FR-03, FR-04 |
| Create deal → submit for review → reject | Rejection flow with reason | PRD-01 §6 FR-03 |

## 6.2 Event Integration Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| Each transition publishes correct Domain Event | 7 events verified | SPEC-01c §6.1 |
| Domain Events include correlationId | Traceable across system | SPEC-01b §1.3 |
| SLA timer creates audit event on breach | `salesos.sla.breached` in audit log | SPEC-01c §4.2 |

## 6.3 Cross-Product Integration Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| Platform Auth integration | Permission enforced server-side | SPEC-01b §1.5 |
| Platform Evidence Network integration | Evidence link created and verified | SPEC-01b §2.6 |
| Platform Workflow Engine integration | State machine executes through engine | SPEC-01c §1 |
| Platform Event Bus integration | Events published with correct envelope | SPEC-01b §3 |
| Platform Audit integration | Audit events created for all mutations | PRD-01 §14b |

---

# 7. Governance Tests

**Source:** Constitution + All specifications
**Focus:** Product Independence, Platform Neutrality, AI Governance, Audit Trail
**Level:** Automated architectural tests — CI gates

## 7.1 Constitutional Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| **Product Independence** | Zero imports from other products (`from "@/lib/audit"`, `from "@/lib/decision"`, etc.) in SalesOS v2 code | Constitution Principle 1 |
| **Platform Neutrality** | Zero references to `SalesAccount`, `AuditEngagement`, etc. in `src/lib/platform/` | Constitution Principle 2 |
| **Consumer-Driven Extraction** | Every platform capability used has a declared consumer | Constitution Principle 3 |
| **No circular dependencies** | Kernel does not import from products | Platform Kernel Architecture §10 |

## 7.2 Audit Trail Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| Every mutation creates audit event | 11 actions from Observability Matrix verified | PRD-01 §14b |
| Audit events include actorId | All events have identifiable actor | PRD-01 §14b |
| Audit events are chronological | Timestamps are monotonically increasing | PRD-01 §14b |

## 7.3 AI Governance Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| AI output includes governance metadata | confidence, modelUsed, governanceId present | Blueprint §8 |
| AI output has human review status | reviewStatus is not null | Blueprint §8 |
| AI disclaimer is displayed | Arabic + English disclaimer present | Blueprint §8 |
| No autonomous AI decisions | AI never transitions deal stage | Blueprint §3 |

---

# 8. Observability Tests

**Source:** PRD-01 §14b (Observability Matrix)
**Focus:** Metrics, logs, traces, audit events for every action
**Level:** Automated verification in CI

## 8.1 Observability Signal Tests

| Action | Metric Verified | Log Verified | Trace Verified | Audit Event Verified |
|---|---|---|---|---|
| `createDeal` | `salesos.deal.created` counter | Structured log with dealId, accountId | Trace span: DealService.create | `salesos.deal.created` |
| `transitionDeal` | `salesos.deal.transition` counter | Structured log with fromStage, toStage | Trace span: DealService.transition | `salesos.deal.stage_changed` |
| `linkEvidence` | `salesos.evidence.linked` counter | Structured log with dealId, evidenceId | Trace span: EvidenceService.link | `salesos.evidence.linked` |
| `approveDeal` | `salesos.deal.approved` counter + histogram | Structured log with reviewDuration | Trace span: DealService.approve | `salesos.deal.approved` |
| `closeWon` | `salesos.deal.closed_won` counter + pipeline gauge | Structured log with amount, accountId | Trace span: DealService.closeWon | `salesos.deal.closed_won` |
| `listDeals` | `salesos.deal.list` counter | Structured log with filter params | Trace span: DealService.list | — (read-only) |

## 8.2 Correlation ID Propagation Tests

| Test | What It Verifies | PRD/SPEC Reference |
|---|---|---|
| correlationId flows from API → Domain → Event | Same ID in Server Action, Domain Service, and Event Bus | SPEC-01b §1.3 |
| correlationId preserved in audit event | Audit event metadata includes correlationId | SPEC-01b §1.3 |
| requestId unique per invocation | No two requests share the same requestId | SPEC-01b §1.3 |

---

# 9. Performance Tests

**Source:** PRD-01 §13.1 (Performance NFRs)
**Focus:** Latency, throughput, concurrent updates, pagination
**Level:** Load tests — run weekly, non-blocking

## 9.1 Performance Benchmarks

| Test | Target | Measurement |
|---|---|---|
| Deal list (1000 deals) | < 1s p95 | API response time |
| Stage transition | < 200ms p95 | Action completion time |
| Evidence link | < 200ms p95 | Action completion time |
| Concurrent updates (10 users, same deal) | < 3s p95 for all to resolve | CONFLICT handling + retry |
| Pagination (page 50 of 1000) | < 500ms p95 | API response time |
| AI brief generation | < 10s p95 | End-to-end timing |
| Event publish latency | < 100ms p95 | Event Bus telemetry |

---

# 10. Regression Matrix

The regression matrix links every PRD acceptance criterion to its test coverage across all test types. This ensures that no requirement is untested.

| AC ID | PRD-01 Criterion | Domain Tests | API Tests | Workflow Tests | UX Tests | Integration Tests |
|---|---|---|---|---|---|---|
| AC-01 | Create Deal with required fields | §2.1 Value Obj | §3.1 Actions | — | §5.1 ViewModel | §6.1 Core |
| AC-02 | Transitions through all 7 stages | §2.3 Events | §3.1 Actions | §4.1 State Machine | §5.2 States | §6.1 Core |
| AC-03 | Evidence gate blocks transition | §2.2 Invariants | §3.1 Actions | §4.2 Guards, §4.3 Evidence | §5.2 States | §6.1 Core |
| AC-04 | Reviewer cannot approve own deal | — | §3.2 Auth | §4.2 Guards | §5.2 States | §6.1 Core |
| AC-05 | Rejection requires reason | §2.4 Errors | §3.1 Actions | §4.2 Guards | — | §6.1 Core |
| AC-06 | Close Lost requires loss reason | §2.4 Errors | §3.1 Actions | §4.2 Guards | — | §6.1 Core |
| AC-07 | Closed deal prevents further transitions | §2.2 Invariants | §3.1 Actions | §4.1 State Machine | — | §6.1 Core |
| AC-08 | Every mutation creates audit event | — | — | — | — | §6.2 Events, §7.2 Audit |
| AC-09 | Tenant isolation | — | §3.2 Auth | — | — | §6.3 Cross-product |
| AC-10 | Manager can view all deals | — | §3.2 Auth | — | — | §6.1 Core |
| AC-11 | Each transition publishes correct event | §2.3 Events | — | §4.1 State Machine | — | §6.2 Events |
| AC-12 | Evidence count updates on link/unlink | — | §3.1 Actions | §4.3 Evidence | §5.1 ViewModel | §6.1 Core |

---

# 11. CI/CD Test Gates

| Gate | Trigger | Tests Run | Required Pass Rate | Blocking? |
|---|---|---|---|---|
| **Commit** | Every push to feature branch | Domain tests, API contract tests, Workflow tests, UX contract tests | 100% | ✅ Blocks PR creation |
| **PR** | Pull request created | All of commit + Integration tests + Governance tests | 100% (governance), ≥ 95% (others) | ✅ Blocks merge |
| **Daily** | Scheduled nightly | Observability tests, regression matrix | 90% | ❌ Alert only |
| **Weekly** | Scheduled weekly | Performance tests | Warning if >10% degradation | ❌ Non-blocking |

---

# 12. Traceability

| SPEC-01e Element | PRD-01 Reference | SPEC-01a | SPEC-01b | SPEC-01c | SPEC-01d |
|---|---|---|---|---|---|
| Value Object tests | — | §2 | — | — | — |
| Invariant tests | — | §1.3 | — | — | — |
| Domain Event tests | — | §3 | — | — | — |
| Domain Error tests | — | §4 | — | — | — |
| Server Action tests | §6 FRs, §12 | — | §2 | — | — |
| Authorization tests | §5 | — | §1.5 | — | — |
| Concurrency tests | §12 | — | §4 | — | — |
| State Machine tests | §14 Scenario 1 | — | — | §1 | — |
| Guard tests | §7 DR-01 to DR-09 | — | — | §2 | — |
| Evidence gate tests | §9 | — | — | §3 | — |
| SLA tests | §8 | — | — | §4 | — |
| Recovery tests | — | — | — | §7 | — |
| ViewModel tests | — | — | — | — | §10 |
| State rendering tests | §13 ACs | — | — | — | §1, §9 |
| Accessibility tests | — | — | — | — | §13 |
| Navigation tests | — | — | — | — | §15 |
| Integration tests | §14 (All scenarios) | All | All | All | All |
| Governance tests | Constitution | All | All | All | All |
| Observability tests | §14b | — | §1.3 | — | — |
| Performance tests | §13.1 | — | — | — | — |
| Regression matrix | §13 (12 ACs) | Mapped | Mapped | Mapped | Mapped |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Test Specification — Final specification before implementation
- **Date:** 2026-06-28
- **Version:** 0.1 (Draft)
- **Parent:** `SPECIFICATION-01_Opportunity_Management.md` → `PRD-01_Opportunity_Management.md` v1.0 (FROZEN)
- **Depends On:** SPEC-01a, SPEC-01b, SPEC-01c, SPEC-01d (all FROZEN v1.0)
- **Next:** Engineering Readiness Review → Implementation-01
- **Status:** **FROZEN (v1.0)** — approved by Architecture Review Board. Serves as Reference Test Specification for all future AQLIYA product specifications.
- **Next:** Engineering Readiness Review → Implementation-01.
