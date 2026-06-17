#!/usr/bin/env node

/**
 * Repository Health Gate — CI check for repository entropy
 *
 * Prevents the return of patterns cleaned up in the 2026-06-08 entropy cleanup.
 * Designed to run in CI pipeline (fast, zero external deps, no DB needed).
 *
 * Usage:
 *   node scripts/repo-health-gate.mjs           # check everything
 *   node scripts/repo-health-gate.mjs --verbose  # show details
 *   node scripts/repo-health-gate.mjs --ci       # exit 1 on failure
 *
 * Exit codes:
 *   0 — all gates pass
 *   1 — one or more gates fail
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const VERBOSE = process.argv.includes("--verbose");
const CI_MODE = process.argv.includes("--ci");

const results = [];

function fail(message) {
  results.push({ ok: false, message });
  if (VERBOSE || CI_MODE) console.error(`  ❌ ${message}`);
}

function pass(message) {
  results.push({ ok: true, message });
  if (VERBOSE) console.log(`  ✅ ${message}`);
}

function findFiles(rootDir, pattern) {
  const matches = [];
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip node_modules, .git, .next, and agent sandboxes
        if (
          entry.name === "node_modules" ||
          entry.name === ".git" ||
          entry.name === ".next" ||
          entry.name === ".claude" ||
          entry.name === "backups" ||
          entry.name === "node_modules"
        )
          continue;
        walk(full);
      } else if (entry.name.match(pattern)) {
        matches.push(full.replace(ROOT, "").replace(/\\/g, "/"));
      }
    }
  }
  walk(rootDir);
  return matches;
}

// ─── Gate 1: No .bak files ───────────────────────────────────────────────────
console.log("\n📁 Gate 1: No .bak files in source tree");
const bakFiles = findFiles(ROOT, /\.bak$/);
if (bakFiles.length > 0) {
  fail(`Found ${bakFiles.length} .bak file(s) in source tree`);
  if (VERBOSE) bakFiles.forEach((f) => console.error(`     ${f}`));
} else {
  pass("No .bak files found");
}

// ─── Gate 2: No cookie files ─────────────────────────────────────────────────
console.log("🍪 Gate 2: No cookie files in repository");
const cookieFiles = findFiles(ROOT, /^cookies\d*\.txt$/);
if (cookieFiles.length > 0) {
  fail(`Found ${cookieFiles.length} cookie file(s)`);
  if (VERBOSE) cookieFiles.forEach((f) => console.error(`     ${f}`));
} else {
  pass("No cookie files found");
}

// ─── Gate 3: No random .md files at docs/ root (only allowed list) ───────────
console.log("📚 Gate 3: docs/ root contains only allowed files");
const ALLOWED_DOCS_ROOT = [
  "CONTRIBUTING.md",
  "DEVELOPER.md",
  "DOCUMENTATION_AUTHORITY.md",
  "README.md",
];
const docsRoot = fs.readdirSync(path.join(ROOT, "docs"));
const rogueDocs = docsRoot.filter(
  (f) => f.endsWith(".md") && !ALLOWED_DOCS_ROOT.includes(f)
);
if (rogueDocs.length > 0) {
  fail(
    `Found ${rogueDocs.length} unallowed .md file(s) in docs/ root: ${rogueDocs.join(", ")}`
  );
} else {
  pass("docs/ root contains only allowed files");
}

// ─── Gate 4: No random top-level markdown files (root) ───────────────────────
console.log("🏠 Gate 4: Project root contains only allowed .md files");
const ALLOWED_ROOT_MD = [
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
];
const rootFiles = fs.readdirSync(ROOT);
const rogueRootMd = rootFiles.filter(
  (f) => f.endsWith(".md") && !ALLOWED_ROOT_MD.includes(f) && f !== "package.json"
);
if (rogueRootMd.length > 0) {
  fail(
    `Found ${rogueRootMd.length} unallowed .md file(s) in project root: ${rogueRootMd.join(", ")}`
  );
} else {
  pass("Project root contains only allowed .md files");
}

// ─── Gate 5: No temp/scratch patterns in src/ ────────────────────────────────
console.log("🧹 Gate 5: No temp/scratch files in src/");
const tempPatterns = [
  /^temp\./,
  /\.temp\./,
  /^copy\b/,
  /^copy\(\d+\)/,
  /^test\d+\./,
  /^scratch\./,
  /^playground\./,
];
const srcDir = path.join(ROOT, "src");
const tempFiles = [];
function walkSrc(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === "__pycache__"
      )
        continue;
      walkSrc(full);
    } else if (tempPatterns.some((p) => p.test(entry.name))) {
      tempFiles.push(full.replace(ROOT, "").replace(/\\/g, "/"));
    }
  }
}
walkSrc(srcDir);
if (tempFiles.length > 0) {
  fail(`Found ${tempFiles.length} temp/scratch file(s) in src/`);
  if (VERBOSE) tempFiles.forEach((f) => console.error(`     ${f}`));
} else {
  pass("No temp/scratch files found in src/");
}

// ─── Gate 6: No legacy error logs at root ────────────────────────────────────
console.log("📋 Gate 6: No legacy error logs at project root");
const rootErrorLogs = findFiles(ROOT, /^\.salesos-.*\.txt$/);
if (rootErrorLogs.length > 0) {
  fail(`Found ${rootErrorLogs.length} legacy error log(s) at root`);
  if (VERBOSE) rootErrorLogs.forEach((f) => console.error(`     ${f}`));
} else {
  pass("No legacy error logs at project root");
}

// ─── Summary ─────────────────────────────────────────────────────────────────
const failed = results.filter((r) => !r.ok);
const passed = results.filter((r) => r.ok);

console.log(`\n═══════════════════════════════════════════`);
console.log(`Repository Health Gate — ${failed.length} failed, ${passed.length} passed`);
console.log(`═══════════════════════════════════════════\n`);

if (failed.length > 0 && CI_MODE) {
  process.exit(1);
}
