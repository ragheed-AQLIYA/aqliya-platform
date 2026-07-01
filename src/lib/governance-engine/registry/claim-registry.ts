import type { Claim, ClaimType, ClaimStatus, Confidence, Dimension } from '../types/entities';
import { ID_PATTERNS } from '../types/identifiers';
import { RegistryError } from '../types/errors';
import { parseMarkdownTable } from '../shared/parser';

const VALID_DIMENSIONS: Dimension[] = [
  'Implementation Reality',
  'Product Maturity',
  'Commercial Claim',
  'Strategic Intent',
];

const VALID_CLAIM_TYPES: ClaimType[] = [
  'CR-ST',
  'CR-TC',
  'CR-OP',
  'CR-MK',
  'CR-MT',
  'CR-AR',
];

const VALID_CONFIDENCE: Confidence[] = ['High', 'Medium', 'Low'];

const VALID_STATUSES: ClaimStatus[] = [
  'Verified',
  'Contradicted',
  'Unverified',
  'Requires Decision',
  'Stale',
  'Superseded',
];

function parseCompleteness(raw: string): number {
  const cleaned = raw.replace(/\*\*/g, '').replace('%', '').trim();
  const val = parseInt(cleaned, 10);
  return Number.isNaN(val) ? 0 : Math.min(100, Math.max(0, val));
}

function parseArrayField(raw: string): string[] {
  if (!raw || raw.trim() === '—' || raw.trim() === '') {
    return [];
  }
  return raw
    .replace(/^\[|\]$/g, '')
    .split(/[,;]\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function parseDimension(raw: string): Dimension {
  const trimmed = raw.trim().toLowerCase();
  if (trimmed.includes('implementation') || trimmed === 'impl. reality') {
    return 'Implementation Reality';
  }
  if (trimmed.includes('product maturity')) {
    return 'Product Maturity';
  }
  if (trimmed.includes('commercial claim') || trimmed.includes('commercial')) {
    return 'Commercial Claim';
  }
  if (trimmed.includes('strategic intent') || trimmed.includes('strategic')) {
    return 'Strategic Intent';
  }
  return 'Implementation Reality';
}

function parseClaimType(raw: string): ClaimType {
  const trimmed = raw.trim().toUpperCase();
  for (const t of VALID_CLAIM_TYPES) {
    if (t === trimmed) {
      return t;
    }
  }
  if (trimmed === 'IMPLEMENTATION' || trimmed === 'CODE INSPECTION') {
    return 'CR-TC';
  }
  if (trimmed === 'PRODUCT' || trimmed === 'OBSERVATION') {
    return 'CR-OP';
  }
  if (trimmed === 'STRATEGIC' || trimmed === 'GOVERNANCE DECISION') {
    return 'CR-ST';
  }
  if (trimmed === 'COMMERCIAL' || trimmed === 'DOCUMENT') {
    return 'CR-MK';
  }
  if (trimmed === 'ARCHITECTURE') {
    return 'CR-AR';
  }
  if (trimmed === 'CONSUMER' || trimmed === 'NATIVE' || trimmed === 'COMPOSITION' || trimmed === 'DERIVED') {
    return 'CR-TC';
  }
  return 'CR-TC';
}

function parseOrigin(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed && trimmed !== '—') {
    return trimmed;
  }
  return 'Document';
}

function parseConfidence(raw: string): Confidence {
  const trimmed = raw.trim();
  for (const c of VALID_CONFIDENCE) {
    if (c.toLowerCase() === trimmed.toLowerCase()) {
      return c;
    }
  }
  return 'Medium';
}

function tryParseClaimRow(row: string[]): Claim | null {
  const clmId = row[0]?.trim() ?? '';
  if (!clmId || !ID_PATTERNS.CLAIM.test(clmId)) {
    return null;
  }

  const cols = row.length;

  const get = (idx: number): string => (idx >= 0 && idx < row.length ? (row[idx] ?? '').trim() : '');

  if (cols === 7) {
    return {
      id: clmId,
      version: '1.0',
      hash: '',
      type: parseClaimType(get(1)),
      origin: 'Document',
      dimension: 'Product Maturity',
      capabilities: get(2) !== '—' ? parseArrayField(get(2)) : undefined,
      claimText: get(3),
      knowledgeArea: '',
      product: '',
      authorities: [],
      evidenceRefs: parseArrayField(get(4)),
      confidence: parseConfidence(get(5)),
      completeness: parseCompleteness(get(6)),
      created: new Date().toISOString(),
    };
  }

  if (cols === 5) {
    const dimension = parseDimension(get(1));
    return {
      id: clmId,
      version: '1.0',
      hash: '',
      type: 'CR-TC',
      origin: 'Document',
      dimension,
      claimText: get(2),
      knowledgeArea: '',
      product: '',
      authorities: [],
      evidenceRefs: parseArrayField(get(3)),
      confidence: parseConfidence(get(4)),
      completeness: 0,
      created: new Date().toISOString(),
    };
  }

  if (cols === 6) {
    return {
      id: clmId,
      version: '1.0',
      hash: '',
      type: 'CR-TC',
      origin: 'Document',
      dimension: 'Product Maturity',
      claimText: get(1),
      knowledgeArea: '',
      product: '',
      authorities: [],
      evidenceRefs: parseArrayField(get(2)),
      confidence: parseConfidence(get(3)),
      completeness: 0,
      created: new Date().toISOString(),
    };
  }

  if (cols >= 11 && cols <= 16) {
    const claim: Claim = {
      id: clmId,
      version: get(1) || '1.0',
      hash: '',
      type: parseClaimType(get(2)),
      origin: parseOrigin(get(3)),
      dimension: parseDimension(get(4)),
      claimText: get(6),
      knowledgeArea: cols >= 8 ? get(7) : '',
      product: cols >= 9 ? get(8) : '',
      authorities: cols >= 10 ? parseArrayField(get(9)) : [],
      evidenceRefs: parseArrayField(get(5)),
      confidence: parseConfidence(cols >= 12 ? get(11) : 'Medium'),
      completeness: parseCompleteness(cols >= 13 ? get(12) : '0'),
      created: new Date().toISOString(),
    };

    const capRef = get(5);
    if (capRef && capRef !== '—' && !capRef.startsWith('EV-') && !capRef.startsWith('CLM-')) {
      claim.capabilities = parseArrayField(capRef);
      claim.evidenceRefs = parseArrayField(get(6));
      claim.claimText = get(7);
      if (cols >= 13) {
        claim.confidence = parseConfidence(get(12));
        claim.completeness = parseCompleteness(get(13));
      }
    }

    const col13 = get(13);
    if (col13 && cols >= 14 && cols <= 16) {
      if (col13.includes('DEC-')) {
        claim.currentDecision = col13;
      }
    }

    const col14 = get(14);
    if (col14 && cols >= 15) {
      if (/^HC-/.test(col14)) {
        claim.historicalRefs = parseArrayField(col14);
      } else {
        claim.decisionImpact = col14;
      }
    }

    return claim;
  }

  return null;
}

function isHeaderRow(row: string[]): boolean {
  return row.some((cell) => /^(CLM-ID|EV-ID|SRC-ID|---)$/i.test(cell.trim()));
}

export function parseClaimRegistry(markdown: string): Claim[] {
  if (!markdown || markdown.trim().length === 0) {
    throw new RegistryError('Empty markdown content for CLAIM_REGISTRY.md', 'CLAIM_REGISTRY.md');
  }

  const claims: Claim[] = [];
  const seenIds = new Set<string>();

  const tableHeads = findClaimTableHeaders(markdown);
  for (const head of tableHeads) {
    const table = parseMarkdownTable(markdown, head);
    const dataRows = table.filter((row) => !isHeaderRow(row));

    for (const row of dataRows) {
      const claim = tryParseClaimRow(row);
      if (claim === null) {
        continue;
      }

      if (seenIds.has(claim.id)) {
        throw new RegistryError(`Duplicate CLM-ID: ${claim.id}`, 'CLAIM_REGISTRY.md');
      }
      seenIds.add(claim.id);

      claims.push(claim);
    }
  }

  return claims;
}

function findClaimTableHeaders(markdown: string): string[] {
  const headers: string[] = [];
  const seen = new Set<string>();
  const lineRegex = /^\|?\s*CLM-ID\s*\|/m;

  let match: RegExpExecArray | null;
  const globalRegex = new RegExp(lineRegex.source, 'gm');
  while ((match = globalRegex.exec(markdown)) !== null) {
    const lineStart = match[0];
    const normalized = lineStart.trim();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      headers.push(normalized);
    }
  }

  return headers.length > 0 ? headers : ['| CLM-ID'];
}

export function parseEvidenceFromClaimRegistry(markdown: string): Array<{
  id: string;
  tier: string;
  description: string;
  sourceRef: string;
  score: 0 | 1 | 2 | 3;
  supportsClaims: string[];
}> {
  if (!markdown || markdown.trim().length === 0) {
    return [];
  }

  const evidence: Array<{
    id: string;
    tier: string;
    description: string;
    sourceRef: string;
    score: 0 | 1 | 2 | 3;
    supportsClaims: string[];
  }> = [];

  const seenIds = new Set<string>();

  const evidenceHeaders = findTableStarts(markdown, 'EV-ID');
  for (const head of evidenceHeaders) {
    const table = parseMarkdownTable(markdown, head);
    const dataRows = table.filter((row) => /^EV-\d{4}$/.test(row[0]?.trim()));

    for (const row of dataRows) {
      const evId = row[0].trim();
      if (seenIds.has(evId)) {
        continue;
      }
      seenIds.add(evId);

      const score = Math.min(3, Math.max(0, parseInt(row[4]?.trim() ?? '0', 10) || 0)) as 0 | 1 | 2 | 3;

      evidence.push({
        id: evId,
        tier: row[1]?.trim() ?? '',
        description: row[2]?.trim() ?? '',
        sourceRef: row[3]?.trim() ?? '',
        score,
        supportsClaims: row[5] ? parseArrayField(row[5]) : [],
      });
    }
  }

  return evidence;
}

export function parseSourcesFromClaimRegistry(markdown: string): Array<{
  id: string;
  type: string;
  location: string;
  producesEvidence: string[];
}> {
  if (!markdown || markdown.trim().length === 0) {
    return [];
  }

  const sources: Array<{
    id: string;
    type: string;
    location: string;
    producesEvidence: string[];
  }> = [];

  const seenIds = new Set<string>();

  const sourceHeaders = findTableStarts(markdown, 'SRC-ID');
  for (const head of sourceHeaders) {
    const table = parseMarkdownTable(markdown, head);
    const dataRows = table.filter((row) => /^SRC-[A-Z]+-\d{4}$/.test(row[0]?.trim()));

    for (const row of dataRows) {
      const srcId = row[0].trim();
      if (seenIds.has(srcId)) {
        continue;
      }
      seenIds.add(srcId);

      sources.push({
        id: srcId,
        type: (row[1]?.trim() ?? '').toUpperCase(),
        location: row[2]?.trim() ?? '',
        producesEvidence: row[3] ? parseArrayField(row[3]) : [],
      });
    }
  }

  return sources;
}

function findTableStarts(markdown: string, colName: string): string[] {
  const starts: string[] = [];
  const lines = markdown.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith(`| ${colName} `) || trimmed.startsWith(`|${colName}`)) {
      starts.push(trimmed);
    }
  }
  return starts.length > 0 ? [...new Set(starts)] : [`| ${colName} |`];
}
