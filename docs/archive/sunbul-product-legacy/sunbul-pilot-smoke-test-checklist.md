# Sunbul Pilot Smoke Test Checklist

**Date:** 2026-05-18
**Purpose:** Manual validation before/during pilot
**Estimated time:** 30 minutes

---

## Preparation

- [ ] Sunbul is accessible at `/sunbul`
- [ ] PlatformAdmin can log in
- [ ] Operator can log in
- [ ] Reviewer can log in
- [ ] At least one client exists with memberships

---

## 1. Login & Access

| # | Test | Expected Result | Pass/Fail |
|---|---|---|---|
| 1.1 | Open `/sunbul` without login | Redirect to login page or show error | ☐ |
| 1.2 | Login as PlatformAdmin | Dashboard loads with client list | ☐ |
| 1.3 | Login as Operator | Dashboard loads with assigned client only | ☐ |
| 1.4 | Login as Reviewer | Dashboard loads with assigned client | ☐ |

## 2. Client Visibility

| # | Test | Expected Result | Pass/Fail |
|---|---|---|---|
| 2.1 | PlatformAdmin sees all clients | Client selector shows all clients | ☐ |
| 2.2 | Operator sees only assigned client | Client selector shows only client(s) with membership | ☐ |
| 2.3 | Reviewer sees only assigned client | Client selector shows only client(s) with membership | ☐ |
| 2.4 | User without membership sees empty state | No clients shown; empty state displayed | ☐ |

## 3. Create Case

| # | Test | Expected Result | Pass/Fail |
|---|---|---|---|
| 3.1 | Operator clicks "إنشاء قضية" | Form appears | ☐ |
| 3.2 | Operator submits without title | Error: title required | ☐ |
| 3.3 | Operator submits with title + description | Record created as Draft, appears in list | ☐ |
| 3.4 | Operator creates case and sees status badge | Status badge shows "مسودة" | ☐ |
| 3.5 | Reviewer does not see "إنشاء قضية" button | Create button not visible | ☐ |

## 4. Upload Document

| # | Test | Expected Result | Pass/Fail |
|---|---|---|---|
| 4.1 | Operator uploads PDF to Draft record | Document appears in list, audit event created | ☐ |
| 4.2 | Operator uploads XLSX file | Document appears with correct type/size | ☐ |
| 4.3 | Operator tries to upload `.exe` | Error: file type not allowed | ☐ |
| 4.4 | Reviewer tries to upload | Upload button not visible | ☐ |
| 4.5 | Download uploaded file | File downloads with correct content | ☐ |

## 5. Submit for Review

| # | Test | Expected Result | Pass/Fail |
|---|---|---|---|
| 5.1 | Operator opens Draft record | Status shows "مسودة", submit button visible | ☐ |
| 5.2 | Operator clicks "إرسال للمراجعة" | Status changes to "تحت المراجعة" | ☐ |
| 5.3 | Submit button no longer visible after submit | Actions update based on new status | ☐ |
| 5.4 | Operator cannot add documents after submit | Document add button hidden | ☐ |

## 6. Review Queue

| # | Test | Expected Result | Pass/Fail |
|---|---|---|---|
| 6.1 | Reviewer opens dashboard | Review queue shows UnderReview records | ☐ |
| 6.2 | PlatformAdmin opens dashboard | Review queue shows UnderReview records | ☐ |
| 6.3 | Operator opens dashboard | Review queue shows "متاحة للمراجعين فقط" | ☐ |
| 6.4 | Reviewer clicks record in queue | Opens record detail page | ☐ |

## 7. Review / Approve

| # | Test | Expected Result | Pass/Fail |
|---|---|---|---|
| 7.1 | Reviewer opens UnderReview record | Approve and Return buttons visible | ☐ |
| 7.2 | Reviewer clicks "اعتماد" | Status changes to "معتمد" | ☐ |
| 7.3 | Audit event recorded for approval | "RECORD_APPROVED" in audit trail | ☐ |
| 7.4 | Record no longer in review queue after approve | Queue updates | ☐ |

## 8. Review / Return

| # | Test | Expected Result | Pass/Fail |
|---|---|---|---|
| 8.1 | Reviewer opens UnderReview record | Return button visible | ☐ |
| 8.2 | Reviewer clicks "إرجاع" | Notes field appears | ☐ |
| 8.3 | Reviewer enters notes and confirms | Status changes to "مسودة" | ☐ |
| 8.4 | Return notes visible in review panel | Notes displayed | ☐ |
| 8.5 | Audit event recorded for return | "RECORD_RETURNED" in audit trail | ☐ |

## 9. Resubmit

| # | Test | Expected Result | Pass/Fail |
|---|---|---|---|
| 9.1 | Operator opens returned Draft record | Can edit description | ☐ |
| 9.2 | Operator can add documents again | Document add visible | ☐ |
| 9.3 | Operator resubmits | Status changes to "تحت المراجعة" | ☐ |

## 10. Archive

| # | Test | Expected Result | Pass/Fail |
|---|---|---|---|
| 10.1 | PlatformAdmin opens Approved record | Archive button visible | ☐ |
| 10.2 | Operator opens Approved record | Archive button NOT visible | ☐ |
| 10.3 | Reviewer opens Approved record | Archive button NOT visible | ☐ |
| 10.4 | PlatformAdmin clicks "أرشفة" | Status changes to "مؤرشف" | ☐ |
| 10.5 | Audit event recorded for archive | "RECORD_ARCHIVED" in audit trail | ☐ |

## 11. Export PDF

| # | Test | Expected Result | Pass/Fail |
|---|---|---|---|
| 11.1 | Open Approved record | Export link shows "تحميل التقرير (PDF)" | ☐ |
| 11.2 | Click export link | PDF downloads with correct filename | ☐ |
| 11.3 | Open exported PDF | Contains: title, status, description, documents, reviews, audit trail, disclaimer | ☐ |
| 11.4 | Open Archived record | Export link still visible | ☐ |
| 11.5 | Open Draft/UnderReview record | Export message: "لا يمكن تصدير القضية قبل الاعتماد" | ☐ |

## 12. Audit Trail

| # | Test | Expected Result | Pass/Fail |
|---|---|---|---|
| 12.1 | Open record detail | Audit trail section shows all events | ☐ |
| 12.2 | Events appear in reverse chronological order | Newest first | ☐ |
| 12.3 | Each event has Arabic action label | e.g., "تم إنشاء القضية", "تم اعتماد القضية" | ☐ |

## 13. Cross-Client Isolation

| # | Test | Expected Result | Pass/Fail |
|---|---|---|---|
| 13.1 | Operator from Client A cannot see Client B records | Client B not in selector | ☐ |
| 13.2 | Manually navigate to Client B record URL | Error: access denied | ☐ |
| 13.3 | Manually navigate to Client B export URL | Error: access denied | ☐ |
| 13.4 | Manually navigate to Client B document download | Error: access denied | ☐ |

---

## Summary

| Section | Tests | Passed | Failed |
|---|---|---|---|
| 1. Login & Access | 4 | ☐ | ☐ |
| 2. Client Visibility | 4 | ☐ | ☐ |
| 3. Create Case | 5 | ☐ | ☐ |
| 4. Upload Document | 5 | ☐ | ☐ |
| 5. Submit for Review | 4 | ☐ | ☐ |
| 6. Review Queue | 4 | ☐ | ☐ |
| 7. Review / Approve | 4 | ☐ | ☐ |
| 8. Review / Return | 5 | ☐ | ☐ |
| 9. Resubmit | 3 | ☐ | ☐ |
| 10. Archive | 5 | ☐ | ☐ |
| 11. Export PDF | 5 | ☐ | ☐ |
| 12. Audit Trail | 3 | ☐ | ☐ |
| 13. Cross-Client Isolation | 4 | ☐ | ☐ |
| **Total** | **55** | ☐ | ☐ |

**Pilot Director Decision:**

☐ **GO** — All critical tests pass
☐ **CONDITIONAL** — Non-critical tests fail; documented and accepted
☐ **NO-GO** — Blocking issue found: ________________________________
