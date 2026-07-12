# AQLIYA Authorization — Wave 4 Report

## 1. Scope of Wave 4

**In scope:**
- `publishRecommendationAction` in `src/actions/decisions.ts`
- `unpublishRecommendationAction` in `src/actions/decisions.ts`
- removal of `requireDecisionAccess` import from `decisions.ts`
- publication integration test fix (OPERATOR → ADMIN user setup, mock cleanup)

**Out of scope:**
- snapshot logic refactoring
- publication workflow redesign
- any other DecisionOS file
- permission model changes
- SalesOS / AuditOS / LocalContentOS / WorkflowOS
- RB-02 promotion

---

## 2. Summary of Implemented Changes

| Action / Surface | Files Changed | Change Summary | Status |
|-----------------|---------------|----------------|--------|
| `publishRecommendationAction` | `src/actions/decisions.ts` | Replaced `requireDecisionAccess("ADMIN")` with `getCurrentUser()` + `enforce("admin")` | ✅ |
| `unpublishRecommendationAction` | `src/actions/decisions.ts` | Replaced `requireDecisionAccess("ADMIN")` with `getCurrentUser()` + `enforce("admin")` | ✅ |
| `requireDecisionAccess` import | `src/actions/decisions.ts` | Removed — zero call sites remain | ✅ |
| Publication integration test | `src/__tests__/integration/recommendation-publication.test.ts` | Fixed OPERATOR → ADMIN users, cleaned auth mock | ✅ |

---

## 3. `publishRecommendationAction` Migration

**Previous auth path:**
```ts
const access = await requireDecisionAccess(decisionId, "ADMIN");
const user = access.user;
// ... access.organizationId used in 5 logAudit calls
```

**New `enforce()` mapping:**
```ts
const user = await getCurrentUser();
const decisionLookup = await prisma.decision.findUnique({
  where: { id: decisionId },
  select: { organizationId: true },
});
if (!decisionLookup) return { success: false, error: "Decision not found" };
await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "admin");
```

- **Resource type:** `"decision"`
- **Action:** `"admin"`
- **Minimal lookup:** `prisma.decision.findUnique({ select: { organizationId: true } })`

**Preserved business workflow logic:**
- Recommendation existence check
- Latest approval snapshot lookup
- Snapshot diff logic (stale publish blocked / force publish / snapshot publish / no-approval publish)
- All 4 publish paths with their respective `prisma.recommendation.update` calls
- All 5 `logAudit` calls (STALE_PUBLISH_BLOCKED, STALE_PUBLISH_OVERRIDE, CURRENT_PUBLISHED_WITHOUT_APPROVAL ×2, SNAPSHOT_PUBLISHED)
- `forcePublishCurrent` override semantics

**Notes:** `access.organizationId` (5 references) replaced with `decisionLookup.organizationId`. `access.user` replaced with `user` from `getCurrentUser()`.

---

## 4. `unpublishRecommendationAction` Migration

**Previous auth path:**
```ts
const access = await requireDecisionAccess(decisionId, "ADMIN");
const user = access.user;
// ... access.organizationId used in 1 logAudit call
```

**New `enforce()` mapping:**
```ts
const user = await getCurrentUser();
const decisionLookup = await prisma.decision.findUnique({
  where: { id: decisionId },
  select: { organizationId: true },
});
if (!decisionLookup) return { success: false, error: "Decision not found" };
await enforce(user, { type: "decision", id: decisionId, tenantId: decisionLookup.organizationId }, "admin");
```

- **Resource type:** `"decision"`
- **Action:** `"admin"`
- **Minimal lookup:** `prisma.decision.findUnique({ select: { organizationId: true } })`

**Preserved business workflow logic:**
- `prisma.recommendation.update` with `isClientVisible: false`, `publishedFromSnapshot: false`, `publishedApprovalId: null`
- `logAudit` call with event `OUTPUT_UNPUBLISHED`

**Notes:** Trivial migration — 30-line action with straightforward auth replacement.

---

## 5. `requireDecisionAccess` Retirement Status in `decisions.ts`

**Confirmed fully removed.** Zero `requireDecisionAccess` call sites remain in `src/actions/decisions.ts`. The import was removed from line 15.

The function still exists in `src/lib/auth.ts` and may be used by other files outside DecisionOS — those are out of scope for this wave.

---

## 6. Publication Test Fixes

**Bug fixed:** The integration test (`recommendation-publication.test.ts`) created OPERATOR users but called ADMIN-only publication actions. The mock for `requireDecisionAccess` bypassed the role check entirely, so the tests passed without actually validating authorization.

**Changes made:**
1. **Removed `requireDecisionAccess` mock** — no longer needed since the code uses `enforce()`
2. **Removed unused `requireUserContext` and `requireOrgAccess` mocks** — not referenced by migrated code
3. **Added `isExpectedAccessDeniedError` mock** — proper implementation matching the real function
4. **Changed OPERATOR → ADMIN** in both publish and unpublish test users
5. **Updated `getCurrentUser` mock values** to return ADMIN role

**Why the new setup is correct:**
- The real `enforce()` function runs (not mocked) — it checks tenant isolation and RBAC via `authorize()`
- ADMIN users have the `"admin"` permission in `ROLE_PERMISSIONS` — `enforce("admin")` succeeds
- If the test used OPERATOR users, `enforce("admin")` would throw — correctly rejecting unauthorized access
- The tests now validate the actual authorization path end-to-end

---

## 7. Validation Performed

| Command | Result | Summary |
|---------|--------|---------|
| `npx tsc --noEmit` | ✅ Pass | 0 errors |
| `npx jest --testPathPatterns="recommendation-publication"` | ✅ Pass | 4/4 tests pass |
| `npx jest --testPathPatterns="decision-actions"` | ✅ Pass | 29/29 tests pass |
| `npx jest --testPathPatterns="decision-evidence"` | ✅ Pass | 26/26 tests pass |

**Total: 59/59 tests pass across all DecisionOS test suites.**

---

## 8. Legacy DecisionOS Surfaces Remaining After Wave 4

After Wave 4, `requireDecisionAccess` is no longer used in `decisions.ts`. The function still exists in `src/lib/auth.ts` and may be referenced by other files outside `src/actions/decisions.ts` — those are outside Wave 4 scope.

Within DecisionOS specifically, all server actions in `decisions.ts` and `decision-evidence-actions.ts` now use the shared `getCurrentUser()` + `enforce()` authorization path.

---

## 9. Recommended Next Step

With `decisions.ts` fully migrated, the Authorization Consolidation Program can proceed to **Wave 5: remaining DecisionOS surfaces** — specifically any DecisionOS route handlers, API routes, or other files that still use legacy authorization patterns. Alternatively, the program can expand to the next product in the migration sequence (WorkflowOS or SalesOS) per the migration plan.
