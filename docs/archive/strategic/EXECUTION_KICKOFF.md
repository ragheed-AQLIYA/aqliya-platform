# Execution Kickoff — Week 1

**Status:** Active  
**Start:** 2026-06-19  
**Source:** Board Memo Final · Q3 2026 Execution Plan  
**Team:** 1 founder + 3 engineers

---

## North Star (90 Days)

**Sign and deliver LocalContentOS Pilot #1** with a named Saudi enterprise.

Secondary: AuditOS conversion conversation · staging green · pen test vendor engaged.

---

## Week 1 Checklist

### Commercial (Founder — Priority 1)

| # | Action | Owner | Done |
|---|--------|-------|:----:|
| C1 | Customize `docs/commercial/PILOT_SOW_TEMPLATE.md` for first LC target | Founder | [ ] |
| C2 | Attach `WHAT_WE_DO_NOT_CLAIM.md` to every outbound deck | Founder | [ ] |
| C3 | Build list of **10 qualified LC accounts** (ICP: SAR 200M+, LC obligation) | Founder | [ ] |
| C4 | Schedule **3 discovery calls** this week | Founder | [ ] |
| C5 | Pull LC pilot runbook: `docs/products/localcontentos-pilot-runbook/` | Founder | [ ] |

### Trust / Ops (CTO + Founder)

| # | Action | Owner | Done |
|---|--------|-------|:----:|
| O1 | Fix **staging DNS** (`staging.aqliya.com`) — operator/AWS | Founder/Ops | [ ] |
| O2 | Run `scripts/post-deploy-smoke.mjs` on staging when live | Engineer | [ ] |
| O3 | Engage **pen test vendor** (RFP or 2 quotes) | Founder | [ ] |
| O4 | Save probe output to `docs/reports/YYYY-MM-DD-*` | Engineer | [ ] |

### Engineering (90% LC + Audit + Ops)

| # | Action | Owner | Done |
|---|--------|-------|:----:|
| E1 | **Freeze SalesOS** — no new features (announce in standup) | All | [ ] |
| E2 | LC: CSV ERP import path smoke for pilot onboarding | Eng 1 | [ ] |
| E3 | Audit: Shalfa demo env always up (`npm run shalfa:setup` doc) | Eng 2 | [ ] |
| E4 | Zero critical prod regressions — monitor smoke | Eng 3 | [ ] |

### Governance

| # | Action | Owner | Done |
|---|--------|-------|:----:|
| G1 | No sprint item without LC/Audit/Ops customer link | CPO/Founder | [ ] |
| G2 | Weekly Friday: pipeline + anti-roadmap violation check | Founder | [ ] |

---

## What NOT to Do This Week

- SalesOS features  
- New product routes  
- Marketing homepage redesign  
- Government RFP  
- On-Prem / Air-Gap sales conversations  

See `ANTI_ROADMAP_2026.md`.

---

## KPI Targets (End Q3 2026)

| KPI | Target |
|-----|--------|
| Signed LC pilot SOWs | 2 |
| Qualified LC pipeline | 10 accounts |
| Staging smoke | GREEN |
| Pen test vendor | Contracted |
| Paying customer | 0 (pilots OK) |

---

## Daily Standup Questions

1. What did we do yesterday for **Pilot #1**?  
2. What blocks a signed SOW?  
3. Did anyone work on a **frozen** product?  

---

## Links

| Doc | Use |
|-----|-----|
| [BOARD_MEMO_FINAL.md](./BOARD_MEMO_FINAL.md) | Decisions |
| [EXECUTION_PLAN_12_MONTHS.md](./EXECUTION_PLAN_12_MONTHS.md) | Quarterly KPIs |
| [WHAT_WE_DO_NOT_CLAIM.md](../commercial/WHAT_WE_DO_NOT_CLAIM.md) | Sales trust |
| [PILOT_SOW_TEMPLATE.md](../commercial/PILOT_SOW_TEMPLATE.md) | Close pilot |
| [AQLIYA_CURRENT_STATE.md](../source-of-truth/AQLIYA_CURRENT_STATE.md) | Technical truth |

---

**يلا — الأسبوع الأول: SOW + 10 حسابات + staging + تجميد SalesOS.**
