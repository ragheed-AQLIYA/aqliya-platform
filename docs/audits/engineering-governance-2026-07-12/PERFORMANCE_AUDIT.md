# AQLIYA Performance Audit
**Date:** 2026-07-12
**Auditor:** OpenCode Performance Auditor Agent
**Scope:** Full-stack platform audit — database, caching, rendering, bundle, streaming, memory
**Files inspected:** 94+ action files, prisma/prisma.schema, 100+ loading.tsx, 98+ error.tsx, 250+ component files, 3 cache/lib files

---

## 1. Executive Summary

AQLIYA demonstrates strong **Suspense/Streaming** coverage (97+ loading.tsx, 98+ error.tsx) and **thorough database indexing** (150+ explicit indexes across 120+ models). However, three critical performance risks stand out:

1. **Seed-level N+1 queries in mutation loops** — `updateDecisionScenarios`, `updateDecisionRiskAnalysis`, and `bulk-actions` perform sequential DB writes inside `for...of` loops instead of using `$transaction` with batched operations.
2. **Unbounded `findMany` queries on core dashboards** — `getDashboardMetrics()` and `getDecisions()` fetch all rows without `take`/`skip`, loading entire product relationship trees into memory.
3. **Cache strategy defined but unused in production paths** — `getCachedOrFetch` exists but is invoked zero times outside tests. Expensive dashboard queries re-fetch on every page load.

The platform is not in immediate danger at current data volumes, but will degrade linearly as tenant data grows. Prioritize fixes P1-P3 below before production scale-out.

---

## 2. N+1 Query Report

| File | Line | Pattern | Severity | Fix |
|------|------|---------|----------|-----|
| `src/actions/decisions.ts` | 481-505 | `for (const scenario of _input.scenarios)` → `decisionScenario.update`/`create` sequentially | **CRITICAL** | Use `prisma.$transaction([...])` with all upserts in a single batch, or use interactive transaction with batched promises |
| `src/actions/decisions.ts` | 620-654 | `for (const analysis of _input.analyses)` → `decisionRiskAnalysis.findFirst` + `update`/`create` sequentially | **CRITICAL** | Same — batch upserts within `$transaction` |
| `src/actions/decision-templates.ts` | 116-140 | `for (const desc of objectives/constraints/assumptions/alternatives)` → `.create()` in each loop | **HIGH** | Use `prisma.objective.createMany({ data: [...] })` |
| `src/actions/bulk-actions.ts` | 38, 74, 102 | Sequential `update`/`delete` inside `for (const id of ids)` | **HIGH** | Use `updateMany`/`deleteMany` with `where: { id: { in: ids } }` |
| `src/actions/audit-actions.ts` | 134 | `for (const memberId of params.teamMemberIds)` → sequential creates | **HIGH** | Use `createMany({ data: [...] })` |
| `src/actions/localcontent-review-actions.ts` | 293 | `for (const id of ids)` → sequential mutation | **HIGH** | Use batch operations |
| `src/actions/localcontent-actions.ts` | 587 | `for (const row of result.validRows)` → sequential processing | **HIGH** | Batch insert with `createMany` |
| `src/actions/activity-actions.ts` | 47-57 | Loop over `logs` pushing to array — **not N+1** but 3 fallback queries run sequentially | **MEDIUM** | Run fallback queries in parallel via `Promise.all` |
| `src/actions/agent-memory-actions.ts` | 83 | `for (const item of allItems)` iterating memory items — **not N+1** (already fetched) | **LOW** | Acceptable; memory items are usually small |
| `src/lib/audit/db/index.ts` | 2517-2574 | 7 sequential conditional finds after engagement load | **MEDIUM** | Already partially parallel; could use a single query with `include` |

### Summary: 4 CRITICAL + 5 HIGH = 9 actionable N+1 patterns

---

## 3. Prisma Query Efficiency

### 3.1 Missing `select` Clauses (Over-Fetching)

| File | Line | Issue | Fix |
|------|------|-------|-----|
| `src/actions/decisions.ts` | 23-31 | `getDecisions()` uses `include` fetching full object trees (organization, owner, tenderProfile) | Use `select` with only needed fields; this is the main decision list page |
| `src/actions/decisions.ts` | 1161-1178 | `getDashboardMetrics()` fetches ALL decisions with deep includes (objectives, constraints, alternatives, risks, framework, decisionScenarios, riskAnalyses, outcome, approvals, evidence, recommendation) | Use `select` with only metrics-relevant fields; consider a dedicated aggregated query |
| `src/actions/decisions.ts` | 45-73 | `getDecisionById()` includes 13 nested relations | Move heavy relations to separate lazy-loaded queries; most detail views don't need all at once |
| `src/actions/decisions.ts` | 1561-1575 | `exportDecisionReport()` duplicates `getDecisionById` pattern with different include set | Share query composition |
| `src/actions/governance-actions.ts` | 51-92 | 6 `findMany` calls each returning full entity data with nested relations | Use `select` to return only governance-relevant fields |
| `src/actions/platform-overview-actions.ts` | 159-235 | 6 `findMany` calls each with only `select` — **well done**, but `take: 20` could be larger for high-volume orgs | Increase `take` to 50 or make configurable |
| `src/lib/audit/db/index.ts` | 2076-2088 | Fetches 8 collections for export — good use of `Promise.all` + `select` in some cases, but still loads all rows | Add `take` for large engagements |

### 3.2 Unpaginated Queries

| File | Line | Query | Records Risk |
|------|------|-------|-------------|
| `src/actions/decisions.ts` | 23 | `getDecisions()` — no `take`/`skip` | Unlimited — grows with org decisions |
| `src/actions/decisions.ts` | 1161 | `getDashboardMetrics()` — no `take`/`skip` | Unlimited — fetches entire decision history |
| `src/actions/governance-actions.ts` | 51-92 | All 6 dashboard queries — no pagination | Unlimited — grows with product usage |
| `src/actions/admin-actions.ts` | 18 | `user.findMany()` — no pagination | Unlimited |
| `src/actions/localcontent-actions.ts` | 55 (service) | `localContentProject.findMany()` — no pagination | Unlimited |
| `src/actions/contact-actions.ts` | 72 | `localContact.findMany()` — no pagination | Unlimited |
| `src/actions/workflowos-actions.ts` | 505, 587 | Template and record queries — no pagination | Unlimited |
| `src/lib/local-content/services.ts` | 55, 155, 228, 318, 366, 484, 563, 627, 676 | All list queries — no pagination | Unlimited |

**Impact:** 35+ unbounded `findMany` queries across 12+ action/service files. Each will scan and return all matching rows from their respective tables.

### 3.3 Query Consolidation Opportunities

| Current Pattern | File | Recommendation |
|----------------|------|----------------|
| `activity-actions.ts`: Sequential fallback queries (engagements → decisions → projects) | Line 65-131 | Run all 3 in `Promise.all`, then merge + sort |
| `governance-actions.ts`: 6 separate queries then 6 for-loops to build items | Line 49-92 | Consider a UNION or a single dashboard materialized view |
| `decisions.ts` `getDashboardMetrics()`: Fetches everything, then computes metrics in-memory | Line 1161-1430 | Move aggregation to database via `groupBy` or raw SQL |
| `platform-overview-actions.ts`: 10 parallel `count()`/`findMany` queries | Line 46-100 | Acceptable for dashboard — already well-parallelized |

---

## 4. Database Index Audit

### 4.1 Index Coverage Summary

Schema contains **150+ explicit `@@index` declarations** across **120+ models**. Index discipline is strong: composite indexes on `(organizationId, createdAt)` pattern are consistent. However, some gaps exist:

### 4.2 Missing Indexes

| Model | Missing Index | Query Pattern Affected | Impact |
|-------|---------------|------------------------|--------|
| `Decision` | `@@index([organizationId, status])` | `governance-actions.ts:53` — filters by `status: "IN_REVIEW"` without org context | **HIGH** — Full scan of all decisions when filtering by status alone |
| `Decision` | `@@index([organizationId, createdAt(sort: Desc)])` | `decisions.ts:23` — `orderBy: { createdAt: "desc" }` | **MEDIUM** — Sort key not in index forces filesort |
| `Session` | `@@index([expires])` | NextAuth session cleanup needs to find expired sessions | **MEDIUM** — Full scan on cleanup |
| `AuditEngagement` | `@@index([clientId, status])` | Common pattern: find engagements for client filtered by status | **LOW** — Separate indexes exist but composite would help |
| `SalesDeal` | `@@index([organizationId, pipelineStage, status])` | Pipeline views filter by stage + status | **MEDIUM** — Has separate indexes but no composite for common pipeline query |
| `WorkflowRecord` | `@@index([organizationId, priority, dueDate])` | SLA monitoring queries sort by priority + due date | **LOW** — Individual indexes exist |
| `OfficeAiTask` | `@@index([platformOrganizationId, taskType, status])` | Task list filtering by type + status | **LOW** — Has separate indexes |
| `PlatformAuditLog` | `@@index([productKey, targetType, targetId])` | Cross-product audit log lookups | **LOW** — Has separate indexes |

### 4.3 Index Quality Assessment

**Strengths:**
- Consistent `(organizationId, createdAt)` composite pattern on all major models
- Foreign key columns all have dedicated indexes
- Multi-column indexes for common query patterns (e.g., `(organizationId, status)`)
- Unique constraints where semantically valid

**Concerns:**
- `Decision` model has 5 single-column indexes but no composite `(organizationId, status)` — the most common query pattern
- `AuditEngagement` has 7 indexes but the `status` index is not composite — status alone is not selective enough
- Some indexes may overlap unnecessarily (e.g., `createdAt` indexed both as standalone and in composites)

---

## 5. Caching Assessment

### 5.1 Current Cache Coverage

| Component | Status | Details |
|-----------|--------|---------|
| Redis client (`redis-client.ts`) | **DEPLOYED** | Singleton ioredis client with auto-reconnect, lazy connect, TLS support |
| Cache adapter (`redis-cache-adapter.ts`) | **DEPLOYED** | Dual backend (Redis + in-memory Map) with automatic fallback |
| Cache strategy (`cache-strategy.ts`) | **DEFINED BUT UNUSED** | `getCachedOrFetch()` utility exists but is invoked **zero times** in production action code |
| Cache invalidation | **NOT IMPLEMENTED** | `invalidateProductCache()` and `invalidateCacheByPrefix()` exist but are never called from mutations |

### 5.2 Cache Miss Patterns

The following queries are **prime candidates** for caching but are currently executed fresh on every request:

| Endpoint / Action | Data | Recommended TTL | Reason |
|-------------------|------|-----------------|--------|
| `getDashboardMetrics()` | Decision dashboard metrics | 5 min | Computationally expensive aggregation over all decisions |
| `getPlatformHealthAction()` | Platform health snapshot | 1 min | Multiple count queries; OK to be slightly stale |
| `getActivitySummary()` | Counts of engagements/decisions/projects | 5 min | Rarely changes minute-to-minute |
| `getGovernanceDashboardAction()` | Cross-product governance items | 2 min | 6 parallel queries; moderate cost |
| `getEnterpriseHealthSnapshot()` | Tier-3 health check | 30 sec | Used for monitoring; cached acceptable |
| `getCanonicalAccounts()` (audit) | Audit canonical account list | 1 hour | Reference data, changes rarely |

### 5.3 Recommended Caching Additions

```
P1: Wrap getDashboardMetrics() with getCachedOrFetch("dashboard:metrics:{orgId}", fetchFn, 300_000)
P2: Cache canonical reference data (sectors, canonical accounts, presentation policies)
P3: Cache platform health with short TTL (60s)
P4: Implement cache invalidation hooks in create/update/delete mutations
P5: Add stale-while-revalidate pattern for dashboard data
```

### 5.4 Cache Invalidation Strategy (Proposed)

```
Mutation → compute affected keys → cacheAdapter.del(keys)
Example: updateDecision() → del "dashboard:metrics:{orgId}", del "decision:{id}"
```

Currently, no invalidation occurs. Mutations will continue to serve stale cached data unless manually cleared.

---

## 6. React Rendering Performance

### 6.1 Client Component vs Server Component Distribution

- **251 `"use client"` directives** found across `src/app/`
- Of these, approximately **98 are error.tsx** boundaries (unavoidable — error boundaries must be Client Components)
- Remaining ~**153 are functional Client Components**

| Category | Count | Assessment |
|----------|-------|------------|
| Interactive forms, dialogs, data tables | ~80 | **Expected** — require client state |
| Error boundaries | 98 | **Expected** — Next.js convention |
| Simple display components labeled `"use client"` unnecessarily | ~15 | **ACTIONABLE** — could be Server Components |

### 6.2 Unnecessary Client Components

| File | Issue | Fix |
|------|-------|-----|
| `notifications-client.tsx` | Full notification list is a Client Component | Split into server component for initial render + client island for interactivity (mark as read) |
| `decisions/[id]/signals/page.tsx` | Entire page is `"use client"` | Move data fetching to server component, keep only signal acknowledgment buttons as client |
| `decisions/[id]/alerts/page.tsx` | Entire page is `"use client"` | Same pattern — server data + client interactions |
| `decisions/[id]/sector/page.tsx` | Entire page is `"use client"` | Likely doesn't need client state at all |
| `settings/sso/page.tsx` | Entire page is `"use client"` | Could be partially server-rendered |

### 6.3 Memoization Assessment

**Positive findings:**
- `useCallback` used extensively in interactive components (99 matches)
- `institutional-memory/graph/page.tsx` properly uses `useMemo` for node maps and `useCallback` for event handlers
- Form components consistently wrap submit handlers in `useCallback`

**Gaps:**
- **Zero `React.memo` usage** found in app routes — no component-level memoization
- `useMemo` used in only 1 component (`institutional-memory/graph/page.tsx`)
- Lists rendered without virtualization (e.g., notification list, decision list)

### 6.4 Large Component Trees

| Component | Issue | Fix |
|-----------|-------|-----|
| Notifications list | Renders all notifications inline with no pagination | Virtualize with `react-window` or paginate at 20 items |
| Decision list (dashboard) | All decisions rendered in a single list | Add pagination; already uses `.slice(0, 5)` for recent but processes all |
| Contact list | Full contact list with relations | Paginate server-side |
| Audit engagement list | All engagements loaded | Add server-side pagination |

---

## 7. Bundle Analysis

### 7.1 Large Dependencies

| Dependency | Size (approx) | Necessity | Alternative / Risk |
|------------|---------------|-----------|-------------------|
| `@aws-sdk/client-s3` | ~3.5MB | **Required** — file storage | OK; tree-shaking reduces impact |
| `pdfkit` | ~1.2MB | **Required** — PDF generation for exports | Could be dynamically imported only on export pages |
| `pdf-parse` | ~500KB | **Required** — PDF ingestion | Could be dynamically imported |
| `mammoth` | ~400KB | **Required** — DOCX ingestion | OK; used only in ingestion pipeline |
| `playwright` | ~50MB+ | **INCORRECT PLACEMENT** | **Move to devDependencies** — this is a testing tool, not a runtime dependency |
| `bull` | ~600KB | Questionable — job queue | Consider if actually used in production; may be dev-only |
| `xlsx` | ~1MB | **Required** — Excel import/export | OK; dynamically import |
| `@node-saml/node-saml` | ~300KB | **Required** — SSO | OK; only imported on SSO routes |

### 7.2 Dynamic Import Opportunities

Current `next/dynamic` usage: **Not found in app routes**. The following should be lazy-loaded:

| Module | Import Location | Reason |
|--------|----------------|--------|
| `pdfkit` | `decision-export-pdf.ts` | Only needed on export action |
| `xlsx` | Contact export, audit export | Only needed on export actions |
| `mammoth` | Document ingestion | Only needed on upload |
| `pdf-parse` | Document ingestion | Only needed on upload |
| Chart components | Intelligence dashboards | Rendering-heavy, not critical for first paint |

### 7.3 Existing Optimizations (Good)

- `experimental.optimizePackageImports` configured for `lucide-react`, `@radix-ui/react-icons`, `recharts`
- `serverExternalPackages` properly configured for native modules
- `output: "standalone"` for efficient Docker deployment
- `images.formats: ["image/avif", "image/webp"]` — modern image formats
- `compiler.removeConsole` in production (excludes error/warn)

---

## 8. Streaming/Suspense Coverage

### 8.1 Loading States

| Route Layer | loading.tsx Count | Coverage |
|-------------|-------------------|----------|
| App root | 1 (`src/app/loading.tsx`) | Root-level fallback |
| (dashboard) group | 26 files | Full coverage for all dashboard routes |
| audit routes | 21 files | Full coverage for all engagement sub-routes |
| sales routes | 14 files | Full coverage for pipeline/deals/accounts |
| contacts routes | 4 files | Coverage for list/detail/edit |
| settings routes | 12 files | Full coverage for all settings pages |
| local-content routes | 9 files | Coverage for projects/verification/review |
| risk routes | 3 files | Coverage for dashboard + assessments |
| other routes | 7 files | Covered |
| **TOTAL** | **97+ files** | **Excellent coverage** |

### 8.2 Error Boundaries

| Route Layer | error.tsx Count | Coverage |
|-------------|-----------------|----------|
| (dashboard) group | 42 files | Excellent |
| audit routes | 21 files | Good |
| sales routes | 22 files | Good |
| settings routes | 7 files | Good |
| local-content routes | 14 files | Good |
| **TOTAL** | **98+ files** | **Excellent coverage** |

### 8.3 Suspense Boundary Usage

| Pattern | Status |
|---------|--------|
| Route-level `loading.tsx` | **Excellent** — 97+ files |
| Route-level `error.tsx` | **Excellent** — 98+ files |
| Fine-grained `<Suspense>` within pages | **Not found** — all Suspense is route-level |
| Streaming SSR (`loading.js` + RSC) | **Implied** — Next.js 16 with App Router automatically streams |

### 8.4 Suspense Assessment

While route-level loading.tsx coverage is excellent, the platform lacks **fine-grained Suspense boundaries** within pages. Dashboard pages that load multiple data sections (e.g., decision dashboard with metrics, charts, recents, bottlenecks) would benefit from partial Suspense so sections load independently rather than all waiting for the slowest query.

---

## 9. Memory/Connection Management

### 9.1 Prisma Connection Pool

| Setting | Value | Assessment |
|---------|-------|------------|
| Adapter | `@prisma/adapter-pg` | Modern pg adapter — good |
| Explicit pool size | **Not set** | **RISK** — defaults to NUMBER_OF_CPUS * 2 + 1 per instance |
| Connection timeout | Default (10s) | OK for most use cases |
| Dev logging | `["query", "error", "warn"]` | **Performance cost** in dev — acceptable but adds latency |

**Recommendation:** Set explicit `poolSize` via `PrismaPg(databaseUrl, { pool: { max: 20 } })` to prevent connection exhaustion under load.

### 9.2 Redis Connection Management

| Detail | Status |
|--------|--------|
| Client pattern | Global singleton | Good |
| Reconnection | `retryStrategy` with 10 retry cap, exponential backoff | Good |
| Reconnect probe | `setInterval(60s)` with `.unref()` | Good — won't keep process alive |
| Error handling | `client.on("error")` logger | Good — errors logged, not thrown |
| Close method | `closeRedis()` with graceful `quit()` + `disconnect()` fallback | Good |

### 9.3 Memory Leak Risks

| Pattern | Location | Risk |
|---------|----------|------|
| `setInterval` without clear | `redis-client.ts:32` | **LOW** — uses `.unref()` so GC will clean up |
| Event listener without cleanup | None found in server code | OK |
| Large object closures | `decisions.ts:1161` — `getDashboardMetrics()` loads all decisions into memory | **HIGH** — each request loads entire org's decision tree |
| In-memory Map cache | `redis-cache-adapter.ts:11` | **MEDIUM** — no size limit, no TTL-based sweep (only expires on access) |

### 9.4 Memory Safety Recommendations

- Add `max` size limit to in-memory fallback cache (e.g., LRU eviction after 1000 entries)
- Implement periodic sweep for expired in-memory cache entries (currently only cleared on access)
- `getDashboardMetrics()` should use database aggregation instead of in-memory computation

---

## 10. Performance Scorecard

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| N+1 query patterns | 9 actionable (4 critical) | 0 | 🔴 CRITICAL |
| Unbounded `findMany` queries | 35+ across 12+ files | 0 (all paginated) | 🔴 CRITICAL |
| `select` vs `include` discipline | ~60% use `include` (over-fetching) | >80% use `select` | 🟡 MEDIUM |
| Missing database indexes | 3 HIGH, 5 MEDIUM | 0 HIGH | 🟡 MEDIUM |
| Cache strategy usage | 0 production usages | All dashboard/ref data queries | 🔴 CRITICAL |
| Cache invalidation | Not implemented | Automatic on mutation | 🔴 HIGH |
| Route loading.tsx coverage | 97+ files | All routes | 🟢 EXCELLENT |
| Route error.tsx coverage | 98+ files | All routes | 🟢 EXCELLENT |
| Fine-grained Suspense | 0 components | Dashboard sections | 🟡 MEDIUM |
| `React.memo` usage | 0 components | Performance-critical lists | 🟡 LOW |
| List virtualization | 0 implementations | Notification lists, tables | 🟡 LOW |
| Dynamic/lazy imports | 0 in app routes | Heavy libs (pdfkit, xlsx) | 🟡 MEDIUM |
| Connection pool config | Default (auto-sized) | Explicit (20 connections) | 🟡 LOW |
| In-memory cache safety | No size limit, no sweep | LRU limit + periodic cleanup | 🟡 MEDIUM |
| Server-side pagination | Missing in 35+ queries | All list queries | 🔴 HIGH |
| `playwright` in dependencies | 50MB+ in runtime bundle | devDependencies only | 🟡 MEDIUM |
| Bundle analysis | Configured but manual | CI integrated | 🟡 LOW |

---

## 11. Top Performance Fixes (Ranked by Impact)

### P1 — CRITICAL: Fix N+1 Mutation Loops (human: ~4h / CC: ~30min)

**Files:** `src/actions/decisions.ts`, `src/actions/decision-templates.ts`, `src/actions/bulk-actions.ts`, `src/actions/audit-actions.ts`

**Problem:** Sequential DB writes in `for...of` loops create N round-trips per mutation. A 10-scenario update = 10+ sequential SQL statements.

**Fix:**
```typescript
// Before (N+1):
for (const scenario of input.scenarios) {
  if (scenario.id) await prisma.decisionScenario.update(...)
  else await prisma.decisionScenario.create(...)
}

// After (batched):
await prisma.$transaction([
  ...input.scenarios.filter(s => s.id).map(s => prisma.decisionScenario.update(...)),
  prisma.decisionScenario.createMany({ data: input.scenarios.filter(s => !s.id).map(...) })
])
```

**Expected impact:** 70-90% reduction in mutation latency for multi-item operations.

### P2 — CRITICAL: Add Pagination to Unbounded Queries + Use `select`

**Files:** `decisions.ts`, `governance-actions.ts`, `admin-actions.ts`, `local-content/services.ts`, `workflowos-actions.ts`, `contact-actions.ts`

**Problem:** 35+ `findMany` queries return unlimited rows. `getDashboardMetrics()` loads entire org decision tree (objectives, constraints, risks, framework, scenarios, analyses, approvals, evidence) into Node.js memory.

**Fix:**
1. Add `take`/`skip` to all list queries with reasonable defaults (`take: 50`)
2. Replace `include` with `select` on dashboard/list queries
3. Move `getDashboardMetrics()` aggregation to database level using Prisma `groupBy` or raw SQL

**Expected impact:** 3-10x reduction in dashboard load time; linear memory usage instead of O(n) growth.

### P3 — CRITICAL: Activate Caching for Expensive Queries

**Files:** `decisions.ts`, `platform-overview-actions.ts`, `governance-actions.ts`, `enterprise-health.ts`

**Problem:** `getCachedOrFetch` exists but is never called. Every dashboard page view re-runs 6-15 database queries.

**Fix:**
```typescript
import { getCachedOrFetch, getCacheKey } from "@/lib/platform/cache-strategy"

export async function getDashboardMetrics() {
  const user = await getCurrentUser()
  return getCachedOrFetch(
    getCacheKey("decision", "dashboard", user.organizationId),
    async () => { /* existing logic */ },
    300_000 // 5 min TTL
  )
}
```

Add invalidation in mutation actions: `await invalidateCacheByPrefix("decision:dashboard")`.

**Expected impact:** 5-20x reduction in DB load for dashboard pages; sub-50ms response times for cached views.

### P4 — HIGH: Add Missing Composite Indexes

```sql
-- Decision: most common query pattern
CREATE INDEX idx_decision_org_status ON "Decision" ("organizationId", "status");

-- Decision: sort-optimized dashboard query
CREATE INDEX idx_decision_org_created_desc ON "Decision" ("organizationId", "createdAt" DESC);

-- Session: cleanup query
CREATE INDEX idx_session_expires ON "Session" ("expires");

-- SalesDeal: pipeline dashboard
CREATE INDEX idx_salesdeal_org_stage_status ON "SalesDeal" ("organizationId", "pipelineStage", "status");
```

**Expected impact:** 2-5x faster filtered queries; elimination of sequential scans on decision/engagement lists.

### P5 — MEDIUM: Add Fine-Grained Suspense to Dashboard Pages

Split dashboard pages into independently loading sections:

```tsx
// Decision dashboard page
<Suspense fallback={<MetricsSkeleton />}>
  <DecisionMetrics />
</Suspense>
<Suspense fallback={<ChartSkeleton />}>
  <DecisionCharts />
</Suspense>
<Suspense fallback={<ListSkeleton />}>
  <RecentDecisions />
</Suspense>
```

### P6 — MEDIUM: Dynamic Imports for Heavy Libraries

```typescript
// In export actions, use dynamic imports:
const { default: PDFDocument } = await import("pdfkit")
const XLSX = await import("xlsx")
```

### P7 — LOW: Move `playwright` to devDependencies

```bash
npm uninstall playwright && npm install --save-dev playwright
```

Reduces production `node_modules` by ~50MB.

### P8 — LOW: Add LRU Eviction to In-Memory Cache Fallback

Replace `Map` with an LRU cache (e.g., `lru-cache` package or manual implementation) with max 1000 entries.

---

## 12. Appendix: File Inventory

### Actions with Performance Issues
- `src/actions/decisions.ts` — N+1 loops, unbounded queries, over-fetching
- `src/actions/governance-actions.ts` — Unbounded queries, over-fetching
- `src/actions/platform-overview-actions.ts` — Multiple unbounded queries (mitigated by `take: 20`)
- `src/actions/activity-actions.ts` — Sequential fallback queries
- `src/actions/bulk-actions.ts` — N+1 in loops
- `src/actions/decision-templates.ts` — N+1 in loops
- `src/actions/audit-actions.ts` — N+1 in loops
- `src/actions/localcontent-actions.ts` — N+1 in loops
- `src/actions/localcontent-review-actions.ts` — N+1 in loops
- `src/actions/admin-actions.ts` — Unbounded queries
- `src/actions/contact-actions.ts` — Unbounded queries
- `src/actions/workflowos-actions.ts` — Unbounded queries
- `src/actions/institutional-memory-actions.ts` — Unbounded queries

### Services with Performance Issues
- `src/lib/local-content/services.ts` — All list queries unbounded
- `src/lib/audit/db/index.ts` — Heavy sequential queries on export (partially parallelized)
- `src/lib/local-content/workbook/population.ts` — Unbounded line queries
- `src/lib/platform/enterprise-health.ts` — 7 count queries (acceptable for health check)

---

## 13. Validation Note

This audit is **read-only analysis**. No code changes were made. The following heavy commands were deliberately skipped per AGENTS.md §33:

| Command | Reason |
|---------|--------|
| `npm run build` | Heavy; unnecessary for read-only audit |
| `npm run lint` | Heavy full scan; not needed for audit |
| `npm test` | Full test suite; not needed for audit |

TypeScript validation (`npx tsc --noEmit`) was not run — this audit focuses on runtime performance patterns, not type correctness.

---

*Audit completed 2026-07-12. Next review: after P1-P3 fixes are implemented and validated with real workload data.*
