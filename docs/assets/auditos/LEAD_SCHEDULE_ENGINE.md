# Lead Schedule Engine — AuditOS 2.0 Phase 3

**Status:** Implemented (feature-flagged, default off)  
**Flag:** `audit.lead-schedule-auto` / `FF_AUDIT_LEAD_SCHEDULE_AUTO=true`  
**Route:** `/audit/engagements/[id]/lead-schedules`

## Purpose

Auto-generate **ISA 230 lead schedules** from confirmed account mappings, grouped by statement classification category. Each schedule becomes a `WorkingPaperIndex` + `LeadSchedule` + `LeadScheduleLine` bundle.

Pipeline position:

```
Mapping (confirmed) → Lead Schedules → FS rebuild → Reporting Graph
```

## Module Layout

| File | Role |
| ---- | ---- |
| `types.ts` | Validation codes LS-001–LS-004 |
| `category-labels.ts` | Arabic/English category labels + paper numbers |
| `balance-utils.ts` | Closing balance from mapping (mirrors FS logic) |
| `lead-schedule-repository.ts` | Upsert paper + schedule + lines |
| `lead-schedule-generator.ts` | Generate, list, validate, rollforward |
| `index.ts` | Flag + `maybeGenerateLeadSchedules` hook |

## Validation Codes

| Code | Severity | Rule |
| ---- | -------- | ---- |
| LS-001 | error | Confirmed mappings but no lead schedules |
| LS-002 | error | Line total ≠ header closing balance |
| LS-003 | warning | Large PY/CY variance |
| LS-004 | error | Schedule with zero lines |

## Integration

| Trigger | Behavior |
| ------- | -------- |
| Mapping confirm → FS rebuild | `maybeGenerateLeadSchedules` when flag on |
| Manual | Lead schedules tab → «توليد / إعادة توليد» |
| Reporting graph | Lead schedule nodes synced on full graph resync |

## Local Testing

```env
FF_AUDIT_LEAD_SCHEDULE_AUTO=true
FF_AUDIT_REPORTING_GRAPH=true
```

1. Upload TB → confirm mappings
2. Open `/lead-schedules` — schedules per category
3. Run validation — expect pass when lines tie to header

## Phase 4 — Complete

Reconciliation checks implemented — see [`RECONCILIATION_ENGINE.md`](./RECONCILIATION_ENGINE.md).

## Known Limitations

- Prior-year balances default to 0 (rollforward placeholder until PY TB import)
- Materiality threshold fixed at SAR 50,000 for summary counts
- Reuses existing `WorkingPapersEngine` schema; no separate export format yet
