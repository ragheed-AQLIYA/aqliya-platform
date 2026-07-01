# AQLIYA Resource Allocation & ROI Plan

**Classification:** Board CFO / VP Engineering Decision  
**Date:** 2026-06-19  
**Constraints:** 1 founder + 3 engineers · constrained budget · 4 FTE-equivalent engineering capacity

---

## Executive Recommendation

**Allocate 90% of engineering hours to revenue path + trust gates. Freeze all other product expansion.**

Estimated annual engineering capacity: **~6,200 hours** (4 people × 1,550 productive hours/year after overhead).

---

## Hour Allocation (Next 12 Months)

| Bucket | % Hours | Hours | Owner bias |
|--------|--------:|------:|------------|
| **LocalContentOS pilot delivery** | 35% | 2,170 | 1.5 eng |
| **AuditOS protect + convert** | 20% | 1,240 | 0.75 eng |
| **Enterprise ops + security** | 20% | 1,240 | 0.5 eng + founder |
| **Platform core (auth, bugs)** | 10% | 620 | 0.25 eng |
| **Commercial/support tooling** | 5% | 310 | founder |
| **DecisionOS / WorkflowOS maintain** | 5% | 310 | 0.25 eng |
| **SalesOS** | 0% new | 0 | **Frozen** |
| **Buffer / incidents** | 5% | 310 | rotating |

---

## Quarter-by-Quarter Focus

### Q3 2026 (Jul–Sep)

| Focus | Hours | Deliverable |
|-------|------:|-------------|
| Staging DNS + ops checklist | 200 | Commercial gate |
| LC pilot onboarding pack | 400 | 2 pilot SOWs ready |
| LC ERP hardening (CSV path) | 300 | Faster time-to-value |
| AuditOS regression shield | 200 | Zero pilot breakage |
| Pen test vendor engaged | 40 | Contract signed |

### Q4 2026 (Oct–Dec)

| Focus | Hours | Deliverable |
|-------|------:|-------------|
| LC pilot #1 delivery | 600 | First invoice |
| Audit pilot conversion | 400 | LOI → paid |
| Async AI queue | 160 | UX fix |
| Pen test remediation | 200 | InfoSec progress |
| Case study #1 | 80 | Sales asset |

### Q1 2027 (Jan–Mar)

| Focus | Hours | Deliverable |
|-------|------:|-------------|
| LC pilot #2 + reference | 500 | Logo + quote |
| SalesOS merge (start) | 400 | Reduced sprawl |
| SOC2 readiness assessment | 120 | Roadmap |
| Support SLA automation | 160 | CS scalability |

### Q2 2027 (Apr–Jun)

| Focus | Hours | Deliverable |
|-------|------:|-------------|
| Commercial repeatability | 400 | 3 paying customers |
| Load test + Redis verify | 120 | Scale proof |
| DecisionOS upsell (1 deal) | 200 | NRR |
| SalesOS merge (complete) | 300 | Velocity gain |

---

## ROI Estimates (Conservative)

Assumptions:
- LC pilot ACV: SAR 350K (~USD 93K) Year 1
- Audit pilot ACV: SAR 450K (~USD 120K) Year 1
- Conversion rate pilot→paid: 50%
- Engineering loaded cost: SAR 25K/month/FTE (illustrative)

### Scenario A — Base (recommended plan executed)

| Metric | Q4 2026 | Q2 2027 |
|--------|---------|---------|
| Paying customers | 1 | 3 |
| ARR (SAR) | 350K | 1.05M |
| Engineering spend (cumulative SAR) | ~750K | ~1.5M |
| **Gross ROI (ARR / eng spend)** | **0.47×** | **0.70×** |

*Note: Year 1 ROI below 1× is normal for enterprise SaaS; payoff in Year 2 with expansion.*

### Scenario B — LC-only focus (if Audit slips)

| Metric | Q2 2027 |
|--------|---------|
| Paying customers | 2 LC |
| ARR (SAR) | 700K |
| ROI | Lower diversification; higher LC depth |

### Scenario C — Status quo (continued sprawl)

| Metric | Q2 2027 |
|--------|---------|
| Paying customers | 0–1 |
| ARR | <200K |
| ROI | **Negative** — burn without reference |

---

## Highest-ROI Engineering Actions (Ranked)

| Rank | Action | Expected ROI | Hours |
|------|--------|--------------|------:|
| 1 | Close first LC paid pilot | 10–20× on those hours | 600 |
| 2 | Staging + restore drill | Unblocks 2× deal velocity | 200 |
| 3 | AuditOS Shalfa-class proof in sales | 5–10× on audit deals | 400 |
| 4 | Pen test + remediate criticals | 3× enterprise pipeline | 240 |
| 5 | Freeze SalesOS (stop building) | 2× velocity recovery | 0 (saved 800+) |

---

## What NOT to Spend Hours On (12 months)

| Activity | Hours saved | Opportunity cost |
|----------|------------:|------------------|
| SalesOS features | 800+ | 2+ pilots |
| New products (ComplianceOS, Studio) | 1200+ | Company survival |
| Doc reorganization | 200 | Low revenue impact |
| Microservices | 600+ | Zero customer value |
| Perfect lint zero | 100 | Diminishing returns |
| Marketing site redesign | 300 | Use current site |

---

## Founder Time Allocation

| Activity | % Founder time |
|----------|---------------:|
| Customer discovery + pilot close | 40% |
| Enterprise ops + vendor (pen test, legal) | 20% |
| Product prioritization + QA sign-off | 20% |
| Engineering (critical path only) | 15% |
| Investor/board | 5% |

**Rule:** Founder must not be primary engineer on SalesOS or new products.

---

## Hiring Gate (Do Not Hire Until)

- [ ] 2 paying pilots delivered
- [ ] Staging green
- [ ] ARR ≥ SAR 700K or 6 months runway post-close

**First hire:** Customer success / implementation (not another generalist engineer).

---

## Board Score

| Dimension | Score |
|-----------|------:|
| Resource focus clarity | 75 |
| ROI realism | 68 |
| Constraint acknowledgment | 82 |
| **Resource plan score** | **75/100** |

---

*Aligns with PRODUCT_PORTFOLIO_REVIEW.md and EXECUTIVE_PRIORITIES.md recovery strategy.*
