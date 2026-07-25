# RFC-001: React Complexity Metrics

**Status:** Draft
**Date:** 2026-07-19
**Author:** Engineering Excellence
**Area:** `engineering/scanners/`, `engineering/lib/ast-lite.mjs`

---

## 1. Problem

The current code-health scanner treats `.tsx` files the same as service files. The god-object threshold (1000 LOC OR 30 exports) triggers on React pages that are large due to JSX layout, not business logic complexity.

**Example:** `primitives.ts` has 37 `const` exports (Zod schemas) — each is a one-liner. It's flagged as a god object but has zero cognitive complexity. Meanwhile, `workbook-detail-client.tsx` (797 lines, 8 useState hooks, 0 useEffect) is a single function component with deep nesting — a genuine complexity risk — but only triggers the long-function detector.

**The gap:** No metric captures what makes a React component hard to maintain:
- State management density
- Hook composition patterns
- JSX nesting depth
- Inline callback volume
- Component fan-out (how many sub-components it renders)

---

## 2. Proposed Metrics

### 2.1 React Complexity Score (RCS)

A composite score (0-100) per `.tsx` file, computed from:

| Metric | Weight | Description |
|--------|--------|-------------|
| Hook Density | 25% | `hooks_per_100_lines` = (useState + useEffect + useCallback + useMemo + useRef + custom hooks) / LOC * 100 |
| State Complexity | 20% | `useState_count` — each useState is a distinct state variable to reason about |
| JSX Fan-out | 20% | `unique_components_rendered` — distinct `<ComponentName` tags (excluding HTML elements) |
| Nesting Depth | 15% | `max_jsx_nesting` — deepest JSX nesting level (ternaary operators, map-inside-map) |
| Inline Callbacks | 10% | `inline_handlers` — count of `onClick={...}`, `onChange={...}` with function bodies (not references) |
| Effect Side Effects | 10% | `useEffect_count` — async data fetching, subscriptions, timers |

**Formula:**
```
RCS = (hookDensity_score * 0.25) +
      (stateComplexity_score * 0.20) +
      (jsxFanout_score * 0.20) +
      (nestingDepth_score * 0.15) +
      (inlineCallbacks_score * 0.10) +
      (effectSideEffects_score * 0.10)
```

Each sub-score is normalized 0-100 based on thresholds:

| Metric | 0 (safe) | 50 (warn) | 100 (critical) |
|--------|----------|-----------|----------------|
| Hook Density | < 3 | 3-8 | > 8 |
| State Complexity | < 5 | 5-15 | > 15 |
| JSX Fan-out | < 10 | 10-30 | > 30 |
| Nesting Depth | < 4 | 4-8 | > 8 |
| Inline Callbacks | < 5 | 5-15 | > 15 |
| Effect Side Effects | < 2 | 2-5 | > 5 |

### 2.2 React God Component

A React component is a "god component" if ANY of:

| Condition | Threshold | Rationale |
|-----------|-----------|-----------|
| RCS | ≥ 70 | High composite complexity |
| useState count | ≥ 15 | Too many state variables — needs useReducer or state machine |
| LOC (function body) | ≥ 500 | Single function too long to reason about |
| Hook Density | ≥ 10 hooks/100 lines | Unusually dense hook usage |
| JSX Fan-out | ≥ 40 unique components | Renders too many distinct sub-components |

### 2.3 Long React Function

A React function component is "long" if the **function body** (excluding JSX return) exceeds 200 lines. This is separate from the general long-function detector (which counts total lines including JSX).

Rationale: A 600-line component where 500 lines is a JSX return is less problematic than a 600-line component where 400 lines is state logic, effects, and handlers.

---

## 3. Detection Approach

### 3.1 Lightweight AST (regex-based)

Since we don't have a full AST parser in the engineering layer, use regex-based detection:

```javascript
// Hook detection
const hooks = content.match(/\b(useState|useEffect|useCallback|useMemo|useRef|useReducer|use[A-Z]\w*)\b/g);

// State complexity
const useStateCount = (content.match(/\buseState\b/g) || []).length;

// JSX component fan-out (capitalized tags, excluding HTML)
const htmlElements = new Set(['div','span','p','a','h1','h2','h3','h4','h5','h6','ul','ol','li','table','tr','td','th','form','input','button','select','option','textarea','img','br','hr','section','article','aside','header','footer','nav','main','figure','figcaption','details','summary','dialog','pre','code','em','strong','small','sub','sup','mark','del','ins','u','s','i','b','dl','dt','dd','fieldset','label','legend','progress','meter','output','video','audio','source','canvas','svg','path','circle','rect','line','polygon','polyline','ellipse','g','defs','clipPath','mask','pattern','use','switch','foreignObject','text','tspan','textPath','stop','animate','animateTransform','animateMotion','set','desc','title','metadata','circle','image','filter','feBlend','feColorMatrix','feComponentTransfer','feComposite','feConvolveMatrix','feDiffuseLighting','feDisplacementMap','feDistantLighting','feDropShadow','feFlood','feFuncA','feFuncB','feFuncG','feFuncR','feGaussianBlur','feImage','feMerge','feMergeNode','feMorphology','feOffset','fePointLight','feSpecularLighting','feSpotLight','feTile','feTurbulence']);
const components = content.match(/<[A-Z][A-Za-z0-9.]+/g) || [];
const uniqueComponents = [...new Set(components.map(c => c.slice(1)))].filter(c => !htmlElements.has(c.toLowerCase()));

// Inline callbacks (onClick={...} with function bodies)
const inlineCallbacks = content.match(/(?:onClick|onChange|onSubmit|onFocus|onBlur|onKeyDown|onKeyUp|onMouseDown|onMouseUp)\s*=\s*\{[^}]*(?:=>|function)/g) || [];

// JSX nesting depth (approximate via ternary and map nesting)
const nestedMaps = content.match(/\.map\(/g) || [];
const ternaries = content.match(/\?[^?:]*:/g) || [];
```

### 3.2 Threshold Configuration

Add to `engineering/config.mjs`:

```javascript
export const REACT_COMPLEXITY = {
  // God component thresholds
  godComponentRcs: 70,
  godComponentUseState: 15,
  godComponentLoc: 500,
  godComponentHookDensity: 10,
  godComponentFanout: 40,

  // Long function (function body only)
  longFunctionBody: 200,

  // RCS sub-score thresholds (hookDensity per 100 lines)
  hookDensitySafe: 3,
  hookDensityWarn: 8,
  hookDensityCritical: 10,

  // State complexity
  stateSafe: 5,
  stateWarn: 15,
  stateCritical: 20,

  // Fan-out
  fanoutSafe: 10,
  fanoutWarn: 30,
  fanoutCritical: 40,

  // Nesting
  nestingSafe: 4,
  nestingWarn: 8,
  nestingCritical: 10,

  // Inline callbacks
  inlineSafe: 5,
  inlineWarn: 15,
  inlineCritical: 20,

  // Effects
  effectsSafe: 2,
  effectsWarn: 5,
  effectsCritical: 8,
};
```

---

## 4. Integration Points

### 4.1 Code-Health Agent

Add a new category `react-complexity` to `engineering/agents/code-health.mjs`:

```javascript
// After existing god-object detection
if (fileRel.endsWith('.tsx')) {
  const rcs = computeRcs(content, loc);
  if (rcs.score >= REACT_COMPLEXITY.godComponentRcs) {
    findings.push(finding({
      agent: AGENT,
      severity: rcs.score >= 85 ? 'high' : 'medium',
      category: 'react-complexity',
      title: `React God Component: RCS ${rcs.score}`,
      evidence: `${loc} LOC, ${rcs.useState} useState, ${rcs.fanout} components, density=${rcs.hookDensity.toFixed(1)}`,
      files: [fileRel],
      suggestion: 'Extract sub-components, convert useState to useReducer, or split into container/presentational.',
    }));
  }
}
```

### 4.2 Architectural Budgets

Add to `engineering/ci/architectural-budgets.mjs`:

```javascript
{
  id: "react_god_components",
  label: "React God Components",
  report: "code-health",
  extract: (data) => data.findings.filter(f => f.category === 'react-complexity').length,
  policy: "decrease_only",
  max: 10,
  description: "React components with RCS >= 70.",
}
```

### 4.3 Scanner Quality

Add `react-complexity` to `SCANNER_EXCLUSIONS` in `engineering/config.mjs`:

```javascript
SCANNER_EXCLUSIONS: {
  // ... existing
  codeHealth: {
    exclude: [...EXCLUSION_CATEGORIES.TEST, ...EXCLUSION_CATEGORIES.MOCK],
  },
},
```

---

## 5. Baseline Measurements

Current state (from code-health report):

| File | LOC | useState | useEffect | Hooks | Unique Components |
|------|-----|----------|-----------|-------|-------------------|
| governance/page.tsx | 1304 | — | — | — | — |
| integrations/page.tsx | 1237 | — | — | — | — |
| evidence-page.tsx | 1216 | — | — | — | — |
| findings-page.tsx | 1148 | — | — | — | — |
| crm/page.tsx | 1138 | 25 | 5 | 35 | 50 |
| workbook-detail-client.tsx | 797 | 8 | 0 | 10 | — |

Estimated RCS for crm/page.tsx:
- Hook Density: 35/1138*100 = 3.1 → score ~5
- State Complexity: 25 → score ~100
- JSX Fan-out: 50 → score ~100
- Inline Callbacks: unknown → estimate ~30
- RCS estimate: ~55 (medium)

---

## 6. What This Scanner Does NOT Do

- **No deep JSX analysis** — regex-based, not AST-based. Catches patterns, not structure.
- **No component hierarchy analysis** — doesn't map parent→child relationships.
- **No prop drilling detection** — would require full AST.
- **No render performance analysis** — doesn't detect unnecessary re-renders.
- **No Tailwind/CSS analysis** — outside scope.

These are candidates for a future RFC if the lightweight scanner proves useful.

---

## 7. Implementation Plan

| Phase | Task | Effort |
|-------|------|--------|
| 1 | Add `REACT_COMPLEXITY` config to `engineering/config.mjs` | 15 min |
| 2 | Add `computeRcs()` to `engineering/lib/ast-lite.mjs` | 30 min |
| 3 | Add `react-complexity` category to `engineering/agents/code-health.mjs` | 20 min |
| 4 | Add budget to `architectural-budgets.mjs` | 10 min |
| 5 | Add regression tests | 30 min |
| 6 | Run baseline, adjust thresholds | 15 min |
| **Total** | | **~2 hours** |

---

## 8. Success Criteria

1. All 5 page.tsx god objects are reclassified as `react-complexity` (not `god-object`)
2. RCS correctly identifies the most complex React components
3. Budget gate catches new god components
4. False positive rate < 10% (primitives.ts-like files excluded)
5. All existing tests still pass

---

## 9. Alternatives Considered

| Alternative | Trade-off | Decision |
|-------------|-----------|----------|
| Full AST (Babel/SWC) | More accurate but heavy dependency | Rejected for Phase 1 |
| ESLint plugin | Would catch at lint time, not scan time | Different concern |
| Separate React agent | More isolated but duplicates code-health | Keep in code-health |
| LOC-only threshold | Already exists (god-object) | Insufficient |

---

## 10. Open Questions

1. Should `"use server"` files (Server Actions) be excluded from React complexity metrics?
2. Should shared layout components (`layout.tsx`) have different thresholds?
3. Should the RCS weight distribution be adjustable per product?
