# AuditOS Pilot Account Tracker — Phase 3

**Status:** Account tracking structure for first 3–5 controlled pilot accounts  
**Authority source:** `docs/product/auditos-sales-ops/crm-qualification-fields.md`, `docs/product/auditos-live-pilot-management/light-crm-import-format.md`  
**Spreadsheet template:** `docs/product/auditos-pilot-account-tracker-template.csv`  
**Execution index:** `docs/product/auditos-pilot-execution-index.md`  
**Last updated:** 2026-05-28

---

## 1. Account Fields

| Field               | Required | Description                                             |
| ------------------- | -------- | ------------------------------------------------------- |
| Account Name        | Yes      | Customer organization name                              |
| Segment             | Yes      | Audit firm / Accounting office / CFO team / SME finance |
| Contact Name        | Yes      | Primary contact person                                  |
| Contact Role        | Yes      | Decision maker / Sponsor / User / Evaluator             |
| Contact Email       | Yes      | Primary email                                           |
| Contact Phone       | Optional | Phone number                                            |
| Internal Owner      | Yes      | AQLIYA team member responsible                          |
| Relationship Source | Yes      | Inbound / Outbound / Referral / Partner / Event         |
| Current Stage       | Yes      | See stage definitions below                             |
| Qualification Score | Yes      | 1–5 based on scoring sheet                              |
| Pilot Fit           | Yes      | High / Medium / Low                                     |
| Main Pain           | Yes      | Core problem they want solved                           |
| Primary Use Case    | Yes      | What they would use AuditOS for                         |
| Current Workflow    | Yes      | How they do it today                                    |
| Current Tools       | Optional | What they use today                                     |
| Buying Trigger      | Optional | What prompted them to explore                           |
| Urgency Level       | Optional | High / Medium / Low                                     |
| Trust Concern       | Optional | Any concern about AI, data, privacy                     |
| Decision Maker      | Yes      | Person who can say yes                                  |
| Sponsor             | Yes      | Person championing internally                           |
| Last Contact Date   | Yes      | Date of last meaningful interaction                     |
| Next Meeting Date   | Optional | Scheduled meeting date                                  |
| Next Action         | Yes      | What happens next                                       |
| Next Action Owner   | Yes      | Who is responsible                                      |
| Blocker             | Optional | What is preventing progress                             |
| Evidence Need       | Optional | What proof they need to see                             |
| Objection Summary   | Optional | Recurring objections                                    |
| Follow-Up Date      | Yes      | When to follow up next                                  |
| Risk Level          | Yes      | Low / Medium / High                                     |
| Notes               | Optional | Free-text notes                                         |

---

## 2. Stage Definitions

| Stage             | Definition                                    | Exit Criteria                                |
| ----------------- | --------------------------------------------- | -------------------------------------------- |
| Identified        | Account named, fits ICP on paper              | Contact information found                    |
| Researched        | Company understood, pain hypothesis formed    | Ready for outreach                           |
| Contacted         | First outreach sent                           | Response received or 3 attempts made         |
| Meeting Booked    | Meeting scheduled with relevant audience      | Agenda prepared, audience confirmed          |
| Demo Done         | Live demo delivered with specific use case    | Interest confirmed, pilot potential assessed |
| Pilot Proposed    | Scope, duration, success criteria shared      | Customer actively considering                |
| Pilot Active      | Customer using AuditOS with real/sample data  | Evidence collection started                  |
| Pilot Review      | Evidence evaluated, success criteria assessed | Go/No-Go decision ready                      |
| Paid Conversion   | Commercial agreement signed                   | Invoice sent                                 |
| Closed / Deferred | Pilot ended without conversion                | Learning captured, no further active pursuit |

---

## 3. Stage Transition Rules

### Identified → Researched

Must have: company name, segment hypothesis, pain hypothesis.

### Researched → Contacted

Must have: contact name, contact role, outreach message prepared.
Do not contact without: knowing what problem you think they have.

### Contacted → Meeting Booked

Must have: response from contact, agreed meeting time.
If no response after 3 attempts: move to nurture or close.

### Meeting Booked → Demo Done

Must have: meeting held, use case discussed, interest level assessed.
Do not claim demo done if: no use case discussion, no stakeholder present.

### Demo Done → Pilot Proposed

Must have: interest confirmed, use case scoped, pilot fit assessed.
Do not propose pilot if: pain is unclear, sponsor is weak, use case is vague.

### Pilot Proposed → Pilot Active

Must have: scope agreed, success criteria defined, duration clear, owner assigned.
Do not start pilot without: customer confirmation, internal owner, clear start date.

### Pilot Active → Pilot Review

Must have: evidence collected (2+ categories), success criteria evaluated, customer feedback captured.

### Pilot Review → Paid Conversion

Must have: value demonstrated, buyer engaged, commercial terms discussed.

### Pilot Review → Closed/Deferred

Must have: learning documented, relationship preserved, follow-up date set if applicable.

---

## 4. Qualification Scoring

Use the pilot scoring sheet (`docs/product/auditos-sales-ops/pilot-scoring-sheet.md`).

Score 1–5 on each dimension:

| Dimension                | Weight |
| ------------------------ | ------ |
| Problem Urgency          | 1x     |
| Workflow Fit             | 2x     |
| Buyer Commitment         | 2x     |
| Team Access              | 1x     |
| Success Criteria Clarity | 1x     |
| Traceability Need        | 1x     |
| Review Readiness Need    | 1x     |
| Expansion Potential      | 1x     |

### Scoring Thresholds

| Score | Classification | Action                       |
| ----- | -------------- | ---------------------------- |
| 30–40 | Strong pilot   | Proceed, prioritize          |
| 20–29 | Medium pilot   | Proceed with tightened scope |
| 10–19 | Weak pilot     | Re-qualify or pause          |

---

## 5. First 5 Account Selection Criteria

### Recommended Selection Criteria

1. **Clear pain:** Account can articulate a specific workflow problem
2. **Buyer access:** Decision maker is reachable and engaged
3. **Use case fit:** AuditOS workflow maps to their actual process
4. **Data availability:** They can provide sample or real trial balance data
5. **Timeline alignment:** They can commit to a 4–6 week pilot window
6. **Reference potential:** They could become a reference if successful
7. **Diversity:** Mix of segments (audit firm, accounting office, CFO team)

### Selection Priority

| Priority | Segment                           | Why                                          |
| -------- | --------------------------------- | -------------------------------------------- |
| 1        | Small audit firm (3–10 staff)     | Fast decisions, clear pain, manageable scope |
| 2        | Independent accounting office     | Daily workflow pain, high traceability need  |
| 3        | CFO team in SME                   | Less complex, faster cycle                   |
| 4        | Mid-size audit firm (10–30 staff) | Higher value, but longer cycle               |
| 5        | Enterprise audit department       | Longest cycle, highest qualification bar     |

---

## 6. Tracker Template (Tabular)

Use the CSV template for day-to-day tracking: `docs/product/auditos-pilot-account-tracker-template.csv` (all §1 fields + five placeholder rows).

| Account Name  | Segment | Owner | Stage      | Score | Pilot Fit | Next Action | Next Date | Risk | Blocker |
| ------------- | ------- | ----- | ---------- | ----- | --------- | ----------- | --------- | ---- | ------- |
| [Placeholder] | —       | —     | Identified | —     | —         | —           | —         | —    | —       |
| [Placeholder] | —       | —     | Identified | —     | —         | —           | —         | —    | —       |
| [Placeholder] | —       | —     | Identified | —     | —         | —           | —         | —    | —       |
| [Placeholder] | —       | —     | Identified | —     | —         | —           | —         | —    | —       |
| [Placeholder] | —       | —     | Identified | —     | —         | —           | —         | —    | —       |

---

## 7. Weekly Update Ritual

Every **Monday** (command center status update):

1. Refresh stage, health, risk, blocker, next action, follow-up date for each row
2. Confirm follow-up dates are not overdue
3. Update qualification score if new information from last week
4. Flag accounts with no contact in 7+ days

Every **Friday** (founder review prep):

1. Summarize strongest evidence signal per active pilot
2. Attach objection register rows for that account
3. State explicit next decision needed (proceed / pause / escalate)

---

## 8. Contact Form → Tracker Field Mapping

Source: `/contact` form → `POST /api/pilot-review`

| Form field (API)  | Tracker field                    | Notes                                              |
| ----------------- | -------------------------------- | -------------------------------------------------- |
| `organization`    | Account Name                     | Required on intake                                 |
| `name`            | Contact Name                     |                                                    |
| `role`            | Contact Role                     | Map to Decision maker / Sponsor / User / Evaluator |
| `email`           | Contact Email                    |                                                    |
| `productInterest` | Primary Use Case                 | Also note product column if using spreadsheet      |
| `interest`        | Next Action                      | Pilot Review / Demo / Partnership / General        |
| `useCase`         | Main Pain + Primary Use Case     | Split if pain vs workflow differ                   |
| `dataType`        | Evidence Need                    | Data readiness hypothesis                          |
| `currentWorkflow` | Current Workflow / Current Tools | Optional on form                                   |
| `goal`            | Evidence Need / Notes            | Success criteria draft                             |
| —                 | Internal Owner                   | Assign on triage                                   |
| —                 | Relationship Source              | Set to Inbound                                     |
| —                 | Last Contact Date                | Date of triage reply                               |
| —                 | Follow-Up Date                   | Per cadence in §9                                  |
| —                 | Current Stage                    | Identified or Researched after triage              |

On triage completion, always set: **Next Action**, **Next Action Owner**, **Follow-Up Date**, **Risk Level** (initial estimate).

---

## 9. Follow-Up Cadence SLAs

| Trigger          | First action              | Deadline                | If no response             |
| ---------------- | ------------------------- | ----------------------- | -------------------------- |
| New inbound form | Triage + reply            | ≤ 3 business days       | —                          |
| After intro call | Demo invite or brief      | ≤ 48 hours              | Follow up at 1 week        |
| After demo       | Pilot proposal or summary | ≤ 48 hours              | Nudge at 5 days            |
| After objection  | Direct response           | ≤ 48 hours              | Focused session offer      |
| Silence 5+ days  | Gentle follow-up          | Immediate when detected | 2 attempts → pause 30 days |
| Pilot Active     | Weekly health note        | Every 7 days            | Escalate if Red            |

Templates: `docs/product/auditos-outbound-kit/follow-up-templates.md`  
Operator playbook: `docs/product/auditos-pilot-operator-execution-guide.md` §5.

---

## 10. Objection Log (Per Account)

Add rows below each account or in a shared objection sheet.

| Date | Objection (verbatim) | Category                                      | Meeting type         | Resolved (Y/P/N) | Fit risk (Y/N) | Notes |
| ---- | -------------------- | --------------------------------------------- | -------------------- | ---------------- | -------------- | ----- |
|      |                      | AI / Data / Scope / Commercial / Fit / Export | Intro / Demo / Pilot |                  |                |       |

**Category guide:**

- **AI** — trust, liability, replacement fear
- **Data** — privacy, residency, sensitivity
- **Scope** — time, team bandwidth, one engagement
- **Commercial** — pricing, commitment, ROI
- **Fit** — workflow mismatch, weak sponsor
- **Export** — PDF/Word, format expectations

Roll up to **Objection Summary** field when pattern repeats.

---

## 11. Tracker Discipline (Owner, Staleness, Escalation)

### Owner rules

| Rule           | Requirement                                                 |
| -------------- | ----------------------------------------------------------- |
| Single owner   | Every active row has exactly one **Internal Owner**         |
| Delegation     | **Next Action Owner** may differ; must be named             |
| No orphan rows | Placeholder rows must get owner before first real outreach  |
| Handoff        | On owner change, update both owner fields + Notes with date |

### Missing next action — escalate

If **Next Action** or **Next Action Owner** is empty on any row not in `Closed / Deferred`:

| Days empty       | Action                                           |
| ---------------- | ------------------------------------------------ |
| Same day         | Fix before end of business                       |
| 1 business day   | Pilot owner escalation note in command center    |
| 2+ business days | Founder review item — row is operationally stale |

### Stale lead rules

| Signal                       | Definition                                   | Action                                              |
| ---------------------------- | -------------------------------------------- | --------------------------------------------------- |
| **Follow-up overdue**        | Today > Follow-Up Date                       | Contact or update stage same day                    |
| **No contact 7+ days**       | Active stage, Last Contact Date > 7 days ago | Yellow health; schedule touch or pause              |
| **No contact 14+ days**      | Still active, no pause decision              | Red health OR move to Closed/Deferred with learning |
| **Silence after 3 attempts** | Contacted stage, no response                 | Nurture or Closed/Deferred per meeting workflow     |
| **Intake without CSV row**   | Form/email received, no tracker row          | Critical — add row same day (manual fallback SOP)   |

Record health in command center snapshot; CSV uses **Risk Level** + **Notes** for staleness context.

---

## 12. Weekly CSV Review Checklist (Monday, 15 min)

File: `docs/product/auditos-pilot-account-tracker-template.csv`

### Tracker hygiene

- [ ] All intakes from last 7 days have rows (cross-check webhook + email + logs)
- [ ] Every active row: Internal Owner, Next Action, Next Action Owner, Follow-Up Date filled
- [ ] No row missing first-response within SLA (see below)
- [ ] Overdue Follow-Up Dates cleared or escalated
- [ ] Stale leads (7+ / 14+ days) flagged in Notes or command center health
- [ ] Stage transitions match §3 rules (no skip without criteria)
- [ ] Referral/warm rows triaged within SLA
- [ ] Closed rows have learning note in Notes field
- [ ] Webhook failure rows tagged in Notes and followed up

### First-response SLA (from intake)

| Temperature       | First triage reply                    | CSV: Last Contact Date     |
| ----------------- | ------------------------------------- | -------------------------- |
| Warm / Referral   | ≤ 2 business days                     | Set on reply               |
| Neutral / Inbound | ≤ 3 business days                     | Set on reply               |
| Cold              | ≤ 3 business days or defer with Notes | Set on reply or defer date |

Intake row must exist **same business day** as webhook/email receipt.

Manual intake SOP: `docs/product/auditos-pilot-manual-intake-fallback.md` §6.

---

## 13. Related Documents

| Document                  | Path                                                                            |
| ------------------------- | ------------------------------------------------------------------------------- |
| **Pilot Execution Index** | `docs/product/auditos-pilot-execution-index.md`                                 |
| Manual Intake Fallback    | `docs/product/auditos-pilot-manual-intake-fallback.md`                          |
| Intake Monitoring         | `docs/product/auditos-pilot-intake-monitoring.md`                               |
| CSV Template              | `docs/product/auditos-pilot-account-tracker-template.csv`                       |
| Operator Execution Guide  | `docs/product/auditos-pilot-operator-execution-guide.md`                        |
| Pilot Command Center      | `docs/product/auditos-pilot-command-center.md`                                  |
| CRM Qualification Fields  | `docs/product/auditos-sales-ops/crm-qualification-fields.md`                    |
| Light CRM Import Format   | `docs/product/auditos-live-pilot-management/light-crm-import-format.md`         |
| Deal Stage Definitions    | `docs/product/auditos-sales-ops/deal-stage-definitions.md`                      |
| Pilot Scoring Sheet       | `docs/product/auditos-sales-ops/pilot-scoring-sheet.md`                         |
| Next Step Checklist       | `docs/product/auditos-sales-ops/next-step-checklist.md`                         |
| First 5 Customers Rules   | `docs/product/auditos-first-customer-loop/first-5-customers-operating-rules.md` |
