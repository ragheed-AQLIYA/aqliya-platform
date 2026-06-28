# B2A-5: Attack Matrix

> **Purpose:** This matrix shows the before/after state of every cross-tenant exploitation path. Any reviewer can see the transformation from RB-01 Phase 1 discovery (21 paths) to B2A closure (0 paths).
>
> **Status:** ✅ COMPLETE — 2026-06-28 | All 21 paths BLOCKED | B2A-5 Proof: 14/14 ALL PASS

---

## Action Layer (21 Exploits — All BLOCKED)

| ID | Name | Entry Point | B2A Wave | Before (RB-01) | After (B2A) | Guard | Proof |
|----|------|-------------|:--------:|:--------------:|:-----------:|-------|-------|
| **E1** | Read any workbook | `getWorkbookAction` → `getWorkbook` | B2A-1 | ✅ SUCCESS (exploited) | 🔒 **BLOCKED** | `assertProjectAccess` | ✅ E01 (307 redirect) |
| **E2** | Write to any line | `updateWorkbookLineAction` → `updateWorkbookLineValue` | B2A-1 | ✅ SUCCESS (exploited) | 🔒 **BLOCKED** | `assertProjectAccess` | ✅ Static guard |
| **E3** | Delete workbook | `deleteWorkbookAction` | B2A-1 | ✅ SUCCESS | 🔒 **BLOCKED** | `assertProjectAccess` | ✅ Static guard |
| **E4** | Update workbook metadata | `updateWorkbookAction` | B2A-1 | ✅ SUCCESS | 🔒 **BLOCKED** | `assertProjectAccess` | ✅ Static guard |
| **E5** | Access data request | `getDataRequestAction` | B2A-1 | ✅ SUCCESS | 🔒 **BLOCKED** | `assertProjectAccess` | ✅ Static guard |
| **E6** | Fulfill data request | `fulfillDataRequestItemAction` | B2A-1 | ✅ SUCCESS | 🔒 **BLOCKED** | `assertProjectAccess` | ✅ Static guard |
| **E7** | Waive data request | `waiveDataRequestItemAction` | B2A-1 | ✅ SUCCESS | 🔒 **BLOCKED** | `assertProjectAccess` | ✅ Static guard |
| **E8** | Create workbook | `createWorkbookAction` | B2A-1 | ✅ SUCCESS | 🔒 **BLOCKED** | `assertProjectAccess` | ✅ Static guard |
| **E9** | List workbooks in project | `getProjectWorkbooksAction` | B2A-1 | ✅ SUCCESS | 🔒 **BLOCKED** | `assertProjectAccess` | ✅ Static guard |
| **E10** | Export workbook | `exportWorkbookAction` | B2A-1 | ✅ SUCCESS (exfiltrated) | 🔒 **BLOCKED** | `assertProjectAccess` | ✅ E10 (307 redirect) |
| **E11** | Access evidence | `getEvidenceAction` | B2A-1 | ✅ SUCCESS | 🔒 **BLOCKED** | `assertProjectAccess` | ✅ Static guard |
| **E12** | Upload evidence to wrong project | `uploadEvidenceAction` | B2A-1 | ✅ SUCCESS | 🔒 **BLOCKED** | `assertProjectAccess` | ✅ Static guard |
| **E13** | Review AI suggestion cross-org | `reviewSuggestionAction` → `reviewPatternSuggestion` | B2A-2 + B2A-4 | ✅ SUCCESS (approved) | 🔒 **BLOCKED** | `requirePatternSuggestionAccess` + lib orgId | ✅ E13 (307 redirect) |
| **E14** | Review false positive cross-org | `reviewExplanationAction` → `reviewFalsePositive` | B2A-2 + B2A-4 | ✅ SUCCESS | 🔒 **BLOCKED** | `requireMatchReviewAccess` + lib orgId | ✅ E17 (307 redirect) |
| **E15** | Batch review cross-org | `batchReviewAction` | B2A-2 + B2A-4 | ✅ SUCCESS | 🔒 **BLOCKED** | `requirePatternSuggestionAccess` / `requireMatchReviewAccess` | ✅ Static guard |
| **E16** | AI review on wrong org | `runWorkbookAiReviewAction` → `runWorkbookAiReview` | B2A-1 + B2A-4 | ✅ SUCCESS (triggered) | 🔒 **BLOCKED** | `assertProjectAccess` + lib orgId | ✅ E01 (307 redirect) |
| **E17** | Run AI advisor on wrong org | `runAiAdvisorAction` → `runAdvisorForWorkbook` | B2A-1 + B2A-3 | ✅ SUCCESS | 🔒 **BLOCKED** | `assertProjectAccess` + lib orgId | ✅ Static guard |
| **E18** | Calibrate wrong workbook | `calibrateWorkbookAction` | B2A-3 | ✅ SUCCESS | 🔒 **BLOCKED** | lib orgId | ✅ Static guard |
| **E19** | Get workbook suggestions | `getSuggestionsForWorkbookAction` | B2A-3 | ✅ SUCCESS | 🔒 **BLOCKED** | lib orgId | ✅ Static guard |
| **E20** | Access workbook report | `getWorkbookReportAction` | B2A-1 | ✅ SUCCESS | 🔒 **BLOCKED** | `assertProjectAccess` | ✅ Static guard |
| **E21** | Read review queue cross-org | `getReviewQueueAction` | B2A-2 | ✅ SUCCESS (listed) | 🔒 **BLOCKED** | `requireOrganizationAccess` | ✅ Static guard |

---

## Lib-Layer Direct Attack Paths (Post-B2A-4)

After B2A-4 added required `organizationId` parameters to 3 lib functions:

| ID | Function | Attack Vector | Before B2A-4 | After B2A-4 | Proof |
|----|----------|--------------|:------------:|:-----------:|:-----:|
| **E13b** | `reviewPatternSuggestion` | Direct call without orgId | ✅ Possible (no org check) | 🔒 **BLOCKED** (TS error — required param) | ✅ `npx tsc --noEmit` |
| **E13c** | `reviewFalsePositive` | Direct call without orgId | ✅ Possible (no org check) | 🔒 **BLOCKED** (TS error — required param) | ✅ `npx tsc --noEmit` |
| **E16b** | `reviewRecommendation` | Direct call without orgId | ✅ Possible (no org check) | 🔒 **BLOCKED** (TS error — required param) | ✅ `npx tsc --noEmit` |

**Note:** These lib-layer paths were not exploitable in production (action layer guarded them in B2A-2). The lib-layer fix in B2A-4 adds defense-in-depth by requiring `organizationId` at compile time.

---

## Summary

| Category | Before (RB-01) | After (B2A) | Status |
|----------|:--------------:|:-----------:|:------:|
| Action-layer exploitation paths | 21 | **0** | ✅ CLOSED |
| Lib-layer unscoped functions | 7 | **0** | ✅ CLOSED |
| Caller-scoped (defense-in-depth) | 0 | 14 | 🏷️ Technical debt |
| Dead/future unscoped calls | 0 | 3 | 💤 No risk |
| **Zero Tenant Leakage Gate** | **FAIL** | **PASS** ✅ | **✅ B2A-5: 14/14 ALL PASS** |
