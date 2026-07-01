---
title: "P0-A1 Inventory — LCOS Validation Entry Points"
status: active
program: "LocalContentOS Production Readiness"
phase: 2
work-item: "P0-A1 — SC-01"
date: 2026-06-27
---

# P0-A1 Inventory — LCOS Input Validation Coverage

**Work Item:** P0-A1  
**Gap:** SC-01 — No standardized input validation  
**Phase:** Inventory (no modifications)

---

## Entry Point Type 1: Server Actions

**9 files · 114 exported functions · 0 with Zod · ~20 with partial manual validation**

### 1.1 `localcontent-actions.ts` — 38 exports (17 read/list, 20 mutation, 1 revalidate)

| # | Function | Params | Validation | Auth | Covered? |
|:-:|:---------|:-------|:----------:|:----:|:--------:|
| 1 | `listLocalContentProjectsAction` | — | none needed | requireUserContext(V) | ✅ read-only |
| 2 | `getLocalContentSpendAnalyticsAction` | — | none needed | requireUserContext(V) | ✅ read-only |
| 3 | `getLocalContentClassificationRulesAction` | — | none needed | requireUserContext(OP) | ✅ read-only |
| 4 | `getLocalContentTenderMatchAction` | projectId | none needed | assertProjectAccess | ✅ path param |
| 5 | `getLocalContentVerificationChecklistAction` | projectId | none needed | assertProjectAccess | ✅ path param |
| 6 | `getLocalContentTbSignalsAction` | projectId | none needed | requireUserContext(V) | ✅ path param |
| 7 | `updateLocalContentVerificationItemAction` | projectId, itemId, **FormData** | `getOptionalTrimmedValue` | assertProjectAccess | ⚠️ manual |
| 8 | `getLocalContentProjectAction` | projectId | none needed | assertProjectAccess | ✅ path param |
| 9 | **`createLocalContentProjectAction`** | **FormData** | `validateRequired` + manual | requireUserContext(A) | ⚠️ manual |
| 10 | `updateLocalContentProjectAction` | projectId, status | `validateProjectStatus` | assertProjectAccess | ⚠️ manual |
| 11 | `listLocalContentSuppliersAction` | projectId | none needed | assertProjectAccess | ✅ path param |
| 12 | **`createLocalContentSupplierAction`** | projectId, **FormData** | `validateRequired` + enum validators | assertProjectAccess | ⚠️ manual |
| 13 | `updateLocalContentSupplierAction` | projectId, supplierId, **FormData** | `validateRequired` + enum validators | assertProjectAccess | ⚠️ manual |
| 14 | `deleteLocalContentSupplierAction` | projectId, supplierId | none needed | assertProjectAccess | ✅ path params |
| 15 | `listLocalContentSpendRecordsAction` | projectId | none needed | assertProjectAccess | ✅ path param |
| 16 | **`createLocalContentSpendRecordAction`** | projectId, **FormData** | `validateRequired` + `validatePercentage` | assertProjectAccess | ⚠️ manual |
| 17 | **`importLocalContentSpendCsvAction`** | projectId, csvText | manual CSV parse | assertProjectAccess | ❌ no Zod |
| 18 | **`classifyLocalContentSpendRecordAction`** | projectId, **FormData** | `validateRequired` | assertProjectAccess | ⚠️ manual |
| 19 | `deleteLocalContentSpendRecordAction` | projectId, recordId | none needed | assertProjectAccess | ✅ path params |
| 20 | `listLocalContentEvidenceAction` | projectId | none needed | assertProjectAccess | ✅ path param |
| 21 | **`createLocalContentEvidenceAction`** | projectId, **FormData** | `validateRequired` | assertProjectAccess | ⚠️ manual |
| 22 | **`updateLocalContentEvidenceStatusAction`** | projectId, evidenceId, **status** | — | assertProjectAccess | ❌ raw string |
| 23 | `deleteLocalContentEvidenceAction` | projectId, evidenceId | — | assertProjectAccess | ✅ path params |
| 24 | **`uploadLocalContentEvidenceFileAction`** | projectId, **FormData** | — | assertProjectAccess | ❌ no validation |
| 25 | `listLocalContentFindingsAction` | projectId | none needed | assertProjectAccess | ✅ path param |
| 26 | **`createLocalContentFindingAction`** | projectId, **FormData** | — | assertProjectAccess | ❌ no validation |
| 27 | **`updateLocalContentFindingAction`** | projectId, findingId, **FormData** | — | assertProjectAccess | ❌ no validation |
| 28 | `deleteLocalContentFindingAction` | projectId, findingId | none needed | assertProjectAccess | ✅ path params |
| 29 | **`submitLocalContentReviewAction`** | projectId, **FormData** | — | assertProjectAccess | ❌ no validation |
| 30 | **`submitLocalContentApprovalAction`** | projectId, **FormData** | — | assertProjectAccess | ❌ no validation |
| 31 | `getLocalContentScoreAction` | projectId | none needed | assertProjectAccess | ✅ path param |
| 32 | `listLocalContentAuditEventsAction` | projectId | none needed | assertProjectAccess | ✅ path param |
| 33 | `listLocalContentReviewsAction` | projectId | none needed | assertProjectAccess | ✅ path param |
| 34 | `getLocalContentApprovalRoutingAction` | projectId | none needed | assertProjectAccess | ✅ path param |
| 35 | `listLocalContentApprovalsAction` | projectId | none needed | assertProjectAccess | ✅ path param |
| 36 | `listLocalContentReportsAction` | projectId | none needed | assertProjectAccess | ✅ path param |
| 37 | **`generateLocalContentReportAction`** | projectId, reportType, format | — | assertProjectAccess | ❌ raw strings |
| 38 | `revalidateLocalContentProject` | projectId | none needed | — | ✅ revalidation |

**Summary: 20 mutations → 12 with manual validation, 8 without any input validation**

---

### 1.2 `localcontent-ai-advisor-actions.ts` — 11 exports (0 mutation — all read/analysis)

| # | Function | Params | Validation | Auth | Covered? |
|:-:|:---------|:-------|:----------:|:----:|:--------:|
| 1 | `runPatternAnalysisAction` | projectId, workbookId, **tbLines: TbLine[]** | manual throws | requireUserContext | ❌ array data |
| 2 | `listPendingPatternSuggestionsAction` | projectId | none needed | requireUserContext | ✅ param |
| 3 | `reviewPatternSuggestionAction` | suggestionId, decision, reviewNotes | manual throws | none | ❌ no auth + no Zod |
| 4 | `explainAccountMatchesAction` | projectId, workbookId, **tbLines: TbLine[]** | manual throws | requireUserContext | ❌ array data |
| 5 | `getLineMatchExplanationsAction` | projectId, workbookLineCode | none | requireUserContext | ✅ param |
| 6 | `listFpFlagsAction` | projectId | none | requireUserContext | ✅ param |
| 7 | `reviewFpFlagAction` | matchReviewId, decision, reviewNotes | manual throws | none | ❌ no auth + no Zod |
| 8 | `batchReviewFpAction` | projectId, **matchReviewIds: string[]**, decision, reviewNotes | manual | requireUserContext | ❌ array data |
| 9 | `getIndustryBenchmarksAction` | industry? | none | none | ✅ optional param |
| 10 | `getOrgMatchMemoryAction` | projectId, workbookLineCode? | none | requireUserContext | ✅ param |
| 11 | `calibrateConfidenceAction` | projectId, workbookId | manual throws | requireUserContext | ✅ simple params |

---

### 1.3 `localcontent-ai-advisor-v3-actions.ts` — 12 exports (mostly read/analysis)

| # | Function | Params | Validation | Auth | Covered? |
|:-:|:---------|:-------|:----------:|:----:|:--------:|
| 1 | `runWorkbookAiReviewAction` | organizationId, workbookId, **tbLines** | manual | requireUserContext | ❌ array data |
| 2 | `getWorkbookReviewStatusAction` | organizationId, workbookId | none | requireUserContext | ✅ params |
| 3 | `generateRecommendationsAction` | organizationId, workbookId | manual | requireUserContext | ✅ params |
| 4 | `listWorkbookRecommendationsAction` | organizationId, workbookId, status? | none | requireUserContext | ✅ params |
| 5 | `reviewRecommendationAction` | recommendationId, decision, reviewNotes | none | requireUserContext | ❌ raw strings |
| 6 | `runSimulationAction` | organizationId, workbookId, scenarioType, **params: Record<string, number>** | none | requireUserContext | ❌ untrusted data |
| 7 | `listWorkbookSimulationsAction` | organizationId, workbookId | none | requireUserContext | ✅ params |
| 8 | `getPatternHealthScoresAction` | organizationId | none | requireUserContext | ✅ param |
| 9 | `getLearningLoopSummaryAction` | organizationId | none | requireUserContext | ✅ param |
| 10 | `getWorkbookAiDashboardDataAction` | organizationId, workbookId | none | requireUserContext | ✅ params |

---

### 1.4 `localcontent-pilot-readiness-actions.ts` — 1 export

| # | Function | Params | Validation | Auth | Covered? |
|:-:|:---------|:-------|:----------:|:----:|:--------:|
| 1 | `getPilotReadinessAction` | none | none needed | requireUserContext | ✅ read-only |

---

### 1.5 `localcontent-quality-actions.ts` — 1 export

| # | Function | Params | Validation | Auth | Covered? |
|:-:|:---------|:-------|:----------:|:----:|:--------:|
| 1 | `getAiQualityMetricsAction` | none | none needed | none | ⚠️ no auth |

---

### 1.6 `localcontent-review-actions.ts` — 6 exports

| # | Function | Params | Validation | Auth | Covered? |
|:-:|:---------|:-------|:----------:|:----:|:--------:|
| 1 | `getReviewQueueAction` | organizationId, type? | none | none | ❌ no auth |
| 2 | `reviewSuggestionAction` | suggestionId, decision, reviewNotes | manual throws | none | ❌ no auth |
| 3 | `reviewExplanationAction` | matchReviewId, decision, reviewNotes | manual throws | none | ❌ no auth |
| 4 | `createPatternOverrideAction` | organizationId, workbookLineCode, currentPattern, suggestedPattern, reasoning | none | none | ❌ no auth + no Zod |
| 5 | `batchReviewAction` | type, **ids: string[]**, decision, reviewNotes | none | none | ❌ no auth + array |
| 6 | `addReviewCommentAction` | type, id, comment | none | none | ❌ no auth |

---

### 1.7 `localcontent-review-export.ts` — 1 export

| # | Function | Params | Validation | Auth | Covered? |
|:-:|:---------|:-------|:----------:|:----:|:--------:|
| 1 | `exportReviewSummaryPdfAction` | none | none needed | enforce | ✅ auth, read-only |

---

### 1.8 `localcontent-workbook-actions.ts` — 20 exports

| # | Function | Params | Validation | Auth | Covered? |
|:-:|:---------|:-------|:----------:|:----:|:--------:|
| 1 | `createWorkbookAction` | projectId, title | manual throws | none | ❌ no auth |
| 2 | `populateWorkbookAction` | projectId, title? | manual throws | none | ❌ no auth |
| 3 | `populateWorkbookFromTbAction` | projectId, **tbLines: TbLine[]**, title? | manual | none | ❌ no auth + array |
| 4 | `getWorkbookAction` | workbookId | none | requireUserContext | ✅ |
| 5 | `listProjectWorkbooksAction` | projectId | none | requireUserContext | ✅ |
| 6 | `updateWorkbookLineAction` | lineId, manualValue, notes? | manual | none | ❌ no auth |
| 7 | `recalculateWorkbookAction` | workbookId | manual | none | ❌ no auth |
| 8 | `deleteWorkbookAction` | workbookId | manual | requireUserContext | ✅ auth |
| 9 | `detectMissingDataAction` | workbookId | manual | none | ❌ no auth |
| 10 | `generateDataRequestAction` | workbookId | manual | none | ❌ no auth |
| 11 | `getDataRequestsAction` | workbookId | none | none | ❌ no auth |
| 12 | `fulfillDataRequestItemAction` | itemId, responseValue | manual | none | ❌ no auth |
| 13 | `waiveDataRequestItemAction` | itemId | manual | none | ❌ no auth |
| 14 | `sendDataRequestAction` | requestId | manual | none | ❌ no auth |
| 15 | `getDataRequestTextAction` | requestId | none | none | ❌ no auth |
| 16 | `exportWorkbookAction` | workbookId | manual | none | ❌ no auth |
| 17 | `markWorkbookExportedAction` | workbookId | manual | none | ❌ no auth |
| 18 | `computeWorkbookScoreAction` | workbookId | none | none | ❌ no auth |

---

### 1.9 `local-content-workspace-actions.ts` — 24 exports

| # | Function | Params | Validation | Auth | Covered? |
|:-:|:---------|:-------|:----------:|:----:|:--------:|
| 1 | `createContentStudioProjectAction` | **FormData** | manual | requireUserContext | ⚠️ manual |
| 2 | `getContentStudioCampaignAction` | campaignId | manual | requireUserContext | ✅ param |
| 3 | `createContentStudioCampaignAction` | **FormData** | manual | requireUserContext | ⚠️ manual |
| 4 | `createContentStudioSourceAction` | **FormData** | manual | requireUserContext | ⚠️ manual |
| 5 | `verifyContentStudioSourceAction` | sourceId | none | requireUserContext | ✅ param |
| 6 | `createContentStudioItemAction` | **FormData** | manual | requireUserContext | ⚠️ manual |
| 7 | `draftAssistContentItemAction` | contentItemId, instructions? | none | requireUserContext | ✅ param |
| 8 | `submitContentStudioReviewAction` | contentItemId | none | requireUserContext | ✅ param |
| 9 | `completeContentStudioReviewAction` | **FormData** | none | requireUserContext | ❌ no validation |
| 10 | `completeContentStudioReviewFormAction` | **FormData** | manual | requireUserContext | ⚠️ manual |
| 11 | `approveContentStudioItemAction` | contentItemId, approved, notes? | none | requireUserContext | ❌ raw params |
| 12 | `approveContentStudioItemFormAction` | **FormData** | manual | none | ❌ no auth |
| 13 | `createContentStudioOutputAction` | **FormData** | manual | requireUserContext | ⚠️ manual |
| 14 | `buildContentStudioOutputPayloadAction` | packageId | none | requireUserContext | ✅ param |
| 15 | `exportContentStudioOutputAction` | packageId | none | requireUserContext | ✅ param |
| 16 | `exportContentStudioOutputFormAction` | **FormData** | manual | none | ❌ no auth |
| 17 | `activateContentStudioCampaignAction` | campaignId | none | requireUserContext | ✅ param |

---

## Entry Point Type 2: API Routes

### `api/local-content/projects/[projectId]/evidence/[evidenceId]/download/route.ts`

| Method | Params | Validation | Auth | Covered? |
|:------:|:-------|:----------:|:----:|:--------:|
| GET | projectId, evidenceId (path) | none | assertProjectAccess + enforce + assertEvidenceDownloadAccess | ✅ path params validated by routing, audit logged |

### `api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts`

| Method | Params | Validation | Auth | Covered? |
|:------:|:-------|:----------:|:----:|:--------:|
| GET | projectId, reportId (path) | none | auth present | ✅ path params |

---

## Entry Point Type 3: Library Modules (not direct entry points)

- `src/lib/local-content/import.ts` — called by `importLocalContentSpendCsvAction`
- `src/lib/local-content/erp/file-importer.ts` — service layer
- `src/lib/local-content/erp/import-pipeline.ts` — service layer

These are called from actions, not direct entry points. Their validation is the responsibility of the calling action.

---

## Summary Statistics

| Metric | Count |
|:-------|:-----:|
| Total entry points | 116 (114 actions + 2 API routes) |
| Read-only (path params only) | ~74 |
| Mutation (accepts external data) | ~42 |
| With Zod validation | **0** |
| With manual validation | ~22 (partial, inconsistent) |
| Without any input validation | ~20 |
| Without auth guard | ~20 |

### Priority for SC-01 closure

**Must fix** (accepts external data, no validation, mutates state):
1. `updateLocalContentEvidenceStatusAction` — raw string status
2. `uploadLocalContentEvidenceFileAction` — FormData with file
3. `createLocalContentFindingAction` — FormData
4. `updateLocalContentFindingAction` — FormData
5. `submitLocalContentReviewAction` — FormData
6. `submitLocalContentApprovalAction` — FormData
7. `generateLocalContentReportAction` — raw strings (reportType, format)
8. `createWorkbookAction` — raw strings (projectId, title)
9. `populateWorkbookAction` — raw strings
10. `populateWorkbookFromTbAction` — array + strings
11. `updateWorkbookLineAction` — number + string
12. `reviewRecommendationAction` — raw strings
13. `runSimulationAction` — Record<string, number>
14. `createPatternOverrideAction` — multiple strings
15. `batchReviewAction` — array + strings
16. `addReviewCommentAction` — strings
17. `completeContentStudioReviewAction` — FormData
18. `approveContentStudioItemAction` — boolean + string
19. `importLocalContentSpendCsvAction` — csvText (large text)

**Should fix** (has some validation but inconsistent):
- All existing manual validation patterns → standardize
- Non-mutation actions that accept arrays (tbLines, matchReviewIds)

**Nice to fix** (no auth, but also no Zod):
- `localcontent-review-actions.ts` — multiple functions (RBAC scope, not SC-01)
- `localcontent-quality-actions.ts` — `getAiQualityMetricsAction`

---

*Inventory complete. Ready for Phase 2 — Standard Definition.*
