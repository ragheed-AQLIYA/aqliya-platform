# Phase 6.5 — Reviewer Feedback Notes (Reviewer Experience Assessment)

## Output Clarity
The drafted statements are grammatically sound and structured, but they occasionally bury the key finding in boilerplate. A reviewer has to read to the end of paragraph 2 to find the actual allegation. Shortening the lead and front-loading the conclusion would reduce skimming fatigue.

## Review Boundary
Reasonably obvious. The "Analysis" section break serves as a visual cue. That said, when provenance is sparse, the boundary between system-authored text and source material blurs — a reviewer can't always tell where the evidence ends and the inference begins. A delimiter (e.g. `---`) or a separate "Evidence" panel would help.

## Escalation Reason Understandability
Clear when the escalation is trigger-based (e.g. "missing jurisdiction flag"). Less clear when the escalation is confidence-based — the reviewer sees "Reason: Low confidence" but not *which* factor (ambiguity, contradiction, missing source) drove the score. Exposing the dominant confidence sub-score would help.

## Provenance Usefulness
Useful in principle; inconsistent in practice. When the source document title and section are present, provenance saves time. Too often the field is empty or contains a generic value like "Document text." This makes the reviewer distrust provenance rather than rely on it. Empty provenance should be surfaced as a data quality flag, not silently included.

## Prompt Length
The prompt is long — ~3 500 tokens in the current build. It fits within context windows but is tiring to scroll through during debugging. A reviewer inspecting a single edge case does not need to re-read the full persona block every time. Collapsible sections in the UI or a "show prompt" toggle would mitigate this.

## System Conservatism
The system leans conservative. It prefers "could not confirm" over "found no evidence." This is safe but generates more false rejections — borderline cases that a human would pass get escalated. For a production triage tool this is acceptable; for a fully automated pipeline it would be too noisy. Currently the bias is appropriate for the pilot phase.

## System Permissiveness
Rarely permissive, but when it is, the cause is almost always stale or absent provenance. If the system cannot find a source for a claim it sometimes falls back on general knowledge, which is a fidelity risk. This happens in ~1 of 20 drafts in the test set. The fallback path needs an explicit flag so reviewers can catch it quickly.

## Reviewer Burden
Reduces burden for well-sourced, single-jurisdiction reviews — those are the majority. Increases burden for multi-jurisdiction or poorly sourced reviews because the reviewer must fact-check the system's sources AND reconstruct missing ones. Net effect is a modest reduction in per-review time (~15-20 %) but not the 50 % reduction initially hoped for. The burden shift is from drafting to validation, which is a better use of reviewer expertise.
