# DOCUMENT TRUTH MODEL — AQLIYA Forensic Audit

**Generated:** 2026-06-17  
**Method:** Opened and read authority documents per Phase 2 protocol  
**Baseline for drift analysis:** This file

---

## Documentation Hierarchy (VERIFIED)

Source: `docs/DOCUMENTATION_AUTHORITY.md` (198 lines, read in full)

| Level | Path | Role |
|------:|------|------|
| 0 | `docs/DOCUMENTATION_AUTHORITY.md` | Conflict-resolution authority |
| 1 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Master reference |
| 2 | `docs/official/*.md` | Doctrine (identity, governance, strategy) |
| 3 | `README.md`, `AGENTS.md`, `docs/README.md` | Entry / agent contract |
| 4 | `docs/source-of-truth/*` | Architecture, routes, product status |
| 5 | `docs/product/*`, `docs/systems/*`, `docs/pilot/*` | Product detail |
| 6 | `docs/reports/*` | Evidence reports |
| 7 | `docs/theoretical-reference/*` | Background only |
| 8 | `docs/archive/*` | Historical only |

**Conflict rule (§5.2):** Implementation status → code + validation evidence wins over stale docs.

**Gap (VERIFIED):** `docs/reports/` is referenced at Level 6 but contains **0 markdown files** (glob `docs/reports/**/*.md`).

---

## Official Architecture (Declared)

Sources opened: `AQLIYA_MASTER_REFERENCE.md` (≥200 lines), `AQLIYA_ARCHITECTURE.md` (159 lines), `PRODUCT_STATUS_MATRIX.md` (77 lines), `ROUTE_REGISTRY.md` (150 lines)

### Platform identity

- **Private Governed Institutional Intelligence Platform**
- Trust principle: *AI assists. Humans decide. Evidence governs.*
- Production domain: **aqliya.com** (master ref §5b, 2026-06-09 migration claim)
- Deployment: Cloud implemented; On-Prem / Air-Gapped strategic only

### Product boundaries (declared maturity)

| Product | Master Reference (§6) | Product Status Matrix |
|---------|----------------------|------------------------|
| AuditOS | L5 pilot-ready | L5 pilot-ready |
| LocalContentOS | L5 with conditions, 12 routes | **L4 Usable v0.1**, V3.5 features |
| DecisionOS | L4 | L4 |
| SalesOS | **L3 — no backend** | **L5 criteria met (internal)** |
| WorkflowOS | L4 | L4 |
| Office AI Assistant | L4 shared app | L4 |
| LocalContactOS | L4, 4 routes | L4 |
| SSO / SCIM | **NOT implemented** (§9) | **L4 Usable v0.1** (2026-06-08) |
| Local AI | **NOT implemented** (§9) | **L4 pilot** + ADR-001 |
| RiskOS | L0 | L0 (matrix); code has `/risk/*` |
| AQLIYA Studio | L0 | L0 |

### Route model (declared)

- `/audit/*` — governed AuditOS workspace
- `/auditos/*` — public demo, mock-only
- `/local-content/*` — LocalContentOS
- `/sales/*` — SalesOS
- `/decisions/*` — DecisionOS
- `/workflowos/*`, `/sunbul/*` redirect — WorkflowOS
- `/contacts/*` — LocalContactOS
- `/settings/sso`, `/api/scim/v2/*` — enterprise auth

### Governance model (declared)

- RBAC via middleware role hierarchy
- Tenant isolation via `organizationId`
- Audit trails on mutations
- Human review before final AI outputs
- Download security: auth → tenant-safe 404 → audit log (`AQLIYA_ARCHITECTURE.md` L135–145)

### Intelligence Core (declared)

`AQLIYA_ARCHITECTURE.md` lists under Core: Orchestrator, RAG, Model Governance, Institutional Memory.

Master Reference §9 marks Model Governance and Institutional Memory as **NOT implemented**.

---

## Intended Architecture (Strategic / ADR)

Source opened: `docs/architecture/ADR-001-AI-RUNTIME-STRATEGY.md` (first 40 lines)

- **Status:** Accepted 2026-06-09
- **Modes:** Cloud / Local (Ollama) / Hybrid
- **Default:** Deterministic handlers; real LLM env-gated

---

## Validation Baseline (Declared)

| Source | Claim | Date |
|--------|-------|------|
| Master Reference §16 | 27 suites, 213 tests, tsc/build/lint pass | 2026-05-28 |
| Product Status Matrix | 138 suites, 1069 tests (SalesOS note) | 2026-06-02 |
| Reality audit `build-audit.md` | 9 TS errors, build FAIL | 2026-06-17 |

**Current build truth:** Prior green-build claims are **stale** per `docs/audits/reality-audit-2026-06-17/build-audit.md` (opened).

---

## Internal Doc Contradictions (Among Opened Authority Docs)

| Topic | Conflict | Resolution per DOCUMENTATION_AUTHORITY |
|-------|----------|--------------------------------------|
| SalesOS level | Master L3 vs Matrix L5 | Code inspection required; matrix likely newer |
| LocalContentOS level | Master L5 vs Matrix L4 | Label mismatch — feature vs maturity |
| SSO / Local AI | Master NOT implemented vs Matrix L4 | Master ref §9 appears stale |
| LocalContactOS | Architecture L75 "future" vs L129 `/contacts` active | Internal architecture doc error |
| Test counts | 213 vs 1069 vs 2515 | Different dates/methods |

---

## Items NOT VERIFIED in This Phase

- Full `ROUTE_STRATEGY.md`, `READINESS_GATES.md`
- All `docs/official/aqliya-*.md` doctrine files beyond master reference
- Live production AWS state
- Browser E2E runtime behavior
