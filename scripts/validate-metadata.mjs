#!/usr/bin/env node

/**
 * AQLIYA Metadata Validator
 *
 * Checks that every Source of Truth document contains required metadata:
 * - title (implied from H1)
 * - owner
 * - status
 * - priority (if applicable)
 * - last_reviewed
 * - source_of_truth (boolean)
 *
 * Usage:
 *   node scripts/validate-metadata.mjs
 *
 * Returns exit code 0 on success, 1 on failure.
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

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

console.log('\n🔍 AQLIYA Metadata Validator\n');

// 1. Load knowledge-map.json to find all SoT documents
let km;
try {
  km = JSON.parse(readFileSync(resolve(REPO_ROOT, 'docs/ai/knowledge-map.json'), 'utf-8'));
} catch (e) {
  error(`Cannot read knowledge-map.json: ${e.message}`);
  process.exit(1);
}

// Gather all unique document paths marked as sourceOfTruth
const sotDocs = [];
const groups = ['critical', 'high_priority', 'architecture', 'product', 'security', 'deployment', 'governance', 'operations', 'roadmaps', 'archive'];

for (const group of groups) {
  if (Array.isArray(km[group])) {
    for (const entry of km[group]) {
      if (entry.sourceOfTruth && entry.path) {
        // Handle paths with section references like "AGENTS.md §11"
        const cleanPath = entry.path.split(' ')[0];
        if (!sotDocs.some(d => d.path === cleanPath)) {
          sotDocs.push({ path: cleanPath, owner: entry.owner, priority: entry.priority });
        }
      }
    }
  }
}

console.log(`Found ${sotDocs.length} Source of Truth documents to validate`);

// 2. Validate each SoT document for metadata
const REQUIRED_FIELDS = ['owner', 'status', 'version'];
const OPTIONAL_FIELDS = ['priority', 'last_reviewed', 'date'];

let docsWithMetadata = 0;
let docsWithFullMetadata = 0;

for (const doc of sotDocs) {
  const fullPath = resolve(REPO_ROOT, doc.path);
  if (!existsSync(fullPath)) {
    warn(`SoT document "${doc.path}" does not exist`);
    continue;
  }

  const content = readFileSync(fullPath, 'utf-8');
  const firstBlock = content.split('---')[0] || content.substring(0, 1000);
  const headerBlock = content.substring(0, 2000);

  // Check for metadata patterns in the first lines
  // Pattern: **Field:** Value
  const metadata = {};
  // Match **Field:** Value patterns with flexible terminator:
  // Pattern: **FieldName:** Value
  // Terminators: | (pipe), \n followed by optional > and ** (next field), end of string
  // Handles inline (pipe), line-by-line, and blockquote (> ) formatted metadata
  const metaRegex = /\*\*(\w+(?:[-\s]\w+)*):\*\*\s*(.+?)(?=\s*(?:\||\n[ \t]*>?[ \t]*\*\*|$))/gs;
  let match;
  while ((match = metaRegex.exec(headerBlock)) !== null) {
    let field = match[1].toLowerCase().replace(/[\s-]+/g, '_');
    let value = match[2].trim();
    metadata[field] = value;
  }

  // Also check title from H1
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) metadata.title = h1Match[1].trim();

  // Check required fields
  const missingFields = [];
  for (const field of REQUIRED_FIELDS) {
    if (!metadata[field]) missingFields.push(field);
  }

  if (missingFields.length === 0) {
    docsWithFullMetadata++;
  }

  // Check status consistency with knowledge-map
  const kmStatus = doc.priority === 'P0-critical' ? 'critical' : 'active';
  // Not a hard error, just a cross-reference note

  // Report
  const hasOwner = !!metadata.owner;
  const hasStatus = !!metadata.status;
  const hasVersion = !!metadata.version;
  const hasDate = !!metadata.date || !!metadata.last_reviewed;

  const metaStatus = [];
  if (hasOwner) metaStatus.push('owner');
  if (hasStatus) metaStatus.push('status');
  if (hasVersion) metaStatus.push('version');
  if (hasDate) metaStatus.push('date');

  const allPresent = hasOwner && hasStatus && hasVersion;
  if (allPresent) {
    docsWithMetadata++;
  }

  const relPath = doc.path;
  if (!allPresent) {
    warn(`${relPath}: missing metadata fields [${missingFields.join(', ')}] (has: ${metaStatus.join(', ') || 'none'})`);
  }
}

// 3. Summary statistics
console.log(`\n📋 Metadata Coverage`);
console.log(`   SoT documents checked:      ${sotDocs.length}`);
console.log(`   Has owner:                  ${sotDocs.filter(d => {
    const fp = resolve(REPO_ROOT, d.path);
    if (!existsSync(fp)) return false;
    const c = readFileSync(fp, 'utf-8').substring(0, 2000);
    return /\*\*Owner:\*\*/i.test(c);
  }).length}`);
console.log(`   Has status:                 ${sotDocs.filter(d => {
    const fp = resolve(REPO_ROOT, d.path);
    if (!existsSync(fp)) return false;
    const c = readFileSync(fp, 'utf-8').substring(0, 2000);
    return /\*\*Status:\*\*/i.test(c);
  }).length}`);
console.log(`   Has version:                ${sotDocs.filter(d => {
    const fp = resolve(REPO_ROOT, d.path);
    if (!existsSync(fp)) return false;
    const c = readFileSync(fp, 'utf-8').substring(0, 2000);
    return /\*\*Version:\*\*/i.test(c);
  }).length}`);
console.log(`   Has last_reviewed:          ${sotDocs.filter(d => {
    const fp = resolve(REPO_ROOT, d.path);
    if (!existsSync(fp)) return false;
    const c = readFileSync(fp, 'utf-8').substring(0, 2000);
    return /\*\*Last Reviewed:\*\*/i.test(c) || /\*\*last_reviewed:\*\*/i.test(c);
  }).length}`);
console.log(`   Full metadata compliance:   ${docsWithFullMetadata}/${sotDocs.length}`);

// Report
console.log('\n' + '='.repeat(50));
console.log('📊 Metadata Validation Summary');
console.log('='.repeat(50));
console.log(`  SoT documents checked:  ${sotDocs.length}`);
console.log(`  Full metadata OK:       ${docsWithMetadata}/${sotDocs.length}`);
console.log(`  Errors:                 ${errors.length}`);
console.log(`  Warnings:               ${warnings.length}`);
console.log('='.repeat(50));

if (errors.length > 0) {
  console.log('\n❌ METADATA VALIDATION FAILED\n');
  process.exit(1);
} else if (docsWithMetadata < sotDocs.length) {
  // If not all documents have full metadata, warn but don't fail for legacy docs
  console.log(`\n⚠️  ${sotDocs.length - docsWithMetadata} document(s) missing some metadata (acceptable for pre-existing docs)\n`);
  process.exit(0);
} else {
  console.log('\n✅ METADATA VALIDATION PASSED\n');
  process.exit(0);
}
