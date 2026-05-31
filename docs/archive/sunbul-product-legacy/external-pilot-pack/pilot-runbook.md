# Sunbul — Pilot Runbook

**Version:** 1.0
**Date:** 2026-05-18
**Classification:** Internal — Sunbul Team

---

## Before Pilot

### T-2 Weeks

- [ ] Confirm pilot client and sign pilot offer
- [ ] Complete client requirements checklist
- [ ] Confirm pilot scope document signed
- [ ] Set pilot start and end dates

### T-1 Week

- [ ] Run `npx tsx scripts/seed-sunbul-pilot.ts` on the pilot instance
- [ ] Verify all users can log in
- [ ] Walk through the full workflow internally
- [ ] Run `npx tsx scripts/validate-sunbul-e2e.ts` — confirm 54/54
- [ ] Run `npx tsx scripts/sunbul-internal-pilot.ts` — confirm 40/40
- [ ] Prepare demo environment with client-specific sample data
- [ ] Send pilot invitation to client (use email template)

### T-1 Day

- [ ] Confirm client user accounts are active
- [ ] Confirm client has test documents ready
- [ ] Test all URLs from client perspective (no internal IPs)
- [ ] Verify document upload/download works
- [ ] Verify PDF export works
- [ ] Print the smoke test checklist
- [ ] Prepare feedback form

## During Pilot

### Week 1 — Onboarding & Demo

- [ ] Run demo agenda (30–45 min)
- [ ] Client operator creates first 3 cases
- [ ] Client uploads documents
- [ ] Client submits for review
- [ ] Client reviewer approves at least 1 case
- [ ] Client exports PDF
- [ ] Answer questions
- [ ] Record observations in pilot log

### Week 2 — Independent Use

- [ ] Client operates independently
- [ ] Sunbul team available for questions (daily check-in)
- [ ] Record all support requests
- [ ] Classify issues:
  - **Blocker** — pilot cannot continue
  - **Bug** — unexpected behavior
  - **Missing** — needed but not built
  - **Confusion** — unclear UI/label
  - **Idea** — improvement suggestion

### Week 3 — Deepening

- [ ] Client should have 10+ cases created
- [ ] Client should have tested return/resubmit flow
- [ ] Check if client is using audit trail
- [ ] Check if client is using PDF export
- [ ] Mid-pilot check-in meeting

### Week 4 — Closeout

- [ ] Client completes feedback form
- [ ] Schedule closeout meeting
- [ ] Review success criteria
- [ ] Present conversion proposal if criteria met
- [ ] Plan data disposition (keep, export, delete)

## After Pilot

- [ ] Collect and review feedback form
- [ ] Score success criteria (0–5 each)
- [ ] Make go/no-go decision for conversion
- [ ] If GO: present commercial proposal
- [ ] If NO-GO: document reasons, share learnings
- [ ] Archive pilot data per client preference
- [ ] Write pilot retrospective

## Who Does What

| Role | Responsibilities |
|---|---|
| **Sunbul Pilot Lead** | Client communication, demo, support escalation, runbook execution |
| **Sunbul Engineer** | Technical issues, bug fixes, data setup, deployment |
| **Client Coordinator** | Point of contact, user management within client |
| **Client Operators** | Create cases, upload docs, submit for review |
| **Client Reviewer** | Review, approve, return cases |
| **Client Decision Maker** | Evaluate success criteria, approve conversion |

## How to Record Observations

Use the following format for each observation:

```
Date:
Who: (client role)
Category: (blocker / bug / missing / confusion / idea)
Description:
System state: (what was happening)
Expected: (what should happen)
Actual: (what happened)
Severity: (critical / high / medium / low)
Resolution:
```

## How to Classify Issues

| Category | Definition | Action |
|---|---|---|
| **Blocker** | Pilot cannot continue without fix | Fix immediately or pause pilot |
| **Bug** | Unexpected behavior, but workaround exists | Fix within 48 hours or document |
| **Missing** | Needed feature not implemented | Document for next phase |
| **Confusion** | UI label or flow is unclear | Improve documentation or UI text |
| **Idea** | Improvement suggestion for future | Add to product backlog |

## When to Stop the Pilot

- Critical data leak or security incident
- Client requests to stop
- Blocker that cannot be resolved within 1 week
- Client does not use the system for 2 consecutive weeks

## When to Proceed to Paid Conversion

- All success criteria met (score 3+/5 each)
- Client expresses willingness to continue
- Client decision maker confirms value
- No unresolved blockers
- Client agrees to commercial terms

See:

`docs/archive/sunbul-product-legacy/external-pilot-pack/pilot-to-paid-conversion.md`
