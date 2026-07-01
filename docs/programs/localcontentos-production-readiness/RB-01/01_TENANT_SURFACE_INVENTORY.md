# RB-01 Phase 1: Tenant Surface Inventory

**Status:** DONE  
**Date:** 2026-06-28  
**Methodology:** Manual code inspection of every LCOS server action, API route, and lib file with direct Prisma access  
**Auditor:** OpenCode agent (cross-referenced against exploration data)  
**Verification:** Every function count, auth pattern, and risk flag verified by reading source files directly

---

## 1. Scope

This inventory catalogs every code path in LocalContentOS that reads or writes database rows with tenant (organization) scope. The goal is to enumerate every surface that must be tenant-isolated — not to assess the isolation (that's Phase 2).

---

## 2. Server Actions (116 functions, 9 files)

### 2.1 `src/actions/localcontent-actions.ts` — 38 functions
**Status:** Well-structured. All 38 use consistent patterns (`requireUserContext` or `assertProjectAccess`).

| # | Function | Auth Pattern | Tenant Scope | Risk |
|---|----------|-------------|-------------|------|
| 1 | `listLocalContentProjectsAction` | `requireUserContext("VIEWER")` | `user.organizationId` via service | NONE |
| 2 | `getLocalContentSpendAnalyticsAction` | `requireUserContext("VIEWER")` | `user.organizationId` via service | NONE |
| 3 | `getLocalContentClassificationRulesAction` | `requireUserContext("OPERATOR")` | `user.organizationId` via service | NONE |
| 4 | `getLocalContentTenderMatchAction` | `assertProjectAccess(projectId, "view")` | Project-scoped via guard | NONE |
| 5 | `getLocalContentVerificationChecklistAction` | `assertProjectAccess(projectId, "view")` | Project-scoped via guard | NONE |
| 6 | `getLocalContentTbSignalsAction` | `assertProjectAccess(projectId, "view")` | Project-scoped via guard | NONE |
| 7 | `updateLocalContentVerificationItemAction` | `assertProjectAccess(projectId, "admin")` | Project-scoped via guard | NONE |
| 8 | `getLocalContentProjectAction` | `assertProjectAccess(projectId, "view")` | Project-scoped via guard | NONE |
| 9 | `createLocalContentProjectAction` | `requireUserContext("ADMIN")` | `user.organizationId` | NONE |
| 10 | `updateLocalContentProjectAction` | `assertProjectAccess(projectId, "admin")` | Project-scoped via guard | NONE |
| 11 | `listLocalContentSuppliersAction` | `assertProjectAccess(projectId, "view")` | Project-scoped via guard | NONE |
| 12 | `createLocalContentSupplierAction` | `assertProjectAccess(projectId, "create_supplier")` | Project-scoped via guard | NONE |
| 13 | `updateLocalContentSupplierAction` | `assertProjectAccess(projectId, "create_supplier")` | Project-scoped + inline projectId check | NONE |
| 14 | `deleteLocalContentSupplierAction` | `assertProjectAccess(projectId, "create_supplier")` | Project-scoped via guard + service | NONE |
| 15 | `listLocalContentSpendRecordsAction` | `assertProjectAccess(projectId, "view")` | Project-scoped via guard | NONE |
| 16 | `createLocalContentSpendRecordAction` | `assertProjectAccess(projectId, "create_spend")` | Project-scoped via guard | NONE |
| 17 | `importLocalContentSpendCsvAction` | `assertProjectAccess(projectId, "create_spend")` | Project-scoped via guard | NONE |
| 18 | `classifyLocalContentSpendRecordAction` | `assertProjectAccess(projectId, "classify")` | Project-scoped via guard | NONE |
| 19 | `deleteLocalContentSpendRecordAction` | `assertProjectAccess(projectId, "create_spend")` | Project-scoped via guard + service | NONE |
| 20 | `listLocalContentEvidenceAction` | `assertProjectAccess(projectId, "view")` | Project-scoped via guard | NONE |
| 21 | `createLocalContentEvidenceAction` | `assertProjectAccess(projectId, "create_evidence")` | Project-scoped via guard | NONE |
| 22 | `updateLocalContentEvidenceStatusAction` | `assertProjectAccess(projectId, "review_evidence")` | Project-scoped + inline projectId check | NONE |
| 23 | `deleteLocalContentEvidenceAction` | `assertProjectAccess(projectId, "create_evidence")` | Project-scoped via guard + service | NONE |
| 24 | `uploadLocalContentEvidenceFileAction` | `assertProjectAccess(projectId, "create_evidence")` | Project-scoped via guard | NONE |
| 25 | `listLocalContentFindingsAction` | `assertProjectAccess(projectId, "view")` | Project-scoped via guard | NONE |
| 26 | `createLocalContentFindingAction` | `assertProjectAccess(projectId, "manage_findings")` | Project-scoped via guard | NONE |
| 27 | `updateLocalContentFindingAction` | `assertProjectAccess(projectId, "manage_findings")` | Project-scoped + inline projectId check | NONE |
| 28 | `deleteLocalContentFindingAction` | `assertProjectAccess(projectId, "manage_findings")` | Project-scoped via guard + service | NONE |
| 29 | `submitLocalContentReviewAction` | `assertProjectAccess(projectId, "review")` | Project-scoped via guard | NONE |
| 30 | `submitLocalContentApprovalAction` | `assertProjectAccess(projectId, "approve")` | Project-scoped via guard | NONE |
| 31 | `getLocalContentScoreAction` | `assertProjectAccess(projectId, "view")` | Project-scoped via guard | NONE |
| 32 | `listLocalContentAuditEventsAction` | `assertProjectAccess(projectId, "review")` | Project-scoped via guard | NONE |
| 33 | `listLocalContentReviewsAction` | `assertProjectAccess(projectId, "view")` | Project-scoped via guard | NONE |
| 34 | `getLocalContentApprovalRoutingAction` | `assertProjectAccess(projectId, "view")` | Project-scoped via guard | NONE |
| 35 | `listLocalContentApprovalsAction` | `assertProjectAccess(projectId, "view")` | Project-scoped via guard | NONE |
| 36 | `listLocalContentReportsAction` | `assertProjectAccess(projectId, "view")` | Project-scoped via guard | NONE |
| 37 | `generateLocalContentReportAction` | `assertProjectAccess(projectId, "create_spend")` | Project-scoped via guard | NONE |
| 38 | `revalidateLocalContentProject` | (revalidation helper, no DB access) | N/A | NONE |

**Verdict:** All 38 functions properly tenant-scoped. ✅

---

### 2.2 `src/actions/local-content-workspace-actions.ts` — 24 functions (Content Studio)
**Status:** Well-structured. All 24 use `requireUserContext()` + `assertLocalContentPermission()`.

| # | Function | Auth Pattern | Risk |
|---|----------|-------------|------|
| 1 | `getContentStudioSummaryAction` | `requireUserContext("VIEWER")` + permission | NONE |
| 2 | `listContentStudioProjectsAction` | `requireUserContext("VIEWER")` + permission | NONE |
| 3 | `createContentStudioProjectAction` | `requireUserContext("OPERATOR")` + permission | NONE |
| 4 | `listContentStudioCampaignsAction` | `requireUserContext("VIEWER")` + permission | NONE |
| 5 | `getContentStudioCampaignAction` | `requireUserContext("VIEWER")` + permission + orgId | NONE |
| 6 | `createContentStudioCampaignAction` | `requireUserContext("OPERATOR")` + permission | NONE |
| 7 | `createContentStudioSourceAction` | `requireUserContext("OPERATOR")` + permission | NONE |
| 8 | `verifyContentStudioSourceAction` | `requireUserContext("OPERATOR")` + permission | NONE |
| 9 | `createContentStudioItemAction` | `requireUserContext("OPERATOR")` + permission | NONE |
| 10 | `draftAssistContentItemAction` | `requireUserContext("OPERATOR")` + permission | NONE |
| 11 | `submitContentStudioReviewAction` | `requireUserContext("OPERATOR")` + permission | NONE |
| 12 | `completeContentStudioReviewAction` | `requireUserContext("OPERATOR")` + permission | NONE |
| 13 | `completeContentStudioReviewFormAction` | Delegates to #12 | NONE |
| 14 | `approveContentStudioItemAction` | `requireUserContext("ADMIN")` + permission | NONE |
| 15 | `approveContentStudioItemFormAction` | Delegates to #14 | NONE |
| 16 | `listContentStudioReviewQueueAction` | `requireUserContext("VIEWER")` + permission | NONE |
| 17 | `listContentStudioApprovalQueueAction` | `requireUserContext("VIEWER")` + permission | NONE |
| 18 | `createContentStudioOutputAction` | `requireUserContext("ADMIN")` + permission | NONE |
| 19 | `listContentStudioOutputsAction` | `requireUserContext("VIEWER")` + permission | NONE |
| 20 | `buildContentStudioOutputPayloadAction` | `requireUserContext("VIEWER")` + permission | NONE |
| 21 | `exportContentStudioOutputAction` | `requireUserContext("ADMIN")` + permission | NONE |
| 22 | `exportContentStudioOutputFormAction` | Delegates to #21 | NONE |
| 23 | `activateContentStudioCampaignAction` | `requireUserContext("OPERATOR")` + permission | NONE |
| 24 | `listContentStudioItemsAction` | `requireUserContext("VIEWER")` + permission | NONE |

**Verdict:** All 24 functions properly tenant-scoped. ✅

---

### 2.3 `src/actions/localcontent-workbook-actions.ts` — 20 functions
**Status:** **HIGH RISK.** 18 of 20 functions have ZERO auth/tenant scoping.

| # | Function | Auth Pattern | Risk |
|---|----------|-------------|------|
| 1 | `createWorkbookAction` | NONE | **CRITICAL** — no auth at all |
| 2 | `populateWorkbookAction` | NONE | **CRITICAL** — no auth at all |
| 3 | `populateWorkbookFromTbAction` | NONE | **CRITICAL** — no auth at all |
| 4 | `getWorkbookAction` | NONE | **HIGH** — reads any workbook by ID |
| 5 | `listProjectWorkbooksAction` | NONE | **HIGH** — reads workbooks by projectId |
| 6 | `listOrganizationWorkbooksAction` | `requireUserContext()` | NONE ✅ |
| 7 | `updateWorkbookLineAction` | NONE | **CRITICAL** — mutates any line by ID |
| 8 | `recalculateWorkbookAction` | NONE | **CRITICAL** — mutates any workbook by ID |
| 9 | `deleteWorkbookAction` | NONE | **CRITICAL** — deletes any workbook by ID |
| 10 | `getWorkbookDashboardAction` | `requireUserContext()` | NONE ✅ |
| 11 | `detectMissingDataAction` | NONE | **HIGH** — reads any workbook by ID |
| 12 | `generateDataRequestAction` | NONE | **HIGH** — mutates any workbook by ID |
| 13 | `getDataRequestsAction` | NONE | **HIGH** — reads any workbook by ID |
| 14 | `fulfillDataRequestItemAction` | NONE | **HIGH** — mutates by item ID |
| 15 | `waiveDataRequestItemAction` | NONE | **HIGH** — mutates by item ID |
| 16 | `sendDataRequestAction` | NONE | **HIGH** — mutates by request ID |
| 17 | `getDataRequestTextAction` | NONE | **HIGH** — reads by request ID |
| 18 | `exportWorkbookAction` | NONE | **HIGH** — exports any workbook by ID |
| 19 | `markWorkbookExportedAction` | NONE | **HIGH** — mutates any workbook by ID |
| 20 | `computeWorkbookScoreAction` | NONE | **HIGH** — reads + mutates by workbook ID |

**Verdict:** **CRITICAL GAP.** 18/20 functions (90%) have no auth/tenant scoping. These functions accept `projectId` or `workbookId` or `lineId` as parameters from the client with zero verification that the caller's organization owns those resources.

---

### 2.4 `src/actions/localcontent-ai-advisor-actions.ts` — 11 functions
**Status:** Mostly well-structured. 9/11 use `assertProjectAccess`. 2 lack project-level checks.

| # | Function | Auth Pattern | Risk |
|---|----------|-------------|------|
| 1 | `runPatternAnalysisAction` | `assertProjectAccess(projectId, "review")` | NONE ✅ |
| 2 | `listPendingPatternSuggestionsAction` | `assertProjectAccess(projectId, "view")` | NONE ✅ |
| 3 | `reviewPatternSuggestionAction` | `getCurrentUser()` only | **MEDIUM** — no project/org check |
| 4 | `explainAccountMatchesAction` | `assertProjectAccess(projectId, "view")` | NONE ✅ |
| 5 | `getLineMatchExplanationsAction` | `assertProjectAccess(projectId, "view")` | NONE ✅ |
| 6 | `listFpFlagsAction` | `assertProjectAccess(projectId, "view")` | NONE ✅ |
| 7 | `reviewFpFlagAction` | `getCurrentUser()` only | **MEDIUM** — no project/org check |
| 8 | `batchReviewFpAction` | `assertProjectAccess(projectId, "review")` | NONE ✅ |
| 9 | `getIndustryBenchmarksAction` | NONE | **LOW** — reads global industry data |
| 10 | `getOrgMatchMemoryAction` | `assertProjectAccess(projectId, "view")` | NONE ✅ |
| 11 | `calibrateConfidenceAction` | `assertProjectAccess(projectId, "review")` | NONE ✅ |

**Verdict:** 2 of 11 (18%) have no project-level access check. They use `getCurrentUser()` for authentication but do not verify the user's organization owns the suggestion/review being acted upon.

---

### 2.5 `src/actions/localcontent-ai-advisor-v3-actions.ts` — 12 functions
**Status:** **HIGH RISK.** 9 of 12 accept `organizationId` from the client without server-side verification.

| # | Function | Accepts orgId from client? | Auth Pattern | Risk |
|---|----------|---------------------------|-------------|------|
| 1 | `checkAiHealthAction` | No | `requireUserContext()` | NONE ✅ |
| 2 | `isAiHealthyAction` | No | `requireUserContext()` | NONE ✅ |
| 3 | `runWorkbookAiReviewAction` | **YES** — first param | `requireUserContext()` | **HIGH** — orgId NOT verified against session |
| 4 | `getWorkbookReviewStatusAction` | **YES** — first param | `requireUserContext()` | **HIGH** — orgId NOT verified against session |
| 5 | `generateRecommendationsAction` | **YES** — first param | `requireUserContext()` | **HIGH** — orgId NOT verified against session |
| 6 | `listWorkbookRecommendationsAction` | **YES** — first param | `requireUserContext()` | **HIGH** — orgId NOT verified against session |
| 7 | `reviewRecommendationAction` | No (only recommendationId) | `requireUserContext()` | **MEDIUM** — no org check |
| 8 | `runSimulationAction` | **YES** — first param | `requireUserContext()` | **HIGH** — orgId NOT verified against session |
| 9 | `listWorkbookSimulationsAction` | **YES** — first param | `requireUserContext()` | **HIGH** — orgId NOT verified against session |
| 10 | `getPatternHealthScoresAction` | **YES** — first param | `requireUserContext()` | **HIGH** — orgId NOT verified against session |
| 11 | `getLearningLoopSummaryAction` | **YES** — first param | `requireUserContext()` | **HIGH** — orgId NOT verified against session |
| 12 | `getWorkbookAiDashboardDataAction` | **YES** — first param | `requireUserContext()` | **HIGH** — orgId NOT verified against session |

**Verdict:** **CRITICAL PATTERN.** 9 of 12 (75%) accept `organizationId` as a function parameter from the client. While `requireUserContext()` is called for authentication, the passed `organizationId` is never compared against `user.organizationId` from the session. This means a malicious caller could supply another organization's ID and access their data.

---

### 2.6 `src/actions/localcontent-review-actions.ts` — 6 functions
**Status:** **HIGH RISK.** 2 accept orgId from client. 4 have auth but no tenant verification.

| # | Function | Accepts orgId? | Auth Pattern | Risk |
|---|----------|---------------|-------------|------|
| 1 | `getReviewQueueAction` | **YES** — first param | NONE | **CRITICAL** — any authenticated user can read any org's review queue |
| 2 | `reviewSuggestionAction` | No | `getCurrentUser()` | **MEDIUM** — no org check on suggestion ownership |
| 3 | `reviewExplanationAction` | No | `getCurrentUser()` | **MEDIUM** — no org check on match review ownership |
| 4 | `createPatternOverrideAction` | **YES** — first param | `getCurrentUser()` | **CRITICAL** — writes to any org's pattern suggestions |
| 5 | `batchReviewAction` | No | `getCurrentUser()` | **MEDIUM** — no org check |
| 6 | `addReviewCommentAction` | No | `getCurrentUser()` | **MEDIUM** — no org check |

**Verdict:** 2/6 accept orgId from client without verification. 4/6 have basic auth but no tenant ownership check.

---

### 2.7 `src/actions/localcontent-review-export.ts` — 1 function
**Status:** Properly scoped.

| Function | Auth Pattern | Risk |
|----------|-------------|------|
| `exportReviewSummaryPdfAction` | `getCurrentUser()` + `enforce()` + `user.organizationId` | NONE ✅ |

---

### 2.8 `src/actions/localcontent-quality-actions.ts` — 1 function
**Status:** Properly scoped.

| Function | Auth Pattern | Risk |
|----------|-------------|------|
| `getAiQualityMetricsAction` | `getCurrentUser()` + `user.organizationId` | NONE ✅ |

---

### 2.9 `src/actions/localcontent-pilot-readiness-actions.ts` — 1 function
**Status:** Properly scoped.

| Function | Auth Pattern | Risk |
|----------|-------------|------|
| `getPilotReadinessAction` | `requireUserContext()` + `user.organizationId` | NONE ✅ |

---

## 3. API Routes (2 total)

### 3.1 `GET /api/local-content/projects/[projectId]/evidence/[evidenceId]/download`
**File:** `src/app/api/local-content/projects/[projectId]/evidence/[evidenceId]/download/route.ts`

- **Auth:** `assertProjectAccess(projectId, "view")` + `enforce()` + `assertEvidenceDownloadAccess()`
- **Tenant check:** `organizationId: user.organizationId` passed to evidence access assertion
- **Audit trail:** Full audit event on download
- **Risk:** NONE ✅

### 3.2 `GET /api/local-content/projects/[projectId]/reports/[reportId]/download`
**File:** `src/app/api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts`

- **Auth:** `getCurrentUser()` + `assertProjectAccess(projectId, "view")`
- **Tenant check:** Inline `report.projectId !== projectId` check acts as cross-tenant guard
- **Audit trail:** Full audit event on download
- **Risk:** NONE ✅

---

## 4. Lib Files with Direct Prisma Access (27 files)

Catalog of every `.ts` file under `src/lib/local-content/` that makes direct Prisma calls. This list excludes pure type files, schema files, and utility-only modules.

| # | File | Prisma Models Accessed | Tenant Scoping |
|---|------|----------------------|----------------|
| 1 | `services.ts` | All 12 models (~45+ calls) | Via `organizationId` param or `projectId` → `project.organizationId` |
| 2 | `guards.ts` | LocalContentProject | `assertProjectAccess`: loads project, checks `user.organizationId` == `project.organizationId` |
| 3 | `pipeline-orchestrator.ts` | LcWorkbook, LcMatchReview, LcPatternSuggestion, etc. | `workbook.organizationId` via project chain |
| 4 | `pilot-readiness.ts` | All LCOS models | `organizationId` param ✅ |
| 5 | `audit-events.ts` | LocalContentAuditEvent, LcAiAuditEvent + PlatformAuditLog | `organizationId` param, `projectId` param |
| 6 | `export/index.ts` | LocalContentProject, LocalContentSupplier, etc. | Via `calculateProjectScore(projectId)` |
| 7 | `workbook/population.ts` | LcWorkbook, LcWorkbookLine, LocalContentProject | Via projectId chain |
| 8 | `workbook/services.ts` | LcWorkbook, LcWorkbookLine, LocalContentProject | Via projectId chain |
| 9 | `workbook/missing-data.ts` | LcWorkbookDataRequest, LcWorkbookDataRequestItem | Via workbookId chain |
| 10 | `workbook/scoring.ts` | None (pure math) | N/A |
| 11 | `workbook/ai-advisor.ts` | LcPatternSuggestion, LcMatchReview, LcOrgMatchMemory, etc. | `organizationId` param |
| 12 | `workbook/ai-auto-review.ts` | LcMatchReview, LcPatternSuggestion, LcAiReviewRun | `organizationId` param |
| 13 | `workbook/recommendation-engine.ts` | LcRecommendation, LcWorkbook | `organizationId` param |
| 14 | `workbook/simulation-engine.ts` | LcSimulation, LcWorkbook | `organizationId` param |
| 15 | `workbook/learning-loop.ts` | LcPatternHealthRecord, LcOrgMatchMemory | `organizationId` param |
| 16 | `workbook/ai-health.ts` | LcAiReviewRun | None (aggregate health) |
| 17 | `content/services.ts` | ContentStudioProject, ContentStudioCampaign, etc. | `organizationId` param ✅ |
| 18 | `content/review.ts` | ContentStudioReview, ContentStudioApproval | `organizationId` param ✅ |
| 19 | `content/outputs.ts` | ContentStudioOutput, ContentStudioOutputItem | `organizationId` param ✅ |
| 20 | `content/evidence.ts` | ContentStudioSource | `organizationId` param ✅ |
| 21 | `content/permissions.ts` | None (pure role check) | N/A |
| 22 | `import/index.ts` | None (CSV parsing only) | N/A |
| 23 | `erp-providers.ts` | LocalContentProject, LocalContentSupplier | `organizationId` param |
| 24 | `classification-engine.ts` | LocalContentClassification | `projectId` param |
| 25 | `scoring-engine.ts` | All score-relevant models | Via `calculateProjectScore(projectId)` |
| 26 | `pdf-arabic.ts` | None (PDF formatting) | N/A |
| 27 | `validation.ts` | None (pure validation) | N/A |

**Key observations:**
- Most core compliance services properly tenant-scoped with `organizationId` params
- Workbook engine services (population, missing-data, ai-advisor, etc.) scoped via projectId/workbookId chain
- Content Studio services consistently pass `organizationId`
- Audit events take `organizationId` as param (risk if caller provides wrong orgId)

---

## 5. Background Jobs / Queues / Webhooks

**Confirmed: NONE.** LocalContentOS has no background jobs, message queues, cron jobs, or webhooks. All operations are synchronous server actions called from React client components, plus the two API routes above.

---

## 6. Import / Export Paths

### 6.1 Import
- **CSV Import:** `importLocalContentSpendCsvAction` → `parseLocalContentCSV()` → `createSpendRecord()` per row
- **Path:** Client → Server Action → service (all within same request)
- **Scoping:** `assertProjectAccess(projectId, "create_spend")` checked before any import

### 6.2 Export (non-API)
- **Workbook Export:** `exportWorkbookAction(workbookId)` — **UNSCOPED** (in workbook-actions)
- **Review Summary PDF:** `exportReviewSummaryPdfAction()` — properly scoped
- **AI Quality Dashboard:** `getAiQualityMetricsAction()` — properly scoped

### 6.3 API Export (download endpoints)
- **Evidence Download:** Fully scoped ✅
- **Report Download:** Fully scoped ✅

---

## 7. Seed Scripts

- **File:** `prisma/seed-localcontent.ts`
- **Scope:** Needs DB connection, creates seed data for an organization
- **Risk:** LOW — executed in controlled environments only

---

## 8. Models with `organizationId` (Prisma schema)

| Model | Has `organizationId`? | Scope Chain |
|-------|----------------------|-------------|
| `LocalContentProject` | **YES** — direct | Direct org field |
| `LocalContentSupplier` | **YES** — direct | Direct org field |
| `LocalContentSpendRecord` | **YES** — direct | Direct org field |
| `LocalContentClassification` | **YES** — direct | Direct org field |
| `LocalContentEvidence` | **YES** — direct | Direct org field |
| `LocalContentFinding` | **YES** — direct | Direct org field |
| `LocalContentReport` | **YES** — direct | Direct org field |
| `LocalContentAuditEvent` | **YES** — direct | Direct org field |
| `LocalContentReview` | Through project | `project.organizationId` |
| `LocalContentApproval` | Through project | `project.organizationId` |
| `ContentStudioProject` | **YES** — direct | Direct org field |
| `ContentStudioCampaign` | **YES** — direct | Direct org field |
| `ContentStudioItem` | **YES** — direct | Direct org field |
| `ContentStudioSource` | **YES** — direct | Direct org field |
| `ContentStudioReview` | **YES** — direct | Direct org field |
| `ContentStudioApproval` | **YES** — direct | Direct org field |
| `ContentStudioOutput` | **YES** — direct | Direct org field |
| `LcWorkbook` | Through project | `project.organizationId` |
| `LcWorkbookLine` | Through workbook → project | `workbook.project.organizationId` |
| `LcMatchReview` | **YES** — direct (denormalized) | Direct org field |
| `LcPatternSuggestion` | **YES** — direct (denormalized) | Direct org field |
| `LcAiAuditEvent` | **YES** — direct | Direct org field |
| `LcAiReviewRun` | **YES** — direct | Direct org field |
| `LcOrganizationMatchMemory` | **YES** — direct | Direct org field |
| `LcPatternHealthRecord` | **YES** — direct | Direct org field |
| `LcRecommendation` | **YES** — direct | Direct org field |
| `LcSimulation` | **YES** — direct | Direct org field |
| `LcWorkbookDataRequest` | Through workbook → project | Indirect |
| `LcWorkbookDataRequestItem` | Through request → workbook → project | Indirect |
| `LcIndustryPatternMemory` | None (global) | Global data, no org scope |

---

## 9. Summary Statistics

| Surface Type | Count | Properly Scoped | Partially Scoped | Unscoped | Risk Level |
|-------------|-------|-----------------|-----------------|---------|------------|
| Server Actions (localcontent-actions) | 38 | 38 | 0 | 0 | 🟢 NONE |
| Server Actions (workspace-actions) | 24 | 24 | 0 | 0 | 🟢 NONE |
| Server Actions (workbook-actions) | 20 | 2 | 0 | 18 | 🔴 CRITICAL |
| Server Actions (ai-advisor-actions) | 11 | 9 | 2 | 0 | 🟡 MEDIUM |
| Server Actions (ai-advisor-v3-actions) | 12 | 3 | 0 | 9 (client-supplied orgId) | 🔴 CRITICAL |
| Server Actions (review-actions) | 6 | 0 | 4 | 2 (client-supplied orgId) | 🔴 HIGH |
| Server Actions (review-export) | 1 | 1 | 0 | 0 | 🟢 NONE |
| Server Actions (quality-actions) | 1 | 1 | 0 | 0 | 🟢 NONE |
| Server Actions (pilot-readiness) | 1 | 1 | 0 | 0 | 🟢 NONE |
| **Total Server Actions** | **114** | **79** | **6** | **29** | |
| API Routes | 2 | 2 | 0 | 0 | 🟢 NONE |
| Lib files with Prisma access | 27 | ~22 | ~3 | ~2 | 🟡 LOW |
| Background jobs | 0 | — | — | — | 🟢 NONE |
| Import paths | 1 | 1 | 0 | 0 | 🟢 NONE |
| Export paths (non-API) | 3 | 2 | 0 | 1 | 🟡 MEDIUM |

---

## 10. Risk Classification

### 🔴 CRITICAL (immediate attention required)
1. **localcontent-workbook-actions.ts** (18 unscoped functions) — Largest single gap. No auth on create, read, update, or delete of workbooks/lines/requests.
2. **localcontent-ai-advisor-v3-actions.ts** (9 functions with client-supplied orgId) — Systemic pattern of accepting `organizationId` as a function param from client without server-side verification against the session.

### 🟡 HIGH
1. **localcontent-review-actions.ts** (2 functions with client-supplied orgId, 4 with no org ownership check) — `getReviewQueueAction` and `createPatternOverrideAction` accept orgId from client.

### 🟡 MEDIUM
1. **localcontent-ai-advisor-actions.ts** (2 functions with no project-level check) — `reviewPatternSuggestionAction` and `reviewFpFlagAction` use only `getCurrentUser()`.
2. **localcontent-review-actions.ts** (4 functions with auth but no org ownership check)
3. **exportWorkbookAction** in workbook-actions — exports workbook data without any tenant check.

### 🟢 NONE
1. All 38 functions in `localcontent-actions.ts` ✅
2. All 24 functions in `local-content-workspace-actions.ts` ✅
3. Both API routes ✅
4. Quality and pilot readiness actions ✅

---

## 11. Next Phase

**Phase 2: Tenant Scope Audit** (`02_TENANT_ISOLATION_MATRIX.md`)

For every Prisma query/mutation identified above, verify that `organizationId` is properly included in the `where` clause. Focus especially on:

1. The 18 unscoped workbook functions — trace each to its lib/implementation
2. The 9 v3-actions with client-supplied orgId — verify the underlying data services use the (potentially compromised) orgId
3. The 2 review-actions with client-supplied orgId
4. `audit-events.ts` — verify `projectId` without `organizationId` check is safe
5. Every `findUnique` call that uses only `id` without `organizationId` — these are potential cross-tenant access vectors
