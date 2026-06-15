# Recovery Artifacts Archive

**Purpose:** Non-product runtime captures moved out of `docs/audits/` during Phase R1 PR sanitization (2026-06-15).

These files are **CI/build/test logs** retained for local audit history. They are not required for:

- Application runtime
- AuditOS factory workflows
- Staging or production deployment

## Layout

| Path | Contents |
|------|----------|
| `runtime-logs/docs-audits/` | Reality audit, user-run, restart-build captures |
| `runtime-logs/docs-audits-evidence/` | Jest/build/Cypress/smoke/benchmark run logs |

## Policy

Do not re-add large lint or test output dumps to `docs/audits/`. Store new captures here or in private artifact storage.
