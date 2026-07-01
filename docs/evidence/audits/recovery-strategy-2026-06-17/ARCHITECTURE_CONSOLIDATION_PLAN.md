# ARCHITECTURE CONSOLIDATION PLAN — AQLIYA Recovery & Scale

**Date:** 2026-06-17  
**Principle:** Consolidate, don't rewrite. Freeze before merge. Evidence from DUPLICATION_REPORT + ACTUAL_ARCHITECTURE_MODEL.

---

## Consolidation Decision Framework

| Signal | Action |
|--------|--------|
| Duplicate `(1)` file | **DELETE** (Week 1) |
| Mirror trees (v02/_v02) | **MERGE** (Week 7+, after CI green) |
| Active + legacy routes (Sunbul) | **FREEZE** legacy pages; keep redirects |
| Dual product routes (decision) | **MERGE** with redirects (Week 9+) |
| Empty lib dir | **DELETE** dir or **POPULATE** — not both |
| Stub security (CoreAccessControl) | **REFACTOR** to real (Week 2–3) |
| Strategic L0 (Studio, On-Prem) | **IGNORE** |
| Archive doc code | **EXCLUDE** from lint — not merge |

---

## Area 1: SalesOS Version Sprawl

### Current (evidence)

| Tree | Status | Files |
|------|--------|------:|
| `sales/v02/` | Mirror | cross-product-signals + more |
| `sales/_v02/` | Mirror | identical module names |
| `sales/vnext/` | Active development | tests, TODOs |
| `sales/*.ts` (root) | Canonical services | prisma-repository, service, etc. |
| `* (1).ts` | Accidental dupes | 15 files |

### Decision

| Component | Action | When | Risk |
|-----------|--------|------|------|
| `(1)` files | **DELETE** | Week 1 | Low |
| `_v02/` | **MERGE → v02/** then rename v02 → `core/` | Week 7–8 | High |
| `vnext/` | **FREEZE** new modules Week 3–6; **KEEP** as experiment lane | Ongoing | Medium |
| Root `sales/*.ts` | **KEEP** — canonical | — | — |

### Merge procedure (Week 7)

1. `grep -r "_v02"` import inventory  
2. Point all imports to `v02/` paths  
3. Delete `_v02/`  
4. Rename `v02/` → `core/` in single PR  
5. `npm test` full suite  
6. Document in ADR-002 (Sales lib consolidation)

**Do not merge before:** CI green 14+ days, Sales feature freeze respected.

---

## Area 2: AI / Intelligence Core

### Current

| Item | Evidence |
|------|----------|
| `provider-factory.ts` | Exists |
| `providers/index.ts` | Alternate entry |
| `intelligence-runtime (1).ts` | Duplicate |
| `governed-ai-metadata (1).ts` | Duplicate |
| Orchestrator + governance | 73 + 25 files — working pattern |

### Decision

| Component | Action | When |
|-----------|--------|------|
| `(1)` AI files | **DELETE** | Week 1 |
| Provider factories | **MERGE** audit first — pick one factory | Week 8 |
| Orchestrator pattern | **KEEP** — do not rewrite | — |
| Deterministic default | **KEEP** — ADR-001 aligned | — |
| RAG/pgvector | **KEEP** gated | — |

**Do not:** Rebuild AI stack. Fix duplicates and document single factory.

---

## Area 3: DecisionOS Dual Routes

### Current

- `(dashboard)/decisions/*` — primary (~15 sub-pages)  
- `decision/*` — 9 files parallel tree

### Decision

| Phase | Action |
|-------|--------|
| Week 1–6 | **FREEZE** — no new routes in `decision/` |
| Week 9 | Audit traffic — NOT VERIFIED; assume dashboard primary |
| Week 10 | Add **redirects** `decision/*` → `(dashboard)/decisions/*` |
| Week 11 | Deprecate `decision/` pages |
| Week 12 | Delete after 1 release |

**Risk:** Medium — bookmark breakage. Mitigate with permanent redirects in `next.config.mjs`.

---

## Area 4: WorkflowOS / Sunbul Legacy

### Current

- WorkflowOS canonical at `/workflowos/*`  
- Sunbul redirects in `next.config.mjs`  
- Legacy pages in `src/app/sunbul/` (3 files)

### Decision

| Component | Action |
|-----------|--------|
| Redirects | **KEEP** |
| `sunbul/` pages | **FREEZE** then **DELETE** when redirect-only confirmed |
| WorkflowOS lib | **KEEP** — 14 files, adequate |

**Do not:** Merge Sunbul data model — already redirect alias per matrix L13.

---

## Area 5: Risk Submodule

### Current

- `src/app/risk/` — 7 files  
- `src/lib/risk/` — **empty**  
- Matrix: RiskOS L0; audit has submodule

### Decision

| Action | When |
|--------|------|
| Document as **AuditOS risk submodule** in ROUTE_REGISTRY | Week 2 |
| Move to `src/lib/audit/risk/` OR populate `lib/risk/` | Week 10 |
| **Do not** launch RiskOS product brand | 90 days |

---

## Area 6: Platform Core Stubs

### Current

| Stub | Evidence |
|------|----------|
| CoreAccessControl | always granted |
| file-scanner | pass-through |
| SAML builder | returns null |
| platformAuditEvent | schema drift |

### Decision

| Component | Action | Priority |
|-----------|--------|----------|
| platformAuditEvent | **REFACTOR** schema + migration | P0 |
| SecretEntry types | **REFACTOR** exports | P0 |
| CoreAccessControl | **REFACTOR** deny-default + matrix | P1 |
| MFA JWT | **REFACTOR** login flow | P1 |
| file-scanner | **REFACTOR** integrate OR remove claim | P2 |
| SAML | **FREEZE** UI claims until impl | P2–P3 |

---

## Area 7: Documentation Architecture

### Decision

| Item | Action |
|------|--------|
| 352 theoretical docs | **FREEZE** — banner only |
| 227 archive | **FREEZE** |
| 1735 total | **No merge** — govern citation |
| `docs/reports/` | **CREATE** |
| Duplicate runbooks | **MERGE** to single backup doc |

---

## Consolidation Timeline

| Week | Consolidation work |
|------|-------------------|
| 1 | DELETE `(1)` + `.bak`; fix platform schema |
| 2–6 | **FREEZE** all structural merges |
| 7–8 | Sales v02/_v02 merge |
| 9–10 | Decision redirects |
| 11–12 | Risk lib placement; AI factory merge |

---

## Explicit Non-Actions (90 Days)

| Do not | Reason |
|--------|--------|
| Rewrite modular monolith | Audit: architecture 68/100 — adequate |
| Reduce Prisma model count | No evidence of harm |
| Merge AuditOS + LocalContent | Different products, shared core correct |
| Delete knowledge-foundation | Strategic IP |
| Microservices split | Premature |

---

## Success Metrics

| Metric | Before | After 90d |
|--------|-------:|----------:|
| Sales lib top-level trees | 3 (v02, _v02, vnext) | 2 (core, vnext) |
| `(1)` duplicate files | 19 | 0 |
| Decision route trees | 2 | 1 (+ redirects) |
| CoreAccessControl | stub | enforced MVP |
| Empty lib/risk | yes | populated or moved |
