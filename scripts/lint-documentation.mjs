#!/usr/bin/env node

/**
 * AQLIYA Documentation Linter
 *
 * Scans every markdown file under docs/ for:
 * - Duplicate headings (same-level headings with the same text)
 * - Empty sections (heading followed by another heading with no content)
 * - Broken tables (mismatched column counts)
 * - Missing H1 (title) on non-archive documents
 * - Oversized documents (>2000 lines)
 * - Suspect markdown patterns
 *
 * Usage:
 *   node scripts/lint-documentation.mjs
 *
 * Returns exit code 0 on success (warnings only), 1 on lint errors.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const DOCS_DIR = resolve(REPO_ROOT, 'docs');

const errors = [];
const warnings = [];

function error(msg) {
  errors.push(msg);
  console.error(`  ❌ ${msg}`);
}

function warn(msg) {
  warnings.push(msg);
  console.warn(`  ⚠️  ${msg}`);
}

function ok(msg) {
  console.log(`  ✅ ${msg}`);
}

console.log('\n🔍 AQLIYA Documentation Linter\n');

// Collect all markdown files
function getAllMarkdownFiles(dir, exclude = new Set(['node_modules', '.git', '.next', '.skills'])) {
  const results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (exclude.has(entry.name)) continue;
      if (entry.name.startsWith('.') && entry.isDirectory()) continue;
      const fullPath = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...getAllMarkdownFiles(fullPath, exclude));
      } else if (entry.name.endsWith('.md')) {
        results.push({ path: fullPath, relPath: fullPath.replace(REPO_ROOT + '\\', '').replace(/\\/g, '/') });
      }
    }
  } catch { /* skip */ }
  return results;
}

const files = getAllMarkdownFiles(DOCS_DIR);

// Also include root files
for (const f of ['AGENTS.md', 'README.md']) {
  const fp = resolve(REPO_ROOT, f);
  if (existsSync(fp)) {
    files.push({ path: fp, relPath: f });
  }
}

console.log(`Found ${files.length} markdown files`);

// Check each file
let filesWithErrors = 0;
let totalIssues = 0;

for (const { path, relPath } of files) {
  const content = readFileSync(path, 'utf-8');
  const lines = content.split('\n');
  const issues = [];

  // 1. Check for H1
  const hasH1 = /^#\s/m.test(content);
  if (!hasH1 && !relPath.startsWith('docs/archive/') && !relPath.startsWith('docs/validation/')) {
    issues.push('Missing H1 title (# Title)');
  }

  // 2. Check for oversized documents
  if (lines.length > 2000) {
    issues.push(`Oversized: ${lines.length} lines (>2000 recommended)`);
  }

  // 3. Check for duplicate headings (same level, same text)
  const headings = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const key = `${level}:${text.toLowerCase()}`;
    if (headings.includes(key)) {
      issues.push(`Duplicate heading: "${'#'.repeat(level)} ${text}"`);
    }
    headings.push(key);
  }

  // 4. Check for empty sections (heading followed by another heading with no content)
  const lineHeadings = [];
  const lineHeadingRegex = /^(#{1,6})\s+(.+)$/;
  for (let i = 0; i < lines.length; i++) {
    const hm = lines[i].match(lineHeadingRegex);
    if (hm) {
      lineHeadings.push({ line: i, level: hm[1].length, text: hm[2].trim() });
    }
  }
  for (let i = 0; i < lineHeadings.length - 1; i++) {
    const current = lineHeadings[i];
    const next = lineHeadings[i + 1];
    // Check if there's content between headings
    const between = lines.slice(current.line + 1, next.line);
    const hasContent = between.some(l => l.trim() !== '' && !l.trim().startsWith('<!--'));
    if (!hasContent && current.level > 1) {
      issues.push(`Empty section: "${current.text}"`);
    }
  }

  // 5. Check for broken tables
  const tableRows = [];
  const tableRegex = /^\|.+\|$/;
  for (let i = 0; i < lines.length; i++) {
    if (tableRegex.test(lines[i])) {
      tableRows.push(i);
    }
  }
  // Group consecutive table rows
  let i = 0;
  while (i < tableRows.length) {
    const start = tableRows[i];
    let j = i + 1;
    while (j < tableRows.length && tableRows[j] === tableRows[j - 1] + 1) j++;
    const group = tableRows.slice(i, j);
    if (group.length >= 2) {
      // Check column alignment
      const cols = lines[group[0]].split('|').length - 2; // subtract leading/trailing empty
      for (let k = 1; k < group.length; k++) {
        const rowCols = lines[group[k]].split('|').length - 2;
        if (rowCols !== cols) {
          issues.push(`Broken table near line ${group[k] + 1}: expected ${cols} columns, got ${rowCols}`);
        }
      }
      // Also check for separator row (line 2 of table)
      if (group.length >= 2) {
        const sepLine = lines[group[0] + 1] || '';
        if (!/^\|[\s-:]+\|/.test(sepLine)) {
          issues.push(`Missing table separator row after line ${group[0] + 1}`);
        }
      }
    }
    i = j;
  }

  // 6. Check for empty alt text in images
  const imgAltRegex = /!\[\s*\]\(/g;
  while ((match = imgAltRegex.exec(content)) !== null) {
    issues.push('Image with empty alt text');
  }

  // 7. Warn about bare URLs (potential missing links)
  // Skip for now - too noisy

  // Report issues
  if (issues.length > 0) {
    filesWithErrors++;
    totalIssues += issues.length;
    for (const issue of issues) {
      warn(`${relPath}: ${issue}`);
    }
  } else {
    ok(relPath);
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Documentation Lint Summary');
console.log('='.repeat(50));
console.log(`  Files checked:       ${files.length}`);
console.log(`  Files with issues:   ${filesWithErrors}`);
console.log(`  Total issues:        ${totalIssues}`);
console.log(`  Errors:              ${errors.length}`);
console.log(`  Warnings:            ${warnings.length}`);
console.log('='.repeat(50));

if (errors.length > 0) {
  console.log('\n❌ DOCUMENTATION LINT FAILED\n');
  process.exit(1);
} else if (totalIssues > 10) {
  console.log(`\n⚠️  ${totalIssues} lint issues found (tolerable for legacy docs)\n`);
  process.exit(0);
} else {
  console.log('\n✅ DOCUMENTATION LINT PASSED\n');
  process.exit(0);
}
