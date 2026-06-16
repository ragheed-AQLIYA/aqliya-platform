#!/usr/bin/env node
// ─── Compliance Scan — process.env violations in providers/connectors ───
// Scans CRM, ERP, AI provider directories for direct process.env reads.
//
// Usage: node scripts/compliance/check-env-violations.mjs
//
// Expected: 0 violations in:
//   - src/lib/crm/**
//   - src/lib/erp/**
//
// Platform bootstrap env vars (DATABASE_URL, AUTH_SECRET, ENCRYPTION_KEY, SENTRY_DSN)
// are excluded — they are consumed by platform infrastructure, not connectors.

import { readFileSync, existsSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";
import { globSync } from "glob";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..");

// Known platform bootstrap env vars — these are NOT violations
const PLATFORM_BOOTSTRAP_VARS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXTAUTH_SECRET",
  "ENCRYPTION_KEY",
  "SENTRY_DSN",
  "NODE_ENV",
  "STORAGE_PROVIDER",
  "NEXT_PUBLIC_",
  // AI provider fallback env vars (intentional fallback in factory pattern)
  "OPENAI_API_KEY",
  "ANTHROPIC_API_KEY",
  "AI_CLOUD_API_KEY",
  "AI_CLOUD_BASE_URL",
  "AI_CLOUD_MODEL",
  "AI_CLOUD_PROVIDER_NAME",
  "AI_LOCAL_BASE_URL",
  "AI_LOCAL_MODEL",
  "AI_PROVIDER",
  // Storage provider fallback env vars
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "S3_ENDPOINT",
  "S3_BUCKET",
  "S3_REGION",
  // Email/SMTP fallback env vars
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
  "SMTP_SECURE",
  // Embedding provider config
  "EMBEDDING_PROVIDER",
  // Storage provider config
  "LOCAL_STORAGE_DIR",
  // Notification engine config
  "NOTIFICATION_RATE_LIMIT_PER_MIN",
];

// Directories to scan for violation
const SCAN_PATHS = [
  "src/lib/crm",
  "src/lib/erp",
  "src/lib/sales/crm",
  "src/lib/local-content/erp",
  "src/lib/integration/providers",
  "src/lib/ai",
  "src/lib/platform/storage",
  "src/lib/platform/notification",
];

function isPlatformBootstrap(varName) {
  return PLATFORM_BOOTSTRAP_VARS.some((bootstrap) =>
    varName.startsWith(bootstrap) || varName === bootstrap,
  );
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
    const content = readFileSync(join(REPO_ROOT, file), "utf-8");
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Match process.env.VAR_NAME patterns
      const matches = line.match(/process\.env\.([a-zA-Z_][a-zA-Z0-9_]*)/g);
      if (!matches) continue;

      for (const match of matches) {
        const varName = match.replace("process.env.", "");
        if (!isPlatformBootstrap(varName)) {
          violations.push({
            file: file,
            line: i + 1,
            match: match.trim(),
            context: line.trim().substring(0, 100),
          });
        }
      }
    }
  }

  return { directory: dirPath, exists: true, files, violations };
}

// ─── Main ───

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║  Compliance Scan — process.env Violations                  ║");
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
  console.log("\n✅  PASS — Zero process.env violations in connectors");
  process.exit(0);
} else {
  console.log(`\n❌  FAIL — ${totalViolations} violation(s) found. Connectors must use SecretResolver.`);
  process.exit(1);
}
