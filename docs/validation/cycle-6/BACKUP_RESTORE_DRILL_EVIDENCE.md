# Backup Restore Drill Evidence

**Date:** 2026-06-06  
**Agent:** AGENT-C

| Item | Status |
| ---- | ------ |
| `scripts/backup.mjs` + `backup.yml` workflow | Present on `main` |
| `npm run backup:verify` | **Not executed this session** |
| Full restore drill | **not_executed** — scheduled |

**Honest label:** Backup automation **documented**; restore drill **pending operator run**.

**Recommended command (operator):**

```bash
npm run backup:verify
# per docs/operations/backup-restore-procedure.md
```

Record PASS/FAIL + date in this file when run.
