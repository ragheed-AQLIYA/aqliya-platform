# Validation Reports — AQLIYA

**Authority level:** Level 6 evidence (see `docs/DOCUMENTATION_AUTHORITY.md`)  
**Purpose:** Store command outputs that prove build, test, and deploy readiness.  
**Rule:** Reports are evidence — not doctrine. Product status lives in `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`.

---

## Index

| Date | tsc | build | test | smoke | Notes |
|------|-----|-------|------|-------|-------|
| — | — | — | — | — | *Populate after each validation run* |

Prior audit outputs (reference only):

- `docs/audits/reality-audit-2026-06-17/verification-build-output.txt`
- `docs/audits/reality-audit-2026-06-17/verification-test-output.txt`

---

## How to regenerate

From repository root:

```bash
npx tsc --noEmit 2>&1 | tee docs/reports/$(date +%Y-%m-%d)-tsc.txt
npm run build 2>&1 | tee docs/reports/$(date +%Y-%m-%d)-build.txt
npm test 2>&1 | tee docs/reports/$(date +%Y-%m-%d)-test.txt
```

On Windows PowerShell, use `Get-Date -Format yyyy-MM-dd` for the date prefix.

---

## Policy

1. Commit a new snapshot after any claim change in PRODUCT_STATUS_MATRIX Phase table.  
2. Link the snapshot path in the matrix row.  
3. Do not claim PASS without a committed report file.
