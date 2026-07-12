# AQLIYA Authorization — DecisionOS Publication Actions Plan

## 1. Purpose of This Planning Note

This note analyzes the two remaining legacy `requireDecisionAccess()` call sites in `decisions.ts` — `publishRecommendationAction` and `unpublishRecommendationAction` — to determine whether they can be migrated cleanly in a bounded Wave 4, and exactly how.

---

## 2. Current Status After Wave 3

**Wave 3 migrated 14 actions** in `decisions.ts` from `requireDecisionAccess()` to `getCurrentUser()` + `enforce()`.

After Wave 3, exactly **2 legacy calls remain**:

| Line | Action | Role Required |
|------|--------|--------------|
| 808 | `publishRecommendationAction` | ADMIN |
| 980 | `unpublishRecommendationAction` | ADMIN |

Both were deferred because they appeared to be complex, admin-only, and snapshot-heavy. This note verifies that hypothesis.

---

## 3. `publishRecommendationAction` — Current Analysis

**File:** `src/actions/decisions.ts` (lines 803–976)
**Lines:** ~173

### 3.1 Current auth path

```ts
const access = await requireDecisionAccess(decisionId, "ADMIN");
const user = access.user;
// ... uses access.organizationId for audit logging
```

`requireDecisionAccess` performs: find decision → get organizationId → `requireOrgAccess(orgId, "ADMIN")` → return `{ user, organizationId }`.

### 3.2 High-level workflow steps

1. Auth check (ADMIN role, org isolation)
2. Fetch existing recommendation (`prisma.recommendation.findUnique`)
3. Fetch latest approval with snapshot (`prisma.approval.findFirst`)
4. **Snapshot diff logic**: compare current recommendation against approved snapshot
5. **Three publish paths:**
   - **Stale publish blocked**: snapshot differs, no override → audit log + return error with `requiresOverride: true`
   - **Force publish current**: snapshot differs, `forcePublishCurrent=true` → audit log + update recommendation (publishedFromSnapshot=false)
   - **Publish from snapshot**: snapshot matches → update recommendation (publishedFromSnapshot=true, link to approval)
   - **Publish without approval**: no snapshot exists → update recommendation (publishedFromSnapshot=false)
6. Each path does `prisma.recommendation.update` + `logAudit`

### 3.3 Authorization concerns

- **Who may execute:** ADMIN only
- **What role/permission:** The action changes publication state of a recommendation — an admin-level governance operation
- **Tenant isolation:** Must be scoped to the decision's organization

### 3.4 Business/governance concerns

These are **not authorization** and must stay in the business logic:

- Whether the recommendation exists (precondition check)
- Whether an approval snapshot exists and whether it matches the current recommendation (readiness check)
- The `forcePublishCurrent` override logic (governance policy)
- The decision of which publish path to take (business rule)

### 3.5 Snapshot / side-effect concerns

- `prisma.recommendation.update` with `isClientVisible`, `publishedAt`, `publishedById`, `publishedVersion`, `publishedFromSnapshot`, `publishedApprovalId`
- Multiple `logAudit` calls with different event types: `STALE_PUBLISH_BLOCKED`, `STALE_PUBLISH_OVERRIDE`, `CURRENT_PUBLISHED_WITHOUT_APPROVAL`, `SNAPSHOT_PUBLISHED`
- These are business side-effects, not authorization concerns

### 3.6 Likely target `enforce()` mapping

```ts
const user = await getCurrentUser();
const decisionLookup = await prisma.decision.findUnique({
  where: { id: decisionId },
  select: { organizationId: true },
});
if (!decisionLookup) return { success: false, error: "Decision not found" };
await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "admin");
```

- **Resource type:** `"decision"` (consistent with all other DecisionOS actions)
- **Action:** `"admin"` (ADMIN-only operation; already used in `organization-actions.ts` and `sso-admin-actions.ts`)
- The existing `AccessAction` taxonomy includes `"admin"`, and `ROLE_PERMISSIONS.admin` includes it. No new action concept needed.

### 3.7 Migration difficulty and risks

- **Difficulty:** Low — the auth replacement is mechanical
- **Risk 1:** The `access.organizationId` is used in 5 `logAudit` calls. After migration, this must be replaced with `decisionLookup.organizationId` (available from the same findUnique).
- **Risk 2:** The `access.user` is used as `user` throughout. After migration, `user` comes from `getCurrentUser()` — functionally identical.
- **Risk 3:** The integration test (`recommendation-publication.test.ts`) mocks `requireDecisionAccess` without enforcing the ADMIN role — the mock returns the user regardless of the `role` parameter. The test creates OPERATOR users but calls publish successfully. This is a **pre-existing test bug**, not a migration blocker, but the test mock must be updated to match the new auth pattern.

---

## 4. `unpublishRecommendationAction` — Current Analysis

**File:** `src/actions/decisions.ts` (lines 978–1008)
**Lines:** ~30

### 4.1 Current auth path

```ts
const access = await requireDecisionAccess(decisionId, "ADMIN");
const user = access.user;
// ... uses access.organizationId for audit logging
```

Identical pattern to `publishRecommendationAction`.

### 4.2 High-level workflow steps

1. Auth check (ADMIN role, org isolation)
2. `prisma.recommendation.update` — set `isClientVisible: false`, clear snapshot references
3. `logAudit` with event `OUTPUT_UNPUBLISHED`
4. Return success

### 4.3 Authorization concerns

- **Who may execute:** ADMIN only
- **What role/permission:** Reverting publication state — admin-level governance operation
- **Tenant isolation:** Must be scoped to the decision's organization

### 4.4 Business/governance concerns

Minimal — unpublish is a simple state revert. No readiness checks, no snapshot comparison.

### 4.5 Snapshot / side-effect concerns

- `prisma.recommendation.update` with `isClientVisible: false`, `publishedFromSnapshot: false`, `publishedApprovalId: null`
- One `logAudit` call: `OUTPUT_UNPUBLISHED`
- Business side-effects, not authorization

### 4.6 Likely target `enforce()` mapping

```ts
const user = await getCurrentUser();
const decisionLookup = await prisma.decision.findUnique({
  where: { id: decisionId },
  select: { organizationId: true },
});
if (!decisionLookup) return { success: false, error: "Decision not found" };
await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "admin");
```

Same mapping as publish: `"decision"` resource, `"admin"` action.

### 4.7 Migration difficulty and risks

- **Difficulty:** Very low — simple, mechanical replacement
- **Risk 1:** `access.organizationId` used in `logAudit` — replace with `decisionLookup.organizationId`
- **Risk 2:** Same integration test mock issue as publish

---

## 5. Shared Findings Across Both Publication Actions

### What is common

- Both require **ADMIN** role
- Both use `requireDecisionAccess(decisionId, "ADMIN")` returning `{ user, organizationId }`
- Both use `access.user` as the actor and `access.organizationId` for audit logging
- Both can be migrated with the identical pattern: `getCurrentUser()` → `findUnique(select: organizationId)` → `enforce("admin")`
- Both share the same integration test file with the same mock pattern

### What differs materially

- `publishRecommendationAction` is 173 lines with complex snapshot logic; `unpublishRecommendationAction` is 30 lines and trivial
- `publishRecommendationAction` has 4 distinct audit event types; `unpublishRecommendationAction` has 1
- `publishRecommendationAction` reads approval data and recommendation data before deciding which path to take; `unpublishRecommendationAction` directly updates

### Key observation

The **authorization replacement is identical** for both. The complexity difference is entirely in business logic, not auth. The migration is therefore bounded and mechanical.

---

## 6. Recommended Wave 4 Scope

**Verdict: Direct Wave 4 migration is safe.**

### In scope

| Item | Why |
|------|-----|
| `publishRecommendationAction` | Replace `requireDecisionAccess` with `getCurrentUser()` + `enforce("admin")` |
| `unpublishRecommendationAction` | Replace `requireDecisionAccess` with `getCurrentUser()` + `enforce("admin")` |
| `requireDecisionAccess` import removal from `decisions.ts` | After these two migrations, zero calls remain — import can be removed |
| `requireUserContext` is already removed (Wave 3) | No action needed |
| Integration test mock update (`recommendation-publication.test.ts`) | Mock `requireDecisionAccess` must be replaced with `getCurrentUser` + `mockEnforce` pattern |

### Out of scope

- Snapshot logic refactoring
- Publication workflow redesign
- New permission concepts (e.g., dedicated `"publish"` action)
- Any other product modules
- Approval flow changes

### Files to change

| File | Change |
|------|--------|
| `src/actions/decisions.ts` | Migrate 2 actions, remove `requireDecisionAccess` import |
| `src/__tests__/integration/recommendation-publication.test.ts` | Update mock from `requireDecisionAccess` to `getCurrentUser` + `mockEnforce`; fix OPERATOR→ADMIN test users |

---

## 7. Recommendation on `enforce(resource, action)` Mapping

| Parameter | Value | Justification |
|-----------|-------|---------------|
| Resource type | `"decision"` | Consistent with all other DecisionOS actions |
| Action | `"admin"` | Established pattern for admin-only operations (used in `organization-actions.ts`, `sso-admin-actions.ts`) |
| New action needed? | **No** | `"admin"` exists in `AccessAction` and `ROLE_PERMISSIONS.admin` includes it |

**Long-term note:** A dedicated `"publish"` action would be semantically cleaner for audit trails and future ABAC policies. However, the current taxonomy is sufficient, and adding a new action would require changes to `types.ts`, `ROLE_PERMISSIONS`, and potentially the RB-02 engine — disproportionate effort for two actions. Recommend revisiting if publication actions proliferate across products.

---

## 8. Risks of Incorrectly Scoping Wave 4

- **Too broad:** If Wave 4 includes snapshot refactoring or approval flow changes, it becomes a DecisionOS Phase 2 project, not an authorization migration
- **Too narrow:** If the integration test mock is not updated, the tests will pass but won't actually validate the new auth path
- **Wrong action:** If `"update"` is used instead of `"admin"`, OPERATOR users could publish/unpublish — violating the current business rule that only ADMINs can publish

---

## 9. Final Recommended Wave 4 Boundary

**Wave 4 scope: Migrate the last 2 `requireDecisionAccess` call sites in `decisions.ts` to `enforce("admin")`.**

### Exact work

1. **`publishRecommendationAction`:** Replace `requireDecisionAccess(decisionId, "ADMIN")` with `getCurrentUser()` → `findUnique(select: organizationId)` → `enforce("admin")`. Replace all `access.organizationId` with `decisionLookup.organizationId`. Replace `access.user` with `user` from `getCurrentUser()`.

2. **`unpublishRecommendationAction`:** Same pattern — identical replacement.

3. **Import cleanup:** Remove `requireDecisionAccess` from `decisions.ts` import block. After this, zero legacy auth calls remain in the file.

4. **Integration test update:** In `recommendation-publication.test.ts`, replace the `requireDecisionAccess` mock with `getCurrentUser` + `mockEnforce` pattern. Fix test users from OPERATOR to ADMIN (current tests are incorrectly testing with OPERATOR role while the code requires ADMIN).

### Acceptance criteria

| Criterion | Target |
|-----------|--------|
| `requireDecisionAccess` calls in `decisions.ts` | 0 (was 2) |
| `requireDecisionAccess` import in `decisions.ts` | Removed |
| `npx tsc --noEmit` | 0 errors |
| `recommendation-publication.test.ts` | Passes with real auth mock |
| `decision-actions.test.ts` | Still passes (no regression) |
| All 54 `enforce()` call sites | No regressions |
