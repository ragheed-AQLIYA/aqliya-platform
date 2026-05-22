# Live Engagement Observation Log

## Session: Live engagement workflow — AuditOS
## Environment: Statements → Evidence verification → Findings creation
## Reviewer persona: Senior auditor reviewing a real engagement

---

### Stage 1 — Engagement Entry (Statements)

**Time:** 0:00
**Action:** Opens engagement, navigates to Statements tab.
**Observed:** Page loads with DraftOnlyBanner immediately visible. Reviewer scans the amber banner without pausing — the color signals "not final" pre-attentively. Eyes move to statement tabs.

**Governance interaction:** None explicit. Banner processed at a glance.

---

### Stage 2 — Statement Tab Switching

**Time:** 0:05-0:45
**Action:** Reviews Balance Sheet → P&L → Equity tabs.
**Observed:** Full focus on line items, amounts, classifications. Governance area (shield + "human review required" text) is in peripheral vision but not clicked. Reviewer opens traceability drawer for a large receivable balance.

**Governance interaction:** None. Reviewer is in "analysis mode" — governance is background context.

---

### Stage 3 — Evidence Concern

**Time:** 0:50
**Action:** Completes statement review. Clicks Governance Context shield button.
**Observed:** Tooltip appears. Reviewer reads: "2 doctrine references — 2 governance rules — Human review is required." Clicks to expand panel. Reads ProvenanceSummary: "Evidence: partial."  

**Reaction:** "Partial evidence — let me check what's missing." Switches to Evidence tab.

**Governance interaction:** ✅ Provenance triggered action. This is the ideal pattern.

---

### Stage 4 — Evidence Page

**Time:** 1:00-2:30
**Action:** Reviews evidence items. Sees 3 items in "missing" state, 2 in "uploaded" state.
**Observed:** Uses existing state filter to show only missing items. Reviews each one. Requests evidence for the missing items. Accepts 2 uploaded items after reviewing filename and account link.

**Governance interaction:** The existing evidence state badges serve governance function naturally. No additional governance badges needed.

---

### Stage 5 — Findings Page

**Time:** 2:30-4:00
**Action:** Navigates to Findings. Reviews severity badges. Sees 1 Critical, 2 High findings.
**Observed:** Opens Critical finding. Reviews description, evidence links. Checks traceability. Escalates to Partner review.

**Governance interaction:** Existing severity badges (Critical = red, High = orange) provide immediate risk visibility. No additional escalation badge needed — the existing UI already communicates urgency.

---

### Stage 6 — Return to Governance Context

**Time:** 4:15
**Action:** After completing evidence and findings review, returns to Statements. Clicks Governance Context again. Reads doctrine references.
**Reaction:** "Good to know the reasoning behind this." Closes panel.

**Governance interaction:** Panel used as a confirmation layer — reviewer validated their workflow against doctrine after completing the work.

---

## Interaction Summary

| Engagement Stage | Governance Used? | How |
|---|---|---|
| Statements — initial | Peripheral only | Banner at a glance |
| Statements — deep review | No | Focus on line items |
| Statements — post-review | Yes | Provenance triggered evidence check |
| Evidence review | Implicit | Existing state badges sufficient |
| Findings review | Implicit | Existing severity badges sufficient |
| Final verification | Yes | Governance panel as confirmation layer |

## Key Observation

Governance is consumed in a **U-shaped pattern**:
1. **Entry** — glance at banner (peripheral)
2. **Work** — governance ignored (deep focus)
3. **Exit** — governance consulted (confirmation)
