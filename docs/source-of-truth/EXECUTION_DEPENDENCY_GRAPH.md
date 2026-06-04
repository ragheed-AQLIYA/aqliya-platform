# AQLIYA Execution Dependency Graph v1.2

**Purpose:** Master dependency graph, critical path identification, and execution sequencing.
**Date:** 2026-06-03
**Principle:** Sequential where required, parallel where possible.

---

## 1. Architecture Dependency Chain

```
L0 (Platform Foundation)
 ├─ L0.5 (Intelligence Core)
 ├─ L1 (AuditOS)
 ├─ L2 (LocalContentOS)
 ├─ L3 (DecisionOS)
 ├─ L4 (WorkflowOS)           [Internal — frozen]
 ├─ L5 (Office AI)            [Internal — frozen]
 ├─ L6 (Organizations)        [Experimental — frozen]
 ├─ L7 (SalesOS)              [Active with Caution]
 ├─ L8 (Enterprise Hardening)
 ├─ L9 (Compliance)
 └─ L10 (Air-Gapped/Local AI)
```

**Key constraint:** L0 must be at L5 before any upper layer can reach L6.
**Status:** L0 is at L5 → gate is open for L0.5, L1, L2, L3, L7 L6 work.

---

## 2. Layer-to-Layer Dependency Table

| Consumer | Depends On | Dependency Strength | Notes |
|----------|-----------|-------------------|-------|
| L0.5 | L0 | **Hard** | Auth, tenant, queue, secrets required for AI engine |
| L1 (AuditOS) | L0 | **Hard** | Auth, tenant, storage, feature flags |
| L1 (AuditOS) | L0.5 | Medium | AI review only — non-blocking for non-AI features |
| L2 (LocalContentOS) | L0 | **Hard** | Auth, tenant, storage, feature flags |
| L2 (LocalContentOS) | L0.5 | Medium | AI scoring only — non-blocking for core CRUD |
| L3 (DecisionOS) | L0 | **Hard** | Auth, tenant |
| L3 (DecisionOS) | L0.5 | Low | AI recommendations — optional |
| L7 (SalesOS) | L0 | **Hard** | Auth, tenant, storage |
| L7 (SalesOS) | L0.5 | Medium | Intelligence engine — blocks L5 level |
| L4 (WorkflowOS) | L0 | **Hard** | Auth, tenant |
| L5 (Office AI) | L0 | **Hard** | Auth, tenant |
| L5 (Office AI) | L0.5 | Medium | AI path — frozen, not active |
| L6 (Organizations) | L0 | **Hard** | Auth, tenant |
| L8 (Enterprise) | L0, L0.5, L1-7 | **Hard** | All — contract-gated |
| L9 (Compliance) | L8 | **Hard** | Sequential — contract-gated |
| L10 (Air-Gapped) | L8, L9 | **Hard** | Sequential — contract-gated |

**Rule:** Hard dependencies must be complete before consumer can reach L6. Medium dependencies block specific features but not the product.

---

## 3. L6 Critical Gaps Dependency Graph

```
L0-04 Pentest ← requires ← all security fixes applied first

L0-01 IaC → L0-02 HA/DR → L0-03 Scheduled Backup
                ↓
          E8-03 DR/HA Architecture

IC-01 RAG → requires → IC-04 CI Eval Gate (for regression safety)
                ↓
          A1-02 Sampling engine (uses RAG for docs)
          LC-02 Tender matching (uses RAG)
          IC-02 Active LLM wiring

IC-02 Active LLM ← blocked by ← IC-06 Budget alerts
                ← blocked by ← IC-04 CI Eval Gate
                ↓
          A1-09 AuditOS AI review (real LLM)
          All AI-powered features

IC-09 Provider hardening ← parallel with ← IC-02 Active LLM

L0-07 Cross-tenant isolation tests ← separate from ← all product work
     (parallel-safe)

L0-11 Role-based MFA ← independent ← any product
     (parallel-safe)
```

**Key insight:** IC-01 (RAG) and IC-02 (Active LLM) are the two largest blockers across all products. They block AI-dependent features in L1, L2, L3, and L7 simultaneously.

---

## 4. Product L6 Dependency Graph

### L1 — AuditOS L6

```
L0-07 Isolation tests ──────────┐ (parallel)
L0-11 Role-based MFA ───────────┤ (parallel)
IC-01 RAG ──────────────────────┤ (parallel, optional for non-AI)
IC-02 Active LLM ───────────────┤ (parallel)
A1-09 AuditOS LLM wiring ◄──────┘
                                 ↓
A1-01 Loading boundaries ───────┐ (parallel with each other)
A1-04 Multi-period rollforward ─┤
A1-05 Evidence versioning ──────┤
A1-06 Arabic PDF font ──────────┤
A1-02 Sampling engine ◄─────────┘ (depends on RAG)
A1-03 Materiality depth ───────────────── (parallel with A1-02)
A1-08 Full sign-off chain ─────────────── (parallel)
A1-10 Engagement archival ─────────────── (parallel)
```

**Critical path:** IC-01 → A1-02 → L1 L6 certification

### L2 — LocalContentOS L6

```
L0-07 Isolation tests ──────────┐ (parallel)
L0-11 Role-based MFA ───────────┤ (parallel)
IC-01 RAG ──────────────────────┤ (parallel)
LC-02 Tender matching ◄─────────┘
LC-01 Supplier scoring ─────────┐ (parallel with LC-02)
LC-03 Multi-reviewer routing ───┤
LC-04 Classification admin ─────┤
LC-05 Arabic PDF font ──────────┤
LC-06 Spend analytics ──────────┤
LC-07 Localization trends ──────┘
```

**Critical path:** IC-01 → LC-02 → L2 L6 certification

### L3 — DecisionOS L6

```
L0-07 Isolation tests ──────────┐ (parallel)
L0-11 Role-based MFA ───────────┤ (parallel)
                                 ↓
D3-01 Outcome dashboard ◄───────┤
D3-02 Monitoring signals ───────┤ (parallel)
D3-03 Sector intelligence ──────┤
D3-04 Cross-decision patterns ──┤
D3-05 Decision portfolio view ──┤
D3-06 Outcome correlation ──────┘
```

**Critical path:** D3-01 → D3-06 → L3 L6 certification

### L7 — SalesOS L6

```
L0-07 Isolation tests ──────────┐ (parallel)
L0-11 Role-based MFA ───────────┤ (parallel)
IC-02 Active LLM ───────────────┤ (parallel)
                                 ↓
S7-01 Intelligence tab complet'n ┐
S7-02 Forecasting engine ────────┤ (parallel-safe)
S7-05 Bilingual UX parity ───────┤
S7-06 Funnel analytics ──────────┤
S7-04 L5 acceptance criteria ◄───┘ (must pass first)
                                 ↓
S7-07 Pipeline depth ────────────┐
S7-08 ICP admin UI ─────────────┤
S7-03 CRM sync ─────────────────┘ (largest effort)
```

**Critical path:** S7-04 → S7-01 → S7-02 → L7 L6 certification

---

## 5. Master Critical Path

The single longest chain of dependent work items:

```
L0-04 Pentest (external gate — parallel to all code work)
    │
L0-01 IaC ───────────────────────────────────────────┐
    ↓                                                  │
L0-02 HA/DR architecture ────────────────────────────┤
    ↓                                                  │
L0-03 Scheduled backup automation ───────────────────┤
    ↓                                                  │
IC-04 CI Eval Gate ──────────────────────────────────┤
    ↓                                                  │
IC-06 Budget alerts ─────────────────────────────────┤ (foundation work)
    ↓                                                  │
IC-02 Active LLM wiring ─────────────────────────────┤
    ↓                                                  │
IC-01 RAG/pgvector + embeddings pipeline ────────────┤
    ↓                                                  │
    ├──→ A1-02 Sampling engine (AuditOS) ◄────────────┘
    ├──→ LC-02 Tender matching (LocalContentOS)        
    ├──→ A1-09 AuditOS AI review wiring
    ↓
    ├──→ D3-01 Outcome dashboard
    ├──→ S7-01 Intelligence tabs (SalesOS)
    ↓
    └──→ Per-product L6 certification
```

**Total estimated critical path:** 4-6 months (IaC → RAG → product-level AI features → L6 certification)

---

## 6. Parallel Work Streams

### Stream A — Security Hardening (parallel-safe, no start dependency)
```
L0-11 Role-based MFA enforcement
L0-07 Cross-tenant isolation test suite
Rate limiter integration tests
```

### Stream B — Foundation Automation (sequential within stream)
```
L0-01 IaC → L0-02 HA/DR → L0-03 Backup automation → E8-03 DR/HA
```

### Stream C — AI Readiness (sequential within stream)
```
IC-04 Eval Gate → IC-06 Budget Alerts → IC-02 Active LLM → IC-01 RAG
```

### Stream D — Product UX (parallel within stream, deps on Stream C for AI features)
```
A1-01 Loading boundaries
A1-04 Rollforward
A1-05 Evidence versioning
A1-06 Arabic PDF
A1-08 Sign-off chain
LC-04 Classification admin
LC-05 Arabic PDF
LC-06 Spend analytics
D3-01 Outcome dashboard
D3-02 Monitoring signals
D3-03 Sector intelligence
S7-05 Bilingual UX
S7-08 ICP admin
```

### Stream E — Product Intelligence (depends on Stream C)
```
A1-02 Sampling engine
A1-03 Materiality depth
LC-01 Supplier scoring
LC-02 Tender matching
S7-01 Intelligence tabs
S7-02 Forecasting
D3-04 Pattern analysis
D3-06 Outcome correlation
```

### Stream F — Enterprise (contract-gated, sequential)
```
E8-06 Pentest → E8-01 SSO → E8-02 SCIM → E8-03 DR/HA → E8-04 SIEM → E8-05 Retention
```

---

## 7. Execution Sequence — Recommended Phases

### Phase 1 — Foundation & Security (Months 1-2)
| Task | Stream | Deps | Parallel-With |
|------|--------|------|--------------|
| L0-01 IaC | B | None | A (all) |
| L0-11 Role-based MFA | A | None | B, D (non-AI UX) |
| L0-07 Isolation tests | A | None | B, D |
| IC-04 CI Eval Gate | C | None | B, A |
| IC-06 Budget alerts | C | None | B, A |
| D (non-AI UX items) | D | None | B, A, C |

### Phase 2 — AI & Intelligence (Months 2-4)
| Task | Stream | Deps | Parallel-With |
|------|--------|------|--------------|
| IC-02 Active LLM wiring | C | IC-04, IC-06 | B (ongoing) |
| IC-09 Provider hardening | C | IC-02 | B, D |
| IC-01 RAG/pgvector | C | IC-02 | B, D |
| L0-03 Backup automation | B | L0-01, L0-02 | D |
| D (remaining UX) | D | None | C, B |

### Phase 3 — Product AI Wiring (Months 3-5)
| Task | Stream | Deps | Parallel-With |
|------|--------|------|--------------|
| A1-09 AuditOS AI review | E | IC-02 | LC, D3, S7 work |
| A1-02 Sampling engine | E | IC-01 | A1-03, LC-01 |
| LC-01 Supplier scoring | E | IC-01 | A1-02, LC-02 |
| LC-02 Tender matching | E | IC-01 | LC-01, S7-01 |
| S7-01 Intelligence tabs | E | IC-02 | LC-01, D3-04 |
| S7-02 Forecasting | E | IC-02 | S7-01, D3-06 |

### Phase 4 — L6 Certification (Months 4-6)
| Task | Stream | Deps | Parallel-With |
|------|--------|------|--------------|
| A1-08 Sign-off chain | D | None | All remaining |
| D3-01 Outcome dashboard | D | None | All remaining |
| Per-layer L6 validation | — | All above | — |
| L0-04 External pentest | F | All security fixes | Phase 4 |

---

## 8. Parallelism Summary

| Phase | Parallel Streams | Sequential Chains | Est. Wall Time |
|-------|-----------------|-------------------|---------------|
| 1 | Stream A + B + C + D (4 streams) | None | 2 months |
| 2 | Stream B + C + D (3 streams) | Stream C internal | 2 months |
| 3 | Stream E (4 products parallel) | per-product AI wiring | 2 months |
| 4 | Product certifications + Pentest | per-product validation | 2 months |
| **Total** | **Up to 4 parallel streams** | **~3 sequential chain links** | **~6 months** |

**Effective parallelism:** ~2.5x speedup vs purely sequential execution.

---

## 9. Risk Nodes

| Node | Risk | Mitigation |
|------|------|-----------|
| IC-01 RAG | Largest single effort in AI stack | Start early (Phase 1-2). Reuse pgvector infrastructure. |
| L0-01 IaC | Tooling decision may change | Decide quickly. Terraform recommended. |
| L0-04 Pentest | Vendor dependency | Schedule early (Phase 2), contract before code freeze. |
| S7-03 CRM sync | XL effort, low priority | Defer to post-L6 SalesOS. Phase out of L6 critical path. |
| E8-06 Pentest | Same as L0-04 | Treat as same gate — one pentest covers both. |

---

## 10. Gate Conditions

| Gate | Opens | Condition |
|------|-------|-----------|
| G0 | All L6 work | L0-01 IaC approved + L0-07 isolation tests pass |
| G1 | Active LLM wiring | IC-04 eval gate passes + IC-06 budget alerts active |
| G2 | RAG development | IC-02 Active LLM in staging with cost controls |
| G3 | Product AI features | IC-01 RAG operational in staging |
| G4 | SalesOS L5 proof | S7-01 intelligence tabs complete + S7-04 criteria met |
| G5 | Enterprise sales | L0-04 pentest passed |
| G6 | L6 certification | All per-layer gaps closed + pentest passed + DR drill passed |
