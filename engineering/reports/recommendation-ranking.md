# Recommendation Ranking Report

**Agent:** recommendation-ranking  
**Generated:** 2026-07-11T02:08:06.890Z  
**Score:** 84/100  
**Findings:** 10 (critical 0, high 10, medium 0, low 0, info 0)

> Engineering Excellence — findings only. OpenCode remains implementation authority. No automatic code changes.

## Summary

| Severity | Count |
| -------- | ----- |
| critical | 0 |
| high | 10 |
| medium | 0 |
| low | 0 |
| info | 0 |

## Top 10

# Top 10 Ranked Recommendations

**Generated:** 2026-07-11T02:08:06.888Z

| Rank | ROI | Impact | Diff | Risk | Conf | Product | Title |
| ---- | --- | ------ | ---- | ---- | ---- | ------- | ----- |
| 1 | **3.4** | 9 | 2 | 2 | 75% | SalesOS | Possible secret material (generic-secret) |
| 2 | **3.4** | 9 | 2 | 2 | 75% | LocalContentOS | Possible secret material (generic-secret) |
| 3 | **3.4** | 9 | 2 | 2 | 75% | Platform | Possible secret material (generic-secret) |
| 4 | **3.4** | 9 | 2 | 2 | 75% | WorkflowOS | API route may lack auth check |
| 5 | **3.4** | 9 | 2 | 2 | 75% | WorkflowOS | API route may lack auth check |
| 6 | **3.4** | 9 | 2 | 2 | 75% | Platform | API route may lack auth check |
| 7 | **3.4** | 9 | 2 | 2 | 75% | Platform | API route may lack auth check |
| 8 | **3.4** | 9 | 2 | 2 | 75% | Platform | API route may lack auth check |
| 9 | **3.4** | 9 | 2 | 2 | 75% | Platform | API route may lack auth check |
| 10 | **3.4** | 9 | 2 | 2 | 75% | Platform | API route may lack auth check |

## Ranking Model

```
ROI ≈ (Impact × Confidence) / (0.6×Difficulty + 0.4×Risk)
```

OpenCode remains implementation authority. This list is advisory.

### 1. Possible secret material (generic-secret)

- **Fingerprint:** `da1ed81c9c3b`
- **Files:** `src/lib/sales/vnext/learning-loop.ts`
- **Suggestion:** Move to env/Secrets Manager; rotate if real.

### 2. Possible secret material (generic-secret)

- **Fingerprint:** `1f9d967e11e8`
- **Files:** `src/lib/local-content/erp/connector-factory.ts`
- **Suggestion:** Move to env/Secrets Manager; rotate if real.

### 3. Possible secret material (generic-secret)

- **Fingerprint:** `c80eb58f437f`
- **Files:** `src/app/settings/retention/page.tsx`
- **Suggestion:** Move to env/Secrets Manager; rotate if real.

### 4. API route may lack auth check

- **Fingerprint:** `4d9ae7e6467f`
- **Files:** `src/app/api/workflowos/escalation-check/route.ts`
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### 5. API route may lack auth check

- **Fingerprint:** `e9840101eae7`
- **Files:** `src/app/api/workflowos/clients/[clientId]/records/[recordId]/export/pdf/route.ts`
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### 6. API route may lack auth check

- **Fingerprint:** `04e6963e9b32`
- **Files:** `src/app/api/scim/v2/Users/route.ts`
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### 7. API route may lack auth check

- **Fingerprint:** `98dce0e7a33c`
- **Files:** `src/app/api/scim/v2/Users/[id]/route.ts`
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### 8. API route may lack auth check

- **Fingerprint:** `88307898a617`
- **Files:** `src/app/api/scim/v2/Groups/route.ts`
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### 9. API route may lack auth check

- **Fingerprint:** `fc258a1eda54`
- **Files:** `src/app/api/scim/v2/Groups/[id]/route.ts`
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### 10. API route may lack auth check

- **Fingerprint:** `e2c27d3df5a9`
- **Files:** `src/app/api/platform/retention/route.ts`
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

## HIGH Findings

### F-0826 — #1 ROI 3.4 — Possible secret material (generic-secret)

- **Category:** ranked-recommendation
- **Files:** `src/lib/sales/vnext/learning-loop.ts`
- **Evidence:** impact=9/10 difficulty=2/5 risk=2/5 confidence=75% product=SalesOS occurrences=1
- **Suggestion:** Move to env/Secrets Manager; rotate if real.

### F-0827 — #2 ROI 3.4 — Possible secret material (generic-secret)

- **Category:** ranked-recommendation
- **Files:** `src/lib/local-content/erp/connector-factory.ts`
- **Evidence:** impact=9/10 difficulty=2/5 risk=2/5 confidence=75% product=LocalContentOS occurrences=1
- **Suggestion:** Move to env/Secrets Manager; rotate if real.

### F-0828 — #3 ROI 3.4 — Possible secret material (generic-secret)

- **Category:** ranked-recommendation
- **Files:** `src/app/settings/retention/page.tsx`
- **Evidence:** impact=9/10 difficulty=2/5 risk=2/5 confidence=75% product=Platform occurrences=1
- **Suggestion:** Move to env/Secrets Manager; rotate if real.

### F-0829 — #4 ROI 3.4 — API route may lack auth check

- **Category:** ranked-recommendation
- **Files:** `src/app/api/workflowos/escalation-check/route.ts`
- **Evidence:** impact=9/10 difficulty=2/5 risk=2/5 confidence=75% product=WorkflowOS occurrences=1
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0830 — #5 ROI 3.4 — API route may lack auth check

- **Category:** ranked-recommendation
- **Files:** `src/app/api/workflowos/clients/[clientId]/records/[recordId]/export/pdf/route.ts`
- **Evidence:** impact=9/10 difficulty=2/5 risk=2/5 confidence=75% product=WorkflowOS occurrences=1
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0831 — #6 ROI 3.4 — API route may lack auth check

- **Category:** ranked-recommendation
- **Files:** `src/app/api/scim/v2/Users/route.ts`
- **Evidence:** impact=9/10 difficulty=2/5 risk=2/5 confidence=75% product=Platform occurrences=1
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0832 — #7 ROI 3.4 — API route may lack auth check

- **Category:** ranked-recommendation
- **Files:** `src/app/api/scim/v2/Users/[id]/route.ts`
- **Evidence:** impact=9/10 difficulty=2/5 risk=2/5 confidence=75% product=Platform occurrences=1
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0833 — #8 ROI 3.4 — API route may lack auth check

- **Category:** ranked-recommendation
- **Files:** `src/app/api/scim/v2/Groups/route.ts`
- **Evidence:** impact=9/10 difficulty=2/5 risk=2/5 confidence=75% product=Platform occurrences=1
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0834 — #9 ROI 3.4 — API route may lack auth check

- **Category:** ranked-recommendation
- **Files:** `src/app/api/scim/v2/Groups/[id]/route.ts`
- **Evidence:** impact=9/10 difficulty=2/5 risk=2/5 confidence=75% product=Platform occurrences=1
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0835 — #10 ROI 3.4 — API route may lack auth check

- **Category:** ranked-recommendation
- **Files:** `src/app/api/platform/retention/route.ts`
- **Evidence:** impact=9/10 difficulty=2/5 risk=2/5 confidence=75% product=Platform occurrences=1
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

---

_AQLIYA Engineering Excellence · recommendation-ranking_
