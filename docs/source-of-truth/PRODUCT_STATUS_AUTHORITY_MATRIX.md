# AQLIYA Product Status Authority Matrix — v1.2

**Purpose:** Single source of truth for product/layer status classification.
**Authority:** Repository reality > Code evidence > Schema > Tests > Documentation > Historical assumptions.
**Date:** 2026-06-03

---

## Status Definitions

| Status | Definition | Policy | Examples |
|--------|------------|--------|----------|
| **Active** | Strategic product. Open development, new features, expansion, commercial positioning allowed. | Full investment. No restrictions beyond standard governance. | AuditOS, LocalContentOS |
| **Active with Caution** | Active development proven, but L5/L6 readiness not established. | Bug fixes, hardening, architecture, governance improvements allowed. Major expansion, new sub-products, new intelligence domains, commercial positioning NOT allowed without roadmap approval. | SalesOS |
| **Internal** | Usable by the team, not customer-facing. Not marketed. | Bug fixes, security patches, hardening allowed. No new features. No commercial positioning. | WorkflowOS, Office AI |
| **Experimental** | Prototype or proof-of-concept. Not reliable for production. | Investigation and prototyping allowed. No production claims. No customer exposure. | Organizations |
| **Frozen** | No development. Exception: critical security fixes only. | Only security patches. No new code. | — (no current matches) |
| **Deprecated** | Being removed. No new development. Migration path required. | Removal planning. Do not invest. | — (no current matches) |
| **Future** | Not implemented. Strategic direction only. | No investment. Document in roadmap only. Do not claim as live. | Air-Gapped, Local AI, Enterprise Hardening, Compliance |

---

## Status Authority Rules

1. **Code evidence overrides all documentation.** If code shows active development, the status must reflect it.
2. **No product may claim a status higher than code+test+docs prove.**
3. **"Active with Caution"** requires documented evidence of active development AND documented gap to L5/L6.
4. **"Future"** products must not have routes, components, or server actions in the codebase.
5. **"Internal"** products must have amber banners or other disclaimers on customer-facing surfaces.
6. **Status changes must update PRODUCT_STATUS_MATRIX.md, ROUTE_STRATEGY.md, and this document.**

---

## Product/Layer Classification

| Layer | Product/System | Status | Current Maturity | Target | Status Evidence |
|-------|---------------|--------|------------------|--------|-----------------|
| L0 | Platform Foundation | **Active** | L5 | L6 | Continuous investment. 19/20 components built. |
| L0.5 | Intelligence Core | **Active** | L4→L5 | L6 | Continuous investment. Costs, evals, router built. |
| L1 | AuditOS | **Active** | L5 | L6 | Primary product. Pilot-ready. Full workflow. |
| L2 | LocalContentOS | **Active** | L5-conditional | L6 | KSA-strategic. Complete v0.1. Scoring depth needed. |
| L3 | DecisionOS | **Active** | L5-conditional | L6 | Real engines. Outcome dashboard gap. |
| L4 | WorkflowOS | **Internal** | L4 | — | Stable. Complete v0.1. Not customer-facing. |
| L5 | Office AI | **Internal** | L4 | — | Shared app. Deterministic-only. Not expanded. |
| L6 | Organizations | **Experimental** | L3 | — | Mock data. Amber banners. Prototype only. |
| L7 | SalesOS | **Active with Caution** | L4 | L6 | See SalesOS Evidence below. |
| L7 | Sunbul | **Deprecated** | Redirect alias | — | permanentRedirect(302) to WorkflowOS. | 
| — | SimulationOS | **Internal** | L1 | — | Capability under DecisionOS. Not standalone. |
| — | LocalContactOS | **Future** | L0 | — | Not implemented. |
| — | RiskOS | **Future** | L0 | — | Not implemented. |
| — | ComplianceOS | **Future** | L0 | — | Not implemented. |
| — | LegalOS | **Future** | L0 | — | Not implemented. |
| — | GovOS | **Future** | L0 | — | Not implemented. |
| — | AQLIYA Studio | **Future** | L0 | — | Not implemented. |
| — | Model Governance | **Future** | L0 | — | Not implemented. |
| — | Institutional Memory | **Future** | L0 | — | Not implemented. |
| L8 | Enterprise Hardening | **Future** | L0 | — | Contract-gated. |
| L9 | Compliance | **Future** | L0 | — | Contract-gated. |
| L10 | Air-Gapped / Local AI | **Future** | L0 | — | Contract-gated. |

---

## SalesOS — ACTIVE_WITH_CAUTION Evidence

### What supports Active
- 100+ files modified (largest change set in triage)
- Entire v02/ deleted (50 files), replaced with vnext
- New contacts module: route, actions, components, types
- 18 error.tsx + loading.tsx boundaries across all SalesOS routes
- PrismaRepository refactored with intelligence snapshots
- Account brief + pilot handoff PDF export parity
- Evidence layer (evidence-links.ts, evidence-resolver.ts)
- Contacts list, CRUD, RBAC, audit trail

### What prevents Active
- Bilingual UX parity incomplete (S7-05)
- No CRM sync (S7-03 — must not claim live)
- L5 criteria **defined** (S7-04) — repository baseline **L5_CONDITIONAL**, not L5_PILOT_READY until all criteria pass (`evaluateSalesL5Acceptance`)
- Not commercial release
- Historical status: L3→L4 (not L5)

### Policy
```text
SalesOS — ACTIVE_WITH_CAUTION

Allowed:
  - Bug fixes
  - Hardening (error/loading/empty states)
  - Architecture improvements (refactors, migration cleanup)
  - Governance improvements (audit, RBAC, tenant checks)

Not allowed (requires roadmap approval):
  - Major expansion (new modules, new routes)
  - New sub-products (forecasting, deal intelligence)
  - New intelligence domains (market intelligence, predictive)
  - Commercial positioning
  - L5 readiness claims

Review cadence:
  - Status reviewed every 2 weeks against code evidence
  - Upgrade to Active if L5 criteria met
  - Downgrade to Internal if no active changes for 4 weeks
```
