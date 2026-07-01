# Reporting Graph — AuditOS 2.0 Phase 2

**Status:** Implemented (feature-flagged, default off)  
**Flag:** `audit.reporting-graph` / `FF_AUDIT_REPORTING_GRAPH=true`  
**Depends on:** Existing TB, mapping, FS, notes tables (dual-write, no replacement)

## Purpose

Persist a **traceability graph** linking factory pipeline entities:

```
TB lines → Mappings → Canonical accounts → FS lines → Disclosure notes
```

Used by Phase 11 mind map when flag on; foundation for lead schedules (Phase 3) and reconciliation (Phase 4).

## Prisma Models

| Model | Role |
| ----- | ---- |
| `ReportingGraph` | 1:1 with `AuditEngagement` |
| `ReportingGraphNode` | Entity-backed node (`entityType` + `entityId`) |
| `ReportingGraphEdge` | Typed relationship (`MAPS_TO`, `PRESENTS_AS`, …) |
| `ReportingGraphSnapshot` | Immutable milestone payloads |
| `LeadScheduleLine` | Phase 3 prep on `LeadSchedule` |

**Migration:** `prisma/migrations/20260613100000_reporting_graph_foundation/`

## Module Layout

| File | Role |
| ---- | ---- |
| `graph-constants.ts` | Node/edge/entity type constants |
| `graph-repository.ts` | Upsert nodes/edges, snapshots |
| `graph-sync-service.ts` | Full resync + hooks |
| `graph-store-query.ts` | Persisted → mind-map view model |
| `graph-builder.ts` | Pure computed graph (fallback) |
| `graph-query.ts` | Store-first when flag on |

## Dual-Write Hooks

| Trigger | Location |
| ------- | -------- |
| TB upload | `services.uploadTrialBalance` |
| Mapping confirm → FS rebuild | `db.rebuildFinancialStatementsForEngagement` |

Sync is **full resync** per trigger (delete nodes/edges, rebuild). Safe for pilot scale.

## Local Testing

```env
FF_AUDIT_REPORTING_GRAPH=true
FF_AUDIT_MIND_MAP=true
```

1. Upload TB → check `ReportingGraphNode` count
2. Confirm mappings → FS rebuild → edges `PRESENTS_AS` to FS lines
3. Open `/factory-map` → persisted graph rendered

Apply migration:

```bash
npx prisma migrate deploy
```

## Phase 3 — Complete

Lead schedule auto-generation implemented — see [`LEAD_SCHEDULE_ENGINE.md`](./LEAD_SCHEDULE_ENGINE.md).

## Known Limitations

- Full resync (not incremental delta sync)
- Flag off → mind map uses computed graph only
- No UI for raw graph admin (read via factory-map + Prisma)
