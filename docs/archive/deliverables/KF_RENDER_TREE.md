# KF Render Tree — Knowledge Foundation Dashboard

**Generated:** 2026-06-23  
**Phase:** PHASE_29_KF_SSR_FORENSICS  
**Status:** STATIC ANALYSIS (pre-instrumentation)

---

## Root Page

```
src/app/(dashboard)/knowledge-foundation/page.tsx
```

| Attribute | Value |
|-----------|-------|
| Type | **Server Component** |
| Export | `default async function KnowledgeFoundationPage()` |
| Dynamic | `export const dynamic = "force-dynamic"` |
| Guard | `server-only` import |

### Data Flow (before render)

```
1. getCurrentUser()                        → user
2. redirect("/login")                       if !user
3. listVersions()                           → versions[]
4. getFoundationDashboardKPIs()             → kpis
5. getFoundationCandidatePoolOverview()     → poolOverview (operator only)
```

**Status:** KF_DIAG_ALL_OK confirmed. All 3 queries pass.

---

## Render Tree (post-KF_DIAG_ALL_OK)

```
Page (KnowledgeFoundationPage — Server Component)
 │
 ├── <FoundationKpiCards kpis={kpis} />
 │   │
 │   └── <StatCard> × 11
 │       └── (inline JSX, no hooks, no client APIs)
 │
 ├── CONDITIONAL: {isOperator && poolOverview && (
 │   └── <CandidatePoolOverviewCard overview={poolOverview} />
 │       └── <PoolStat> × 4
 │           └── (inline JSX, no hooks, no client APIs)
 │   )}
 │
 ├── CONDITIONAL: {isOperator && (
 │   └── <a> × 3 (action links)
 │   )}
 │
 ├── <VersionTable versions={versions} />
 │   └── <table> with <tr> × versions.length
 │       └── (inline JSX, no hooks, no client APIs)
 │
 └── <section> (governance cycle card — inline JSX)
     └── div.grid with 5 inline stat cards
```

---

## Component Detail

### FoundationKpiCards
| Attribute | Value |
|-----------|-------|
| File | `src/components/knowledge-foundation/kpi-cards.tsx` |
| Type | **Server Component** |
| `"use client"` | **NO** |
| Hooks | None |
| Dynamic imports | None |
| Browser APIs | None |
| Non-serializable types | None (FoundationKPIs all plain) |
| Risk | LOW |

### CandidatePoolOverviewCard
| Attribute | Value |
|-----------|-------|
| File | `src/components/knowledge-foundation/candidate-pool-overview-card.tsx` |
| Type | **Server Component** |
| `"use client"` | **NO** |
| Hooks | None |
| Dynamic imports | None |
| Browser APIs | None |
| Non-serializable types | None (CandidatePoolOverview all plain numbers) |
| Risk | LOW |

### VersionTable
| Attribute | Value |
|-----------|-------|
| File | `src/components/knowledge-foundation/version-table.tsx` |
| Type | **Server Component** |
| `"use client"` | **NO** |
| Hooks | None |
| Dynamic imports | None |
| Browser APIs | None |
| Non-serializable types | None (VersionListItem all primitive fields) |
| Risk | LOW |

---

## Suspense Boundaries

| Boundary | Location | Covers |
|----------|----------|--------|
| None | — | — |

All rendering is synchronous. No Suspense boundaries wrap any child component.

---

## Imports At Page Level (post-ALL_OK)

| Import | Type | Risk |
|--------|------|------|
| `FoundationKpiCards` | Server component | LOW |
| `CandidatePoolOverviewCard` | Server component | LOW |
| `VersionTable` | Server component | LOW |
| `PlusCircle` (lucide-react) | Icon component | LOW |
| `FileDiff` (lucide-react) | Icon component | LOW |
| `History` (lucide-react) | Icon component | LOW |

---

## Potential SSR Failure Points (Pre-Instrumentation)

| # | Category | Suspect | Likelihood |
|---|----------|---------|------------|
| A | React render exception | All pure JSX, no state | LOW |
| B | Client component SSR incompatibility | No `"use client"` components | NONE |
| C | Serialization failure | All data plain/primitive | LOW |
| D | Suspense deadlock | No Suspense boundaries | NONE |
| E | Dynamic import failure | No dynamic imports | NONE |
| F | Hydration mismatch | Server components only | NONE |
| G | Unhandled promise rejection | All queries awaited | LOW |
| H | Other | RSC runtime issue | MEDIUM |

---

## Conclusion (Static Analysis)

Static analysis reveals **no obvious SSR failure point**. All child components are:
- Pure Server Components
- No client-side API usage
- Plain serializable data types
- No Suspense/dynamic imports
- No hooks or lifecycle methods

The failure must be captured dynamically via instrumented build.

---
