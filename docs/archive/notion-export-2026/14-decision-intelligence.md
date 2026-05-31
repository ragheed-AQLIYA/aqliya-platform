# Decision Intelligence Layer

**Status:** Design — Upgrade Path  
**Date:** 2026-05-30  
**Current Decisions Log maturity:** L3  

---

## 1. CURRENT STATE AUDIT

The Decisions Log (11 fields) captures decisions with context, options, rationale, and reversibility. However:

| Weakness | Impact |
|---|---|
| No quality scoring | Cannot distinguish good vs bad decisions |
| No outcome tracking | Cannot verify if decision was correct |
| No review cycle | Decisions are never revisited |
| No decision velocity | Cannot measure decision-making speed |
| Related Evidence is free text | Not linked to Proof Library |
| No Product relation | Cannot trace decisions to product impact |
| No AI readiness | No structured data for future AI analysis |

---

## 2. UPGRADE PATH

### Fields to Add (6)

| Field | Type | Purpose |
|---|---|---|
| **Decision Quality** | Select | Excellent, Good, Fair, Poor, Too Early |
| **Actual Outcome** | Select | Successful, Partially Successful, Neutral, Unsuccessful, Unknown |
| **Outcome Description** | Text | What actually happened |
| **Review Date** | Date | When to review this decision |
| **Review Notes** | Text | What the review found |
| **Product** | Relation→Product Portfolio | Which product(s) affected |

### Fields to Upgrade (1)

| Field | Current | Target |
|---|---|---|
| Related Evidence | Free text | Relation to Proof Library |

### Decisions Log v2 Full Schema (17 fields)

| Field | Type | Purpose |
|---|---|---|
| Decision | Title | — |
| Date | Date | — |
| Area | Select | Current 8 areas |
| Context | Text | — |
| Options Considered | Text | — |
| Reason | Text | — |
| Final Decision | Text | — |
| Decision Quality | Select | NEW |
| Actual Outcome | Select | NEW |
| Outcome Description | Text | NEW |
| Reversible? | Checkbox | Current |
| Review Date | Date | NEW |
| Review Notes | Text | NEW |
| Related Evidence | Relation→Proof Library | UPGRADED |
| Product | Relation→Product Portfolio | NEW |
| Owner | Person | Current |
| Notes | Text | Current |

---

## 3. DECISION QUALITY SCORING

### Quality Dimensions

| Dimension | Weight | Scoring (1-5) |
|---|---|---|
| Decision speed | 15% | 1=Too slow, 5=Right timing |
| Information quality | 25% | 1=No data, 5=Full analysis |
| Option exploration | 20% | 1=One option, 5=Multiple with tradeoffs |
| Risk consideration | 15% | 1=No risk, 5=Full risk analysis |
| Outcome alignment | 25% | 1=Wrong, 5=Correct outcome |

### Simple Scoring (v1)
Use manual Decision Quality select field instead of formula:
- **Excellent**: All 5 dimensions strong, outcome confirmed positive
- **Good**: Most dimensions strong, outcome positive or neutral
- **Fair**: Some gaps, mixed outcome
- **Poor**: Major gaps, negative outcome
- **Too Early**: Cannot assess yet

---

## 4. DECISION REVIEW CYCLE

### Review Schedule

| Reversible? | Review After |
|---|---|
| Yes | 30 days |
| No, but low risk | 90 days |
| No, high risk | 180 days |
| Strategic/irreversible | 365 days |

### Review Process

1. Set Review Date when creating decision
2. On Review Date, owner completes review
3. Fill: Decision Quality, Actual Outcome, Review Notes
4. Link outcome to Proof Library if applicable
5. Trigger new decision if outcome requires reversal

---

## 5. REQUIRED VIEWS

| View | Filter | Purpose |
|---|---|---|
| Pending Reviews | Review Date ≤ Today | Overdue decisions |
| High Quality | Decision Quality = Excellent/Good | Best decisions to learn from |
| Failed Decisions | Decision Quality = Poor, Actual Outcome = Unsuccessful | Worst decisions to analyze |
| Strategic History | Area = Product Strategy, Architecture, Governance | Long-term memory |
| Last 30 Days | Date > 30 days ago | Recent velocity |

---

## 6. DECISION PATTERN DETECTION

Once 20+ decisions are scored, enable pattern analysis:

| Pattern | Detection | Action |
|---|---|---|
| Over-optimism bias | Quality=Poor, Reversible?=No repeatedly | Add external review gate |
| Analysis paralysis | Excellent info quality but slow decisions | Set decision deadlines |
| Gut decisions | Reason = "Intuition/Experience" without data | Add evidence requirement |
| Reversal pattern | Same Area reversed within 90 days | Investigate root cause |

---

## 7. AI READINESS

The upgraded Decisions Log structure enables future AI features:

- **Decision Assistant**: Given context+options, suggest decision with confidence
- **Outcome Predictor**: Based on historical patterns, predict outcome for new decisions
- **Review Bot**: Auto-flag decisions due for review
- **Pattern Miner**: Quarterly analysis of decision patterns by Area

---

## 8. MIGRATION STEPS

1. ADD Decision Quality select field — additive
2. ADD Actual Outcome select field — additive
3. ADD Outcome Description text — additive
4. ADD Review Date date field — additive
5. ADD Review Notes text — additive
6. ADD Product relation → Product Portfolio — additive
7. UPGRADE Related Evidence from text to relation → Proof Library — non-destructive (text remains)
8. UPDATE CEO Dashboard with pending reviews view
9. BACKFILL: Score existing decisions (6+ records, ~20 min)
