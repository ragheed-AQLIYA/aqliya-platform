// ENG-001A: Registry Extractor
//
// Reads frozen Markdown governance registries and produces a structured JSON
// representation. All outputs are derived artifacts — never written back to
// Markdown. The JSON is a read-only projection, NOT a new source of truth.
//
// Architecture Baseline: M2 v1.2 (Frozen)
// SPEC-GOV-11 §4 — Deliverable 1

import { ID_PATTERNS, assertId } from '../types/identifiers';
import { RegistryError } from '../types/errors';
import { parseMarkdownTable } from '../shared/parser';
import type {
  ExtractedRegistries,
  ExtractedClaim,
  ExtractedProduct,
  ExtractedDecision,
  ExtractedEvidence,
  ExtractedAuthority,
} from './types/extracted-registries';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GOVERNANCE_DIR = 'docs/governance';
const EVIDENCE_CATALOG_DIR = 'docs/governance/evidence-catalog';

const SOURCE_FILES = {
  claims: 'CLAIM_REGISTRY.md',
  products: 'product-registry.md',
  decisions: 'decision-registry.md',
  evidence: 'evidence-index.md',
  authorities: 'AUTHORITY_MATRIX.md',
} as const;

const OUTPUT_DIR = 'build/governance';
const OUTPUT_FILE = 'extracted-registries.json';

// ---------------------------------------------------------------------------
// Helper: read file or throw
// ---------------------------------------------------------------------------

async function readMarkdown(projectRoot: string, filePath: string): Promise<string> {
  // Use simple slash-join (matching existing pattern in registry/loader.ts)
  const fullPath = projectRoot.endsWith('/') || projectRoot.endsWith('\\')
    ? `${projectRoot}${filePath}`
    : `${projectRoot}/${filePath}`;
  try {
    const fs = await import('node:fs/promises');
    return await fs.readFile(fullPath, { encoding: 'utf-8' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new RegistryError(`Failed to read ${fullPath}: ${message}`, fullPath);
  }
}

// ---------------------------------------------------------------------------
// Helper: parse a markdown table and skip the header/separator rows
// ---------------------------------------------------------------------------

function parseTable(
  markdown: string,
  tableHeaderStart: string,
  requiredColumns: number,
): string[][] {
  const raw = parseMarkdownTable(markdown, tableHeaderStart);

  // Remove header rows (first row + separator row if any)
  const dataRows = raw.filter((row) => {
    if (row.length === 0) return false;
    // Skip separator rows (e.g., |---|---|)
    if (row.some((cell) => /^-+\s*$/.test(cell))) return false;
    // Skip header row (e.g., | PROD-ID | Product Name | ...)
    if (row.some((cell) => /^(PROD-ID|CLM-ID|EV-ID|DEC-ID|AUTH ID)$/i.test(cell.trim()))) return false;
    return true;
  });

  // Filter out rows that are actually sub-headers (### sections)
  return dataRows.filter((row) => row.length >= requiredColumns);
}

// ---------------------------------------------------------------------------
// 1. Claim extraction  (from CLAIM_REGISTRY.md)
// ---------------------------------------------------------------------------

function extractClaims(markdown: string): ExtractedClaim[] {
  const rows = parseTable(markdown, '| CLM-ID', 12);

  const claims: ExtractedClaim[] = [];

  for (const row of rows) {
    const [
      id,
      version,
      type,
      origin,
      dimension,
      capRefRaw,
      claimText,
      ka,
      product,
      auth,
      evidenceRaw,
      confidence,
    ] = row;

    if (!id || !id.startsWith('CLM-')) continue;

    assertId(id, ID_PATTERNS.CLAIM, 'CLM-ID');

    const evidence = evidenceRaw
      ? evidenceRaw
          .replace(/^\[|\]$/g, '')
          .split(/[,;]\s*/)
          .map((s) => s.trim())
          .filter((s) => s.startsWith('EV-'))
      : [];

    claims.push({
      id,
      version: version?.trim() || '1.0',
      type: type?.trim() || '',
      origin: origin?.trim() || '',
      dimension: dimension?.trim() || '',
      capRef: capRefRaw && capRefRaw.trim() !== '—' ? capRefRaw.trim() : null,
      claimText: claimText?.trim() || '',
      ka: ka?.trim() || '',
      product: product?.trim() || '',
      auth: auth?.trim() || '',
      evidence,
      confidence: confidence?.trim() || 'Medium',
      completeness: '', // derived from metrics lines, not row data
    });
  }

  return claims;
}

// ---------------------------------------------------------------------------
// 2. Product extraction  (from product-registry.md)
// ---------------------------------------------------------------------------

function extractProducts(markdown: string): ExtractedProduct[] {
  const rows = parseTable(markdown, '| PROD-ID', 13);

  const products: ExtractedProduct[] = [];

  for (const row of rows) {
    const [
      id,
      nameRaw,
      entityType,
      ka,
      authority,
      lLevel,
      lLevelStatus,
      strategicIntent,
      parent,
      evidenceStatus,
      manifestStatus,
      dossierStatus,
      lastVerified,
    ] = row;

    if (!id || !id.startsWith('PROD-')) continue;

    assertId(id, ID_PATTERNS.PRODUCT, 'PROD-ID');

    // Parse bilingual name: "Name (الاسم بالعربية)"
    const nameMatch = nameRaw?.match(/^([^(]+)\s*\(([^)]+)\)$/);
    const name = nameMatch ? nameMatch[1].trim() : nameRaw?.trim() || id;
    const nameAr = nameMatch ? nameMatch[2].trim() : '';

    products.push({
      id,
      name,
      nameAr,
      entityType: entityType?.trim() || 'Product',
      ka: ka?.trim() || '',
      authority: authority?.trim() || '',
      currentLLevel: lLevel?.trim() || '',
      lLevelStatus: lLevelStatus?.trim() || 'Disputed',
      strategicIntent: strategicIntent?.trim() || 'Deferred',
      parent: parent && parent.trim() !== '—' ? parent.trim() : null,
      evidenceStatus: evidenceStatus?.trim() || 'Not Started',
      manifestStatus: manifestStatus?.trim() || 'Missing',
      dossierStatus: dossierStatus?.trim() || 'Missing',
      lastVerified: lastVerified?.trim() || '',
    });
  }

  return products;
}

// ---------------------------------------------------------------------------
// 3. Decision extraction  (from decision-registry.md)
// ---------------------------------------------------------------------------

function extractDecisions(markdown: string): ExtractedDecision[] {
  // The decision registry has multiple tables; find the one that contains DEC-IDs
  const allRows = parseTable(markdown, '| DEC-ID', 7);
  // Note: some rows may have 8+ columns with richer data; we take what we need

  const decisions: ExtractedDecision[] = [];

  for (const row of allRows) {
    const rawId = row[0]?.trim();
    if (!rawId || !rawId.startsWith('DEC-')) continue;

    assertId(rawId, ID_PATTERNS.DECISION, 'DEC-ID');

    decisions.push({
      id: rawId,
      type: row[1]?.trim() || '',
      title: row[2]?.trim() || '',
      authority: row[3]?.trim() || '',
      date: row[4]?.trim() || '',
      affected: row[5]
        ? row[5]
            .split(/[,;]\s*/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : [],
      status: row[6]?.trim() || 'Active',
    });
  }

  return decisions;
}

// ---------------------------------------------------------------------------
// 4. Evidence extraction  (from evidence-index.md)
// ---------------------------------------------------------------------------

function extractEvidence(markdown: string): ExtractedEvidence[] {
  // Main evidence table: | EV-ID | Tier | Description | Supports |
  const allRows = parseTable(markdown, '| EV-ID', 4);

  const evidence: ExtractedEvidence[] = [];

  for (const row of allRows) {
    const rawId = row[0]?.trim();
    if (!rawId || !rawId.startsWith('EV-')) continue;

    assertId(rawId, ID_PATTERNS.EVIDENCE, 'EV-ID');

    const tierRaw = row[1]?.trim() || 'T1';
    // Extract numeric score from tier (T1=1, T7=7) for sortable value
    const tierMatch = tierRaw.match(/T(\d)/);
    const score = tierMatch ? parseInt(tierMatch[1], 10) : 1;

    const supportsRaw = row[3]?.trim() || '';
    const supports = supportsRaw
      ? supportsRaw
          .split(/[,;]\s*/)
          .map((s) => s.trim())
          .filter((s) => s.startsWith('CLM-'))
      : [];

    evidence.push({
      id: rawId,
      tier: tierRaw,
      description: row[2]?.trim() || '',
      supports,
      score,
      sourceRef: '', // sourced from the "By Source" table if needed
    });
  }

  // Also parse the "By Source" table for sourceRef
  const sourceRows = parseTable(markdown, '| SRC-ID', 4);
  for (const row of sourceRows) {
    const srcId = row[0]?.trim();
    const producesRaw = row[3]?.trim() || '';
    if (!srcId || !producesRaw) continue;

    const producesEvIds = producesRaw
      .split(/[,;]\s*/)
      .map((s) => s.trim())
      .filter((s) => s.startsWith('EV-'));

    for (const evId of producesEvIds) {
      const ev = evidence.find((e) => e.id === evId);
      if (ev && !ev.sourceRef) {
        ev.sourceRef = srcId;
      }
    }
  }

  return evidence;
}

// ---------------------------------------------------------------------------
// 5. Authority extraction  (from AUTHORITY_MATRIX.md)
// ---------------------------------------------------------------------------

function extractAuthorities(markdown: string): ExtractedAuthority[] {
  // Main authority table: | AUTH ID | Area ID | Knowledge Area | Authority Document | Type | ...
  const rows = parseTable(markdown, '| AUTH ID', 8);

  const authorities: ExtractedAuthority[] = [];

  for (const row of rows) {
    const rawId = row[0]?.trim();
    if (!rawId || !rawId.startsWith('AUTH-')) continue;

    assertId(rawId, ID_PATTERNS.AUTHORITY, 'AUTH-ID');

    const areaId = row[1]?.trim() || '';

    const gapRaw = row[6]?.trim() || '';
    const gap = gapRaw && gapRaw !== '—' && gapRaw !== '-' ? gapRaw : null;

    const notesRaw = row[7]?.trim() || '';
    const notes = notesRaw && notesRaw !== '—' && notesRaw !== '-' ? notesRaw : null;

    const typeRaw = row[4]?.trim().toLowerCase() || 'reference';
    const type: 'Authority' | 'Reference' = typeRaw === 'authority' ? 'Authority' : 'Reference';

    const secondaryRefsRaw = row[5]?.trim() || '';
    const secondaryRefs = secondaryRefsRaw
      ? secondaryRefsRaw
          .split(/[,;]\s*/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : [];

    authorities.push({
      id: rawId,
      areaId,
      knowledgeArea: row[2]?.trim() || '',
      document: row[3]?.trim() || '',
      type,
      secondaryRefs,
      gap,
      notes,
    });
  }

  return authorities;
}

// ---------------------------------------------------------------------------
// Counting helpers
// ---------------------------------------------------------------------------

function countEntities(entities: unknown[]): number {
  return entities.length;
}

// ---------------------------------------------------------------------------
// Helper: join path segments with forward slash
// ---------------------------------------------------------------------------

function joinSegments(...parts: string[]): string {
  return parts.filter((p) => p.length > 0).join('/');
}

// ---------------------------------------------------------------------------
// Extractor
// ---------------------------------------------------------------------------

export class RegistryExtractor {
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  /**
   * Extract all 5 registries into a structured JSON representation.
   * Reads directly from Markdown files — never modifies them.
   */
  async extractAll(): Promise<ExtractedRegistries> {
    const [claimContent, productContent, decisionContent, evidenceContent, authorityContent] =
      await Promise.all([
        readMarkdown(this.projectRoot, joinSegments(GOVERNANCE_DIR, SOURCE_FILES.claims)),
        readMarkdown(this.projectRoot, joinSegments(EVIDENCE_CATALOG_DIR, SOURCE_FILES.products)),
        readMarkdown(this.projectRoot, joinSegments(EVIDENCE_CATALOG_DIR, SOURCE_FILES.decisions)),
        readMarkdown(this.projectRoot, joinSegments(EVIDENCE_CATALOG_DIR, SOURCE_FILES.evidence)),
        readMarkdown(this.projectRoot, joinSegments(GOVERNANCE_DIR, SOURCE_FILES.authorities)),
      ]);

    const claims = extractClaims(claimContent);
    const products = extractProducts(productContent);
    const decisions = extractDecisions(decisionContent);
    const evidence = extractEvidence(evidenceContent);
    const authorities = extractAuthorities(authorityContent);

    return {
      claims,
      products,
      decisions,
      evidence,
      authorities,
      metadata: {
        extractedAt: new Date().toISOString(),
        sourceFiles: {
          claims: joinSegments(GOVERNANCE_DIR, SOURCE_FILES.claims),
          products: joinSegments(EVIDENCE_CATALOG_DIR, SOURCE_FILES.products),
          decisions: joinSegments(EVIDENCE_CATALOG_DIR, SOURCE_FILES.decisions),
          evidence: joinSegments(EVIDENCE_CATALOG_DIR, SOURCE_FILES.evidence),
          authorities: joinSegments(GOVERNANCE_DIR, SOURCE_FILES.authorities),
        },
        entityCounts: {
          claims: countEntities(claims),
          products: countEntities(products),
          decisions: countEntities(decisions),
          evidence: countEntities(evidence),
          authorities: countEntities(authorities),
        },
      },
    };
  }

  /**
   * Write extracted registries to the build output directory.
   * The output is a derived artifact — always regenerated, never manually edited.
   */
  async writeOutput(registries: ExtractedRegistries): Promise<string> {
    const outDir = joinSegments(this.projectRoot, OUTPUT_DIR);
    const outFile = joinSegments(outDir, OUTPUT_FILE);

    const fs = await import('node:fs/promises');
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(outFile, JSON.stringify(registries, null, 2), { encoding: 'utf-8' });

    return outFile;
  }

  /**
   * Run extraction and write output in one step.
   */
  async run(): Promise<string> {
    const registries = await this.extractAll();
    return this.writeOutput(registries);
  }
}

// ---------------------------------------------------------------------------
// CLI entry point
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const projectRoot = process.cwd();
  const extractor = new RegistryExtractor(projectRoot);

  try {
    const outPath = await extractor.run();
    console.log(JSON.stringify({ status: 'ok', output: outPath }, null, 2));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(JSON.stringify({ status: 'error', message }, null, 2));
    process.exit(1);
  }
}

// Allow running directly: npx tsx src/lib/governance-engine/graph/extractor.ts
if (require.main === module) {
  main();
}
