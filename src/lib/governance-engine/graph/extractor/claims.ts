import { ID_PATTERNS, assertId } from '../../types/identifiers';
import type { ExtractedClaim } from '../types/extracted-registries';
import { parseTable } from './common';

export function extractClaims(markdown: string): ExtractedClaim[] {
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
      completeness: '',
    });
  }

  return claims;
}
