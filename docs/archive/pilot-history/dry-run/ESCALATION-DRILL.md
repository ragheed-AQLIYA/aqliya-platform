# AQLIYA Pre-Pilot Dry Run — Escalation Drill

**Document:** ESCALATION-DRILL.md  
**Purpose:** Practice issue identification, triage, escalation path, and customer communication under time pressure.  

---

## Instructions

Run each escalation scenario as a timed drill. The person playing the role of "Customer" reads the scenario. The Pilot Lead, Technical Lead, or Founder responds using the escalation workflow. The timekeeper tracks response time.

**Reference:** `docs/pilot/execution-pack/08-issue-escalation-workflow.md`

---

## Drill 1: Data Quality — Critical

**Scenario:** The customer's Trial Balance has been uploaded. Total debits (SAR 12,450,000) do not equal total credits (SAR 12,438,750). The difference is SAR 11,250.

**Severity:** Critical (blocks continuation)  
**Response Time Target:** < 1 hour  

**Drill Steps:**
1. Customer reports the issue
2. Pilot Lead triages (severity + category)
3. Technical Lead investigates
4. Response communicated back to customer
5. Resolution proposed

**Timer Start:** ________  
**Response to Customer:** ________  
**Resolution Proposed:** ________  
**Target Met?** ☐ Yes ☐ No  

**Success Criteria:** Customer is informed within 5 minutes (drill time) that the issue is being investigated, with next steps.

---

## Drill 2: Mapping — High

**Scenario:** During the mapping review, the reviewer notices that "Revenue — Consulting" (SAR 2.1M) has been classified as a liability in the Statement of Financial Position instead of revenue in the P&L.

**Severity:** High (impacts trust, workaround exists)  
**Response Time Target:** < 4 hours  

**Drill Steps:**
1. Reviewer identifies the misclassification
2. Issue logged in issue tracker
3. Technical Lead corrects the mapping
4. Reviewer re-verifies
5. Customer notified of the correction

**Timer Start:** ________  
**Issue Logged:** ________  
**Mapping Corrected:** ________  
**Target Met?** ☐ Yes ☐ No  

**Success Criteria:** Issue is logged within 3 minutes (drill time), corrected within 10 minutes, and customer notified.

---

## Drill 3: Feature Request — Medium

**Scenario:** During the demo, the customer asks: "Can AuditOS auto-generate cash flow statements?" This feature does not currently exist.

**Severity:** Medium (unsupported expectation)  
**Response Time Target:** During the demo  

**Drill Steps:**
1. Acknowledge the request without promising delivery
2. Document as feedback
3. Explain current scope
4. Move on gracefully

**Timer Start:** ________  
**Response Given:** ________  
**Documented?** ☐ Yes ☐ No  

**Success Criteria:** Customer feels heard but understands current limitations. Demo continues without awkwardness.

---

## Drill 4: Technical Demo Failure — Critical

**Scenario:** During the live customer demo, the AuditOS workspace fails to load. The page shows the global loading spinner and does not recover within 30 seconds.

**Severity:** Critical (blocks demo)  
**Response Time Target:** < 5 minutes during demo  

**Drill Steps:**
1. Acknowledge the issue to the customer
2. Pilot Lead hands off to Technical Lead
3. Technical Lead diagnoses (server issue / network / auth)
4. Decision: continue with `/auditos` demo or reschedule
5. Customer informed of the plan

**Timer Start:** ________  
**Handoff to Technical Lead:** ________  
**Diagnosis Complete:** ________  
**Decision Made:** ________  

**Success Criteria:** Customer is informed of the issue and next step within 2 minutes (drill time). Demo either continues with backup plan or is rescheduled professionally.

---

## Drill 5: Customer Confusion — Medium

**Scenario:** The customer's reviewer says: "I don't understand how the AI suggestions work. Are they mandatory? What if I reject one?"

**Severity:** Medium (customer confusion)  
**Response Time Target:** During the demo  

**Drill Steps:**
1. Pause and address the question directly
2. Explain: "AI suggestions are optional. You can accept, reject, or override any of them."
3. Show an example of accepting and rejecting
4. Confirm understanding before proceeding

**Timer Start:** ________  
**Explanation Given:** ________  
**Customer Confirms Understanding:** ________  

**Success Criteria:** Customer verbally confirms understanding within 3 minutes.

---

## Drill Summary

| Drill | Scenario | Severity | Response Time | Target Met? | Notes |
|-------|----------|----------|---------------|-------------|-------|
| 1 | TB doesn't balance | Critical | ________ | ☐ Yes ☐ No | |
| 2 | Misclassified revenue | High | ________ | ☐ Yes ☐ No | |
| 3 | Cash flow feature request | Medium | ________ | ☐ Yes ☐ No | |
| 4 | Workspace fails to load | Critical | ________ | ☐ Yes ☐ No | |
| 5 | AI suggestion confusion | Medium | ________ | ☐ Yes ☐ No | |

## Lessons Learned

```
What went well:
_______________________________________________

What could be improved:
_______________________________________________

What we would do differently:
_______________________________________________
```
