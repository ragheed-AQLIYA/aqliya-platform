#!/usr/bin/env node
/**
 * AEOS Auto-Fixer
 *
 * Automatically fixes:
 * - Unused imports (QUAL-02)
 * - console.log → structured logger (QUAL-01)
 *
 * Usage: node engineering/fix.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, extname, relative } from "path";

const ROOT = join(process.cwd(), "src");
const DRY_RUN = process.argv.includes("--dry-run");
let fixed = 0;
let scanned = 0;
const changes = [];

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
// Fix 1: Remove unused imports
// ═══════════════════════════════════════════════════════════
function fixUnusedImports(filePath) {
  const content = readFileSync(filePath, "utf8");
  const rel = relative(process.cwd(), filePath);
  if (/test|spec|__tests__/.test(filePath)) return;

  let modified = false;
  let newContent = content;

  // Find all import statements with named imports
  const importRegex = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+["'][^"']+["'];?\n/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const imports = match[1].split(",").map(s => s.trim());
    const afterImport = content.slice(match.index + fullMatch.length);

    const unusedImports = [];
    const usedImports = [];

    for (const imp of imports) {
      const importName = imp.split(/\s+as\s+/)[0].trim();
      if (!importName) continue;

      // Check if this import is used after the import statement
      const usageRegex = new RegExp(`\\b${importName}\\b`);
      if (usageRegex.test(afterImport)) {
        usedImports.push(imp);
      } else {
        unusedImports.push(imp);
      }
    }

    if (unusedImports.length > 0 && unusedImports.length < imports.length) {
      // Some imports are unused, some are used — replace with only used ones
      const isTypeImport = /import\s+type\s+\{/.test(fullMatch);
      const newImport = `${isTypeImport ? "import type " : "import "}{${usedImports.join(", ")}} from ${fullMatch.match(/from\s+["']([^"']+)["']/)[0].replace("from ", "")};\n`;
      newContent = newContent.replace(fullMatch, newImport);
      modified = true;
      changes.push({ file: rel, type: "unused-import", removed: unusedImports });
    } else if (unusedImports.length === imports.length) {
      // All imports are unused — remove the entire line
      newContent = newContent.replace(fullMatch, "");
      modified = true;
      changes.push({ file: rel, type: "unused-import-all", removed: unusedImports });
    }
  }

  if (modified) {
    fixed++;
    if (!DRY_RUN) {
      writeFileSync(filePath, newContent, "utf8");
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Fix 2: Replace console.log with structured logger
// ═══════════════════════════════════════════════════════════
function fixConsoleLog(filePath) {
  const content = readFileSync(filePath, "utf8");
  const rel = relative(process.cwd(), filePath);
  if (/test|spec|__tests__|seed|debug|scripts|engineering|monitoring/.test(filePath)) return;

  let modified = false;
  let newContent = content;

  // Check if file already imports logger
  const hasLogger = /import.*createLogger|import.*logger/.test(content);

  // Replace console.log/warn/error with logger calls
  const consoleRegex = /console\.(log|warn|error)\(([^)]+)\);?\n?/g;
  let match;

  while ((match = consoleRegex.exec(content)) !== null) {
    const level = match[1];
    const args = match[2];

    // Skip if it's in a comment
    const lineStart = content.lastIndexOf("\n", match.index) + 1;
    const line = content.slice(lineStart, match.index);
    if (/^\s*\/\//.test(line) || /^\s*\*/.test(line)) continue;

    // Replace with logger call
    const loggerMethod = level === "log" ? "info" : level;
    const replacement = `logger.${loggerMethod}(${args});\n`;
    newContent = newContent.replace(match[0], replacement);
    modified = true;
  }

  // Add logger import if we made changes and file doesn't have one
  if (modified && !hasLogger) {
    const loggerImport = `import { createLogger } from "@/lib/observability/logger";\nconst logger = createLogger("${rel.replace(/\\/g, "/")}");\n`;
    // Add after last import
    const lastImportIdx = newContent.lastIndexOf("\nimport ");
    if (lastImportIdx > -1) {
      const endOfImportLine = newContent.indexOf("\n", lastImportIdx + 1);
      newContent = newContent.slice(0, endOfImportLine + 1) + loggerImport + newContent.slice(endOfImportLine + 1);
    }
  }

  if (modified) {
    fixed++;
    if (!DRY_RUN) {
      writeFileSync(filePath, newContent, "utf8");
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════
function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  AEOS Auto-Fixer                            ║");
  console.log(`║  Mode: ${DRY_RUN ? "DRY RUN" : "APPLY"}                                 ║`);
  console.log("╚══════════════════════════════════════════════╝\n");

  const startTime = Date.now();

  walkDir(ROOT, (filePath) => {
    scanned++;
    try {
      fixUnusedImports(filePath);
      fixConsoleLog(filePath);
    } catch (err) {}
  });

  const duration = Date.now() - startTime;

  console.log(`\n═══ Results ═════════════════════════════════════`);
  console.log(`  Files scanned: ${scanned}`);
  console.log(`  Files fixed:   ${fixed}`);
  console.log(`  Duration:      ${duration}ms`);
  console.log(`  Mode:          ${DRY_RUN ? "DRY RUN (no changes written)" : "APPLIED"}`);

  if (changes.length > 0) {
    console.log(`\n─── Changes ────────────────────────────────────`);
    const byType = {};
    for (const c of changes) {
      byType[c.type] = (byType[c.type] || 0) + 1;
    }
    for (const [type, count] of Object.entries(byType)) {
      console.log(`  ${type}: ${count}`);
    }
  }

  return { fixed, scanned, duration, changes };
}

const results = main();
export { results };
