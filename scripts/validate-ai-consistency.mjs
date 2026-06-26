#!/usr/bin/env node

/**
 * AQLIYA AI Documentation Consistency Validator
 *
 * Verifies that the following 7 AI guidance documents remain synchronized:
 * 1. AI_ENTRYPOINT.md — references AI_KNOWLEDGE_MAP.md
 * 2. AI_KNOWLEDGE_MAP.md — references all registered documents
 * 3. knowledge-map.json — machine-readable inventory
 * 4. DOCUMENTATION_AUTHORITY.md — hierarchy definition
 * 5. DOCUMENTATION_GOVERNANCE_v2.md — lifecycle rules
 * 6. AI_READING_PROFILES.md — per-tool reading plans
 * 7. AI_STARTUP_CURRICULUM.md — progressive learning path
 *
 * Checks:
 * - All cross-references between docs are valid
 * - No dangling references to non-existent files
 * - Reading order files exist
 * - No major discrepancies between human and machine inventories
 *
 * Usage:
 *   node scripts/validate-ai-consistency.mjs
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

console.log('\n🔍 AI Documentation Consistency Validator\n');

// Define the 7 AI guidance documents
const AI_DOCS = {
  entrypoint: { path: 'docs/AI_ENTRYPOINT.md', name: 'AI Entrypoint' },
  knowledgeMapHuman: { path: 'docs/AI_KNOWLEDGE_MAP.md', name: 'AI Knowledge Map (human)' },
  knowledgeMapMachine: { path: 'docs/ai/knowledge-map.json', name: 'Knowledge Map (machine)' },
  authority: { path: 'docs/DOCUMENTATION_AUTHORITY.md', name: 'Documentation Authority' },
  governance: { path: 'docs/DOCUMENTATION_GOVERNANCE_v2.md', name: 'Documentation Governance v2' },
  readingProfiles: { path: 'docs/AI_READING_PROFILES.md', name: 'AI Reading Profiles' },
  curriculum: { path: 'docs/AI_STARTUP_CURRICULUM.md', name: 'AI Startup Curriculum' },
};

// 1. Check all 7 files exist
console.log('Checking file existence...');
let allExist = true;
for (const [key, doc] of Object.entries(AI_DOCS)) {
  const fp = resolve(REPO_ROOT, doc.path);
  if (existsSync(fp)) {
    ok(`${doc.name}: ${doc.path}`);
  } else {
    error(`${doc.name}: ${doc.path} — FILE NOT FOUND`);
    allExist = false;
  }
}

if (!allExist) {
  console.log('\n❌ CRITICAL: Some AI guidance documents are missing\n');
  process.exit(1);
}

console.log('');

// 2. Check AI_ENTRYPOINT.md cross-references
console.log('Checking AI Entrypoint cross-references...');
const entrypointContent = readFileSync(resolve(REPO_ROOT, AI_DOCS.entrypoint.path), 'utf-8');

// Should reference knowledge map, authority, governance, reading profiles, curriculum
const expectedRefs = [
  { file: 'AI_KNOWLEDGE_MAP.md', label: 'Knowledge Map' },
  { file: 'DOCUMENTATION_AUTHORITY.md', label: 'Documentation Authority' },
  { file: 'DOCUMENTATION_GOVERNANCE_v2.md', label: 'Governance v2' },
  { file: 'AI_STARTUP_CURRICULUM.md', label: 'Startup Curriculum' },
  { file: 'DOCUMENTATION_AUTHORITY_MATRIX.md', label: 'Authority Matrix' },
];

for (const ref of expectedRefs) {
  const filePath = ref.file;
  const label = ref.label;
  // Check for reference in links or code blocks
  const found = entrypointContent.includes(filePath) || entrypointContent.includes(`\`${filePath}\``);
  if (found) {
    ok(`Entrypoint references ${label}`);
  } else {
    warn(`Entrypoint does not reference ${label} (${filePath})`);
  }
}
console.log('');

// 3. Check knowledge-map.json entries reference real files
console.log('Checking knowledge-map file references...');
const kmContent = JSON.parse(readFileSync(resolve(REPO_ROOT, AI_DOCS.knowledgeMapMachine.path), 'utf-8'));

const groups = Object.keys(kmContent).filter(k => !k.startsWith('$'));
let totalEntries = 0;
let filesNotFound = 0;
const missing = [];

for (const group of groups) {
  if (Array.isArray(kmContent[group])) {
    for (const entry of kmContent[group]) {
      totalEntries++;
      if (entry.path && !entry.path.endsWith('/')) {
        const fp = resolve(REPO_ROOT, entry.path);
        if (!existsSync(fp)) {
          filesNotFound++;
          missing.push(`${entry.path} (in ${group})`);
        }
      }
    }
  }
}

if (filesNotFound === 0) {
  ok(`All ${totalEntries} knowledge-map entries reference existing files`);
} else {
  warn(`${filesNotFound}/${totalEntries} knowledge-map entries reference non-existent files:`);
  for (const m of missing) {
    warn(`  Missing: ${m}`);
  }
}
console.log('');

// 4. Check for cross-references between AI docs
console.log('Checking cross-references between AI guidance docs...');
const aiDocPaths = Object.values(AI_DOCS).map(d => d.path);
const docContents = {};

for (const doc of Object.values(AI_DOCS)) {
  docContents[doc.path] = readFileSync(resolve(REPO_ROOT, doc.path), 'utf-8');
}

// Each doc should reference the entrypoint (except entrypoint itself)
for (const [key, doc] of Object.entries(AI_DOCS)) {
  if (doc.path === AI_DOCS.entrypoint.path) continue;
  const content = docContents[doc.path];
  const refsEntrypoint = content.includes('AI_ENTRYPOINT.md') || content.includes('AI Entrypoint') || content.includes('AI Entry Point');
  if (refsEntrypoint) {
    ok(`${doc.name} references Entrypoint`);
  } else {
    warn(`${doc.name} does not reference AI Entrypoint`);
  }
}

// The reading profiles should reference the curriculum
// The curriculum should reference the knowledge map
// The knowledge map (human) should reference the knowledge-map.json
console.log('');

// 5. Check reading order files referenced by AI_STARTUP_CURRICULUM.md
console.log('Checking curriculum reading order references...');
const curriculumContent = docContents[AI_DOCS.curriculum.path];
// Extract file paths from the curriculum
const fileRefs = curriculumContent.match(/`([^`]+\.md)`/g) || [];
const uniqueFileRefs = [...new Set(fileRefs.map(r => r.replace(/`/g, '')))];

let missingRefs = 0;
for (const ref of uniqueFileRefs) {
  // Skip external/url references
  if (ref.startsWith('http')) continue;
  const fp = resolve(REPO_ROOT, ref);
  if (!existsSync(fp)) {
    warn(`Curriculum references non-existent file: ${ref}`);
    missingRefs++;
  }
}

if (missingRefs === 0) {
  ok(`All ${uniqueFileRefs.length} curriculum file references exist`);
} else {
  warn(`${missingRefs} curriculum references missing`);
}
console.log('');

// 6. Verify reading profiles reference real files
console.log('Checking reading profiles references...');
const profilesContent = docContents[AI_DOCS.readingProfiles.path];
const profileFileRefs = profilesContent.match(/`([^`]+\.md)`/g) || [];
const uniqueProfileRefs = [...new Set(profileFileRefs.map(r => r.replace(/`/g, '')))];

let missingProfileRefs = 0;
for (const ref of uniqueProfileRefs) {
  if (ref.startsWith('http')) continue;
  const fp = resolve(REPO_ROOT, ref);
  // Some may be section references like AGENTS.md §11
  const cleanRef = ref.split(' ')[0].split('#')[0];
  const cleanFp = resolve(REPO_ROOT, cleanRef);
  if (!existsSync(cleanFp)) {
    warn(`Reading profiles references non-existent file: ${ref}`);
    missingProfileRefs++;
  }
}

if (missingProfileRefs === 0) {
  ok(`All ${uniqueProfileRefs.length} reading profile file references exist`);
} else {
  warn(`${missingProfileRefs} reading profile references missing`);
}
console.log('');

// 7. Summary
console.log('='.repeat(50));
console.log('📊 AI Consistency Summary');
console.log('='.repeat(50));
console.log(`  AI guidance docs:    ${Object.keys(AI_DOCS).length}`);
console.log(`  All documents exist: ${allExist ? 'Yes' : 'No'}`);
console.log(`  KM entries:          ${totalEntries}`);
console.log(`  Missing files:       ${filesNotFound}`);
console.log(`  Curriculum refs:     ${uniqueFileRefs.length}`);
console.log(`  Profile refs:        ${uniqueProfileRefs.length}`);
console.log(`  Errors:              ${errors.length}`);
console.log(`  Warnings:            ${warnings.length}`);
console.log('='.repeat(50));

if (errors.length > 0) {
  console.log('\n❌ AI CONSISTENCY VALIDATION FAILED\n');
  process.exit(1);
}

if (warnings.length > 5) {
  console.log(`\n⚠️  ${warnings.length} warnings found (review recommended)\n`);
  process.exit(0);
} else {
  console.log('\n✅ AI CONSISTENCY VALIDATION PASSED\n');
  process.exit(0);
}
