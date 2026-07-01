# Phase 6 — Data Architecture Remediation

**Date:** 2026-06-20  
**Scope:** Prisma schema drift, deprecated models, missing governance fields, lineage gaps  
**Data Sources:** `prisma/schema.prisma`, `prisma/migrations/`, all repository files, `src/lib/*/audit*`

---

## Executive Summary

The Prisma schema contains 220 models with 110 organizationId scoping and 87 createdById fields — strong foundations. However, schema drift between the Prisma schema and repository layer affects 5+ products, updatedById is only on 5 models, 11 audit models are fragmented, and 42 migrations in 43 days indicate rapid evolution without a stabilization phase.

**Data Architecture Score: 6.5/10** — broad but shallow governance coverage, accumulating drift

---

## 1. Schema Drift

### R-03: Content-Studio Schema Drift (`src/lib/platform/content-studio/`)

**Status:** Documented tech debt  
**Issue:** Content-studio models exist in Prisma but the service layer uses direct Prisma access with type casts  
**Impact:** Low — contained to ContentStudio

### R-04: SalesOS Schema Drift (`src/lib/sales/prisma-repository.ts`)

**Status:** Documented tech debt with `@ts-nocheck`  
**Issue:** 5 model names + 10+ field names out of sync with Prisma schema  
**Impact:** Medium — blocks type-safe access to 13 SalesOS models

### R-05: Audit Bridge Schema Drift

**Discovery:** `src/lib/platform/audit-bridge/` uses `(prisma as any).auditBridgeRule` and `bridgeLogEntry` — models not found in schema.prisma

**Models potentially missing from schema:**
| Reference in Code | In Schema? |
|-------------------|------------|
| `auditBridgeRule` | NOT FOUND |
| `bridgeLogEntry` | NOT FOUND |
| `institutionalMemoryEvent` | ✓ EXISTS (line 2767) |
| `institutionalMemoryCollection` | ✓ EXISTS (line 2796) |
| `institutionalMemoryCollectionMembership` | NOT FOUND (referenced in code) |

---

## 2. Missing Governance Fields

### 2.1 updatedById — Only 5 Models

| Model | Has updatedById? |
|-------|-----------------|
| SalesPipeline | ✓ |
| SalesAccount | ✓ |
| SalesDeal | ✓ |
| SalesProposal | ✓ |
| InstitutionalMemoryCollection | ✓ |
| Remaining 215 models | ✗ |

**Impact:** Cannot track who last modified most records. Audit trail can provide this, but stored modifiedBy is faster.

**Recommendation:** Add `updatedById` to all 110+ models that have `createdById`.

### 2.2 Missing Lineage Fields

| Field | Models With It | Target |
|-------|---------------|--------|
| `organizationId` | 110 | All tenant-scoped models |
| `workspaceId` | ~6 | All workspace models |
| `createdById` | 87 | ALL business models (target: 200+) |
| `updatedById` | 5 | ALL business models |
| `version` | 0 | All auditable models |
| `sourceSystem` | 1 (PlatformAuditLog) | All auditable models |
| `correlationId` | 0 | All auditable models |

---

## 3. Deprecated / Orphaned Models

### 3.1 Audit Log — Dual Model

`AuditLog` (line 817, DecisionOS) and `PlatformAuditLog` (line 249, Platform) serve overlapping purposes. `AuditLog` is DecisionOS-specific and has fewer fields.

**Recommendation:** Deprecate `AuditLog`, migrate DecisionOS to use `PlatformAuditLog`.

### 3.2 Sunbul Models — Legacy

SunbulClient, SunbulUserMembership, SunbulRecord, SunbulDocument, SunbulReview, SunbulAuditEvent — all Sunbul-prefixed models are legacy (Sunbul redirects to WorkflowOS).

**Recommendation:** Keep for data integrity but add deprecation notices. Do not extend.

### 3.3 Simulation Models

TenderProfile, Scenario, SimulationResult — used by the simulation engine (src/lib/simulation/). Simulation is a marketing label according to AGENTS.md.

**Recommendation:** Keep for existing data but review whether these are still active or should be deprecated.

---

## 4. Schema Cleanup Opportunities

### 4.1 Index Coverage

Based on migration analysis, many models may lack query-optimized indexes:
- `organizationId` on 110 models — most should have `@@index([organizationId])`
- `createdById` on 87 models — should have `@@index([createdById])`
- `status` on workflow models — should have `@@index([status])`

**Recommendation:** Audit index coverage and add missing indexes.

### 4.2 Enum Consolidation

Current enums are scattered across domains:
- `AuditAction` (DecisionOS-specific, 22 values) — should be part of platform audit taxonomy
- `SunbulAuditAction` (Sunbul-specific, 15 values) — legacy
- Domain enums per product — should be shared where possible

**Recommendation:** Consolidate into shared platform enums with product-specific extensions.

### 4.3 Soft Delete

No models have `deletedAt` fields. All deletes appear to be hard deletes.

**Recommendation:** Add `deletedAt` to all critical business models. Audit trail already exists but soft-delete prevents accidental data loss.

---

## 5. Migration Health

| Metric | Value |
|--------|-------|
| Total migrations | 41 |
| Migration span | 43 days (2026-05-06 to 2026-06-18) |
| Average per day | 0.95 |
| Largest migration | 89,502 B (add_lc_v35_grounding_feedback) |
| Total SQL migrated | ~232 KB |
| Migration naming convention | Consistent (snake_case prefix + description) |
| Migration reversibility | Not evaluated (no down migrations) |

**Concern:** ~1 migration/day average indicates rapid iteration without stabilization. Some migrations modify existing data (the 89KB one suggests significant data transformation).

**Recommendation:** Implement migration freeze for 2 weeks after current phase, then batch migrations into weekly releases.

---

## 6. Repository Pattern Assessment

| Domain | Repository Files | Pattern Quality |
|--------|-----------------|-----------------|
| SalesOS | 14 files | Mixed — typed repositories + `@ts-nocheck` main repo |
| Audit | 2 files | Typed, clean |
| LocalContent | 5 files | Interface-based + implementation |
| Platform | 0 | Direct Prisma in services |

**Issue:** No consistent repository pattern across the platform. SalesOS has the richest repository layer but with drift. Audit/LocalContent have lighter repositories. Platform core uses direct Prisma.

**Recommendation:** Define a shared repository interface in `src/lib/platform/` and adopt it across all products.

---

## 7. Remediation Plan

### Phase 1 — Schema Integrity (Week 1-2)

| Step | Action | Effort | Risk |
|------|--------|--------|------|
| 1.1 | Add missing audit-bridge models to schema | 1 day | Low |
| 1.2 | Add `institutionalMemoryCollectionMembership` to schema | 0.5 days | Low |
| 1.3 | Add `updatedById` to top 20 business models | 1 day | Low |
| 1.4 | Add `deletedAt` to critical models (AuditEngagement, SalesDeal, Decision) | 1 day | Low |
| 1.5 | Fix SalesOS schema drift: align model names | 3 days | High |

### Phase 2 — Index Optimization (Week 3)

| Step | Action | Effort | Risk |
|------|--------|--------|------|
| 2.1 | Audit organizationId index coverage | 1 day | Low |
| 2.2 | Audit createdById index coverage | 0.5 days | Low |
| 2.3 | Add status/filter indexes | 1 day | Low |
| 2.4 | Add migration for index additions | 1 day | Low |

### Phase 3 — Model Deprecation (Week 4)

| Step | Action | Effort | Risk |
|------|--------|--------|------|
| 3.1 | Add `@deprecated` comments to Sunbul models | 0.5 days | Low |
| 3.2 | Deprecate `AuditLog`, migrate DecisionOS to PlatformAuditLog | 3 days | Medium |
| 3.3 | Review Simulation model usage, recommend deprecation if unused | 1 day | Low |

### Phase 4 — Repository Standardization (Week 5-6)

| Step | Action | Effort | Risk |
|------|--------|--------|------|
| 4.1 | Define shared repository interface | 2 days | Low |
| 4.2 | Update SalesOS repositories to use shared interface | 3 days | Medium |
| 4.3 | Update Audit repositories | 1 day | Low |
| 4.4 | Update Platform services to use repositories | 3 days | Medium |

**Total Estimated Effort:** **6 weeks**

---

## 8. Scoring

| Metric | Current | Target | Gap |
|--------|---------|--------|-----|
| Schema-repository alignment | 3/10 (drift in 3 areas) | 10/10 | 7 |
| updatedById coverage | 5/220 models | 200+/220 | 195 |
| deletedAt coverage | 0/220 | 20+/220 (critical models) | 20 |
| Index optimization | Unknown | Audited + optimized | TBD |
| Repository pattern consistency | 3/10 | 9/10 | 6 |
| Migration stability | 4/10 (1/day) | 8/10 (weekly) | 4 |
| **Composite** | **6.5/10** | **9.0/10** | **2.5** |
