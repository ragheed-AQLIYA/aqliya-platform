# Verification — Lint Claim

**Verification date:** 2026-06-17

---

## CLAIM: 33,662 lint problems

### Original audit command

```powershell
npm run lint   # → eslint (no path argument = repo root)
```

Original result: `✖ 33662 problems (13706 errors, 19956 warnings)`

---

## Verification runs

### Run A — scoped to `src/`

**Command:**
```powershell
npx eslint src --max-warnings 99999
```

**Result:**
```
✖ 767 problems (350 errors, 417 warnings)
EXIT: 1
```

### Run B — full repo (`.**

**Command:**
```powershell
npx eslint . --max-warnings 99999
```

**Result:**
```
✖ 123624 problems (46778 errors, 76846 warnings)
EXIT: 1
```

---

## What folders drive the count?

`eslint.config.mjs` `globalIgnores` excludes:
- `.next/**`, `build/**`, `out/**`
- Many `src/` subpaths (decision, platform, dashboard, tests, etc.)

**Does NOT ignore:**
- `docs/archive/code/**` (contains TypeScript)
- `knowledge-foundation/**`
- Other non-`src` TS at repo root

### node_modules

Standard eslint behavior — **not scanned** when using default ignores from eslint-config-next.

---

## Analysis

| Scope | Problems | Representative of app quality? |
|-------|----------|-------------------------------|
| Original audit (`npm run lint`) | 33,662 | **NO** — includes docs/archive code |
| Verification full repo | 123,624 | **NO** — even broader/worse |
| `src/` only | 767 | **PARTIAL** — closer; still includes ignored-in-config paths that eslint CLI still hits when explicitly passed `src` |

**Note:** Running `eslint src` scans ALL of src including paths listed in globalIgnores — the ignores apply to default `eslint` command patterns, behavior depends on eslint flat config invocation.

---

## Was original finding valid?

| Question | Answer |
|----------|--------|
| Did audit run lint? | **YES** — reproducible class of command |
| Is 33,662 accurate? | **NOT reproducible exactly** — got 123,624 on re-run (may differ by eslint version, file changes, or timing) |
| Is "lint is broken" valid? | **PARTIAL** — large error count real for unscoped run |
| Is "135 warnings → 0" from Phase 7 valid? | **UNVERIFIED** — no scoped run at audit time |
| Should CI lint gate be trusted? | **NO** without scoping to intentional paths |

**VERDICT:** **PARTIALLY CONFIRMED** — directional finding valid (lint not meaningful at repo root); **exact count not reproducible**; scoped `src/` shows **767** issues not zero

---

## Recommended lint command for truthful signal

```powershell
npx eslint "src/app" "src/actions" "src/lib" "src/components" --max-warnings 0
```

Not executed in this verification (out of scope).
