# AQLIYA Controlled Pilot — Go/No-Go Decision Framework

**Document:** 06-controlled-pilot-go-no-go.md  
**Purpose:** Define decision criteria at each stage of the controlled pilot.  

---

## Decision States

| State | Meaning |
|-------|---------|
| **Go** | Proceed to next stage. All criteria met. |
| **Conditional Go** | Proceed with documented conditions. Address before next gate. |
| **No-Go** | Cannot proceed. Blocking issue requires resolution first. |
| **Hold** | Awaiting external input (customer data, clarification, etc.) |

---

## Gate 1: Before TB Arrival

| Criterion | Pass/Fail | Decision |
|-----------|-----------|----------|
| Pre-pilot freeze checklist signed off | ☐ Pass ☐ Fail | |
| Execution pack documents complete | ☐ Pass ☐ Fail | |
| Validation commands pass | ☐ Pass ☐ Fail | |
| Founder readiness assessed | ☐ Pass ☐ Needs Work ☐ Not Assessed | |
| Reviewer readiness assessed | ☐ Pass ☐ Needs Work ☐ Not Assessed | |
| Dry run executed (recommended) | ☐ Yes ☐ No | |
| Risk register reviewed | ☐ Pass ☐ Fail | |

**Gate Decision:** ☐ Go ☐ Conditional Go ☐ Hold

---

## Gate 2: After TB Intake

| Criterion | Pass/Fail | Decision |
|-----------|-----------|----------|
| File format valid | ☐ Pass ☐ Fail | |
| Required columns present | ☐ Pass ☐ Fail | |
| Debits = Credits (within tolerance) | ☐ Pass ☐ Fail | |
| All amounts numeric | ☐ Pass ☐ Fail | |
| Account codes unique | ☐ Pass ☐ Fail | |
| Currency consistent | ☐ Pass ☐ Fail | |
| Reporting period identified | ☐ Pass ☐ Fail | |

**Intake Decision:** ☐ Accepted ☐ Accepted with Issues ☐ Rejected

**Gate Decision (if Accepted):** ☐ Go ☐ Conditional Go  
**Gate Decision (if Rejected):** ☐ No-Go — Request corrected file

---

## Gate 3: After Account Mapping

| Criterion | Pass/Fail | Decision |
|-----------|-----------|----------|
| All accounts mapped | ☐ Pass ☐ Fail | |
| No unmapped accounts | ☐ Pass ☐ Pass with Exceptions ☐ Fail | |
| High-confidence AI mappings reasonable (> 0.8) | ☐ Pass ☐ Fail | |
| Low-confidence mappings flagged for reviewer | ☐ Pass ☐ Fail | |
| Statement classification correct (spot check) | ☐ Pass ☐ Fail | |

**Gate Decision:** ☐ Go ☐ Conditional Go ☐ No-Go

---

## Gate 4: After Financial Output QA

| Criterion | Pass/Fail | Decision |
|-----------|-----------|----------|
| SFP generated and balances (A = L + E) | ☐ Pass ☐ Fail | |
| P&L generated and balances | ☐ Pass ☐ Fail | |
| All critical QA checks pass | ☐ Pass ☐ Fail | |
| Draft status displayed on all outputs | ☐ Pass ☐ Fail | |

**Gate Decision:** ☐ Go ☐ Conditional Go ☐ No-Go

---

## Gate 5: After Traceability QA

| Criterion | Pass/Fail | Decision |
|-----------|-----------|----------|
| Full trace chain functional | ☐ Pass ☐ Fail | |
| TB → Output traceable | ☐ Pass ☐ Fail | |
| AI vs human decisions distinguishable | ☐ Pass ☐ Fail | |
| Audit trail accessible | ☐ Pass ☐ Fail | |

**Gate Decision:** ☐ Go ☐ Conditional Go ☐ No-Go

---

## Gate 6: After Reviewer Findings

| Criterion | Pass/Fail | Decision |
|-----------|-----------|----------|
| No critical unresolved findings | ☐ Pass ☐ Fail | |
| High findings addressed or documented | ☐ Pass ☐ Fail | |
| Reviewer signoff obtained | ☐ Pass ☐ Fail | |

**Gate Decision:** ☐ Go ☐ Conditional Go ☐ No-Go

---

## Gate 7: After Customer Feedback

| Criterion | Pass/Fail | Decision |
|-----------|-----------|----------|
| Demo walkthrough completed | ☐ Pass ☐ Fail | |
| Customer feedback collected | ☐ Pass ☐ Fail | |
| Trust rating ≥ 3/5 | ☐ Pass ☐ Fail | |
| Customer would continue (Q8.1 = Yes/Conditional) | ☐ Pass ☐ Fail | |

**Gate Decision:** ☐ Go ☐ Conditional Go ☐ No-Go

---

## Final Pilot Decision

| Section | Assessment |
|---------|------------|
| Technical Success (Gates 1–5) | ☐ Go ☐ Conditional ☐ No-Go |
| Workflow Success (Gate 6) | ☐ Go ☐ Conditional ☐ No-Go |
| Customer Value Success (Gate 7) | ☐ Go ☐ Conditional ☐ No-Go |
| Overall Commercial Signal | ☐ Strong ☐ Moderate ☐ Weak |

## Final Decision

| ☐ **Go** | All gates pass. Proceed to commercial readiness preparation. |
|---|---|
| ☐ **Conditional Go** | Most gates pass. Documented gaps to address. |
| ☐ **No-Go** | Critical gate failed. Re-evaluate before next pilot. |

## Decision Rationale

```
_______________________________________________
_______________________________________________
```

## Signoff

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Pilot Lead | | | |
| Founder | | | |
