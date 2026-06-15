# Reporting Graph Schema Map — Phase 2

**Canonical schema:** `prisma/schema.prisma`  
**Migration:** `20260613100000_reporting_graph_foundation`

## Node Types → Source Entities

| `nodeType` | `entityType` | Source table |
| ---------- | ------------ | ------------ |
| `tb_account` | `AuditTrialBalanceLine` | `AuditTrialBalanceLine` |
| `mapping` | `AuditAccountMapping` | `AuditAccountMapping` |
| `canonical_account` | `AuditCanonicalAccount` | `AuditCanonicalAccount` |
| `fs_statement` | `AuditFinancialStatement` | `AuditFinancialStatement` |
| `fs_line` | `FinancialStatementLine` | JSON in `AuditFinancialStatement.lines` |
| `disclosure_note` | `AuditDisclosureNote` | `AuditDisclosureNote` |
| `lead_schedule` | `LeadSchedule` | Phase 3 |
| `lead_schedule_line` | `LeadScheduleLine` | Phase 3 |

## Edge Types

| `edgeType` | Meaning |
| ---------- | ------- |
| `MAPS_TO` | TB line → mapping, or mapping → canonical |
| `ROLLS_UP_TO` | FS statement → FS line |
| `PRESENTS_AS` | Mapping → FS line |
| `DISCLOSES` | FS line/statement → disclosure note |
| `RECONCILES` | Reserved Phase 4 |
| `SUPPORTS` | Reserved (evidence linkage) |

## Uniqueness

- Node: `@@unique([graphId, entityType, entityId])`
- Edge: `@@unique([graphId, edgeType, sourceNodeId, targetNodeId])`

## Snapshot Tables

`ReportingGraphSnapshot.payload` stores JSON `{ nodes, edges, version, trigger }` for milestone audit.

Separate from Phase 11 `AuditEvent` `factory_graph.snapshot` (view-model snapshot for mind map UI).
