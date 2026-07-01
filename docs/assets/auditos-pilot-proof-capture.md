# AuditOS Pilot Proof Capture — Phase 3

**Status:** Governed proof capture system for pilot evidence
**Authority source:** `docs/products/auditos-live-pilot-management/pilot-evidence-checklist.md`, `docs/products/auditos-market-proof-system/proof-asset-index.md`, `docs/products/auditos-market-proof-system/proof-usage-rules.md`
**Last updated:** 2026-05-28

---

## 1. What Counts as Pilot Proof

Proof is any documented, attributable signal that AuditOS delivered value to a pilot customer.

### Valid Proof

- User statement about workflow improvement (with attribution level)
- Measurable reduction in time for a specific step
- Evidence that traceability improved
- Reviewer confirmation of better review readiness
- Buyer statement of confidence
- Successful completion of a pilot workflow stage
- Customer agreeing to next step (extend, paid, reference)

### Not Valid Proof

- "Customer seemed happy" without a specific statement
- Anecdotal claims without a source
- Metrics that cannot be verified
- Claims about capabilities not demonstrated
- Claims about production readiness not yet achieved

---

## 2. What Must NOT Be Claimed

These claims are forbidden in any pilot proof, case study, or external communication:

| Forbidden Claim                              | Reason                                      |
| -------------------------------------------- | ------------------------------------------- |
| "AuditOS replaces auditors"                  | AI assists, does not replace                |
| "AuditOS produces final approved statements" | All output requires human review            |
| "AuditOS guarantees compliance"              | No compliance certification obtained        |
| "AuditOS automates audit"                    | It governs workflow, not automates judgment |
| "Production security certified"              | No security audit completed                 |
| "Results guaranteed"                         | Every engagement is different               |
| "AI makes final decisions"                   | Humans decide. Evidence governs.            |
| "On-Prem available"                          | Not implemented                             |
| "Air-Gapped deployment"                      | Not implemented                             |
| "Local AI runtime"                           | Not implemented                             |
| "Full PDF/Word export"                       | JSON only currently                         |

---

## 3. Evidence Categories

| Category                 | Definition                         | Example                                              |
| ------------------------ | ---------------------------------- | ---------------------------------------------------- |
| Workflow clarity         | User can describe workflow stages  | "Now I know exactly where we are in each engagement" |
| Review improvement       | Reviewer confirms better readiness | "I found evidence linked directly to findings"       |
| Traceability improvement | Numbers traceable to source        | "We could trace any number back to the TB"           |
| Stakeholder confidence   | Buyer/sponsor expresses trust      | "I feel confident signing off with this trail"       |
| Time saved               | Measurable reduction in time       | "Draft statements went from 2 days to 4 hours"       |
| Reduced rework           | Fewer late-stage corrections       | "We caught gaps before review instead of during"     |
| Paid conversion          | Customer converts to paid          | Commercial agreement signed                          |
| Referenceability         | Customer agrees to reference       | Approved for named or anonymized case                |

---

## 4. Customer Quote Capture Rules

### Quote Collection

1. Capture quotes during or immediately after meetings
2. Record exact words — do not paraphrase
3. Note context: what prompted the quote
4. Note speaker role: buyer, user, reviewer, partner
5. Classify for usage level before storing

### Quote Classification

| Level             | Label | Meaning                                  |
| ----------------- | ----- | ---------------------------------------- |
| Public with name  | PU    | Can quote with full attribution          |
| Anonymized        | AN    | Can quote without identifying details    |
| Internal only     | IN    | Only for AQLIYA internal use             |
| Private reference | PR    | Only for specific prospect conversations |
| Not approved      | NA    | Cannot use externally in any form        |

### Quote Format

```
Speaker: [Name], [Role]
Date: [YYYY-MM-DD]
Context: [What prompted the quote]
Exact quote: "[Customer's exact words]"
Usage level: [PU / AN / IN / PR / NA]
Approved by customer: [Yes / No]
```

---

## 5. Anonymized Case Study Inputs

When preparing an anonymized case study, capture:

### Customer Context (no identifying details)

- Segment (e.g., "Small audit firm, 5 staff")
- Geography (e.g., "Saudi Arabia, Riyadh region")
- Team size (e.g., "3 auditors, 1 reviewer, 1 partner")
- Engagement type (e.g., "IFRS for SMEs, full audit")
- Use case (e.g., "Streamlining TB-to-statement workflow")

### Before AuditOS

- How was the workflow handled?
- Where was the pain?
- What was hard to trace?

### During Pilot

- What did they actually use?
- Which step gave the clearest value?
- What objections or concerns were overcome?

### Value Evidence

- Workflow clarity improvement
- Traceability improvement
- Better review readiness
- Reduced manual follow-up
- Stakeholder confidence

---

## 6. Before/After Workflow Evidence

### Before Template

```
Step: [Workflow step]
Tool: [Tool used]
Time: [Time spent]
Pain: [Specific problem]
People: [Who was involved]
```

### After Template

```
Step: [Workflow step]
Tool: AuditOS
Time: [Time spent]
Improvement: [Specific improvement]
Evidence source: [Who confirmed this]
```

### Comparison Rules

1. Compare same step, same engagement type
2. Document both states before drawing conclusions
3. Attribute time estimates to the person who provided them
4. Do not extrapolate from one data point to general claims

---

## 7. Measurable Indicators

| Indicator                    | How to Measure                           | Target Range            |
| ---------------------------- | ---------------------------------------- | ----------------------- |
| TB-to-statement time         | Time from upload to generated statements | < 2 hours               |
| Mapping confidence           | % of accounts mapped correctly by AI     | > 80%                   |
| Unmapped accounts            | Count after initial AI suggestion        | < 5                     |
| Reviewer findings count      | Number of review comments per engagement | Track baseline          |
| Evidence gap discovery point | Before review vs during review           | Before review preferred |
| Approval readiness time      | Time from review to ready                | Track baseline          |
| Customer trust rating        | 1–5 survey after sessions                | >= 3/5                  |

---

## 8. Founder Learning Notes

After each pilot interaction, log:

1. What did we learn about the real buyer?
2. Which use case resonated most?
3. Which message landed best?
4. What objection repeated?
5. What should improve in demo / onboarding / pilot scope?

### Learning Categories

| Category                 | Question                  |
| ------------------------ | ------------------------- |
| ICP learning             | Who is the real customer? |
| Messaging learning       | What language works?      |
| Workflow learning        | What do they actually do? |
| Objection learning       | What concerns recur?      |
| Paid conversion learning | What makes them pay?      |

---

## 9. Case Study Readiness Checklist

Before considering a customer for case study:

- [ ] Pilot or paid period completed successfully
- [ ] Value demonstrated in 3+ evidence categories
- [ ] Stakeholder satisfaction confirmed
- [ ] Customer qualifies for reference tier 1 or 2
- [ ] Written approval obtained for usage level
- [ ] No exaggeration in claims
- [ ] Customer reviewed and approved final draft
- [ ] Proof asset indexed in proof asset index

---

## 10. Objection-to-Evidence Linkage

Objections are not noise — they define what proof the buyer still needs.

| Objection type | Proof that resolves it                                           | Invalid proof          |
| -------------- | ---------------------------------------------------------------- | ---------------------- |
| AI trust       | Reviewer confirms draft outputs are reviewable; audit trail demo | "They liked the UI"    |
| Data privacy   | Documented data handling + scoped pilot environment              | Verbal assurance only  |
| Scope / time   | Completed one engagement workflow end-to-end                     | Partial screen tour    |
| Export format  | JSON export with status labels shown                             | Claim PDF is available |
| Workflow fit   | User describes stages in their own words                         | Generic praise         |

When an objection is **partially resolved**, capture what proof is still missing in tracker **Evidence Need** field.

---

## 11. Weekly Proof Review Checklist

During **Pilot Active**, every Wednesday midweek check:

- [ ] New quotes captured with usage level
- [ ] 2+ evidence categories progressing (not all in one category)
- [ ] Objections linked to missing proof documented
- [ ] No forbidden claims in internal notes
- [ ] Measurable indicators have attributed source (who said / who measured)

Before **Pilot Review** gate: run case study readiness checklist (§9 above).

---

## 12. Related Documents

| Document                  | Path                                                                              |
| ------------------------- | --------------------------------------------------------------------------------- |
| Operator Execution Guide  | `docs/products/auditos-pilot-operator-execution-guide.md`                          |
| Pilot Evidence Checklist  | `docs/products/auditos-live-pilot-management/pilot-evidence-checklist.md`          |
| Proof Asset Index         | `docs/products/auditos-market-proof-system/proof-asset-index.md`                   |
| Proof Usage Rules         | `docs/products/auditos-market-proof-system/proof-usage-rules.md`                   |
| Case Study Capture        | `docs/products/auditos-live-pilot-management/first-customer-case-study-capture.md` |
| Case Study Publication    | `docs/products/auditos-market-proof-system/case-study-publication-workflow.md`     |
| Reference Account Program | `docs/products/auditos-market-proof-system/reference-account-program.md`           |
| Pilot Command Center      | `docs/products/auditos-pilot-command-center.md`                                    |
| Pilot Account Tracker     | `docs/products/auditos-pilot-account-tracker.md`                                   |
| Customer proof pages      | `/pilot-proof`, `/proof-library` (demo-data examples only)                        |
