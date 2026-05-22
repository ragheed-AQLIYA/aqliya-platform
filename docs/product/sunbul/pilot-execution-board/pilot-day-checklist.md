# Sunbul Pilot Day Checklist

**Version:** 1.0
**Date:** \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_
**Classification:** Internal — Sunbul Team

---

## Setup Phase

### Pre-Call

- [ ] Cloud instance is running
- [ ] Latest Sunbul code deployed
- [ ] `npx prisma migrate status` — up to date
- [ ] `npx tsx scripts/validate-sunbul-e2e.ts` — 54/54
- [ ] All test users can log in
- [ ] Screen sharing tool ready
- [ ] Operator manual ready: `docs/product/sunbul/sunbul-operator-manual.md`
- [ ] Feedback form ready: `external-pilot-pack/post-pilot-feedback-form.md`
- [ ] Issue log ready: `pilot-issue-log.md`
- [ ] Observation log ready: `pilot-observation-log.md`

### Client Setup (via `/sunbul/admin`)

- [ ] Client created with correct slug
- [ ] Client status is "نشط"
- [ ] PlatformAdmin user invited and has membership
- [ ] All Operator users invited with "مشغل" role
- [ ] All Reviewer users invited with "مراجع" role
- [ ] Each user can log in and see the client
- [ ] Non-admin users cannot see other clients

---

## Pilot Day — Walkthrough

### 1. Access Check

- [ ] Client operator logs in successfully
- [ ] Client sees the Sunbul dashboard
- [ ] Client sees only their client in the dropdown
- [ ] Workspace status shows "تشغيل سليم"

### 2. Create Case

- [ ] Operator clicks "إنشاء قضية"
- [ ] Enters title: first real case title
- [ ] Enters description (optional)
- [ ] Submits
- [ ] Case appears in record list with status "مسودة"
- [ ] Case status badge is correct

### 3. Upload Document

- [ ] Operator opens the case
- [ ] Clicks "رفع مستند"
- [ ] Selects a PDF file
- [ ] File uploads successfully
- [ ] Document appears in document list with correct name/size/type
- [ ] Download link works
- [ ] Downloaded file has correct content

### 4. Submit for Review

- [ ] Operator clicks "إرسال للمراجعة"
- [ ] Status changes to "تحت المراجعة"
- [ ] Submit button is no longer visible
- [ ] Document add button is no longer visible

### 5. Review — Return with Notes

- [ ] Reviewer logs in
- [ ] Reviewer sees case in review queue
- [ ] Reviewer opens the case
- [ ] Reviewer can see all details and documents
- [ ] Reviewer clicks "إرجاع"
- [ ] Adds Arabic notes: request for additional information
- [ ] Confirms return
- [ ] Status changes to "مسودة"
- [ ] Return notes appear in review panel

### 6. Revise and Resubmit

- [ ] Operator opens the returned case
- [ ] Return notes are visible in review panel
- [ ] Operator adds a second document (if needed)
- [ ] Operator updates description
- [ ] Operator clicks "إرسال للمراجعة"
- [ ] Status changes to "تحت المراجعة"

### 7. Review — Approve

- [ ] Reviewer opens the resubmitted case
- [ ] Reviewer clicks "اعتماد"
- [ ] Status changes to "معتمد"
- [ ] Case disappears from review queue
- [ ] Approval recorded in review panel

### 8. Export PDF

- [ ] Operator opens the approved case
- [ ] Export section shows "تحميل التقرير (PDF)"
- [ ] Operator clicks the link
- [ ] PDF downloads
- [ ] PDF contains:
  - Case title and ID
  - Client name
  - Status: معتمد
  - Description
  - Document list
  - Review history (return and approve)
  - Audit trail
  - Governance disclaimer

### 9. Archive

- [ ] PlatformAdmin logs in
- [ ] Opens the approved case
- [ ] Archive button is visible
- [ ] Clicks "أرشفة"
- [ ] Status changes to "مؤرشف"
- [ ] Case is read-only

### 10. Audit Trail Review

- [ ] Open any completed case
- [ ] Scroll to "سجل الأثر" section
- [ ] Events visible:
  - إنشاء القضية
  - إضافة مستند
  - إرسال للمراجعة
  - إرجاع القضية (with notes)
  - إرسال للمراجعة (resubmit)
  - اعتماد القضية
  - أرشفة القضية
- [ ] Each event has timestamp and actor ID

---

## Post-Demo

- [ ] Client asked for questions
- [ ] Observations recorded in observation log
- [ ] Issues recorded in issue log
- [ ] Next check-in scheduled
- [ ] Feedback form shared with client

---

## Day Summary

| Section | Total Steps | Passed | Failed | Notes |
|---|---|---|---|---|
| Setup | 10 | | | |
| Walkthrough | 37 | | | |
| Post-Demo | 5 | | | |
| **Total** | **52** | | | |
