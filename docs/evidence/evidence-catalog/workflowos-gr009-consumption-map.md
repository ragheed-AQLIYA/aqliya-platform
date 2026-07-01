# WorkflowOS — GR-009 Consumption Map

> **Part of:** Sprint v2 Wave 2 — WorkflowOS P1  
> **Date:** 2026-06-29  
> **Role:** First Consumer Product + Validation Product for GR-009

---

## 1. Product Identity

| Field | Value |
|-------|-------|
| PROD-ID | PROD-WORKFLOWOS |
| Product Name | WorkflowOS (نظام سير العمل) |
| Entity Type | Workspace |
| KnowledgeArea | KA-14 |
| Authority | AUTH-WORKFLOW |
| Current L-Level | L4–L5 (Disputed) |
| Strategic Intent | Frozen (DEC-2026-0001) |

---

## 2. GR-009 Capability Consumption

| Capability | IC Canonical EV | WorkflowOS Consumes? | WorkflowOS Claim |
|-----------|----------------|----------------------|------------------|
| CAP-001 AI Orchestration | EV-0038 | ❌ Not needed | — |
| CAP-002 Provider Router | EV-0039 | ❌ Not needed | — |
| CAP-003 Workflow Engine | EV-0040 | ✅ **Reuse** | CLM-WORKFLOW-000X |
| CAP-004 Governance Engine | EV-0041 | ✅ **Reuse** | CLM-WORKFLOW-000X |
| CAP-005 Evidence Layer | EV-0042 | ❌ Not needed | — |
| CAP-006 Audit Layer | EV-0007 | ✅ **Reuse** | CLM-WORKFLOW-000X |
| CAP-007 Export Engine | EV-0009 | ✅ **Reuse** | CLM-WORKFLOW-000X |
| CAP-008 Identity/RBAC | EV-0043 | ✅ **Reuse** | CLM-WORKFLOW-000X |
| CAP-009 Knowledge Layer | EV-0044 | ❌ Not needed | — |
| CAP-010 Runtime Services | EV-0034 | ✅ **Reuse** | CLM-WORKFLOW-000X |

**Consumed: 6 of 10 capabilities | Forecast reuse: 60%**

---

## 3. WorkflowOS-Specific Claims (New EV Needed)

These claims are unique to WorkflowOS and require new evidence:

| Claim | Description | New EV Needed |
|-------|-------------|---------------|
| Route workspace | 11 route files at /workflowos/* | ✅ |
| Domain models | 4 Prisma models (templates, workflows, SLA) | ✅ |
| Template engine | Template-based workflow generation | ✅ |
| Workflow states | Custom WorkflowOS-specific states | ✅ (partial — core states from CAP-003) |
| Seed data | WorkflowOS seed data | ✅ |
| L4–L5 dispute | Maturity contradiction across docs | ⬜ (reuse EV-0032 pattern) |

**New EV needed: ~5 | Total WorkflowOS EV: ~11 (6 reused + 5 new)**

---

## 4. Forecast vs Measurement (WF-G2)

| Metric | Forecast | Actual (after P3) | Variance |
|--------|----------|-------------------|----------|
| Reuse % | 60% | ⬜ | ⬜ |
| Canonical Violations | 0 | ⬜ | — |
| Duplicate Capability EV | 0 | ⬜ | — |
| Consumer Override | 0 | ⬜ | — |

---

## 5. Gates (WF-G1, WF-G2, WF-G3)

| Gate | Check | Status |
|------|-------|--------|
| **WF-G1** | Capability Consumption — all 6 consumed capabilities use canonical EV | ⬜ Pending P3 |
| **WF-G2** | Reuse Accuracy — forecast vs actual measured | ⬜ Pending P3 |
| **WF-G3** | Pattern Compliance — no GR-009 violations | ⬜ Pending P3 |

---

## 6. GR-009 Violation Rules

| Violation | Severity | Example |
|-----------|----------|---------|
| New EV for existing IC capability | **High** | Creating EV-0050 for "Workflow Engine" when EV-0040 exists |
| Overriding canonical EV | **High** | Claim references custom EV instead of EV-0040 |
| Duplicate capability evidence | **Medium** | Two EV for same capability |
| Consumer override | **Medium** | Claim overrides canonical EV without governance decision |

---

## References

- GR-009: `docs/governance/aqliya-knowledge-governance-charter-v2.md` §10d
- Pattern Freeze: `evidence-catalog/intelligence-core-sprint3-package.md` (G12)
- DEC-2026-0015: WorkflowOS Authorization
- IC Canonical EV: `CLAIM_REGISTRY.md` (EV-0038 to EV-0044)
