# LC-SPEC-02e: Test Specification — Supplier & Spend Management

> **Status:** Draft v0.1 (Alignment) | **Date:** 2026-06-28 | **Author:** OpenCode
> **Type:** Test Specification — retroactive alignment documenting the test strategy for Supplier & Spend Management.
> **Parent:** `LC-PRD-02_Supplier_Spend_Management.md` v0.1
> **Depends On:** LC-SPEC-02a, LC-SPEC-02b, LC-SPEC-02c, LC-SPEC-02d
> **Template:** LC-SPEC-01e (Golden Reference)

---

## Specification Header

| Field | Value |
|---|---|
| **Stability** | Draft |
| **Depends On** | All LC-EPIC-02 specs |
| **Consumer** | QA, CI Pipeline |
| **Evidence Classification** | Executable Evidence |

---

## 1. Test File Map

| # | File | Tests | What It Tests | SPEC Reference |
|---|---|---|---|---|
| T-01 | `import.test.ts` | 9 | CSV parsing (valid, invalid, bilingual headers), row validation, result reporting | LC-SPEC-02c §1 |
| T-02 | `scoring.test.ts` | 18 | Supplier classification weights, locality/ownership/workforce factoring | LC-SPEC-02c §2 |
| T-03 | `spend-analytics.test.ts` | 1 | Organization-level spend aggregation | LC-SPEC-02c §3 |
| T-04 | `guards.test.ts` | 3 | RBAC for supplier/spend operations (shared) | LC-SPEC-02b §2 |
| T-05 | `audit-events.test.ts` | 22 | Events: SUPPLIER_CREATED, SPEND_CREATED, SPEND_IMPORTED, SPEND_CLASSIFIED (shared) | LC-SPEC-02a §4 |

**Total tests directly applicable to LC-EPIC-02: 31+**

Additional coverage from cross-product tests:
| IT-01 | `cross-tenant-isolation.test.ts` | 41 | Multi-org isolation for supplier/spend data | LC-SPEC-02b §2 |

---

## 2. Key Test Scenarios

### Import Tests (9 tests)
```
✓ Parses valid CSV with English headers
✓ Parses valid CSV with Arabic headers
✓ Rejects row with negative amount
✓ Rejects row with missing supplier name
✓ Rejects row with missing category
✓ Rejects row with missing period
✓ Returns partial success (valid + rejected rows)
✓ Handles empty CSV
✓ Handles CSV with extra unknown columns
```

### Scoring Tests — Supplier subset (from 18 total)
```
✓ scoreLocalityFactor — local → 40, non_local → 0, mixed proportional
✓ scoreOwnershipFactor — Saudi → 25, foreign → 4, joint_venture → 15
✓ scoreWorkforceFactor — 100% → 20, 50% → 10, null → 8
✓ scoreDeclaredContent — 100% → 15, 0% → 0, 50% → 8 (rounded)
```

---

## Alignment Delta

| Attribute | Value |
|---|---|
| **Existing Implementation** | ✅ 31+ tests in `__tests__/import.test.ts`, `scoring.test.ts`, `spend-analytics.test.ts` |
| **Documented** | ✅ This specification retroactively describes existing test coverage |
| **Behavior Changed** | None |
| **Code Modified** | None |
| **Governance Added** | Documentation only |

---

## Document Metadata

- **Author:** OpenCode
- **Type:** Test Specification — Brownfield Alignment
- **Date:** 2026-06-28
- **Version:** 0.1 (Draft)
- **Parent:** `LC-PRD-02_Supplier_Spend_Management.md` v0.1
- **Program:** LIA-001 (LC-EPIC-02)
- **Status:** **Draft v0.1** — ready for review
- **Next:** LC-EPIC-02 Freeze → LC-EPIC-03 (Evidence & Classification)
