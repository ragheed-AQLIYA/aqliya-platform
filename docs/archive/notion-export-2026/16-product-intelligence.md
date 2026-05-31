# Product Intelligence Layer

Status: Design — Upgrade Path
Date: 2026-05-30
Current Product Portfolio maturity: L4

---

## 1. CURRENT STATE AUDIT

Product Portfolio (13 fields) has strong governance but lacks intelligence dimensions.

| Weakness | Impact |
|---|---|
| No market pull assessment | Cannot prioritize products by demand |
| No revenue potential | Cannot forecast commercial value |
| No strategic importance scoring | Cannot allocate resources |
| No resource demand tracking | Cannot plan team capacity |
| No competitive position | Cannot assess market strength |

---

## 2. UPGRADE PATH: PRODUCT PORTFOLIO v2

### Fields to Add (8)

| Field | Type | Purpose |
|---|---|---|
| Market Pull | Select | None, Weak, Moderate, Strong, Proven |
| Revenue Potential | Select | None, <$10K, $10K-$100K, $100K-$1M, $1M+ |
| Strategic Importance | Select | Core, Growth, Experiment, Maintain, Wind Down |
| Resource Demand | Select | Minimal, Low, Medium, High, Critical |
| Competitive Position | Select | Unknown, Lagging, Parity, Leading, Dominant |
| Risk Level | Select | Low, Medium, High, Critical |
| Product Score | Formula (manual) | Weighted composite of all dimensions |
| Evidence Level | Select | None, Internal Demo, Pilot Evidence, Customer Verified, Revenue Verified |

### Remove Duplicate Fields

| Field | Reason |
|---|---|
| Priority | Redundant with Strategic Importance + Risk + Market Pull composite |
| Customer Demo Status | Should move to a safety flag or consolidate with Evidence Level |

### Product Portfolio v2 Full Schema (19 fields)

| Field | Type | Notes |
|---|---|---|
| Product Name | Title | — |
| Product Type | Select | Current |
| Status | Select | Current |
| Maturity Level | Select | Current (L0-L5) |
| Evidence Level | Select | NEW — replaces need for Status Source? |
| Status Source | Select | Current — keep, distinct from Evidence Level |
| Market Pull | Select | NEW |
| Revenue Potential | Select | NEW |
| Strategic Importance | Select | NEW |
| Resource Demand | Select | NEW |
| Competitive Position | Select | NEW |
| Risk Level | Select | NEW |
| Product Score | Text/Formula | NEW |
| Strategic Role | Text | Current |
| Current Version | Text | Current |
| Next Milestone | Text | Current |
| Route / Link | URL | Current |
| Owner | Person | Current |
| Notes | Text | Current |

---

## 3. PRODUCT STRATEGIC SCORE

### Dimensions

| Dimension | Weight | Field |
|---|---|---|
| Market Pull | 25% | Market Pull |
| Revenue Potential | 20% | Revenue Potential |
| Strategic Importance | 25% | Strategic Importance |
| Competitive Position | 15% | Competitive Position |
| Evidence Level | 15% | Evidence Level |

### Scoring (1-5 per dimension)

Calculate Product Strategic Score as weighted average:

- 4.5-5.0: **Star** — Invest heavily, prioritize
- 3.5-4.4: **Growth** — Continue investment
- 2.5-3.4: **Maintain** — Steady state
- 1.5-2.4: **Review** — Consider reducing investment
- <1.5: **Wind Down** — Deprioritize or archive

---

## 4. CURRENT PRODUCT SCORING

| Product | Market Pull | Revenue Potential | Strategic Importance | Competitive Position | Evidence Level | Score |
|---|---|---|---|---|---|---|
| AuditOS | Strong | $100K-$1M | Core | Leading | Customer Verified | ~4.6 / Star |
| DecisionOS | Moderate | $10K-$100K | Core | Parity | Pilot Evidence | ~3.8 / Growth |
| LocalContentOS | Strong | $1M+ | Core | Unknown | Pilot Evidence | ~3.6 / Growth |
| SalesOS | Weak | <$10K | Experiment | Unknown | Internal Demo | ~2.0 / Review |

---

## 5. REQUIRED VIEWS

| View | Filter | Purpose |
|---|---|---|
| Stars | Product Score ≥ 4.5 | Highest priority products |
| Needs Investment | Strategic Importance = Core, Market Pull > Moderate but Evidence Level < Customer Verified | Build evidence for core products |
| Risk Watch | Risk Level = High/Critical | Products needing attention |
| Revenue Map | Revenue Potential not None | Commercial planning |
| Experiment Watch | Strategic Importance = Experiment | Track experimental products |

---

## 6. MIGRATION STEPS

1. ADD Market Pull select field — additive
2. ADD Revenue Potential select field — additive
3. ADD Strategic Importance select field — additive
4. ADD Resource Demand select field — additive
5. ADD Competitive Position select field — additive
6. ADD Risk Level select field — additive
7. ADD Evidence Level select field — additive
8. ADD Product Score text field (manual) — additive
9. EVALUATE: Remove Priority if redundant after scoring
10. SCORE: Initial scoring for all active products (4 products, ~15 min)
11. CREATE CEO Dashboard views
