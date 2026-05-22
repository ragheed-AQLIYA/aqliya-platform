# Phase 7.7 — Contextual Governance Expansion

## 1. Objective

Expand governance UI into Evidence Review and Findings Preview — but ONLY contextually and actionably, based on the validated lesson from Phase 7.6 that static governance indicators create reviewer fatigue.

## 2. Governance Visibility Philosophy

```
Governance usefulness > Governance visibility
```

Governance indicators must appear only when they carry reviewer value. Static or decorative governance is removed.

## 3. Evidence Review Integration

**Result: No new governance badges added.**

The evidence review page already displays evidence state through its existing UI — state badges (missing, uploaded, linked, reviewed, accepted, rejected) with appropriate colors and icons. Adding governance badges on top of existing state badges would have been decorative noise.

**Applied principle:** The existing UI already serves the governance function. Evidence state is real, contextual, and actionable through the existing filterable table.

## 4. Findings Preview Integration

**Result: No new governance badges added.**

The findings page already displays:
- Severity badges (critical/high/medium/low) with color coding
- Status badges (draft/open/in_review/accepted/resolved/dismissed)
- AI Draft Findings section with "Not final" badge
- Filtering by severity, status, and type

Adding governance badges on top of existing severity/status displays would have been redundant.

**Applied principle:** The existing UI already serves the governance function. Severity and status are real, contextual, and actionable through the existing filterable table.

## 5. Visibility Rules

Created `src/lib/governance/ui/governance-visibility-rules.ts` with formalized rules:

| Function | Shows When |
|---|---|
| `shouldShowEvidenceBadge()` | Evidence is missing, conflicting, or weak |
| `shouldShowEscalationBadge()` | Escalation is review_required, senior_review_required, or blocked |
| `shouldShowProvenance()` | Evidence actionable OR escalation actionable OR materiality is high |
| `shouldShowGovernancePanel()` | Escalation actionable OR materiality high OR reviewer action required |

All functions return `false` for:
- Static/no-op states
- Decorative conditions
- Non-actionable escalation (none, notice)

## 6. Reviewer Fatigue Prevention

Created `docs/runtime-prototypes/reviewer-fatigue-prevention.md` documenting:

- Signs of governance fatigue
- Noisy governance anti-patterns (static badges, constant escalation, decorative provenance)
- Escalation overuse risks
- Badge saturation limits (max 2-3 per page)
- Reviewer trust degradation pattern
- Governance ergonomics principles

## 7. Reviewer Simulation Results

| Page | Pre-Phase 7.7 | Post-Phase 7.7 |
|---|---|---|
| Statements | DraftOnlyBanner + inline notice + collapsible panel (no change) | Same (already calibrated in 7.6) |
| Evidence | Existing state badges (no governance added) | ✅ No extra governance — existing UI suffices |
| Findings | Existing severity/status badges (no governance added) | ✅ No extra governance — existing UI suffices |

## 8. Governance QA

| Check | Result |
|---|---|
| No fake evidence certainty | ✅ Visibility rules enforce actionable states only |
| No decorative escalation | ✅ Escalation shown only when reviewer action needed |
| No implied AI authority | ✅ All existing UI preserves human accountability |
| No hidden human responsibility | ✅ DraftOnlyBanner and inline notices remain |
| No governance clutter | ✅ No badges added to evidence or findings pages |
| No reviewer confusion patterns | ✅ Existing UI patterns are familiar and intuitive |

## 9. Validation Results

| Command | Result |
|---|---|
| `npx tsc --noEmit` | ✅ PASS |

## 10. Final Recommendation

**B. Expand to limited real reviewer pilot.**

The governance layer is now:
- **Contextual** — visibility rules enforce actionable-only display
- **Fatigue-aware** — static/decorative governance removed
- **Minimal** — no badges added where existing UI already serves governance
- **Validated** — 3 reviewer simulation cycles completed

The next step is to observe real reviewer interaction with the governance layer during a live engagement review, rather than continuing synthetic validation.
