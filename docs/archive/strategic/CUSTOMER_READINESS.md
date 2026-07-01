# AQLIYA Customer Readiness

**Classification:** Board Commercial Gate Assessment  
**Date:** 2026-06-19  
**Question:** Could AQLIYA sign a paying customer today?

---

## Executive Answer

| Customer type | Can sign today? | Verdict |
|---------------|-----------------|---------|
| **Controlled pilot (LOI + SOW, limited scope)** | **Yes** | LocalContentOS or AuditOS with operator disclaimers |
| **Paid production contract (annual, SLA)** | **Conditional** | Possible for friendly buyer; not repeatable at scale |
| **Enterprise procurement (RFP, InfoSec review)** | **No** | Blocked by ops, compliance, and proof gaps |

**Bottom line:** AQLIYA can sign a **pilot customer today** with honest scoping. It cannot sign an **enterprise customer today** without unacceptable trust risk.

---

## Paying Customer Gate Analysis

### What works (ready to demo and pilot)

| Capability | Status | Evidence |
|------------|--------|----------|
| Product workflows | Real, persisted, governed | L5 AuditOS, LCOS; 2462 tests pass |
| Production deployment | Live | `aqliya.com` health 200, smoke 28/30 |
| Arabic / RTL UX | Production-grade in core flows | Product seeds, i18n tests |
| AI assist with human review | Enforced | Deterministic default, review gates |
| Commercial materials | Exist | commercial-pack, demo-storyline, LC doctrine |
| Pilot runbooks | Exist | Shalfa setup, LC pilot readiness 100% |
| Auth + RBAC | Functional | MFA, middleware, deny-by-default CoreAccessControl |

### What fails enterprise buyer diligence

| Gap | Impact |
|-----|--------|
| No external pen test | InfoSec blocker |
| No SOC2 / ISO | Procurement blocker |
| Staging environment broken (DNS ENOTFOUND) | IT validation blocker |
| Live RDS restore drill not executed | Business continuity blocker |
| AWS/Terraform not verified on dev machine | Operator confidence gap |
| ClamAV / Redis rate limiter not proven in prod ECS | Scale/security blocker |
| Documentation historically overclaimed | Trust blocker (partially fixed) |
| No published paying customer logos in repo | Social proof blocker |
| Support / SLA / escalation model not packaged | CS blocker |
| MSA / DPA templates not evidenced in repo | Legal blocker |

---

## Ranked Blockers (Severity × Frequency in enterprise deals)

| Rank | Blocker | Severity | Affects | Fix horizon |
|------|---------|----------|---------|-------------|
| **1** | **No reference paying customer / case study** | Critical | All segments | 60–90 days (deliver pilot) |
| **2** | **Enterprise InfoSec (pen test, SOC2 path)** | Critical | Enterprise, Gov | 90–180 days |
| **3** | **Staging / DR proof** | High | IT buyers | 2–4 weeks (operator) |
| **4** | **Support & SLA packaging** | High | Production contracts | 2–4 weeks (commercial) |
| **5** | **MSA / DPA / data residency clarity** | High | Legal review | 2–4 weeks (legal) |
| **6** | **Commercial truth alignment** | Medium | All (trust) | Ongoing |
| **7** | **SSO at scale (operator setup burden)** | Medium | Enterprise | 30–60 days |
| **8** | **On-Prem / private cloud questions** | Medium | Gov, banks | Deflect honestly (cloud only) |
| **9** | **SalesOS in portfolio confusion** | Medium | Positioning | Immediate (freeze GTM) |
| **10** | **Multi-product demo sprawl** | Low-Medium | Sales efficiency | Immediate (2-product demo) |

---

## Customer Readiness by Product

| Product | Pilot-ready? | Production-ready? | First invoice realistic? |
|---------|--------------|-------------------|--------------------------|
| **LocalContentOS** | **Yes** | Conditional | **Yes — Q3 2026** |
| **AuditOS** | **Yes** | Conditional | **Yes — Q4 2026** |
| **DecisionOS** | Yes (limited) | No | Q1 2027 upsell |
| **WorkflowOS** | Yes (existing clients) | Conditional | Existing relationships only |
| **Office AI** | Demo only | No | Bundled, not standalone |
| **SalesOS** | **No (commercial)** | No | **Do not sell** |

---

## Minimum Package to Sign First Paying Customer

**Week 1–2 (commercial):**
1. Pilot SOW template (scope, exclusions, data handling, 90-day term)
2. Pricing: LC pilot SAR 200K / Audit pilot SAR 250K (validate with founder)
3. One-page "What we do NOT claim" (no LCGPA cert, no audit opinion)

**Week 2–4 (ops):**
4. Staging DNS + smoke green
5. Customer onboarding runbook from pilot-readiness dashboard
6. Named support contact + 4-hour response SLA (business hours)

**Month 2–3 (trust):**
7. First case study (even anonymized)
8. Pen test scheduled (report in progress acceptable for some buyers)

---

## Board Decision

**Authorize pilot contracts immediately** for LocalContentOS and AuditOS with:
- Written exclusions (no certification, no autonomous AI decisions)
- Operator-assisted SSO if needed
- Monthly steering committee with customer

**Do not authorize** enterprise RFP responses until blockers 1–5 are addressed.

---

## Readiness Score

| Dimension | Score |
|-----------|------:|
| Product demo readiness | 82 |
| Pilot SOW readiness | 55 |
| Production SLA readiness | 40 |
| Enterprise procurement readiness | 28 |
| **Weighted customer readiness** | **52/100** |

---

*Evidence: `AQLIYA_CURRENT_STATE.md`, `ENTERPRISE_OPS_CHECKLIST.md`, pilot-readiness-assessment-2026-06-17.md*
