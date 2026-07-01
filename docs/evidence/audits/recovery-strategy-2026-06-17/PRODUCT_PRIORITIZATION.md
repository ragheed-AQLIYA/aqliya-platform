# PRODUCT PRIORITIZATION — AQLIYA Recovery & Scale

**Date:** 2026-06-17  
**Evidence:** PRODUCT_STATUS_MATRIX, ACTUAL_ARCHITECTURE_MODEL, forensic audit scores

---

## Executive Product Decision

| Decision | Product | Rationale (evidence) |
|----------|---------|----------------------|
| **Invest first** | **LocalContentOS** | Saudi strategic market; V3.5 complete (Phase 11); pilot-readiness dashboard; ERP; 87 lib files + tests |
| **Protect second** | **AuditOS** | L5 pilot-ready; 72 app / 139 lib files; proof product; do not destabilize |
| **Invest parallel (platform)** | **Platform Core** | P0 blockers affect all products — auth, build, audit log |
| **Freeze** | **SalesOS** | 358 lib files but internal-only; TS debt; master ref once said "no backend" — sprawl risk |
| **Maintain only** | DecisionOS, WorkflowOS, Office AI, LocalContactOS | L4 stable; no 90-day expansion |
| **Do not invest** | RiskOS brand, AQLIYA Studio, SimulationOS, On-Prem package | L0 or marketing-only per matrix |

---

## Product Analysis

### AuditOS

| Dimension | Assessment |
|-----------|------------|
| **Maturity** | L5 pilot-ready, conditional GO 2026-05-28 (matrix) |
| **Code depth** | 72 app files, 139 lib files, extensive tests |
| **Revenue speed** | **Fast** — audit firms, existing pilot lineage (Shalfa docs in repo) |
| **Moat** | **High** — full audit lifecycle, governance, evidence, Arabic export |
| **Risk** | Destabilization if team pulled to Sales refactor |
| **90-day role** | **Protect + pilot** — bugfix and ops only |

**Investment:** 25% of product engineering (maintenance + pilot support)  
**Freeze:** New major features until P0 platform green

---

### LocalContentOS

| Dimension | Assessment |
|-----------|------------|
| **Maturity** | L4 usable v0.1; V3.5 AI/RAG/pilot-readiness (2026-06-17) |
| **Code depth** | 42 app, 87 lib, workbook tests, ERP integration |
| **Revenue speed** | **Fastest** — Saudi Local Content compliance market |
| **Moat** | **Highest** — workbook scoring, ERP, grounding, feedback loop, pilot dashboard |
| **Risk** | Build block affects demo; doc says L4 while master says L5 — label only |
| **90-day role** | **Primary growth investment** |

**Investment:** 50% of product engineering after P0  
**Priorities:**

1. Pilot-readiness dashboard → customer onboarding  
2. ERP integration hardening (SAP/Oracle/CSV — operator setup)  
3. Workbook AI advisor — assistive, human review (governance aligned)  
4. Customer evidence pack from `docs/review/localcontent/`

**Do not:** Expand to new LC features until first pilot signed.

---

### SalesOS

| Dimension | Assessment |
|-----------|------------|
| **Maturity** | Matrix: L5 criteria internal; README/master: prototype/L3 |
| **Code depth** | **Largest** — 358 lib files (34% of platform lib) |
| **Revenue speed** | **Slow** — internal CRM-lite, not production CRM (matrix L19) |
| **Moat** | Medium — intelligence layers, CRM sync v0.3 |
| **Risk** | **Highest maintenance** — v02/_v02/vnext, TS errors, duplicate history |
| **90-day role** | **FREEZE expansion** |

**Investment:** 5% — TS fixes only to avoid blocking platform build  
**Explicit freeze:**

- No new vnext features  
- No v02/_v02 merge until Week 7+  
- No customer demos without operator setup disclaimer  
- No sales claims in enterprise deck until internal-only label fixed

**Rationale:** Audit evidence shows real code but **no audited customer path** and **highest consolidation cost**. Revenue faster via AuditOS + LocalContent.

---

### Platform Core

| Dimension | Assessment |
|-----------|------------|
| **Maturity** | L4 per matrix; blocked by build + security |
| **Components** | Auth, platform/, governance/, ai/, scim, secrets |
| **Revenue speed** | Enabler — not sold standalone |
| **Moat** | **High** — shared trust layer for all products |
| **90-day role** | **P0/P1 priority** |

**Investment:** 20% dedicated platform/security engineer  

**Must ship:**

- Green build  
- test-token removal  
- CoreAccessControl MVP  
- MFA login completion  
- docs/reports validation snapshots  
- Honest SSO documentation

---

## Revenue vs Moat Matrix

```
                    HIGH MOAT
                        │
         AuditOS ●      │      ● LocalContentOS
                        │
    LOW REVENUE ────────┼──────── HIGH REVENUE
                        │
         WorkflowOS ●   │   ● SalesOS (internal)
         DecisionOS ●  │
                        │
                    LOW MOAT
```

**Quadrant strategy:**

- **Upper-right (invest):** LocalContentOS  
- **Upper-left (protect):** AuditOS  
- **Lower-right (freeze):** SalesOS  
- **Lower-left (maintain):** WorkflowOS, DecisionOS

---

## Sequenced Product Bets (90 Days)

| Period | Primary | Secondary | Frozen |
|--------|---------|-----------|--------|
| Week 1–2 | Platform P0 | — | All feature work |
| Week 3–6 | LocalContent pilot | AuditOS pilot support | Sales features |
| Week 7–10 | LocalContent paid path | AuditOS stabilization | Sales merge prep |
| Week 11–12 | Enterprise doc pack | Sales v02 merge start | New products |

---

## What NOT to Do (Product)

| Anti-pattern | Why |
|--------------|-----|
| Launch RiskOS as product | Submodule exists; matrix L0 |
| Push SalesOS to enterprise buyers | Internal-only, TS debt |
| Build AQLIYA Studio | L0 strategic |
| Split LocalContent and AuditOS teams before P0 | Shared platform blocked |
| Claim L6 anything | Audit: production-blocked |

---

## Success Metrics by Product (Day 90)

| Product | Metric |
|---------|--------|
| LocalContentOS | ≥1 signed pilot or LOI; pilot-readiness score used in onboarding |
| AuditOS | Zero regression; ≥1 continuing pilot; conditional GO maintained |
| Platform | Build green 30+ days; 0 critical SEC; docs/reports populated |
| SalesOS | 0 new features; TS clean; freeze documented in matrix |
