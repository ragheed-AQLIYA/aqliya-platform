---
title: "RB-02B — Policy Catalog (Execution Reference)"
status: active
program: "Platform Authorization"
phase: "Implementation — Wave 3 Complete"
version: "1.0"
date: 2026-06-28
classification: policy-catalog
---

# Policy Catalog — Execution Reference

> **Purpose:** Execution reference for all authorization policies. This document is the daily reference for implementors and operators. The RB-02A v1.0 document remains the normative specification.
>
> **Architecture Freeze:** Active. Policy changes require RB-02A revision.

---

## Policy Overview

| ID | Name | Stage | Priority | Status | Decision Type |
|----|------|-------|:--------:|:------:|:-------------:|
| POL-01 | Ownership Rule | Identity Resolution | 1 | ✅ Active | RESTRICT |
| POL-02 | Creator Privilege | Policy Evaluation | 5 | ✅ Active | ELEVATE |
| POL-03 | Project Scope Constraint | Identity Resolution | 2 | ✅ Active | RESTRICT |
| POL-04 | Integration Account Restriction | Policy Evaluation | 3 | ✅ Active | RESTRICT |
| POL-05 | External Auditor Restriction | Policy Evaluation | 4 | ✅ Active | RESTRICT |
| POL-06 | Time-Based Access | Policy Evaluation | 10 | 🔮 Future | RESTRICT |
| POL-07 | Approval Gate | Workflow Constraints | 1 | ✅ Active | REQUIRE_THEN_ALLOW |
| POL-08 | Resource Sensitivity | Policy Evaluation | 8 | 🔮 Future | RESTRICT |
| POL-09 | Bulk Operation Limit | Policy Evaluation | 7 | ✅ Active | RESTRICT |

---

## Individual Policy Specifications

### POL-01: Ownership Rule

| Field | Value |
|-------|-------|
| **File** | `src/lib/authorization/engine/policies/pol-01-ownership.ts` |
| **Stage** | Identity Resolution |
| **Priority** | 1 (evaluated first) |
| **Inputs** | `Actor.organizationId`, `Resource.organizationId` |
| **Output** | ALLOW if org context present; DENY if missing with resourceId |
| **Applies to** | All resource types |
| **Depends on** | RB-01 tenant isolation (runs before RB-02) |
| **ADR** | ADR-RB02-003 (No Admin Bypass) |
| **Tests** | See `policies/__tests__/policies.test.ts` — `POL-01` suite |

### POL-02: Creator Privilege

| Field | Value |
|-------|-------|
| **File** | `src/lib/authorization/engine/policies/pol-02-creator-privilege.ts` |
| **Stage** | Policy Evaluation |
| **Priority** | 5 |
| **Inputs** | `Actor.userId`, `Resource.createdBy` (via context) |
| **Output** | ALLOW (creator gets implicit update/delete); ALLOW (pass-through for non-creator) |
| **Applies to** | `workbook`, `evidence`, `finding`, `supplier`, `spend-record` |
| **Limitation** | Does NOT grant approval permission (see SoD Chapter 9) |
| **Tests** | 5 tests |

### POL-03: Project Scope Constraint

| Field | Value |
|-------|-------|
| **File** | `src/lib/authorization/engine/policies/pol-03-project-scope.ts` |
| **Stage** | Identity Resolution |
| **Priority** | 2 |
| **Inputs** | `Actor.organizationId`, `Resource.projectId`, `Resource.resourceType` |
| **Output** | ALLOW if project context present; READ_ONLY if missing |
| **Applies to** | `workbook`, `evidence`, `finding`, `review` |
| **Tests** | 3 tests |

### POL-04: Integration Account Restriction

| Field | Value |
|-------|-------|
| **File** | `src/lib/authorization/engine/policies/pol-04-integration-restriction.ts` |
| **Stage** | Policy Evaluation |
| **Priority** | 3 |
| **Inputs** | `Actor.role`, `Action.name` |
| **Output** | DENY for membership/override/settings actions; REQUIRE_APPROVAL for exports; ALLOW otherwise |
| **Applies to** | Role: `INTEGRATION_ACCOUNT` |
| **Tests** | 4 tests |

### POL-05: External Auditor Restriction

| Field | Value |
|-------|-------|
| **File** | `src/lib/authorization/engine/policies/pol-05-external-auditor-restriction.ts` |
| **Stage** | Policy Evaluation |
| **Priority** | 4 |
| **Inputs** | `Actor.role`, `Action.name` |
| **Output** | DENY for mutations/exports/settings; READ_ONLY for read operations |
| **Applies to** | Role: `EXTERNAL_AUDITOR` |
| **Tests** | 5 tests |

### POL-07: Approval Gate

| Field | Value |
|-------|-------|
| **File** | `src/lib/authorization/engine/policies/pol-07-approval-gate.ts` |
| **Stage** | Workflow Constraints |
| **Priority** | 1 |
| **Inputs** | `Actor.role`, `Action.name`, `Resource.type` |
| **Output** | REQUIRE_APPROVAL for 9 actions (A01–A09); ALLOW otherwise |
| **Applies to** | `project.delete`, `workbook.export`, `report.export`, `evidence.delete`, `review.override`, `classification-rule.delete`, `settings.update`, `membership.assignRole`, `import.create` |
| **Depends on** | Approval Dispatcher (Chapter 10, Wave 12) |
| **Tests** | 4 tests |

### POL-09: Bulk Operation Limit

| Field | Value |
|-------|-------|
| **File** | `src/lib/authorization/engine/policies/pol-09-bulk-operation-limit.ts` |
| **Stage** | Policy Evaluation |
| **Priority** | 7 |
| **Inputs** | `Action.name`, `Action.isBulk` (via context) |
| **Output** | DENY if bulk without permission; ALLOW if bulk permitted; ALLOW for non-bulk |
| **Tests** | 3 tests |

---

## Implementation File Structure

```
src/lib/authorization/engine/policies/
├── index.ts                             # Exports
├── types.ts                             # AuthorizationPolicy interface
├── registry.ts                          # PolicyRegistry class
├── policy-engine-adapter.ts             # Bridges registry → engine StageHandlers
├── pol-01-ownership.ts                  # ✅ Active
├── pol-02-creator-privilege.ts          # ✅ Active
├── pol-03-project-scope.ts              # ✅ Active
├── pol-04-integration-restriction.ts    # ✅ Active
├── pol-05-external-auditor-restriction.ts  # ✅ Active
├── pol-06-time-based-access.ts          # 🔮 Future (stub)
├── pol-07-approval-gate.ts             # ✅ Active
├── pol-08-resource-sensitivity.ts       # 🔮 Future (stub)
├── pol-09-bulk-operation-limit.ts       # ✅ Active
└── __tests__/
    └── policies.test.ts                 # 37 tests (all policies)
```

---

## Test Coverage

| Policy | Tests | Coverage |
|--------|:-----:|:--------:|
| Registry | 5 | Registration, lookup, stage filter, dedup |
| POL-01 | 4 | Organization context, missing context, no-resourceId |
| POL-02 | 5 | Non-scoped resource, creator, non-creator, metadata |
| POL-03 | 3 | Non-scoped resource, missing project, project present |
| POL-04 | 4 | Non-integration role, membership deny, export approval, allowed |
| POL-05 | 5 | Non-auditor role, mutation deny, export deny, READ_ONLY, settings deny |
| POL-06 | 1 | Future — always ALLOW |
| POL-07 | 4 | No approval needed, project.delete, workbook.export, evidence.delete |
| POL-08 | 1 | Future — always ALLOW |
| POL-09 | 3 | Non-bulk, bulk deny, bulk allow |
| W3-G12 | 1 | Policy isolation (structural) |
| Integration | 2 | Registry completeness, active/future count |
| **Total** | **37** | |

---

## Key Design Rules (W3-G10..G12)

| Rule | Status | Verification |
|------|--------|-------------|
| **W3-G10**: Every policy independently testable | ✅ | Each policy has its own `describe` block |
| **W3-G11**: Every policy emits Decision Trace (metadata) | ✅ | All policies return `metadata` in PolicyResult |
| **W3-G12**: No policy knows another | ✅ | No policy file imports another policy file — verified by module structure |
