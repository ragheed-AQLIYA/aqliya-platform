# Architecture Drift Review #2 — WP-02: Repository + Persistence

> **Date:** 2026-06-28 | **Reviewer:** OpenCode | **Work Package:** WP-02
> **Predecessor:** DRIFT_REVIEW_01_WP01.md — WP-01: GREEN, no drift
> **Specifications referenced:** SPEC-01a §5 (FROZEN), SPEC-01b §4 (FROZEN), SPEC-01e §6 (FROZEN)

---

## Drift Checklist

| Check | Result | Evidence |
|---|---|---|
| **No contract drift** | 🟢 **Green** | `DealRepository` interface unchanged. `DealFilter` unchanged. Concurrency via `version` field as specified. |
| **No new coupling** | 🟢 **Green** | Domain layer: zero imports from infrastructure. Prisma adapter imports from `src/lib/prisma` only, not from other products. |
| **No bypass of Platform contracts** | 🟢 **Green** | Prisma adapter is an implementation detail behind `DealRepository`. Domain never touches Prisma. |
| **No ORM leakage to Domain** | 🟢 **Green** | `InMemoryDealRepository` and `PrismaDealRepository` implement the same interface. Domain tests use InMemory (no DB). `Deal.reconstitute()` rehydrates value objects from serialized data. |
| **ADR impact** | 🟢 **Green** | No new ADR |  
| **Technical debt** | 🟡 **Yellow** | `version` stored in `metadata` JSON column (not a dedicated column). This is a known constraint — the SalesDeal Prisma model pre-dates the domain spec. Migration to a `version Int` column recommended when schema changes are permitted. |

---

## Specification Compliance

| SPEC Reference | Implemented? | Details |
|---|---|---|
| SPEC-01a §5 DealRepository | ✅ Yes | `InMemoryDealRepository` + `PrismaDealRepository` — both implement same interface |
| SPEC-01a §5 DealFilter | ✅ Yes | Stage filter, owner filter, status, date range, search, pagination |
| SPEC-01b §4 Concurrency | ✅ Yes | `ConcurrencyError` thrown on version mismatch. Version incremented on save. |
| Repository returns Aggregates only | ✅ Yes | `findById` and `findMany` return `Deal` instances, never raw data or DTOs |

---

## Deviations

| # | Deviation | Severity | Resolution |
|---|---|---|---|
| DEV-01 | `version` stored in Prisma `metadata JSON` column instead of dedicated `version Int` column | 🟡 Yellow | Schema migration deferred. Metadata approach is compliant with SPEC-01a semantics. No consumer impact. |

---

## Test Results

| Test Category | Tests | Passed |
|---|---|---|
| Domain (WP-01 retained) | 44 | 44 |
| Repository CRUD | 13 | 13 |
| Concurrency | 4 | 4 |
| Layer Boundary | 2 | 2 |
| **Total** | **63** | **63** |

---

## What Did NOT Require Change

- ❌ `DealRepository` interface
- ❌ `DealFilter` interface
- ❌ Constitution
- ❌ PRD-01
- ❌ SPEC-01a
- ❌ SPEC-01b

---

## Decision

**WP-02 ARCHITECTURE DRIFT: GREEN — ONE YELLOW (KNOWN, DEFERRED).**

**WP-02 complete. Contract Stability maintained. Ready for WP-03 (Read API).**
