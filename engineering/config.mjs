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
    { id: "generic-secret", re: /(api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{12,}['"]/i, severity: "high" },
    { id: "jwt-hardcoded", re: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/, severity: "high" },
  ],
  dangerousApis: [
    { id: "eval", re: /\beval\s*\(/, severity: "high" },
    { id: "dangerouslySetInnerHTML", re: /dangerouslySetInnerHTML/, severity: "medium" },
    { id: "innerHTML", re: /\.innerHTML\s*=/, severity: "medium" },
    { id: "raw-sql", re: /\$queryRaw(Unsafe)?`|\$executeRaw(Unsafe)?`/, severity: "medium" },
    { id: "child-process", re: /child_process|execSync|exec\(/, severity: "medium" },
  ],
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
