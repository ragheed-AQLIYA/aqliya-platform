# AQLIYA v0.1 Release Tag Report

## 1. Executive Summary

Release notes were created, a clean release snapshot was prepared as a small series of hook-safe commits, and the annotated `v0.1.0` tag was created successfully.

## 2. Release Notes

- Path: `docs/releases/aqliya-v0.1-release-notes.md`
- Summary: formal release summary for the approved v0.1.0 initial usable platform release candidate, including scope, validation, limitations, and allowed/forbidden claims.

## 3. Git Status Before Tag

- Branch: `main`
- Existing `v0.1.0` tag before creation: not found
- Tracked release snapshot state: clean and committed
- Remaining worktree noise: unrelated untracked files/directories outside the committed release snapshot

Repository state used for tagging:

- release-candidate code/config/docs were committed
- unrelated future/supporting work remained untracked and was intentionally excluded
- no tracked release-candidate changes were left unstaged when the tag decision was made

## 4. Validation

| Command                   | Result | Notes                                            |
| ------------------------- | ------ | ------------------------------------------------ |
| `npx tsc --noEmit`        | Pass   | Re-run after release snapshot commits            |
| `npm run lint`            | Pass   | 134 documented warnings, 0 errors                |
| `npm run build`           | Pass   | Existing warnings remain documented and accepted |
| `npm test -- --runInBand` | Pass   | 18/18 suites passed                              |
| `npm run audit:health`    | Pass   | 7/7 checks passed                                |
| `npm run backup:verify`   | Pass   | Data-integrity verification passed               |

## 5. Commit

Release snapshot commits:

1. `3c3bcc1` — `Lock AQLIYA v0.1 release scope`
2. `9f7595b` — `Add AQLIYA v0.1 validation foundation`
3. `a513a63` — `Add AQLIYA platform and Office AI release surfaces`
4. `afb582b` — `Add Sunbul and workflowos release workspace`
5. `6d8d274` — `Finalize AQLIYA v0.1 release snapshot`
6. `d2adde5` — `Fix AuditOS dashboard release lint issue`

Files included:

- official docs
- source-of-truth docs
- release docs
- release/go-no-go reports
- platform/shared-application/custom-workspace code required for the approved v0.1 snapshot
- validation/test infrastructure required for the current passing release candidate

## 6. Tag

- Tag name: `v0.1.0`
- Tag type: annotated git tag
- Tag message: `AQLIYA v0.1.0 — initial usable platform release candidate`
- Tag target commit: `d2adde54eed36c282cd53182372780d9af18d3f5`

Verification:

- `git tag --list "v0.1.0"` returned `v0.1.0`
- `git show --stat v0.1.0` confirmed the annotated tag and target commit

## 7. Push Status

- Not pushed
- Push not requested

## 8. Remaining Limitations

- pre-existing lint warnings remain
- build warnings remain documented and accepted
- prototype/internal surfaces remain present and must retain restricted framing
- unrelated untracked future/supporting repository work still exists outside the release snapshot and was intentionally excluded from tagging

## 9. Next Recommended Step

If desired, prepare a human-readable changelog/release announcement from `docs/releases/aqliya-v0.1-release-notes.md`, then push the release commit series and `v0.1.0` tag only when explicitly approved.
