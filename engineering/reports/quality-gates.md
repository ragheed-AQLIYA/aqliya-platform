# Smart Quality Gates

**Generated:** 2026-07-11T02:08:07.130Z  
**PASS:** 3 · **WARNING:** 3 · **FAIL:** 2

> Gates include trend deltas vs previous audit in the data lake.

| Gate | Status | Score | Prev | Δ | Reason |
| ---- | ------ | ----- | ---- | - | ------ |
| security | **WARNING** | 65 | 65 | +0 = | score 65 vs pass≥80 warn≥60 · Δ +0 (+0% vs previous) |
| performance | **WARNING** | 57 | 57 | +0 = | score 57 vs pass≥75 warn≥55 · Δ +0 (+0% vs previous) |
| complexity | **FAIL** | 32 | 32 | +0 = | score 32 vs pass≥70 warn≥50 · Δ +0 (+0% vs previous) · still below threshold despite = |
| coverage | **PASS** | 95 | 95 | +0 = | score 95 vs pass≥60 warn≥40 · Δ +0 (+0% vs previous) |
| documentation | **PASS** | 95 | 95 | +0 = | score 95 vs pass≥75 warn≥55 · Δ +0 (+0% vs previous) |
| deadCode | **FAIL** | 32 | 32 | +0 = | score 32 vs pass≥70 warn≥50 · Δ +0 (+0% vs previous) · still below threshold despite = |
| dependencyHealth | **PASS** | 93 | 93 | +0 = | score 93 vs pass≥80 warn≥60 · Δ +0 (+0% vs previous) |
| architectureDrift | **WARNING** | 73 | 73 | +0 = | score 73 vs pass≥75 warn≥55 · Δ +0 (+0% vs previous) |

## FAIL Detail

### complexity

- **Status:** FAIL
- **Reason:** score 32 vs pass≥70 warn≥50 · Δ +0 (+0% vs previous) · still below threshold despite =
- **Action:** OpenCode remediation — see `engineering/intelligence/TOP10.md`

### deadCode

- **Status:** FAIL
- **Reason:** score 32 vs pass≥70 warn≥50 · Δ +0 (+0% vs previous) · still below threshold despite =
- **Action:** OpenCode remediation — see `engineering/intelligence/TOP10.md`



## Exit Semantics

- Local advisory: exit 0 unless `--ci`
- `--ci`: exit 1 if any FAIL
