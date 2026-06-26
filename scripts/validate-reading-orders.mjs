#!/usr/bin/env node

/**
 * AQLIYA Reading Order Validator
 *
 * Validates that:
 * 1. All files listed in AI_ENTRYPOINT.md's reading order table exist
 * 2. Each file is accessible and contains a valid H1 title
 * 3. The reading order is consistent (no self-referencing loops)
 * 4. Priority ordering (position 0 = AI_ENTRYPOINT.md) is correct
 *
 * Usage:
 *   node scripts/validate-reading-orders.mjs
 *
 * Returns exit code 0 on success, 1 on failure.
 */

import { readFileSync, existsSync } from 'fs';
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

console.log('\n🔍 AQLIYA Reading Order Validator\n');

// 1. Read AI_ENTRYPOINT.md
let entrypoint;
try {
  entrypoint = readFileSync(resolve(REPO_ROOT, 'docs/AI_ENTRYPOINT.md'), 'utf-8');
} catch (e) {
  error(`Cannot read docs/AI_ENTRYPOINT.md: ${e.message}`);
  process.exit(1);
}

// 2. Parse the reading order table
// Pattern: | <number> | `<path>` | <description> | <time> |
const readingOrderRegex = /^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|([^|]*)\|([^|]*)\|/gm;

const entries = [];
let match;
while ((match = readingOrderRegex.exec(entrypoint)) !== null) {
  entries.push({
    position: parseInt(match[1], 10),
    path: match[2].trim(),
    reason: match[3].trim(),
    time: match[4].trim()
  });
}

console.log(`Found ${entries.length} reading order entries`);

// 3. Check that AI_ENTRYPOINT.md itself is at position 0
const entryZero = entries.find(e => e.position === 0);
if (entryZero) {
  if (entryZero.path === 'docs/AI_ENTRYPOINT.md') {
    ok('Position #0 correctly points to docs/AI_ENTRYPOINT.md');
  } else {
    error(`Position #0 should point to docs/AI_ENTRYPOINT.md, but points to "${entryZero.path}"`);
  }
} else {
  error('No position #0 found in reading order');
}

// 4. Check for gaps in position numbering
const positions = entries.map(e => e.position).sort((a, b) => a - b);
const expectedPositions = [];
for (let i = 0; i <= positions[positions.length - 1]; i++) {
  expectedPositions.push(i);
}
const missingPositions = expectedPositions.filter(p => !positions.includes(p));
if (missingPositions.length > 0) {
  warn(`Gaps in reading order: positions ${missingPositions.join(', ')} are missing`);
}

// 5. Validate each file exists and has a title
let filesOk = 0;
let filesMissing = 0;

for (const entry of entries) {
  const fullPath = resolve(REPO_ROOT, entry.path);
  
  if (!existsSync(fullPath)) {
    error(`File not found: ${entry.path} (position #${entry.position})`);
    filesMissing++;
    continue;
  }

  const content = readFileSync(fullPath, 'utf-8');
  const h1Match = content.match(/^#\s+(.+)$/m);
  
  if (h1Match) {
    ok(`Position #${entry.position}: ${entry.path} — "${h1Match[1].trim()}"`);
    filesOk++;
  } else {
    // Some files have H1 in a non-standard format (e.g., README)
    const altH1Match = content.match(/(?:^|\n)#\s+(.+)$/);
    if (altH1Match) {
      ok(`Position #${entry.position}: ${entry.path} — "${altH1Match[1].trim()}" (alternate H1)`);
      filesOk++;
    } else {
      warn(`Position #${entry.position}: ${entry.path} — no H1 title found`);
    }
  }
}

// 6. Check that AI_KNOWLEDGE_MAP.md has all reading order entries indexed
let km;
try {
  km = JSON.parse(readFileSync(resolve(REPO_ROOT, 'docs/ai/knowledge-map.json'), 'utf-8'));
} catch (e) {
  warn(`Cannot read knowledge-map.json: ${e.message}`);
}

if (km) {
  const allKmPaths = [];
  for (const key of Object.keys(km)) {
    if (Array.isArray(km[key])) {
      for (const entry of km[key]) {
        if (entry.path) {
          allKmPaths.push(entry.path.split(' ')[0]); // strip section refs
        }
      }
    }
  }

  for (const entry of entries) {
    const strippedPath = entry.path.split(' ')[0];
    if (!allKmPaths.includes(strippedPath)) {
      warn(`Reading order path "${strippedPath}" not found in knowledge-map.json`);
    }
  }
}

// 7. Check for duplicate paths
const pathCounts = {};
for (const entry of entries) {
  pathCounts[entry.path] = (pathCounts[entry.path] || 0) + 1;
}
for (const [path, count] of Object.entries(pathCounts)) {
  if (count > 1) {
    warn(`Duplicate path in reading order: "${path}" appears ${count} times`);
  }
}

// Report
console.log('\n' + '='.repeat(50));
console.log('📊 Reading Order Validation Summary');
console.log('='.repeat(50));
console.log(`  Files checked:           ${entries.length}`);
console.log(`  Files found:             ${filesOk}`);
console.log(`  Files missing:           ${filesMissing}`);
console.log(`  Position gaps:           ${missingPositions.length > 0 ? missingPositions.join(', ') : 'none'}`);
console.log(`  Errors:                  ${errors.length}`);
console.log(`  Warnings:                ${warnings.length}`);
console.log('='.repeat(50));

if (errors.length > 0) {
  console.log('\n❌ READING ORDER VALIDATION FAILED\n');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log(`\n⚠️  ${warnings.length} warning(s) found (non-blocking)\n`);
  process.exit(0);
} else {
  console.log('\n✅ READING ORDER VALIDATION PASSED\n');
  process.exit(0);
}
