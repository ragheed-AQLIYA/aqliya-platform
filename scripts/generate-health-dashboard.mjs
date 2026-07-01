#!/usr/bin/env node

/**
 * AQLIYA Documentation Health Dashboard Generator
 *
 * Produces a deterministic health dashboard (docs/DOCUMENTATION_HEALTH.md)
 * showing:
 * - Total document count
 * - Coverage %
 * - Broken links
 * - Orphan documents
 * - Metadata completeness
 * - SoT coverage
 * - Duplicate documents
 * - Review freshness
 * - Overall health score
 *
 * Usage:
 *   node scripts/generate-health-dashboard.mjs
 *
 * Output: docs/DOCUMENTATION_HEALTH.md
 */

import { readFileSync, existsSync, readdirSync, writeFileSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const DOCS_DIR = resolve(REPO_ROOT, 'docs');
const KM_PATH = resolve(REPO_ROOT, 'docs/ai/knowledge-map.json');
const OUTPUT = resolve(REPO_ROOT, 'docs/DOCUMENTATION_HEALTH.md');

console.log('\n🔍 AQLIYA Documentation Health Dashboard\n');

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
  } catch { /* skip */ }
  return results;
}

function countLines(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch { return 0; }
}

// Gather data
const allMdFiles = getAllMarkdownFiles(DOCS_DIR);

// Also count root .md files
const rootFiles = [];
for (const f of ['AGENTS.md', 'README.md']) {
  const fp = resolve(REPO_ROOT, f);
  if (existsSync(fp)) rootFiles.push(fp);
}

const totalMdFiles = allMdFiles.length + rootFiles.length;
let totalLines = 0;
for (const f of allMdFiles) totalLines += countLines(f);
for (const f of rootFiles) totalLines += countLines(f);

// Load knowledge-map
let km = { critical: [], high_priority: [], architecture: [], product: [], security: [], deployment: [], governance: [], operations: [], roadmaps: [], archive: [], deprecated: [], superseded: [] };
try {
  km = JSON.parse(readFileSync(KM_PATH, 'utf-8'));
} catch { /* use default */ }

const groups = Object.keys(km).filter(k => !k.startsWith('$'));
const kmTotal = groups.reduce((sum, g) => sum + (Array.isArray(km[g]) ? km[g].length : 0), 0);

// Count SoT documents
let sotCount = 0;
for (const group of groups) {
  if (Array.isArray(km[group])) {
    for (const entry of km[group]) {
      if (entry.sourceOfTruth) sotCount++;
    }
  }
}

// Count entries with owners
let withOwner = 0;
for (const group of groups) {
  if (Array.isArray(km[group])) {
    for (const entry of km[group]) {
      if (entry.owner && entry.owner !== 'Unassigned') withOwner++;
    }
  }
}

// Count entries with dependencies
let withDeps = 0;
for (const group of groups) {
  if (Array.isArray(km[group])) {
    for (const entry of km[group]) {
      if (Array.isArray(entry.dependsOn) && entry.dependsOn.length > 0) withDeps++;
    }
  }
}

// Count entries with readWhen
let withReadWhen = 0;
for (const group of groups) {
  if (Array.isArray(km[group])) {
    for (const entry of km[group]) {
      if (entry.readWhen) withReadWhen++;
    }
  }
}

// Check for duplicate paths
const pathCounts = {};
for (const group of groups) {
  if (Array.isArray(km[group])) {
    for (const entry of km[group]) {
      if (entry.path) {
        pathCounts[entry.path] = (pathCounts[entry.path] || 0) + 1;
      }
    }
  }
}
const duplicates = Object.entries(pathCounts).filter(([p, c]) => c > 1);

// Check for missing file references
let missingFiles = 0;
for (const group of groups) {
  if (Array.isArray(km[group])) {
    for (const entry of km[group]) {
      if (entry.path && !entry.path.endsWith('/')) {
        // Skip directories
        const fp = resolve(REPO_ROOT, entry.path);
        if (!existsSync(fp)) missingFiles++;
      }
    }
  }
}

// Review freshness check (approximate: check last modified dates of docs/official/)
const officialDir = resolve(REPO_ROOT, 'docs/official');
let freshCount = 0;
let staleCount = 0;
const thirtyDays = 30 * 24 * 60 * 60 * 1000;
const now = Date.now();

try {
  const officialFiles = readdirSync(officialDir, { withFileTypes: true });
  for (const f of officialFiles) {
    if (f.isFile() && f.name.endsWith('.md')) {
      const fp = resolve(officialDir, f.name);
      const mtime = statSync(fp).mtimeMs;
      if (now - mtime < thirtyDays) freshCount++;
      else staleCount++;
    }
  }
} catch { /* skip */ }

// Compute health score (0-100)
let healthScore = 100;
const deductions = [];

// Deduct for missing SoT files
if (missingFiles > 0) {
  const ded = Math.min(missingFiles * 5, 20);
  healthScore -= ded;
  deductions.push(`Missing document files: -${ded} (${missingFiles} missing)`);
}

// Deduct for duplicates
if (duplicates.length > 0) {
  const ded = Math.min(duplicates.length * 5, 15);
  healthScore -= ded;
  deductions.push(`Duplicate entries: -${ded} (${duplicates.length} duplicates)`);
}

// Deduct for stale docs
if (staleCount > 3) {
  const ded = Math.min((staleCount - 3) * 2, 10);
  healthScore -= ded;
  deductions.push(`Stale official docs: -${ded} (${staleCount} >30 days old)`);
}

// Deduct for incomplete metadata (less than 80% coverage)
const ownerCoverage = kmTotal > 0 ? (withOwner / kmTotal) * 100 : 0;
if (ownerCoverage < 80) {
  const ded = 10;
  healthScore -= ded;
  deductions.push(`Low owner coverage: -${ded} (${Math.round(ownerCoverage)}% have owners)`);
}

// Deduct for missing readWhen
const readWhenCoverage = kmTotal > 0 ? (withReadWhen / kmTotal) * 100 : 0;
if (readWhenCoverage < 50) {
  const ded = 5;
  healthScore -= ded;
  deductions.push(`Low readWhen coverage: -${ded} (${Math.round(readWhenCoverage)}% have readWhen)`);
}

healthScore = Math.max(healthScore, 0);

// Generate markdown
const lines = [];
lines.push('# AQLIYA Documentation Health Dashboard');
lines.push('');
lines.push(`> **Generated:** ${new Date().toISOString().split('T')[0]}`);
lines.push(`> **Health Score:** ${healthScore}/100`);
lines.push('');

// Health bar
const barLen = 20;
const filledLen = Math.round(healthScore / 100 * barLen);
const emptyLen = barLen - filledLen;
const bar = '█'.repeat(filledLen) + '░'.repeat(emptyLen);
lines.push(`\`${bar}\` **${healthScore}%**`);
lines.push('');

// Deductions
if (deductions.length > 0) {
  lines.push('### ⚠️ Deductions');
  lines.push('');
  for (const d of deductions) lines.push(`- ${d}`);
  lines.push('');
}

if (deductions.length === 0) {
  lines.push('### ✅ Perfect Health');
  lines.push('No deductions. All metrics are optimal.');
  lines.push('');
}

// Metrics overview
lines.push('## Coverage Metrics');
lines.push('');
lines.push('| Metric | Value |');
lines.push('|--------|-------|');
lines.push(`| Total Markdown Files | ${totalMdFiles} |`);
lines.push(`| Total Lines of Docs | ${totalLines} |`);
lines.push(`| Knowledge Map Entries | ${kmTotal} |`);
lines.push(`| Source of Truth Documents | ${sotCount} |`);
lines.push(`| Entries with Owners | ${withOwner}/${kmTotal} (${kmTotal > 0 ? Math.round(withOwner / kmTotal * 100) : 0}%) |`);
lines.push(`| Entries with Dependencies | ${withDeps}/${kmTotal} (${kmTotal > 0 ? Math.round(withDeps / kmTotal * 100) : 0}%) |`);
lines.push(`| Entries with readWhen | ${withReadWhen}/${kmTotal} (${kmTotal > 0 ? Math.round(readWhenCoverage) : 0}%) |`);
lines.push(`| Duplicate Paths | ${duplicates.length} |`);
lines.push(`| Missing Files | ${missingFiles} |`);
lines.push('');

// Groups breakdown
lines.push('## Section Breakdown');
lines.push('');
lines.push('| Section | Count |');
lines.push('|---------|-------|');

for (const group of Object.keys(km).filter(k => !k.startsWith('$'))) {
  const count = Array.isArray(km[group]) ? km[group].length : 0;
  lines.push(`| ${group.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} | ${count} |`);
}
lines.push('');

// Duplicates detail
if (duplicates.length > 0) {
  lines.push('## Duplicate Entries');
  lines.push('');
  lines.push('| Path | Count |');
  lines.push('|------|-------|');
  for (const [path, count] of duplicates) {
    lines.push(`| \`${path}\` | ${count} |`);
  }
  lines.push('');
}

// Missing files detail
if (missingFiles > 0) {
  lines.push('## Missing Files');
  lines.push('');
  lines.push('| Path | Section |');
  lines.push('|------|--------|');
  for (const group of groups) {
    if (Array.isArray(km[group])) {
      for (const entry of km[group]) {
        if (entry.path && !entry.path.endsWith('/')) {
          const fp = resolve(REPO_ROOT, entry.path);
          if (!existsSync(fp)) {
            lines.push(`| \`${entry.path}\` | ${group} |`);
          }
        }
      }
    }
  }
  lines.push('');
}

// Footer
lines.push('---');
lines.push('');
lines.push('_Generated by `scripts/generate-health-dashboard.mjs`. Manual edits will be overwritten._');

const output = lines.join('\n');
writeFileSync(OUTPUT, output, 'utf-8');

console.log(`✅ Health Dashboard written to ${OUTPUT.replace(REPO_ROOT, '').replace(/\\/g, '/')}`);
console.log(`   Health Score: ${healthScore}/100`);
console.log(`   Total entries: ${kmTotal}, SoT: ${sotCount}, Owners: ${withOwner}/${kmTotal}`);
console.log(`   Files: ${totalMdFiles}, Lines: ${totalLines}`);
console.log(`   Duplicates: ${duplicates.length}, Missing: ${missingFiles}`);
console.log('');
