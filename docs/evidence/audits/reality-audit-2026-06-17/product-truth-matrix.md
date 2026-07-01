# Product Truth Matrix — AQLIYA Deep Reality Audit

**Audit date:** 2026-06-17  
**Method:** Code structure + tests + docs cross-check

---

## Maturity Scale

| Level | Meaning |
|-------|---------|
| L0 | Concept only |
| L1 | Marketing/demo |
| L2 | Shell routes |
| L3 | Prototype with partial persistence |
| L4 | Usable v0.1 — real workflow, RBAC, audit |
| L5 | Pilot-ready — evidence, review, export, seeds, tests |
| L6 | Production-hardened — security, DR, monitoring proven |

---

## Product Matrix

| Product | Docs Claim | Code Reality | Runtime | **Audited Level** | Evidence |
|---------|-----------|--------------|---------|-------------------|----------|
| **AuditOS** | L5 Pilot-ready | 27 routes, 40+ models, seed-audit, 29 test files | UNVERIFIED browser | **L5** | `src/app/audit/`, `prisma/seed-audit.ts` |
| **LocalContentOS** | L4→L5 features | 26 routes, workbook engine, ERP, pilot-readiness | Partial (tests) | **L5 (conditional)** | Build blocked; content dual-backend |
| **DecisionOS** | L4 Usable v0.1 | 22 routes, DecisionEvidence, PDF export | UNVERIFIED | **L4–L5** | Rich `/decisions/*`; thin `/decision/*` gov |
| **WorkflowOS** | L4→L5 partial | 8 routes, dual Sunbul layer, export/review | UNVERIFIED | **L4** | No WorkflowTemplate seed |
| **Office AI** | L4 Usable v0.1 | 7 routes, Prisma tasks, deterministic AI | UNVERIFIED | **L4** | Not in main seed |
| **SalesOS** | L5 criteria met | 30 routes, Prisma CRM, TS errors, duplicate tests | UNVERIFIED | **L4** | Overclaimed vs code health |
| **LocalContactOS** | L4→L5 partial | 5 routes, review/export actions, no seed | UNVERIFIED | **L4 (partial)** | No dedicated tests |
| **RiskOS** | L0 Not implemented | 4 routes `/risk/*`, AuditRisk models | UNVERIFIED | **L3** (submodule) | **Docs FALSE** |
| **Content Studio** | Not in matrix | Two implementations | UNVERIFIED | **L3–L4 split** | Standalone schema gap |
| **SSO/SCIM** | L4 Usable v0.1 | SCIM API works; SSO CRUD not wired to login | UNVERIFIED | **L3–L4** | Env OAuth only for login |
| **auditos demo** | L1 Demo | Public mock routes | UNVERIFIED | **L1** | By design |
| **AQLIYA Studio** | L0 | No routes | N/A | **L0** | Correct |
| **On-Prem/Air-Gap** | L0 Strategic | No package | N/A | **L0** | Correct |

---

## Doc vs Code Divergences

| Product | Documentation | Code Truth | Verdict |
|---------|--------------|------------|---------|
| RiskOS | L0 not implemented | `/risk/*` exists | **FALSE in docs** |
| SalesOS | L5 criteria met | L4 + build/test issues | **Overclaimed** |
| Local AI | L4 pilot | Smoke PASS | **Accurate** |
| Build health | Phase 7 green | 9 TS errors | **FALSE** |
| SSO | L4 with SAML/OIDC UI | Env OAuth only at login | **Overclaimed** |

---

## Governance Evidence by Product

| Product | RBAC | Audit Trail | Review/Approval | Export | Seed |
|---------|------|-------------|-----------------|--------|------|
| AuditOS | ✓ | ✓ | ✓ | ✓ | ✓ |
| LocalContentOS | ✓ | ✓ | ✓ | ✓ | ✓ |
| DecisionOS | ✓ | ✓ | Partial | ✓ | Partial |
| WorkflowOS | ✓ | ✓ | ✓ | ✓ | Minimal |
| Office AI | ✓ | ✓ | ✓ | N/A | Manual |
| SalesOS | ✓ | ✓ | ✓ | Partial | Manual |
| LocalContactOS | ✓ | ✓ | ✓ | ✓ | ✗ |
| RiskOS | ✓ | Partial | ✗ | ✗ | ✗ |

---

## Revenue-Ready Products (Honest Assessment)

| Ready for paid pilot | Conditions |
|---------------------|------------|
| **AuditOS** | YES — with build fix + operator setup |
| **LocalContentOS** | YES — with build fix + ERP config + content backend flag |
| **DecisionOS** | CONDITIONAL — internal/demo ready |
| **SalesOS** | NO — code health + overclaim risk |
| **WorkflowOS** | CONDITIONAL — internal pilot |
| **Office AI** | CONDITIONAL — deterministic only unless AI flags on |

---

**Product portfolio score: 70/100** — Two strong pilot products undermined by build block and doc overclaim on Sales/Risk/SSO.
