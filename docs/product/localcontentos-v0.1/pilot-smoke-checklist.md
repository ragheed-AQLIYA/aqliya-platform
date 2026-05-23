# LocalContentOS v0.1 — Pilot Smoke Checklist

**Status:** L5 pilot-ready with conditions. Mutation feedback loop verified (2026-05-23). Item 8 (finding create) **PASS** on `/local-content/projects/lc-project-demo-001/findings`. Review/approval/report inline mutations may still need clean manual pass.

**Key:** ☑ = verified via code inspection / build. ✅ = verified in browser. ⬜ = pending manual verification.

---

## Pre-flight

| #   | Check                         | Expected                          | Code | Browser |
| --- | ----------------------------- | --------------------------------- | ---- | ------- |
| 1   | Log in with valid credentials | Redirect to dashboard             | ☑    | ✅      |
| 2   | Navigate to `/local-content`  | Dashboard loads with project list | ☑    | ✅      |

## Dashboard & Navigation

| #   | Check                         | Expected                    | Code | Browser |
| --- | ----------------------------- | --------------------------- | ---- | ------- |
| 3   | Dashboard shows project count | KPI cards visible           | ☑    | ✅      |
| 4   | Click project card            | Navigates to project detail | ☑    | ✅      |
| 5   | Project detail shows score    | Score cards visible         | ☑    | ✅      |
| 6   | All 9 workflow cards link     | No disabled/قريباً cards    | ☑    | ✅      |

## Supplier Workflow

| #   | Check                | Expected                       | Code | Browser |
| --- | -------------------- | ------------------------------ | ---- | ------- |
| 7   | Click الموردين       | Supplier list page loads       | ☑    | ✅      |
| 8   | Add new supplier     | Form submits, supplier appears | ☑    | ⬜      |
| 9   | Locality badge shows | محلي/غير محلي/مشترك display    | ☑    | ✅      |

## Spend Workflow

| #   | Check                         | Expected                       | Code | Browser |
| --- | ----------------------------- | ------------------------------ | ---- | ------- |
| 10  | Click الإنفاق                 | Spend list page loads          | ☑    | ✅      |
| 11  | Add spend record              | Form submits, record appears   | ☑    | ⬜      |
| 12  | CSV import: paste valid CSV   | Records created, success count | ☑    | ⬜      |
| 13  | CSV import: paste invalid CSV | Error shown with details       | ☑    | ⬜      |

## Evidence Workflow

| #   | Check                 | Expected                        | Code | Browser |
| --- | --------------------- | ------------------------------- | ---- | ------- |
| 14  | Click الأدلة          | Evidence list page loads        | ☑    | ✅      |
| 15  | Add evidence metadata | Form submits, evidence appears  | ☑    | ⬜      |
| 16  | Evidence type badge   | Certificate/contract/etc labels | ☑    | ✅      |
| 17  | Evidence status badge | Uploaded/linked/reviewed labels | ☑    | ✅      |

## Classification

| #   | Check                       | Expected                           | Code | Browser |
| --- | --------------------------- | ---------------------------------- | ---- | ------- |
| 18  | Click التصنيف               | Classification page loads          | ☑    | ✅      |
| 19  | Classification data visible | Spend per supplier with locality % | ☑    | ✅      |
| 20  | Rule-based label present    | "تصنيف قاعدي" text visible         | ☑    | ⬜      |

## Findings

| #   | Check           | Expected                      | Code | Browser |
| --- | --------------- | ----------------------------- | ---- | ------- |
| 21  | Click النتائج   | Findings page loads           | ☑    | ✅      |
| 22  | Add new finding | Form submits, finding appears | ☑    | ✅      |
| 23  | Severity badge  | Color-coded badge visible     | ☑    | ✅      |

## Review

| #   | Check                          | Expected                 | Code | Browser |
| --- | ------------------------------ | ------------------------ | ---- | ------- |
| 24  | Click المراجعة                 | Review page loads        | ☑    | ✅      |
| 25  | Submit review (if no existing) | Form submits             | ☑    | ⬜      |
| 26  | Review history visible         | Review records show      | ☑    | ✅      |
| 27  | Governance notice visible      | "خطوة بشرية حوكمية" text | ☑    | ✅      |

## Approval

| #   | Check                         | Expected                  | Code | Browser |
| --- | ----------------------------- | ------------------------- | ---- | ------- |
| 28  | Click الاعتماد                | Approval page loads       | ☑    | ✅      |
| 29  | Without review: blocked       | Yellow warning card shown | ☑    | ⬜      |
| 30  | After review: submit approval | Approval form submits     | ☑    | ✅      |
| 31  | Decision badge visible        | معتمد/مرفوض display       | ☑    | ✅      |
| 32  | Non-certification notice      | "ليس شهادة امتثال" text   | ☑    | ✅      |

## Reports

| #   | Check                                      | Expected                               | Code | Browser |
| --- | ------------------------------------------ | -------------------------------------- | ---- | ------- |
| 33  | Click التقارير                             | Reports page loads                     | ☑    | ✅      |
| 34  | Generate report                            | Report record created, appears in list | ☑    | ⬜      |
| 35  | Download report (if file export available) | File downloads                         | ☑    | ⬜      |
| 36  | Disclaimer present                         | Disclaimer text visible                | ☑    | ✅      |

## Audit Trail

| #   | Check                   | Expected                     | Code | Browser |
| --- | ----------------------- | ---------------------------- | ---- | ------- |
| 37  | Click سجل التدقيق       | Audit trail page loads       | ☑    | ✅      |
| 38  | Events listed           | Arabic action labels visible | ☑    | ✅      |
| 39  | Actor/timestamp present | User name and date shown     | ☑    | ✅      |

## Forbidden Claims

| #   | Check                                   | Expected      | Code | Browser |
| --- | --------------------------------------- | ------------- | ---- | ------- |
| 40  | No page claims AI classification        | All pages     | ☑    | —       |
| 41  | No page claims regulatory certification | All pages     | ☑    | —       |
| 42  | No page claims production-readiness     | All pages     | ☑    | —       |
| 43  | Reports include disclaimer              | Reports page  | ☑    | —       |
| 44  | Approval has non-certification notice   | Approval page | ☑    | —       |
| 45  | No private/on-prem claims               | All pages     | ☑    | —       |

---

## Execution Records

### Mutation Feedback Loop Verification (2026-05-23)

- **Method:** Code fix + focused browser smoke on `next start -p 3001`
- **Fix:** `revalidatePath` after write mutations + client `ActionResult` + `router.refresh()`
- **Verified mutations:** project create, supplier, spend, CSV valid/invalid, evidence metadata, file upload
- **Finding create:** **PASS** on `/local-content/projects/lc-project-demo-001/findings` (item 22 / checklist item 8 in pilot flow)
- **CLI:** `prisma generate`, `tsc`, `lint`, `build`, local-content tests (30, 4 suites) — all PASS
- **Still pending clean manual pass:** review, approval, report generate/download inline server forms

### Browser Smoke (2026-05-22) — Automated Playwright

- **Method:** Playwright browser automation via Playwright MCP
- **Browser-verified:** 32/45 PASS (navigation, rendering, data visibility, badges, claims)
- **Superseded for mutation status by:** 2026-05-23 mutation feedback loop verification (see above)
- **Notes:** Login confirmed working. All 12 workspace routes render with real seed data. Audit trail shows 6 events with Arabic labels. Approval shows "ليس شهادة امتثال" non-certification notice. No forbidden claims found in browser.
- **Defects found:** None blocking. Binary PDF/XLSX remains accepted P2 limitation.

### L5 Completion Patch (2026-05-21)

- **Method:** Code inspection + full CLI validation
- **Code inspection:** 45/45 PASS
- **CLI validation:** tsc, lint, build, test, seed all PASS
- **New in this patch:** Evidence file upload UI wired, project creation form added
- **Browser:** 25/45 browser-mutation items NOT TESTED (requires human browser)

### Prior Run (2026-05-21 initial)

- **Method:** Code inspection only
- **Note:** Previous report incorrectly stated "45/45 PASS" without distinguishing code from browser. This has been corrected to separate code-inspection status from browser-required items.
