# Escalation Test Log

## Status

⏳ **Planned — not yet executed.** This document defines the escalation test procedure and log template.

## Test Scenarios

| ID | Scenario | Expected L1 | Expected L2 | Expected L3 |
|----|----------|-------------|-------------|-------------|
| E1 | Database connection lost | Pilot operator checks connectivity | AQLIYA engineering investigates DB | Infrastructure admin restores |
| E2 | Auth failure — user cannot log in | Pilot operator checks user status | AQLIYA engineering checks AuditUser mapping | — |
| E3 | Upload blocked by scanner | Pilot operator verifies SCANNER_PROVIDER | AQLIYA engineering configures or overrides | — |
| E4 | Approval not working | Pilot operator checks readiness gate | AQLIYA engineering checks role/permissions | — |
| E5 | Export fails | Pilot operator retries, checks data | AQLIYA engineering checks export service | — |

## Test Execution Template

| Field | Value |
|-------|-------|
| Test ID | |
| Scenario | |
| Date | |
| Simulated by | |
| L1 contacted at | |
| L1 response at | |
| L1 resolution | |
| L2 contacted at (if needed) | |
| L2 response at | |
| L2 resolution | |
| L3 contacted at (if needed) | |
| L3 response at | |
| L3 resolution | |
| Total time to resolve | |
| Gaps found | |
| Improvements needed | |

## Test Log

| Date | ID | Scenario | Result | Time to Resolve | Gaps |
|------|----|----------|--------|-----------------|------|
| — | — | — | Not yet performed | — | — |

## Owner

| Task | Owner | Due |
|------|-------|-----|
| Schedule and execute escalation test | Pilot operator | Pre-production |
| Document results | Pilot operator | After test |
| Remediate gaps | AQLIYA engineering | After test |
