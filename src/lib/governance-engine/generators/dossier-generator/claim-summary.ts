import { type Claim } from '../../types/entities';

export function buildClaimSummary(claims: Claim[]): string {
  const lines: string[] = [];
  lines.push('## Claim Summary');
  lines.push('');
  lines.push('| CLM-ID | Type | Dimension | Confidence | Status |');
  lines.push('|--------|------|-----------|------------|--------|');

  if (claims.length === 0) {
    lines.push('| — | — | — | — | — |');
  } else {
    for (const c of claims) {
      lines.push(`| ${c.id} | ${c.type} | ${c.dimension} | ${c.confidence} | ${formatClaimStatus(c)} |`);
    }
  }

  return lines.join('\n');
}

export function formatClaimStatus(claim: Claim): string {
  if (claim.confidence === 'High' && claim.completeness >= 80) {
    return 'Verified';
  }
  if (claim.confidence === 'Low') {
    return 'Requires Review';
  }
  return 'Partial';
}
