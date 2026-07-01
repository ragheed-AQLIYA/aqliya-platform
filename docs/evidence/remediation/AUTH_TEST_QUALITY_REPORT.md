# Authorization Test Quality Report

**Finding 5 from `REVIEW_AFTER_PHASE2.md`** — Authorization Test Audit

## Audit Claim

> "Determine if tests verify authorization, tenant isolation, and ABAC — or only mocked calls."

## Verdict: **MOSTLY REFUTED** — Tests are surprisingly thorough (~280+ tests), though gaps exist.

---

## Test Coverage Breakdown

| Category | Count | Verification Level |
|----------|-------|-------------------|
| **Authorization** (role → action) | ~180+ | Pure functions, server actions, route handlers, API routes |
| **Tenant Isolation** (org A ≠ org B) | ~45+ | Unit tests, integration tests, real DB tests (2), schema regex checks |
| **ABAC** (attribute-based access) | ~35+ | Full CRUD lifecycle, 14 condition operators, multi-policy evaluation |
| **Low-value (mock call verification only)** | ~10 | 3-4 files, typically verifying mocks were called |
| **Total** | ~280+ across 40 files | |

---

## Evidence by Layer

### Layer 1: Pure Function Tests (Unit Level)

| File | Tests | What it Verifies |
|------|-------|-----------------|
| `authorize.test.ts` | 16 | `hasPermission`, `hasSufficientRoleLevel`, `authorize` — all roles |
| `types.test.ts` | 15 | `normalizeRole`, `principalFromUser`, `ROLE_HIERARCHY`, `ROLE_PERMISSIONS` |
| `middleware-bridge.test.ts` | 15 | `checkRouteRole` (10), `getRouteMinRole` (5) |
| `action-guard.test.ts` | 7 | `guardRoleLevel` for all role pairs |
| `tenant-guard.test.ts` | 7 | `checkTenantAccess`, `assertTenantAccess` — cross-org, admin bypass |

**Verdict: Real authorization logic, not mocked calls.**

### Layer 2: Integration Tests (Server Actions)

| File | Tests | What it Verifies |
|------|-------|-----------------|
| `decision-actions.test.ts` | 29 | Role rejection, cross-org export rejection, tenant isolation |
| `knowledge-mining-security.test.ts` | ~37 | 4 role scenarios (Unauthenticated, Viewer, Operator, Admin), 7 actor spoofing tests |
| `contact-actions.test.ts` | 1 | Requires OPERATOR role |
| `sales-rbac.test.ts` | 6 | `salesos:read/create/update` permissions |

**Verdict: Real server-side authorization testing, not UI hiding.**

### Layer 3: Route Handler Tests (API Level)

| File | Tests | What it Verifies |
|------|-------|-----------------|
| `api-smoke.test.ts` | 10+ | MFA 401, SCIM auth guard, Evidence download 401, deny unknown actions |
| `decision-evidence-download-route.test.ts` | 10 | 401 unauthenticated, 404/403 for unauthorized access |
| `sales-export.test.ts` | 3 | 401, 403, 429 |
| `skills/evaluate/route.test.ts` | 2 | 401, 403 |

**Verdict: Verifies proper HTTP error codes for unauthenticated/unauthorized access.**

### Layer 4: Real Database Integration Tests

| File | Tests | What it Verifies |
|------|-------|-----------------|
| `org-scoping.test.ts` | 3 | Cross-org decision access with REAL Prisma database |
| `recommendation-publication.test.ts` | ~5 | Org scoping with REAL Prisma database |

**Verdict: Verifies actual database-level tenant isolation.**

### Layer 5: ABAC Tests

| File | Tests | What it Verifies |
|------|-------|-----------------|
| `abac.test.ts` | 30+ | Full CRUD, 14 condition operators (EQUALS, IN, GREATER_THAN, CONTAINS, etc.), multi-policy evaluation, deny-by-default |
| `abac-shadow.test.ts` | 1 | Shadow mode logs mismatch |
| `abac-shadow-report.test.ts` | 2 | Mismatch rate and readiness |
| `abac-enforce.test.ts` | 2 | Denial for allowlisted orgs |

**Verdict: Thorough ABAC testing with in-memory Prisma mock.**

### Layer 6: Tenant Isolation Tests

| File | Tests | What it Verifies |
|------|-------|-----------------|
| `cross-tenant-isolation.test.ts` | 42+ | Pure function, facade, schema regex, middleware config |
| `tenant-isolation-audit.test.ts` | 7 | `assertOrganizationAccess`, `requireRole`, schema fields |
| `decision-evidence.test.ts` | 3 | Cross-org upload, listing, delete |
| `workflowos-export.test.ts` | 3 | Cross-org export request, approval, download |
| `content-studio.test.ts` | 3 | Two orgs don't leak workspaces/templates |
| `sales-intel.test.ts` | 2 | Only current org forecasts |
| Tier A/B/NBA tests | 3 | Tenant isolation on overlay loads |

**Verdict: Comprehensive multi-level tenant isolation testing.**

---

## Gaps Identified

1. **No full pipeline integration test** — RBAC → Tenant → ABAC chain is never tested end-to-end without mocks
2. **No middleware integration test** — Route protection verified only via regex pattern matching, not actual request interception
3. **SalesOS parallel auth system** — `sales-rbac.test.ts` tests different entry points than core `authorize()`/`enforce()`
4. **~10 low-value tests** — Verify mock was called, not authorization logic (in `decision-evidence.test.ts`, `workflowos-export.test.ts`)

---

## Conclusion

The audit's concern that authorization tests "only verify mocked calls" is **largely refuted**. The codebase has a robust multi-layer authorization test suite with:

- **~180+** real authorization tests (role→action enforcement)
- **~45+** tenant isolation tests (including 2 real database tests)
- **~35+** ABAC tests (including 14 condition operators)
- **~10** low-value mock-call-verification tests

The primary gap is the lack of a full-pipeline integration test (RBAC → Tenant → ABAC end-to-end without mocks), but this is a completeness improvement, not a fundamental deficiency.
