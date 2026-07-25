/**
 * AQLIYA Engineering Excellence — configuration
 * Thresholds, scan scope, and gate definitions.
 * Findings only — never mutates application source.
 */

export const ROOT_RELATIVE = ".";

/** Directories scanned for application code */
export const SCAN_ROOTS = ["src", "prisma", "scripts"];

/** Directories always skipped */
export const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".turbo",
  "coverage",
  "dist",
  "build",
  ".claude",
  "backups",
  "uploads",
  "infra/terraform/.terraform",
  "engineering/reports",
  "engineering/refactors",
  "engineering/data",
]);

/** File extensions analyzed as source */
export const SOURCE_EXTS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
]);

/** Code Health thresholds */
export const CODE_HEALTH = {
  longFunctionLines: 100,
  godObjectLines: 1000,
  godObjectExports: 30,
  complexityWarn: 40,
  complexityFail: 80,
  duplicateMinLines: 12,
  maintainabilityWarn: 45,
  maintainabilityFail: 30,
};

/** Security scan patterns (heuristic — not a substitute for pen-test) */
export const SECURITY = {
  secretPatterns: [
    { id: "aws-key", re: /AKIA[0-9A-Z]{16}/, severity: "critical" },
    { id: "private-key", re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, severity: "critical" },
    {
      id: "generic-secret",
      re: /(api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{12,}['"]/i,
      severity: "high",
      // Exclude lines that are env var references, URLs, type defs, or UI labels
      exclude: /process\.env|interface\s|type\s|https?:\/\/|['"]\s*[;,})\n]/i,
    },
    { id: "jwt-hardcoded", re: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/, severity: "high" },
  ],
  dangerousApis: [
    // eval: exclude Redis EVAL (client.eval) — negative lookbehind for dot
    { id: "eval", re: /(?<![.\w])eval\s*\(/, severity: "high" },
    // dangerouslySetInnerHTML: only flag in client components (checked separately)
    { id: "dangerouslySetInnerHTML", re: /dangerouslySetInnerHTML/, severity: "medium" },
    { id: "innerHTML", re: /\.innerHTML\s*=/, severity: "medium" },
    { id: "raw-sql", re: /\$queryRaw(Unsafe)?`|\$executeRaw(Unsafe)?`/, severity: "medium" },
    // child-process: exclude RegExp.exec() via negative lookbehind for dot
    { id: "child-process", re: /child_process|execSync|(?<!\.)exec\s*\(/, severity: "medium" },
  ],
  /** File patterns to skip (tests, seeds, mocks, fixtures) */
  fileExclusions: [
    /__tests__/,
    /\.test\.(ts|tsx|js|jsx)$/,
    /\.spec\.(ts|tsx|js|jsx)$/,
    /fixtures/,
    /mocks?\/?$/i,
    /\.example/i,
  ],
};

/**
 * Categorized file exclusions for quality scanners.
 * Each scanner declares which categories it uses.
 */
export const EXCLUSION_CATEGORIES = {
  /** Unit / integration tests — never production code */
  TEST: [
    /__tests__/,
    /\.test\.(ts|tsx|js|jsx)$/,
    /\.spec\.(ts|tsx|js|jsx)$/,
  ],
  /** Mock objects and test doubles */
  MOCK: [
    /__mocks__/,
    /mock-data\.ts$/i,
  ],
  /** Seed data, fixtures, rehearsal scripts */
  SEED: [
    /seed[-_]?data/i,
    /\.seed\./,
    /uat-run\.ts$/,
    /rehearsal-check\.ts$/,
  ],
  /** Demo / marketing routes */
  DEMO: [
    /demo-data\.ts$/i,
    /\/auditos\/demo/,
  ],
  /** TypeScript declaration files */
  TYPE_DECL: [
    /\/types\.ts$/,
    /\/types\/.*index\.ts$/,
  ],
};

/**
 * Composite exclusion set — all categories combined.
 * Used by scanners that want the broadest exclusion.
 */
export const FILE_EXCLUSIONS = Object.values(EXCLUSION_CATEGORIES).flat();

/**
 * Scanner-specific exclusion presets.
 * Each scanner picks the categories relevant to its domain.
 */
export const SCANNER_EXCLUSIONS = {
  /** Code health: exclude tests, mocks, seeds, demos, types */
  codeHealth: ["TEST", "MOCK", "SEED", "DEMO", "TYPE_DECL"],
  /** Technical debt: exclude tests, mocks, seeds, demos */
  technicalDebt: ["TEST", "MOCK", "SEED", "DEMO"],
  /** Security: exclude tests, mocks (seeds may contain real secrets) */
  security: ["TEST", "MOCK"],
  /** Performance: exclude tests, mocks, seeds, demos */
  performance: ["TEST", "MOCK", "SEED", "DEMO"],
};

/**
 * Build the exclusion set for a given scanner.
 * @param {"codeHealth"|"technicalDebt"|"security"|"performance"} scanner
 * @returns {(fileRel: string) => boolean}
 */
export function buildExclusionFn(scanner) {
  const cats = SCANNER_EXCLUSIONS[scanner] || [];
  const res = cats.flatMap((c) => EXCLUSION_CATEGORIES[c] || []);
  return (fileRel) => res.some((re) => re.test(fileRel));
}

/** Legacy convenience — backward compat for existing scanners */
export function isExcludedFile(fileRel) {
  return FILE_EXCLUSIONS.some((re) => re.test(fileRel));
}

/** React Complexity Metrics (RFC-001) */
export const REACT_COMPLEXITY = {
  /** God component thresholds */
  godComponentRcs: 70,
  godComponentUseState: 15,
  godComponentLoc: 500,
  godComponentHookDensity: 10,
  godComponentFanout: 40,

  /** Long function body (excluding JSX return) */
  longFunctionBody: 200,

  /** Sub-score thresholds: [safe, warn, critical] */
  hookDensity: [3, 8, 10],
  stateComplexity: [5, 15, 20],
  fanout: [10, 30, 40],
  nestingDepth: [4, 8, 10],
  inlineCallbacks: [5, 15, 20],
  effectSideEffects: [2, 5, 8],

  /** RCS weights (must sum to 1.0) */
  weights: {
    hookDensity: 0.25,
    stateComplexity: 0.20,
    fanout: 0.20,
    nestingDepth: 0.15,
    inlineCallbacks: 0.10,
    effectSideEffects: 0.10,
  },
};

/** Performance heuristics */
export const PERFORMANCE = {
  largePageLines: 400,
  prismaFindManyWithoutTake: true,
  clientImportServerOnly: true,
};

/** Test intelligence */
export const TESTING = {
  minCoveragePct: 40,
  warnCoveragePct: 60,
};

/** Documentation */
export const DOCUMENTATION = {
  requiredRootDocs: [
    "README.md",
    "AGENTS.md",
    "docs/DOCUMENTATION_AUTHORITY.md",
  ],
  adrDir: "docs/adr",
};

/** Architecture drift — approved layer map (from AQLIYA_ARCHITECTURE) */
export const ARCHITECTURE = {
  products: [
    "audit",
    "auditos",
    "local-content",
    "localcontent",
    "decisions",
    "decision",
    "sales",
    "workflowos",
    "risk",
    "contacts",
    "content-studio",
    "assistant",
    "office-ai",
    "institutional-memory",
  ],
  /** Standard server flow: Client → Server Action → Domain Service → Prisma */
  allowedImportEdges: [
    { from: "components", to: "actions", ok: true },
    { from: "actions", to: "lib", ok: true },
    { from: "lib", to: "prisma", ok: true },
  ],
  /** Forbidden: client importing prisma / server-only */
  forbiddenClientImports: [
    "@/lib/prisma",
    "server-only",
    "@/lib/auth",
  ],
  doctrinePaths: [
    "docs/official",
    "docs/source-of-truth/AQLIYA_ARCHITECTURE.md",
    "docs/source-of-truth/ROUTE_STRATEGY.md",
    "docs/adr",
  ],
};

/** Quality gate thresholds (scores 0–100) */
export const GATES = {
  security: { pass: 80, warn: 60 },
  performance: { pass: 75, warn: 55 },
  complexity: { pass: 70, warn: 50 },
  coverage: { pass: 60, warn: 40 },
  documentation: { pass: 75, warn: 55 },
  deadCode: { pass: 70, warn: 50 },
  dependencyHealth: { pass: 80, warn: 60 },
  architectureDrift: { pass: 75, warn: 55 },
};

/** Agent registry — base quality scan (intelligence agents run after ingest) */
export const AGENTS = [
  "code-health",
  "security",
  "performance",
  "test-intelligence",
  "documentation",
  "ux-quality",
  "dependency",
  "technical-debt",
  "architecture-drift",
];

/** Intelligence layer — learns from data lake history */
export const INTEL_AGENTS = [
  "engineering-intelligence",
  "trend-analysis",
  "regression-detector",
  "recommendation-ranking",
  "engineering-cost",
  "predictive-risk",
];
