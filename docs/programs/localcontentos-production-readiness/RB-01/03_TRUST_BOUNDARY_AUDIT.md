# RB-01 Phase 3: Trust Boundary Audit

**Status:** DONE  
**Date:** 2026-06-28  
**Methodology:** For every function flagged in Phase 2 as CRITICAL (unscoped or client-supplied orgId), trace the full request path and prove whether exploitation is possible in practice.

---

## 1. Attack Surface Overview

### 1.1 Who Can Attack

| Actor | Can Reach LCOS Routes? | Can Call Server Actions? | Risk |
|-------|----------------------|--------------------------|------|
| Unauthenticated user | ❌ (blocked by middleware) | ❌ (blocked by middleware) | None |
| Authenticated user from Org A | ✅ (viewer+ role on `/local-content`) | ✅ (via browser or direct POST) | **HIGH** — can attack Org B's data |
| Authenticated admin from Org A | ✅ | ✅ | **HIGH** — same attack surface, more data |
| External attacker (no session) | ❌ (blocked by middleware) | ❌ (blocked by middleware) | None |

**Key insight:** The middleware protects against unauthenticated access but provides **zero tenant isolation**. Once authenticated (any org, any role ≥ viewer), the attacker can call any exported server action with arbitrary parameters.

### 1.2 How Server Actions Are Invoked

Next.js server actions (files with `"use server"` directive) become callable via:

1. **React form action / useActionState** — `<form action={actionFn}>` or `useActionState(actionFn, initialState)`
2. **Direct function call from client** — `await actionFn(arg1, arg2)` in a `"use client"` component
3. **Direct HTTP POST** — `POST /local-content/workbook/[workbookId]` with `Next-Action` header + JSON body

In all cases:
- The middleware runs first (auth check) ✅
- The action function receives parameters from the client ❌ (no org verification)
- The lib function executes with the provided parameters ❌ (no org scoping in many cases)

---

## 2. Exploitation Path: Workbook Actions (18 unscoped)

### 2.1 Function Reachability

| Function | Imported By Client Component? | Reachable from UI? | Risk Level |
|----------|------------------------------|--------------------|------------|
| `createWorkbookAction(projectId, title)` | ❌ | No (latent) | MEDIUM |
| `populateWorkbookAction(projectId, title?)` | ❌ | No (latent) | MEDIUM |
| `populateWorkbookFromTbAction(projectId, tbLines, title?)` | ✅ tb-import-dialog.tsx | Yes — workbook detail page | **CRITICAL** |
| `getWorkbookAction(workbookId)` | ✅ page.tsx (server) / workbook-detail-client.tsx | Yes — workbook detail page | **CRITICAL** |
| `listProjectWorkbooksAction(projectId)` | ❌ | No (latent) | MEDIUM |
| `listOrganizationWorkbooksAction()` | ✅ page.tsx (server) | Yes — workbook list page | ✅ Safe (`requireUserContext` called) |
| `updateWorkbookLineAction(lineId, manualValue, notes?)` | ✅ workbook-detail-client.tsx | Yes — line editing | **CRITICAL** |
| `recalculateWorkbookAction(workbookId)` | ✅ workbook-detail-client.tsx | Yes — recalculate button | **CRITICAL** |
| `deleteWorkbookAction(workbookId)` | ❌ | No | LOW |
| `getWorkbookDashboardAction()` | ✅ workbook/page.tsx (server) | Yes — dashboard | ✅ Safe (`requireUserContext` called) |
| `detectMissingDataAction(workbookId)` | ✅ page.tsx (server) | Yes — workbook detail page (initial load) | **CRITICAL** |
| `generateDataRequestAction(workbookId)` | ✅ workbook-detail-client.tsx | Yes — generate request button | **CRITICAL** |
| `getDataRequestsAction(workbookId)` | ✅ page.tsx (server) / workbook-detail-client.tsx | Yes — workbook detail page | **CRITICAL** |
| `fulfillDataRequestItemAction(itemId, responseValue)` | ❌ | No (latent) | MEDIUM |
| `waiveDataRequestItemAction(itemId)` | ❌ | No (latent) | MEDIUM |
| `sendDataRequestAction(requestId)` | ✅ workbook-detail-client.tsx | Yes — send request | **CRITICAL** |
| `getDataRequestTextAction(requestId)` | ✅ workbook-detail-client.tsx | Yes — view request text | **CRITICAL** |
| `exportWorkbookAction(workbookId)` | ✅ workbook-detail-client.tsx | Yes — export button | **CRITICAL** |
| `markWorkbookExportedAction(workbookId)` | ✅ workbook-detail-client.tsx | Yes — mark exported | **CRITICAL** |
| `computeWorkbookScoreAction(workbookId)` | ✅ workbook-detail-client.tsx | Yes — compute score | **CRITICAL** |

### 2.2 Concrete Exploit: Reading Org B's Workbook Data

**Prerequisite:** Attacker is authenticated user in Org A with role ≥ viewer.

**Step-by-step:**

```
1. Attacker logs in to Org A → gets session cookie
2. Attacker navigates to /local-content/workbook (blocked by middleware without session)
3. Middleware allows access (has valid session, role ≥ viewer)
4. Attacker's browser loads the workbook list page (server component)
5. Attacker opens browser DevTools → Network tab
6. Attacker identifies the `getWorkbookAction(workbookId)` POST request pattern
7. Attacker guesses or enumerates workbook IDs from Org B (e.g., `cm0abc123...`)
8. Attacker calls:
   POST /local-content/workbook/[workbookId] HTTP/1.1
   Next-Action: [action-hash]
   Cookie: [valid-session-from-org-a]
   Content-Type: text/plain;charset=UTF-8
   
   ["cm0abc123..."]
   
9. The server:
   a. Middleware passes (valid session, role ≥ viewer) ✅
   b. `getWorkbookAction(workbookId)` executes — NO auth check ❌
   c. `getWorkbookWithLines(workbookId)` in lib/population.ts executes — NO orgId scope ❌
   d. `prisma.lcWorkbook.findUnique({ where: { id: "cm0abc123..." } })` returns Org B's data ❌
   e. Org B's workbook data (with financial lines, scores, etc.) is returned to Org A's user ❌
```

**Impact:**
- Org A reads Org B's workbook data (account names, financial values, supplier data)
- No authorization check at any layer between middleware and Prisma

### 2.3 Concrete Exploit: Writing to Org B's Workbook

**Same prerequisite.**

```
1. Attacker from Org A intercepts `updateWorkbookLineAction(lineId, manualValue, notes?)` call
2. Attacker modifies the request body to use a different Org B line ID
3. The server:
   a. Passes middleware ✅
   b. `updateWorkbookLineAction(lineId, manualValue, notes?)` — NO auth check ❌
   c. `updateWorkbookLineValue(lineId, manualValue, notes?)` in lib — NO orgId scope ❌
   d. `prisma.lcWorkbookLine.update({ where: { id: lineId }, data: { manualValue } })` — updates Org B's data ❌
4. Org A's user modifies Org B's workbook values
```

**Impact:**
- Org A corrupts Org B's financial data
- Data integrity violation across tenant boundary

### 2.4 Concrete Exploit: Creating Data in Org B's Project

```
1. Attacker from Org A calls `populateWorkbookFromTbAction(projectId, tbLines, title?)`
2. Attacker knows/guesses a project ID from Org B
3. The server creates a new workbook under Org B's project, populated with trial balance data
4. The workbook is now associated with Org B's project, visible to Org B's users
```

**Impact:**
- Data injection into Org B's project
- Could be used for social engineering or data contamination

---

## 3. Exploitation Path: V3 AI Advisor Actions (9 client-supplied orgId)

### 3.1 How `organizationId` Currently Flows

```
Server page.tsx (fetches orgId from DB) 
  → passes as prop to WorkbookDetailClient 
    → passes as prop to AiInsightsPanel 
      → calls runWorkbookAiReviewAction(orgId, wbId, lines)
        → lib function uses orgId in Prisma queries
```

**The trust boundary violation:**
- The server page correctly fetches `organizationId` from the database using `project.organizationId`
- But this value is passed to the client as a prop, then sent BACK in server action calls
- The server action does NOT verify the orgId against the session

### 3.2 Function Reachability

| Function | Imported By Client? | Reachable? | orgId Origin | Risk |
|----------|-------------------|------------|--------------|------|
| `checkAiHealthAction()` | ✅ ai-insights-panel.tsx | Yes — auto on mount | No orgId needed | ✅ Safe (system health) |
| `isAiHealthyAction()` | ❌ | No | No orgId needed | ✅ Safe |
| `getWorkbookReviewStatusAction(orgId, wbId)` | ✅ ai-insights-panel.tsx | Yes — loadDashboard | Client prop | **HIGH** |
| `runWorkbookAiReviewAction(orgId, wbId, lines)` | ✅ ai-insights-panel.tsx | Yes — run review button | Client prop | **HIGH** |
| `generateRecommendationsAction(orgId, wbId)` | ✅ ai-insights-panel.tsx | Yes — generate recs button | Client prop | **HIGH** |
| `listWorkbookRecommendationsAction(orgId, wbId, status?)` | ❌ | No | Client prop | MEDIUM (latent) |
| `reviewRecommendationAction(recId, decision, notes)` | ❌ | No | No orgId | MEDIUM (latent) |
| `runSimulationAction(orgId, wbId, type, params)` | ✅ ai-insights-panel.tsx | Yes — run simulation | Client prop | **HIGH** |
| `listWorkbookSimulationsAction(orgId, wbId)` | ❌ | No | Client prop | MEDIUM (latent) |
| `getPatternHealthScoresAction(orgId)` | ❌ | No | Client prop | MEDIUM (latent) |
| `getLearningLoopSummaryAction(orgId)` | ❌ | No | Client prop | MEDIUM (latent) |
| `getWorkbookAiDashboardDataAction(orgId, wbId)` | ✅ ai-insights-panel.tsx | Yes — loadDashboard | Client prop | **HIGH** |

### 3.3 Concrete Exploit: AI Review of Org B's Workbook

```
1. Org A's user navigates to their workbook detail page
2. Server page.tsx fetches:
   - workbook = getWorkbookAction(workbookId_from_url)
   - organizationId = project.organizationId (from DB — Org A's orgId)
3. Page renders WorkbookDetailClient with organizationId = "org-a-id"
4. WorkbookDetailClient passes organizationId to AiInsightsPanel
5. Attacker opens browser DevTools → modifies organizationId prop in React DevTools
6. OR: attacker intercepts POST to runWorkbookAiReviewAction and modifies the request body
7. Modified request:
   POST /local-content/workbook/[wb-id] HTTP/1.1
   Next-Action: [action-hash]
   
   ["org-b-id", "cm0workbook123...", [...]]
   
8. Server action:
   a. requireUserContext() → returns Org A's user context ✅
   b. No comparison: user.organizationId ("org-a-id") !== organizationId ("org-b-id") ❌
   c. Calls runWorkbookAiReview("org-b-id", "cm0workbook123...", lines, user.id)
   d. Lib function queries: prisma.lcAiReviewRun.create({ data: { organizationId: "org-b-id", ... } })
      — Creates AI review run under Org B's organization
   e. Reads workbook lines regardless of org ownership
9. Org A reads/writes Org B's AI review data
```

**Impact:**
- Cross-tenant access to AI review data
- Org A can trigger AI processing on Org B's data (resource consumption)
- AI review results stored under the wrong orgId → data contamination

### 3.4 Why Lib Scoping Doesn't Help Here

The lib functions (e.g., `runWorkbookAiReview`) ARE properly scoped — they use `organizationId` in `where` clauses. But the scoping is based on a value that the attacker controls via the client.

```
Lib function: runWorkbookAiReview(organizationId, workbookId, lines, userId)
  ├── prisma.lcMatchReview.create({ data: { organizationId, ... } })  ← orgId from client
  ├── prisma.lcWorkbook.findUnique({ where: { id: workbookId } })     ← NO orgId check!
  └── prisma.lcPatternSuggestion.create({ data: { organizationId, ... } }) ← orgId from client
```

The `findUnique({ where: { id: workbookId } })` call in `runWorkbookAiReview` has no `organizationId` filter. So even if orgId were verified, the workbook read itself is unscoped.

---

## 4. Exploitation Path: Review Actions (6 functions, mixed scoping)

### 4.1 Function Reachability

| Function | Imported By Client? | Reachable? | orgId Flow | Risk |
|----------|-------------------|------------|------------|------|
| `getReviewQueueAction(orgId)` | ✅ page.tsx (server) | Yes — initial load | Session orgId (server-side call) | **MEDIUM** — exported action could be called with arbitrary orgId |
| `reviewSuggestionAction(suggId, decision, notes)` | ✅ review-center-client.tsx | Yes — review buttons | No orgId — uses suggId directly | **CRITICAL** — any suggestion by ID |
| `reviewExplanationAction(matchReviewId, decision, notes)` | ✅ review-center-client.tsx | Yes — review buttons | No orgId — uses reviewId directly | **CRITICAL** — any match review by ID |
| `createPatternOverrideAction(orgId, code, current, suggested, reason)` | ❌ | No (latent) | Client-supplied orgId | MEDIUM |
| `batchReviewAction(type, ids, decision, notes)` | ✅ review-center-client.tsx | Yes — bulk review | No orgId — uses IDs directly | **CRITICAL** — any items by ID |
| `addReviewCommentAction(type, id, comment)` | ❌ | No (latent) | No orgId | MEDIUM |

### 4.2 Concrete Exploit: Review Org B's AI Suggestions

```
1. Org A's user navigates to /local-content/review-center
2. Page renders, showing review queue items fetched with Org A's orgId (server-side) ✅
3. Attacker opens DevTools → identifies a suggestion ID from Org B (e.g., by enumerating)
4. Attacker calls:
   POST /local-content/review-center HTTP/1.1
   Next-Action: [action-hash]
   
   ["cm0suggestion789...", "approved", "Looks good!"]
   
5. Server action:
   a. getCurrentUser() → Org A user returned ✅
   b. No role/org check ❌
   c. Calls reviewPatternSuggestion("cm0suggestion789...", "approved", ..., user.id)
   d. Lib function: prisma.lcPatternSuggestion.findUnique({ where: { id: "cm0suggestion789..." } })
     — Any org's suggestion returned! ❌
   e. Updates suggestion with Org A's user as reviewer
6. Org B's pattern suggestion is approved by Org A's user (unauthorized)
```

**Impact:**
- Cross-tenant AI pattern management
- Org A can approve/reject Org B's pattern suggestions
- Audit trail shows Org A's user as reviewer for Org B's data

### 4.3 Concrete Exploit: Direct HTTP POST to `getReviewQueueAction`

Even though `getReviewQueueAction` is primarily called from the server page with the session orgId, it's an exported server action that ANY client can call:

```
POST /local-content/review-center HTTP/1.1
Next-Action: [action-hash]
Cookie: [valid-session-from-org-a]

["org-b-id"]
```

The server action `getReviewQueueAction("org-b-id")`:
1. `getCurrentUser()` returns Org A's user ✅
2. No check that `user.organizationId` matches `organizationId` ❌
3. Prisma queries use `organizationId: "org-b-id"` — returns Org B's review queue ❌
4. Org A views Org B's complete review queue (suggestions, false positives, explanations) ❌

**Impact:** Read-only but high-value — Org A can see:
- All of Org B's pending suggestions (financial patterns)
- All of Org B's false positive reviews
- Review status, confidence scores, risk levels
- Full audit event counts

---

## 5. Exploitation Path: Lib-Level `findUnique` Without OrgId

### 5.1 The Pattern

In `ai-advisor.ts`, two critical functions use `findUnique({ where: { id } })` without `organizationId`:

```typescript
// reviewFalsePositive
prisma.lcMatchReview.findUnique({ where: { id: matchReviewId } })  // NO orgId

// reviewPatternSuggestion  
prisma.lcPatternSuggestion.findUnique({ where: { id: suggestionId } })  // NO orgId
```

These are called from:
- `reviewSuggestionAction` → `reviewPatternSuggestion(id, ...)` — reachable from client
- `reviewExplanationAction` → `reviewFalsePositive(id, ...)` — reachable from client
- `batchReviewAction` → both — reachable from client

### 5.2 Why This Matters

Even if the action layer is fixed to verify the user's org, the lib layer still has no `organizationId` in the `findUnique` call. A compromised action (or future action) could pass an ID from any org.

### 5.3 Exploit

```
1. Attacker knows suggestion ID "cm0suggestion-org-b-123"
2. Calls reviewSuggestionAction("cm0suggestion-org-b-123", "approved", "hacked")
3. Action checks auth (getCurrentUser) — passes
4. Lib function:
   - findUnique({ where: { id: suggestionId } }) — returns the suggestion, no matter which org
   - update({ where: { id: suggestionId } }) — updates the suggestion
5. Org B's pattern suggestion is approved by Org A's user
```

---

## 6. Summary: All Active Exploitation Paths

### 6.1 Currently Exploitable (Reachable from UI)

| # | Function | Vulnerability | Impact | Ease |
|---|----------|--------------|--------|------|
| E1 | `getWorkbookAction(wbId)` | No auth, no org scope | Read any workbook data | Trivial (browser DevTools) |
| E2 | `updateWorkbookLineAction(lineId, value, notes)` | No auth, no org scope | Write any workbook line | Trivial |
| E3 | `recalculateWorkbookAction(wbId)` | No auth, no org scope | Trigger recalculation on any workbook | Trivial |
| E4 | `populateWorkbookFromTbAction(projId, lines, title)` | No auth, no org scope | Create workbook in any project | Trivial |
| E5 | `detectMissingDataAction(wbId)` | No auth, no org scope | Read missing data for any workbook | Trivial |
| E6 | `generateDataRequestAction(wbId)` | No auth, no org scope | Create data request in any workbook | Trivial |
| E7 | `getDataRequestsAction(wbId)` | No auth, no org scope | Read data requests for any workbook | Trivial |
| E8 | `sendDataRequestAction(reqId)` | No auth, no org scope | Send any data request | Trivial |
| E9 | `getDataRequestTextAction(reqId)` | No auth, no org scope | Read any data request text | Trivial |
| E10 | `exportWorkbookAction(wbId)` | No auth, no org scope | Export any workbook (JSON with all data) | Trivial |
| E11 | `markWorkbookExportedAction(wbId)` | No auth, no org scope | Mark any workbook as exported | Trivial |
| E12 | `computeWorkbookScoreAction(wbId)` | No auth, no org scope | Compute score on any workbook | Trivial |
| E13 | `reviewSuggestionAction(id, decision, notes)` | No org check | Approve/reject any org's suggestions | Trivial |
| E14 | `reviewExplanationAction(id, decision, notes)` | No org check | Confirm/reject any org's explanations | Trivial |
| E15 | `batchReviewAction(type, ids, decision, notes)` | No org check | Batch review any org's items | Trivial |
| E16 | `runWorkbookAiReviewAction(orgId, wbId, lines)` | Client-supplied orgId (unverified) | AI review on wrong org's data | Moderate (needs orgId) |
| E17 | `getWorkbookReviewStatusAction(orgId, wbId)` | Client-supplied orgId (unverified) | Read any org's review status | Moderate |
| E18 | `generateRecommendationsAction(orgId, wbId)` | Client-supplied orgId (unverified) | Generate recs on wrong org's data | Moderate |
| E19 | `runSimulationAction(orgId, wbId, type, params)` | Client-supplied orgId (unverified) | Run simulation on wrong org's data | Moderate |
| E20 | `getWorkbookAiDashboardDataAction(orgId, wbId)` | Client-supplied orgId (unverified) | Read any org's AI dashboard data | Moderate |
| E21 | `getReviewQueueAction(orgId)` | Client-supplied orgId (unverified) | Read any org's review queue | Trivial (direct POST) |

### 6.2 Total: 21 Active Exploitation Paths

| Category | Count |
|----------|-------|
| 🔴 **No auth at all** (workbook actions, E1-E12) | 12 |
| 🔴 **No org scope on review actions** (E13-E15) | 3 |
| 🔴 **Client-supplied orgId unverified** (v3 actions, E16-E20) | 5 |
| 🟡 **Client-supplied orgId unverified** (review action, E21) | 1 |

### 6.3 Key Insight

**The 12 unscoped workbook actions (E1-E12) represent the highest severity**: they require NO auth check at all within the action. An attacker doesn't need to manipulate the orgId — they just need to pass any valid `workbookId`, `lineId`, or `projectId`. The lib functions will happily process data from any organization.

**The v3 actions (E16-E20) are somewhat harder to exploit** because the attacker needs to know a valid `organizationId` and `workbookId` from another org, and the lib functions do scope most queries by `organizationId`. But `runWorkbookAiReview` still has an unscoped `findUnique({ where: { id: workbookId } })` that leaks workbook ownership data.

---

## 7. Non-Exploitable (False Positives Verified)

These are safe because they either don't access org data or use session-scoped orgId:

| Function | Why Safe |
|----------|----------|
| `checkAiHealthAction()` | System-level, no org data |
| `isAiHealthyAction()` | System-level, no org data |
| `getIndustryBenchmarksAction()` | Global data |
| `getPilotReadinessAction()` | Uses `user.organizationId` from session |
| `getAiQualityMetricsAction()` | Uses `user.organizationId` from session |
| `listOrganizationWorkbooksAction()` | Uses `requireUserContext()` for orgId |
| `getWorkbookDashboardAction()` | Uses `requireUserContext()` for orgId |
| `createPatternOverrideAction()` | Not imported by any client (latent) |
| `addReviewCommentAction()` | Not imported by any client (latent) |
| `reviewRecommendationAction()` | Not imported by any client (latent) |
| `listWorkbookRecommendationsAction()` | Not imported by any client (latent) |
| `listWorkbookSimulationsAction()` | Not imported by any client (latent) |
| `getPatternHealthScoresAction()` | Not imported by any client (latent) |
| `getLearningLoopSummaryAction()` | Not imported by any client (latent) |

**Note:** "Not imported by any client" means these are NOT currently exploitable from the UI, but they remain exported server actions. A direct HTTP POST could still reach them. This is lower risk because the attacker needs to discover the action hash, which is non-trivial.

---

## 8. Risk Quantification

| Metric | Value |
|--------|-------|
| Total exported server actions in LCOS | 39 |
| Currently exploitable from UI | **21 (53.8%)** |
| Require only browser DevTools | **15 (E1-E15)** |
| Require orgId manipulation | **6 (E16-E21)** |
| Latent (exported but not imported) | **14 (35.9%)** |
| Fully safe | **4 (10.3%)** — `checkAiHealthAction`, `isAiHealthyAction`, `listOrganizationWorkbooksAction`, `getWorkbookDashboardAction` |

---

## 9. Root Cause: Why Does This Exist?

The trust boundary violations stem from three architectural decisions:

### Decision 1: Server Actions as Client-Callable RPC
Next.js server actions blur the line between "server function" and "API endpoint." Developers treat them as regular functions, not as network endpoints that accept untrusted input. The `organizationId` parameter looks like a session value but actually comes from the client's React props.

### Decision 2: auth.js Abstraction Hides Org
The `requireUserContext()` call returns the user's organization, but the returned value is never used for authorization — only for authentication ("is there a user?"). The pattern `const _user = await requireUserContext()` (with underscore prefix) signals "I only need auth, not the user data."

### Decision 3: Workbook Layer Added Without Guard Reuse
The core compliance system (`localcontent-actions.ts`) correctly uses `assertProjectAccess()` before every operation. The workbook layer was added later as an extension but did not adopt the same guard pattern. The review center and AI advisor V3 were built with a different access model entirely.

---

## 10. Next Phase

**Phase 4: Leakage Proof** (`04_LEAKAGE_PROOF.md`)

For each of the 21 active exploitation paths, provide concrete evidence:
- Read actual cross-tenant data via server actions (where possible with test accounts)
- Or prove the exploit path with code analysis and request/response traces
- Document which paths are proven vs theoretical

The goal: demonstrate that cross-tenant data access IS possible, not just theoretically but with test evidence.
