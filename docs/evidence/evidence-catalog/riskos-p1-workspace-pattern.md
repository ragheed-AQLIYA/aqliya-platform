# RiskOS — P0/P1: Workspace Pattern Validation

> **Part of:** Wave 3 — Workspace Pattern  
> **Date:** 2026-06-29  
> **Goal:** Validate that Workspace-type products work with existing GR-009 to GR-013

---

## 1. Product Identity

| Field | Value |
|-------|-------|
| PROD-ID | PROD-RISKOS |
| Product Name | RiskOS (نظام المخاطر) |
| Entity Type | Workspace |
| KA | KA-17 |
| Authority | AUTH-RISK |
| Current L-Level | L0–L5 (Disputed) |
| Strategic Intent | Frozen |

## 2. Workspace Pattern

RiskOS is a **Workspace** — similar to WorkflowOS. It consumes from IC + IM and has domain-specific objects.

| Aspect | RiskOS | Similar To |
|--------|--------|------------|
| Entity Type | Workspace | WorkflowOS |
| IC Consumption | 6 capabilities | WorkflowOS (6) |
| Domain Objects | Risk, Assessment, Mitigation, Register | WorkflowOS (Templates) |
| Historical Conflict | L0 docs vs L5 code | SalesOS, IM |
| GR-013 Required | ✅ Yes | SalesOS, IM |

## 3. GR-009 Consumption

| Capability | Canonical EV | Consume? |
|-----------|-------------|----------|
| CAP-003 Workflow Engine | EV-0040 | ✅ |
| CAP-004 Governance Engine | EV-0041 | ✅ |
| CAP-006 Audit Layer | EV-0007 | ✅ |
| CAP-007 Export Engine | EV-0009 | ✅ |
| CAP-008 Identity/RBAC | EV-0043 | ✅ |
| CAP-010 Runtime Services | EV-0034 | ✅ |

**Consumed: 6 of 10 | Forecast reuse: ~55%**

## 4. Forecast Claims

| Category | Count | Evidence |
|----------|-------|----------|
| Consumer (GR-009) | 6 | Canonical IC EV |
| Native (Domain) | ~4 | Risk objects, dashboard, reports |
| Historical (GR-013) | ~2 | L0 vs L5, "not implemented" |
| Derived | 1 | Aggregated |
| **Total** | **~13** | |

## References

- Workspace pattern (WorkflowOS): `workflowos-gr009-consumption-map.md`
- Historical: GR-012, GR-013
