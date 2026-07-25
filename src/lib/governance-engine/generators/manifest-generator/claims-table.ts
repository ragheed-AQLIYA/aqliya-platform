import { type Claim } from '../../types/entities';

export function buildClaimsTable(claims: Claim[]): string {
  const lines: string[] = [];
  lines.push('## Aggregated Claims');
  lines.push('');
  lines.push('| CLM-ID | Type | Dimension | Confidence | Evidence Refs |');
  lines.push('|--------|------|-----------|------------|---------------|');

  if (claims.length === 0) {
    lines.push('| — | — | — | — | — |');
  } else {
    for (const c of claims) {
      const refs = c.evidenceRefs.length > 0 ? c.evidenceRefs.join(', ') : '—';
      lines.push(`| ${c.id} | ${c.type} | ${c.dimension} | ${c.confidence} | ${refs} |`);
    }
  }

  return lines.join('\n');
}
