# Phase 10 — Enterprise Technical Debt Register

**Date:** 2026-06-20  
**Scope:** Ranked debt register for the entire platform  
**Methodology:** Impact × Risk = Priority (P0-P3)

---

## Priority Classification

| Priority | Definition | Maximum Items |
|----------|------------|---------------|
| **P0** | Blocking — prevents production reliability, forensics, or security | No limit |
| **P1** | Critical — significant risk to platform integrity, maintainability | No limit |
| **P2** | Important — impedes development velocity or operational efficiency | No limit |
| **P3** | Standard — nice to fix, low risk | No limit |

---

## P0 — Blocking (4 items)

### D-001: 11 Fragmented Audit Models Prevent Cross-Product Forensics

| Field | Value |
|-------|-------|
| **Impact** | Cannot query "all actions by user X across products." No cross-product audit trail. 5 separate write paths. |
| **Risk** | Audit failure — cannot trace evidence chains across products |
| **Complexity** | High (8-12 week program) |
| **Location** | 11 Prisma models, 6 write services |
| **Affected** | ALL products |
| **Recommended Action** | Launch Audit Unification Program (see Phase 4 deliverable) |
| **Estimated Effort** | 8-12 weeks |

### D-002: No Product Uses Platform Audit Infrastructure

| Field | Value |
|-------|-------|
| **Impact** | Platform invested heavily in PlatformAuditLog + hash chain. Zero product adoption. Hash chain only protects platform core events. |
| **Risk** | Wasted infrastructure investment; tamper evidence not available for product data |
| **Complexity** | Medium (incremental adoption per product) |
| **Location** | `src/lib/platform/audit-log.ts`, `src/lib/platform/audit/` |
| **Affected** | ALL products |
| **Recommended Action** | Add dual-write to PlatformAuditLog for each product, starting with SalesOS (has adapter pattern) |
| **Estimated Effort** | 2 days per product |

### D-003: Intelligence Core is Aspirational, Not Real

| Field | Value |
|-------|-------|
| **Impact** | 12+ locations claim to be "Intelligence Core." No unified engine. AI governance, signals, memory, workflow, and operations are disconnected. |
| **Risk** | Architectural confusion; new developers cannot find the "intelligence" layer |
| **Complexity** | Very High (3-4 month consolidation program) |
| **Location** | `lib/ai/`, `lib/governance/`, `lib/platform/*`, `lib/rag/`, `lib/workflowos/` |
| **Affected** | ALL products |
| **Recommended Action** | Execute Intelligence Core Consolidation Plan (Phase 3) with governance first |
| **Estimated Effort** | 3-4 months |

### D-004: SalesOS Schema Drift Blocks Type Safety

| Field | Value |
|-------|-------|
| **Impact** | `@ts-nocheck` in prisma-repository.ts (898 lines). 5 model names + 10+ field names out of sync. Entire SalesOS domain has no TypeScript protection. |
| **Risk** | Runtime errors in SalesOS; blocks any refactoring |
| **Complexity** | High (requires schema reconciliation + migration) |
| **Location** | `src/lib/sales/prisma-repository.ts`, schema.prisma |
| **Affected** | SalesOS |
| **Recommended Action** | Full schema reconciliation: match repository names to Prisma model names, fix field mapping, remove `@ts-nocheck` |
| **Estimated Effort** | 3-5 days |

---

## P1 — Critical (8 items)

### D-005: Authorization Has No Single Decision Point

| Field | Value |
|-------|-------|
| **Impact** | 4 separate authorization layers (middleware, RBAC, ABAC, Core) that don't compose. ABAC exists but is not wired. |
| **Risk** | Authorization gaps; contradictory rules |
| **Complexity** | Medium (10-week program) |
| **Location** | `middleware.ts`, `access/`, `abac/`, `core/access/` |
| **Recommended Action** | Create `authorize()` function composing all layers |
| **Effort** | 10 weeks |

### D-006: Two Notification Engines Writing to Same Table

| Field | Value |
|-------|-------|
| **Impact** | `notification/` and `notifications/` are separate engines with different APIs, both writing to `PlatformNotification`. Inconsistent behavior. |
| **Risk** | Missed notifications, duplicate notifications |
| **Complexity** | Low (2 days) |
| **Location** | `src/lib/platform/notification/`, `src/lib/platform/notifications/` |
| **Recommended Action** | Consolidate into `notification/` with interface-based API |
| **Effort** | 2 days |

### D-007: ABAC Engine is Unused

| Field | Value |
|-------|-------|
| **Impact** | Full policy engine (createPolicy, evaluateAccess, 8 operators) built but never wired into any authorization flow. |
| **Risk** | Wasted investment; missing attribute-based authorization capability |
| **Complexity** | Medium (3 days to wire into authorize()) |
| **Location** | `src/lib/platform/abac/` |
| **Recommended Action** | Wire ABAC into unified `authorize()` function |
| **Effort** | 3 days |

### D-008: Queue Infrastructure is Feature-Flagged Off

| Field | Value |
|-------|-------|
| **Impact** | Bull queue exists but disabled. Output queue is a stub. All exports, AI calls, and reports are synchronous. |
| **Risk** | Timeout failures for long-running operations; no background processing |
| **Complexity** | Medium (5 days for Phase 1) |
| **Location** | `src/lib/platform/operations/queue-runtime.ts` |
| **Recommended Action** | Enable queue by default, create export worker |
| **Effort** | 5 days |

### D-009: Task Persistence Disabled

| Field | Value |
|-------|-------|
| **Impact** | All task/activity state is in-memory only. Operator dashboard loses state on server restart. |
| **Risk** | Operator dashboard is unreliable; task state is ephemeral |
| **Complexity** | Medium (3 days) |
| **Location** | `src/lib/platform/operations/task-persistence.ts` |
| **Recommended Action** | Implement task persistence to PlatformAuditEvent or dedicated table |
| **Effort** | 3 days |

### D-010: Core Layer Stubs (Evidence, Audit, Output)

| Field | Value |
|-------|-------|
| **Impact** | `core/evidence/`, `core/audit/`, `core/output/` are in-memory stubs that pretend to be real abstractions. Real implementations are in platform layer. |
| **Risk** | Misleading architecture; new developers use stubs instead of real implementations |
| **Complexity** | Medium (5 days to either wire to real backends or deprecate) |
| **Location** | `src/core/` |
| **Recommended Action** | Either wire Core to real Prisma backends or deprecate Core stubs and update exports |
| **Effort** | 5 days |

### D-011: RiskOS Strategic Conflict

| Field | Value |
|-------|-------|
| **Impact** | Routes exist and are claimed L5 in PRODUCT_STATUS_MATRIX, but AGENTS.md says "Do not build unless explicitly tasked." |
| **Risk** | Strategic confusion; resources spent on product that contradicts platform strategy |
| **Complexity** | Low (0.5 days — decision, not code) |
| **Location** | `src/app/risk/`, `AGENTS.md §4`, `PRODUCT_STATUS_MATRIX.md` |
| **Recommended Action** | Leadership decision: adopt RiskOS or archive the routes |
| **Effort** | 0.5 days |

### D-012: ContentStudio is Ungoverned

| Field | Value |
|-------|-------|
| **Impact** | 12 route files, Prisma models, lib services — all undocumented. Missing from PRODUCT_STATUS_MATRIX and official taxonomy. |
| **Risk** | Unofficial product with no governance, security review, or operational documentation |
| **Complexity** | Low (1 day to document and status) |
| **Location** | `src/app/content-studio/`, `src/lib/platform/content-studio/` |
| **Recommended Action** | Either document as active product or deprecate |
| **Effort** | 1 day |

---

## P2 — Important (8 items)

### D-013: Two Product Registries with Different Structures

| Impact | Complexity | Effort |
|--------|------------|--------|
| Two sources of truth for product definitions | Low | 1 day |

### D-014: Only 5 Models Track updatedById

| Impact | Complexity | Effort |
|--------|------------|--------|
| Cannot track who last modified records without scanning audit logs | Low | 2 days for top 20 models |

### D-015: Three Rate Limiting Implementations

| Impact | Complexity | Effort |
|--------|------------|--------|
| Inconsistent rate limit behavior across edge, server, and platform | Low | 2 days |

### D-016: Platform Layer Contains Product-Specific Code

| Impact | Complexity | Effort |
|--------|------------|--------|
| sales-intelligence, audit-risk, office-ai-adv, local-content-intelligence in platform/ | Medium | 3 days |

### D-017: Signals Index Exports Empty Stubs

| Impact | Complexity | Effort |
|--------|------------|--------|
| 9 functions returning `[]` shadow real producers | Low | 0.5 days |

### D-018: No Standardized Health Check Format

| Impact | Complexity | Effort |
|--------|------------|--------|
| Terraform health checks and CI/CD smoke tests use custom scripts | Low | 1 day |

### D-019: No Soft Delete on Critical Models

| Impact | Complexity | Effort |
|--------|------------|--------|
| All deletes are hard deletes — no recovery from accidental deletion | Low | 1 day |

### D-020: Audit Bridge Models Missing from Prisma Schema

| Impact | Complexity | Effort |
|--------|------------|--------|
| `(prisma as any)` casts for audit-bridge and institutional-memory models | Low | 1 day |

---

## P3 — Standard (8 items)

| ID | Item | Effort |
|----|------|--------|
| D-021 | `workflow/product-templates.ts` returns null — stub should be removed or implemented | 1 day |
| D-022 | `cross-product-commercial.ts` returns `[]` — stub should document intent | 0.5 days |
| D-023 | `@ts-nocheck` in signal producers (local-content, sales) — type issues need fixing | 2 days |
| D-024 | Orchestrator has two provider resolve paths with different ordering | 2 days |
| D-025 | Three audit write paths (audit-log.ts, audit-logger.ts, audit-event-service.ts) | 0.5 days |
| D-026 | No migration reversal scripts — all migrations are forward-only | Not estimated |
| D-027 | 42 migrations in 43 days indicates no stabilization phase | 0 (process) |
| D-028 | Build has two paths (build and build:safe) — turbopack config has Windows path | 1 day |

---

## Debt Register Summary

| Priority | Count | Total Effort |
|----------|-------|-------------|
| **P0** | 4 | 23-27 weeks |
| **P1** | 8 | 25-27 days |
| **P2** | 8 | 13.5 days |
| **P3** | 8 | ~7 days |
| **Total** | **28** | **~6-8 months** |

### Top 10 By Impact

| Rank | ID | Item | Priority | Effort |
|------|----|------|----------|--------|
| 1 | D-001 | 11 fragmented audit models | P0 | 8-12 weeks |
| 2 | D-003 | Intelligence Core is aspirational | P0 | 3-4 months |
| 3 | D-004 | SalesOS schema drift | P0 | 3-5 days |
| 4 | D-002 | No product uses platform audit | P0 | 2 days per product |
| 5 | D-005 | No unified authorization | P1 | 10 weeks |
| 6 | D-006 | Two notification engines | P1 | 2 days |
| 7 | D-008 | Queue disabled by default | P1 | 5 days |
| 8 | D-009 | Task persistence disabled | P1 | 3 days |
| 9 | D-010 | Core layer stubs | P1 | 5 days |
| 10 | D-011 | RiskOS strategic conflict | P1 | 0.5 days |

### Quick Wins (Do This Week)

| ID | Item | Effort |
|----|------|--------|
| D-006 | Consolidate notification engines | 2 days |
| D-013 | Consolidate product registries | 1 day |
| D-017 | Remove signal index stubs | 0.5 days |
| D-025 | Deprecate audit-event-service.ts | 0.5 days |
| D-020 | Add missing audit-bridge models to schema | 1 day |
| D-011 | Resolve RiskOS strategic conflict | 0.5 days |
| D-012 | Document ContentStudio status | 1 day |
| | **Total** | **6.5 days** |
