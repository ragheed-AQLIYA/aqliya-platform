# Pilot Session 5 — Operational Findings (Synthesis)

## Biggest Surprises
- **Real TB data is wide, not deep**: 200+ GL accounts in some engagements, but most had zero activity. Noise ratio much higher than synthetic test data.
- **Evidence rarely matches perfectly**: Bank statements and GL never agreed on first pass. Timing differences are the norm, not the exception.
- **PDFs are not trustworthy**: Multiple client-submitted PDFs were modified post-generation (metadata revealed edits). We had assumed PDF = reliable.
- **Reviewers spend 70% of time finding data, 30% analysing it**: The ratio was inverted from our design assumptions.
- **No two TBs look alike**: Chart of accounts structure, naming conventions, and level of detail varied wildly between engagements.

## Biggest Operational Truths
- **Real accounting data is messy by nature**: Standardisation assumptions in the system design do not hold in practice.
- **Source documents are incomplete in every engagement**: There is always something missing. The question is whether it matters.
- **Reviewer judgment is the binding constraint**: No amount of governance or provenance replaces a human decision on sufficiency.
- **Materiality drives everything**: Reviewers implicitly filter by materiality even when the system does not support it.
- **Time pressure overrides process**: When deadlines loom, governance steps are skipped, evidence is accepted at face value, and judgment calls multiply.

## Biggest Ambiguity Patterns
| Pattern | Frequency | Challenge |
|---------|-----------|-----------|
| Revenue cut-off across period boundaries | 4/5 engagements | No clear policy on recognising revenue near period end |
| Inventory valuation method inconsistency | 3/5 | FIFO vs weighted average not consistently applied |
| Related-party transaction classification | 3/5 | No arm's-length documentation |
| Loan vs equity classification | 2/5 | Convertible instruments not clearly documented |
| Provisions vs contingent liabilities | 2/5 | Threshold between the two unclear in accounting policy |

## Biggest Workflow Realities
| Expected | Actual |
|----------|--------|
| Linear: import → map → review → submit | Iterative: import → map → review → re-map → find evidence → review again |
| Evidence uploaded alongside each entry | Evidence gathered in batch, attached after the fact |
| Governance consulted throughout | Governance consulted only when stuck |
| Escalation used for unresolved issues | Escalation avoided; reviewers prefer to decide |
| One reviewer per engagement | Reviewer switched mid-engagement on 2/5 due to workload |

## Biggest Reviewer Behavior Patterns
- **Trust but verify — except when busy**: Reviewers trust client data at first pass, then spot-check. Under time pressure, spot-check rate drops.
- **Override without recording**: Reviewers overrode system warnings but did not document the override rationale.
- **Hesitation at revenue recognition**: Revenue entries caused the most pause, re-reading, and second-guessing of any area.
- **Pattern-matching from experience**: Reviewers relied on prior-period knowledge rather than system guidance. First-time engagements took significantly longer.
- **Print-to-read**: Despite digital tools, reviewers printed bank statements and contracts to read them. Digital-native review not yet comfortable.

## Biggest Governance Insights
- **Governance helped triage, not resolve**: Provenance told reviewers where to look but did not tell them what to decide. This is fine — but the system should not claim more.
- **Governance was ignored under pressure**: Confirmed across all engagements. The harder the work, the less governance is consulted.
- **Fatigue is real and fast**: Two governance interactions per session is the ceiling before reviewers stop engaging.
- **Banner effectiveness was fragile**: DraftOnlyBanner helped when reviewers entered through the expected flow. Those who bypassed the flow missed it entirely.
- **Escalation under-used by design**: Reviewers see escalation as failure. The system needs a way to flag issues without formal escalation.
- **Provenance was the most useful governance feature**: Source attribution had real value during evidence assessment. Other governance features (review status, sign-off tracking) were rarely accessed.
- **Governance should be passive, not active**: Systems that require reviewers to open panels, consult provenance, or trigger escalations will be ignored under real conditions. Passive indicators (colour, icon, position) that surface information without effort have higher adoption.
