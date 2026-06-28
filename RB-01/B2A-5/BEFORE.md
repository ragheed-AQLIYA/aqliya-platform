# B2A-5: Final Proof — Evidence Package

## BEFORE.md — Baseline Attack Surface

> **Context:** B2A-5 is the final verification wave. All 21 exploitation paths from RB-01 Phase 1 have been closed across B2A-1 through B2A-4. This wave proves that **Zero Tenant Leakage = PASS** by running automated cross-tenant attack scenarios against a live test instance.
> 
> **Target:** 6 canonical exploit paths representing workbook, review, export, and AI domains.
> 
> **Expected outcome after B2A-4:** All 6 exploitation attempts should be **BLOCKED**.

---

### Exploit Catalog (Original from RB-01 Phase 1)

| ID | Name | Entry Point | Before B2A-1 | After B2A-4 |
|----|------|-------------|:------------:|:-----------:|
| E1 | Read any workbook | `getWorkbookAction` → `getWorkbook` | ✅ Exploitable | 🔒 BLOCKED (assertProjectAccess) |
| E2 | Write to any line | `updateWorkbookLineAction` → `updateWorkbookLineValue` | ✅ Exploitable | 🔒 BLOCKED (assertProjectAccess) |
| E10 | Export workbook | `exportWorkbookAction` → `exportWorkbook` | ✅ Exploitable | 🔒 BLOCKED (assertProjectAccess) |
| E13 | Review AI suggestion | `reviewSuggestionAction` → `reviewPatternSuggestion` | ✅ Exploitable | 🔒 BLOCKED (requirePatternSuggestionAccess + lib orgId) |
| E16 | AI review wrong org | `runWorkbookAiReviewAction` → `runWorkbookAiReview` | ✅ Exploitable | 🔒 BLOCKED (assertProjectAccess + lib orgId) |
| E21 | Read review queue | `getReviewQueueAction` | ✅ Exploitable | 🔒 BLOCKED (requireOrganizationAccess) |

### Security Coverage After B2A-4

| Layer | Metric | Value |
|-------|--------|:-----:|
| Action Layer | Protected functions | 31/31 (100%) |
| Guard Layer | Shared guards | 8/8 (100%) |
| Lib Layer (self-scoped) | Self-scoped calls | 25/32 (78%) |
| Lib Layer (caller-scoped) | Defense-in-depth calls | 14/32 (44%) |
| Exploitation paths | Reachable | **0/21 (0%)** |

### Prerequisites for Running B2A-5 Proof

1. Running Next.js app with test database (Docker DB)
2. Two organizations: Org A (attacker) and Org B (victim)
3. Org A user authenticated with valid session
4. Known IDs: Org B's workbookId, projectId, organizationId, suggestionId, lineId
5. OR: `--setup` flag to seed test data

### Expected Results

```
E1  (Read workbook)     → 404/Forbidden (not workbook data)
E2  (Write line)        → 400/Forbidden (not success)
E10 (Export workbook)   → 404/Forbidden (not exported data)
E13 (Review suggestion) → 403/Forbidden (not approved)
E16 (AI review)         → 404/Forbidden (not AI review result)
E21 (Read review queue) → []/{total:0} (not Org B's queue)
```

### Lib-Layer Direct Attack Paths (Post-B2A-4)

After B2A-4 added `organizationId` params to 3 key functions, direct lib-layer calls without orgId should also be tested:

| ID | Function | B2A-4 Fix | Expected Result Without orgId |
|----|----------|-----------|------------------------------|
| E13b | `reviewPatternSuggestion` | Added `organizationId` param | TS error at compile time (required param) |
| E13c | `reviewFalsePositive` | Added `organizationId` param | TS error at compile time (required param) |
| E16b | `reviewRecommendation` | Added `organizationId` param | TS error at compile time (required param) |
