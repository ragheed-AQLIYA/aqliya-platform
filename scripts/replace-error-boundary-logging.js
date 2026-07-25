#!/usr/bin/env node
/**
 * Codemod: replace raw console.error in error.tsx files with createClientLogger.
 *
 * Usage:
 *   node scripts/replace-error-boundary-logging.js          # dry-run (report only)
 *   node scripts/replace-error-boundary-logging.js --apply   # apply changes
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SRC_ROOT = path.join(PROJECT_ROOT, "src", "app");
const IMPORT_LINE = `import { createClientLogger } from "@/lib/observability/client-logger";\n`;

// Matches patterns like:
//   console.error("Some label:", error);
//   console.error(error);
//   console.error("[SomeOS Error Boundary]", error);
const CONSOLE_ERROR_RE =
  /(\s*)console\.error\((?:"[^"]*"|'[^']*'|`[^`]*`),?\s*error\s*\);/g;

// Extract the label string from a console.error call, if present.
const LABEL_RE = /console\.error\(("|'|`)([^"'`]*)\1/;

function apply(file, projectRoot) {
  const absPath = path.isAbsolute(file) ? file : path.join(projectRoot, file);
  let content = fs.readFileSync(absPath, "utf8");
  let changed = false;
  const replacements = [];

  // Replace console.error calls with clientLogger.error
  const newContent = content.replace(CONSOLE_ERROR_RE, (match, indent) => {
    const labelMatch = match.match(LABEL_RE);
    const label = labelMatch ? labelMatch[2] : path.basename(file, ".tsx");
    replacements.push(label);
    changed = true;
    return `${indent}clientLogger.error("${label}", error);`;
  });

  if (!changed)   return { file: absPath, modified: false, replacements: [] };

  // Add import if not already present
  let final = newContent;
  if (!final.includes("createClientLogger")) {
    // Insert after "use client" if present, otherwise at top
    const useClientIdx = final.indexOf('"use client"');
    if (useClientIdx !== -1) {
      const lineEnd = final.indexOf("\n", useClientIdx);
      final =
        final.slice(0, lineEnd + 1) +
        "\n" +
        IMPORT_LINE +
        final.slice(lineEnd + 1);
    } else {
      final = IMPORT_LINE + "\n" + final;
    }
  }

  return { file: absPath, modified: true, replacements, content: final };
}

function main() {
  const applyMode = process.argv.includes("--apply");
  // Use forward slashes for glob cross-platform compatibility
  const globPattern = path.relative(PROJECT_ROOT, SRC_ROOT).split(path.sep).join("/") + "/**/error.tsx";
  const files = glob.sync(globPattern, { cwd: PROJECT_ROOT });

  let modified = 0;
  let skipped = 0;
  const report = [];

  for (const file of files) {
    const result = apply(file, PROJECT_ROOT);
    if (result.modified) {
      modified++;
      // Glob returns relative paths when cwd is set
      const relPath = typeof result.file === "string" && result.file.includes(":")
        ? path.relative(PROJECT_ROOT, result.file)
        : result.file;
      report.push(
        `  ${relPath} → ${result.replacements.join(", ")}`,
      );
      if (applyMode) {
        const absPath = path.isAbsolute(result.file) ? result.file : path.join(PROJECT_ROOT, result.file);
        fs.writeFileSync(absPath, result.content, "utf8");
      }
    } else {
      skipped++;
    }
  }

  console.log(`\n  error.tsx files scanned:  ${files.length}`);
  console.log(`  files modified:          ${modified}`);
  console.log(`  files skipped:           ${skipped}`);
  if (report.length) {
    console.log(`\n  Changes:\n${report.join("\n")}`);
  }
  if (!applyMode && modified > 0) {
    console.log(`\n  Dry-run. Re-run with --apply to write changes.`);
  }
  console.log();
}

main();
