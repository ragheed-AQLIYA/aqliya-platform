# Restore Verification Log

## Instructions

Before each production restore test:
1. Use a non-production database instance
2. Verify source backup integrity
3. Document each step
4. Record results

## Restore Test Template

| Field | Value |
|-------|-------|
| Test date | |
| Backup file | |
| Backup timestamp | |
| Backup size | |
| Restore target | |
| Restore start time | |
| Restore end time | |
| Duration | |
| Restored by | |

## Verification Steps

| # | Step | Expected | Actual | Pass/Fail |
|---|------|----------|--------|-----------|
| 1 | Connect to restore target | Connection succeeds | | |
| 2 | Drop existing data | Clean target | | |
| 3 | Run pg_restore | No errors | | |
| 4 | Run health check | 7/7 checks pass | | |
| 5 | Check engagement count | Matches backup | | |
| 6 | Check event count | Matches backup | | |
| 7 | Check user count | Matches backup | | |
| 8 | Run backup:verify | All 7 tables verified | | |

## Restore Command

```bash
pg_restore -h <host> -U aqliya -d aqliya --clean <backup_file>.dump
```

## Latest Tests

| Date | Backup | Result | Verified By |
|------|--------|--------|-------------|
| — | — | Not yet performed | — |

## Schedule

| Test Type | Frequency | Owner |
|-----------|-----------|-------|
| Full restore test | Monthly | Infrastructure admin |
| Data integrity check | Daily | Pilot operator (via backup:verify) |
