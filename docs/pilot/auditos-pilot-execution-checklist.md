# AuditOS — Pilot Execution Checklist

**Status:** Pilot operations document
**Purpose:** Sequential checklist guiding the pilot team from pre-arrival through final decision

---

## Section A: Before Customer File Arrives

- [ ] Customer confirmed pilot participation and signed agreement (if applicable)
- [ ] Customer TB request message sent (Arabic + English)
- [ ] Delivery channel agreed (email / secure upload)
- [ ] Contact person identified by name at customer side
- [ ] Decision maker identified by name at customer side
- [ ] Reporting period confirmed with customer
- [ ] Accounting basis confirmed (Accrual / Cash)
- [ ] Currency confirmed
- [ ] Pilot scope and timeline confirmed
- [ ] Pilot Control Sheet opened and initialized
- [ ] Secure storage folder created: `./pilot-data/[customer-name]/`
- [ ] Pre-pilot freeze checklist signed off
- [ ] Execution pack documents ready
- [ ] Risk register reviewed
- [ ] Team roles confirmed (Pilot Lead, Technical Lead, Reviewer)
- [ ] Validation commands verified (tsc, lint, build) — optional if no code change since last check

**Gate Decision:** Go / Conditional Go / Hold

---

## Section B: When File Arrives

- [ ] File receipt acknowledged to customer (within 2 hours)
- [ ] Receipt date/time logged in Pilot Control Sheet
- [ ] File saved to secure storage with naming convention
- [ ] File hash verified (if available)
- [ ] File format checks passed (see TB intake runbook)
- [ ] Required columns present
- [ ] Data quality checks passed (Debits = Credits, numeric amounts, unique codes)
- [ ] Context validated (period, entity, currency, accounting basis)
- [ ] Intake decision recorded: Accepted / Accepted with Issues / Rejected
- [ ] If rejected: customer notified with specific corrections requested
- [ ] Pilot Control Sheet stage updated

**Intake Decision:** Accepted / Accepted with Issues / Rejected
**Gate Decision (if Accepted):** Go / Conditional Go

---

## Section C: After Upload

- [ ] TB uploaded to AuditOS engagement workspace
- [ ] Upload confirmed — all records imported correctly
- [ ] Account mapping initiated
- [ ] AI mapping suggestions reviewed
- [ ] Low-confidence mappings flagged for reviewer
- [ ] Unmapped accounts identified (target: < 5)
- [ ] All accounts mapped: 100% coverage
- [ ] Mapping confidence assessed
- [ ] Mapping results logged
- [ ] Reviewer sign-off on mapping

**Gate Decision:** Go / Conditional Go / No-Go

---

## Section D: After Financial Statement Generation

- [ ] Statement of Financial Position (SFP) generated
- [ ] SFP balances: Assets = Liabilities + Equity
- [ ] Profit & Loss (P&L) generated
- [ ] P&L balances (Net Income = Revenue - Expenses)
- [ ] Statement classification verified (spot check)
- [ ] Draft status displayed on all outputs
- [ ] Trace chain functional: TB → Account → Statement
- [ ] AI vs. human decisions distinguishable in output
- [ ] Audit trail accessible for each output
- [ ] Financial output QA checklist completed

**Gate Decision:** Go / Conditional Go / No-Go

---

## Section E: After Notes and Evidence Review

- [ ] Notes drafted by AI (if applicable)
- [ ] Notes reviewed by reviewer
- [ ] Evidence requirements generated
- [ ] Evidence links verified
- [ ] Findings documented
- [ ] Findings severity classified (Critical / High / Medium / Low)
- [ ] No critical unresolved findings
- [ ] High findings addressed or documented
- [ ] Reviewer sign-off obtained

**Gate Decision:** Go / Conditional Go / No-Go

---

## Section F: Before Review Meeting

- [ ] Full report package prepared (statements, notes, evidence, findings)
- [ ] Executive summary drafted
- [ ] Demo walkthrough script prepared
- [ ] Meeting scheduled with customer decision maker + contact
- [ ] Internal team pre-briefed
- [ ] Pilot Control Sheet up to date
- [ ] Issue log reviewed
- [ ] Trust/satisfaction survey prepared

---

## Section G: During Review Meeting (Demo)

- [ ] Walkthrough completed
- [ ] Customer questions answered
- [ ] Customer feedback collected (verbal + survey)
- [ ] Trust rating captured (target ≥ 3/5)
- [ ] Customer would continue? (Yes / Conditional / No)
- [ ] Next steps discussed
- [ ] Post-pilot decision framework shared

---

## Section H: After Final Decision

- [ ] Pilot outcome logged in Post-Pilot Decision Memo
- [ ] Customer thanked and next steps confirmed
- [ ] If proceed: commercial follow-up initiated
- [ ] If extend: revised scope and timeline documented
- [ ] If not proceed: lessons learned documented
- [ ] Pilot files archived
- [ ] Pilot Control Sheet finalized
- [ ] Internal retrospective conducted
