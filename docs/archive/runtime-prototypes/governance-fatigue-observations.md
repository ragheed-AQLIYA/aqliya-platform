# Governance Fatigue Observations

## Badge Blindness Risk

Low. With only 6 governance signals in the current UI, badge blindness is unlikely. Each signal serves a distinct purpose and appears in a specific context. The evidence state badges (5 states) and severity badges (4 levels) are standard audit patterns that reviewers are trained to use — they are tools, not warnings.

Risk escalator: If additional badges or signals are added without removing obsolete ones, badge blindness will increase.

## Governance Ignored After First Session

Not observed. The reviewer re-engaged with governance signals throughout the session, not just at the start. The DraftOnlyBanner was visible on every page load, and the Governance Context Panel was opened multiple times when the reviewer needed to check specific doctrine references.

## Warning Desensitization

Low risk. The governance layer uses one persistent warning (DraftOnlyBanner) and one informational tooltip (shield button). Neither uses aggressive styling (flashing, modals, blocking overlays). The absence of high-friction warnings means there is nothing to become desensitized to.

Risk escalator: If the DraftOnlyBanner is changed to a dismissible modal or if multiple blocking warnings are added, desensitization will increase.

## Panel Never Opened

Not observed — the reviewer opened the Governance Context Panel during the session. However, the collapsible-by-default design means some reviewers may never open it. This is acceptable: the panel contains reference information, not critical path items. The shield button tooltip provides a summary for reviewers who choose not to expand.

## Reviewer Impatience with Governance

Not observed. The reviewer did not express frustration or attempt to bypass governance signals. The signals are non-blocking (no forced modals, no required acknowledgments) and do not slow down the review workflow.

## Summary

Current governance fatigue risk is low. The minimal signal set, non-intrusive styling, and contextual placement all work against fatigue. The primary risk vector is growth — if the governance layer accumulates more signals over time without pruning, fatigue will emerge.
