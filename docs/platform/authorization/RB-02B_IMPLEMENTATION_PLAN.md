---
title: "RB-02B — Implementation Plan"
status: active
program: "Platform Authorization"
phase: "Implementation"
version: "1.0"
date: 2026-06-28
supersedes: none
---

# RB-02B Implementation Plan

> **Derived from:** RB-02A v0.5 — Authorization Model for AQLIYA Platform  
> **Purpose:** Define the wave-by-wave implementation sequence for RB-02B. No architectural changes — pure implementation.  
> **Architecture Freeze:** Active. Architectural changes require RB-02A revision (see §12.9 of RB-02A).

---

## Wave Plan

| Wave | Focus | Key Deliverables | Est. Effort | Gate |
|------|-------|------------------|:-----------:|------|
| **0** | **Authorization Discovery** | `AUTHORIZATION_DISCOVERY_REPORT.md` — complete inventory of 433+ guard points, 70 role comparisons, 6 admin bypasses, 5 product guard systems. BEFORE baseline. | Small | ✅ Done |
| **1** | **Authorization Engine Skeleton** | TypeScript types/enums for Resources, Actions, Permissions, Roles, Capabilities. Engine interface with 4-outcome return type. **No production code uses it yet.** | Medium | G1–G2 |
| **2** | **Permission & Capability Registry** | Permission→Action mapping. Capability→Permission mapping. Role→Permission Matrix as typed enums. | Medium | G2–G3 |
| **3** | **Policy Registry** | 6-stage pipeline interface. Policy data structures. Policy metadata per Chapter 8 standard. **Engine exists but unused.** | Medium | ACG-01 |
| **4** | **DecisionOS Shadow** | Shadow instrumentation in `requireDecisionAccess`. Structured shadow logger. No production behavior change. | Medium | W4A Gates |
| **4.5** | **Parity Certification Framework** | Mismatch classification, decision fingerprint, evidence package generator, per-stage latency, replay system, drift detection. | Medium | W4A.5 Gates |
| **4.6** | **Shadow Smoke Certification** | Automated smoke test verifying shadow infra isolation. Architecture Freeze Audit checklist (AFA-01..10). | Small | 8 smoke tests |
| **→** | **Operational Data Collection** | Collect real traffic + synthetic scenarios until coverage criteria met. | Days–Weeks | Coverage targets |
| **→** | **Operational Certification Gate** | Review evidence package against 10 criteria. Board sign-off. | 2–4 hrs | O01–O10 |
| **→** | **Authorization Board Sign-off** | Go/No-Go for W4B. | 1 hr | Board decision |
| **5** | **DecisionOS Dual → Cutover** | W4B (dual decision) → W4C (engine primary, legacy fallback). | Medium | G1, G3 |
| **6** | **LocalContentOS Migration** | Replace ~50 `require*` + `assertProjectAccess` calls. | Medium | G1, G3 |
| **7** | **SalesOS Migration** | Replace ~60 `requireSalesPermission` + `assertSales*` calls. | Medium | G1, G3 |
| **8** | **AuditOS Migration** | Replace ~33 `assertEngagementAccess` calls. | Medium | G1, G3 |
| **9** | **WorkflowOS Migration** | Replace ~26 `requireClientAccess` + `requireWorkflowAdmin` calls. | Medium | G1, G3 |
| **10** | **Core Cleanup** | Migrate ~190 `requireUserContext` calls + 70 role comparisons + eliminate 6 admin bypasses. | Large | G4, ACG-02..06 |
| **11** | **Decision Trace + Observability** | AuthorizationEvaluated emission. Decision Trace structure (Chapter 11). OperationCompleted/Failed events. | Medium | G4 |
| **12** | **SoD Enforcement** | 7 SoD rules (S01–S07) as policies. Hard/Soft enforcement levels. Exception process. | Small | G8 |
| **13** | **Approval Integration** | 9 approval gates (A01–A09). Approval Dispatcher. Approval Authority model. | Medium | G9 |
| **14** | **Regression Guard + ACG** | `guard.mjs` for RB-02. Architecture Compliance Gate automation. Static analysis + integration tests. | Small | G7, G10, ACG |
| **15** | **Documentation & Handoff** | Implementation guide. Operator runbook. RB-02B completion report. | Small | G5–G6 |

---

## Architecture Compliance Gate

Before any RB-02B code is committed, this gate must pass.

### ACG-01: No Bypass

```
❌ if (role === 'admin') return true     — FORBIDDEN
❌ if (user.isAdmin) return ALLOW        — FORBIDDEN
✅ Engine.authorize(actor, action, resource) — REQUIRED
```

### ACG-02: No Inline Authorization

```
❌ if (user.role === 'BUSINESS_MANAGER') { ... }  — FORBIDDEN
✅ Guard.check(actor, action, resource)            — REQUIRED
```

### ACG-03: No Direct Role Name Comparisons

```
❌ user.role === 'REVIEWER'       — FORBIDDEN (use Permission check)
✅ hasPermission(actor, 'P13')    — REQUIRED
```

### ACG-04: No Permission Strings

```
❌ 'supplier.create'          — FORBIDDEN (string literal)
✅ ActionType.SUPPLIER_CREATE — REQUIRED (type-safe enum)
```

### ACG-05: All Decisions Through Engine

```
❌ Custom authz logic in service layer  — FORBIDDEN
✅ All actions → Guard → Engine → Decision — REQUIRED
```

### ACG-06: Decision Trace Required

```
❌ Silent ALLOW/DENY without event  — FORBIDDEN
✅ Every decision → AuthorizationEvaluated + Trace — REQUIRED
```

---

## RB-02B Dependencies

| Wave | Depends On | Blocks |
|------|------------|--------|
| W0 | — | All (discovery baseline) |
| W1 | W0 | W2, W3 |
| W2 | W1 | W3 |
| W3 | W1, W2 | W4–W9 |
| W4 | W3 | W10 |
| W5 | W3 | W10 |
| W6 | W3 | W10 |
| W7 | W3 | W10 |
| W8 | W3 | W10 |
| W9 | W3 | W10 |
| W10 | W4–W9 | W11 |
| W11 | W10 | W12 |
| W12 | W10 | W13 |
| W13 | W10–W12 | W14 |
| W14 | W13 | — |

---

## Handoff Package Reference

RB-02B starts with these inputs (see RB-02A §12.8 for the complete list):

1. **RB-02A v0.5** — Complete specification
2. **28 ADRs** — All architectural decisions
3. **Resource Catalog** — 16 Primary + 2 Derived Resources
4. **Action Catalog** — 69 actions
5. **Permission Catalog** — 23 permissions
6. **Capability Catalog** — 7 capabilities
7. **Role Catalog** — 7 Platform Roles
8. **Role×Permission Matrix** — Complete cell-by-cell mapping
9. **Policy Catalog** — 9 policies with unified metadata
10. **Decision Model** — 4 outcomes + Decision Precedence
11. **Approval Authority** — 9 gates with full model
12. **Authorization Invariants** — 10 architectural rules
13. **Implementation Invariants** — 10 runtime rules
14. **Test Strategy** — 5 tests per guard
15. **Acceptance Criteria** — 10 gates (G1–G10) with evidence

---

---

## Architecture Freeze Audit (AFA)

Before W5 (first full product migration), this checklist must pass.

| # | Check | Method |
|---|-------|--------|
| AFA-01 | No `role ===` comparisons outside Authorization Engine | Code search: `role ===`, `.role ===` |
| AFA-02 | No Admin Bypass patterns (`if admin return true`) | Code search: `isAdmin`, `bypass` |
| AFA-03 | No Authorization Decisions outside Engine | All `require*`/`assert*` must route through engine |
| AFA-04 | All Resources registered in Resource Registry | Compare registry vs Prisma schema |
| AFA-05 | All Permissions registered in Permission Registry | Compare registry vs `GUARD_MIGRATION_MAP.md` |
| AFA-06 | All Policies registered in Policy Registry | `registry.all()` == 9 policies |
| AFA-07 | No Inline Authorization Logic | Code search: inline `if (user.role)` in services |
| AFA-08 | All products use Platform Roles only | No product role names in engine path |
| AFA-09 | All legacy guards to be migrated are documented | `GUARD_MIGRATION_MAP.md` is complete |
| AFA-10 | No ADR violations | Compare code against ADR-RB02-001..028 |

**Outcomes:** `PASS` / `PASS WITH OBSERVATIONS` / `FAIL`

---

> **Start RB-02B implementation after this plan is reviewed and the Architecture Compliance Gate is verified on first commit.**
