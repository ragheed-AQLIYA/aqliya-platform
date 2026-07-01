# AI Dependency Verification

**Finding 1 from `REVIEW_AFTER_PHASE2.md`** — AI Circular Dependency

## Audit Claim

> "src/lib/core/ai depends on src/lib/ai; src/lib/ai depends on src/lib/core/ai; canonical AI layer no longer exists"

## Verdict: **REFUTED** — No circular dependency exists.

---

## Dependency Graph

### Architecture Pattern

```
src/lib/core/ai/*.ts  (canonical implementation, 22 files)
    │
    ├── imports @/lib/ai/* → resolves to → src/lib/ai/*.ts (re-export shim, 25 files)
    │                                            │
    │                                            └── re-exports from → @/lib/core/ai/*.ts  (different file)
    │
    └── imports @/lib/ai/eval-gate → resolves to → src/lib/ai/eval-gate.ts (REAL implementation, NOT a shim)
                                                     │
                                                     └── imports from @/lib/ai/eval/* (internal, NOT from core/ai/)
```

### No Cycle Exists Because

1. No file in `src/lib/core/ai/` imports its own shim-name (e.g., `core/ai/orchestrator.ts` never imports `@/lib/ai/orchestrator`)
2. Every chain is a forward traversal to a different file
3. The only real cross-import (`core/ai/eval-gate.ts` → `ai/eval-gate.ts`) is one-directional — `ai/eval-gate.ts` does NOT import from `core/ai/`

### Import Classification Summary

| Direction | Import Type | Count |
|-----------|-------------|-------|
| `core/ai/` → `ai/` (via re-export shim transitively) | Re-export redirect | ~35 imports across 18 files |
| `core/ai/` → `ai/` (real implementation) | **Real import** | 1 (`eval-gate.ts`) |
| `ai/` → `core/ai/` (re-export shim) | Re-export | 25 shim files |
| `ai/` → `core/ai/` (test files) | Direct import in tests | 5 test files |

### Re-export Chain (Safe, Not Circular)

```
core/ai/provider-router.ts  →  @/lib/ai/types
                              →  ai/types.ts (re-export shim)
                              →  @/lib/core/ai/types (canonical, DIFFERENT FILE)
```

This is NOT a circular dependency — it's a forwarding pattern where the shim acts as a compatibility bridge.

---

## Files Changed During This Verification

None needed — no circular dependency was found.

## Conclusion

The audit's claim of a circular dependency between `src/lib/core/ai` and `src/lib/ai` is **false**. The architecture uses a deliberate backward-compatibility shim layer. Every dependency chain resolves to a different target file. No cycles exist.

## Evidence

- Complete file listing and import analysis: See Finding 1 exploration output
- All 25 shim files in `src/lib/ai/` are 4-5 lines each, doing `export * from "@/lib/core/ai/..."` only
- The only real implementation file in `src/lib/ai/` (`eval-gate.ts`, 96 lines) has no imports back to `core/ai/`
