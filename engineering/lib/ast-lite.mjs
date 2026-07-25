/**
 * Lightweight source heuristics (no full TypeScript parser).
 * Good enough for Engineering Excellence static signals.
 */

/** Approximate function lengths via brace depth after function/arrow keywords */
export function findLongFunctions(content, fileRel, threshold) {
  const findings = [];
  const lines = content.split(/\r?\n/);
  const startRe = /^\s*(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\()/;

  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(startRe);
    if (!m) {
      i += 1;
      continue;
    }
    const name = m[1] || m[2] || "anonymous";
    const start = i;
    let depth = 0;
    let started = false;
    let j = i;
    for (; j < lines.length; j++) {
      const line = lines[j];
      for (const ch of line) {
        if (ch === "{") {
          depth += 1;
          started = true;
        } else if (ch === "}") {
          depth -= 1;
        }
      }
      if (started && depth <= 0) break;
      // Cap runaway scans
      if (j - start > 2000) break;
    }
    const len = j - start + 1;
    if (len >= threshold) {
      findings.push({
        name,
        startLine: start + 1,
        endLine: j + 1,
        lines: len,
        file: fileRel,
      });
    }
    i = Math.max(j, i + 1);
  }
  return findings;
}

/** Cyclomatic-ish complexity: decision keywords per file */
export function estimateComplexity(content) {
  const decisions =
    (content.match(/\b(if|else if|for|while|case|catch|\?\.|\?\?|&&|\|\|)\b/g) || [])
      .length;
  const functions =
    (content.match(/\bfunction\b|=>/g) || []).length || 1;
  return {
    decisions,
    functions,
    avgPerFunction: Math.round((decisions / functions) * 10) / 10,
    fileScore: decisions,
  };
}

/** Maintainability index approximation (0–100) from Halstead-ish proxies */
export function maintainabilityIndex(content, loc) {
  const volume = Math.max(1, loc) * Math.log2(Math.max(2, (content.match(/\w+/g) || []).length));
  const complexity = estimateComplexity(content).fileScore || 1;
  // Microsoft-style MI simplified
  const mi =
    Math.max(
      0,
      (171 -
        5.2 * Math.log(volume) -
        0.23 * complexity -
        16.2 * Math.log(Math.max(1, loc))) *
        100 /
        171
    );
  return Math.round(Math.min(100, Math.max(0, mi)));
}

/** Detect "use client" files importing server-only modules */
export function isClientModule(content) {
  return /^\s*['"]use client['"]/m.test(content);
}

export function extractImports(content) {
  // Strip comments before scanning to avoid catching examples in JSDoc
  const stripped = content
    .replace(/\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  const imports = [];
  const re = /import\s+(?:type\s+)?(?:[\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(stripped))) {
    imports.push(m[1]);
  }
  return imports;
}

export function extractExports(content) {
  const exports = [];
  // Count only runtime exports: function, class, const, let, var
  // Exclude type-only: type, interface, enum (type declarations)
  const re =
    /export\s+(?:default\s+)?(?:async\s+)?(?:function|const|let|var|class)\s+(\w+)/g;
  let m;
  while ((m = re.exec(content))) {
    exports.push(m[1]);
  }
  if (/export\s+default\s+/.test(content) && !exports.includes("default")) {
    exports.push("default");
  }
  return exports;
}

/** Simple line-block fingerprint for duplication */
export function blockFingerprints(content, minLines) {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//") && !l.startsWith("*") && !l.startsWith("/*"));
  const map = new Map();
  for (let i = 0; i + minLines <= lines.length; i++) {
    const block = lines.slice(i, i + minLines).join("\n");
    if (block.length < 80) continue;
    const key = block;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(i + 1);
  }
  return map;
}

export function countTodoFixme(content) {
  return (content.match(/\b(TODO|FIXME|HACK|XXX)\b/g) || []).length;
}

export function hasOrganizationScope(content) {
  return /organizationId/.test(content);
}

export function hasAuthorizeCall(content) {
  return /\b(authorize|requireAuth|requireRole|assertCan|withActionGuard|guardAction|getCurrentUser|enforce|requirePermission|assertProjectAccess|assertAdmin|authenticateScimRequest|getToken|getServerSession|assertOrganizationAccess)\b/.test(
    content
  );
}

// ─────────────────────────────────────────────────────────────────────
// React Complexity Score (RFC-001)
// ─────────────────────────────────────────────────────────────────────

/** Common HTML element names to exclude from JSX fan-out count */
const HTML_ELEMENTS = new Set([
  "div","span","p","a","h1","h2","h3","h4","h5","h6","ul","ol","li",
  "table","tr","td","th","thead","tbody","tfoot","caption","colgroup","col",
  "form","input","button","select","option","optgroup","textarea",
  "img","br","hr","video","audio","source","track","canvas","map","area",
  "section","article","aside","header","footer","nav","main","figure","figcaption",
  "details","summary","dialog","pre","code","em","strong","small","sub","sup",
  "mark","del","ins","u","s","i","b","dl","dt","dd","fieldset","label","legend",
  "progress","meter","output","template","slot","portal","fragment",
]);

/**
 * Normalize a sub-score: map raw value to 0-100 using [safe, warn, critical] thresholds.
 * Below safe → 0, between safe-warn → linear 0-50, between warn-critical → 50-100, above critical → 100.
 */
function normalizeScore(value, [safe, warn, critical]) {
  if (value <= safe) return 0;
  if (value <= warn) return ((value - safe) / (warn - safe)) * 50;
  if (value <= critical) return 50 + ((value - warn) / (critical - warn)) * 50;
  return 100;
}

/**
 * Compute React Complexity Score for a .tsx file.
 *
 * @param {string} content - File content
 * @param {number} loc - Line count
 * @param {object} thresholds - REACT_COMPLEXITY config
 * @returns {{ score, hookDensity, useState, useEffect, useCallback, useMemo, fanout, nesting, inlineCallbacks, effects }}
 */
export function computeRcs(content, loc, thresholds = {}) {
  const t = {
    hookDensity: [3, 8, 10],
    stateComplexity: [5, 15, 20],
    fanout: [10, 30, 40],
    nestingDepth: [4, 8, 10],
    inlineCallbacks: [5, 15, 20],
    effectSideEffects: [2, 5, 8],
    weights: { hookDensity: 0.25, stateComplexity: 0.20, fanout: 0.20, nestingDepth: 0.15, inlineCallbacks: 0.10, effectSideEffects: 0.10 },
    ...thresholds,
  };

  // ── Hook Detection ──
  const useState = (content.match(/\buseState\b/g) || []).length;
  const useEffect = (content.match(/\buseEffect\b/g) || []).length;
  const useCallback = (content.match(/\buseCallback\b/g) || []).length;
  const useMemo = (content.match(/\buseMemo\b/g) || []).length;
  const useRef = (content.match(/\buseRef\b/g) || []).length;
  const useReducer = (content.match(/\buseReducer\b/g) || []).length;
  const customHooks = (content.match(/\buse[A-Z]\w+/g) || []).filter(
    (h) => !["useState","useEffect","useCallback","useMemo","useRef","useReducer","useContext","useLayoutEffect","useImperativeHandle","useDebugValue","useDeferredValue","useTransition","useId","useSyncExternalStore","useInsertionEffect"].includes(h)
  ).length;
  const totalHooks = useState + useEffect + useCallback + useMemo + useRef + useReducer + customHooks;
  const hookDensityRaw = loc > 0 ? (totalHooks / loc) * 100 : 0;

  // ── JSX Fan-out ──
  const componentTags = content.match(/<[A-Z][A-Za-z0-9.]+/g) || [];
  const uniqueComponents = [...new Set(componentTags.map((c) => c.slice(1)))].filter(
    (c) => !HTML_ELEMENTS.has(c.toLowerCase())
  );
  const fanout = uniqueComponents.length;

  // ── Nesting Depth (approximate) ──
  const nestedMaps = (content.match(/\.map\(/g) || []).length;
  const ternaries = (content.match(/\?[^?:]*:/g) || []).length;
  const nestingRaw = Math.max(nestedMaps, Math.floor(ternaries / 3));

  // ── Inline Callbacks ──
  const inlineCallbacks = (content.match(
    /(?:onClick|onChange|onSubmit|onFocus|onBlur|onKeyDown|onKeyUp|onMouseDown|onMouseUp|onDrag|onDrop)\s*=\s*\{[^}]*(?:=>|function)/g
  ) || []).length;

  // ── Compute Sub-Scores ──
  const sHookDensity = normalizeScore(hookDensityRaw, t.hookDensity);
  const sStateComplexity = normalizeScore(useState, t.stateComplexity);
  const sFanout = normalizeScore(fanout, t.fanout);
  const sNesting = normalizeScore(nestingRaw, t.nestingDepth);
  const sInline = normalizeScore(inlineCallbacks, t.inlineCallbacks);
  const sEffects = normalizeScore(useEffect, t.effectSideEffects);

  // ── Weighted RCS ──
  const score = Math.round(
    sHookDensity * t.weights.hookDensity +
    sStateComplexity * t.weights.stateComplexity +
    sFanout * t.weights.fanout +
    sNesting * t.weights.nestingDepth +
    sInline * t.weights.inlineCallbacks +
    sEffects * t.weights.effectSideEffects
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    hookDensity: hookDensityRaw,
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
    useReducer,
    customHooks,
    totalHooks,
    fanout,
    nesting: nestingRaw,
    inlineCallbacks,
    effects: useEffect,
  };
}
