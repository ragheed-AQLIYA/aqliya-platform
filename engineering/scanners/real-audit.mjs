#!/usr/bin/env node
/**
 * AEOS Real Audit Scanner
 *
 * Scans the actual AQLIYA codebase and produces real findings.
 * Each finding has severity, file, line, rule, and recommendation.
 *
 * Usage: node engineering/scanners/real-audit.mjs
 */

import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join, extname, relative } from "path";

// ═══════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════
const ROOT = join(process.cwd(), "src");
const FINDINGS = [];
let scanned = 0;

// ═══════════════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════════════
function finding(rule, severity, file, line, message, recommendation) {
  FINDINGS.push({ rule, severity, file, line, message, recommendation });
}

function walkDir(dir, callback) {
  if (!existsSync(dir)) return;
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith(".") && entry.name !== "node_modules" && entry.name !== "__tests__") {
        walkDir(fullPath, callback);
      }
    } else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) {
      callback(fullPath);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Rule 1: SEC-01 — No `as any` in production code
// ═══════════════════════════════════════════════════════════
function checkAsAny(filePath) {
  const content = readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const rel = relative(process.cwd(), filePath);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comments and eslint-disable lines
    if (/^\s*\/\//.test(line) || /^\s*\*/.test(line) || /eslint-disable|@ts-nocheck/.test(line)) continue;
    if (/test|spec|__tests__/.test(filePath)) continue;
    if (/as any\b/.test(line)) {
      finding("SEC-01", "CRITICAL", rel, i + 1, "`as any` cast in production code", "Replace with proper type narrowing or type assertion");
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Rule 2: SEC-02 — Prisma must not leak to client
// ═══════════════════════════════════════════════════════════
function checkPrismaLeak(filePath) {
  const content = readFileSync(filePath, "utf8");
  const rel = relative(process.cwd(), filePath);

  // Skip server-side directories (these are allowed to use Prisma)
  if (/src\/(lib|server|actions|api)\//.test(filePath)) return;
  // Skip test files
  if (/test|spec|__tests__|__mocks__/.test(filePath)) return;
  // Skip seed files
  if (/seed|migration/.test(filePath)) return;

  // Only check actual client components
  if (!/\"use client\"/.test(content)) return;

  if (/[\"']@\/lib\/prisma[\"']/.test(content) || /[\"']@\/lib\/db[\"']/.test(content)) {
    finding("SEC-02", "CRITICAL", rel, 0, "Prisma imported in client component", "Move database access to Server Actions or API routes");
  }
}

// ═══════════════════════════════════════════════════════════
// Rule 3: GOV-01 — Server/Client boundary check
// ═══════════════════════════════════════════════════════════
function checkServerClientBoundary(filePath) {
  const content = readFileSync(filePath, "utf8");
  const rel = relative(process.cwd(), filePath);

  if (!/\"use server\"/.test(content) && !/\"use client\"/.test(content)) return;

  const isClient = /\"use client\"/.test(content);
  if (!isClient) return;

  const serverImports = [
    /[\"']@\/lib\/prisma[\"']/,
    /[\"']@\/lib\/db[\"']/,
    /from [\"']fs[\"']/,
    /from [\"']path[\"']/,
    /from [\"']child_process[\"']/,
    /process\.env\.(?!NODE_ENV|NEXT_PUBLIC_)/,
  ];

  for (const pattern of serverImports) {
    if (pattern.test(content)) {
      finding("GOV-01", "HIGH", rel, 0, "Client component imports server-only module", "Move server logic to Server Actions or API routes");
      break;
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Rule 4: GOV-02 — Missing tenant isolation
// ═══════════════════════════════════════════════════════════
function checkTenantIsolation(filePath) {
  const content = readFileSync(filePath, "utf8");
  const rel = relative(process.cwd(), filePath);

  // Only check API routes
  if (!/src\/app\/api\//.test(filePath)) return;

  if (/prisma\.\w+\.findMany|prisma\.\w+\.findFirst|prisma\.\w+\.findUnique/.test(content)) {
    if (!/organizationId|tenantId|where.*organizationId/.test(content)) {
      finding("GOV-02", "HIGH", rel, 0, "Database query without tenant isolation", "Add organizationId filter to query");
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Rule 5: GOV-03 — Missing audit trail on mutations
// ═══════════════════════════════════════════════════════════
function checkAuditTrail(filePath) {
  const content = readFileSync(filePath, "utf8");
  const rel = relative(process.cwd(), filePath);

  // Only check server actions
  if (!/\"use server\"/.test(content)) return;

  const hasMutation = /prisma\.\w+\.(create|update|delete|upsert)\(/.test(content);
  if (!hasMutation) return;

  const hasAuditLog = /audit|AuditEvent|auditEvent|logAudit|logToPlatform|auditLogger/.test(content);
  if (!hasAuditLog) {
    finding("GOV-03", "MEDIUM", rel, 0, "Server action with DB mutation but no audit trail", "Add AuditEvent creation after mutation");
  }
}

// ═══════════════════════════════════════════════════════════
// Rule 6: QUAL-01 — Console.log in production
// ═══════════════════════════════════════════════════════════
function checkConsoleLog(filePath) {
  const content = readFileSync(filePath, "utf8");
  const rel = relative(process.cwd(), filePath);
  const lines = content.split("\n");

  // Skip non-production files
  if (/test|spec|__tests__|seed|debug|scripts|engineering|monitoring/.test(filePath)) return;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/console\.(log|warn|error)\(/.test(line)) {
      if (!/eslint-disable|@ts-ignore/.test(line)) {
        finding("QUAL-01", "LOW", rel, i + 1, "console.log/warn/error in production code", "Use structured logger instead");
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Rule 7: QUAL-02 — Dead code (unused imports)
// ═══════════════════════════════════════════════════════════
function checkUnusedImports(filePath) {
  const content = readFileSync(filePath, "utf8");
  const rel = relative(process.cwd(), filePath);

  // Match import statements
  const importMatches = content.matchAll(/import\s+\{([^}]+)\}\s+from/g);
  for (const match of importMatches) {
    const imports = match[1].split(",").map(s => s.trim().split(/\s+as\s+/)[0].trim());
    for (const imp of imports) {
      if (!imp) continue;
      // Check if the import is used (simple heuristic)
      const afterImport = content.slice(content.indexOf(match[0]) + match[0].length);
      const usageRegex = new RegExp(`\\b${imp}\\b`);
      if (!usageRegex.test(afterImport)) {
        // Only flag if it's not a type import
        if (!/type\s/.test(match[0])) {
          finding("QUAL-02", "LOW", rel, 0, `Unused import: "${imp}"`, "Remove unused import");
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Rule 8: SEC-03 — Hardcoded secrets
// ═══════════════════════════════════════════════════════════
function checkHardcodedSecrets(filePath) {
  const content = readFileSync(filePath, "utf8");
  const rel = relative(process.cwd(), filePath);

  // Skip test/example files
  if (/test|spec|__tests__|example|sample|\.env\.example/.test(filePath)) return;

  const secretPatterns = [
    /(?:password|passwd|pwd)\s*[:=]\s*["'](?!placeholder|example|test|dummy|resolved)[^"']{8,}["'](?:\s*[;,})])/i,
    /(?:api[_-]?key|apikey)\s*[:=]\s*["'](?!placeholder|example|test|dummy|resolved)[^"']{20,}["']/i,
    /(?:secret|clientSecret)\s*[:=]\s*["'](?!placeholder|example|test|dummy|resolved)[^"']{20,}["']/i,
    /(?:auth[_-]?token|access[_-]?token)\s*[:=]\s*["'](?!placeholder|example|test|dummy|resolved)[A-Za-z0-9+/=]{30,}["']/i,
  ];

  for (const pattern of secretPatterns) {
    if (pattern.test(content)) {
      finding("SEC-03", "CRITICAL", rel, 0, "Potential hardcoded secret detected", "Move to environment variables");
      break;
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Rule 9: PERF-01 — Large client bundles
// ═══════════════════════════════════════════════════════════
function checkClientBundle(filePath) {
  const content = readFileSync(filePath, "utf8");
  const rel = relative(process.cwd(), filePath);

  if (!/\"use client\"/.test(content)) return;

  // Check for heavy imports in client components (skip type-only imports)
  const heavyImports = [
    /from [\"']lodash/,
    /from [\"']moment/,
    /from [\"']xlsx/,
    /from [\"']pdfkit/,
  ];

  for (const pattern of heavyImports) {
    if (pattern.test(content)) {
      finding("PERF-01", "MEDIUM", rel, 0, "Heavy library imported in client component", "Use dynamic import or move to server");
      break;
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Rule 10: GOV-04 — Missing error handling
// ═══════════════════════════════════════════════════════════
function checkErrorHandling(filePath) {
  const content = readFileSync(filePath, "utf8");
  const rel = relative(process.cwd(), filePath);

  // Check for async functions without try/catch
  if (/\basync\b/.test(content) && !/\btry\b/.test(content) && !/test|spec|__tests__/.test(filePath)) {
    // Only flag if it's a server action or API route
    if (/(\"use server\"|src\/app\/api\/)/.test(filePath)) {
      finding("GOV-04", "MEDIUM", rel, 0, "Async function without try/catch in server code", "Wrap in try/catch with proper error handling");
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Main Scanner
// ═══════════════════════════════════════════════════════════
function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  AEOS Real Audit Scanner                    ║");
  console.log("║  Scanning AQLIYA codebase...                ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  const startTime = Date.now();

  walkDir(ROOT, (filePath) => {
    scanned++;
    try {
      checkAsAny(filePath);
      checkPrismaLeak(filePath);
      checkServerClientBoundary(filePath);
      checkTenantIsolation(filePath);
      checkAuditTrail(filePath);
      checkConsoleLog(filePath);
      checkUnusedImports(filePath);
      checkHardcodedSecrets(filePath);
      checkClientBundle(filePath);
      checkErrorHandling(filePath);
    } catch (err) {
      // Skip unreadable files
    }
  });

  const duration = Date.now() - startTime;

  // Sort by severity
  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  FINDINGS.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Group by rule
  const byRule = {};
  for (const f of FINDINGS) {
    byRule[f.rule] = (byRule[f.rule] || 0) + 1;
  }

  // Print results
  console.log(`\n═══ Scan Results ═══════════════════════════════════`);
  console.log(`  Files scanned: ${scanned}`);
  console.log(`  Duration: ${duration}ms`);
  console.log(`  Total findings: ${FINDINGS.length}`);
  console.log();

  console.log("─── By Rule ───────────────────────────────────────");
  for (const [rule, count] of Object.entries(byRule).sort((a, b) => severityOrder[FINDINGS.find(f => f.rule === a[0]).severity] - severityOrder[FINDINGS.find(f => f.rule === b[0]).severity])) {
    const severity = FINDINGS.find(f => f.rule === rule).severity;
    const icon = severity === "CRITICAL" ? "🔴" : severity === "HIGH" ? "🟠" : severity === "MEDIUM" ? "🟡" : "🟢";
    console.log(`  ${icon} ${rule}: ${count}`);
  }

  console.log("\n─── Top Findings ──────────────────────────────────");
  const top = FINDINGS.slice(0, 20);
  for (const f of top) {
    const icon = f.severity === "CRITICAL" ? "🔴" : f.severity === "HIGH" ? "🟠" : f.severity === "MEDIUM" ? "🟡" : "🟢";
    console.log(`  ${icon} [${f.rule}] ${f.file}:${f.line}`);
    console.log(`     ${f.message}`);
    console.log(`     → ${f.recommendation}`);
  }

  console.log("\n─── Summary ───────────────────────────────────────");
  const critical = FINDINGS.filter(f => f.severity === "CRITICAL").length;
  const high = FINDINGS.filter(f => f.severity === "HIGH").length;
  const medium = FINDINGS.filter(f => f.severity === "MEDIUM").length;
  const low = FINDINGS.filter(f => f.severity === "LOW").length;
  console.log(`  🔴 CRITICAL: ${critical}`);
  console.log(`  🟠 HIGH:     ${high}`);
  console.log(`  🟡 MEDIUM:   ${medium}`);
  console.log(`  🟢 LOW:      ${low}`);

  const score = Math.max(0, 100 - (critical * 10) - (high * 5) - (medium * 2) - (low * 0.5));
  console.log(`\n  Health Score: ${score.toFixed(1)}%`);

  // Return findings for programmatic use
  return { findings: FINDINGS, scanned, duration, score };
}

const results = main();

// Export for use by other modules
export { results };
