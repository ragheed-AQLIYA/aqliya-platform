# AuditOS Pilot Meeting Workflow — Phase 3

**Status:** Repeatable meeting workflows for first customer interactions
**Authority source:** `docs/pilot/CLIENT-DEMO-SCRIPT.md`, `docs/products/auditos-outbound-kit/`, `docs/products/sombol-meeting-pack/`
**Last updated:** 2026-05-28

---

## 1. Pre-Meeting Checklist

Before any customer meeting, confirm:

- [ ] Audience confirmed (names, roles, decision-making authority)
- [ ] Use case prepared for this specific account
- [ ] Pain points researched and noted
- [ ] Demo environment ready (demo data loaded, route tested)
- [ ] Objections anticipated and prepared for
- [ ] Pilot scope materials ready (if demo leads to pilot discussion)
- [ ] Follow-up template selected
- [ ] Meeting agenda prepared and shared (if not already)

---

## 2. Meeting Structures

### 2.1 15-Minute Meeting (Intro / Discovery)

Use for: First contact, initial qualification, outbound follow-up.

| Time  | Segment     | Purpose                                         |
| ----- | ----------- | ----------------------------------------------- |
| 0-2   | Opening     | Who we are, why we reached out                  |
| 2-8   | Discovery   | Listen to their workflow, pain, current tools   |
| 8-12  | Positioning | One-sentence fit: what we do maps to their pain |
| 12-15 | Next step   | Propose demo or send materials                  |

**Founder script:**
"We help audit teams move from trial balance to draft statements with full traceability in a governed workflow. We don't replace auditors — we make the preparation and review process visible and auditable. How does your team handle this today?"

**Discovery questions (pick 2-3):**

1. How do you go from trial balance to draft financial statements today?
2. Where does most of your time go: preparation, review, or approval?
3. What causes the most rework in your current process?
4. When a partner needs traceability, is it easy or painful?

**Next step:**

- If interest: schedule 30-min demo
- If weak interest: send product brief, follow up in 2 weeks
- If no fit: close gracefully, note learning

### 2.2 30-Minute Meeting (Demo + Pilot Discussion)

Use for: Qualified account with confirmed interest, after discovery.

| Time  | Segment               | Purpose                                      |
| ----- | --------------------- | -------------------------------------------- |
| 0-3   | Opening positioning   | AuditOS in one minute, aligned to their pain |
| 3-5   | Scenario setup        | Client scenario matching their use case      |
| 5-18  | Live demo walkthrough | 7 key screens (see demo proof points below)  |
| 18-22 | Pilot discussion      | Scope, duration, success criteria            |
| 22-27 | Objection handling    | Address concerns                             |
| 27-30 | Next steps            | Confirm follow-up, send pilot proposal       |

**Live demo walkthrough (13 min):**

| #   | Screen               | Time  | Key Message                                          |
| --- | -------------------- | ----- | ---------------------------------------------------- |
| 1   | Dashboard            | 1 min | All engagement status at a glance                    |
| 2   | Engagement overview  | 1 min | Clear workflow progress, traceability built in       |
| 3   | Trial balance        | 2 min | Upload, trust state, variance check                  |
| 4   | Account mapping      | 2 min | AI suggests mappings, humans confirm                 |
| 5   | Financial statements | 2 min | Structured from mappings, full traceability          |
| 6   | Evidence + Findings  | 2 min | Lifecycle from missing to accepted                   |
| 7   | Review + Approval    | 2 min | Readiness gate, approval with rationale, audit trail |
| 8   | Export               | 1 min | Bilingual JSON export with status labels             |

---

## 3. Discovery Questions (Full Set)

### Current Workflow

1. How do you go from trial balance to draft financial statements today?
2. Where do you draft and review disclosure notes?
3. How do you manage evidence requirements and follow-up?
4. Where do findings and review notes live currently?
5. How does review and approval work in your team?

### Pain and Friction

1. Where does most time go: preparation, review, or approval?
2. What causes the most rework?
3. When do evidence gaps typically appear — early or late?
4. Do you have consistency issues across team members or clients?
5. When a partner needs traceability, is it easy or painful?

### Tools and Environment

1. What tools do you use today?
2. What works well in your current setup?
3. What does not work well?
4. Is the problem the lack of a tool, or fragmentation across tools?

### Commercial and Decision

1. Are you looking to improve preparation, review, approval, or all?
2. Would you prefer to start with one engagement or broader?
3. Who leads the buying decision or trial?
4. What would we need to prove for you to consider this the right solution?

### Risk and Trust

1. What is your biggest concern about AI in this workflow?
2. Is your concern about liability, privacy, or output quality?
3. What would make you trust that draft outputs are reviewable?

---

## 4. Objection Capture

### Common Objections and Responses

| Objection                              | Response                                                                                                                                                         |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| We already have Excel                  | Excel works for individual files but does not connect evidence to findings or enforce review gates. AuditOS gives you structure without replacing your judgment. |
| AI cannot be trusted for audit         | We agree. AI output is always draft, flagged, and requires human review. AI assists. Humans decide. Evidence governs.                                            |
| Too small / too busy for a pilot       | We can start with one engagement. If the workflow saves time or reduces rework, it is worth it. If not, we part with no commitment.                              |
| Need to see it with real data          | That is exactly what the pilot is for. We use your trial balance data or a representative sample.                                                                |
| How is this different from competitors | We focus on governed traceability from source to publication. Everything is logged, everything is linkable, nothing is final without human approval.             |
| What about PDF/Word exports            | Current export is JSON with full status labels. PDF/DOCX is on the roadmap. For the pilot, JSON gives you full data to review.                                   |

### Objection Recording

After each meeting, record:

1. What objection was raised?
2. Was it resolved, partially resolved, or unresolved?
3. Does this objection indicate a fit issue?
4. Should this objection be added to the common responses?

### Objection Log Entry Template

| Field                | Example                               |
| -------------------- | ------------------------------------- |
| Date                 | 2026-05-28                            |
| Account              | [Account name]                        |
| Meeting type         | Intro / Demo / Pilot check-in         |
| Objection (verbatim) | "Can AI replace our reviewers?"       |
| Category             | AI                                    |
| Response given       | AI assists; humans decide; draft only |
| Resolved             | Partial                               |
| Fit risk             | No                                    |
| Follow-up needed     | Send positioning one-pager            |

Log in tracker objection sheet: `docs/products/auditos-pilot-account-tracker.md` §10.  
Weekly roll-up: `docs/products/auditos-pilot-command-center.md` §9.

---

## 5. Demo Proof Points

### Must-Demonstrate

- Trial balance upload with trust state
- Account mapping with AI suggestions
- Financial statements generated from mappings
- Evidence lifecycle (missing to accepted)
- Findings with severity and linked evidence
- Review comments targeting real entities
- Approval readiness gate (blocked vs open)
- Audit trail with filterable events
- Traceability drawer from any entity
- Bilingual export with status labels

### Must-Not-Claim

- AI replaces auditors
- AI produces final approved statements
- System guarantees compliance
- Results guaranteed for every client
- Production security certifications not yet obtained
- On-Prem or Air-Gapped deployment available
- PDF/Word export available (JSON only)

---

## 6. Post-Meeting Notes

Capture within 1 hour of meeting end:

1. Meeting date and duration
2. Attendees (names, roles)
3. What pain resonated most?
4. What part of the workflow mattered most?
5. What objections appeared?
6. What signals showed real interest?
7. What is the next step?
8. Who owns the next step?
9. What is the target date?

### Post-Meeting Decision Rules

| Signal                        | Decision                             |
| ----------------------------- | ------------------------------------ |
| Clear pain + interested buyer | Proceed to demo or pilot proposal    |
| Interested but no clear pain  | Schedule discovery follow-up         |
| Skeptical but willing         | Send materials, follow up in 2 weeks |
| No pain, no interest          | Close gracefully, log learning       |
| Asked for proposal            | Send within 48 hours                 |
| Asked for reference           | Send reference request kit           |

---

## 7. Follow-Up Decision Rules

### After Intro Call

- If interest high: send product brief + schedule demo within 1 week
- If interest medium: send product brief + follow up in 2 weeks
- If no response after 3 attempts: move to nurture

### After Demo

- If clear interest: send pilot proposal within 48 hours
- If interest medium: send summary + ask specific qualification questions
- If objections unresolved: send follow-up addressing objections + offer second demo

### After Silence (5+ days no response)

- Send gentle follow-up referencing last conversation
- Offer to adjust scope or timeline
- If no response after 2 follow-ups: pause, revisit in 30 days

### After Objection

- Acknowledge the objection
- Address it directly
- Offer to focus next conversation entirely on that concern
- Log entry within 1 hour; send follow-up within 48 hours

### SLA Summary

| Event                     | Action                | Deadline          |
| ------------------------- | --------------------- | ----------------- |
| Meeting ends              | Post-meeting notes    | ≤ 1 hour          |
| Interest confirmed        | Follow-up email       | ≤ 48 hours        |
| Pilot interest            | Pilot proposal        | ≤ 48 hours        |
| Objection raised          | Response + log        | ≤ 48 hours        |
| No reply 5+ days          | Silence follow-up     | When detected     |
| 3 failed contact attempts | Move to nurture/close | Per account rules |

---

## 8. Meeting Templates

### Intro Call Follow-Up

Subject: AuditOS — follow-up on our conversation

[Name], thank you for the call today.

As discussed, AuditOS focuses on organizing the workflow from trial balance to draft outputs, evidence, findings, review, and approval within a clear, traceable process.

I am sending:

1. Product brief
2. Demo flow
3. Notes on the points closest to your situation

If you would like, we can arrange the next step on a specific engagement or use case.

### Demo Follow-Up

Subject: AuditOS demo — next steps

[Name], thank you for your time in the demo.

Key points we focused on:

1. Workflow from trial balance to approval
2. Draft outputs rather than autonomous final outputs
3. Evidence and traceability
4. Review readiness and control

If the next step is appropriate, I suggest selecting one engagement to prove value practically.

---

## 9. Handoff to Proof Capture

Within **24 hours** of any meeting where value signals appeared:

1. Transfer post-meeting notes to proof capture (quotes, workflow clarity, traceability)
2. Classify any customer quote (PU / AN / IN / PR / NA)
3. Link objection log entries to proof gaps if concern blocked progress
4. Update tracker: stage, next action, follow-up date

If demo completed with interest: start evidence collection plan per `docs/products/auditos-pilot-proof-capture.md` §3.

---

## 10. Related Documents

| Document                 | Path                                                       |
| ------------------------ | ---------------------------------------------------------- |
| Operator Execution Guide | `docs/products/auditos-pilot-operator-execution-guide.md`   |
| Client Demo Script       | `docs/pilot/CLIENT-DEMO-SCRIPT.md`                         |
| Demo Agenda              | `docs/pilot/DEMO-AGENDA.md`                                |
| Discovery Questions      | `docs/products/auditos-outbound-kit/discovery-questions.md` |
| Follow-Up Templates      | `docs/products/auditos-outbound-kit/follow-up-templates.md` |
| Sombol Meeting Pack      | `docs/products/sombol-meeting-pack/`                        |
| Founder Pitch            | `docs/products/auditos-outbound-kit/founder-pitch.md`       |
| Next Step Checklist      | `docs/products/auditos-sales-ops/next-step-checklist.md`    |
| Pilot Command Center     | `docs/products/auditos-pilot-command-center.md`             |
| Pilot Proof Capture      | `docs/products/auditos-pilot-proof-capture.md`              |
