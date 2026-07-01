# LCE-001: LocalContentOS Pilot Execution

**Status:** Active — Pre-Execution Draft  
**Version:** 1.0  
**Date:** 2026-06-29  
**Parent:** LCP-000 — LocalContentOS Pilot Definition Program  
**Owner:** Facilitator + Presenters (per session)  
**Governance Tier:** Platform Program — Execution Layer  

---

## Table of Contents

1. [Execution Charter](#1-execution-charter)
2. [Pilot Timeline](#2-pilot-timeline)
3. [Roles & Responsibilities](#3-roles--responsibilities)
4. [Evidence Collection Protocol](#4-evidence-collection-protocol)
5. [Evidence Register](#5-evidence-register)
6. [Operational Procedures](#6-operational-procedures)
7. [Daily Execution Control](#7-daily-execution-control)
8. [Completion Gates](#8-completion-gates)
9. [Deliverables](#9-deliverables)
10. [Execution Governance](#10-execution-governance)

---

## 1. Execution Charter

### 1.1 Program Identity

| Field | Value |
|---|---|
| **Program ID** | LCE-001 |
| **Program Name** | LocalContentOS Pilot Execution |
| **Parent** | LCP-000 — LocalContentOS Pilot Definition Program |
| **Status** | Active — Pre-Execution |
| **Version** | 1.0 |
| **Execution Period** | TBD (target: 2-week window from Session A to F) |
| **Governance Model** | Execution Governance (§10) |

### 1.2 What LCE-001 Does

LCE-001 executes the pilot defined in LCP-000. It does **not** redefine scope, decisions, criteria, or voting rules. It answers the question:

> *How do we produce the evidence required by LCP-000 §10 (Decision Evidence Matrix) in a verifiable, auditable way?*

### 1.3 What LCE-001 Does NOT Do

- Does not redefine pilot scope (that is LCP-000 §4)
- Does not redefine decision criteria (that is LCP-000 §5)
- Does not redefine voting rules (that is LCP-000 §6)
- Does not evaluate evidence (that is LER-001)
- Does not make product decisions (that is LDP-001)

### 1.4 Relationship to Other Programs

```
LCP-000 (Define — COMPLETE)
  │
  ▼
LCE-001 (Execute — THIS DOCUMENT)
  │
  ▼
[Evidence Register — produced by LCE-001]
  │
  ▼
LER-001 (Evaluate — next program)
  │
  ▼
LDP-001 (Decide — final program)
```

### 1.5 Successful Execution Criteria

LCE-001 is complete when:

1. All 6 sessions (A–F) have been conducted with quorum
2. Both modules (M1, M2) have been completed by all participants
3. All evidence items in the Evidence Register (§5) are marked **Collected** or **Verified**
4. The Deliverable Package (§9) is assembled and ready for LER-001
5. No open blockers remain (see §8 Completion Gates)

---

## 2. Pilot Timeline

### 2.1 Session Schedule

| Session | Title | Duration | Dependencies | Output |
|---|---|---|---|---|
| **M1** | Technical Inspection (asynchronous) | 2 hours per participant | None | Technical inspection checklist |
| **M2** | Product Walkthrough (asynchronous) | 1 hour per participant | M1 complete | Walkthrough notes |
| **A** | Orientation | 60 min | M1 + M2 complete | Shared understanding, Q&A log |
| **B** | Product Readiness Deep Dive | 90 min | A complete | Straw poll D1, D3 |
| **C** | AI Quality Deep Dive | 90 min | A complete | Straw poll D2 |
| **D** | Market & Investment Deep Dive | 90 min | A complete | Straw poll D4, D5 |
| **E** | Validation Review | 60 min | B + C + D complete | Validation report, security sign-off |
| **F** | Final Deliberation & Voting | 120 min | E complete | Signed outcomes, conditions, action items |

### 2.2 Time Allocation per Participant

| Activity | Time | Notes |
|---|---|---|
| Pre-read: LCP-000 Context Dossier (§3) | 30 min | Required before Session A |
| Module M1: Technical Inspection | 2 hours | Asynchronous, self-paced |
| Module M2: Product Walkthrough | 1 hour | Requires M1 complete |
| Session A: Orientation | 60 min | Synchronous |
| Session B: Product Readiness | 90 min | Synchronous |
| Session C: AI Quality | 90 min | Synchronous |
| Session D: Market & Investment | 90 min | Synchronous |
| Session E: Validation Review | 60 min | Synchronous |
| Session F: Final Deliberation | 120 min | Synchronous |
| **Total participant time** | **~12-13 hours** | Spread over 2 weeks |

### 2.3 Dependency Graph

```
M1 ──→ M2 ──→ A ──→ B ──┐
                         ├──→ E ──→ F
                  A ──→ C ──┘
                  A ──→ D ──┘
```

### 2.4 Buffer and Rescheduling

- Each session has a 2-business-day buffer for rescheduling
- If Session F is not reached within 3 weeks of Session A, automatic escalation to Governance Committee
- Any session cancelled due to lack of quorum is rescheduled within 5 business days

---

## 3. Roles & Responsibilities

### 3.1 RACI Matrix — Sessions

| Role | M1 | M2 | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|---|
| **Product Council Chair** | I | I | A | A | A | A | A | R |
| **Council Member 1** | R | R | R | R | R | R | R | R |
| **Council Member 2** | R | R | R | R | R | R | R | R |
| **Engineering Lead** | R | I | C | R | C | C | R | C |
| **AI Quality Lead** | R | I | C | C | R | C | C | C |
| **QA Lead** | R | I | C | C | C | C | R | C |
| **Security Lead** | R | I | C | C | C | C | R | C |
| **Facilitator** | I | I | R | R | R | R | R | R |
| **Scribe** | - | - | R | R | R | R | R | R |

**R** = Responsible (does the work)  
**A** = Accountable (answers for the outcome)  
**C** = Consulted (gives input before decision)  
**I** = Informed (notified after decision)

### 3.2 RACI Matrix — Evidence Collection

| Evidence ID (from §5) | Product Council | Eng Lead | AI Lead | QA Lead | Security Lead | Facilitator |
|---|---|---|---|---|---|---|
| E-001: Readiness score (start) | I | R | C | C | - | A |
| E-002: Readiness score (end) | I | R | C | C | - | A |
| E-003: Validation report | I | C | - | R | I | A |
| E-004: Completed workbook cycles | R | R | I | - | - | A |
| E-005: Critical bugs | I | R | I | R | - | A |
| E-006: AI suggestions generated | I | - | R | - | - | A |
| E-007: Human acceptance rate | I | - | R | - | - | A |
| E-008: Human override rate | I | - | R | - | - | A |
| E-009: Pattern health average | I | - | R | - | - | A |
| E-010: FP rate trend | I | - | R | - | - | A |
| E-011: AI quality issues (user-reported) | I | - | R | - | - | A |
| E-012: Task completion rate | R | C | - | C | - | A |
| E-013: Time-to-complete benchmark | R | C | - | R | - | A |
| E-014: User friction notes | R | - | - | - | - | A |
| E-015: Broken routes / dead links | R | R | - | R | - | A |
| E-016: Missing states report | R | C | - | R | - | A |
| E-017: Terminology issues | R | - | - | - | - | A |
| E-018: Scoring alignment confirmation | R | R | C | - | - | A |
| E-019: Customer interview notes | R | - | - | - | - | A |
| E-020: Competitor differentiation | R | - | - | - | - | A |
| E-021: Total person-hours | A | R | R | R | R | R |
| E-022: Blocking issues found | A | R | R | R | R | R |
| E-023: Team capacity assessment | A | R | - | - | - | R |
| E-024: Production effort estimate | A | R | C | C | C | R |
| E-025: Risk register changes | A | R | R | R | R | R |

### 3.3 Role Descriptions

| Role | Who | Responsibilities |
|---|---|---|
| **Product Council Chair** | TBD | Accountable for final decisions. Chairs Session F. Casts tie-breaking vote. Signs outcomes. |
| **Council Member 1** | TBD | Voting member. Reviews all evidence. Participates in all sessions. |
| **Council Member 2** | TBD | Voting member. Reviews all evidence. Participates in all sessions. |
| **Engineering Lead** | TBD | Generates technical evidence (E-001–E-005, E-015, E-018, E-021–E-025). Presents in Sessions B and E. |
| **AI Quality Lead** | TBD | Generates AI quality evidence (E-006–E-011). Presents in Session C. |
| **QA Lead** | TBD | Generates validation evidence (E-003, E-005, E-013, E-015, E-016). Presents in Session E. |
| **Security Lead** | TBD | Security audit sign-off. Generates security-related evidence. Presents in Session E. |
| **Facilitator** | TBD | Manages sessions. Tracks evidence status. Assembles deliverable package. Does not vote. |
| **Scribe** | TBD | Records minutes, objections, conditions. Files outcomes. Does not vote. |

---

## 4. Evidence Collection Protocol

### 4.1 Evidence Lifecycle

Every evidence item in the Evidence Register follows this lifecycle:

```
Planned
  │  [Evidence item is defined in LCE-001 §5]
  ▼
In Progress
  │  [Owner has started collection]
  ▼
Collected
  │  [Raw data exists — may be unverified]
  ▼
Verified
  │  [Facilitator confirms data is accurate and complete]
  ▼
Accepted
  │  [Council confirms evidence is sufficient for decision]
  ▼
[Handed to LER-001]
```

### 4.2 Collection Methods

| Method | Used For | Verification |
|---|---|---|
| **Automated** — Pulled from system (Prisma, CI, dashboard) | E-001, E-002, E-003, E-006, E-007, E-008, E-009, E-010 | Screenshot or export timestamped |
| **Observed** — Recorded during walkthrough (M2) | E-012, E-013, E-015, E-016 | Scribe notes + session recording |
| **Documented** — Written notes from sessions | E-011, E-014, E-017, E-018, E-019, E-020, E-024, E-025 | Scribe notes signed by source |
| **Estimated** — Engineering assessment | E-004, E-005, E-021, E-022, E-023 | Written assessment with assumptions documented |

### 4.3 Evidence Quality Rules

| Rule | Enforcement |
|---|---|
| Every evidence item must have a timestamp | Rejected if missing |
| Every evidence item must identify its source (person or system) | Rejected if missing |
| Automated evidence must include the query or command used | Rejected if missing |
| Observed evidence must be witnessed by ≥2 participants | Accepted only with co-sign |
| Estimated evidence must document assumptions and confidence | Accepted only with caveats |
| No evidence item may be marked **Accepted** without Facilitator verification | Blocked by process |

### 4.4 Evidence Storage

All evidence is stored in:
`docs/programs/lcp-000-pilot-definition/evidence/`

Naming convention:
```
E-{NNN}-{short-description}.{ext}
```

Examples:
```
E-001-readiness-score-start.json
E-003-validation-report.md
E-007-acceptance-rate.csv
E-014-user-friction-notes.md
```

### 4.5 Evidence Retention

- All evidence is retained for minimum 1 year after LDP-001 decision
- Evidence related to rejected decisions is retained for minimum 3 years
- Evidence containing customer data follows data retention policy (separate document)

---

## 5. Evidence Register

### 5.1 Full Evidence Register

| ID | Decision | Description | Source Method | Owner | Review Session | Status | Due |
|---|---|---|---|---|---|---|---|
| E-001 | D1 | Readiness score at pilot start (11 dimensions) | Automated — dashboard | Eng Lead | F | Planned | Before B |
| E-002 | D1 | Readiness score at pilot end (11 dimensions) | Automated — dashboard | Eng Lead | F | Planned | After E |
| E-003 | D1 | Validation report (build, lint, test, tsc) | Automated — CI | QA Lead | E | Planned | Before E |
| E-004 | D1 | Completed workbook cycles (count) | Observed — M2 | Eng Lead | F | Planned | Before F |
| E-005 | D1 | Critical bugs (count + severity) | Documented — issue tracker | QA Lead | E | Planned | Before E |
| E-006 | D2 | Total AI suggestions generated | Automated — Prisma | AI Lead | C, F | Planned | Before C |
| E-007 | D2 | Human acceptance rate (accepted / total) | Automated — Prisma | AI Lead | C, F | Planned | Before C |
| E-008 | D2 | Human override rate (rejected / total) | Automated — Prisma | AI Lead | C, F | Planned | Before C |
| E-009 | D2 | Pattern health record average score | Automated — Prisma | AI Lead | C, F | Planned | Before C |
| E-010 | D2 | False positive rate trend (start → end) | Automated — Prisma | AI Lead | C, F | Planned | Before C |
| E-011 | D2 | User-reported AI quality issues (count + notes) | Documented — session | AI Lead | C, F | Planned | Before C |
| E-012 | D3 | Task completion rate (project→workbook→review→export) | Observed — M2 | Product | B, F | Planned | Before B |
| E-013 | D3 | Time-to-complete benchmark (minutes) | Observed — M2 | QA Lead | B, F | Planned | Before B |
| E-014 | D3 | User friction notes (≥2 users) | Documented — M2 | Product | B, F | Planned | Before B |
| E-015 | D3 | Broken routes / dead links discovered | Observed — M2 | Eng Lead | B, E | Planned | Before E |
| E-016 | D3 | Missing state reports (empty/loading/error gaps) | Observed — M2 | QA Lead | B, E | Planned | Before E |
| E-017 | D4 | Saudi-market terminology issues discovered | Documented — glossary review | Product | D, F | Planned | Before D |
| E-018 | D4 | Scoring formula alignment confirmation | Documented — review | Eng Lead | D, F | Planned | Before D |
| E-019 | D4 | Customer interview notes (if conducted) | Documented — interview | Product | D, F | Planned | Optional |
| E-020 | D4 | Competitor differentiation notes | Documented — review | Product | D, F | Planned | Optional |
| E-021 | D5 | Total person-hours spent on pilot preparation | Documented — time tracking | Facilitator | F | Planned | Before F |
| E-022 | D5 | Blocking issues found (count + details) | Documented — issue tracker | Facilitator | F | Planned | Before F |
| E-023 | D5 | Team capacity assessment for next phase | Estimated — assessment | Eng Lead | F | Planned | Before F |
| E-024 | D5 | Estimated effort for production rollout | Estimated — assessment | Eng Lead | F | Planned | Before F |
| E-025 | D5 | Risk register changes (new + retired risks) | Documented — comparison | Facilitator | F | Planned | Before F |

**Total: 25 evidence items** (23 required + 2 optional)

### 5.2 Register Status Tracking

The Evidence Register is tracked as a living table during execution. Status transitions:

```
Planned ──→ In Progress ──→ Collected ──→ Verified ──→ Accepted
                                                 └──→ Rejected (return to owner)
```

| Status | Meaning | Who Changes |
|---|---|---|
| **Planned** | Defined, not yet started | Facilitator (initial) |
| **In Progress** | Owner is actively working on it | Owner |
| **Collected** | Raw data exists, not yet verified | Owner |
| **Verified** | Facilitator confirms completeness and accuracy | Facilitator |
| **Accepted** | Council confirms evidence is sufficient for decision | Council (in session) |
| **Rejected** | Evidence does not meet quality rules; return to owner | Facilitator |

### 5.3 Status Rollup

Before each session, the Facilitator produces a status rollup:

```text
Evidence Register Status — Session X
├── Planned:     N
├── In Progress: N
├── Collected:   N
├── Verified:    N
├── Accepted:    N
└── Rejected:    N

Blocking gaps: [items that must be Verified before session can proceed]
```

---

## 6. Operational Procedures

### 6.1 Session Invitation Protocol

1. Facilitator sends calendar invitation with:
   - Session title and ID (e.g., "LCE-001 / Session B — Product Readiness Deep Dive")
   - Link to video conference
   - Link to evidence items required for that session
   - Pre-read materials (15 min estimated)
2. Invitation sent minimum 48 hours before session
3. Reminder sent 2 hours before session
4. If quorum is not confirmed 1 hour before session, Facilitator begins rescheduling

### 6.2 Session Recording

- Every synchronous session is recorded (video + audio)
- Recording stored in `docs/programs/lcp-000-pilot-definition/evidence/recordings/`
- Naming: `LCE-001_Session-{A-F}_{YYYY-MM-DD}.{ext}`
- Recordings retained until LDP-001 decision is ratified, then may be archived

### 6.3 Minutes and Objections

The Scribe maintains a living minutes document:

```markdown
# LCE-001 / Session {X} — Minutes

**Date:** YYYY-MM-DD  
**Attendees:** [names]  
**Recording:** [link]

## Agenda Items

1. Item — summary, decisions, action items
2. Item — summary, decisions, action items

## Objections Raised

- [Name]: [objection verbatim]
  - Resolution: [how it was addressed]
  - Status: [Resolved / Deferred / Escalated]

## Action Items

| # | Action | Owner | Due |
|---|---|---|---|
| 1 | ... | ... | ... |

## Evidence Status Changes

- E-005: Collected → Verified (Facilitator)
- E-007: In Progress → Collected (AI Lead)
```
Deferred: All unresolved objections are documented as conditions in the outcome record.

### 6.4 Quorum Management

| Session | Required Participants | Minimum for Quorum |
|---|---|---|
| A | All roles | ≥2 council + facilitator |
| B | All roles | ≥2 council + eng lead |
| C | All roles | ≥2 council + AI lead |
| D | All roles | ≥2 council + product |
| E | All roles | ≥2 council + QA + security |
| F | All roles | ≥2 council + facilitator |

If quorum not met:
1. Facilitator announces within 15 min of scheduled start
2. Session rescheduled within 5 business days
3. Rescheduled session requires confirmed attendance from all required roles

### 6.5 Straw Poll Procedure (Sessions B, C, D)

Before formal voting in Session F, straw polls gauge council sentiment:

1. Facilitator states the decision and sub-questions
2. Each council member states initial position (Approve / Approve with conditions / Reject / Abstain)
3. Positions are recorded but not binding
4. If all 3 council members agree on straw poll, formal vote may be moved to current session
5. If any council member changes position between straw poll and formal vote, reason must be documented

### 6.6 Formal Voting Procedure (Session F)

Per LCP-000 §6:

1. Facilitator confirms quorum
2. Facilitator reads each decision and its criteria
3. For each decision: council members vote by roll call
4. Scribe records votes verbatim
5. Facilitator announces result
6. If conditions attached: conditions are read aloud and recorded
7. Tie-breaking: Chair votes only if tied, with written rationale
8. Outcomes are signed by Chair, Facilitator, and Scribe

---

## 7. Daily Execution Control

### 7.1 Daily Standup (During Active Pilot Period)

**Duration:** 15 minutes  
**Attendees:** Facilitator + all evidence owners  
**Time:** Same time each day  

**Agenda:**
1. Evidence status changes since last standup
2. Blockers (items preventing evidence collection)
3. Session preparation status
4. Risk updates

**Output:** Brief written summary (3-5 bullets) posted to program channel.

### 7.2 Evidence Status Dashboard

The Facilitator maintains a simple dashboard:

```text
Date: YYYY-MM-DD
Next session: Session {X} — {date}
Evidence status:
├── Accepted:   N/N
├── Verified:   N/N
├── Collected:  N/N
└── Planned:    N/N
Blockers: [list]
```

### 7.3 Blocker Protocol

If any evidence item is blocked:

1. **Triage** — Facilitator assesses whether blocker affects session quorum
2. **Resolution** — Evidence owner proposes resolution within 24 hours
3. **Escalation** — If unresolved in 48 hours, escalate to Council Chair
4. **Impact** — If blocker prevents session, session is rescheduled

### 7.4 Risk Monitoring

During execution, the Risk Register (LCP-000 §13) is monitored:

- New risks discovered → added to register with initial assessment
- Existing risks that materialize → trigger response playbook (§13.2)
- Risks that are no longer relevant → retired with rationale

---

## 8. Completion Gates

### 8.1 Session Completion Gate

A session is complete when:
- [ ] Quorum was met
- [ ] All agenda items were covered
- [ ] Minutes are filed
- [ ] Action items are documented
- [ ] Evidence items due for this session are marked Verified
- [ ] Next session is scheduled

### 8.2 Phase Completion Gate

| Phase | Complete When | Gatekeeper |
|---|---|---|
| **Pre-work (M1 + M2)** | All participants completed M1 and M2 checklists | Facilitator |
| **Discovery (A + B + C + D)** | All 4 sessions complete, all straw polls recorded | Facilitator |
| **Validation (E)** | Validation report signed, security sign-off obtained | QA Lead + Security Lead |
| **Decision (F)** | All 5 decisions voted, conditions documented, outcomes signed | Council Chair |

### 8.3 Program Completion Gate

LCE-001 is complete when ALL of the following are true:

- [ ] Sessions A–F complete with quorum
- [ ] Modules M1–M2 complete
- [ ] All 23 required evidence items marked **Collected** or **Verified**
- [ ] Deliverable Package assembled (§9)
- [ ] No open blockers
- [ ] Facilitator signs completion certificate
- [ ] Deliverable Package handed to LER-001

### 8.4 Completion Certificate

```markdown
# LCE-001 Completion Certificate

**Program:** LocalContentOS Pilot Execution  
**Execution Period:** YYYY-MM-DD to YYYY-MM-DD  
**Facilitator:** [Name]  

## Completion Checklist

| Gate | Status |
|---|---|
| Sessions A–F complete | ✅ / ❌ |
| Modules M1–M2 complete | ✅ / ❌ |
| Evidence Register: 23/23 required collected or verified | ✅ / ❌ |
| Deliverable Package assembled | ✅ / ❌ |
| No open blockers | ✅ / ❌ |

## Evidence Register Summary

| Status | Count |
|---|---|
| Accepted | N |
| Verified | N |
| Collected | N |
| Planned | N |
| Rejected | N |

## Handover

The Deliverable Package is hereby transferred to LER-001 for evidence review.

**Signed:**  
[Name], Facilitator — LCE-001  
[Name], Council Chair — LCP-000  
```

---

## 9. Deliverables

### 9.1 Deliverable Package

The complete output of LCE-001 is assembled as the Deliverable Package for LER-001:

```
deliverables/
├── LCE-001-completion-certificate.md    ← §8.4
├── evidence-register-final.md           ← §5 — full status
├── evidence/
│   ├── E-001-readiness-start.json
│   ├── E-002-readiness-end.json
│   ├── E-003-validation-report.md
│   ├── E-004-completed-cycles.md
│   ├── E-005-critical-bugs.md
│   ├── E-006-suggestions-total.json
│   ├── E-007-acceptance-rate.json
│   ├── E-008-override-rate.json
│   ├── E-009-pattern-health.json
│   ├── E-010-fp-trend.json
│   ├── E-011-ai-quality-issues.md
│   ├── E-012-task-completion.md
│   ├── E-013-time-to-complete.md
│   ├── E-014-user-friction.md
│   ├── E-015-broken-routes.md
│   ├── E-016-missing-states.md
│   ├── E-017-terminology-issues.md
│   ├── E-018-scoring-alignment.md
│   ├── E-019-customer-interviews.md (optional)
│   ├── E-020-competitor-notes.md (optional)
│   ├── E-021-person-hours.md
│   ├── E-022-blocking-issues.md
│   ├── E-023-team-capacity.md
│   ├── E-024-production-effort.md
│   └── E-025-risk-changes.md
├── minutes/
│   ├── LCE-001_Session-A_YYYY-MM-DD.md
│   ├── LCE-001_Session-B_YYYY-MM-DD.md
│   ├── LCE-001_Session-C_YYYY-MM-DD.md
│   ├── LCE-001_Session-D_YYYY-MM-DD.md
│   ├── LCE-001_Session-E_YYYY-MM-DD.md
│   └── LCE-001_Session-F_YYYY-MM-DD.md
├── recordings/
│   └── LCE-001_Session-{A-F}_{YYYY-MM-DD}.mp4
├── straw-polls.md
├── outcomes-draft.md
└── README.md
```

### 9.2 README Content

```markdown
# LCE-001 Deliverable Package

Generated by: LCE-001 — LocalContentOS Pilot Execution
Parent program: LCP-000
Handover target: LER-001 — LocalContentOS Pilot Evidence Review

## Contents

- **Completion Certificate** — signed program completion gate
- **Evidence Register** — final status of all 25 evidence items
- **Evidence/** — raw evidence files for each item (E-001 through E-025)
- **Minutes/** — session minutes for Sessions A–F
- **Recordings/** — video recordings of synchronous sessions
- **Straw Polls** — preliminary council positions from Sessions B, C, D
- **Outcomes Draft** — pre-filled outcome templates from LCP-000 §11

## Status

This package is complete and ready for LER-001 review.
```

---

## 10. Execution Governance

### 10.1 Change Management

Any change to LCE-001 during execution follows this process:

| Change Type | Approval Required | Documentation |
|---|---|---|
| Session date change | Facilitator | Updated in §2, notification to all participants |
| Evidence item addition | Facilitator + Council Chair | New entry in §5, new E-ID assigned |
| Evidence item removal | Council (≥2 of 3) | Removed from §5, rationale documented |
| Evidence owner reassignment | Facilitator + affected owner | Updated in §3.2 |
| Protocol change (minor) | Facilitator | Updated in relevant section |
| Protocol change (major) | Council (≥2 of 3) | Updated in relevant section + rationale |
| Scope change | Not permitted (belongs to LCP-000) | Escalate to Governance Committee |
| Decision criteria change | Not permitted (belongs to LCP-000) | Escalate to Governance Committee |

### 10.2 Deviation Management

If execution deviates from LCE-001:

1. **Detect** — Facilitator identifies deviation during daily execution control (§7)
2. **Assess** — Facilitator determines severity:
   - **Minor**: Does not affect evidence quality, session quorum, or timeline
   - **Major**: Affects ability to produce evidence or complete session
3. **Respond**:
   - Minor: Document deviation, continue execution
   - Major: Escalate to Council Chair, propose correction plan within 24 hours
4. **Learn** — Post-execution, all deviations are reviewed in the program retrospective

### 10.3 Evidence Gap Protocol

If an evidence item reaches **Deadline** without being **Collected**:

1. **Automatic flag** — Facilitator is notified
2. **72-hour extension** — Evidence owner has 72 hours to collect
3. **If still not collected after extension**:
   - Evidence item is marked **Incomplete** in the Evidence Register
   - Evidence gap is documented in the Deliverable Package
   - LER-001 is informed of the gap
   - Council decides whether to vote with incomplete evidence or defer to LCE-002

### 10.4 Participant Replacement

If a participant cannot complete their role:

1. **Temporary absence** (1–2 sessions): Role may be covered by another participant with notification
2. **Permanent withdrawal**: Council Chair appoints replacement within 3 business days
3. **Council member replacement**: Requires new member to complete M1 and M2 before voting

### 10.5 Program Retrospective

Within 2 weeks of LCE-001 completion:

1. Facilitator conducts retrospective with all participants
2. Retrospective covers:
   - What worked well
   - What could be improved
   - Evidence quality assessment
   - Protocol improvements for future LCE programs
3. Retrospective filed at `docs/programs/lcp-000-pilot-definition/retrospectives/LCE-001-retrospective.md`

---

## Appendices

### A. Quick Reference — Evidence Collection Summary

| Before Session | Evidence to Collect | Owner |
|---|---|---|
| **Before B** | E-001 (readiness start), E-012 (task completion), E-013 (time-to-complete), E-014 (user friction) | Eng Lead + Product |
| **Before C** | E-006 (suggestions), E-007 (acceptance), E-008 (override), E-009 (health), E-010 (FP trend), E-011 (AI issues) | AI Lead |
| **Before D** | E-017 (terminology), E-018 (scoring), E-019 (interviews), E-020 (competitor) | Product |
| **Before E** | E-003 (validation), E-005 (bugs), E-015 (broken routes), E-016 (missing states) | QA Lead + Eng Lead |
| **Before F** | E-002 (readiness end), E-004 (cycles), E-021 (hours), E-022 (blocking), E-023 (capacity), E-024 (effort), E-025 (risk changes) | All owners |

### B. Templates

- Minutes template: `docs/programs/lcp-000-pilot-definition/templates/minutes-template.md`
- Evidence template: `docs/programs/lcp-000-pilot-definition/templates/evidence-template.md`
- Completion certificate template: See §8.4

### C. References

- LCP-000 — Parent program definition (especially §§5, 6, 7, 10, 11)
- AGENTS.md — Operating contract
- LocalContentOS codebase — Evidence source

### D. File Change Log

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-06-29 | OpenCode Agent | Initial charter — Execution Governance with Evidence Register |
