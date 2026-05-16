# AQLIYA Pilot Execution Pack Report

**Date:** May 12, 2026  
**Version:** 1.0  
**Sprint Type:** Documentation — Pilot Execution Preparation  
**Status:** Complete

---

## 1. Executive Summary

The AQLIYA Pilot Execution Pack has been created — a complete set of 10 operational documents plus a folder README, designed to prepare the team to run the first real customer pilot.

This is a **documentation-only sprint**. No backend files, routes, Prisma schema, server actions, audit workflows, or business logic were modified.

The execution pack covers the full pilot lifecycle: from Trial Balance intake, through customer onboarding, demo walkthrough, reviewer QA, financial output QA, traceability QA, feedback capture, issue escalation, success evaluation, and post-pilot review.

The conclusion: **AQLIYA is operationally ready to receive a real Trial Balance file and run the first controlled customer pilot.**

---

## 2. Scope Confirmation

| Scope Item                      | Status | Notes                                             |
| ------------------------------- | ------ | ------------------------------------------------- |
| Documentation-only sprint       | ✅     | No code changes                                   |
| No Prisma/schema changes        | ✅     | Confirmed — no schema files touched               |
| No workflow changes             | ✅     | Confirmed — no workflow logic modified            |
| No route changes                | ✅     | Confirmed — no routes created or modified         |
| No backend changes              | ✅     | Confirmed — no server actions or services touched |
| No product expansion            | ✅     | Confirmed — no features added                     |
| No unsupported readiness claims | ✅     | All docs use "pilot" language, not "production"   |

---

## 3. Files Created

| #   | File                                   | Purpose                                      | Approx. Size |
| --- | -------------------------------------- | -------------------------------------------- | ------------ |
| —   | `execution-pack/README.md`             | Folder index, sequence, completion criteria  | ~1,500 words |
| 01  | `01-trial-balance-intake-checklist.md` | Validate TB file before upload               | ~1,200 words |
| 02  | `02-customer-onboarding-checklist.md`  | Onboard customer into pilot                  | ~1,400 words |
| 03  | `03-demo-walkthrough-script.md`        | Script for live demo with customer           | ~2,800 words |
| 04  | `04-reviewer-qa-checklist.md`          | QA checklist for reviewer evaluating outputs | ~1,800 words |
| 05  | `05-financial-output-qa-checklist.md`  | QA for financial statement accuracy          | ~1,500 words |
| 06  | `06-traceability-qa-checklist.md`      | QA for end-to-end traceability               | ~1,600 words |
| 07  | `07-pilot-feedback-form.md`            | Customer feedback form (1-5 scale)           | ~1,200 words |
| 08  | `08-issue-escalation-workflow.md`      | Issue categorization and escalation process  | ~1,000 words |
| 09  | `09-pilot-success-criteria.md`         | Go/Conditional/No-Go evaluation criteria     | ~1,800 words |
| 10  | `10-post-pilot-review-memo.md`         | Post-pilot internal review memo template     | ~1,200 words |

**Total:** ~17,000 words across 11 documents.

---

## 4. Trial Balance Intake Readiness

The TB intake checklist (`01-trial-balance-intake-checklist.md`) covers:

- **File format validation:** Excel/CSV, no corruption, no password protection
- **Required columns:** Account Code, Account Name, Debit, Credit, Currency
- **Optional columns:** Opening Balance, Prior Year Balance, Account Type
- **Data validation:** Debits = Credits, all numeric, no duplicates, no merged cells
- **Reporting period:** Period specified, accounting basis known
- **Company details:** Entity name, type, jurisdiction
- **Chart of accounts:** Structure consistency, category identifiability
- **Rejection criteria:** 7 conditions that trigger file rejection

**Status:** Ready to receive TB file.

---

## 5. Customer Onboarding Readiness

The onboarding checklist (`02-customer-onboarding-checklist.md`) covers:

- Customer information collection (entity, contact, jurisdiction)
- Pilot team identification (sponsor, finance contact, reviewer)
- Pilot scope definition (engagement type, accounting standard, period, currency)
- Demo scope (10 workflow sections, each optional)
- Pilot timeline with milestones and target dates
- Customer expectations confirmation (pilot understanding, draft outputs, AI assistive role)
- Limitation disclaimer (customer must acknowledge)
- Customer approval (signed off)

**Status:** Ready to onboard customer.

---

## 6. Demo Walkthrough Readiness

The demo script (`03-demo-walkthrough-script.md`) covers:

- Opening script (3 minutes) — AQLIYA positioning, trust principle
- Section 1: AQLIYA positioning (2 minutes)
- Section 2: AuditOS purpose (3 minutes)
- Section 3: Trial Balance intake (5 minutes)
- Section 4: Account mapping (5 minutes)
- Section 5: Financial statements (5 minutes)
- Section 6: Notes generation (3 minutes)
- Section 7: Evidence requirements (3 minutes)
- Section 8: Findings & review (5 minutes)
- Section 9: Traceability (5 minutes)
- Section 10: Approval (2 minutes)
- Section 11: Human review disclaimer (2 minutes)
- Section 12: Closing script (3 minutes)
- What NOT to say — table of forbidden phrases and alternatives
- Post-demo checklist

**Tone:** Executive, precise, trust-driven, no hype.

**Status:** Ready for demo walkthrough.

---

## 7. Reviewer QA Readiness

The reviewer QA checklist (`04-reviewer-qa-checklist.md`) covers:

- 12 QA sections with 60+ individual checks
- Each check has: expected result, pass/fail, severity (Critical/Medium), reviewer note
- Sections: Engagement setup, TB upload, account mapping, classification, financial statements, notes, evidence, findings, review status, approval readiness, audit disclaimer, overall review
- Critical items require sign-off before presenting to customer

**Status:** Ready for reviewer QA.

---

## 8. Financial Output QA Readiness

The financial output QA checklist (`05-financial-output-qa-checklist.md`) covers:

- 12 QA sections covering all financial outputs
- Statement of Financial Position (8 checks)
- Statement of Profit or Loss (7 checks)
- Statement of Changes in Equity (4 checks)
- Account mapping accuracy (6 checks)
- Reclassifications (3 checks)
- Totals and subtotals (4 checks)
- Debit/credit consistency (4 checks)
- Currency display (4 checks)
- Reporting period (3 checks)
- Draft status & disclaimer (3 checks)
- Cross-statement consistency (3 checks)
- Reviewer sign-off

**Status:** Ready for financial output QA.

---

## 9. Traceability QA Readiness

The traceability QA checklist (`06-traceability-qa-checklist.md`) covers:

- 11 QA sections tracing the full chain
- TB Line → Mapped Account (4 checks)
- Mapped Account → Financial Statement (4 checks)
- Financial Statement → Note (4 checks)
- Note → Evidence Requirement (4 checks)
- Evidence → Finding (4 checks)
- Finding → Approval (4 checks)
- AI Suggestion → Human Decision (5 checks)
- Source visibility (4 checks)
- Audit trail clarity (5 checks)
- Full trace walkthrough (8 steps — end to end)
- Traceability summary (5 items)

**Each check includes:** Traceability path, expected evidence, pass/fail, reviewer comment.

**Status:** Ready for traceability QA.

---

## 10. Feedback Capture Readiness

The feedback form (`07-pilot-feedback-form.md`) covers:

- 9 sections with structured 1-5 rating scale
- Overall experience (4 questions)
- Trust & confidence (4 questions)
- Workflow usefulness (8 workflow steps rated)
- Output quality (4 questions)
- AI perception (4 questions)
- Missing features (open response)
- Blockers & issues (10 categories)
- Future intent (4 questions with Yes/Maybe/No)
- Final thoughts (open response)

**Status:** Ready to capture customer feedback.

---

## 11. Issue Escalation Readiness

The issue escalation workflow (`08-issue-escalation-workflow.md`) covers:

- 4 severity levels: Critical (< 4h), High (< 24h), Medium (< 48h), Low (< 1 week)
- 11 issue categories: Data quality, mapping, statements, notes, evidence, traceability, UI/UX, performance, access/security, customer confusion, unsupported expectation
- Escalation path diagram (Pilot Lead → Technical Lead → AQLIYA Lead)
- Issue tracking template
- Response time targets per severity
- Resolution criteria
- Customer communication templates (notification + resolution)
- Escalation contacts (TBD — to be filled before pilot)

**Status:** Ready for issue escalation.

---

## 12. Pilot Success Criteria

The success criteria document (`09-pilot-success-criteria.md`) defines:

- **Go / Conditional Go / No-Go** framework
- 8 success sections with weighted criteria
- Technical success (7 criteria, 4 critical)
- Workflow success (6 criteria, 3 critical)
- Financial output success (6 criteria, 5 critical)
- Reviewer trust success (4 criteria, 3 critical)
- Customer value success (5 criteria, 4 critical)
- Demo success (4 criteria, 2 critical)
- Traceability success (3 criteria, all critical)
- Conversion/readiness signal (6 scenarios mapped to Go/Conditional/No-Go)
- Overall decision matrix with sign-off

**Status:** Ready to evaluate pilot success.

---

## 13. Post-Pilot Review Process

The post-pilot review memo (`10-post-pilot-review-memo.md`) covers:

- 12 sections for the internal review meeting
- Customer summary, pilot scope, data received, outputs generated
- Issues encountered (logged from escalation workflow)
- Customer feedback summary with key quotes
- Reviewer assessment (mapping, statements, notes, traceability, AI quality)
- Trust assessment (4 questions)
- Product gaps identified
- Commercial signal (5 indicators)
- Go/No-Go decision with rationale
- Next actions with owners and deadlines

**Status:** Ready for post-pilot review.

---

## 14. Brand & Trust Guardrails

All documents were reviewed against AQLIYA brand and trust principles:

| Document      | Trust Issue                         | Action                            |
| ------------- | ----------------------------------- | --------------------------------- |
| All documents | No "fully automated audit" claims   | ✅ Not present                    |
| All documents | No "replaces auditor" claims        | ✅ Not present                    |
| All documents | Clear draft status on all outputs   | ✅ Emphasized in QA               |
| All documents | Human review emphasis               | ✅ Built into every process       |
| All documents | Evidence governance                 | ✅ Traceability is a core section |
| All documents | AI as assistant, not decision-maker | ✅ Explicit in demo script        |
| Feedback form | AI perception section               | ✅ 4 dedicated questions          |

**Trust principle maintained:** _"AI assists. Humans decide. Evidence governs."_

---

## 15. Validation Results

| Command                 | Result      | Notes                                                    |
| ----------------------- | ----------- | -------------------------------------------------------- |
| `npx tsc --noEmit`      | ✅ Pass     | No TypeScript errors                                     |
| `npm run audit:health`  | ✅ 7/7 Pass | Database connected, 2 engagements, 31 events, 0 blockers |
| `npm run backup:verify` | ✅ Pass     | All core tables have data                                |

No source files were modified — this was a documentation-only sprint.

---

## 16. Remaining Risks

| Risk                                                    | Impact                         | Mitigation                                                               |
| ------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------ |
| Pilot team contacts not assigned (TBD in docs)          | Escalation workflow incomplete | Fill in before pilot starts                                              |
| Customer may expect production-grade features           | Misaligned expectations        | Limitation disclaimer in onboarding; clear pilot language throughout     |
| TB file may fail intake (format, balance, missing data) | Delayed start                  | Intake checklist allows early rejection with clear criteria              |
| Demo script assumes all workflow steps work end-to-end  | Demo may break at any point    | Script includes "what not to say" and suggests technical lead on standby |
| Feedback form may feel too long for some customers      | Incomplete feedback            | Administer as interview, not written form                                |

---

## 17. Final Recommendation

**Ready to receive real Trial Balance file and run the first controlled customer pilot.**

All 10 execution pack documents are complete. Validation commands pass. No backend changes were required. The team now has structured checklists, scripts, and forms covering the entire pilot lifecycle — from TB intake through post-pilot review.

---

## 18. Next Step

**Awaiting the real Trial Balance file from the customer to begin Pilot Session 1.**

When the file arrives:

1. Run `01-trial-balance-intake-checklist.md` to validate the file
2. Create the engagement in AuditOS and upload the TB
3. Run `02-customer-onboarding-checklist.md` to onboard the customer
4. Schedule and run the demo walkthrough using `03-demo-walkthrough-script.md`
5. Run QA checklists (04, 05, 06) as outputs are generated
6. Capture feedback using `07-pilot-feedback-form.md`
7. Escalate any issues using `08-issue-escalation-workflow.md`
8. Evaluate success using `09-pilot-success-criteria.md`
9. Conduct post-pilot review using `10-post-pilot-review-memo.md`

---

_AQLIYA — منصة ذكاء مؤسسي خاص ومحكوم_
