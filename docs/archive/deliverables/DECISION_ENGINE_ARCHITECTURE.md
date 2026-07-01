# Decision Engine Architecture — Phase 5A

**Date:** 2026-06-21  
**Baseline:** 6f60784  
**Status:** Extraction complete  

---

## Architecture

```
DecisionOS (product)
    ↓ imports from @/lib/decision/ which re-exports from @/lib/core/decision/
    ↓
DecisionOS Adapter (src/lib/core/decision/adapters/decisionos-adapter.ts)
    ↓ bridges DecisionOS config → generic engine interface
    ↓
Core Decision Engine (src/lib/core/decision/)
    ├── engine.ts         Generic DecisionEngine (interface-driven stage evaluation)
    ├── evaluators/       Pure evaluation functions (no product imports)
    │   ├── intake.ts
    │   ├── framework.ts
    │   ├── scenarios.ts
    │   ├── risk-analysis.ts
    │   └── recommendation.ts
    ├── types.ts          Shared types
    └── index.ts          Barrel
```

## Extraction Map

| Module | Moved To | Decision |
|--------|----------|----------|
| `intake.ts` | `core/decision/evaluators/intake.ts` | EXTRACT — pure logic |
| `framework.ts` | `core/decision/evaluators/framework.ts` | EXTRACT — pure logic |
| `scenarios.ts` | `core/decision/evaluators/scenarios.ts` | EXTRACT — pure logic |
| `risk-analysis.ts` | `core/decision/evaluators/risk-analysis.ts` | EXTRACT — pure logic |
| `recommendation.ts` | `core/decision/evaluators/recommendation.ts` | EXTRACT — pure logic |
| `decision-engine.ts` | `core/decision/engine.ts` + adapter | EXTRACT — generic engine + DecisionOS adapter |
| `decision-type-config.ts` | stays in DecisionOS | KEEP — DecisionOS-specific config |
| `gate.ts` | stays in DecisionOS (Prisma-bound) | KEEP — product-specific |
| All other DecisionOS files | stay in DecisionOS | KEEP — domain-specific |

## Re-export Strategy

DecisionOS files become backward-compatible re-exports:
- `src/lib/decision/intake.ts` → `export * from "@/lib/core/decision/evaluators/intake"`
- All 5 evaluators follow the same pattern
- `src/lib/decision/decision-engine.ts` → mixed re-exports from core engine + local adapter

Zero breaking changes. All existing imports continue to work.
