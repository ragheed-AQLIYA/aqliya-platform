# AQLIYA Technical Debt Register

**Status:** Active | **Version:** 1.0 | **Date:** 2026-06-30

## Open Items

| ID | Description | Priority | Product | Impact | Status |
|----|------------|----------|---------|--------|--------|
| TD-001 | **AI Layer Duplication** — `src/lib/ai/` was 54 shim files re-exporting from `src/lib/core/ai/` | HIGH | Platform Core | ✅ **CLOSED** — 54 shim files removed, 34 importers updated | ✅ |
| TD-002 | **ABAC Triple Implementation** — ABAC in `core/policy/access/` + `platform/abac/` + `core/access/` (legacy) | HIGH | Platform Core | Code complexity, maintenance burden | 🔴 Open |
| TD-003 | **Evidence 3 Layers** — `core/evidence/` (11) + `platform/evidence/` (2) + `core/evidence/` legacy (3) | HIGH | Platform Core | Code complexity | 🔴 Open |
| TD-004 | **Audit 3 Layers** — `core/audit/` (2) + `platform/audit/` (7) + `core/audit/` legacy (2) | MEDIUM | Platform Core | Code complexity | 🔴 Open |
| TD-005 | **SalesOS 3 Parallel Layers** — main + v02 + vnext without unification plan | HIGH | SalesOS | Blocks L6, doubles maintenance | 🔴 Open |
| TD-006 | **WorkflowOS/Sunbul Dual Models** — Sunbul* + Workflow* Prisma naming persists | MEDIUM | WorkflowOS | Confusing naming | 🔴 Open |
| TD-007 | **Empty Release Shells** — 21 empty release directories removed | LOW | Infrastructure | ✅ **CLOSED** — 21 dirs deleted | ✅ |
| TD-008 | **Operations Execution Backlog** — 30+ parallel-execution files archived | LOW | Documentation | ✅ **CLOSED** — Archived to `docs/archive/` | ✅ |
| TD-009 | **No Core Tests for 4 Modules** — Memory (0), Signals (0), Core Governance (0), Contracts (0) test files | HIGH | Platform Core | Risk of regression bugs | 🔴 Open |
| TD-010 | **Inconsistent Creator Field Names** — createdById/uploadedById/actorId mix | MEDIUM | Data Layer | Audit trail inconsistency | 🔴 Open |
| TD-011 | **Root-Level Log Files** — 19 diagnostic logs at root | LOW | Infrastructure | ✅ **CLOSED** — Removed + gitignored | ✅ |
| TD-012 | **Husky v9 Confirmed** — Previously reported as v8, verified as v9.1.7 | LOW | Infrastructure | ✅ **CLOSED** — No action needed | ✅ |
| TD-013 | **LocalContactOS Test Gap** — 7 routes, 7 models, 0 tests | MEDIUM | LocalContactOS | Regression risk | 🔴 Open |
| TD-014 | **RiskOS Evidence Model Gap** — No RiskEvidence model, uses evidenceRequired only | LOW | RiskOS | Cannot attach evidence to assessments | 🔴 Open |

## Summary

| Status | Count |
|--------|-------|
| 🔴 Open | 9 |
| ✅ Closed | 5 |
| **Total** | **14** |
