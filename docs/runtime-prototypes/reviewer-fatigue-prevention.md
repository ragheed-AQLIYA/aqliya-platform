# Reviewer Fatigue Prevention

## The Core Risk

```txt
Governance fatigue occurs when reviewers habituate to governance indicators
that never carry actionable information.

A badge that always says the same thing quickly becomes invisible.
An escalation that never escalates quickly becomes noise.
```

## Signs of Governance Fatigue

| Sign | Detection | Action |
|---|---|---|
| Reviewer ignores governance indicators | UX analytics show no engagement with governance UI | Remove non-actionable indicators |
| Reviewer clicks "dismiss" without reading | High dismiss rate for governance notices | Reduce frequency, improve relevance |
| Reviewer no longer distinguishes severity levels | All badges treated equally | Remove lowest-value badges |
| Governance panel never opened | Panel open rate near zero | Surface key content inline, remove panel |

## Noisy Governance Anti-Patterns

### 1. Static Evidence Badge

```txt
WRONG: Show "Partial" evidence badge on every draft view.
REALITY: If evidence state never changes, the badge has zero information value.
```

### 2. Constant Escalation Notice

```txt
WRONG: Show "Notice" escalation on every standard workflow.
REALITY: "Notice" is the default state. Default states are not actionable.
```

### 3. Decorative Provenance

```txt
WRONG: Show doctrine reference counts on every page.
REALITY: "2 doctrine references" without context is metadata noise.
```

### 4. Governance Bureaucracy UX

```txt
WRONG: Governance panels, badges, tooltips, and notices on every screen.
REALITY: Every element must earn its place through reviewer value.
```

## Escalation Overuse Risks

| Overuse Pattern | Consequence |
|---|---|
| `notice` shown on every page | Reviewer ignores notice level entirely |
| `review_required` for minor issues | Reviewer questions escalation reliability |
| All findings escalated | Escalation loses meaning |
| Escalation without explanation | Reviewer distrusts the system |

## Badge Saturation

```txt
A page with more than 2-3 governance badges will cause:
1. Reduced attention to each badge
2. Cognitive overload
3. Reviewer ignoring governance entirely
4. Trust degradation in the system
```

## Reviewer Trust Degradation Pattern

```txt
Phase 1: Reviewer notices governance (curiosity)
Phase 2: Reviewer checks governance occasionally (interest)
Phase 3: Reviewer ignores governance (habituation)
Phase 4: Reviewer distrusts governance (fatigue)
```

**Prevention:** Skip from Phase 1 directly to "trust only when proven" by never showing non-actionable governance.

## Governance Ergonomics Principles

| Principle | Application |
|---|---|
| Less but meaningful | Each governance element must carry actionable information |
| Contextual only | Show governance only when reviewer action is needed |
| Progressive disclosure | Surface key info inline, deep context in collapsible panels |
| Default to hidden | Governance should be invisible unless triggered |
| Test with reviewers | Validate governance usefulness before expanding |

## Current Governance Load Assessment

| Page | Elements | Actionable? | Verdict |
|---|---|---|---|
| Statements | DraftOnlyBanner + inline human review + collapsible panel | ✅ Banner is relevant, panel is optional | ✅ Clean |
| Evidence | Existing evidence state badges (missing/uploaded/reviewed/accepted) | ✅ State is real and actionable | ✅ No extra governance needed |
| Findings | Existing severity badges + AI draft "Not final" | ✅ Severity is real and contextual | ✅ No extra governance needed |

## The Strategy

```txt
Governance should guide attention, not permanently occupy attention.

When every screen has governance, no screen has governance.
```
