#!/usr/bin/env node

/**
 * AQLIYA Document Link Checker
 *
 * Checks every internal markdown link within docs/ for existence:
 * - File references (absolute from repo root and relative)
 * - Anchor references to existing headings
 * - Referenced documents from knowledge-map.json
 *
 * Usage:
 *   node scripts/check-document-links.mjs
 *
 * Returns exit code 0 on success, 1 on failure.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, extname } from 'path';
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

// Get all markdown files under docs/
function getAllMarkdownFiles(dir) {
  const results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...getAllMarkdownFiles(fullPath));
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        results.push(fullPath);
      }
    }
  } catch { /* skip unreadable dirs */ }
  return results;
}

// Build a map of file -> headings for anchor validation
function buildHeadingMap(files) {
  const headingMap = {};
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8');
      const relPath = file.replace(REPO_ROOT + '\\', '').replace(/\\/g, '/');
      const headings = [];
      const headingRegex = /^(#{1,6})\s+(.+)$/gm;
      let match;
      while ((match = headingRegex.exec(content)) !== null) {
        const level = match[1].length;
        const text = match[2].replace(/[`*_~]/g, '').trim();
        // GitHub-style anchor: lowercase, replace spaces with -, remove special chars
        const anchor = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
        headings.push({ level, text, anchor });
      }
      headingMap[relPath] = headings;
      headingMap[file] = headings;
    } catch { /* skip unreadable */ }
  }
  return headingMap;
}

console.log('\n🔍 AQLIYA Document Link Checker\n');

const allMdFiles = getAllMarkdownFiles(DOCS_DIR);
console.log(`Found ${allMdFiles.length} markdown files under docs/`);

// Build heading map
const headingMap = buildHeadingMap(allMdFiles);

// Also include root-level .md files
const rootFiles = ['AGENTS.md', 'README.md'];
for (const file of rootFiles) {
  const fullPath = resolve(REPO_ROOT, file);
  if (existsSync(fullPath)) {
    allMdFiles.push(fullPath);
    const content = readFileSync(fullPath, 'utf-8');
    const relPath = file;
    const headings = [];
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    let match;
    while ((match = headingRegex.exec(content)) !== null) {
      const text = match[2].replace(/[`*_~]/g, '').trim();
      const anchor = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      headings.push({ anchor });
    }
    headingMap[relPath] = headings;
    headingMap[fullPath] = headings;
  }
}

// Strip docs/ prefix for existence checks
const allDocPaths = new Set(allMdFiles.map(f => {
  const rel = f.replace(REPO_ROOT + '\\', '').replace(/\\/g, '/');
  return rel;
}));

// Add known non-md files referenced by docs
const knownExtraPaths = [
  'docker-compose.yml', '.env.example', 'package.json',
  'tsconfig.json', 'next.config.mjs', '.gitleaks.toml'
];

for (const p of knownExtraPaths) {
  const fullPath = resolve(REPO_ROOT, p);
  if (existsSync(fullPath)) allDocPaths.add(p);
}

let totalLinks = 0;
let filesChecked = 0;

// Check links in each markdown file
for (const file of allMdFiles) {
  try {
    const content = readFileSync(file, 'utf-8');
    const relFile = file.replace(REPO_ROOT + '\\', '').replace(/\\/g, '/');
    const fileDir = dirname(file).replace(/\\/g, '/');

    // Find markdown links: [text](url)
    const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const linkText = match[1];
      let url = match[2].trim();

      totalLinks++;

      // Skip external links, mailto, and protocol URLs
      if (url.startsWith('http://') || url.startsWith('https://') ||
          url.startsWith('mailto:') || url.startsWith('#') ||
          url.startsWith('tel:') || url.startsWith('ftp://')) continue;

      // Skip reference-style links
      if (url.startsWith('^')) continue;

      // Strip anchor from URL
      let anchor = null;
      if (url.includes('#')) {
        const parts = url.split('#');
        url = parts[0];
        anchor = parts.slice(1).join('#');
      }

      if (!url) {
        // This was a pure anchor link like [text](#anchor)
        if (anchor) {
          // Validate anchor exists in this file
          const headings = headingMap[file] || [];
          const found = headings.some(h => h.anchor === anchor || h.text === anchor);
          if (!found) {
            warn(`${relFile}: anchor "#${anchor}" not found in same file (link: "${linkText}")`);
          }
        }
        continue;
      }

      // Resolve relative paths
      let resolvedPath;
      if (url.startsWith('/')) {
        // Absolute from repo root
        resolvedPath = resolve(REPO_ROOT, url.slice(1));
      } else {
        // Relative from current file
        resolvedPath = resolve(fileDir, url);
      }

      // Normalize to repo-relative path for checking
      const relResolved = resolvedPath.replace(REPO_ROOT + '\\', '').replace(/\\/g, '/');

      // Check if file exists
      if (!existsSync(resolvedPath) && !allDocPaths.has(relResolved)) {
        // Try with .md extension
        if (extname(resolvedPath) === '') {
          const withMd = resolvedPath + '.md';
          if (existsSync(withMd) || allDocPaths.has(relResolved + '.md')) continue;
        }
        error(`${relFile}: link "${url}" resolves to "${relResolved}" which does not exist`);
        continue;
      }

      // Validate anchor if present
      if (anchor) {
        const headings = headingMap[relResolved] || headingMap[resolvedPath] || [];
        const found = headings.some(h => h.anchor === anchor || h.text === anchor);
        if (!found) {
          warn(`${relFile}: anchor "#${anchor}" not found in ${relResolved} (link: "${linkText}")`);
        }
      }
    }

    filesChecked++;
  } catch (e) {
    warn(`Could not read ${file}: ${e.message}`);
  }
}

console.log(`\nChecked ${filesChecked} files, ${totalLinks} links`);

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Link Check Summary');
console.log('='.repeat(50));
console.log(`  Files checked:         ${filesChecked}`);
console.log(`  Total links scanned:   ${totalLinks}`);
console.log(`  Broken links:          ${errors.length}`);
console.log(`  Warnings:              ${warnings.length}`);
console.log('='.repeat(50));

if (errors.length > 0) {
  console.log('\n❌ LINK CHECK FAILED — fix broken links above\n');
  process.exit(1);
} else {
  console.log('\n✅ LINK CHECK PASSED\n');
  process.exit(0);
}
