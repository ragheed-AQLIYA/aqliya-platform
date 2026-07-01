# AuditOS Factory Mind Map — Phase 11

**Status:** Implemented (feature-flagged, default off)  
**Flag:** `audit.mind-map` / `FF_AUDIT_MIND_MAP`  
**Route:** `/audit/engagements/[id]/factory-map`

## Purpose

Read-only visualization of the financial statement factory pipeline:

```
TB → Mapping → Financial Statements → Disclosure Notes
```

The graph is **computed** from existing engagement tables (no separate graph persistence in Phase 11). This keeps pilot-safe defaults while delivering traceability UX.

## Module

| File | Role |
| ---- | ---- |
| `src/lib/audit/reporting-graph/types.ts` | Node/edge/snapshot types |
| `graph-builder.ts` | Pure graph builder |
| `graph-query.ts` | Prisma load + build |
| `snapshot.ts` | `GraphSnapshot` via `AuditEvent` |
| `index.ts` | Public API + flag helper |

## GraphSnapshot

When `audit.mind-map` is on:

- **Approval milestone:** `createApprovalRecord(approved)` captures snapshot (`factory_graph.snapshot` audit event).
- **Manual:** "لقطة يدوية" on factory-map page.

Metadata includes full `graph` JSON + `stats` for audit trail.

## UI

- Tab: **خريطة المصنع** (after القوائم المالية)
- Component: `FactoryMindMap` — layered columns (RTL-friendly)
- Gated by workflow: requires TB + mappings + FS

## Governance

- Read-only — no mutations through mind map
- Snapshots are audit events (actor, timestamp, milestone)
- Does not bypass approval gates

## Phase 12 — Complete

See [`FACTORY_PILOT_READINESS.md`](./FACTORY_PILOT_READINESS.md) for pilot profiles, Go/No-Go, and snapshot audit-trail verification.

## Limitations

- No persisted `ReportingGraphNode` Prisma models in this branch (computed view only)
- Lead schedules / reconciliation nodes not shown until those modules exist on branch
- Large TB sets render all mapped accounts (scroll within columns)
