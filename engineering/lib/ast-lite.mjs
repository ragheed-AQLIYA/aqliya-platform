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
  const imports = [];
  const re = /import\s+(?:type\s+)?(?:[\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content))) {
    imports.push(m[1]);
  }
  return imports;
}

export function extractExports(content) {
  const exports = [];
  const re =
    /export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class|type|interface|enum)\s+(\w+)/g;
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
  return /\b(authorize|requireAuth|requireRole|assertCan|withActionGuard|guardAction)\b/.test(
    content
  );
}
