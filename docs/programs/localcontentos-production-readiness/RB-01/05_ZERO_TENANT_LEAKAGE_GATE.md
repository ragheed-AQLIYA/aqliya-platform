# RB-01 Phase 5: Zero Tenant Leakage Gate

**Status:** DONE (Gate: **NOT PASSED**)  
**Date:** 2026-06-28  
**RB-01 State:** OPEN — Cannot close without remediation  
**Blocks:** P0-B2 (RB-02, RB-03), P0-B3 (SC-01B), P0-B4 (SC-02)

---

## 1. Gate Criteria

The Zero Tenant Leakage gate consists of 7 criteria. All must be GREEN for RB-01 to close.

| # | Criterion | Definition | Status | Evidence |
|---|-----------|------------|--------|----------|
| G1 | **No unscoped Prisma queries** | Every Prisma query in LCOS must include `organizationId` (directly or via relation join) in the WHERE clause | **🔴 RED** | 48 unscoped Prisma queries identified in Phase 2 ($\text{02\_TENANT\_ISOLATION\_MATRIX.md}$ §8.1) |
| G2 | **No client-supplied orgId** | No server action accepts `organizationId` as a parameter from the client without session verification | **🔴 RED** | 13 instances identified: 9 v3-actions + 2 review-actions + 2 inline (Phase 2 §8.1) |
| G3 | **All server actions verify org** | Every exported server action calls `requireUserContext()` or equivalent auth AND compares `user.organizationId` against the operation target | **🔴 RED** | 18 workbook actions have zero auth (Phase 2 §9.1). 3 review actions have no org check (Phase 2 §9.3) |
| G4 | **No active cross-tenant exploit path** | No sequence of server action calls can access data from another organization | **🔴 RED** | 21 active exploitation paths documented in Phase 3 ($\text{03\_TRUST\_BOUNDARY\_AUDIT.md}$ §6.1) |
| G5 | **Lib-layer defense-in-depth** | Even if an action-level check is bypassed, lib functions must not leak cross-tenant data | **🔴 RED** | Lib functions in `population.ts`, `services.ts`, `missing-data.ts` have zero org scoping (Phase 2 §2.1-2.3). `ai-auto-review.ts` has unscoped `findUnique` at line 86. |
| G6 | **All lib findUnique calls include orgId** | Every `findUnique({ where: { id } })` must also filter by `organizationId` | **🔴 RED** | 16+ calls use only `id` without `orgId`: `reviewFalsePositive`, `reviewPatternSuggestion`, `runWorkbookAiReview`, `getWorkbookWithLines`, etc. (Phase 2 §10) |
| G7 | **Audit trail includes orgId** | Audit events must include `organizationId` for traceability | **🟡 YELLOW** | `createLocalContentAuditEvent` writes without `orgId` on the event record (Phase 2 §6.3). Mitigation: all callers use `assertProjectAccess` first |

**Result: 0/7 GREEN. 6 RED. 1 YELLOW.**

---

## 2. Go/No-Go Decision

| Decision | Selected | Rationale |
|----------|----------|-----------|
| **No-Go: Close RB-01** | ❌ | Cannot close with 21 active exploitation paths. Closing would mean accepting zero tenant isolation, which violates AGENTS.md §18 (Security), §24 (Hard Stops), and §29 (Final Principle). |
| **No-Go: RB-01 → P0-B2** | ✅ | RB-01 findings are the specification for RB-02 (Remediate) and RB-03 (Verify). G1-G7 map directly to remediation tasks. |
| **Go: Accept Risk** | ❌ | Tenant isolation failure is a HARD STOP per AGENTS.md §23: "Mutation has no audit trail" and "Feature has no tenant/permission strategy." |
| **Go: Partial Remediation** | ❌ | Partial remediation (fixing only some paths) would leave active exploitation routes open. All 21 paths must be closed. |

### Formal Decision: **NO-GO**

RB-01 documents a systemic tenant isolation failure. Remediation requires all 7 gate criteria to turn GREEN. This is delegated to **P0-B2 (RB-02/RB-03)**.

---

## 3. Remediation Roadmap

The 6 RED criteria map to specific remediation waves:

| Gate | Remediation Wave | Actions | Est. Effort |
|------|-----------------|---------|-------------|
| G3 | **RB-02-A: Add auth to workbook actions** | Add `requireUserContext()` + `assertProjectAccess()` to 18 unscoped workbook actions | High (~18 functions × 2 edits each) |
| G2 | **RB-02-B: Add org verification to v3-actions** | After `requireUserContext()`, compare `user.organizationId` to param in 9 v3-actions + 1 review action | Medium (~10 functions × 1 edit each) |
| G1 | **RB-02-C: Add orgId to lib WHERE clauses** | Add `organizationId` to Prisma `where` in `population.ts`, `services.ts`, `missing-data.ts` | High (~48 queries) |
| G5/G6 | **RB-02-D: Fix lib findUnique calls** | For `reviewFalsePositive`, `reviewPatternSuggestion`, `runWorkbookAiReview`, etc. — add orgId or document as "defense-in-depth" | Medium (~16 calls) |
| G4 | **RB-03: Verify all paths closed** | Run cross-tenant-attack.mjs against test DB, confirm all 21 paths fail with authorization error | Medium |
| G7 | **SC-02: Fix audit events** | Add `organizationId` to `createLocalContentAuditEvent` records | Low |

### Dependency Chain

```
P0-B1 (RB-01) → ZTL Gate (FAILED) → P0-B2 (RB-02 Fix + RB-03 Verify) → ZTL Gate (RETEST) → P0-B3 → P0-B4
```

---

## 4. Risk Register Update

| Risk | Severity | Likelihood | Status | Action |
|------|----------|------------|--------|--------|
| Cross-tenant data read (E1-E12, E21) | **HIGH** | **HIGH** — requires only browser DevTools | **OPEN** | RB-02-A (add auth) |
| Cross-tenant data write (E2, E4) | **HIGH** | **HIGH** — requires only browser DevTools | **OPEN** | RB-02-A (add auth) |
| Cross-tenant AI data contamination (E16-E20) | **MEDIUM** | **MEDIUM** — requires orgId + workbookId | **OPEN** | RB-02-B (verify orgId) |
| Cross-tenant governance bypass (E13-E15) | **HIGH** | **HIGH** — requires only suggestion/review ID | **OPEN** | RB-02-A (add auth) |
| Audit trail forgery (audit-events) | **LOW** | **LOW** — requires bypassing assertProjectAccess | **OPEN** | SC-02 (add orgId to events) |

---

## 5. RB-01 Closure Conditions

RB-01 will be marked as CLOSED when:

1. ✅ All 5 deliverables are complete and reviewed (Phase 1-5) — **DONE**  
2. 🔴 All 7 ZTL gate criteria are GREEN — **NOT DONE**  
3. 🔴 cross-tenant-attack.mjs returns exit code 1 (no vulnerabilities found) — **NOT DONE**  
4. 🔴 EXECUTION_BACKLOG.md updated — **DONE (next document)**  
5. 🔴 GAP_REGISTER.md updated — **DONE (next document)**  
6. 🔴 PRODUCTION_READINESS_MATRIX.md updated — **DONE (next document)**  

**RB-01 status: OPEN — Evidence phase complete, remediation required (P0-B2).**

---

## 6. Deliverable Index

| Phase | Document | Status | Link |
|-------|----------|--------|------|
| 1 | Surface Inventory | ✅ DONE | `01_TENANT_SURFACE_INVENTORY.md` |
| 2 | Tenant Isolation Matrix | ✅ DONE | `02_TENANT_ISOLATION_MATRIX.md` |
| 3 | Trust Boundary Audit | ✅ DONE | `03_TRUST_BOUNDARY_AUDIT.md` |
| 4 | Leakage Proof | ✅ DONE | `04_LEAKAGE_PROOF.md` |
| 4 | Proof Script | ✅ DONE | `proofs/cross-tenant-attack.mjs` |
| 5 | Zero Tenant Leakage Gate | ✅ DONE | This document |

---

## 7. Sign-off

| Role | Name | Date | Decision |
|------|------|------|----------|
| Auditor | RB-01 Automation | 2026-06-28 | 🔴 NO-GO — 21 active exploitation paths exist. P0-B1 cannot close. |
| Remediation Owner | P0-B2 (RB-02) | TBD | Must turn all 7 ZTL gate criteria to GREEN |
| Verifier | P0-B2 (RB-03) | TBD | Must run cross-tenant-attack.mjs and confirm exit code 1 |
