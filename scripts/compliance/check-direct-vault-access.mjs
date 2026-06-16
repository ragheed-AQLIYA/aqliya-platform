#!/usr/bin/env node
// ─── Compliance Scan — Direct VaultService access in connectors ───
// Scans CRM, ERP, AI provider directories for direct VaultService imports.
//
// Usage: node scripts/compliance/check-direct-vault-access.mjs
//
// Expected: 0 violations.
// Connectors must use SecretResolver, NOT VaultService directly.

import { readFileSync, existsSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";
import { globSync } from "glob";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");

// Directories to scan for violations
const SCAN_PATHS = [
  "src/lib/crm",
  "src/lib/erp",
  "src/lib/integration/providers",
  "src/lib/sales/crm",
  "src/lib/local-content/erp",
  "src/lib/ai",
  "src/lib/platform/storage",
  "src/lib/platform/notification",
];

// Files that are ALLOWED to import VaultService
const ALLOWED_FILES = [
  // SecretResolver is the ONLY entry point for secret resolution
  "src/lib/integration/secret-resolver.ts",
  // health checks that verify vault connectivity
  "src/lib/monitoring/health/vault-health.ts",
  // platform vault service itself
  "src/lib/platform/secrets/vault-service.ts",
];

// Patterns to detect direct VaultService access
const VAULT_IMPORT_PATTERNS = [
  /from\s+["']@\/lib\/platform\/secrets\/vault-service["']/,
  /from\s+["']\.\.\/platform\/secrets\/vault-service["']/,
  /from\s+["']\.\.\/\.\.\/platform\/secrets\/vault-service["']/,
  /require\(["']@\/lib\/platform\/secrets\/vault-service["']\)/,
  /import\s*\(\s*["']@\/lib\/platform\/secrets\/vault-service["']\s*\)/,
];

function isAllowed(file) {
  return ALLOWED_FILES.some((allowed) => file.endsWith(allowed));
}

function scanDirectory(dirPath) {
  const fullPath = join(REPO_ROOT, dirPath);
  if (!existsSync(fullPath)) {
    return { directory: dirPath, exists: false, files: [], violations: [] };
  }

  const files = globSync(`${dirPath}/**/*.{ts,js,mjs}`, {
    cwd: REPO_ROOT,
    ignore: ["**/node_modules/**", "**/*.test.*", "**/*.spec.*"],
  });

  const violations = [];

  for (const file of files) {
    if (isAllowed(file)) continue;

    const content = readFileSync(join(REPO_ROOT, file), "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of VAULT_IMPORT_PATTERNS) {
        if (pattern.test(line)) {
          violations.push({
            file: file,
            line: i + 1,
            match: line.trim().substring(0, 120),
          });
          break;
        }
      }

      // Also detect direct vaultService usage (camelCase reference)
      const directUsage = line.match(/\bvaultService\s*\.\s*(get|set|rotate|revoke|list)\b/);
      if (directUsage && !file.includes("vault-service")) {
        violations.push({
          file: file,
          line: i + 1,
          match: line.trim().substring(0, 120),
        });
      }
    }
  }

  return { directory: dirPath, exists: true, files, violations };
}

// ─── Main ───

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  Compliance Scan — Direct VaultService Access in Connectors ║");
console.log("╚══════════════════════════════════════════════════════════════╝");
console.log("");

let totalViolations = 0;
let totalFiles = 0;

for (const scanPath of SCAN_PATHS) {
  const result = scanDirectory(scanPath);
  totalFiles += result.files?.length ?? 0;

  console.log(`\n📁 ${scanPath}`);
  console.log(`   Files scanned: ${result.files?.length ?? 0}`);

  if (!result.exists) {
    console.log("   ⚠️  Directory does not exist (not an error)");
    continue;
  }

  if (result.violations.length === 0) {
    console.log("   ✅  Violations: 0");
  } else {
    console.log(`   ❌  Violations: ${result.violations.length}`);
    for (const v of result.violations) {
      console.log(`       ${v.file}:${v.line}  ${v.match}`);
    }
    totalViolations += result.violations.length;
  }
}

console.log("\n" + "=".repeat(60));
console.log(`\n📊 Summary:`);
console.log(`   Directories scanned: ${SCAN_PATHS.length}`);
console.log(`   Files scanned:      ${totalFiles}`);
console.log(`   Violations found:   ${totalViolations}`);

if (totalViolations === 0) {
  console.log("\n✅  PASS — Zero direct VaultService access in connectors");
  process.exit(0);
} else {
  console.log(
    `\n❌  FAIL — ${totalViolations} violation(s) found. Connectors must use SecretResolver, not VaultService directly.`,
  );
  process.exit(1);
}
