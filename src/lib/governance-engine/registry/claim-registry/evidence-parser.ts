import { parseMarkdownTable } from '../../shared/parser';
import { parseArrayField } from './common';
import { findTableStarts } from './table-utils';

export interface RawEvidence {
  id: string;
  tier: string;
  description: string;
  sourceRef: string;
  score: 0 | 1 | 2 | 3;
  supportsClaims: string[];
}

export function parseEvidenceFromClaimRegistry(markdown: string): RawEvidence[] {
  if (!markdown || markdown.trim().length === 0) {
    return [];
  }

  const evidence: RawEvidence[] = [];
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
