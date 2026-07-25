import { type Product, type Claim, type Evidence } from '../../types/entities';

export function buildExecutiveSummary(
  product: Product,
  claims: Claim[],
  evidence: Evidence[],
): string {
  const lines: string[] = [];
  lines.push('## Executive Summary');
  lines.push('');

  const claimCount = claims.length;
  const evidenceCount = evidence.length;
  const claimTypes = new Set(claims.map((c) => c.type));
  const tiersPresent = new Set(evidence.map((e) => e.tier));

  const sentence1 =
    claimCount > 0
      ? `${product.id} (${product.name}) has ${claimCount} claim(s) across ${claimTypes.size} type(s), supported by ${evidenceCount} evidence record(s) across ${tiersPresent.size} tier(s).`
      : `${product.id} (${product.name}) has no registered claims.`;

  const verifiedClaims = claims.filter((c) => c.confidence === 'High').length;
  const sentence2 =
    claimCount > 0
      ? `${verifiedClaims} of ${claimCount} claim(s) carry High confidence, with an average L-Level of ${product.currentLLevel}.`
      : `The current L-Level is ${product.currentLLevel} (${product.lLevelStatus}).`;

  const evidenceScore =
    evidence.length > 0
      ? (evidence.reduce((s, e) => s + e.score, 0) / evidence.length).toFixed(2)
      : '0.00';
  const sentence3 = `Mean evidence score is ${evidenceScore} across all referenced evidence. Governance posture is consistent with ${product.strategicIntent} intent.`;

  lines.push(sentence1);
  lines.push(sentence2);
  lines.push(sentence3);

  return lines.join('\n');
}
