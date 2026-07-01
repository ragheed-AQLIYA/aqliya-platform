# PRODUCT STRUCTURE PLAN — AQLIYA

**Date:** 2026-06-17  
**Products:** AuditOS, LocalContentOS, SalesOS (+ platform boundaries)

---

## Correct Boundaries (target)

| Product | App routes | Lib | Actions | Components |
|---------|------------|-----|---------|------------|
| **AuditOS** | `src/app/audit/` | `src/lib/audit/` | `src/actions/audit*.ts` | `src/components/audit/` |
| **LocalContentOS** | `src/app/local-content/` | `src/lib/local-content/` | `src/actions/localcontent*.ts` | `src/components/local-content/` |
| **SalesOS** | `src/app/sales/` | `src/lib/sales/` | `src/actions/sales*.ts` | `src/components/sales/` |
| **Platform** | `src/app/api/`, settings | `src/lib/platform/`, `ai/`, `governance/` | platform actions | `src/components/platform/` |

**Audit-adjacent (not separate product):**
- `src/lib/tb-intelligence/` → stays; document as AuditOS engine
- `src/app/risk/` → AuditOS risk submodule; populate `lib/audit/risk/` or `lib/risk/`

---

## AuditOS

### Current (verified)

- App: 72 files under `src/app/audit/`
- Lib: 139 files under `src/lib/audit/`
- TB intelligence: 28 files in `src/lib/tb-intelligence/`

### Issues

| Issue | Severity | Action |
|-------|----------|--------|
| TB intelligence separate folder | Low | Document boundary; optional move to `audit/tb-intelligence/` Phase 6 |
| Risk routes without lib | Medium | Move logic to `lib/audit/risk/` Phase 5 |
| Large `seed-audit.ts` | Low | Keep; split only if maintainability pain |

### Decision

**MAINTAIN structure.** Do not reorganize during LC pilot quarter. Only remove duplicates touching audit paths.

---

## LocalContentOS

### Current (verified)

- App: 42 files under `src/app/local-content/`
- Lib: 87 files under `src/lib/local-content/`
- ERP: `src/lib/local-content/erp/`
- Workbook: `src/lib/local-content/workbook/`

### Issues

| Issue | Severity | Action |
|-------|----------|--------|
| Clean boundaries | ✓ Good | No lib leakage |
| `local-content-intelligence/` (3 files) | Low | Merge into `local-content/intelligence/` Phase 6 |
| Marketing page separate | OK | `(marketing)/products/local-content/` |

### Decision

**KEEP as reference structure** for other products. Minimal moves only.

---

## SalesOS

### Current (verified)

- App: 76 files under `src/app/sales/`
- Lib: **358 files** — 34% of all lib code
- Trees: `sales/v02/`, `sales/_v02/`, `sales/vnext/`, root `sales/*.ts`
- Duplicates: 15× `(1).ts` files

### Issues

| Issue | Severity | Action |
|-------|----------|--------|
| `_v02/` mirrors `v02/` | **High** | Merge Phase 5 (after CI green) |
| `vnext/` experiments | Medium | Freeze features; keep folder |
| `(1).ts` copies | High | **Delete Phase 1** |
| `src/products/sales/` adapters | Low | Document; keep |
| Duplicate actions `(1).ts` | High | **Delete Phase 1** |

### Target structure

```
src/lib/sales/
├── core/              # merged v02 cross-product + shared (from v02 + _v02)
├── vnext/             # frozen experiments
├── crm/               # keep
├── repositories/      # keep
├── __tests__/         # keep
└── *.ts               # root services (prisma-repository, service, etc.)
```

### Decision

**Phase 1:** delete duplicates only  
**Phase 5:** merge `_v02` → `v02` → rename `core/`  
**Do not** delete vnext during cleanup

---

## Cross-product leakage

| Leakage | Evidence | Action |
|---------|----------|--------|
| Sales cross-product signals → audit/LC | TODOs in v02 aggregators | Feature freeze, not move |
| `src/lib/decision/` vs `decisions/` | Two lib folders | Verify; merge Phase 6 |
| `src/app/decision/` vs `(dashboard)/decisions/` | Dual routes | Redirect plan Phase 5 |
| Office AI in multiple paths | `office-ai/`, `(dashboard)/assistant/` | Document; defer merge |

---

## Legacy trees

| Legacy | Action |
|--------|--------|
| `src/app/sunbul/` | Delete pages after redirect-only verified — Phase 4 |
| `organizations/sunbul/` | Document redirect — Phase 6 |
| `docs/archive/code/sales-v02/` | Keep in archive; eslint ignore |

---

## Execution priority (product structure)

1. Delete Sales `(1).ts` duplicates (Batch 1)  
2. Delete marketing `.bak` (Batch 1)  
3. Populate or relocate risk lib (Batch 3)  
4. Sales v02/_v02 merge (Batch 5 — requires import graph)  
5. Decision route consolidation (Batch 6)  

---

## Must not touch (product code)

| Path | Reason |
|------|--------|
| `src/lib/audit/` core engagement flows | L5 pilot-ready |
| `src/lib/local-content/workbook/` | LC revenue path |
| `prisma/schema.prisma` | No cleanup-driven schema changes |
| `src/app/auditos/` | Demo rules |
