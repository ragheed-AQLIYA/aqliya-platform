# PRODUCT PORTFOLIO DECISIONS — AQLIYA CEO Mode

**Date:** 2026-06-17  
**Decisions:** Invest · Maintain · Freeze · Archive

---

## Decision Matrix

| Product / Initiative | Decision | Justification |
|---------------------|----------|---------------|
| **LocalContentOS** | **INVEST** | Fastest KSA revenue; V3.5 workbook/ERP/AI grounding; pilot-readiness dashboard; regulatory urgency |
| **AuditOS** | **MAINTAIN → light INVEST** | L5 pilot-ready moat; protect from regression; pilot support only; do not destabilize |
| **Platform Core** | **INVEST (P0 only)** | Build + security block all revenue; 1 week fix, not quarter refactor |
| **SalesOS** | **FREEZE** | 358 lib files, internal-only, TS debt, no customer path; highest distraction ratio |
| **DecisionOS** | **MAINTAIN** | L4 stable; sell as upsell after anchor; no new modules |
| **WorkflowOS** | **MAINTAIN** | L4→L5 partial; existing customers/internal use; Sunbul = redirect only |
| **Office AI Assistant** | **MAINTAIN** | Shared app, assistive; supports demos; not a lead product |
| **LocalContactOS** | **MAINTAIN** | Thin; internal/gov relationship use later; no GTM |
| **Content Studio** | **FREEZE** | Two implementations; no paying customer signal |
| **Risk submodule (/risk)** | **MAINTAIN** | Audit-adjacent; do not brand as RiskOS |
| **SCIM / SSO** | **MAINTAIN** | Env OAuth works; wire/docs for enterprise later; no SAML sales until built |
| **Local AI (Ollama)** | **MAINTAIN** | Smoke PASS; pilot differentiator with honest operator setup |
| **Skill Evaluation UI** | **FREEZE** | Internal tooling; not customer-facing |
| **Knowledge Foundation corpus** | **ARCHIVE (as product)** | Reference IP; not runtime; stop treating as active initiative |
| **RiskOS (standalone brand)** | **ARCHIVE** | L0; submodule only |
| **AQLIYA Studio** | **ARCHIVE** | L0 strategic |
| **SimulationOS marketing** | **ARCHIVE** | Redirect to products |
| **On-Prem / Air-Gapped** | **ARCHIVE (GTM)** | Strategic narrative only; no sales motion |

---

## AuditOS — MAINTAIN (protect + pilot)

**Why not full INVEST:** Already L5 conditional GO. More features ≠ more pilots. Risk is regression, not missing capability.

**Allowed work:**
- P0 bugfixes blocking pilots
- Operator runbook + demo path
- Export/review/approval stability
- Arabic export quality

**Forbidden:**
- New audit modules
- TB intelligence expansion beyond pilot needs
- Refactors touching engagement core

**Success metric:** ≥1 continuing audit pilot; zero P0 regressions.

---

## LocalContentOS — INVEST (primary)

**Why INVEST:** Saudi Local Content compliance is urgent, budgeted, and poorly served by spreadsheets + consultants. Workbook + ERP + governed AI is a defensible wedge.

**Allowed work:**
- Pilot onboarding via pilot-readiness dashboard
- ERP import reliability (SAP/Oracle/CSV)
- Workbook scoring accuracy with customer TB
- AI advisor as **assistive only** with evidence
- Customer evidence pack for gov/enterprise buyers

**Forbidden:**
- New LC modules outside pilot scope
- L6 production certification claims
- Air-gap packaging

**Success metric:** First paid pilot or LOI within 90 days.

---

## SalesOS — FREEZE

**Why FREEZE:** Largest codebase, zero external customer evidence, internal CRM-lite positioning, v02/_v02 sprawl. Every week here delays KSA revenue.

**Allowed work:**
- TS fixes that block platform build only
- Zero new routes, agents, or vnext features

**Forbidden:** Customer demos, enterprise deck mentions, consolidation until Week 7+ post-green CI.

**Success metric:** 0 commits to `src/lib/sales/vnext/` features for 90 days.

---

## Platform Core — INVEST (bounded)

**Why INVEST:** test-token, build fail, RBAC stub block every deal and due diligence.

**Scope (2–4 weeks max):**
- Remove test-token
- Green build
- MFA login path
- Honest docs + docs/reports/
- CoreAccessControl MVP (deny-default, not full ABAC)

**Forbidden:** Platform rewrite, new shared services, microservices.

---

## Other active initiatives — quick calls

| Initiative | Decision | One line |
|------------|----------|----------|
| CRM sync (Sales) | Freeze | Part of SalesOS freeze |
| ERP sync (LC) | Invest | Core to LC pilot |
| pgvector RAG | Maintain | Gated; use in LC advisor only |
| Terraform/AWS | Maintain | Deploy after build green |
| Marketing site repositioning | Maintain | Platform-first; no false claims |
| Parallel director / multi-agent dev | Freeze | Process noise until pilot signed |

---

## Portfolio rule for next 6 months

**Two products on the market. One platform on life support until green. Everything else frozen or archived.**

Sell: LocalContentOS + AuditOS.  
Become: Governed institutional intelligence for Saudi enterprises — not a product catalog company.
