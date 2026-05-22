# Reviewer Observation Log

## Session: Simulated senior auditor — Financial Statements Review
## Environment: AuditOS statement preview page with governance indicators

---

### Observation 1 — Page Load

**Timestamp:** 0:00
**Reviewer action:** Opens statements page for engagement.
**Observed behavior:** Eyes scan page title → client name → fiscal period. Pauses briefly on amber DraftOnlyBanner (approximately 1.5 seconds). Shifts focus to statement tabs.

**Note:** Banner was noticed without being consciously "read." The amber color registered as a warning signal. Reviewer did not stop to read the full banner text.

### Observation 2 — First Governance Interaction

**Timestamp:** 0:03
**Reviewer action:** Hovers over shield icon next to "Governance Context."
**Observed behavior:** Tooltip appears showing "Doctrine: 2 references — Governance: 2 rules apply. Human review is required." Reviewer reads tooltip. Does not click to open panel.

**Note:** Tooltip was sufficient for this reviewer. Panel was not needed at this stage.

### Observation 3 — Statement Review

**Timestamp:** 0:05-1:30
**Reviewer action:** Reviews Statement of Financial Position. Clicks through line items. Uses traceability drawer for a high-value account.
**Observed behavior:** Full focus on statement line items. Governance elements outside peripheral attention. The "Human review required before finalization" text was visible but not actively read.

**Note:** During active review, governance indicators become background context, not foreground interaction.

### Observation 4 — Return to Governance

**Timestamp:** 1:35
**Reviewer action:** Completes first statement tab review. Pauses. Looks at governance area again.
**Observed behavior:** Clicks "Governance Context" button. Panel opens. Reads doctrine references: "09.01: Data trust is the governed determination..." and "04.01: Financial Intelligence is the transformation..." Nods slightly. Reviews ProvenanceSummary: "Task: Statement Drafting — 2 doctrine refs — 2 governance refs — Evidence: partial — Escalation: notice — Review: Required."

**Note:** Reviewer sought governance context AFTER completing their initial review, not before. Governance was used as a confirmation layer, not a guidance layer.

### Observation 5 — Evidence Concern

**Timestamp:** 1:50
**Reviewer action:** Sees "Evidence: partial" in ProvenanceSummary.
**Observed behavior:** Closes panel. Switches to Evidence tab (in actual workflow). Checks evidence status for specific accounts.

**Note:** The evidence status in the governance panel triggered a verification action. This is the ideal governance behavior: information that leads to reviewer action.

### Observation 6 — Second Statement Tab

**Timestamp:** 2:00-3:00
**Reviewer action:** Reviews Statement of Profit or Loss.
**Observed behavior:** Governance panel remains closed. Reviewer does not reopen it. The "Human review required" text is visible but not re-read. Focus is entirely on statement line items.

**Note:** Governance is consumed once per session, not per tab. After initial validation, governance context is internalized.

### Observation 7 — Summary Assessment

**Timestamp:** 3:00
**Reviewer comment:** "The banner makes it clear these aren't final. The governance info is useful to know but I don't need to look at it for every statement. The evidence notice made me check — that was actually helpful."

---

## Interaction Metrics (Simulated)

| Metric | Value |
|---|---|
| Time to first governance notice | ~1.5s |
| Banner viewed | Yes (glanced) |
| Tooltip read | Yes (once) |
| Panel opened | Yes (once per session) |
| Panel open duration | ~15s |
| Statement tabs reviewed with panel open | 1 of 3 |
| Governance re-consulted | No |
| Evidence triggered by governance | Yes |
| Governance felt as interruption | No |

## Key Observations

1. **Banner works at a glance** — amber color signals "not final" without requiring full text read
2. **Tooltip was sufficient** — panel was not needed for initial governance validation
3. **Governance is consumed once** — reviewers internalize governance context after first encounter
4. **Evidence status triggers action** — this is the highest-value governance signal
5. **Governance does not interrupt** — it remains peripheral until the reviewer chooses to engage
