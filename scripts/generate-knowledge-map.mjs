#!/usr/bin/env node

/**
 * AQLIYA Knowledge Map Generator
 *
 * Reads official documentation files from docs/ and generates a deterministic
 * knowledge-map.json from file metadata and directory structure.
 *
 * For each document, we extract:
 * - title (from H1)
 * - path
 * - category (from directory structure)
 * - status (from content markers)
 * - priority (from category)
 * - owner (from content markers)
 * - sourceOfTruth (boolean)
 *
 * Usage:
 *   node scripts/generate-knowledge-map.mjs
 *
 * Output: docs/ai/knowledge-map.json (deterministic, sorted)
 */

import { readFileSync, existsSync, readdirSync, writeFileSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const DOCS_DIR = resolve(REPO_ROOT, 'docs');
const OUTPUT = resolve(REPO_ROOT, 'docs/ai/knowledge-map.json');

console.log('\n🔍 AQLIYA Knowledge Map Generator\n');

// Category definitions — maps directory structure to knowledge-map categories
const CATEGORY_MAP = {
  'docs/official': {
    group: 'critical',
    priority: 'P0-critical',
    sourceOfTruth: true,
  },
  'docs/source-of-truth': {
    group: 'high_priority',
    priority: 'P1-essential',
    sourceOfTruth: true,
  },
  'docs/ai': {
    group: 'architecture',
    priority: 'P0-critical',
    sourceOfTruth: false,
  },
  'docs/architecture': {
    group: 'architecture',
    priority: 'P1-essential',
    sourceOfTruth: true,
  },
  'docs/security': {
    group: 'security',
    priority: 'P1-essential',
    sourceOfTruth: true,
  },
  'docs/deployment': {
    group: 'deployment',
    priority: 'P2-supplemental',
    sourceOfTruth: false,
  },
  'docs/governance': {
    group: 'governance',
    priority: 'P1-essential',
    sourceOfTruth: true,
  },
  'docs/operations': {
    group: 'operations',
    priority: 'P2-supplemental',
    sourceOfTruth: false,
  },
  'docs/roadmaps': {
    group: 'roadmaps',
    priority: 'P1-essential',
    sourceOfTruth: true,
  },
  'docs': {
    group: 'architecture',
    priority: 'P0-critical',
    sourceOfTruth: true,
  },

  // Supplementary directories — lower priority or archive
  'docs/archive': {
    group: 'archive',
    priority: 'P4-archive',
    sourceOfTruth: false,
  },
  'docs/theoretical-reference': {
    group: 'archive',
    priority: 'P4-archive',
    sourceOfTruth: false,
  },
  'docs/reports': {
    group: 'archive',
    priority: 'P4-archive',
    sourceOfTruth: false,
  },
  'docs/audits': {
    group: 'archive',
    priority: 'P4-archive',
    sourceOfTruth: false,
  },
  'docs/deliverables': {
    group: 'archive',
    priority: 'P4-archive',
    sourceOfTruth: false,
  },
  'docs/pilot': {
    group: 'archive',
    priority: 'P4-archive',
    sourceOfTruth: false,
  },
  'docs/runtime-prototypes': {
    group: 'archive',
    priority: 'P4-archive',
    sourceOfTruth: false,
  },
  'docs/review': {
    group: 'archive',
    priority: 'P4-archive',
    sourceOfTruth: false,
  },
  'docs/products': {
    group: 'product',
    priority: 'P3-low',
    sourceOfTruth: false,
  },
  'docs/releases': {
    group: 'roadmaps',
    priority: 'P3-low',
    sourceOfTruth: false,
  },
  'docs/commercial': {
    group: 'governance',
    priority: 'P2-supplemental',
    sourceOfTruth: true,
  },
  'docs/commercial-pack': {
    group: 'governance',
    priority: 'P3-low',
    sourceOfTruth: false,
  },
  'docs/runbooks': {
    group: 'operations',
    priority: 'P2-supplemental',
    sourceOfTruth: true,
  },
  'docs/systems': {
    group: 'product',
    priority: 'P2-supplemental',
    sourceOfTruth: true,
  },
  'docs/marketing': {
    group: 'operations',
    priority: 'P3-low',
    sourceOfTruth: false,
  },
};

// Root-level docs that go in critical
const ROOT_CRITICAL = {
  'AGENTS.md': {
    group: 'critical',
    priority: 'P0-critical',
    sourceOfTruth: true,
    owner: 'Platform',
  },
};

// Documents that are superseded/archived
const SUPERSEDED = {
  'docs/DOCUMENTATION_GOVERNANCE.md': { supersededBy: 'docs/DOCUMENTATION_GOVERNANCE_v2.md' },
};

// Owner override map
const OWNER_MAP = {
  'docs/official/aqliya-vision-v1.1.md': 'Product',
  'docs/official/aqliya-implementation-rules-v1.1.md': 'Platform',
  'docs/official/aqliya-product-taxonomy-v1.1.md': 'Product',
  'docs/official/aqliya-core-architecture-v1.1.md': 'Platform',
  'docs/official/aqliya-skill-context-v1.1.md': 'AI/ML',
  'docs/official/aqliya-glossary-v1.1.md': 'Product',
  'docs/official/aqliya-roadmap-v1.1.md': 'Product',
  'docs/official/aqliya-agent-context-v1.1.md': 'Platform',
  'docs/source-of-truth/AQLIYA_ARCHITECTURE.md': 'Platform',
  'docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md': 'Platform',
  'docs/source-of-truth/PRODUCT_STATUS_MATRIX.md': 'Product',
  'docs/source-of-truth/ROUTE_STRATEGY.md': 'Platform',
  'docs/DOCUMENTATION_AUTHORITY.md': 'Platform',
  'docs/DOCUMENTATION_GOVERNANCE_v2.md': 'Platform',
  'docs/AI_ENTRYPOINT.md': 'AI/ML',
  'docs/AI_KNOWLEDGE_MAP.md': 'AI/ML',
  'docs/AI_STARTUP_CURRICULUM.md': 'AI/ML',
  'docs/AI_READING_PROFILES.md': 'AI/ML',
};

// Collect all markdown files under docs/ and root
function collectMdFiles(dir, relativeTo = REPO_ROOT) {
  const results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = resolve(dir, entry.name);
      const relPath = fullPath.replace(relativeTo + '\\', '').replace(/\\/g, '/');
      if (entry.name === 'node_modules') continue;
      if (entry.name.startsWith('.') && entry.isDirectory()) continue;
      if (entry.isDirectory()) {
        results.push(...collectMdFiles(fullPath, relativeTo));
      } else if (entry.name.endsWith('.md') || /\.(mdx|json|yaml|yml)$/.test(entry.name)) {
        results.push({ path: fullPath, relPath });
      }
    }
  } catch { /* skip unreadable */ }
  return results;
}

// Extract metadata from file
function extractMetadata(filePath, relPath) {
  try {
    const content = readFileSync(filePath, 'utf-8');

    // Title from H1
    const h1Match = content.match(/^#\s+(.+)$/m);
    const title = h1Match ? h1Match[1].trim() : relPath.split('/').pop().replace(/\.[^.]+$/, '').replace(/_/g, ' ');

    // Description from first paragraph after H1
    const descMatch = content.match(/^#\s+.+?\n\n([^#\n].+?)(?:\n\n|$)/s);
    const description = descMatch ? descMatch[1].trim().substring(0, 200) : '';

    // Owner from content
    let owner = null;
    const ownerMatch = content.match(/\*\*Owner\*\*:\s*(.+)/i);
    if (ownerMatch) owner = ownerMatch[1].trim();
    if (!owner && OWNER_MAP[relPath]) owner = OWNER_MAP[relPath];

    // Status
    let status = 'active';
    const statusMatch = content.match(/\*\*Status\*\*:\s*(.+)/i);
    if (statusMatch) {
      const s = statusMatch[1].trim().toLowerCase();
      if (s.includes('draft') || s.includes('wip')) status = 'draft';
      else if (s.includes('archived') || s.includes('superseded')) status = 'archived';
      else if (s.includes('deprecated')) status = 'deprecated';
    }

    // Check for superseded marker
    if (content.includes('This document has been superseded') || content.includes('SUPERSEDED')) {
      status = 'superseded';
    }
    if (content.toLowerCase().includes('archived:') || content.toLowerCase().includes('this document is archived')) {
      status = 'archived';
    }

    return { title, description, owner, status };
  } catch {
    return { title: relPath.split('/').pop().replace(/\.[^.]+$/, '').replace(/_/g, ' '), description: '', owner: null, status: 'unknown' };
  }
}

// Get default readWhen text based on group and priority
function getReadWhenDefault(group, priority) {
  if (group === 'archive') return 'Historical reference only';
  if (group === 'critical' || priority === 'P0-critical') return 'Must read every session';
  if (priority === 'P1-high' || priority === 'P1-essential') return 'Read before relevant work in this area';
  if (group === 'security') return 'Read before any security-sensitive work';
  if (group === 'deployment') return 'Read before any deployment or infrastructure work';
  if (group === 'governance') return 'Read before any governance or policy decisions';
  if (group === 'operations') return 'Read for operational or monitoring context';
  if (group === 'product') return 'Read for product-specific context';
  if (group === 'roadmaps') return 'Read for roadmap and strategic context';
  if (group === 'architecture') return 'Read for architecture reference';
  if (priority === 'P2-supplemental' || priority === 'P2-medium') return 'Read when working on related features';
  if (priority === 'P3-low') return 'Read when deep context is needed';
  return 'Read when relevant';
}

// Determine category for a path
function getCategory(relPath) {
  // Check root-level docs
  if (ROOT_CRITICAL[relPath]) return ROOT_CRITICAL[relPath];

  // Check docs/ path prefixes — try longest match first
  const parts = relPath.split('/');
  if (parts.length >= 2) {
    // Try direct matches and sorted keys for consistent longest-prefix
    const prefix = 'docs/' + parts[1];
    if (CATEGORY_MAP[prefix]) return JSON.parse(JSON.stringify(CATEGORY_MAP[prefix]));
  }

  // Check for docs/ root-level documents by trying prefix = docs/
  if (relPath.startsWith('docs/') && parts.length === 2) {
    // Root-level doc in docs/ (e.g. docs/AI_ENTRYPOINT.md)
    return { group: 'architecture', priority: 'P0-critical', sourceOfTruth: true };
  }

  // Fallback: group by docs/ subdirectory using sorted list of known categories
  const knownGroups = [
    'official', 'source-of-truth', 'ai', 'architecture', 'security',
    'deployment', 'governance', 'operations', 'roadmaps',
    'archive', 'theoretical-reference', 'reports', 'audits',
    'deliverables', 'pilot', 'runtime-prototypes', 'review',
    'products', 'releases', 'commercial', 'commercial-pack',
    'runbooks', 'systems', 'marketing',
  ];

  if (parts.length >= 2) {
    const subdir = parts[1];
    if (knownGroups.includes(subdir)) {
      // Check if there's a category map entry
      const key = 'docs/' + subdir;
      if (CATEGORY_MAP[key]) return JSON.parse(JSON.stringify(CATEGORY_MAP[key]));
      return { group: subdir, priority: 'P2-supplemental', sourceOfTruth: false };
    }
  }

  // Unknown subdirectory — archive it
  return { group: 'archive', priority: 'P4-archive', sourceOfTruth: false };
}

// Collect all documents
const allFiles = collectMdFiles(DOCS_DIR);

// Add root files
for (const file of ['AGENTS.md']) {
  const fullPath = resolve(REPO_ROOT, file);
  if (existsSync(fullPath)) {
    allFiles.push({ path: fullPath, relPath: file });
  }
}

console.log(`Found ${allFiles.length} markdown files`);

// Build knowledge-map
const map = {
  critical: [],
  high_priority: [],
  architecture: [],
  product: [],
  security: [],
  deployment: [],
  governance: [],
  operations: [],
  roadmaps: [],
  archive: [],
  deprecated: [],
  superseded: [],
};

for (const { path, relPath } of allFiles) {
  // Skip validation output and excluded patterns
  if (relPath.startsWith('docs/validation/')) continue;

  const meta = extractMetadata(path, relPath);
  const category = getCategory(relPath);

  // Handle superseded documents
  if (SUPERSEDED[relPath]) {
    map.superseded.push({
      path: relPath,
      title: meta.title,
      priority: 'P4-archive',
      status: 'superseded',
      owner: meta.owner || 'Documentation Team',
      supersededBy: SUPERSEDED[relPath].supersededBy,
    });
    continue;
  }

  // Handle deprecated
  if (meta.status === 'deprecated') {
    map.deprecated.push({
      path: relPath,
      title: meta.title,
      priority: 'P4-archive',
      status: 'deprecated',
      owner: meta.owner || 'Documentation Team',
    });
    continue;
  }

  // Handle archived
  if (meta.status === 'archived') {
    map.archive.push({
      path: relPath,
      title: meta.title,
      priority: category.group === 'archive' ? 'P4-archive' : 'P999',
      status: 'archived',
      owner: meta.owner || 'Documentation Team',
    });
    continue;
  }

  // Handle superseded (in content)
  if (meta.status === 'superseded') {
    map.superseded.push({
      path: relPath,
      title: meta.title,
      priority: 'P4-archive',
      status: 'superseded',
      owner: meta.owner || 'Documentation Team',
    });
    continue;
  }

  // Build entry
  const priority = category.priority || (category.group === 'archive' ? 'P4-archive' : 'P2-supplemental');
  const readWhenDefault = getReadWhenDefault(category.group, priority);
  const entry = {
    path: relPath,
    title: meta.title,
    priority,
    status: meta.status || 'active',
    sourceOfTruth: category.sourceOfTruth || false,
    owner: meta.owner || (category.group === 'critical' ? 'Platform' : category.group === 'archive' ? 'Documentation Team' : 'Unassigned'),
    readWhen: readWhenDefault,
  };

  if (meta.description) {
    entry.description = meta.description;
  }

  // Add to appropriate group
  const group = category.group || 'architecture';
  if (map[group]) {
    map[group].push(entry);
  } else {
    map.architecture.push(entry);
  }
}

// Sort each group deterministically
for (const key of Object.keys(map)) {
  map[key].sort((a, b) => {
    // Sort by priority then path
    const pA = parseInt(a.priority?.replace('P', '') || '999');
    const pB = parseInt(b.priority?.replace('P', '') || '999');
    if (pA !== pB) return pA - pB;
    return (a.path || '').localeCompare(b.path || '');
  });
}

// Count
let total = 0;
for (const key of Object.keys(map)) {
  total += map[key].length;
}
console.log(`\nGenerated ${total} entries across ${Object.keys(map).length} groups:`);
for (const key of Object.keys(map)) {
  if (map[key].length > 0) {
    console.log(`  ${key}: ${map[key].length}`);
  }
}

// Write output
const output = {
  $schema: "AQLIYA Documentation Knowledge Map (auto-generated)",
  description: "Auto-generated machine-readable knowledge map for AI agents. Generated from filesystem scan. Every absolute path is relative to repository root.",
  lastUpdated: new Date().toISOString().split('T')[0],
  entrypoint: "docs/AI_ENTRYPOINT.md",
  ...map,
};

writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + '\n', 'utf-8');
console.log(`\n✅ Written to ${OUTPUT.replace(REPO_ROOT, '').replace(/\\/g, '/')}\n`);
