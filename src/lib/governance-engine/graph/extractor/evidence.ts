import { ID_PATTERNS, assertId } from '../../types/identifiers';
import type { ExtractedEvidence } from '../types/extracted-registries';
import { parseTable } from './common';

export function extractEvidence(markdown: string): ExtractedEvidence[] {
  const allRows = parseTable(markdown, '| EV-ID', 4);
  const evidence: ExtractedEvidence[] = [];

  for (const row of allRows) {
    const rawId = row[0]?.trim();
    if (!rawId || !rawId.startsWith('EV-')) continue;
    assertId(rawId, ID_PATTERNS.EVIDENCE, 'EV-ID');

    const tierRaw = row[1]?.trim() || 'T1';
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
      sourceRef: '',
    });
  }

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
