# SalesOS Version Strategy

> **Status:** Active  
> **Last updated:** 2026-06-25  
> **Applies to:** `src/lib/sales/` version subdirectories

## Context

SalesOS code has three coexisting layers under `src/lib/sales/`:

| Layer    | Path                      | Size     | Status                        | Next action         |
| -------- | ------------------------- | -------- | ----------------------------- | ------------------- |
| **base** | `src/lib/sales/`          | ~50 files | Stable production library     | Keep as canon       |
| **v02**  | `src/lib/sales/v02/`      | ~30 files | Frozen prototype (0 TS errors)| Keep frozen         |
| **vnext**| `src/lib/sales/vnext/`    | ~25 files | Active development            | Keep, promote later |

All three layers have **0 TypeScript errors** as of Phase 1B (2026-06-25). `vnext/` is still under ESLint globalIgnores; base and `v02/` are fully linted.

## Strategy (Option B — Feature-Gated Innovation)

**Chosen approach:** Keep `vnext/` as an active innovation track. `v02/` remains frozen. Modules promote to base when stable.

### Rules

1. **`vnext/` is the innovation track.** Code that is experimental, unproven, or pending review lives here.
2. **`v02/` is frozen.** It is a completed prototype with zero TS errors. No new code added to `v02/`. Do not delete — may serve as reference for `vnext/` → base promotion patterns.
3. **Base is the stable canon.** All shipped SalesOS features live in `src/lib/sales/` flat files.
4. **Promotion gate:** A `vnext/` module moves to base when it has:
   - 0 TypeScript errors (strict)
   - 0 ESLint errors
   - Unit test coverage ≥80%
   - A corresponding server action in `src/actions/sales-*.ts`
   - A route in `src/app/sales/`
   - No `as any` or `@ts-nocheck`
5. **No type divergence.** Base types in `src/lib/sales/types.ts` are the single source of truth. `vnext/` modules must import base types — never redefine them.
6. **No version subdirectory proliferation.** If a fourth version is needed, it replaces `vnext/` (rename `vnext/` to `varchive/` and create new `vnext/`).

### Rationale for Option B over Option A (flatten)

- `v02/` was fixed in Phase 1B-b but the code paths are unproven in production — flattening would introduce risk without benefit.
- `vnext/` is actively developed; forcing a flatten now would interrupt ongoing work.
- Feature gating via directory convention is the lightest-weight approach; no feature-flag infrastructure needed.

## Current Status

| Layer | TS errors | ESLint errors | In globalIgnores | Tests passing |
|-------|-----------|---------------|------------------|---------------|
| base  | 0         | 0             | No               | Yes           |
| v02   | 0         | 0             | No               | Yes           |
| vnext | 0         | — (ignored)   | Yes              | Yes           |

## Phase-out Plan

When vnext modules are stable enough to promote, remove the `vnext/` directory entirely by moving each module to `src/lib/sales/` and updating all imports. Tracked as future cleanup in the Technical Debt Register.
