# Smoke Routes

﻿# Phase 3 — Runtime Smoke Plan 2026-05-28

**Status:** Low-load smoke test plan for pilot readiness verification
**Purpose:** Verify critical routes are reachable and functional without running heavy automation
**Execution rule:** Do not run browser automation or `npm run build` without explicit approval
**Last updated:** 2026-05-28

---

## Smoke Routes

### 1. Home Page — `/`

| Check | Expected Result | Method |
|-------|----------------|--------|
| Page loads | 200 OK, no crash | Manual browser visit |
| Arabic-first layout | RTL direction, Arabic content visible | Visual check |
| Navigation links | All links point to valid routes | Visual + click test |
| No console errors | No 404, no JS exceptions | Browser console |
| Pilot relevance | Entry point for all users | Foundational |

### 2. AuditOS Workspace — `/audit`

| Check | Expected Result | Method |
|-------|----------------|--------|
| Auth required | Redirects to login if not authenticated | Manual |
| Dashboard loads | Engagement counts, activity feed | Manual |
| Engagement list | Shows seeded engagements | Manual |
| No console errors | No 404, no JS exceptions | Browser console |
| Pilot relevance | Primary pilot workspace | Critical |

### 3. AuditOS Demo — `/auditos`

| Check | Expected Result | Method |
|-------|----------------|--------|
| No auth required | Page loads without login | Manual |
| Mock data only | No real data visible | Visual + data check |
| Demo navigation | All demo screens accessible | Manual |
| No console errors | Clean console | Browser console |
| Pilot relevance | Demo surface for prospects | Important |

### 4. DecisionOS — `/decisions`

| Check | Expected Result | Method |
|-------|----------------|--------|
| Auth required | Redirect if not authenticated | Manual |
| Decision list | Shows seeded decisions | Manual |
| Decision detail | Navigate to decision detail | Manual |
| Evidence tab | Upload/list evidence | Manual |
| No console errors | Clean console | Browser console |
| Pilot relevance | Adjacent pilot surface | Medium |

### 5. LocalContentOS — `/local-content`

| Check | Expected Result | Method |
|-------|----------------|--------|
| Auth required | Redirect if not authenticated | Manual |
| Projects list | Shows seeded projects | Manual |
| Project detail | Navigate to project | Manual |
| Loading state | Shows loading.tsx on navigation | Visual check |
| No console errors | Clean console | Browser console |
| Pilot relevance | Strategic second product | Medium |

### 6. Products Landing — `/products/audit`

| Check | Expected Result | Method |
|-------|----------------|--------|
| Page loads | 200 OK | Manual |
| Product info | Correct product description | Visual check |
| No false claims | No unsupported production claims | Visual review |
| No console errors | Clean console | Browser console |
| Pilot relevance | Marketing surface for prospects | Medium |

### 7. Contact — `/contact`

| Check | Expected Result | Method |
|-------|----------------|--------|
| Page loads | 200 OK | Manual |
| Form renders | Contact form visible | Manual |
| Submit works | Form submission handled | Manual test |
| No console errors | Clean console | Browser console |
| Pilot relevance | Prospect intake | Important |

### 8. Engagement Models — `/engagement-models`

| Check | Expected Result | Method |
|-------|----------------|--------|
| Page loads | 200 OK | Manual |
| Content renders | Engagement model info visible | Manual |
| No console errors | Clean console | Browser console |
| Pilot relevance | Pilot scope documentation | Low-Medium |

### 9. Pilot Proof — `/pilot-proof`

| Check | Expected Result | Method |
|-------|----------------|--------|
| Route exists | 200 or proper redirect | Manual |
| Content relevant | Pilot proof capture info | Visual check |
| No console errors | Clean console | Browser console |
| Pilot relevance | Proof capture surface | Important |

### 10. Proof Library — `/proof-library`

| Check | Expected Result | Method |
|-------|----------------|--------|
| Route exists | 200 or proper redirect | Manual |
| Content relevant | Proof library accessible | Visual check |
| No console errors | Clean console | Browser console |
| Pilot relevance | Proof asset index | Medium |

---

## Pass/Fail Template

For each route, record:

```
Route: [URL]
Date: [YYYY-MM-DD]
Tester: [Name]

Checks:
- [ ] Page loads (200 OK)
- [ ] Auth behavior correct
- [ ] Data loads correctly
- [ ] Navigation works
- [ ] No console errors
- [ ] No false claims visible
- [ ] Arabic/RTL renders correctly

Result: PASS / FAIL / PARTIAL
Notes: [Any observations]
```

---

## Data Boundary Check

For routes that display data, verify:

- [ ] Data is scoped to the correct organization
- [ ] No cross-tenant data visible
- [ ] Empty states handled gracefully
- [ ] Loading states visible during data fetch
- [ ] Error states shown on failure

---

## Approval Request

To execute these smoke tests in a runtime browser, approval is required.

**Request:** Run manual smoke test of the 10 routes above using browser automation.

**Risk:** Low — read-only navigation, no mutations, no data changes.

**Duration:** Approx 15-20 minutes for manual walkthrough.

Would you like to proceed with runtime smoke testing?

---

## Related Documents

| Document | Path |
|----------|------|
| Post-Deploy Smoke Test | `docs/reports/auditos-post-deploy-smoke-test.md` |
| Site Map Verification | `docs/reports/site-map-verification-report.md` |
| Route Strategy | `docs/source-of-truth/ROUTE_STRATEGY.md` |
| Phase 3 Execution Report | `docs/reports/phase-3-controlled-pilot-execution-2026-05-28.md` |
