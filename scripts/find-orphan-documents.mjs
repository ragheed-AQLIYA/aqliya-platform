#!/usr/bin/env node

/**
 * AQLIYA Orphan Document Detector
 *
 * Finds documents under docs/ that are:
 * - Never referenced from any index/navigation document
 * - Not registered in knowledge-map.json
 * - Missing inbound references (isolated)
 *
 * Usage:
 *   node scripts/find-orphan-documents.mjs
 *
 * Returns exit code 0 on success, 1 on failure.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { resolve, dirname, extname, relative } from 'path';
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

// Get all markdown/docs files recursively, excluding node_modules and .git
function getAllDocFiles(dir, relativeTo = REPO_ROOT) {
  const results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = resolve(dir, entry.name);
      const relPath = fullPath.replace(relativeTo + '\\', '').replace(/\\/g, '/');

      // Skip hidden dirs, node_modules, .git
      if (entry.name.startsWith('.') && entry.isDirectory()) continue;
      if (entry.name === 'node_modules') continue;

      if (entry.isDirectory()) {
        results.push(...getAllDocFiles(fullPath, relativeTo));
      } else if (
        entry.name.endsWith('.md') ||
        entry.name.endsWith('.mdx') ||
        entry.name.endsWith('.json') ||
        entry.name.endsWith('.yaml') ||
        entry.name.endsWith('.yml')
      ) {
        results.push({ path: fullPath, relPath });
      }
    }
  } catch { /* skip unreadable */ }
  return results;
}

console.log('\n🔍 AQLIYA Orphan Document Detector\n');

// 1. Gather all docs
const allDocs = getAllDocFiles(DOCS_DIR);

// Also include root-level docs
for (const file of ['AGENTS.md', 'README.md', 'CLAUDE.md']) {
  const fullPath = resolve(REPO_ROOT, file);
  if (existsSync(fullPath)) {
    allDocs.push({
      path: fullPath,
      relPath: file
    });
  }
}

console.log(`Found ${allDocs.length} total document files`);

// 2. Define navigation/index documents (these are the "entry points" that should reference others)
const NAVIGATION_DOCS = [
  'AGENTS.md',
  'README.md',
  'docs/README.md',
  'docs/AI_ENTRYPOINT.md',
  'docs/AI_KNOWLEDGE_MAP.md',
  'docs/AI_STARTUP_CURRICULUM.md',
  'docs/AI_READING_PROFILES.md',
  'docs/DOCUMENTATION_AUTHORITY.md',
  'docs/DOCUMENTATION_AUTHORITY_MATRIX.md',
  'docs/DOCUMENTATION_GOVERNANCE_v2.md',
  'docs/ai/knowledge-map.json',
];

// Build a set of all referenced paths from navigation docs
function extractReferences(content, filePath) {
  const refs = new Set();

  // Markdown links: [text](url)
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    let url = match[2].trim();
    if (url.startsWith('http') || url.startsWith('mailto:')) continue;
    if (url.startsWith('#')) {
      // Anchors within the same file
      refs.add(filePath);
      continue;
    }
    const anchorIdx = url.indexOf('#');
    if (anchorIdx > 0) url = url.substring(0, anchorIdx);

    // Resolve relative paths
    if (url.startsWith('/')) {
      refs.add(url.slice(1));
    } else {
      // Relative to parent dir of current file
      const parentDir = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '.';
      const resolved = parentDir + '/' + url;
      // Normalize
      const parts = resolved.split('/');
      const normalized = [];
      for (const p of parts) {
        if (p === '..') normalized.pop();
        else if (p !== '.') normalized.push(p);
      }
      refs.add(normalized.join('/'));
    }
  }

  // Inline code references to file paths
  const inlineRegex = /`([^`]+\.md)`/g;
  while ((match = inlineRegex.exec(content)) !== null) {
    refs.add(match[1]);
  }

  return refs;
}

// 3. Collect all references
const allReferences = new Set();

for (const doc of allDocs) {
  const relPath = doc.relPath;
  if (NAVIGATION_DOCS.includes(relPath)) {
    try {
      const content = readFileSync(doc.path, 'utf-8');
      const refs = extractReferences(content, relPath);
      for (const ref of refs) allReferences.add(ref);
    } catch { /* skip */ }
  }
}

// Also load knowledge-map.json paths
try {
  const km = JSON.parse(readFileSync(resolve(REPO_ROOT, 'docs/ai/knowledge-map.json'), 'utf-8'));
  const groups = ['critical', 'high_priority', 'architecture', 'product', 'security', 'deployment', 'governance', 'operations', 'roadmaps', 'archive', 'deprecated', 'superseded'];
  for (const group of groups) {
    if (Array.isArray(km[group])) {
      for (const entry of km[group]) {
        if (entry.path) {
          allReferences.add(entry.path);
          if (entry.supersededBy) allReferences.add(entry.supersededBy);
        }
      }
    }
  }
} catch { /* skip */ }

// 4. Exclusions — known non-documentation files that don't need references
const EXCLUDED_PATTERNS = [
  /desktop\.ini$/,
  /node_modules/,
  /\.git/,
  /\.next/,
  /\.skills/,
  /docs\/archive\//,
  /docs\/theoretical-reference\//,
  /docs\/validation\//,
  /docs\/deliverables\//,
  /docs\/audits\//,
];

function isExcluded(relPath) {
  return EXCLUDED_PATTERNS.some(p => p.test(relPath));
}

// 4.5 Load known-orphans allowlist
let knownOrphans = new Set();
const KNOWN_ORPHANS_PATH = resolve(REPO_ROOT, 'docs/validation/known-orphans.json');
try {
  const ko = JSON.parse(readFileSync(KNOWN_ORPHANS_PATH, 'utf-8'));
  if (Array.isArray(ko.orphans)) {
    for (const entry of ko.orphans) {
      if (entry.expected) knownOrphans.add(entry.path.replace(/\\/g, '/'));
    }
  }
} catch { /* no allowlist — treat all as hard */ }

// 5. Find orphans
const orphans = [];
const unreferenced = [];

for (const doc of allDocs) {
  const relPath = doc.relPath;

  // Skip known exclusions
  if (isExcluded(relPath)) continue;

  // Skip navigation docs themselves
  if (NAVIGATION_DOCS.includes(relPath)) continue;

  // Check if referenced from any navigation doc
  const referenced = Array.from(allReferences).some(ref => {
    // Exact match
    if (ref === relPath) return true;
    // Path ends with the file name
    if (ref.endsWith('/' + relPath)) return true;
    // File name match (without path)
    const fileName = relPath.split('/').pop();
    if (ref.endsWith('/' + fileName) || ref === fileName) return true;
    return false;
  });

  if (!referenced) {
    unreferenced.push(relPath);
  }
}

// 6. Check knowledge-map.json registration
const kmPaths = new Set();
try {
  const km = JSON.parse(readFileSync(resolve(REPO_ROOT, 'docs/ai/knowledge-map.json'), 'utf-8'));
  const groups = ['critical', 'high_priority', 'architecture', 'product', 'security', 'deployment', 'governance', 'operations', 'roadmaps', 'archive'];
  for (const group of groups) {
    if (Array.isArray(km[group])) {
      for (const entry of km[group]) {
        if (entry.path) kmPaths.add(entry.path);
      }
    }
  }
} catch { /* skip */ }

const notInKm = [];
for (const doc of allDocs) {
  const relPath = doc.relPath;
  if (isExcluded(relPath)) continue;
  if (NAVIGATION_DOCS.includes(relPath)) continue;

  // Check if this relPath or its directory version appears in knowledge-map
  const inKm = Array.from(kmPaths).some(kp => {
    if (kp === relPath) return true;
    if (kp.endsWith('/') && relPath.startsWith(kp)) return true;
    return false;
  });

  if (!inKm) {
    notInKm.push(relPath);
  }
}

// 7. Report
console.log(`\n📋 Orphan Analysis`);
console.log(`   Navigation docs:      ${NAVIGATION_DOCS.length}`);
console.log(`   Referenceable docs:   ${allDocs.length}`);
console.log(`   Total references:     ${allReferences.size}`);
console.log(`   Excluded patterns:    ${EXCLUDED_PATTERNS.length}`);

console.log(`\n🔸 Results:`);

if (unreferenced.length === 0) {
  ok('0 unreferenced documents found');
} else {
  console.log(`\n  ⚠️  ${unreferenced.length} documents not referenced from any navigation doc:`);
  for (const doc of unreferenced.sort()) {
    warn(`Unreferenced: ${doc}`);
  }
}

if (notInKm.length === 0) {
  ok('0 documents missing from knowledge-map.json');
} else {
  console.log(`\n  ⚠️  ${notInKm.length} documents not registered in knowledge-map.json:`);
  for (const doc of notInKm.sort()) {
    if (!unreferenced.includes(doc)) continue; // avoid double-counting
    warn(`Not in knowledge-map: ${doc}`);
  }
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Orphan Detection Summary');
console.log('='.repeat(50));
console.log(`  Total documents scanned:  ${allDocs.length}`);
console.log(`  Unreferenced documents:   ${unreferenced.length}`);
console.log(`  Not in knowledge-map:     ${notInKm.length}`);
console.log('='.repeat(50));

// Only fail on errors (hard orphans that are also not in km)
const hardOrphans = unreferenced.filter(u => notInKm.includes(u));
const unexpectedHardOrphans = hardOrphans.filter(u => !knownOrphans.has(u));
const expectedOrphans = hardOrphans.filter(u => knownOrphans.has(u));

if (expectedOrphans.length > 0) {
  console.log(`\nℹ️  ${expectedOrphans.length} hard orphan(s) are in known-orphans allowlist (expected)`);
}

if (unexpectedHardOrphans.length > 0) {
  console.log(`\n❌ ${unexpectedHardOrphans.length} unexpected hard orphan(s) found (not in known-orphans allowlist)\n`);
  process.exit(1);
} else if (hardOrphans.length > 0 && expectedOrphans.length === hardOrphans.length) {
  console.log(`\n✅ All ${hardOrphans.length} hard orphan(s) are expected (in known-orphans allowlist)\n`);
  process.exit(0);
} else if (unreferenced.length > 0) {
  console.log(`\n⚠️  ${unreferenced.length} soft orphan(s) found (unreferenced but registered in knowledge-map)\n`);
  process.exit(0);
} else {
  console.log('\n✅ No orphan documents found\n');
  process.exit(0);
}
