# CTO DECISION MEMO — AQLIYA Recovery & Scale

**To:** Board / Investors / Executive Team  
**From:** External CTO (Due Diligence Advisory)  
**Date:** 2026-06-17  
**Re:** 90-Day Recovery Program — Go/No-Go Recommendation  
**Classification:** Confidential — Based on forensic audit evidence only

---

## 1. Current Reality

AQLIYA is **a real platform, not a prototype facade**.

The forensic audit verified a multi-product Next.js monolith with **214 Prisma models**, **234 pages**, **2,515 automated tests** (96.4% pass rate), and substantive implementations of AuditOS, LocalContentOS, DecisionOS, WorkflowOS, and a large SalesOS codebase. Infrastructure-as-code (AWS ECS/RDS/Redis), SCIM API, AI orchestration with governance, and Local AI (Ollama smoke PASS) exist in code.

**However, the platform cannot be deployed to production today.**

Evidence from the same audit:

- **9 TypeScript errors**; `npm run build` **FAIL**
- **`/api/test-token`** exposes JWT session material without authentication
- **`CoreAccessControl`** always returns `granted` — fine-grained RBAC is not enforced
- Documentation claims "build green" from May 2026 are **contradicted by June 2026 execution**

**Overall forensic score: 58/100** — pilot-capable with conditions; production-blocked; enterprise-not-ready.

This is a **stabilization and truth problem**, not a "missing product" problem.

---

## 2. Biggest Risks

| Risk | Severity | Investor implication |
|------|----------|---------------------|
| **Cannot ship** | Critical | CI deploy gate fails; revenue delays |
| **Security theater** | Critical | test-token + RBAC stub fail any enterprise security review |
| **Documentation overclaim** | High | Due diligence discovers status lies within days — trust collapse |
| **SalesOS sprawl** | Medium | 34% of lib code; consolidation deferred but mandatory |
| **Team distraction** | Medium | 1,735 docs and 352 theoretical files create false "cleanup" urgency |

**Not a risk (despite appearance):** Repository size, Prisma model count, multi-product architecture — these reflect intentional platform scope.

---

## 3. Biggest Opportunities

| Opportunity | Evidence | Value |
|-------------|----------|-------|
| **LocalContentOS** | V3.5 workbook, ERP, pilot-readiness dashboard, Saudi domain | Fastest revenue + government narrative |
| **AuditOS** | L5 pilot-ready, full lifecycle, governance moat | Audit firm market proof |
| **Governance + AI design** | Deterministic default, human review, evidence grounding | Enterprise differentiation vs generic AI |
| **Existing test investment** | 243 test files, 96.4% pass | Stabilization cheaper than rewrite |
| **Arabic-first platform** | next-intl, RTL, bilingual exports | KSA institutional fit |

**Moat is not "more AI features."** Moat is **governed institutional workflows with evidence** — the audit confirms this is architecturally intentional.

---

## 4. What Must Happen Immediately (Days 1–14)

**Stop all feature development** until:

1. **Delete `/api/test-token`** — non-negotiable  
2. **Fix 9 TypeScript errors** and achieve green `npm run build`  
3. **Resolve schema drift** (`platformAuditEvent`, `SecretEntry`)  
4. **Delete 30 dead duplicate/backup files** — 2 hours, zero product risk  
5. **Publish honest build status** in PRODUCT_STATUS_MATRIX with evidence in new `docs/reports/`  
6. **Fix 3 stale test fixtures** — restore CI signal

**Estimated effort:** 3–5 engineering days for one senior engineer.

**This is not a quarter of work. It is a week.**

---

## 5. What Should NOT Happen

| Do not | Why |
|--------|-----|
| **Rewrite the platform** | 58/100 with real products — rewrite destroys 2+ years of moat |
| **Mass-delete documentation** | Theoretical/archive corpuses are IP; govern citation instead |
| **Prioritize SalesOS expansion** | 358 lib files, internal-only, highest consolidation cost, slowest revenue |
| **Sell enterprise SAML/SSO today** | SAML stub; DB SSO not wired — procurement will fail |
| **Claim On-Prem / Air-Gapped** | Correctly L0; strategic only |
| **Launch RiskOS or Studio** | L0; distraction |
| **Merge Sales v02/_v02 in Week 1** | High regression before green CI |
| **Optimize ESLint to zero repo-wide before scoping** | 33K count is config noise |

**The worst mistake:** Treating documentation volume or Sales file count as reason to "start fresh."

---

## 6. Final Recommendation

### Verdict: **CONDITIONAL GO — Execute 90-Day Recovery Program**

**Invest in AQLIYA as a platform company** with two revenue engines:

1. **LocalContentOS** (primary growth — Saudi market, workbook + ERP + governed AI)  
2. **AuditOS** (protect and pilot — proof product, audit firms)

**Freeze SalesOS** feature work until Week 7 consolidation.

**Sequence:**

```
Week 1–2:  Security + Build (B+C hybrid)
Week 2–4:  Documentation truth + MFA/RBAC MVP
Week 3–10: LocalContent + AuditOS pilots
Week 7–12: Sales architecture consolidation
```

**Resource ask:** 2–4 engineers for 90 days, biased 50% LocalContent, 25% platform/security, 25% AuditOS maintenance.

**Financial framing:** This is a **~6–10 week hardening program** (audit estimate), not a rebuild. Cost of delay exceeds cost of stabilization.

### Target outcomes (Day 90)

| Metric | Now | Target |
|--------|----:|-------:|
| Overall readiness | 58 | 82 |
| Deploy | Blocked | Weekly staging |
| Critical security | 2 open | 0 |
| Pilots | Unknown | ≥1 LOI signed |
| Doc trust | Conflicted | Evidence-linked |

### Board decision requested

**Approve:**

- [ ] 90-day recovery program per `90_DAY_EXECUTION_PLAN.md`  
- [ ] Feature freeze until build green (Week 1–2)  
- [ ] SalesOS expansion freeze (Week 3–6)  
- [ ] Commercial claims limited to `COMMERCIAL_CLAIMS_REGISTER`  
- [ ] No enterprise SSO sales until P1 complete or honestly disclosed

**Decline if unwilling to:**

- Remove test-token immediately  
- Publish honest build failure status externally  
- Prioritize LocalContent + AuditOS over Sales expansion

---

## Closing Statement

AQLIYA has **already built** what many startups merely document: a governed multi-product institutional platform with real tests, real data models, and real workflows.

The company does **not** need a new architecture. It needs **one week of ship discipline**, **one month of security and truth**, and **one quarter of focused pilot execution** on LocalContentOS and AuditOS.

That path converts a 58/100 forensic score into an **investable, enterprise-pilotable** platform at ~82/100 — without throwing away the moat.

---

**Supporting documents:** `docs/audits/recovery-strategy-2026-06-17/`  
**Audit evidence:** `docs/audits/forensic-audit-2026-06-17/`
