# ENTERPRISE READINESS PLAN — AQLIYA Recovery & Scale

**Date:** 2026-06-17  
**Evidence:** Forensic audit scores (overall 58/100), security-audit, build-audit, PRODUCT_STATUS_MATRIX

---

## Readiness Tiers Defined

| Tier | Buyer | Minimum bar |
|------|-------|-------------|
| **Pilot** | Design partner, LOI, controlled data | Auth, tenant isolation, audit trail, honest docs, deployable build |
| **Paid** | Commercial contract, SLAs | Green CI, MFA, RBAC enforced, backup/restore tested, support runbook |
| **Enterprise** | Procurement, SOC-style questionnaire | SSO/SAML, SCIM multi-org, file scanning, rate limits, RBAC matrix |
| **Government** | KSA institutional / regulated | All enterprise + data residency narrative, local AI option, Arabic-first ops, evidence governance |

---

## Current State (Audit Evidence)

| Dimension | Score | Pilot | Paid | Enterprise | Government |
|-----------|------:|:-----:|:----:|:----------:|:----------:|
| Architecture | 68 | ✓ | ✓ | ~ | ~ |
| Deployment | 45 | ✗ | ✗ | ✗ | ✗ |
| Security | 58 | ~ | ✗ | ✗ | ✗ |
| Documentation | 52 | ~ | ✗ | ✗ | ✗ |
| Testing | 72 | ✓ | ~ | ~ | ~ |
| Governance | 65 | ✓ | ~ | ✗ | ~ |
| **Overall** | **58** | **Conditional** | **No** | **No** | **No** |

**Legend:** ✓ ready · ~ conditional · ✗ blocked

---

## Tier 1: Pilot Customers

### Current state

**Can support today (with conditions):**

- AuditOS L5 pilot-ready — 27 routes, governance tests, seed data (PRODUCT_STATUS_MATRIX)
- LocalContentOS L4 — workbook, ERP, pilot-readiness dashboard, 265 LC tests cited
- Tenant isolation + product guards — VERIFIED (architecture-reality)
- Arabic-first / RTL — next-intl, i18n tests exist
- Local AI smoke PASS — Ollama qwen3:8b (test-reality-report)

**Blocked even for pilot:**

- Production deploy — build FAIL (build-audit)
- JWT debug endpoint — critical (SECURITY_AUDIT)
- Documentation overclaims — due diligence risk (DC-01–DC-07)

### Target state (30 days)

| Requirement | Target |
|-------------|--------|
| Build | Green `tsc` + `npm run build` |
| Security P0 | test-token removed; MFA login wired |
| Docs | Master ref aligned; build status honest |
| Ops | Post-deploy smoke PASS on staging |
| Pilot pack | AuditOS + LocalContent runbooks current |

### Gap

| Gap | Days to close |
|-----|---------------|
| 9 TS errors | 1–2 |
| Critical SEC | 1 |
| Doc truth pack | 2–3 |
| Staging deploy proof | 2–3 |

### Recommended path

1. **Week 1–2:** P0 from EXECUTIVE_PRIORITIES  
2. **Week 3–4:** Pilot-specific: LocalContent + AuditOS operator runbooks, signed claims matrix  
3. **Offer:** "Controlled pilot" only — not production SLA  
4. **Lead product:** LocalContentOS (Saudi) + AuditOS (audit firms)

---

## Tier 2: Paid Customers

### Current state

**Not ready.** Missing:

- Green deploy cadence (deployment score 45)
- Enforced fine-grained RBAC (CoreAccessControl stub)
- End-to-end MFA (partial)
- Backup restore routinely tested (devops-audit — scripts exist, restore NOT VERIFIED)
- Commercial SLA infrastructure

### Target state (60 days)

| Requirement | Target |
|-------------|--------|
| CI | tsc + test + build on every merge |
| Auth | MFA + coarse RBAC verified |
| RBAC | CoreAccessControl minimum viable matrix |
| Ops | Backup restore drill documented PASS |
| Support | production-deployment-runbook current |
| Contracts | Claims matrix — no SAML/air-gap unless built |

### Gap

| Gap | Effort |
|-----|--------|
| CoreAccessControl | 1–2 weeks |
| MFA complete | 2–4 hours + QA |
| File scanner or claim removal | 1–2 weeks |
| CI test gate | 2–3 days |

### Recommended path

1. Complete P0 + P1  
2. Add `npm test` to deploy gate (currently deploy.yml opens with tsc only)  
3. First paid customer on **single product** (AuditOS or LocalContent) — not platform-wide SLA  
4. Price for operator-assisted setup (SSO keys, ERP creds per matrix)

---

## Tier 3: Enterprise Customers

### Current state

**Not ready.** Audit gaps:

| Enterprise ask | Status | Evidence |
|----------------|--------|----------|
| SAML SSO | STUB | SEC-M03 |
| SCIM multi-tenant | Single-org default | architecture-reality |
| Fine-grained RBAC | Stub | access-control.ts |
| Virus scanning | Pass-through | SEC-H05 |
| SIEM | Route exists; integration NOT VERIFIED | inventory-report |
| Pen test clean | test-token would fail | SEC-C01 |
| SOC2 / ISO | NOT VERIFIED in repo | — |

### Target state (90+ days)

| Requirement | Target |
|-------------|--------|
| SSO | SAML OIDC production path OR honest "env OAuth only" |
| SCIM | Multi-org provisioning design |
| RBAC | Permission matrix enforced server-side |
| Upload security | Scanner or explicit waiver in contract |
| Edge security | Redis rate limit or ALB WAF |
| Evidence pack | `docs/reports/` with validation snapshots |

### Gap

~6–10 weeks focused security + identity program (EXECUTIVE_SUMMARY estimate)

### Recommended path

1. **Do not sell enterprise SSO** until DB providers wired or SAML implemented  
2. **Lead with:** governance, audit trail, tenant isolation, Arabic-first — these are real  
3. **Parallel track:** SAML + file scanner for RFP queue  
4. **Use SCIM** as internal IT provisioning demo — disclose single-org limit

---

## Tier 4: Government Customers (KSA)

### Current state

**Strongest fit:** LocalContentOS — Saudi LC domain, bilingual, ERP integration, pilot-readiness dashboard (PRODUCT_STATUS_MATRIX Phase 11).

**Weakest fit:** Air-gapped / On-Prem — correctly L0 (matrix L30–31).

**Partial fit:** Local AI — Ollama smoke PASS, ADR-001 Accepted, but not packaged for air-gap.

### Target state (90 days — narrative + pilot)

| Requirement | Target |
|-------------|--------|
| Product | LocalContentOS pilot on cloud with data residency story |
| AI | Hybrid/local mode documented; no false air-gap claim |
| Governance | Evidence grounding V3.5 — real differentiator |
| Ops | KSA-relevant runbook + Arabic operator docs |
| Security | P0/P1 complete |

### Gap

| Gap | Notes |
|-----|-------|
| Air-gapped package | Strategic — do not promise in 90 days |
| Data residency proof | AWS me-south-1 in CLAUDE.md — live state NOT VERIFIED |
| Gov procurement docs | Build from honest claims matrix |

### Recommended path

1. **Lead product:** LocalContentOS government pilot (LC workbook + ERP + evidence)  
2. **Position:** "Governed institutional intelligence on cloud with local AI option" — not On-Prem  
3. **Pair with:** AuditOS for audit-adjacent gov entities separately  
4. **Avoid:** Selling platform-wide until build + security P0 closed

---

## Readiness Score Targets (90 Days)

| Dimension | Now | 30d | 60d | 90d |
|-----------|----:|----:|----:|----:|
| Deployment | 45 | 75 | 82 | 85 |
| Security | 58 | 72 | 80 | 85 |
| Documentation | 52 | 70 | 78 | 82 |
| Governance | 65 | 75 | 82 | 88 |
| **Overall** | **58** | **68** | **76** | **82** |

**90-day overall 82** = Paid-ready on lead products · Enterprise-pilotable with disclosed gaps · Not full gov air-gap.

---

## Go / No-Go Gates

| Gate | Criteria | When |
|------|----------|------|
| **Pilot GO** | Build green + test-token gone + honest docs | Day 14 |
| **Paid GO** | MFA + RBAC MVP + backup drill | Day 45 |
| **Enterprise GO** | SAML or honest SSO doc + scanner plan | Day 90+ |
| **Government GO** | LocalContent pilot PASS + security P1 | Day 30 pilot / Day 60 paid |
