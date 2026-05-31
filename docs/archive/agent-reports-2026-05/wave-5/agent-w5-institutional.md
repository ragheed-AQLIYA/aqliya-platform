# W5-INSTITUTIONAL — Institutional learning deepen (Wave 5)

**Status:** `W5_INSTITUTIONAL_COMPLETE`

## Scope

- **Full Wave C snapshot** on `/platform/commercial` — executive `institutionalLearning.fullSnapshot` embeds `InstitutionalLearningPanel` beneath KPI summary
- **Memory tab** — `/sales/intelligence#memory` renders full Wave C panel via `IntelligenceMemoryView` + `focusRowId` scroll-to-row
- **Trend drill-down links** — `institutional-learning-links.ts` routes win_rate → `/sales/revenue`, activity_volume → `/sales/opportunities`, signal_strength → memory focus; evidenceMap rows and learning-trend cards link through
- **v0.4 learning-loop facade stub** — `src/lib/sales/vnext/learning-loop.ts` with `LEARNING_LOOP_V04_DISCLAIMER_*` and `V04_LEARNING_LOOP_CANDIDATE` token (not L5_READY)

## Files

| Path | Role |
| ---- | ---- |
| `src/lib/sales/vnext/institutional-learning-links.ts` | Drill-down href builders + row element ids |
| `src/lib/sales/vnext/learning-loop.ts` | v0.4 candidate loop facade stub |
| `src/lib/sales/services/executive-commercial-dashboard-service.ts` | `fullSnapshot`, trend/evidenceMap `href` fields |
| `src/components/sales/executive-commercial-dashboard.tsx` | Full panel embed + linked trends/evidence rows |
| `src/components/sales/institutional-learning-panel.tsx` | Trend links, focus highlight, scroll anchors |
| `src/components/sales/intelligence-memory-view.tsx` | Wave C panel + `focusRowId` on memory tab |
| `src/components/sales/intelligence-hub-tabs.ts` | `#memory/{rowId}` hash tab parsing |

## Boundaries

- Read-only — no store mutations; DRAFT recommendation labels preserved
- Learning loop stub is documentation/UI-shell ready — not production L5 certification
- No Prisma migrate/generate in this pass

## Tests

```powershell
npx jest src/lib/sales/vnext/__tests__/institutional-learning-links.test.ts `
  src/lib/sales/vnext/__tests__/learning-loop.test.ts `
  src/lib/sales/vnext/__tests__/institutional-learning.test.ts `
  src/lib/sales/__tests__/institutional-learning.test.ts `
  src/lib/sales/__tests__/intelligence-hub-tabs.test.ts `
  --no-coverage --runInBand
```

## Verification

- `/platform/commercial` — Wave C KPI summary + full institutional panel when seed org has evidenceMap rows
- `/sales/intelligence#memory` — full Wave C snapshot; `?focus={rowId}#memory` scrolls to highlighted row
- Executive learning-trend cards link to revenue, opportunities, ICP, or memory focus as appropriate

**W5_INSTITUTIONAL_COMPLETE**
