# Sunbul Phase 3E — Internal Pilot Simulation Report

**Date:** 2026-05-18
**Status:** Complete
**Simulation:** ✅ `npx tsx scripts/sunbul-internal-pilot.ts` — **40/40 steps passed, 0 failures**

---

## 1. Simulation Summary

| Aspect | Detail |
|---|---|
| Method | Script-based workflow execution via direct Prisma + service calls |
| Seed data | `scripts/seed-sunbul-pilot.ts` — pilot client + memberships + sample records |
| Roles tested | PlatformAdmin (admin@aqliya.com), Operator (sara@aqliya.com) |
| Client | "Pilot Client — العميل التجريبي" |
| Workflow tested | Draft → Document → Submit → Return → Resubmit → Approve → Export → Archive |

## 2. Workflow Steps Executed

| Step | Action | Result |
|---|---:|---|
| 1 | Access control verification | ✅ Passed |
| 2 | Record creation (or reuse existing Draft) | ✅ Passed |
| 3 | Document upload + scoping verification | ✅ Passed |
| 4 | Submit for review (Draft → UnderReview) | ✅ Passed |
| 5 | Reviewer returns record with Arabic notes | ✅ Passed |
| 6 | Operator resubmits after revision | ✅ Passed |
| 7 | Reviewer approves record | ✅ Passed |
| 8 | PDF export generation | ✅ Passed |
| 9 | PlatformAdmin archives record | ✅ Passed |
| 10 | Audit trail verification (7 events) | ✅ Passed |
| 11 | Edge case validation | ✅ Passed |

## 3. Audit Events Generated

| Action | Actor | Notes |
|---|---|---|
| RECORD_CREATED | Operator | From seed script |
| DOCUMENT_CREATED | Operator | Document uploaded to record |
| RECORD_SUBMITTED | Operator | Draft → UnderReview |
| RECORD_RETURNED | PlatformAdmin | UnderReview → Draft (with Arabic notes) |
| RECORD_SUBMITTED | Operator | Draft → UnderReview (resubmit) |
| RECORD_APPROVED | PlatformAdmin | UnderReview → Approved |
| RECORD_ARCHIVED | PlatformAdmin | Approved → Archived |

## 4. Findings

### 4.1 UI Friction (non-blocking)

| Issue | Severity | Recommendation |
|---|---|---|
| Create form button label says "إنشاء قضية" but operator needs clearer indication of what a "قضية" is | Low | Add tooltip or helper text: "قضية = طلب أو حالة تحتاج مراجعة واعتماد" |
| Review queue shows **all** records, not just UnderReview | Low | Add status filter to `sunbul_listRecords()` call in `SunbulReviewQueue` |
| Return action requires clicking "إرجاع" then typing notes then clicking "تأكيد" — three steps | Low | Acceptable for MVP; could be simplified to one-click + modal |
| No confirmation dialog before approve/archive | Low | Consider adding "هل أنت متأكد؟" dialog for destructive actions |

### 4.2 Permission Friction (non-blocking)

| Issue | Severity | Recommendation |
|---|---|---|
| PlatformAdmin can see **all** records including other operators' drafts | Low | Intended behavior for MVP; add record-level ownership visibility control in Pilot |
| No way to change user role without server/database access | Medium | Add UI for PlatformAdmin to manage memberships (future phase) |

### 4.3 Operational Gaps

| Issue | Severity | Recommendation |
|---|---|---|
| No email notification when record is returned to draft | Medium | Add in-app notification or email for Pilot (deferred) |
| No dashboard badge showing pending review count | Low | Add count badge to Sunbul sidebar item |
| Operator cannot see why record was returned without opening detail page | Low | Add return reason indicator on record list row |
| No "last action by" column in record list | Low | Add last action/actor info for context |

### 4.4 Labels & Language

| Issue | Severity | Recommendation |
|---|---|---|
| "UnderReview" in status badge shows "تحت المراجعة" — correct | ✅ Good | No change needed |
| "Approved" shows "معتمد" — correct | ✅ Good | No change needed |
| "Archived" shows "مؤرشف" — correct | ✅ Good | No change needed |
| "Draft" shows "مسودة" — correct | ✅ Good | No change needed |

### 4.5 Broken or Awkward Flows

| Issue | Severity | Recommendation |
|---|---|---|
| **None found.** All 40 simulation steps passed. | — | — |

## 5. Pilot-Blocking Issues

**None.** Zero blocking issues identified.

## 6. Non-Blocking Improvements

1. **Review queue filter** — `SunbulReviewQueue` currently fetches all records. Add `status: "UnderReview"` filter to the `listSunbulRecords` query.
2. **Return reason on record list** — Add a visual indicator on rows showing the most recent return note.
3. **Badge for pending reviews** — Show a count badge in the sidebar for pending UnderReview records.
4. **In-app toast notification** — Show brief success/error toasts after workflow actions instead of just inline messages.

## 7. Pilot Readiness Decision

### **GO — Ready for External Pilot Client**

**40/40 simulation steps passed, 0 failures, 0 blocking issues.**

The complete governed workflow is validated end-to-end:

```
Auth → Client Isolation → Record (Draft) → Document Upload → Submit → 
  Return (Arabic notes) → Resubmit → Approve → PDF Export → Archive → Audit Trail
```

All tenant isolation, role enforcement, status gating, and audit logging function correctly at the data layer. The 7 findings above are cosmetic/deferred improvements, not blockers.

## 8. Pilot Day Quick Reference

```bash
# 1. Seed pilot data
npx tsx prisma/seed.ts
npx tsx scripts/seed-sunbul-pilot.ts

# 2. Verify platform health
npx prisma migrate status
npx prisma generate
npx tsc --noEmit

# 3. Run validation
npx tsx scripts/validate-sunbul-e2e.ts

# 4. Login credentials
#    PlatformAdmin: admin@aqliya.com / admin123
#    Operator:      sara@aqliya.com / operator123

# 5. Navigate to /sunbul and select pilot client

# 6. Follow pilot smoke test checklist:
#    docs/archive/sunbul-product-legacy/sunbul-pilot-smoke-test-checklist.md
```
