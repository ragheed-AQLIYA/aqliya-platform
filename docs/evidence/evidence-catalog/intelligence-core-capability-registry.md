# Intelligence Core — Capability Registry

> **Part of:** Sprint v2 Wave 2 — P1: Product Registry  
> **Date:** 2026-06-29  
> **Rule:** GR-008 (Shared Evidence Canonicalization) — this registry is the **canonical source** for all shared Intelligence Core capabilities

---

## 1. Product Identity

| Field | Value |
|-------|-------|
| PROD-ID | PROD-INTELLIGENCE-CORE |
| Product Name | Intelligence Core (النواة الذكية) |
| Entity Type | Engine |
| KnowledgeArea | KA-20 |
| Authority | AUTH-INTELLIGENCE |
| Routes | ~7 (intelligence, monitoring, operator) |
| Prisma Models | ~9 |
| Current L-Level | L3–L4 |
| L-Level Status | Verified (undisputed) |
| Strategic Intent | Approved |

---

## 2. Canonical Capability Inventory (IC-01)

| Cap-ID | Capability | Description | Owner | Status |
|--------|-----------|-------------|-------|--------|
| CAP-001 | **AI Orchestration** | Orchestrates AI provider calls with governance gating (governed-ai, runGovernedProductAI) | Intelligence Core | Active |
| CAP-002 | **Provider Router** | Routes AI requests to configured providers (Anthropic, OpenRouter) with fallback | Intelligence Core | Active |
| CAP-003 | **Workflow Engine** | Shared workflow state machine — Draft→UnderReview→Approved→Exported | Intelligence Core | Active |
| CAP-004 | **Governance Engine** | Approval gates, escalation, provenance, review rules | Intelligence Core | Active |
| CAP-005 | **Evidence Layer** | Evidence storage, retrieval, linking to outputs (DecisionEvidence, Evidence models) | Intelligence Core | Active |
| CAP-006 | **Audit Layer** | AuditEvent model — captures who, what, when for every mutation | Intelligence Core | Active |
| CAP-007 | **Export Engine** | PDF (pdfkit) and XLSX generation with disclaimers, timestamps, status | Intelligence Core | Active |
| CAP-008 | **Identity / RBAC** | Authentication, role-based access control, organization scoping | Intelligence Core | Active |
| CAP-009 | **Knowledge Layer** | Knowledge versioning, diff tracking, integrity verification (SHA-256) | Intelligence Core | Active |
| CAP-010 | **Runtime Services** | Background job processing, scheduling, retry logic | Intelligence Core | Active |

---

## 3. Capability Ownership & Consumers (IC-02)

| Cap-ID | Capability | Owner | Consumers | Reusable? | Canonical EV |
|--------|-----------|-------|-----------|-----------|--------------|
| CAP-001 | AI Orchestration | Intelligence Core | AuditOS, DecisionOS, WorkflowOS, Office AI, LocalContentOS | ✅ Yes | — (to be created) |
| CAP-002 | Provider Router | Intelligence Core | AuditOS, DecisionOS, Office AI | ✅ Yes | — |
| CAP-003 | Workflow Engine | Intelligence Core | DecisionOS, WorkflowOS, Office AI | ✅ Yes | — |
| CAP-004 | Governance Engine | Intelligence Core | All products | ✅ Yes | — |
| CAP-005 | Evidence Layer | Intelligence Core | AuditOS, DecisionOS, LocalContentOS | ✅ Yes | — |
| CAP-006 | Audit Layer | Intelligence Core | All products | ✅ Yes | EV-0007 (exists — reuse) |
| CAP-007 | Export Engine | Intelligence Core | AuditOS, DecisionOS, WorkflowOS, LocalContentOS | ✅ Yes | EV-0009 (exists — reuse) |
| CAP-008 | Identity / RBAC | Intelligence Core | All products | ✅ Yes | — |
| CAP-009 | Knowledge Layer | Intelligence Core | Knowledge Foundation, Office AI | ✅ Yes | — |
| CAP-010 | Runtime Services | Intelligence Core | All products | ✅ Yes | EV-0034 (exists — reuse) |

---

## 4. Dependency Direction (IC-03)

```text
Intelligence Core (Engine)
    │
    ├──► AuditOS (Product)
    ├──► DecisionOS (Product)
    ├──► WorkflowOS (Workspace)
    ├──► Office AI Assistant (Workspace)
    ├──► LocalContentOS (Product)
    ├──► Knowledge Foundation (Foundation)
    └──► ContentStudio (Workspace)
```

**Rule:** No Intelligence Core claim may reference a downstream product. Core stands independent.

---

## 5. GR-008 Reuse Matrix

| Existing EV | Capability | Wave 1 Used By | Wave 2 Reusable By |
|------------|------------|----------------|---------------------|
| EV-0007 (Audit Layer) | CAP-006 | AuditOS | ✅ DecisionOS, WorkflowOS, Office AI, LocalContentOS |
| EV-0009 (Export Engine) | CAP-007 | AuditOS | ✅ DecisionOS, WorkflowOS, LocalContentOS |
| EV-0034 (Build passing) | CAP-010 | AuditOS, DecisionOS, LocalContentOS | ✅ All Wave 2 products |
| EV-0035 (Freeze v2) | — | All Wave 1 | ✅ All Wave 2 products (reference only) |

**New EV needed for:** CAP-001 (AI Orchestration), CAP-002 (Provider Router), CAP-003 (Workflow Engine), CAP-004 (Governance Engine), CAP-005 (Evidence Layer), CAP-008 (Identity/RBAC), CAP-009 (Knowledge Layer)

---

## 6. Product Registry Update

| Field | Current Value | New Value |
|-------|--------------|-----------|
| Evidence Status | Not Started | **Partial** (capabilities inventoried, EV needed) |
| Manifest Status | Missing | ⬜ Pending P5 |
| Dossier Status | Missing | ⬜ Pending P6 |
| Last Verification | 2026-06-29 | 2026-06-29 (updated) |

---

## References

- Product Registry: `evidence-catalog/product-registry.md`
- GR-008: `docs/governance/aqliya-knowledge-governance-charter-v2.md` §10c
- Sprint v2 Charter: `docs/governance/aqliya-knowledge-governance-charter-v2.md`
