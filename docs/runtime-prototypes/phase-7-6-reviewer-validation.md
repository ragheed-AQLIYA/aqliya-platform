# Phase 7.6 — Reviewer Validation & UX Calibration

## Session Type: Structured reviewer simulation
## Target: Financial Statements page (governance indicators)
## Reviewer persona: Senior auditor reviewing draft financial statements

---

## 1. Reviewer Scenario

**Context:** Senior auditor opens the financial statements page for an engagement. The trial balance has been uploaded and mapped. Evidence collection is in progress. The reviewer needs to assess whether the statements are ready for review.

**Visual hierarchy as rendered (top to bottom):**

```
Page Title: "Financial Statements"
Subtitle: [Client Name] - [Fiscal Period]
Right: [Draft Badge] [Export Button]

[DraftOnlyBanner] ← amber card, "Draft Only — Human review required"

[🛡️ Governance Context] [🟡 Partial] [🔵 Notice] ← small row

[Tabs: SFP | P&L | SCE | Cash Flow]

[Statement Card: Title, status badge, line items...]
```

---

## 2. Reviewer Feedback Matrix

| Area | Result | Problem | Action |
|---|---|---|---|
| Draft banner clarity | ⚠️ Mixed | Banner is clear but positioned ABOVE the page title's "Draft" badge — creates duplication. Reviewer sees "Draft" twice within 50px. Redundancy dilutes urgency. | Remove the header-level "Draft" badge OR reduce banner prominence. One draft signal is enough. |
| Evidence badge usefulness | ❌ Not yet useful | Hardcoded to "Partial" — always shows same value. Reviewer cannot trust a badge that never changes. Static badge = decorative noise. | Connect to real evidence state from the engagement. Until then, reduce to tooltip-only or remove. |
| Escalation understanding | ⚠️ Mixed | "Notice" level is too common — appears on every draft view. Reviewer may habituate and ignore. Reason in tooltip is good but "review recommended" is too vague for an auditor. | Only show escalation when meaningful (missing evidence, high materiality). "Notice" for standard drafts adds noise. |
| Provenance readability | ✅ Good | Doctrine references in the governance panel are specific ("09.01 Data Trust Theory", "04.01 Financial Intelligence Thesis"). An auditor understands these. Panel text is concise. | Keep. Consider showing 1-2 key references outside the panel by default. |
| Governance panel usefulness | ⚠️ Partially | Content is valuable but hidden behind a click. Most reviewers will not open it unless prompted. The tooltip on hover provides a dense summary that is easy to miss. | Surface one key doctrine reference visibly without requiring panel open. |
| Reviewer confidence | ✅ Positive | Knowing that doctrine backs the workflow increases trust. The existence of governance context is reassuring even if not always read. | Preserve the layer — just reduce noise and increase relevance. |
| Noise level | ⚠️ Medium | Three indicators (Draft + Evidence + Escalation) before the actual statements competes with the real work. Reviewer's goal is to review numbers, not governance badges. | Consolidate governance indicators into a single compact bar. Only expand when relevant. |

---

## 3. Specific Observations

### 3.1 Draft Boundary: Two Signals, One Message

The page header has `<Badge>Draft</Badge>` at line 62, and the `DraftOnlyBanner` renders immediately below at line 68. Both say the same thing. For a reviewer who already knows the engagement is in draft state (they can see the status badge), the banner becomes redundant noise.

**Recommendation:** Remove the header `Badge variant="outline" className="bg-amber-100 text-amber-700">Draft</Badge>` since the `DraftOnlyBanner` serves this purpose with more context.

### 3.2 Evidence Status: Static Data Problem

`EvidenceStatusBadge status="partial"` at line 77 is hardcoded. This means:
- Every engagement shows "Partial" regardless of actual evidence state
- Reviewer cannot distinguish between "evidence not yet started" and "evidence almost complete"
- If all values are the same, the badge has zero information value

**Recommendation:** Either:
1. Connect to real evidence data from the engagement (requires service integration)
2. Remove until real data is available
3. Show only when evidence state changes during the session

### 3.3 Escalation Level: Context-Dependent

`EscalationBadge level="notice"` shows "Notice" on every draft view. For standard financial statement drafting with partial evidence, "Notice" is technically correct but operationally noisy. A senior auditor reviewing their 10th engagement will see 10 identical "Notice" badges.

**Recommendation:** Only show escalation when level > `notice`. Reserve `notice` for internal system awareness, not reviewer-facing display.

### 3.4 Governance Panel: Discoverability

The governance panel is revealed by clicking the shield + "Governance Context" button. The tooltip on hover shows a dense summary string. During simulated review:
- First pass: Did not click the panel (focused on statement numbers)
- Second pass: Clicked after noting the shield icon — content was useful but felt "extra"

**Recommendation:** Surface one key doctrine reference inline (e.g., "Evidence must be verified before finalization") without requiring panel open. Keep the panel for deeper context.

### 3.5 Provenance Summary: Good When Seen

The `ProvenanceSummary` inside the panel shows:
- Task type
- Doctrine count (2 docs)
- Governance count (3 rules)
- Evidence status (partial)
- Escalation (notice)
- Review required (yes)

This is useful context but only visible when the panel is open.

**Recommendation:** Extract the key callout ("Human review is required — output is draft until reviewed") and show it inline near the statement content. Keep the full summary in the panel.

---

## 4. Simulated Reviewer Decision Flow

```
1. Opens Statements page
2. Sees amber banner "Draft Only" → understands. Also sees "Draft" badge → redundant.
3. Sees "Partial" badge → ignores after first glance (always shows same value).
4. Sees "Notice" escalation → mild curiosity, reads tooltip once, ignores thereafter.
5. Browses statement tabs → this is the real work. Governance indicators are peripheral.
6. Notices shield icon → clicks after finishing first statement review.
7. Reads doctrine references → "good to know".
8. Closes panel, continues review.
```

**Assessment:** Governance indicators do not block or confuse the reviewer. However, they also do not actively help the reviewer make better decisions in the current state. The value is latent — it will materialize when:
- Evidence status reflects real engagement data
- Escalation only fires when actionable
- Doctrine references connect to the specific line item under review

---

## 5. Calibration Actions

| Priority | Action | Rationale |
|---|---|---|
| P0 | Remove redundant header "Draft" badge | Banner already communicates draft status. Duplication dilutes signal. |
| P0 | Remove `EvidenceStatusBadge` until connected to real data | Static badge is decorative noise. Restore when service provides real evidence state. |
| P0 | Only show `EscalationBadge` when level > `notice` | Standard draft state does not warrant reviewer-facing escalation. |
| P1 | Surface one doctrine/duty callout inline | Example: "Human review is required before finalization" next to statement content. |
| P2 | Keep governance panel as-is | Content is valuable for the reviewer who seeks it. |
| P3 | Connect evidence state to engagement service | Enable real evidence tracking when the service layer is ready. |

---

## 6. Final Decision

### After applying P0 calibration:

**Result: Expand governance UI to evidence review and findings preview.**

The governance layer is architecturally sound. The P0 fixes remove noise. The remaining indicators provide clear, non-redundant governance visibility. The next step is to apply the same lightweight integration to:
- Evidence review page (show evidence status per account area)
- Findings preview (show draft/review boundaries for each finding)

**Do NOT:**
- Add more badges or indicators
- Build a governance dashboard
- Introduce retrieval engine yet
- Over-engineer before reviewer feedback from real use

**Status after calibration:**
```
Draft boundary:   ✅ Clear (single DraftOnlyBanner)
Evidence:         ⏸️ Hidden until real data connects
Escalation:       ✅ Shows only when actionable
Provenance:       ✅ Accessible via panel
Governance panel: ✅ Available for deep context
Noise level:      ✅ Low (3 indicators → 1 visible)
```
