#!/usr/bin/env node
/**
 * fix-missing-h1.mjs
 *
 * Adds H1 titles to documentation files missing them.
 * Strategy:
 *  - Extract title from first # heading in content (even if not at start-of-line)
 *  - Or use first `<h1>` tag
 *  - Or derive from the filename
 *  - Or from the first paragraph
 *
 * Usage: node scripts/fix-missing-h1.mjs [--dry-run] [--path <subdir>]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DOCS = path.join(ROOT, "docs");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const SUBDIR = args.includes("--path") ? args[args.indexOf("--path") + 1] : null;

// Patterns for extracting a title
const H1_RE = /^#\s+(.+)$/m;          // # Title at start of line
const H1_ANYWHERE = /^[ \t]*#\s+(.+)$/m; // # Title even with leading whitespace
const HTML_H1 = /<h1[^>]*>([^<]+)<\/h1>/i;
const MARKDOWN_TITLE_RE = /^#+\s+(.+)$/m;

function walkSync(dir, files = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      walkSync(full, files);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(full);
    }
  }
  return files;
}

function extractTitle(content, filename) {
  // Try H1 at line start
  const m1 = content.match(H1_RE);
  if (m1) return { title: m1[1].trim(), source: "existing-h1" };

  // Try H1 with leading whitespace
  const m2 = content.match(H1_ANYWHERE);
  if (m2) return { title: m2[1].trim(), source: "indented-h1" };

  // Try HTML H1
  const m3 = content.match(HTML_H1);
  if (m3) return { title: m3[1].trim(), source: "html-h1" };

  // Derive from filename
  const basename = path.basename(filename, ".md");
  const titleFromFile = basename
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/^(Aqliya|Os|Sdk|Db|Api|Ui|Pdf|Xml|Json|Yaml|Html|Css|Js|Ts|Mjs|Mdx)\b/g, (m) => m.toUpperCase());
  
  // Use first heading of any level
  const m4 = content.match(MARKDOWN_TITLE_RE);
  if (m4) return { title: m4[1].trim(), source: "any-heading" };

  // Use first paragraph (non-empty, non-heading, non-code)
  const lines = content.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && !trimmed.startsWith("```") && !trimmed.startsWith("<!--") && !trimmed.startsWith(">")) {
      return { title: trimmed.substring(0, 120).replace(/[#*`_]/g, "").trim(), source: "first-paragraph" };
    }
  }

  // Last resort: filename
  return { title: titleFromFile, source: "filename" };
}

function hasH1AtLineStart(content) {
  return H1_RE.test(content);
}

function fixH1(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  
  if (hasH1AtLineStart(content)) {
    return { fixed: false, reason: "already-has-h1" };
  }

  const { title, source } = extractTitle(content, filePath);
  if (!title || title.length === 0) {
    return { fixed: false, reason: "no-title-found" };
  }

  const newContent = `# ${title}\n\n${content}`;
  
  if (!DRY_RUN) {
    fs.writeFileSync(filePath, newContent, "utf-8");
  }

  return { fixed: true, source, title: title.substring(0, 80), file: path.relative(ROOT, filePath) };
}

// --- Main ---
const searchDir = SUBDIR ? path.join(DOCS, SUBDIR) : DOCS;
if (!fs.existsSync(searchDir)) {
  console.error(`Directory not found: ${searchDir}`);
  process.exit(1);
}

console.log(`🔍 Scanning for files missing H1 in: ${path.relative(ROOT, searchDir)}`);
const allFiles = walkSync(searchDir);
console.log(`   Found ${allFiles.length} .md files`);

let fixed = 0;
let skipped = 0;
let errors = 0;

for (const file of allFiles) {
  try {
    const result = fixH1(file);
    if (result.fixed) {
      fixed++;
      if (fixed <= 20 || DRY_RUN) {
        console.log(`   ${DRY_RUN ? "[DRY-RUN]" : "[FIXED]"} ${result.file}  (from: ${result.source})`);
      }
    } else {
      skipped++;
    }
  } catch (err) {
    errors++;
    if (errors <= 5) {
      console.error(`   [ERROR] ${path.relative(ROOT, file)}: ${err.message}`);
    }
  }
}

console.log(`\n📊 Results:`);
console.log(`   Files scanned: ${allFiles.length}`);
console.log(`   H1 added:      ${fixed}`);
console.log(`   Skipped:       ${skipped}`);
console.log(`   Errors:        ${errors}`);
if (DRY_RUN) {
  console.log(`\n⚠️  DRY RUN — no files were modified.`);
}
