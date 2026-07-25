import type { Claim } from '../../types/entities';
import { ID_PATTERNS } from '../../types/identifiers';
import { RegistryError } from '../../types/errors';
import { parseMarkdownTable } from '../../shared/parser';
import { parseCompleteness, parseArrayField, parseDimension, parseClaimType, parseOrigin, parseConfidence } from './common';
import { isHeaderRow, findClaimTableHeaders } from './table-utils';

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
