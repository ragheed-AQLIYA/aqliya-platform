import { ID_PATTERNS, assertId } from '../../types/identifiers';
import type { ExtractedDecision } from '../types/extracted-registries';
import { parseTable } from './common';

export function extractDecisions(markdown: string): ExtractedDecision[] {
  const allRows = parseTable(markdown, '| DEC-ID', 7);
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
