# AuditOS Pilot Environment Checklist

## Environment Identity

| Field                | Value |
| -------------------- | ----- |
| Environment name     |       |
| Environment URL      |       |
| Database name        |       |
| Git commit hash      |       |
| Deployment date      |       |
| Pilot operator       |       |
| Pilot participant(s) |       |

## Configuration Verification

| Check                       | Expected                     | Actual | Pass/Fail |
| --------------------------- | ---------------------------- | ------ | --------- |
| `AUDIT_ALLOW_MOCK_FALLBACK` | unset or `false`             |        |           |
| `STORAGE_PROVIDER`          | `local` (or `s3`)            |        |           |
| `DOWNLOAD_TOKEN_SECRET`     | set (if token download used) |        |           |
| `AUTH_SECRET`               | set                          |        |           |
| Database migrated           | yes                          |        |           |
| Seed data loaded            | yes                          |        |           |

## Access Verification

| Check                             | Expected                | Actual | Pass/Fail |
| --------------------------------- | ----------------------- | ------ | --------- |
| Operator can log in               | yes                     |        |           |
| Operator sees /audit route        | yes                     |        |           |
| Operator has correct role         | admin/operator/reviewer |        |           |
| Operator assigned to organization | yes                     |        |           |
| Non-pilot user cannot access      | no                      |        |           |
| Unauthenticated user blocked      | 401                     |        |           |

## Data Verification

| Check                          | Expected | Actual | Pass/Fail |
| ------------------------------ | -------- | ------ | --------- |
| Engagement exists              | >= 1     |        |           |
| Trial balance uploaded         | yes      |        |           |
| Accounts mapped                | yes      |        |           |
| Financial statements generated | yes      |        |           |
| Evidence uploaded              | >= 1     |        |           |
| Findings exist                 | >= 1     |        |           |
| Audit events logged            | yes      |        |           |

## Export Verification

| Check                              | Expected | Actual | Pass/Fail |
| ---------------------------------- | -------- | ------ | --------- |
| PDF export succeeds                | yes      |        |           |
| XLSX export succeeds               | yes      |        |           |
| Export includes disclaimer         | yes      |        |           |
| Export shows draft/approved status | yes      |        |           |

## Sign-Off

| Role                    | Name | Date | Signature |
| ----------------------- | ---- | ---- | --------- |
| Environment prepared by |      |      |           |
| Verified by             |      |      |           |
| Pilot operator          |      |      |           |
