# 90-DAY EXECUTION PLAN — AQLIYA Recovery & Scale

**Date:** 2026-06-17  
**Assumption:** Small team (2–4 engineers), limited parallelization  
**Evidence base:** EXECUTIVE_PRIORITIES, REPOSITORY_STRATEGY, PRODUCT_PRIORITIZATION

---

## Program Objectives (Day 90)

| Objective | Success metric |
|-----------|----------------|
| **Shippable platform** | 30+ consecutive days green build on main |
| **Enterprise trust** | 0 critical SEC; honest due diligence pack |
| **Revenue path** | ≥1 LocalContent or AuditOS pilot/LOI signed |
| **Team efficiency** | Sales frozen; single Sales lib tree started |
| **Score** | Overall readiness 58 → **82** |

---

## Week 1 — Unblock Ship (P0)

**Theme:** Security + Build — no feature work

| Objectives | Deliverables | Success metrics | Risks |
|------------|--------------|-----------------|-------|
| Close critical security | test-token removed/gated | SEC-C01 closed | Missed in deploy |
| Green TypeScript | 9 errors fixed | `tsc --noEmit` PASS | Schema migration approval delay |
| Green build | `npm run build` PASS | CI test job PASS | Stale .next |
| Hygiene | Delete 19 `(1)` + 11 `.bak` | 0 duplicate artifacts | Accidental import |

**Daily checklist:**

- Day 1: test-token + SecretEntry + `.next` clean  
- Day 2: platformAuditEvent migration + audit-event-service  
- Day 3: Sales TS type fixes + rebuild  
- Day 4: Fix migration-evidence + retrieval-validation tests  
- Day 5: Full validation → first `docs/reports/YYYY-MM-DD-*.txt`

**Exit gate:** Build PASS · test-token gone · reports committed

---

## Week 2 — Trust Foundation (P0/P1)

**Theme:** Documentation truth + lint scope

| Objectives | Deliverables | Success metrics | Risks |
|------------|--------------|-----------------|-------|
| Honest authority docs | Master ref §6/§9/§16 updated | DC-02–DC-05 closed | Over-correction in marketing |
| Evidence layer | `docs/reports/` + README | DC-17 closed | Reports not regenerated |
| Lint signal | ESLint scoped to `src/` | Measurable error count | Hidden src issues surface |
| Matrix truth | Build status row in Phase table | DC-01 closed | — |

**Exit gate:** Due diligence doc pack defensible · COMMERCIAL_CLAIMS_REGISTER draft

---

## Week 3 — Enterprise Auth MVP (P1)

**Theme:** CoreAccessControl + MFA

| Objectives | Deliverables | Success metrics | Risks |
|------------|--------------|-----------------|-------|
| RBAC MVP | CoreAccessControl deny-default + route matrix | No always-grant | Scope creep to full ABAC |
| MFA E2E | JWT mfaEnabled at login + middleware | MFA gate test PASS | TOTP edge cases |
| SSO guard | ADMIN check on SSO admin CRUD | SEC-M07 closed | — |
| SSO honesty | Document env OAuth vs DB providers | Sales deck aligned | Customer confusion |

**Parallel (product):** LocalContent pilot-readiness review with customer success

**Exit gate:** Security score path to 72+ · MFA demo end-to-end

---

## Week 4 — Pilot Gate (P1/P2)

**Theme:** First deployable pilot environment

| Objectives | Deliverables | Success metrics | Risks |
|------------|--------------|-----------------|-------|
| Staging deploy | Terraform apply + smoke PASS | post-deploy-smoke PASS | AWS state NOT VERIFIED |
| Pilot GO decision | Signed internal GO memo | ENTERPRISE_READINESS pilot tier ✓ | Skipping backup drill |
| AuditOS protect | Zero regressions; smoke audit routes | audit:health PASS | Feature creep |
| LocalContent | Pilot onboarding script from readiness dashboard | Demo repeatable | ERP cred setup |

**Exit gate:** **Pilot GO** — offer controlled pilots

---

## Week 5 — LocalContent Revenue Focus (P2)

**Theme:** Primary investment product

| Objectives | Deliverables | Success metrics | Risks |
|------------|--------------|-----------------|-------|
| Workbook hardening | Bugfix from pilot feedback | 0 P0 LC bugs | Scope expansion |
| ERP path | SAP/Oracle/CSV demo with operator guide | Import pipeline demo | Customer cred delays |
| AI advisor | Governed prompts only; review UI clear | Human review visible | Over-automation perception |
| Evidence pack | `docs/review/localcontent/` customer-ready | LOI meetings scheduled | — |

**SalesOS:** FREEZE — document in matrix  
**Exit gate:** ≥2 qualified pilot conversations active

---

## Week 6 — AuditOS Parallel Pilot (P2)

**Theme:** Protect proof product

| Objectives | Deliverables | Success metrics | Risks |
|------------|--------------|-----------------|-------|
| AuditOS stability | Regression test focus | No new TS errors | Pulling eng to Sales |
| Pilot ops | Operator runbook refresh | Seed + demo path <30 min | — |
| Portfolio/materiality | Demo-safe paths verified | Customer demo PASS | — |
| Backup drill | Restore procedure executed once | Documented result in reports/ | Drill fails |

**Exit gate:** AuditOS + LocalContent both demo-ready same week

---

## Week 7 — Consolidation Start (P3)

**Theme:** Sales lib merge begins

| Objectives | Deliverables | Success metrics | Risks |
|------------|--------------|-----------------|-------|
| Sales import audit | `_v02` → `v02` import map | 100% imports identified | Missed dynamic import |
| Merge PR 1 | Delete `_v02/` | Tests PASS | Regression |
| CI hardening | Add `npm test` to deploy.yml | Test gate on merge | CI time increase |

**Product:** Continue LocalContent pilot conversion  
**Exit gate:** Single v02 tree (pre-rename)

---

## Week 8 — Paid Customer Prep (P2)

**Theme:** Move toward paid tier

| Objectives | Deliverables | Success metrics | Risks |
|------------|--------------|-----------------|-------|
| File scanner decision | Integrate OR remove upload claim | SEC-H05 closed or waived | RFP requirement |
| Commercial contract | Pilot → paid template | Legal review | Over-promising SLA |
| LocalContent LOI | ≥1 signed LOI or pilot agreement | Revenue pipeline | — |
| Test stability | 98%+ suite pass | test report in docs/reports/ | — |

**Exit gate:** **Paid GO** criteria 80% met

---

## Week 9 — Route Consolidation (P3)

**Theme:** DecisionOS redirects

| Objectives | Deliverables | Success metrics | Risks |
|------------|--------------|-----------------|-------|
| Decision redirects | next.config + deprecate `decision/` | No 404 on old links | User bookmarks |
| Risk submodule doc | ROUTE_REGISTRY update | DC-07 closed | — |
| Sales rename | `v02/` → `core/` | Import clean | Large PR |

**Exit gate:** Architecture debt score improving

---

## Week 10 — Enterprise Narrative (P2/P3)

**Theme:** Due diligence ready

| Objectives | Deliverables | Success metrics | Risks |
|------------|--------------|-----------------|-------|
| Investor/buyer pack | Executive summary + claims register + reports | External CTO review ready | Stale data |
| SAML roadmap | Honest timeline or env-OAuth-only stance | No false SAML claims | Lost enterprise deal |
| Redis rate limit | Design + staging implement | SEC-M10 mitigated | Edge runtime limits |
| LocalContent paid | First paid or advanced pilot | Revenue event | — |

**Exit gate:** Enterprise meeting survivable with disclosed gaps

---

## Week 11 — Hardening (P3)

**Theme:** Operational maturity

| Objectives | Deliverables | Success metrics | Risks |
|------------|--------------|-----------------|-------|
| Coverage baseline | jest --coverage first run | Number in reports/ | Low coverage shock |
| AI factory merge | Single provider factory | Duplication reduced | AI regression |
| gov/local AI story | ADR + matrix aligned for KSA | Gov pilot narrative | Air-gap overclaim |
| Documentation owners | All Tier 1 frontmatter | last-reviewed current | — |

**Exit gate:** Maintainability 50 → 65+

---

## Week 12 — Program Close (P3)

**Theme:** Measure, document, next quarter plan

| Objectives | Deliverables | Success metrics | Risks |
|------------|--------------|-----------------|-------|
| 90-day scorecard | Readiness 58 → 82 verification | Dimensions measured | Score inflation |
| CTO retrospective | What worked / what deferred | Team alignment | — |
| Q2 roadmap | Enterprise SAML, gov package, Sales vnext promote | Board-ready | Overcommit |
| CI cadence | Weekly deploy to staging | 4 deploys in month | — |

**Exit gate:** Program complete · Q2 plan approved

---

## Resource Model

| Role | W1–2 | W3–6 | W7–12 |
|------|------|------|-------|
| Platform/security eng | 100% P0/P1 | 50% P1 / 50% support | 60% consolidation |
| Product eng A | 100% P0 support | 100% LocalContent | 80% LC / 20% merge |
| Product eng B | 100% P0 support | 80% AuditOS / 20% LC | 50% AuditOS / 50% merge |
| PM/commercial | Docs truth | Pilot pipeline | LOI + enterprise pack |

---

## Risk Register (Program Level)

| Risk | Mitigation | Trigger |
|------|------------|---------|
| Build regresses | reports/ on every merge | tsc fail |
| Sales merge breaks CI | Feature freeze + dedicated PR | >5 suite fail |
| Doc truth lapses | Weekly status review | DC conflict reopened |
| Pilot scope creep | Single product per pilot | >3 P1 bugs/week |
| Enterprise deal before P1 | Decline or disclose gaps | RFP with SAML mandatory |

---

## Weekly Validation Ritual (Mandatory)

Every Friday:

```bash
npx tsc --noEmit
npm test
npm run build
# optional: npm run smoke:local if staging up
```

Commit outputs to `docs/reports/YYYY-MM-DD-*.txt`  
Update PRODUCT_STATUS_MATRIX if status changed

---

## Program Success Definition

**Day 90 PASS if ALL:**

- [ ] Build green 30+ days  
- [ ] 0 critical security findings  
- [ ] ≥1 LocalContent or AuditOS pilot/LOI  
- [ ] Sales `_v02` eliminated  
- [ ] docs/reports/ has ≥12 weekly snapshots  
- [ ] Overall readiness ≥80 by self-score against forensic rubric
