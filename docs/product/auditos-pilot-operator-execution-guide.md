# AuditOS Pilot Operator Execution Guide — Wave 7

**Status:** Active operator playbook for first 3–5 controlled pilots  
**Purpose:** Single daily/weekly execution path from inbound contact to proof capture and follow-up  
**Authority source:** `docs/product/auditos-pilot-command-center.md`, `docs/product/auditos-pilot-account-tracker.md`  
**Execution index:** `docs/product/auditos-pilot-execution-index.md`  
**Intake monitoring:** `docs/product/auditos-pilot-intake-monitoring.md`  
**Last updated:** 2026-05-28

---

## 1. Who This Is For

Use this guide if you are the **internal pilot owner** responsible for:

- Triage of `/contact` pilot review requests
- Account tracker updates
- Meeting preparation and follow-up
- Objection capture
- Proof collection before go/no-go

This is operator guidance only. It does not change product architecture, auth, or storage.

---

## 2. End-to-End Execution Flow

```
Inbound (/contact or direct email)
  → Triage (≤ 3 business days)
  → Tracker row created/updated
  → Intro or demo meeting
  → Post-meeting notes + objection log
  → Follow-up (≤ 48h after meeting)
  → Proof capture (ongoing, 2+ categories before review)
  → Weekly command center update
  → Pilot review / go-no-go
```

| Step               | Owner       | SLA                      | Document                               |
| ------------------ | ----------- | ------------------------ | -------------------------------------- |
| Intake triage      | Pilot owner | ≤ 3 business days        | Section 3 below                        |
| Tracker update     | Pilot owner | Same day as triage       | `auditos-pilot-account-tracker.md`     |
| Meeting prep       | Pilot owner | ≥ 24h before meeting     | `auditos-pilot-meeting-workflow.md` §1 |
| Post-meeting notes | Pilot owner | ≤ 1 hour after meeting   | `auditos-pilot-meeting-workflow.md` §6 |
| Follow-up sent     | Pilot owner | ≤ 48 hours after meeting | `auditos-pilot-meeting-workflow.md` §7 |
| Proof entry        | Pilot owner | Within 24h of signal     | `auditos-pilot-proof-capture.md`       |
| Weekly status      | Pilot owner | Monday + Friday review   | `auditos-pilot-command-center.md` §3   |

---

## 3. Contact Intake Triage (`/contact`)

Public intake arrives via `POST /api/pilot-review` (form at `/contact`) or direct email.

### Required fields from form

| Form field        | Tracker field                      | Triage question              |
| ----------------- | ---------------------------------- | ---------------------------- |
| `organization`    | Account Name                       | Real org? ICP fit?           |
| `name`            | Contact Name                       | Decision maker or user?      |
| `role`            | Contact Role                       | Sponsor vs evaluator?        |
| `email`           | Contact Email                      | Corporate domain preferred   |
| `productInterest` | Primary Use Case / product column  | AuditOS vs other product     |
| `interest`        | Next Action type                   | Pilot vs demo vs partnership |
| `useCase`         | Main Pain / Primary Use Case       | Specific enough to scope?    |
| `dataType`        | Evidence Need / data readiness     | Can they supply sample data? |
| `currentWorkflow` | Current Workflow / Current Tools   | Excel-only vs mixed?         |
| `goal`            | Evidence Need / success hypothesis | Measurable pilot goal?       |

### Triage decision (within 3 business days)

| Outcome                 | Action                                                 | Stage                                   |
| ----------------------- | ------------------------------------------------------ | --------------------------------------- |
| Strong fit              | Reply with diagnostic/pilot next step; book meeting    | Researched → Contacted → Meeting Booked |
| Unclear scope           | Reply with 2–3 clarifying questions; offer 15-min call | Identified → Researched                 |
| Wrong product           | Redirect to correct product page; note in tracker      | Closed / Deferred or nurture            |
| No fit                  | Graceful close; log learning                           | Closed / Deferred                       |
| Partnership / non-pilot | Route separately; do not force pilot track             | Outside pilot tracker                   |

### Reply principles

- Respond with a **specific next step**, not a generic acknowledgment.
- Restate boundaries: pilot is evaluation, not production deployment.
- Link customer-facing pages when helpful: `/engagement-models`, `/pilot-proof`, `/proof-library`.

---

## 4. Daily Operator Checklist (15 min)

- [ ] Check new `/contact` submissions and direct emails
- [ ] Update tracker: stage, health, next action, follow-up date
- [ ] Send any follow-ups due today (see cadence below)
- [ ] Log new objections in objection register
- [ ] Capture any new proof signals from yesterday's interactions
- [ ] Escalate red health or high risk to founder (see command center §5)

---

## 5. Follow-Up Cadence

| Situation                        | First follow-up                     | Second follow-up                 | Stop rule                                    |
| -------------------------------- | ----------------------------------- | -------------------------------- | -------------------------------------------- |
| After intro call (interest high) | ≤ 48h — demo invite                 | ≤ 1 week if no reply             | 3 attempts → nurture                         |
| After demo (interest high)       | ≤ 48h — pilot proposal              | ≤ 5 days — scope check           | 2 silence follow-ups → pause 30 days         |
| After objection raised           | ≤ 48h — direct response             | Offer focused session on concern | Unresolved fit issue → re-qualify            |
| After silence (5+ days)          | Gentle nudge referencing last topic | Offer scope/timeline adjustment  | No reply after 2 → pause, revisit in 30 days |
| After pilot start                | Weekly health check                 | Mid-pilot evidence review        | Missing evidence 2+ weeks → escalate         |

Templates: `docs/product/auditos-outbound-kit/follow-up-templates.md`

---

## 6. Objection Register (Weekly)

Maintain one row per objection per account. Review every Friday founder review.

| Date | Account | Objection | Category                               | Resolved? | Fit risk? | Response used | Add to common list? |
| ---- | ------- | --------- | -------------------------------------- | --------- | --------- | ------------- | ------------------- |
|      |         |           | AI / Data / Scope / Commercial / Other | Y / P / N | Y / N     |               | Y / N               |

**Categories:** AI trust, data/privacy, scope/timeline, commercial, workflow fit, export/format, competitor comparison.

**Rules:**

1. Record within 1 hour of meeting when possible.
2. Mark fit risk if objection repeats unresolved after 2 follow-ups.
3. Promote repeated objections to `auditos-pilot-meeting-workflow.md` common responses.

---

## 7. Proof Capture Rhythm

During **Pilot Active**, capture proof weekly minimum:

| Week   | Action                                                     |
| ------ | ---------------------------------------------------------- |
| Week 1 | Confirm workflow clarity + data loaded                     |
| Week 2 | First traceability or review readiness signal              |
| Week 3 | Stakeholder confidence or time-saved estimate (attributed) |
| Week 4 | Pre-review: 2+ categories documented; objections updated   |

Before **Pilot Review**, confirm:

- [ ] 2+ evidence categories with attributable source
- [ ] Quote classification set (PU / AN / IN / PR / NA)
- [ ] No forbidden claims in notes
- [ ] Objection register reviewed
- [ ] Post-pilot decision memo draft started

Detail: `docs/product/auditos-pilot-proof-capture.md`

---

## 8. Customer-Facing Pages (Reference Only)

Use these in customer conversations — do not treat as internal SOPs:

| Page                   | Path                 | Use when                                      |
| ---------------------- | -------------------- | --------------------------------------------- |
| Contact / pilot intake | `/contact`           | Customer ready to submit scope                |
| Engagement models      | `/engagement-models` | Explaining diagnostic vs pilot vs deployment  |
| Pilot proof framework  | `/pilot-proof`       | Setting success criteria and go/no-go outputs |
| Proof library          | `/proof-library`     | Showing sample outputs (demo data only)       |

---

## 9. Escalation Triggers

Escalate to founder within 24 hours if:

- Health = Red for 2 consecutive weeks
- Buyer disengaged during Pilot Active
- Data/privacy blocker unresolved
- Customer asks for claims we cannot make (compliance cert, On-Prem as live, PDF as guaranteed)
- Repeated unresolved AI-replacement objection

---

## 10. Related Documents

| Document                    | Path                                                                        |
| --------------------------- | --------------------------------------------------------------------------- |
| **Pilot Execution Index**   | `docs/product/auditos-pilot-execution-index.md`                             |
| Intake Monitoring           | `docs/product/auditos-pilot-intake-monitoring.md`                           |
| CSV Tracker Template        | `docs/product/auditos-pilot-account-tracker-template.csv`                   |
| Pilot Account Tracker       | `docs/product/auditos-pilot-account-tracker.md`                             |
| Pilot Command Center        | `docs/product/auditos-pilot-command-center.md`                              |
| Pilot Meeting Workflow      | `docs/product/auditos-pilot-meeting-workflow.md`                            |
| Pilot Proof Capture         | `docs/product/auditos-pilot-proof-capture.md`                               |
| Follow-Up Templates         | `docs/product/auditos-outbound-kit/follow-up-templates.md`                  |
| Session Management Playbook | `docs/product/pilot-control-pack/auditos/10-session-management-playbook.md` |
| Pilot Operator Checklist    | `docs/product/pilot-control-pack/auditos/01-pilot-operator-checklist.md`    |
