# AuditOS Pilot Command Center — Phase 3

**Status:** Live pilot operations command document
**Purpose:** Central control point for managing first 3–5 controlled pilot customers
**Authority source:** `docs/product/auditos-first-customer-loop/pilot-command-center.md`, `docs/product/auditos-live-pilot-management/pilot-master-tracker.md`  
**Execution index:** `docs/product/auditos-pilot-execution-index.md`  
**Last updated:** 2026-05-28

---

## 1. Pilot Operating Model

Pilot is not a trial. Pilot is a controlled evidence-collection program with a decision gate at the end.

### Core Principles

1. Every pilot has an owner
2. Every pilot has a use case
3. Every pilot produces evidence
4. Every pilot ends with a decision
5. AI assists. Humans decide. Evidence governs.

### Pilot Stages

| Stage           | Definition                                      | Exit Gate                       |
| --------------- | ----------------------------------------------- | ------------------------------- |
| Identified      | Account named and qualified for pilot fit       | Decision: proceed to contact    |
| Engaged         | Contact made, use case discussed                | Decision: book meeting or pause |
| Demo Completed  | Live demo delivered, interest confirmed         | Decision: propose pilot         |
| Pilot Proposed  | Scope, duration, success criteria shared        | Decision: customer accepts      |
| Pilot Active    | Customer using AuditOS with real or sample data | Regular health checks           |
| Pilot Review    | Evidence collected, success criteria evaluated  | Decision: go/no-go              |
| Paid Conversion | Commercial agreement signed                     | Celebration                     |
| Closed/Deferred | Pilot ended without conversion                  | Learning captured               |

### Owner Model

Each pilot must have exactly one internal owner who is responsible for:

- Customer communication
- Progress tracking
- Evidence collection
- Risk monitoring
- Decision preparation

---

## 2. Active Pilot Snapshot

| #   | Account                         | Segment | Owner | Stage      | Health | Risk | Next Decision | Expected Outcome |
| --- | ------------------------------- | ------- | ----- | ---------- | ------ | ---- | ------------- | ---------------- |
| 1   | [Placeholder — pilot account 1] | —       | —     | Identified | —      | —    | —             | —                |
| 2   | [Placeholder — pilot account 2] | —       | —     | Identified | —      | —    | —             | —                |
| 3   | [Placeholder — pilot account 3] | —       | —     | Identified | —      | —    | —             | —                |
| 4   | [Placeholder — pilot account 4] | —       | —     | Identified | —      | —    | —             | —                |
| 5   | [Placeholder — pilot account 5] | —       | —     | Identified | —      | —    | —             | —                |

### Health Labels

| Label  | Meaning                                                       |
| ------ | ------------------------------------------------------------- |
| Green  | Pilot progressing, stakeholder engaged, evidence accumulating |
| Yellow | Progress exists but risk or slow momentum                     |
| Red    | Pilot at risk — stalled, disengaged, or blocker unresolved    |

---

## 3. Weekly Command Sequence

### Monday — Status Update

1. Update each pilot's stage, health, risk, and next action
2. Check if any pilot needs escalation
3. Review weekly pilot status report

### Wednesday — Midweek Check

1. Follow up on actions due this week
2. Check evidence collection progress
3. Address any emerging issues

### Friday — Founder Review (20–30 min)

Per pilot:

1. Is the pilot moving or stuck?
2. Is buyer confidence rising or falling?
3. What is the strongest evidence signal this week?
4. What is the biggest blocker?
5. What decision is needed from founder?

Founder attention areas:

- Pilots near paid conversion
- Pilots with high risk
- Accounts with reference potential
- Recurring patterns in objections or onboarding friction

---

## 4. Decision Gates

### Gate 1: Proceed to Contact

**Criteria:**

- Account fits ICP (audit firm, accounting office, CFO team)
- Main pain identified
- Buyer or sponsor identified

### Gate 2: Proceed to Demo

**Criteria:**

- Use case agreed
- Audience confirmed
- Pain points understood
- Objections anticipated

### Gate 3: Proceed to Pilot

**Criteria:**

- Use case scoped
- Success criteria defined
- Duration agreed
- Stakeholders confirmed
- Internal owner assigned

### Gate 4: Pilot Go/No-Go

**Criteria:**

- Evidence collected across 2+ categories
- Success criteria evaluated
- Buyer feedback captured
- Risk register reviewed
- Post-pilot decision memo prepared

---

## 5. Risk Monitoring

### Common Pilot Risks

| Risk                        | Early Signal                                  | Mitigation                                |
| --------------------------- | --------------------------------------------- | ----------------------------------------- |
| Unclear buyer ownership     | Slow responses, no decision maker in meetings | Re-qualify before proceeding              |
| Weak use case               | Customer cannot articulate specific problem   | Tighten scope or pause                    |
| Slow stakeholder response   | 5+ days between replies                       | Set clear response expectations           |
| Unrealistic AI expectations | "Can it replace auditors?" questions          | Re-state positioning clearly              |
| Data quality issues         | TB not received, poor file quality            | Document constraints, manage expectations |
| Evidence collection gaps    | No proof captured after 2 weeks               | Weekly evidence prompts                   |

### Escalation

| Risk Level | Action                          | Timeline        |
| ---------- | ------------------------------- | --------------- |
| Low        | Document and monitor            | Weekly          |
| Medium     | Assign owner, define mitigation | Within 3 days   |
| High       | Escalate to founder             | Within 24 hours |
| Critical   | Founder decision required       | Immediate       |

---

## 6. Evidence Collection Per Pilot

Each pilot must produce evidence in at least 2 categories before go/no-go:

| Category                 | Example                                            |
| ------------------------ | -------------------------------------------------- |
| Workflow clarity         | User can describe the workflow stages              |
| Review improvement       | Reviewer found evidence ready instead of searching |
| Traceability improvement | Team can trace numbers back to source              |
| Stakeholder confidence   | Buyer expresses trust in output quality            |
| Time saved               | Draft preparation time reduced                     |
| Reduced rework           | Fewer late-stage corrections                       |

---

## 7. Pilot Completion Checklist

Before closing any pilot:

- [ ] All success criteria evaluated
- [ ] Evidence collected and documented
- [ ] Stakeholder feedback captured
- [ ] Risk register updated
- [ ] Post-pilot decision memo prepared
- [ ] Next commercial decision clear
- [ ] Learning logged in founder learning log

### Possible Outcomes

| Outcome             | Meaning                                          |
| ------------------- | ------------------------------------------------ |
| Paid conversion     | Commercial agreement, move to proposal           |
| Extend              | Value shown but needs more time or tighter scope |
| Pause               | Put on hold, revisit at agreed date              |
| No-Go               | Use case not fit, or sponsor not committed       |
| Reference candidate | Strong value shown, explore referenceability     |

---

## 8. Contact Intake and Triage

Inbound requests arrive via `/contact` (pilot review form) or direct email.

### Intake SLA

| Step                                  | SLA                  | Owner       |
| ------------------------------------- | -------------------- | ----------- |
| Acknowledge receipt (if manual reply) | ≤ 3 business days    | Pilot owner |
| Triage: fit / unclear / no-fit        | Same response window | Pilot owner |
| Tracker row created or updated        | Same day as triage   | Pilot owner |
| First meeting booked (if fit)         | ≤ 1 week from triage | Pilot owner |

### Triage outcomes

| Outcome       | Tracker stage                           | Next action                              |
| ------------- | --------------------------------------- | ---------------------------------------- |
| Strong fit    | Researched → Contacted → Meeting Booked | Schedule intro or demo                   |
| Unclear scope | Identified → Researched                 | Send clarifying questions                |
| Wrong product | Note redirect                           | Point to correct product; defer or close |
| No fit        | Closed / Deferred                       | Log learning; preserve relationship      |

Field mapping from form to tracker: `docs/product/auditos-pilot-account-tracker.md` §8.

Full operator sequence: `docs/product/auditos-pilot-operator-execution-guide.md`.

Customer-facing intake pages: `/contact`, `/engagement-models`, `/pilot-proof`.

---

## 9. Objection Register (Weekly)

Review objection patterns every Friday founder review alongside pilot health.

| Review question                            | Action if yes                               |
| ------------------------------------------ | ------------------------------------------- |
| Same objection on 2+ accounts?             | Update common responses in meeting workflow |
| Objection unresolved after 2 follow-ups?   | Mark fit risk; re-qualify or pause          |
| Objection implies forbidden claim request? | Escalate to founder within 24h              |

Maintain register format in `docs/product/auditos-pilot-operator-execution-guide.md` §6.

---

## 10. Weekly CSV Review (Command Center)

Every **Monday** status update must include CSV discipline review:

1. Run checklist: `auditos-pilot-account-tracker.md` §12
2. Update command center snapshot (§2) health from tracker staleness rules
3. Escalate missing next-action rows (§11) to founder if unresolved 2+ days
4. Confirm intake path: webhook receiving OR manual fallback active
5. Scan production logs for `webhook=failed` / `webhook=error` — trigger manual fallback if any

Go-live checklist: `auditos-pilot-intake-monitoring.md` §14.

---

## 11. Related Documents

| Document                     | Path                                                                      |
| ---------------------------- | ------------------------------------------------------------------------- |
| **Pilot Execution Index**    | `docs/product/auditos-pilot-execution-index.md`                           |
| Manual Intake Fallback       | `docs/product/auditos-pilot-manual-intake-fallback.md`                    |
| Intake Monitoring            | `docs/product/auditos-pilot-intake-monitoring.md`                         |
| CSV Tracker Template         | `docs/product/auditos-pilot-account-tracker-template.csv`                 |
| **Operator Execution Guide** | `docs/product/auditos-pilot-operator-execution-guide.md`                  |
| Pilot Account Tracker        | `docs/product/auditos-pilot-account-tracker.md`                           |
| Pilot Meeting Workflow       | `docs/product/auditos-pilot-meeting-workflow.md`                          |
| Pilot Proof Capture          | `docs/product/auditos-pilot-proof-capture.md`                             |
| Pilot Master Tracker         | `docs/product/auditos-live-pilot-management/pilot-master-tracker.md`      |
| Pilot Control Sheet          | `docs/pilot/current-auditos-pilot-control-sheet.md`                       |
| Pilot Runbook                | `docs/source-of-truth/PILOT_RUNBOOK.md`                                   |
| Weekly Founder Review        | `docs/product/auditos-first-customer-loop/weekly-founder-pilot-review.md` |
| Customer Journey Timeline    | `docs/product/auditos-first-customer-loop/customer-journey-timeline.md`   |
