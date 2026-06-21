# AQLIYA Execution Risk Register

**Classification:** Board Risk Committee  
**Date:** 2026-06-19  
**Method:** Severity × Likelihood × Existential impact  
**Evidence:** Recovery strategy, Truth Reconciliation, PRODUCT_PRIORITIZATION, forensic audit

---

## Top 10 Risks to Company Success

| Rank | Risk ID | Category | Risk | Severity | Likelihood | Mitigation |
|------|---------|----------|------|:--------:|:----------:|------------|
| **1** | R-01 | **Focus** | Portfolio sprawl (7+ L5 products) prevents any product from winning reference customers | **Critical** | **High** | ACCELERATE LCOS + INVEST AuditOS only; FREEZE SalesOS; kill new products |
| **2** | R-02 | **Commercial** | No paying customer logos → sales cycle stalls | **Critical** | **High** | Sign 2 pilots in Q3–Q4 2026; case study mandate |
| **3** | R-03 | **Trust** | Historical doc overclaims damaged buyer/investor confidence | **High** | **Medium** | AQLIYA_CURRENT_STATE as SSOT; honest pilot SOW exclusions |
| **4** | R-04 | **Execution** | Founder-as-engineer bottleneck on critical path | **High** | **High** | Founder 40% sales; engineers on LC/Audit only |
| **5** | R-05 | **Product** | LocalContent sold as certification tool → legal/reputation failure | **High** | **Medium** | Enforce LC doctrine disclaimers in every contract |
| **6** | R-06 | **Enterprise** | InfoSec blockers (no pen test, no SOC2) lose enterprise deals | **High** | **High** | Schedule pen test Q3; SOC2 assessment Q1 2027 |
| **7** | R-07 | **Operations** | Staging broken + no live DR proof → IT rejection | **High** | **Medium** | ENTERPRISE_OPS_CHECKLIST Week 1–2 |
| **8** | R-08 | **Technical** | SalesOS sprawl regresses platform build | **Medium** | **Medium** | Absolute feature freeze; merge in Q1 2027 |
| **9** | R-09 | **Market** | Global AI platforms (Copilot, Joule) commoditize "AI assistant" story | **Medium** | **High** | Sell governance + evidence + domain workflow, not AI |
| **10** | R-10 | **Financial** | Burn rate exceeds pilot revenue before product-market fit | **Medium** | **Medium** | 90% eng on revenue path; no hires until 2 pilots paid |

---

## Risk Detail

### R-01 — Focus Risk (Existential)

**Scenario:** Team continues elevating SalesOS, RiskOS, Institutional Memory, and new SKUs while zero paying customers accumulate.

**Impact:** Company becomes " impressive demo platform" with no revenue — uninvestable.

**Trigger indicators:** Any sprint without LC or Audit deliverable tied to pilot customer.

**Owner:** CEO / CPO  
**Review:** Weekly board standup

---

### R-02 — Commercial Risk (Existential)

**Scenario:** 6 months pass with demos but no signed SOW.

**Impact:** Runway exhaustion; talent loss; investor pass.

**Trigger:** Zero LOIs by end Q3 2026.

**Owner:** CEO / Sales Director (founder)  
**Mitigation:** 10 qualified LC accounts; 5 audit firms; pilot SOW template ready.

---

### R-03 — Trust Risk

**Scenario:** Buyer discovers gap between pitch and reality (SSO, On-Prem, L5 breadth).

**Impact:** Deal loss; reputational damage in small Saudi market.

**Mitigation:** "What we do NOT claim" one-pager; PRODUCT_STATUS_MATRIX honest labels.

---

### R-04 — Founder Risk

**Scenario:** Founder builds features instead of closing pilots.

**Impact:** Engineering output without revenue conversion.

**Mitigation:** Founder KPI = signed pilots, not commits.

---

### R-05 — Product / Legal Risk

**Scenario:** Customer interprets LocalContentOS score as official LCGPA submission.

**Impact:** Regulatory backlash; contract dispute.

**Mitigation:** Export disclaimers in product + contract; training in onboarding.

---

### R-06 — Enterprise Risk

**Scenario:** Enterprise buyer requires pen test + SOC2; AQLIYA has neither.

**Impact:** Disqualified from RFP; relegated to SMB only.

**Mitigation:** Pen test Q3 2026; SOC2 roadmap slide with dates.

---

### R-07 — Operations Risk

**Scenario:** Production incident; cannot demonstrate staging parity or restore.

**Impact:** Pilot termination; no expansion revenue.

**Mitigation:** Staging DNS fix; restore drill on staging RDS.

---

### R-08 — Technical Debt Risk

**Scenario:** SalesOS TS/build issues block platform CI during consolidation.

**Impact:** Deploy freeze; customer-facing outage risk.

**Mitigation:** Freeze + isolate; no Sales imports in critical path.

---

### R-09 — Competitive Risk

**Scenario:** Buyer chooses Microsoft Copilot + Excel for LC tracking.

**Impact:** Lost deals on "good enough" AI narrative.

**Mitigation:** Win on evidence workflow, Arabic UX, audit trail, ERP import — not AI chat.

---

### R-10 — Financial Risk

**Scenario:** 4 engineers build platform; SAR 0 ARR at month 12.

**Impact:** Bridge round on weak terms or shutdown.

**Mitigation:** RESOURCE_AND_ROI_PLAN hour caps; hiring gate.

---

## Risk Heat Map

```
IMPACT →
        Low      Medium     High      Critical
L High    R-09     R-08      R-06      R-01, R-02
i Med              R-10      R-04      R-05
k Low                        R-07      R-03
```

---

## Monitoring Cadence

| Cadence | Review |
|---------|--------|
| Weekly | R-01, R-02, R-04 (focus + commercial + founder) |
| Bi-weekly | R-06, R-07 (enterprise ops) |
| Monthly | Full register + score update |
| Quarterly | Board risk re-rank |

---

## Risk Appetite Statement

**Accept:** Pilot-ready gaps with written exclusions; single-region cloud; deterministic AI default.

**Do not accept:** New product launches without customer; enterprise claims without pen test path; certification language in LC exports.

---

*Cross-reference: `docs/audits/TECHNICAL_RISK_REGISTER.md` (engineering detail)*
