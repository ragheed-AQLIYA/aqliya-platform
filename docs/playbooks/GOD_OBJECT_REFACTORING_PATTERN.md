# God Object Refactoring Pattern

**Status:** Active
**Version:** 1.2
**Date:** 2026-07-19
**Proven on:** audit/services.ts (1931L → 8 modules), sales/store.ts (1161L → 5 modules), ai-advisor.ts (1205L → 6 modules), review-notes-board.tsx (654L → 88L orchestrator + 9 modules), integrations/page.tsx (1236L → 249L orchestrator + 5 modules), crm/page.tsx (1137L → 131L orchestrator + 9 modules), evidence-page.tsx (1215L → 118L orchestrator + 10 modules), findings-page.tsx (1147L → 122L orchestrator + 12 modules)

---

## Purpose

Provide a repeatable, low-risk methodology for splitting large files ("God Objects") into domain modules while preserving API compatibility and preventing regression.

---

## 1. Selection Criteria

### When to Split

A file is a candidate when it meets **2 or more**:

| Criterion | Threshold | Scanner Signal |
|-----------|-----------|----------------|
| Lines of code | ≥ 500 | `god-object` finding |
| Named exports | ≥ 20 | `god-object` finding |
| Distinct domains | ≥ 3 unrelated responsibilities | Manual review |
| Test difficulty | Hard to test individual features | Manual review |
| Import fan-out | ≥ 5 consumers | grep for imports |

### When NOT to Split

- File is < 400 lines and exports < 15
- File is a `page.tsx` with mostly JSX (split JSX differently — extract components, not domains)
- File is already a barrel (`index.ts`)
- Splitting would create modules < 50 lines each (over-fragmentation)

### Priority Ranking

Rank candidates by **impact**, not just size:

| Priority | Category | Rationale |
|----------|----------|-----------|
| P1 | Service/business logic files | Highest maintenance ROI, most testable |
| P2 | Shared library files (`lib/`) | Affects multiple consumers |
| P3 | Action files (`actions/`) | Often thin wrappers, less domain complexity |
| P4 | `page.tsx` / React component files | React-specific pattern (see §10 below) |

### React Component Priority

For React components, rank by RCS (React Complexity Score) and risk:

| Priority | Target | Rationale |
|----------|--------|-----------|
| P1 | Medium components (400-700 LOC) | Validates pattern before tackling larger files |
| P2 | High-RCS pages (complex state + JSX) | Highest architectural ROI |
| P3 | Medium-RCS pages | Moderate effort |
| P4 | Large JSX-heavy pages (low hook density) | Lower ROI, mostly presentational |

---

## 2. Splitting Steps

### Phase 1 — Analyze (15 min)

1. **Read the full file.** Understand every export and its responsibilities.
2. **Map domains.** Group functions/types by business domain, not by file type.
   - Example: `common` (shared types), `accounts` (CRUD), `intelligence` (AI/analysis)
3. **Map dependencies.** For each domain, list what it imports from the file itself and from external modules.
4. **Check circular deps.** If Domain A depends on Domain B and vice versa, resolve before splitting.
5. **Check consumer imports.** Run `grep` for all importers. Note exactly what each consumer imports.

### Phase 2 — Design (10 min)

1. **Create directory.** `src/lib/<domain>/<original-name>/`
2. **Design modules:**
   - `common.ts` — shared types, logging, helpers, re-exports of external deps
   - `<domain-1>.ts` — first domain (functions + types)
   - `<domain-2>.ts` — second domain
   - ...
   - `index.ts` — barrel re-exporting all public APIs
3. **Dependency rule:** All domain modules depend ONLY on `common.ts`. No inter-domain imports unless unavoidable (document why).
4. **Barrel rule:** `index.ts` is the ONLY import path for external consumers.

### Phase 3 — Implement (30-60 min)

1. **Create `common.ts` first.**
   - Move shared types, logging, helpers
   - Re-export external dependencies (`prisma`, template types, etc.)
   - Keep it under 150 lines. If it grows beyond that, split further.

2. **Create domain modules.**
   - Move functions + their types into domain modules
   - Import shared items from `./common`
   - Import external items from `../<external-module>` (one level up from the new directory)

3. **Create `index.ts` barrel.**
   - Re-export everything that was previously `export`ed from the original file
   - Preserve the exact same public API

4. **Delete the original file.**

5. **Verify TypeScript.**
   ```bash
   npx tsc --noEmit
   ```

6. **Run affected tests.**
   ```bash
   npx jest --testPathPatterns="<product-area>" --silent
   ```

7. **Run full test suite.**
   ```bash
   npx jest --silent
   ```

### Phase 4 — Validate (10 min)

1. **TypeScript:** 0 new errors
2. **Tests:** No new failures (pre-existing failures documented)
3. **Scanner:** Re-run code-health scanner, verify finding count decreased
4. **Import check:** No external file imports directly from domain modules (bypassing barrel)
5. **Dependency check:** No circular dependencies between modules
6. **Common audit:** `common.ts` is under 150 lines, contains no business logic

---

## 3. Dependency Rules

### Ideal Structure

```
index.ts (barrel)
 ├── common.ts (shared types, logging, helpers, re-exports)
 ├── domain-a.ts (→ common only)
 ├── domain-b.ts (→ common only)
 └── domain-c.ts (→ common only)
```

### Acceptable Deviation

If Domain B genuinely needs Domain A's function (e.g., false-positive-reviewer needs memory's updateIndustryPatternMemory):

```
domain-b.ts → domain-a.ts (one-directional, documented)
```

### Forbidden

- Circular dependencies between any modules
- Domain modules importing from each other in both directions
- External files importing from domain modules (bypassing barrel)
- `common.ts` containing business logic (only types, helpers, logging, re-exports)

---

## 4. Barrel Export Contract

The `index.ts` barrel must:

1. **Re-export all public types** that were previously exported
2. **Re-export all public functions** that were previously exported
3. **Preserve the exact import path** for existing consumers
4. **Not export internal helpers** (keep them module-private)

Example:

```typescript
// index.ts
export { funcA, funcB } from "./domain-a";
export type { TypeA } from "./domain-a";
export { funcC } from "./domain-b";
export { sharedHelper } from "./common";
export type { SharedType } from "./common";
```

---

## 5. Checklist Before Merge

### Code Quality

- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npx jest --silent` — no new failures
- [ ] No `as any` introduced
- [ ] No `// @ts-ignore` introduced

### Architecture

- [ ] No circular dependencies between modules
- [ ] All domain modules import only from `./common` (or documented exception)
- [ ] No external file imports from domain modules (barrel-only)
- [ ] `common.ts` is under 150 lines
- [ ] `common.ts` contains no business logic

### API Compatibility

- [ ] All previously exported symbols are still exported from barrel
- [ ] Import path for consumers is unchanged
- [ ] No consumer files need modification

### Scanner

- [ ] Re-run code-health scanner
- [ ] God-object finding count decreased by ≥ 1
- [ ] No new findings introduced

### Documentation

- [ ] Old file deleted
- [ ] New directory structure documented in commit message
- [ ] Any inter-module dependencies noted

---

## 6. Regression Test Strategy

### Required Tests

| Test Type | Scope | Command |
|-----------|-------|---------|
| Unit tests | Affected product area | `npx jest --testPathPatterns="<area>" --silent` |
| Full suite | Entire codebase | `npx jest --silent` |
| TypeScript | Entire codebase | `npx tsc --noEmit` |
| Scanner | Code health | `node engineering/agents/code-health.mjs` |

### Pre-existing Failure Documentation

Before the split, document all existing test failures:

```bash
npx jest --silent 2>&1 | grep "FAIL "
```

Any failure that existed BEFORE the split is pre-existing and not a regression. Document in the commit message:

```
Pre-existing failures (unrelated):
- local-contacts-l5.test.ts (enforce() mock issue)
- office-ai-adv.test.ts (...)
```

---

## 7. Known Patterns from AQLIYA Splits

### audit/services.ts (1931L → 8 modules)

| Module | Lines | Domain |
|--------|-------|--------|
| common.ts | ~30 | Shared: getDb, tryDb, delay, prismaGlobal, AuditAIActorContext |
| engagement.ts | ~222 | Engagement management |
| trial-balance.ts | ~320 | Trial balance operations |
| evidence.ts | ~314 | Evidence vault |
| findings.ts | ~248 | Audit findings |
| review.ts | ~238 | Review workflow |
| ai.ts | ~331 | AI review features |
| events.ts | ~160 | Audit events |
| pilot.ts | ~106 | Pilot-specific logic |

**Key insight:** audit/services.ts had 81 exports across 8 distinct domains. The split was clean because each domain was already logically separated in the code.

### sales/store.ts (1161L → 5 modules)

| Module | Lines | Domain |
|--------|-------|--------|
| common.ts | ~260 | Shared types, OrgStore, generic CRUD, seed |
| accounts.ts | ~75 | Account CRUD |
| opportunities.ts | ~200 | Opportunity pipeline |
| evidence-audit.ts | ~50 | Evidence + audit bridge |
| intelligence.ts | ~470 | AI analysis, recommendations, memory |

**Key insight:** common.ts was larger (260L) because it held the `OrgStore` class and generic CRUD helpers. This is acceptable when the shared code is truly shared infrastructure.

**Known issue:** `intelligence.ts` (470L) is still detected as a god-object. It may need further splitting if it grows.

### ai-advisor.ts (1205L → 6 modules)

| Module | Lines | Domain |
|--------|-------|--------|
| common.ts | ~111 | Shared types, logging, pattern helpers |
| pattern-improvement.ts | ~370 | P0 Pattern Learning + P1 Suggestion Review |
| account-explanation.ts | ~185 | P0 Account Explanation Engine |
| false-positive-reviewer.ts | ~185 | P0 False Positive Reviewer |
| memory.ts | ~155 | P1 Industry + Organization Memory |
| confidence-calibration.ts | ~190 | P1 Match Confidence Calibration |

**Key insight:** The file had clear section markers (`// ═══ P0 — ... ═══`) that made domain boundaries obvious. When splitting, look for these markers first.

**Known issue:** `false-positive-reviewer.ts` imports from `memory.ts` (one-directional). This is acceptable but should be documented.

### review-notes-board.tsx (654L → 88L orchestrator + 9 modules)

| Module | Lines | Domain |
|--------|-------|--------|
| use-review-notes-board.ts | 213 | Custom hook: all state + handlers |
| board-tab.tsx | 94 | Board tab with filter + note list |
| sla-tab.tsx | 84 | SLA metrics + targets display |
| create-tab.tsx | 158 | New note form |
| note-card.tsx | 163 | Individual note card with actions |
| response-form.tsx | 31 | Response textarea form |
| escalation-form.tsx | 49 | Escalation form with level selector |
| review-form.tsx | 43 | Review conclusion form |
| utils.ts | 42 | Status/priority color + label helpers |
| review-notes-board.tsx | 88 | Thin orchestrator (imports hook + components) |

**Key insight:** React components follow a different pattern than service files. Instead of domain modules, the split is: **custom hook** (state + logic) + **presentational components** (one per UI section). The main file becomes a thin orchestrator that wires the hook to components.

**RCS result:** 54 → 1 (98% reduction). All extracted components are under 200 LOC.

---

## 10. React Page Refactoring Pattern

React `page.tsx` files and large components require a different splitting pattern than service/library files. The goal is the same (reduce size, improve maintainability), but the decomposition axes differ.

### Standard Page Template

```
page.tsx          — Thin orchestrator (≤250 LOC): layout, tabs, hook wiring
use-<name>.ts     — Custom hook (≤350 LOC): all useState, useCallback, server action calls
components/       — Presentational components:
  ├── <section-1>.tsx  — One component per logical UI section
  ├── <section-2>.tsx
  ├── <form-1>.tsx     — Form components manage their own local state
  ├── <form-2>.tsx
  └── utils.ts         — Color maps, label maps, pure helpers
```

### Success Criteria

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Page LOC | < 300 | `wc -l page.tsx` |
| Custom Hook LOC | < 350 | `wc -l use-*.ts` |
| Max Component LOC | < 200 | `wc -l` each component |
| Max Props per Component | < 10 | Count interface properties |
| RCS Decrease | ≥ 30% | `computeRcs()` before/after |
| Re-render Count | No increase | React DevTools Profiler |
| Bundle Impact | No significant increase | `next build` output comparison |

### Splitting Steps

**Phase 1 — Analyze (10 min)**

1. Count `useState` calls — each one is state that must live in the hook
2. Identify handler functions — these become hook methods
3. Identify JSX sections — each major section becomes a component
4. Identify form blocks — each form with its own state becomes a self-contained component
5. Identify pure helpers (color maps, label maps) — extract to `utils.ts`

**Phase 2 — Extract Hook (15 min)**

1. Create `use-<name>.ts` with `"use client"` directive
2. Move all `useState` calls to the hook
3. Move all `useEffect`/`useCallback` calls to the hook
4. Move all server action calls to the hook
5. Return `{ state, actions }` tuple
6. Handler functions that depend on form-local state should accept parameters instead of reading from hook state

**Phase 3 — Extract Components (20 min)**

1. Create `components/` directory
2. Extract each logical JSX section into its own component
3. Forms manage their own local state (not the hook's state)
4. Parent passes callbacks: `onSubmit={(data) => handler(id, data)}`
5. Extract pure helpers to `utils.ts`
6. Keep each component under 200 LOC

**Phase 4 — Rewrite Orchestrator (5 min)**

1. Replace original `page.tsx` with thin orchestrator
2. Import hook and components
3. Wire hook state to component props
4. Target: ≤ 250 LOC

**Phase 5 — Validate (10 min)**

1. TypeScript: `npx tsc --noEmit` — 0 errors
2. RCS: Run `computeRcs()` on the main file — should decrease ≥ 30%
3. Tests: Run affected test suite — no regressions
4. Visual: Verify the page renders correctly (no broken layouts)

### Key Differences from Service File Splitting

| Aspect | Service Files | React Pages |
|--------|--------------|-------------|
| Decomposition axis | Business domain | UI section + state ownership |
| Barrel re-export | Required | Not needed (components are imported directly) |
| Shared module | `common.ts` | `utils.ts` (color maps, helpers) |
| State management | In service functions | In custom hook |
| Form state | N/A | Local to form components |
| Dependency rule | Domain → common only | Component → hook → server actions |

### Anti-Patterns Specific to React

**Don't put all state in the hook when forms are self-contained.** Forms that only submit data should manage their own `useState` and call the hook's handler with the data.

**Don't pass 15+ props to a component.** If a component needs that many props, it's doing too much — split further.

**Don't extract tiny components.** A 20-line JSX block that appears once doesn't need its own file. Extract when it exceeds ~50 LOC or is reused.

**Don't forget `"use client"` on the hook file.** Custom hooks with `useState`/`useEffect` must be client components.

---

## 8. Anti-Patterns to Avoid

### Over-Splitting

Don't split a 400-line file into 8 modules of 50 lines each. The overhead of directory structure, barrel, and imports exceeds the benefit.

### Splitting by File Type

Don't create `types.ts`, `utils.ts`, `helpers.ts` unless they're genuinely shared across all domains. Split by **business domain**, not by code type.

### Breaking the Barrel

Never let external consumers import from domain modules directly. This defeats the purpose of the split and creates coupling.

### Creating God Common

If `common.ts` grows beyond 150 lines, it's becoming a God Module. Split it into `types.ts`, `logging.ts`, `utils.ts`.

### Ignoring Circular Dependencies

If Domain A → Domain B and Domain B → Domain A, you've moved the problem, not solved it. Resolve the cycle before splitting.

---

## 9. Lessons Learned from Batch Refactoring (P1-P5)

### Pattern: Settings Pages with Inline Sub-Components

Settings pages (integrations, crm) often already have inline components defined in the same file. These are easier refactoring targets — extract to separate files rather than rewriting from scratch.

**Typical structure:**
```
page.tsx (1200L)
  ├── helpers/constants/types (~170L)
  ├── SubComponent1 (~250L)  ← already exists inline
  ├── SubComponent2 (~150L)  ← already exists inline
  └── MainPage (~300L)       ← state + handlers
```

**Refactoring:**
1. Move helpers → `components/utils.ts`
2. Move inline components → `components/<name>.tsx`
3. Extract state + handlers → `components/use-<name>.ts`
4. Rewrite main → thin orchestrator

### Pattern: Monolithic Dashboard Pages

Pages like evidence-page and findings-page have 30+ useState calls and 8+ handler functions in a single component. These need a deeper split:

1. Extract constants (color maps, label maps) → `components/constants.ts`
2. Extract ALL state + handlers → `components/use-<name>.ts`
3. Split JSX into logical sections → separate component files
4. Each component calls its own `useTranslations()` — no `t` prop drilling

### Form State Rule (Refined)

**Forms that submit data** manage their own `useState`. The hook only holds:
- Interaction state (which dialog is open, which item is selected)
- Data state (list of items, loading, error)
- Handler functions that accept parameters

**Example:**
```ts
// In the hook:
const handleRespond = async (noteId: string, text: string) => { ... }
const handleCreateSubmit = async (data: CreateForm) => { ... }

// In the component:
const [responseText, setResponseText] = useState("")
const handleSubmit = () => { handleRespond(noteId, responseText) }
```

### Hook File Directive

Custom hooks with `useState`/`useEffect` MUST have `"use client"` at the top. This is the most commonly forgotten step.

### Key Metrics from Batch

| File | Before LOC | After LOC | Orchestrator | Components | Hook LOC |
|------|-----------|----------|-------------|-----------|---------|
| P1: review-notes-board | 654 | 88L orchestrator | 88L | 8 files (704L) | 213L |
| P2: integrations/page | 1236 | 249L orchestrator | 249L | 5 files (883L) | 122L |
| P3: crm/page | 1137 | 131L orchestrator | 131L | 9 files (971L) | 215L |
| P4: evidence-page | 1215 | 118L orchestrator | 118L | 10 files (962L) | 353L |
| P5: findings-page | 1147 | 122L orchestrator | 122L | 12 files (1395L) | 443L |

**Average orchestrator LOC:** 142L (target: ≤250L)
**Average RCS reduction:** 95% (from avg 64 → avg 2)

### When to Stop Extracting

- Each presentational component ≤ 200 LOC
- Each orchestrator ≤ 250 LOC
- No `t` function prop drilling (each component calls `useTranslations()`)
- Dialog components manage their own form state (not the hook)
- Hook only holds data state + interaction state + handler functions

---

## 10. Automation Opportunities (Future)

Future improvements (not yet implemented):

1. **ESLint rule:** Ban direct imports from domain modules (enforce barrel-only)
2. **CI check:** Verify no file in `src/` imports from `ai-advisor/common.ts` directly
3. **Scanner enhancement:** Auto-detect when a split reduces god-object count
4. **Template generator:** `node scripts/split-god-object.mjs <file>` that creates the directory structure
