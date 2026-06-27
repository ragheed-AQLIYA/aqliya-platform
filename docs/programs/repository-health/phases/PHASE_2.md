# Repository Health Program — Phase 2 (In Progress)

**Program:** Repository Health  
**Phase:** 2 — Priority Repairs  
**Status:** ▶️ IN PROGRESS  
**Start Date:** 2026-06-27  
**Previous Phase:** [`PHASE_1_CLOSURE.md`](./PHASE_1_CLOSURE.md)  

---

## Overview

Phase 2 transitions the program from **"restoring buildability"** to **"improving repository quality"**. Unlike Phase 1 (which eliminated a critical root cause), Phase 2 addresses multiple independent issues in priority order.

### Success Criteria

| Metric | Target |
|--------|:------:|
| TypeScript | ✅ 0 errors (maintained) |
| Build | ✅ Pass (maintained) |
| Null-byte files | ✅ **0** |
| Fresh clone | ✅ **Pass** |
| Lint errors | ✅ **0** |
| Regression | ✅ **None** |
| Lint warnings | 📊 **Classified** (not necessarily fixed) |
| Knowledge map | 📊 **Assessed** |

---

## Priority Order

| Priority | Task | Reason | Status |
|:--------:|------|--------|:------:|
| **P2.1** | Null-byte Recovery | Repository integrity | ✅ **COMPLETE** |
| **P2.2** | Fresh Clone Verification | Reproducibility proof | ⏳ Next |
| **P2.3** | Lint Errors (6) | Remove actual errors first | ⏳ |
| **P2.4** | Warning Classification | Classify before fixing | ⏳ |
| **P2.5** | Knowledge Map Freshness | Last (new files may appear) | ⏳ |

---

# P2.1 — Null-byte Recovery ✅ COMPLETE

**Date:** 2026-06-27

## 1. Identify

Initial Phase 0.2 scan identified 4 files with null bytes. Expanded scan during Phase 2 identified 2 additional files (corrupted on disk only, git HEAD clean).

**Total: 6 tracked files with null-byte corruption.**

## 2. File-by-File Analysis

### A. Files Corrupted in Git (4 files — created corrupted at commit time)

| # | File | Commit | Raw bytes | Null bytes | Cause |
|:-:|------|:------:|:---------:|:----------:|-------|
| 1 | `docs/releases/localcontentos-completion/localcontentos-manual-smoke-steps-3-6.md` | `cb7df84` | 5,517 | 2,562 | UTF-16 encoding — every other byte is null |
| 2 | `runbooks/rate-limiter.md` | `407dc1f` | 17,952 | **1** | Single null byte at position 9943 |
| 3 | `scripts/archived/_lcos-smoke-login-once.mjs` | `f075922` | 3,860 | 1,929 | UTF-16 encoding — every other byte is null |
| 4 | `scripts/archived/_write-tier-b-persistence.mjs` | `f075922` | 18,922 | 9,459 | UTF-16 encoding — every other byte is null |

**Root cause for files 1, 3, 4:** Files were created with UTF-16 Little Endian encoding (likely by an AI coding agent or tool that used UTF-16 output). Every ASCII character's second byte became `0x00`, making ~50% of the file null bytes.

**Root cause for file 2:** Single null byte at position 9943 — likely a copy-paste artifact or editor glitch.

### B. Files Corrupted on Disk Only (2 files — git HEAD clean)

| # | File | Git HEAD | On disk | Null bytes | Cause |
|:-:|------|:--------:|:-------:|:----------:|-------|
| 5 | `scripts/archived/_w3-smoke-check.mjs` | 342 B | 688 B | 343 | Local file system corruption (Google Drive File Stream or similar) |
| 6 | `docs/audits/evidence/equity-bridge-raw.json` | 5,357 B | 10,398 B | 4,851 | Local file system corruption |

**Root cause for files 5, 6:** Files were intact in git but got null bytes inserted locally — likely by Google Drive File Stream background sync or another file system layer that does not handle binary/text boundaries correctly on this platform.

## 3. Disposition

| # | File | Disposition | Method |
|:-:|------|:-----------:|--------|
| 1 | `localcontentos-manual-smoke-steps-3-6.md` | **Strip null bytes** | Remove all `0x00` bytes → clean UTF-8 (2955 B → 2958 B) |
| 2 | `rate-limiter.md` | **Replace null byte** | `0x00` at position 9943 → space (`0x20`) |
| 3 | `_lcos-smoke-login-once.mjs` | **Strip null bytes** | Remove all `0x00` bytes → clean UTF-8 (1931 B) |
| 4 | `_write-tier-b-persistence.mjs` | **Strip null bytes** | Remove all `0x00` bytes → clean UTF-8 (9463 B) |
| 5 | `_w3-smoke-check.mjs` | **Restore from git** | `git show HEAD:{path}` → clean copy |
| 6 | `equity-bridge-raw.json` | **Restore from git** | `git show HEAD:{path}` → clean copy |

**Validation of stripped content:**
- File 1: Clean markdown — headers, tables, and instructions fully readable
- File 3: Clean JavaScript — one-shot login script, all code readable
- File 4: Clean JavaScript — persistence module, all imports and logic intact
- File 6: Valid JSON — parsed successfully with `ConvertFrom-Json`

## 4. Validation

| Command | Before | After | Status |
|---------|:------:|:-----:|:------:|
| Null bytes in tracked text files | **~19,146** (across 6 files) | **0** | ✅ |
| `npx tsc --noEmit` | 0 errors | 0 errors | ✅ **No regression** |
| `npm run build` | Pass | Pass | ✅ **No regression** |

## 5. Remediation Script

The null-byte stripping for git-corrupted files was applied inline. The diagnostic approach:

```powershell
# For files with interleaved UTF-16 null bytes (every-other-byte pattern):
$bytes = [System.IO.File]::ReadAllBytes($path)
$clean = $bytes | Where-Object { $_ -ne 0 }
$text = [System.Text.Encoding]::UTF8.GetString($clean)
Set-Content -Path $path -Value $text -NoNewline -Encoding UTF8

# For files clean in git but corrupted on disk:
git show HEAD:"$path" > $path
```

---

## Remaining Phase 2 Backlog

| Priority | Task | Status | Notes |
|:--------:|------|:------:|-------|
| **P2.2** | **Fresh Clone Verification** | ⏳ Next | Clone to temp dir, run tsc + build + test |
| **P2.3** | **Lint Errors (6)** | ⏳ | 2 files with `@typescript-eslint/no-explicit-any` |
| **P2.4** | **Warning Classification** | ⏳ | 723 warnings → categorize before fixing |
| **P2.5** | **Knowledge Map Freshness** | ⏳ | 268 stale entries (13.9%) |

---

*Generated by Repository Health Program. Phase 2 started 2026-06-27. P2.1 completed 2026-06-27.*
