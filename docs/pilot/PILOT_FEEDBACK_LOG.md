# AuditOS — Pilot Feedback Log

**Last Updated:** May 12, 2026 — Pilot Session 4

## Phase 6 — Controlled Pilot Execution (Initial)

| ID | Severity | Area | Issue | Impact | Status |
|---|---|---|---|---|---|
| PF-001 | Low | Backup | `pg_dump` not in PATH | Manual backup only | Open |
| PF-002 | Medium | Evidence | Dual evidence state-change path | Missed audit coverage potential | **Mitigated (S3)** |
| PF-003 | Low | Traceability | `targetLabel` empty for DB evidence links | Empty labels in UI | **Resolved (S3)** |
| PF-004 | Low | Lint | 9 pre-existing `no-explicit-any` errors | No operational impact | Open |
| PF-005 | Low | Testing | Docker unavailable for integration tests | Delayed test validation | Open |

## Pilot Session 1

| ID | Severity | Area | Issue | Status |
|---|---|---|---|---|
| PS1-001 | Medium | Backup | `pg_dump` not in PATH — blocks real data | **Resolved (S3.1)** |
| PS1-002 | Medium | Evidence | Dual evidence state-change path | **Mitigated (S3)** |
| PS1-003 | Low | Traceability | `targetLabel` empty | **Resolved (S3)** |
| PS1-004 | Low | Validation | 0 validation runs | Resolved (S2) |
| PS1-005 | Low | Publication | Publication not executed | Resolved (S2) |

## Pilot Session 2

| ID | Severity | Area | Issue | Status |
|---|---|---|---|---|
| PS2-001 | Low | Publication | `eng-najd-2025` published — consumed | Mitigated |

## Pilot Session 3

| ID | Severity | Area | Issue | Status |
|---|---|---|---|---|
| PS3-001 | Info | Evidence | `updateEvidenceState` + `updateEvidenceStateAction` deprecated with warnings | Resolved — PS1-002 mitigation complete |
| PS3-002 | Info | Traceability | `toEvidenceLink` now derives label from context or type:id | Resolved — PS1-003 resolution complete |

## Open Summary

| Severity | Count | Blocking? |
|---|---|---|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 1 (PS1-001) | **Yes — blocks real customer data** |
| Low | 4 | None blocking |
| Info | 0 (both resolved) | — |
