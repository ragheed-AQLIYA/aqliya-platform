# RB-01 Phase 2: Tenant Isolation Matrix

**Status:** DONE  
**Date:** 2026-06-28  
**Methodology:** Trace every Prisma query/mutation from server action → lib function, verifying `organizationId` (or equivalent) is in the `where` clause  

---

## 1. Matrix Legend

| Rating | Meaning |
|--------|---------|
| ✅ **SCOPED** | Prisma query includes `organizationId` or traverses through `project.organizationId` |
| ⚠️ **PARTIAL** | Query has some scoping but vulnerable to client-supplied orgId or missing ownership check |
| ❌ **UNSCOPED** | Query uses only object ID without any org scope |
| 🔴 **TRUST_BOUNDARY** | Query IS scoped (correct `where` clause) but the orgId value comes from client without verification |

---

## 2. Workbook Actions — Tenant Scope Audit

### 2.1 Lib: `workbook/population.ts`

| Function | Prisma Query | Scope Check | Verdict |
|----------|-------------|-------------|---------|
| `populateWorkbookFromProject` | `findUnique({ where: { id: projectId } })` | No orgId in where | ❌ UNSCOPED |
| | `findFirst({ where: { projectId } })` | No orgId | ❌ UNSCOPED |
| | `create({ data: { projectId, ... } })` | No orgId check on project ownership | ❌ UNSCOPED |
| | `createMany({ data: [...] })` | Lines created with workbookId only | ❌ UNSCOPED |
| `populateWorkbookFromTb` | `findUnique({ where: { id: projectId } })` | No orgId | ❌ UNSCOPED |
| | `findFirst({ where: { projectId } })` | No orgId | ❌ UNSCOPED |
| | `create({ data: { projectId, ... } })` | No orgId check | ❌ UNSCOPED |
| | `deleteMany({ where: { workbookId } })` | No orgId | ❌ UNSCOPED |
| | `createMany({ data: [...] })` | Lines with workbookId only | ❌ UNSCOPED |
| | Internal call: `runWorkbookAiReview(project.organizationId, ...)` | Uses project orgId ✅ | ✅ SCOPED (but only because project was already loaded) |
| `recalculateWorkbookStats` | `findUnique({ where: { id: workbookId } })` | No orgId | ❌ UNSCOPED |
| | `findMany({ where: { workbookId } })` | No orgId | ❌ UNSCOPED |
| | `update({ where: { id: workbookId } })` | No orgId | ❌ UNSCOPED |
| | `update({ where: { id: lineId } })` | No orgId | ❌ UNSCOPED |
| `getWorkbookWithLines` | `findUnique({ where: { id: workbookId }, include: { lines } })` | No orgId | ❌ UNSCOPED |
| `updateWorkbookLineValue` | `findUnique({ where: { id: lineId } })` | No orgId | ❌ UNSCOPED |
| | `findUnique({ where: { id: line.workbookId } })` | No orgId | ❌ UNSCOPED |
| | `update({ where: { id: lineId } })` | No orgId | ❌ UNSCOPED |
| `listProjectWorkbooks` | `findMany({ where: { projectId } })` | No orgId | ❌ UNSCOPED |
| `listOrganizationWorkbooks` | `findMany({ where: { project: { organizationId } } })` | ✅ Uses orgId | ✅ SCOPED |
| `deleteWorkbook` | `findUnique({ where: { id: workbookId } })` | No orgId | ❌ UNSCOPED |
| | `delete({ where: { id: workbookId } })` | No orgId | ❌ UNSCOPED |

**Verdict:** 18/20 queries are UNSCOPED. Only `listOrganizationWorkbooks` is scoped. `populateWorkbookFromTb`'s AI review call is scoped because it uses `project.organizationId` derived from the (unscoped) project lookup.

---

### 2.2 Lib: `workbook/services.ts`

| Function | Prisma Query | Scope Check | Verdict |
|----------|-------------|-------------|---------|
| `getWorkbookDashboardSummary` | `findMany({ where: { project: { organizationId } } })` | ✅ Uses orgId | ✅ SCOPED |
| `createWorkbook` | `findUnique({ where: { id: projectId } })` | No orgId in where | ❌ UNSCOPED |
| | `create({ data: { projectId, ... } })` | No orgId check | ❌ UNSCOPED |
| | `createMany({ data: [...] })` | Lines with workbookId only | ❌ UNSCOPED |
| | `findUnique({ where: { id: workbook.id } })` | No orgId | ❌ UNSCOPED |
| `exportWorkbookJson` | `findUnique({ where: { id: workbookId }, include: { lines, project } })` | No orgId | ❌ UNSCOPED |
| `markWorkbookExported` | `findUnique({ where: { id: workbookId } })` | No orgId | ❌ UNSCOPED |
| | `update({ where: { id: workbookId } })` | No orgId | ❌ UNSCOPED |

**Verdict:** 6/7 queries UNSCOPED. Only `getWorkbookDashboardSummary` is scoped.

---

### 2.3 Lib: `workbook/missing-data.ts`

| Function | Prisma Query | Scope Check | Verdict |
|----------|-------------|-------------|---------|
| `detectMissingData` | `findMany({ where: { workbookId } })` | No orgId | ❌ UNSCOPED |
| `generateDataRequest` | `findUnique({ where: { id: workbookId } })` | No orgId | ❌ UNSCOPED |
| | `create({ data: { workbookId, ... } })` | No orgId check | ❌ UNSCOPED |
| | `findMany({ where: { workbookId } })` | No orgId | ❌ UNSCOPED |
| | `createMany({ data: [...] })` | No orgId | ❌ UNSCOPED |
| `getWorkbookDataRequests` | `findMany({ where: { workbookId } })` | No orgId | ❌ UNSCOPED |
| `fulfillDataRequestItem` | `update({ where: { id: itemId } })` | No orgId | ❌ UNSCOPED |
| `waiveDataRequestItem` | `update({ where: { id: itemId } })` | No orgId | ❌ UNSCOPED |
| `sendDataRequest` | `update({ where: { id: requestId } })` | No orgId | ❌ UNSCOPED |
| `getClientDataRequestText` | `findUnique({ where: { id: requestId } })` | No orgId | ❌ UNSCOPED |

**Verdict:** 10/10 queries UNSCOPED.

---

## 3. AI Advisor Actions — Tenant Scope Audit

### 3.1 Lib: `workbook/ai-advisor.ts`

| Function | Key Prisma Queries | Scope Check | Verdict |
|----------|-------------------|-------------|---------|
| `suggestPatternImprovements` | `findUnique({ where: { id: workbookId } })` | No orgId | ❌ UNSCOPED |
| | `findMany({ where: { organizationId, ... } })` | ✅ Uses orgId | ✅ SCOPED |
| | `create({ data: { organizationId, ... } })` | ✅ Uses orgId | ✅ SCOPED |
| `explainAccountMatches` | `findUnique({ where: { id: workbookId } })` | No orgId | ❌ UNSCOPED |
| | `findFirst({ where: { organizationId, ... } })` | ✅ Uses orgId | ✅ SCOPED |
| | `create({ data: { organizationId, ... } })` | ✅ Uses orgId | ✅ SCOPED |
| `listPendingFalsePositives` | `findMany({ where: { organizationId, ... } })` | ✅ Uses orgId | ✅ SCOPED |
| `reviewFalsePositive` | `findUnique({ where: { id: matchReviewId } })` | No orgId | ❌ UNSCOPED |
| | `update({ where: { id: matchReviewId } })` | No orgId | ❌ UNSCOPED |
| | `upsert({ where: { organizationId, ... } })` | ✅ Uses orgId | ✅ SCOPED |
| `batchReviewFalsePositives` | Delegates to `reviewFalsePositive` | Same | ❌ UNSCOPED |
| `getIndustryPatternBenchmarks` | `findMany({ where: { industry? } })` | Global data | N/A (global) |
| `getOrganizationMatchMemory` | `findMany({ where: { organizationId } })` | ✅ Uses orgId | ✅ SCOPED |
| `calibrateWorkbookConfidence` | `findUnique({ where: { id: workbookId } })` | No orgId | ❌ UNSCOPED |
| | `findFirst({ where: { organizationId } })` | ✅ Uses orgId | ✅ SCOPED |
| | Various queries with `organizationId` | ✅ Uses orgId | ✅ SCOPED |
| `listPendingPatternSuggestions` | `findMany({ where: { organizationId, ... } })` | ✅ Uses orgId | ✅ SCOPED |
| `reviewPatternSuggestion` | `findUnique({ where: { id: suggestionId } })` | No orgId | ❌ UNSCOPED |
| | `update({ where: { id: suggestionId } })` | No orgId | ❌ UNSCOPED |
| | `upsert({ where: { organizationId, ... } })` | ✅ Uses orgId | ✅ SCOPED |

**Pattern:** Scoping depends on whether `organizationId` is provided. When it is, queries are properly scoped. The **critical finding**: `reviewFalsePositive` and `reviewPatternSuggestion` use `findUnique({ where: { id } })` WITHOUT `organizationId` — so any user can act on any suggestion/review by ID if they reach these functions.

---

### 3.2 Lib: `workbook/ai-auto-review.ts`

| Function | Key Prisma Queries | Scope Check | Verdict |
|----------|-------------------|-------------|---------|
| `runWorkbookAiReview` | `create({ data: { organizationId, ... } })` | ✅ Uses orgId | ✅ SCOPED |
| | `findUnique({ where: { id: workbookId } })` | No orgId (just gets projectId) | ❌ UNSCOPED |
| | `update({ where: { id: reviewRun.id } })` | No orgId | ❌ UNSCOPED |
| | Delegates to `ai-advisor.ts` functions | Uses provided orgId | ✅ SCOPED |
| `getWorkbookReviewStatus` | `findFirst({ where: { organizationId, workbookId } })` | ✅ Uses orgId | ✅ SCOPED |
| | `count({ where: { organizationId, ... } })` | ✅ Uses orgId | ✅ SCOPED |

**Verdict:** Mixed. The create/read queries use `organizationId`. The `findUnique` for workbook doesn't scope by orgId but it's used only to get `projectId` for the audit event, not for access control. **However**, this function is called from `populateWorkbookFromTb` which has no auth check.

---

## 4. Review Actions — Tenant Scope Audit

### 4.1 Lib: `localcontent-review-actions.ts` (inline Prisma)

| Function | Key Prisma Queries | Scope Check | Verdict |
|----------|-------------------|-------------|---------|
| `getReviewQueueAction` | `findMany({ where: { organizationId, ... } })` | Uses orgId from client | 🔴 TRUST_BOUNDARY |
| | `count({ where: { organizationId } })` | Uses orgId from client | 🔴 TRUST_BOUNDARY |
| `reviewSuggestionAction` | Delegates to `reviewPatternSuggestion` | No orgId in call | ❌ Not checked at action level |
| `reviewExplanationAction` | Delegates to `reviewFalsePositive` | No orgId in call | ❌ Not checked at action level |
| `createPatternOverrideAction` | `create({ data: { organizationId, ... } })` | Uses orgId from client | 🔴 TRUST_BOUNDARY |
| `batchReviewAction` | Delegates to individual functions | Same | ❌ Not checked at action level |
| `addReviewCommentAction` | Inline Prisma queries by ID only | No orgId | ❌ UNSCOPED |

---

## 5. AI Advisor V3 Actions — Tenant Scope Audit

### 5.1 Action → Lib Tracing

| Action | Lib Function(s) Called | How orgId reaches lib | Trust Verdict |
|--------|----------------------|----------------------|--------------|
| `runWorkbookAiReviewAction(orgId, wbId, lines)` | `runWorkbookAiReview(orgId, wbId, lines, userId)` | orgId = client param | 🔴 CLIENT-SUPPLIED — no session verification |
| `getWorkbookReviewStatusAction(orgId, wbId)` | `getWorkbookReviewStatus(orgId, wbId)` | orgId = client param | 🔴 CLIENT-SUPPLIED |
| `generateRecommendationsAction(orgId, wbId)` | `generateRecommendations(orgId, wbId)` | orgId = client param | 🔴 CLIENT-SUPPLIED |
| `listWorkbookRecommendationsAction(orgId, wbId)` | `listWorkbookRecommendations(orgId, wbId)` | orgId = client param | 🔴 CLIENT-SUPPLIED |
| `reviewRecommendationAction(recId, decision, notes)` | `reviewRecommendation(recId, decision, notes, userId)` | None — uses recId directly | ❌ UNSCOPED — no org check at all |
| `runSimulationAction(orgId, wbId, type, params)` | `runSimulation(orgId, wbId, scenario)` | orgId = client param | 🔴 CLIENT-SUPPLIED |
| `listWorkbookSimulationsAction(orgId, wbId)` | `listWorkbookSimulations(orgId, wbId)` | orgId = client param | 🔴 CLIENT-SUPPLIED |
| `getPatternHealthScoresAction(orgId)` | `getPatternHealthScores(orgId)` | orgId = client param | 🔴 CLIENT-SUPPLIED |
| `getLearningLoopSummaryAction(orgId)` | `getLearningLoopSummary(orgId)` | orgId = client param | 🔴 CLIENT-SUPPLIED |
| `getWorkbookAiDashboardDataAction(orgId, wbId)` | Multiple | orgId = client param | 🔴 CLIENT-SUPPLIED |

**Verdict:** The lib functions themselves ARE scoped (they use `organizationId` in `where` clauses). But the **trust boundary** is violated because the orgId comes from the client, not from the session. 9/10 actions pass orgId from client to lib.

---

## 6. Core Compliance Actions — Tenant Scope Audit

### 6.1 Lib: `services.ts` (main CRUD)

All functions in `services.ts` are called from `localcontent-actions.ts`, which uses `assertProjectAccess`. The pattern is:

1. Action calls `assertProjectAccess(projectId, role)` → loads project, verifies `user.organizationId === project.organizationId`
2. If guard passes, calls lib function with `projectId` or `organizationId`
3. Lib function queries with `projectId` or `organizationId` in `where`

| Function | Scope Mechanism | Verdict |
|----------|----------------|---------|
| `listProjectsByOrganization(orgId)` | `where: { organizationId: orgId }` | ✅ SCOPED (orgId from session via requireUserContext) |
| `getProjectById(projectId)` | `where: { id: projectId }` | ✅ SCOPED (access controlled by guard) |
| `createProject({ organizationId, ... })` | `data: { organizationId }` | ✅ SCOPED (orgId from session) |
| `updateProjectStatus(projectId, ...)` | `where: { id: projectId }` | ✅ SCOPED (access controlled by guard) |
| `listSuppliers(projectId)` | `where: { projectId }` | ✅ SCOPED (guard verified project ownership) |
| `listSpendRecords(projectId)` | `where: { projectId }` | ✅ SCOPED |
| `listEvidence(projectId)` | `where: { projectId }` | ✅ SCOPED |
| `listFindings(projectId)` | `where: { projectId }` | ✅ SCOPED |
| All mutation functions | Via `projectId` + guard | ✅ SCOPED |

---

### 6.2 Lib: `content/services.ts` (Content Studio)

All Content Studio functions pass `organizationId` from `requireUserContext()` session. The session orgId is guaranteed by the auth middleware.

**Verdict:** ✅ All properly scoped.

---

### 6.3 Lib: `audit-events.ts`

| Function | Scope | Verdict |
|----------|-------|---------|
| `createLocalContentAuditEvent({ projectId, ... })` | `where: { projectId }` on audit event (no orgId) | ⚠️ PARTIAL — relies on caller having already verified project ownership |
| `createAiAuditEvent({ organizationId, ... })` | `data: { organizationId }` | ✅ SCOPED (but orgId must come from trusted source) |

**Risk:** `createLocalContentAuditEvent` does NOT include `organizationId` in the audit event record. If a caller passes a `projectId` from another org, the audit event would be written to that project's audit trail without ownership verification.

**Mitigation:** All callers of `createLocalContentAuditEvent` are in `localcontent-actions.ts` which use `assertProjectAccess` before calling. So in practice, the projectId is already verified. But the audit event itself has no orgId, making cross-org audit trail forgery possible if the caller bypasses the guard.

---

## 7. API Routes — Tenant Scope Audit

### 7.1 Evidence Download
- `assertProjectAccess(projectId, "view")` ✅ Verifies user org matches project org
- `assertEvidenceDownloadAccess({ organizationId, ... })` ✅ Double-checks orgId
- `enforce(user, { tenantId: user.organizationId })` ✅ Triple-checks
- **Verdict:** ✅ Fully scoped

### 7.2 Report Download
- `getCurrentUser()` ✅ Authentication
- `assertProjectAccess(projectId, "view")` ✅ Guard
- Inline `report.projectId !== projectId` ✅ Cross-tenant check
- **Verdict:** ✅ Fully scoped

---

## 8. Summary Matrix

### 8.1 By Surface

| Surface | Total Queries | Scoped | Partial | Unscoped | Trust Boundary |
|---------|--------------|--------|---------|----------|----------------|
| workbook/population.ts | 20 | 0 | 0 | 19 | 1 (AI review call — but uses loaded project's orgId, so it's actually safe) |
| workbook/services.ts | 7 | 1 | 0 | 6 | 0 |
| workbook/missing-data.ts | 10 | 0 | 0 | 10 | 0 |
| workbook/ai-advisor.ts | 20 | 14 | 0 | 6 | 0 |
| workbook/ai-auto-review.ts | 6 | 4 | 0 | 2 | 0 |
| review-actions.ts (inline) | 8 | 0 | 0 | 4 | 4 (2 client-supplied orgId) |
| ai-advisor-v3 actions | 10 | 0 | 0 | 1 | 9 (client-supplied orgId) |
| core compliance (services.ts) | ~45 | ~45 (via guard) | 0 | 0 | 0 |
| content studio (services.ts) | ~15 | ~15 | 0 | 0 | 0 |
| audit-events.ts | 2 | 1 | 1 | 0 | 0 |
| API routes | 4 | 4 | 0 | 0 | 0 |
| **TOTAL** | **~147** | **~84** | **1** | **48** | **13** |

### 8.2 By Risk Category

| Risk | Count | Details |
|------|-------|---------|
| **🔴 CRITICAL: Unscoped queries (no orgId in where)** | 48 | All workbook/population, workbook/services (mostly), workbook/missing-data (all), some ai-advisor queries (findUnique by id only), ai-auto-review (findUnique workbook), addReviewCommentAction inline queries |
| **🔴 CRITICAL: Client-supplied orgId without session verification** | 13 | 9 v3-actions + 2 review-actions + 2 review-actions with inline orgId queries |
| **🟡 MEDIUM: Partial scoping** | 1 | `createLocalContentAuditEvent` writes by projectId without orgId on the event record |
| **✅ Properly scoped** | ~84 | All core compliance, content studio, scoped ai-advisor queries, API routes, dashboard/scoring actions |

---

## 9. Root Cause Analysis

### 9.1 Why are workbook functions unscoped?

The workbook engine was built as an additive layer on top of the core compliance system. The core compliance system uses `assertProjectAccess` (which verifies org ownership via project). But the workbook actions (added later) did not adopt the same guard pattern.

**Pattern failure:** The 18 unscoped workbook action functions in `localcontent-workbook-actions.ts` were meant to be called ONLY from authenticated clients. But they accept `projectId`/`workbookId`/`lineId`/`requestId` as parameters and pass them directly to lib functions that never check org ownership.

### 9.2 Why do V3 actions accept client-supplied orgId?

The AI Advisor V3 actions (`localcontent-ai-advisor-v3-actions.ts`) were designed to be called from the client-side React components. The `organizationId` parameter comes from the client because the org context is available on the client. However, the server actions never verify that the client-provided orgId matches the session's orgId.

**Pattern failure:** `requireUserContext()` is called for authentication but the returned `user.organizationId` is never compared against the passed `organizationId` parameter.

### 9.3 Why is review-actions vulnerable?

The Review Center actions (`localcontent-review-actions.ts`) were built with a hybrid pattern — some accept `organizationId`, others use only `getCurrentUser()`. The `getCurrentUser()` function returns user info including `organizationId`, but none of the functions use it for authorization checks beyond "is there a user?"

---

## 10. Recommended Remediation Priority

Based on impact × likelihood:

| Rank | Issue | Affected Functions | Recommendation | Assigned To |
|------|-------|-------------------|----------------|-------------|
| P0-B1-01 | **workbook-actions: 18 unscoped functions** | All in localcontent-workbook-actions.ts | Add `assertProjectAccess` (or new `assertWorkbookAccess`) guard before every function that accepts `projectId` or `workbookId` | P0-B2 (RB-02) |
| P0-B1-02 | **v3-actions: 9 client-supplied orgId** | runWorkbookAiReviewAction, getWorkbookReviewStatusAction, generateRecommendationsAction, listWorkbookRecommendationsAction, runSimulationAction, listWorkbookSimulationsAction, getPatternHealthScoresAction, getLearningLoopSummaryAction, getWorkbookAiDashboardDataAction | Compare `user.organizationId` against passed `organizationId` after `requireUserContext()` | P0-B2 (RB-02) |
| P0-B1-03 | **review-actions: 2 client-supplied orgId** | getReviewQueueAction, createPatternOverrideAction | Add org verification or switch to project-scoped access | P0-B2 (RB-02) |
| P0-B1-04 | **review-actions: 4 functions with no org check** | reviewSuggestionAction, reviewExplanationAction, batchReviewAction, addReviewCommentAction | Add `assertProjectAccess` or equivalent guard | P0-B2 (RB-02) |
| P0-B1-05 | **ai-advisor: findUnique without orgId** | `reviewFalsePositive`, `reviewPatternSuggestion` — both use `findUnique({ where: { id } })` without orgId | Add `organizationId` to where clause or verify ownership before acting | P0-B2 (RB-02) |
| P0-B1-06 | **audit-events: no orgId on event record** | `createLocalContentAuditEvent` | Add `organizationId` field to the audit event record for traceability | P0-B4 (SC-02) or P0-C |
| P0-B1-07 | **Workbook lib findUnique by ID (16 calls)** | All findUnique/findFirst by ID without orgId in workbook libs | Add org scope or document as "guarded by caller" | P0-B2 (RB-02) |

---

## 11. False Positives (Verified Safe)

These functions appear potentially unsafe but are confirmed safe:

| Function | Why It's Safe |
|----------|--------------|
| `getIndustryBenchmarksAction` | Reads global industry pattern data — no org scope needed |
| `checkAiHealthAction` | Reads system-level AI health — no org data accessed |
| `isAiHealthyAction` | Same — no org data |
| `getPilotReadinessAction` | Uses `user.organizationId` from session ✅ |
| `getAiQualityMetricsAction` | Uses `user.organizationId` from session ✅ |

---

## 12. Next Phase

**Phase 3: Trust Boundary Audit** (`03_TRUST_BOUNDARY_AUDIT.md`)

For each of the 13 instances where `organizationId` comes from the client (or is absent entirely), trace the full request path to determine whether exploitation is possible in practice, considering:

1. React Router / client-side state management
2. URL parameter injection
3. FormData manipulation
4. Server Action parameter forgery
5. Whether the function is exportable from the module
6. Whether the function appears in any client bundle (Next.js `"use server"` implications)
