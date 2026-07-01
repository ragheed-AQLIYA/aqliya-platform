# SalesOS v0.3 PR-21d — Phase 0 operator pack

**Status:** Documentation + script only  
**Date:** 2026-06-01  
**Validation:** not validated (echo-only script; no migrate/seed executed)

## Deliverables

| Item | Path |
|------|------|
| Phase 0 apply script (echo default) | `scripts/salesos-phase0-apply.ps1` |
| Runbook PR-8–20 routes + smoke §8 | `docs/operations/salesos-migration-runbook.md` |
| L5 vs L6 readiness assessment | `docs/reports/salesos-l6-readiness-assessment.md` |
| Progress PR-21 status | `docs/reports/salesos-l6-progress.md` |

## Script usage

```powershell
# Echo commands only (default):
powershell -ExecutionPolicy Bypass -File scripts/salesos-phase0-apply.ps1

# Run after human approval:
powershell -ExecutionPolicy Bypass -File scripts/salesos-phase0-apply.ps1 -Execute
```

## Arabic one-liner

> PR-21d: سكربت Phase 0 يطبع أو ينفّذ migrate وgenerate وseed، وrunbook مسارات PR-8–20، وتقييم صادق — pilot بشروط وليس إنتاجاً.
