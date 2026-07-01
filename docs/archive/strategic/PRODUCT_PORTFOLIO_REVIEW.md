# AQLIYA Product Portfolio Review

**Classification:** Board Product Decision  
**Date:** 2026-06-19  
**Decision framework:** KILL · FREEZE · MAINTAIN · INVEST · ACCELERATE  
**Evidence:** Product Status Matrix (2026-06-19), Recovery Strategy PRODUCT_PRIORITIZATION, Truth Reconciliation, LocalContent doctrine

---

## Portfolio Decision Summary

| Product / System | Decision | Maturity (evidence) | 12-month engineering share |
|------------------|----------|---------------------|------------------------------|
| **LocalContentOS** | **ACCELERATE** | L5 conditional, 100% internal pilot readiness | **45%** |
| **AuditOS** | **INVEST** (protect + pilot) | L5, Shalfa runbook, factory ≥85% | **30%** |
| **Platform Core** | **INVEST** | L4, build green, auth/governance | **15%** |
| **DecisionOS** | **MAINTAIN** | L5, no new buyer signal | **3%** |
| **WorkflowOS** | **MAINTAIN** | L5, client-specific value | **3%** |
| **Office AI Assistant** | **MAINTAIN** | L5 shared app | **2%** |
| **LocalContactOS** | **MAINTAIN** | L5, relationship upsell | **1%** |
| **Institutional Memory** | **MAINTAIN** | L5 partial, cross-product glue | **1%** |
| **SalesOS** | **FREEZE** | L5 label vs no customer path; 358 lib files sprawl | **0% new features** |
| **RiskOS (standalone brand)** | **FREEZE** | L5 submodule only | **0%** |
| **SimulationOS** | **KILL** (as product) | L1 marketing redirect | **0%** |
| **AQLIYA Studio** | **KILL** | L0, no routes | **0%** |
| **ComplianceOS / LegalOS / GovOS** | **KILL** | L0 concept | **0%** |
| **On-Prem / Air-Gap package** | **KILL** (12 mo) | L0 | **0%** |

---

## Detailed Justifications

### LocalContentOS — ACCELERATE

**Why:** Fastest path to Saudi revenue; highest strategic moat; V3.5 AI quality mission complete (95% acceptance, 88% confidence, 7/7 pilot checks GREEN).

**Evidence:**
- Workbook scoring, ERP connectors (SAP/Oracle/CSV), review center, quality dashboard
- Product doctrine: "Local Content Intelligence Platform"—not certification charade
- Buyer: internal LC manager, procurement, CFO—not auditors or regulators

**Do:** Sign 1–2 paid pilots; ship customer evidence pack; operator onboarding from pilot-readiness dashboard.

**Don't:** Expand to new LC features until first invoice. Don't claim LCGPA certification.

---

### AuditOS — INVEST (Protect + Pilot)

**Why:** Proof product with deepest workflow; Shalfa pilot lineage; TB AI benchmark 87% (n=100); production deploy verified (health 200, smoke 28/30).

**Evidence:** 27 routes, seed-audit, governance tests, commercial pack in `docs/commercial-pack/`.

**Do:** Protect from regression; convert Shalfa-style pilot to paid; factory accuracy as sales proof.

**Don't:** Major new AuditOS features until LocalContent pilot closes. Don't destabilize for SalesOS refactor.

---

### Platform Core — INVEST

**Why:** All products depend on auth, tenant isolation, audit logs, AI governance. P0 security sprint (2026-06-17) closed critical gaps; enterprise ops still incomplete.

**Do:** Staging environment, live restore drill, Redis rate limiter in ECS, pen test scheduling.

**Don't:** New shared abstractions or "Core v2" refactors.

---

### DecisionOS — MAINTAIN

**Why:** L5 with full lifecycle, evidence, PDF export—credible but **no documented paying buyer**. Strong upsell after AuditOS/LCOS land.

**Action:** Bugfix, seed, demo support only. No roadmap expansion.

---

### WorkflowOS — MAINTAIN

**Why:** L5 governed workflows; Sunbul redirect alias; real value for **existing** client relationships—not a new market wedge.

**Action:** SLA, export gates, client support. No generic workflow marketplace.

---

### Office AI Assistant — MAINTAIN

**Why:** L5 shared application demonstrating governed AI (deterministic default, review lifecycle). Supports platform story in demos—not a standalone SKU.

**Action:** Keep assistive positioning; no autonomous actions.

---

### LocalContactOS — MAINTAIN

**Why:** L5 relationship registry with sensitivity levels—useful upsell for institutional buyers already on platform.

**Action:** Maintain tests and seeds; sell only bundled with core land.

---

### Institutional Memory — MAINTAIN

**Why:** L5 cross-product linking (events, collections, graph)—strategic glue, not a standalone purchase driver.

**Action:** Keep graph and export working; no "Institutional Memory product launch."

---

### SalesOS — FREEZE

**Why:** Largest code surface (34% of lib) with **highest maintenance cost** and **no audited customer path**. Matrix says L5; recovery strategy correctly says freeze. Internal CRM-lite, not governed revenue intelligence buyers will pay for yet.

**Evidence:** CRM sync v0.3 exists but requires operator credentials; dashboard had in-memory fallback (partially fixed).

**Action:** Zero new features for 12 months. TS/build hygiene only. Remove from enterprise deck until 1 core product customer exists.

---

### RiskOS (standalone brand) — FREEZE

**Why:** `/risk/*` exists as **AuditOS submodule** with L5 dashboard—marketing as standalone RiskOS would be false.

**Action:** Document as AuditOS capability; kill standalone RiskOS GTM.

---

### SimulationOS — KILL (as product)

**Why:** L1 marketing redirect to `/products`. DecisionOS capability label only.

**Action:** Never sell or build routes. Redirect permanent.

---

### AQLIYA Studio — KILL

**Why:** L0 strategic layer, zero implementation.

**Action:** Remove from roadmaps and investor slides for 12 months.

---

### Future products (ComplianceOS, LegalOS, GovOS, On-Prem, Air-Gap) — KILL (12 mo)

**Why:** L0; would destroy focus and trust if claimed.

**Action:** Strategic slides only with "future" label; zero engineering.

---

## Portfolio Health Diagnosis

**Strength:** 2–3 products at genuine L5 with tests, seeds, governance.  
**Weakness:** 7+ products labeled L5 creates **credibility inflation**.  
**Risk:** SalesOS and product sprawl consume founder attention.  
**Fix:** Public portfolio = **LocalContentOS + AuditOS**. Everything else = "available on platform" after land.

---

## Success Metrics (12 months)

| Product | Target |
|---------|--------|
| LocalContentOS | ≥2 paid pilots or 1 production contract |
| AuditOS | ≥1 paid conversion from pilot (Shalfa-class) |
| SalesOS | 0 new features; documented freeze |
| All others | 0 regressions; no new L5 marketing claims without buyer |

---

*Decision authority: Board product committee. Sync to `PRODUCT_STATUS_MATRIX.md` when commercial labels change.*
