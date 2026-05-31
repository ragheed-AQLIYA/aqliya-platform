# W5-KG-FILTERS — Knowledge graph explorer filters

**Status:** `W5_KG_FILTERS_COMPLETE`

## Scope

- **Filters** — `KnowledgeGraphExplorer` on `/sales/intelligence#graph` supports `?account=` and `?industry=` query params (Arabic filter bar).
- **Subgraph stats** — When filtered, snapshot `scope: subgraph` with node/edge counts scoped to depth-2 subgraph; partial badge and Arabic labels.
- **API** — `GET /api/sales/intelligence/knowledge-graph?organizationId=<org>&accountId=&industry=` returns filtered snapshot + `meta.scope` / `meta.filter`.
- **Service** — `buildCommercialKnowledgeGraphFilteredSnapshot`, `buildKnowledgeGraphApiUrl`; `salesGetCommercialKnowledgeGraphSnapshot(org, limit, filters)`.

## Files

| Path | Role |
| ---- | ---- |
| `src/lib/sales/vnext/commercial-knowledge-graph.ts` | Filter types, subgraph snapshot builder, API URL helper |
| `src/lib/sales/services/commercial-knowledge-graph-service.ts` | Filter-aware snapshot entry point |
| `src/app/api/sales/intelligence/knowledge-graph/route.ts` | `accountId` / `industry` query params |
| `src/components/sales/knowledge-graph-filter-bar.tsx` | Client filter selects (Arabic) |
| `src/components/sales/knowledge-graph-explorer.tsx` | Subgraph stats, API link, filter UI |
| `src/app/sales/intelligence/page.tsx` | Passes filter options + active params |

## Boundaries

- Read-only — no graph mutations.
- Account filter takes precedence when both params present.
- Subgraph depth capped at 2 per v0.2 queries (R-10).
- UI uses `?account=` / `?industry=`; API uses `?accountId=` / `?industry=` for clarity.

## Verification

```powershell
npx jest src/lib/sales/vnext/__tests__/commercial-knowledge-graph.test.ts --no-coverage --runInBand
```

**Result:** **14/14 PASS**

**W5_KG_FILTERS_COMPLETE**
