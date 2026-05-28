# AuditOS Pilot Execution Index

**Status:** Single operational entry point for first 3–5 controlled pilots  
**Purpose:** Stop scattering pilot execution across disconnected docs  
**Last updated:** 2026-05-28 (Wave 10)

---

## Start Here

| If you need to…                        | Open                                                                                                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Run daily/weekly pilot operations      | [`auditos-pilot-operator-execution-guide.md`](auditos-pilot-operator-execution-guide.md)                                                                            |
| Track accounts (spreadsheet)           | [`auditos-pilot-account-tracker-template.csv`](auditos-pilot-account-tracker-template.csv) + [`auditos-pilot-account-tracker.md`](auditos-pilot-account-tracker.md) |
| Monitor `/contact` form submissions    | [`auditos-pilot-intake-monitoring.md`](auditos-pilot-intake-monitoring.md)                                                                                          |
| Production intake go-live              | [`auditos-pilot-intake-monitoring.md`](auditos-pilot-intake-monitoring.md) §14                                                                                      |
| Manual intake when webhook unset/fails | [`auditos-pilot-manual-intake-fallback.md`](auditos-pilot-manual-intake-fallback.md)                                                                                |
| Run weekly founder review              | [`auditos-pilot-command-center.md`](auditos-pilot-command-center.md)                                                                                                |
| Prepare or run customer meetings       | [`auditos-pilot-meeting-workflow.md`](auditos-pilot-meeting-workflow.md)                                                                                            |
| Capture proof before go/no-go          | [`auditos-pilot-proof-capture.md`](auditos-pilot-proof-capture.md)                                                                                                  |
| Review Eid build wave history          | [`../reports/eid-continuous-build-index-2026-05-28.md`](../reports/eid-continuous-build-index-2026-05-28.md)                                                        |

**Trust principle:** AI assists. Humans decide. Evidence governs.

---

## Execution Flow (One Page)

```
/contact or email
  → Intake monitoring (webhook or manual fallback)
  → Triage ≤ 3 business days
  → CSV tracker row updated
  → Meeting (intro / demo)
  → Objection log + follow-up ≤ 48h
  → Proof capture (2+ categories)
  → Weekly command center + founder review
  → Pilot review / go-no-go
```

SLAs and checklists: operator execution guide §2–§7.

---

## Core Operator Documents (Phase 3)

| Document                                                                                   | Role                                                     |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| [`auditos-pilot-command-center.md`](auditos-pilot-command-center.md)                       | Weekly command sequence, decision gates, risk monitoring |
| [`auditos-pilot-account-tracker.md`](auditos-pilot-account-tracker.md)                     | Field definitions, stage rules, form mapping, SLAs       |
| [`auditos-pilot-account-tracker-template.csv`](auditos-pilot-account-tracker-template.csv) | Lightweight CSV tracker (no CRM)                         |
| [`auditos-pilot-meeting-workflow.md`](auditos-pilot-meeting-workflow.md)                   | Pre-meeting, demo, objections, follow-up                 |
| [`auditos-pilot-proof-capture.md`](auditos-pilot-proof-capture.md)                         | Valid proof, quotes, case study readiness                |
| [`auditos-pilot-operator-execution-guide.md`](auditos-pilot-operator-execution-guide.md)   | Daily checklist, intake triage, escalation               |
| [`auditos-pilot-intake-monitoring.md`](auditos-pilot-intake-monitoring.md)                 | Webhook, dev log, WARNING log, production checklist      |
| [`auditos-pilot-manual-intake-fallback.md`](auditos-pilot-manual-intake-fallback.md)       | Manual SOP when persistence unavailable                  |

---

## Pilot Control Pack (`docs/product/pilot-control-pack/auditos/`)

| #   | File                                       | Use when                    |
| --- | ------------------------------------------ | --------------------------- |
| 01  | `01-pilot-operator-checklist.md`           | Before each session         |
| 02  | `02-pilot-environment-checklist.md`        | Environment prep            |
| 03  | `03-pilot-rollback-procedure.md`           | State error / demo recovery |
| 04  | `04-incident-escalation-template.md`       | Session incident            |
| 05  | `05-pilot-evidence-capture-template.md`    | During/after session        |
| 06  | `06-pilot-session-runbook.md`              | Live session execution      |
| 07  | `07-pilot-post-session-review-template.md` | Post-session review         |
| 08  | `08-controlled-pilot-constraints.md`       | Customer briefing on limits |
| 09  | `09-pilot-candidate-list.md`               | Candidate qualification     |
| 10  | `10-session-management-playbook.md`        | Full session lifecycle      |
| 11  | `11-evidence-to-proof-pipeline.md`         | Evidence → market proof     |
| 12  | `12-scope-creep-prevention-policy.md`      | Scope boundary enforcement  |

---

## Sales & Live Pilot Management

| Area                       | Path                                                                           |
| -------------------------- | ------------------------------------------------------------------------------ |
| CRM qualification fields   | `docs/product/auditos-sales-ops/crm-qualification-fields.md`                   |
| Pilot scoring sheet        | `docs/product/auditos-sales-ops/pilot-scoring-sheet.md`                        |
| Deal stages                | `docs/product/auditos-sales-ops/deal-stage-definitions.md`                     |
| Next step checklist        | `docs/product/auditos-sales-ops/next-step-checklist.md`                        |
| Follow-up templates        | `docs/product/auditos-outbound-kit/follow-up-templates.md`                     |
| Pilot master tracker       | `docs/product/auditos-live-pilot-management/pilot-master-tracker.md`           |
| Pilot evidence checklist   | `docs/product/auditos-live-pilot-management/pilot-evidence-checklist.md`       |
| Weekly pilot status report | `docs/product/auditos-live-pilot-management/weekly-pilot-status-report.md`     |
| Demo → pilot handoff       | `docs/product/auditos-live-pilot-management/demo-to-pilot-handoff-template.md` |

---

## First Customer Loop

| Document                     | Path                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------- |
| First 5 customers rules      | `docs/product/auditos-first-customer-loop/first-5-customers-operating-rules.md` |
| Customer journey timeline    | `docs/product/auditos-first-customer-loop/customer-journey-timeline.md`         |
| Weekly founder pilot review  | `docs/product/auditos-first-customer-loop/weekly-founder-pilot-review.md`       |
| Founder learning log         | `docs/product/auditos-first-customer-loop/founder-learning-log.md`              |
| Pilot → paid conversion memo | `docs/product/auditos-first-customer-loop/pilot-to-paid-conversion-memo.md`     |

---

## Customer-Facing Pages (Reference in Conversations)

| Page                  | Path                 | Notes                                 |
| --------------------- | -------------------- | ------------------------------------- |
| Pilot intake          | `/contact`           | Form → `POST /api/pilot-review`       |
| Engagement models     | `/engagement-models` | Diagnostic vs pilot vs deployment     |
| Pilot proof framework | `/pilot-proof`       | Success criteria and go/no-go outputs |
| Proof library         | `/proof-library`     | Demo-data examples only               |

---

## Intake Technical Reference

| Item                  | Location                                                                   |
| --------------------- | -------------------------------------------------------------------------- |
| API route             | `src/app/api/pilot-review/route.ts`                                        |
| Public form           | `src/app/(marketing)/contact/contact-form.tsx`                             |
| Webhook env var       | `PILOT_REVIEW_WEBHOOK_URL` (optional)                                      |
| Dev log               | `[PilotReview]` console line — **development only**, summary fields        |
| Webhook delivery      | `webhook=delivered \| status=...` or `webhook=failed/error` in server logs |
| Webhook unset WARNING | Server log — org + timestamp (not full persistence)                        |

Monitoring runbook: [`auditos-pilot-intake-monitoring.md`](auditos-pilot-intake-monitoring.md).

---

## Boundaries (Wave 8)

| Not in scope              | Reason              |
| ------------------------- | ------------------- |
| Database tables for leads | Explicitly excluded |
| CRM integration           | Explicitly excluded |
| Auth / middleware changes | Explicitly excluded |
| Workspace route changes   | Explicitly excluded |

Tracker remains a **CSV/spreadsheet + docs** surface until a future wave approves persistence.

---

## Related Reports

- Eid Continuous Build index: `docs/reports/eid-continuous-build-index-2026-05-28.md`
- Wave 7 report: `docs/reports/eid-continuous-build-wave-7-2026-05-28.md`
