# Reviewer Interaction Analysis

## What the reviewer did

1. Loaded the integrated statements page for a sample audit engagement.
2. Observed the DraftOnlyBanner — acknowledged it by reading the text.
3. Hovered over the Governance Context shield button to read the tooltip ("2 doctrine refs, 2 governance rules").
4. Scanned the list of AI-generated statements in draft state.
5. Clicked to open the Governance Context Panel for the first statement.
6. Reviewed the listed doctrine references and governance rules in the panel.
7. Read the ProvenanceSummary within the panel to understand the AI's evidence sourcing.
8. Examined evidence badges for each attached piece of evidence.
9. Opened a second statement's governance panel to compare doctrine coverage.
10. Reviewed findings and sorted by severity to triage.
11. Closed the session without making any changes (observation-only mode).

## When they engaged with governance

- Immediately on page load (DraftOnlyBanner)
- During initial scan (shield button tooltip)
- During in-depth review of individual statements (Governance Context Panel, ProvenanceSummary)
- During evidence evaluation (evidence state badges)
- During finding triage (severity badges)

Governance engagement was continuous and contextual — the reviewer interacted with governance signals as part of their natural review workflow, not as a separate step.

## When they ignored governance

The reviewer did not ignore any governance signals. However, they did not:
- Re-read the DraftOnlyBanner after the initial page load (it remained visible peripheral awareness).
- Open the Governance Context Panel for every statement — only for two that required deeper scrutiny.

This is appropriate behavior. Constant re-engagement with every signal would indicate poor signal design.

## Pattern of governance consumption

1. **Orientation** (page load): Banner provides page-state context.
2. **Summary scan** (initial statement list view): Shield tooltip provides governance weight summary.
3. **Deep dive** (individual statement review): Governance Context Panel provides full detail.
4. **Evidence verification**: Evidence badges used alongside provenance info.
5. **Triage**: Severity badges used for prioritization.

The consumption pattern follows a progressive disclosure model — each layer of governance provides more detail than the last, and the reviewer naturally moved between layers as needed.
