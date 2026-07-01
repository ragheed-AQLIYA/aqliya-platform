# REPOSITORY STRATEGY — AQLIYA Recovery & Scale

**Date:** 2026-06-17  
**Question:** What should happen first — cleanup, security, build, docs, or architecture?

---

## Option Evaluation

| Option | Verdict | Why |
|--------|---------|-----|
| **A: Mass cleanup** | **Reject first** | 30 dead files yes; 1735 docs no — noise reduction ≠ value |
| **B: Security first** | **Partial** | test-token + RBAC critical — but build must parallel |
| **C: Build stability first** | **Partial** | Unblocks CI/deploy — but ship test-token same week |
| **D: Documentation governance first** | **Reject first** | Important for due diligence week 2, not day 1 |
| **E: Architecture consolidation first** | **Reject** | Sales merge is week 7+; high regression risk |

---

## Selected Strategy: **B+C Hybrid → D → Product → E**

**Optimal sequence:** Security + Build (parallel) → Truth docs → Product pilots → Architecture consolidation

This maximizes enterprise trust and execution speed while minimizing rework.

---

## Justification

### Why not A (Mass cleanup) first?

- Audit identified **30 high-confidence dead files** — include in Week 1, not a "mass cleanup program"
- 352 theoretical + 227 archive docs are **authority-classified background** — deleting creates rework and loses IP
- ESLint 33K is **scope noise** — 2-hour config fix, not cleanup sprint

### Why B+C together in Week 1?

- `deploy.yml` runs `tsc --noEmit` — **build is the deploy gate**
- `/api/test-token` is **critical security** — can fix in 15 minutes alongside build
- Same engineers touch `platform/` for schema drift — one cohesive "unblock ship" sprint
- **Evidence:** build-audit + SEC-C01 are both P0 in forensic audit

### Why D (docs) in Week 2–3, not Week 1?

- Doc updates before green build create **new lies** if build still fails
- Week 2 sync: master ref, README, PRODUCT_STATUS_MATRIX build row — **after** validation PASS
- Create `docs/reports/` with **actual** tsc/build/test output — evidence, not prose

### Why Product before E (architecture)?

- LocalContent + AuditOS pilots generate **revenue and proof** — Sales merge does not
- Sales v02/_v02 merge has **high regression risk** (DUPLICATION_REPORT: 3–5 days, import sweep)
- Consolidating architecture on a red build = wasted merge conflict resolution

### Why E last in 90 days?

- Requires green CI + frozen Sales features
- Dual Decision routes hurt maintainability but **not pilots**
- Empty `lib/risk/` — document as audit submodule; move later

---

## Repository Workstreams

### Stream 1: Ship Gate (Weeks 1–2)

```
test-token DELETE → TS fixes → schema drift → .next clean → npm run build PASS
     ↓
Delete (1) + .bak → fix 3 test fixtures → npm test trend green
     ↓
ESLint scope fix → honest lint metric
```

**Owner:** Platform engineer  
**Exit:** CI green on main

### Stream 2: Trust Gate (Weeks 2–4)

```
Master ref sync → README → PRODUCT_STATUS_MATRIX build row
     ↓
docs/reports/ created → validation snapshot committed
     ↓
CoreAccessControl MVP → MFA login JWT
```

**Owner:** Platform + security  
**Exit:** Due diligence pack truthful

### Stream 3: Product Gate (Weeks 3–10)

```
LocalContent pilot hardening (primary)
     ↓
AuditOS protect (parallel, minimal diff)
     ↓
SalesOS FREEZE documented
```

**Owner:** Product engineers  
**Exit:** Pilot signed

### Stream 4: Consolidation Gate (Weeks 7–12)

```
Sales v02/_v02 merge (single tree)
     ↓
Decision route redirect plan
     ↓
jest --coverage baseline
```

**Owner:** Senior engineer after Stream 1 stable  
**Exit:** Maintainability score 50→70

---

## What Stays Untouched (90 Days)

| Area | Reason |
|------|--------|
| `knowledge-foundation/` | Non-runtime; label only |
| `docs/theoretical-reference/` | Background authority |
| `docs/archive/` | Historical |
| On-Prem / Air-Gap code paths | L0 strategic |
| Prisma model count reduction | No evidence of unused models at scale |
| Next.js version upgrade | Risk without value |

---

## Repository Health Metrics

| Metric | Week 0 | Week 2 | Week 6 | Week 12 |
|--------|-------:|-------:|-------:|--------:|
| `tsc --noEmit` | FAIL | PASS | PASS | PASS |
| `npm run build` | FAIL | PASS | PASS | PASS |
| Critical SEC open | 2 | 0 | 0 | 0 |
| `(1)` duplicate files | 19 | 0 | 0 | 0 |
| ESLint (scoped src/) | unknown | measured | improving | stable |
| Test suite pass | 87.5% | 95%+ | 98%+ | 98%+ |
| Doc conflicts (DC-01–07) | open | closed | closed | closed |

---

## Decision Record

**Selected:** Hybrid **B+C** → **D** → Product → **E**  
**Rejected as first move:** A (mass cleanup), D alone, E (architecture consolidation)  
**Principle:** Enterprise readiness over perfection; revenue over engineering purity
