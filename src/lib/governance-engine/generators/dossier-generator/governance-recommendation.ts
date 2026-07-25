import { type Product, type Claim, type Evidence } from '../../types/entities';
import { LLEVEL_ORDER, levelAtIndex, countTiers } from './common';
import { isExpired } from '../../shared/date';

export function buildGovernanceRecommendation(
  product: Product,
  claims: Claim[],
  evidence: Evidence[],
): string {
  const lines: string[] = [];
  lines.push('## Governance Recommendation');
  lines.push('');

  const currentLevelIndex = LLEVEL_ORDER.indexOf(product.currentLLevel as unknown as never);
  const intent = product.strategicIntent;

  if (intent === 'Frozen') {
    lines.push('**Status:** Product is frozen. Maintain current evidence base. No new L-level decisions required.');
    lines.push('');
    lines.push('**Action:** Run evidence freshness validation regularly. Archive superseded evidence.');
    return lines.join('\n');
  }

  if (intent === 'Deferred') {
    lines.push('**Status:** Product development is deferred. Preserve existing evidence. No active promotion required.');
    lines.push('');
    lines.push('**Action:** Review deferred products quarterly. Refresh expiring evidence to prevent governance gaps.');
    return lines.join('\n');
  }

  if (evidence.length === 0) {
    lines.push('**Status:** Insufficient evidence for governance recommendation.');
    lines.push('');
    lines.push('**Action:** Register at least one evidence record before proceeding with review.');
    return lines.join('\n');
  }

  const targetLevel = computeTargetLevel(currentLevelIndex, claims, evidence);
  const gaps = identifyGaps(currentLevelIndex, targetLevel, evidence);

  const validClaims = claims.filter((c) => c.evidenceRefs.length > 0).length;
  const totalClaims = claims.length;

  lines.push(`**Current L-Level:** ${product.currentLLevel}`);
  const recLevel = levelAtIndex(targetLevel);
  lines.push(`**Recommended Target:** ${recLevel}`);
  lines.push(`**Confidence:** ${computeRecommendationConfidence(claims, evidence)}`);
  lines.push('');

  if (gaps.length === 0) {
    lines.push('**Assessment:** No critical gaps identified. Evidence posture is consistent with target level.');
  } else {
    lines.push('**Identified Gaps:**');
    for (const gap of gaps) {
      lines.push(`- ${gap}`);
    }
  }

  lines.push('');
  lines.push(`**Claim Coverage:** ${validClaims}/${totalClaims} claims have evidence.`);
  lines.push(`**Evidence Base:** ${evidence.length} records across ${countTiers(evidence)} tiers.`);

  const expiredCount = evidence.filter((e) => isExpired(e.freshness.expires)).length;
  if (expiredCount > 0) {
    lines.push(`**⚠ Expired Evidence:** ${expiredCount} record(s) require refresh.`);
  }

  lines.push('');
  lines.push('**Recommendation:**');
  if (gaps.length > 0) {
    lines.push('1. Address identified gaps before pursuing higher L-level.');
    lines.push('2. Refresh expired or expiring evidence.');
    lines.push('3. Conduct peer review of current evidence claims.');
  } else {
    lines.push('1. Continue monitoring evidence freshness.');
    lines.push('2. Maintain current evidence quality standards.');
    lines.push('3. Consider promotion review if strategic intent supports advancement.');
  }

  return lines.join('\n');
}

export function computeTargetLevel(
  currentIndex: number,
  claims: Claim[],
  evidence: Evidence[],
): number {
  if (evidence.length === 0) {
    return 0;
  }

  const tierCount = countTiers(evidence);
  const avgScore =
    evidence.reduce((s, e) => s + e.score, 0) / evidence.length;
  const highConfidenceClaims = claims.filter((c) => c.confidence === 'High').length;

  let target = currentIndex;

  if (tierCount >= 2 && avgScore >= 1.5) {
    target = Math.max(target, 3);
  }
  if (tierCount >= 4 && avgScore >= 2.0 && highConfidenceClaims >= 1) {
    target = Math.max(target, 4);
  }
  if (tierCount >= 5 && avgScore >= 2.5 && highConfidenceClaims >= 3) {
    target = Math.max(target, 5);
  }
  if (tierCount >= 6 && avgScore >= 2.8 && highConfidenceClaims >= 5) {
    target = Math.max(target, 6);
  }

  return target;
}

export function identifyGaps(
  currentIndex: number,
  targetIndex: number,
  evidence: Evidence[],
): string[] {
  const gaps: string[] = [];

  if (targetIndex >= 3) {
    const t1 = evidence.filter((e) => e.tier === 'T1');
    const t2 = evidence.filter((e) => e.tier === 'T2');
    if (t1.length === 0) {
      gaps.push('Missing T1 (existence) evidence');
    }
    if (t2.length === 0) {
      gaps.push('Missing T2 (implementation) evidence');
    }
  }

  if (targetIndex >= 4) {
    const t3 = evidence.filter((e) => e.tier === 'T3');
    const t4 = evidence.filter((e) => e.tier === 'T4');
    if (t3.length === 0) {
      gaps.push('Missing T3 (integration) evidence');
    }
    if (t4.length === 0) {
      gaps.push('Missing T4 (testing) evidence');
    }
  }

  if (targetIndex >= 5) {
    const t5 = evidence.filter((e) => e.tier === 'T5');
    const t6 = evidence.filter((e) => e.tier === 'T6');
    if (t5.length === 0) {
      gaps.push('Missing T5 (governance) evidence');
    }
    if (t6.length === 0) {
      gaps.push('Missing T6 (operational) evidence');
    }
  }

  if (targetIndex >= 6) {
    const t7 = evidence.filter((e) => e.tier === 'T7');
    if (t7.length === 0) {
      gaps.push('Missing T7 (production) evidence');
    }
  }

  return gaps;
}

export function computeRecommendationConfidence(
  claims: Claim[],
  evidence: Evidence[],
): 'High' | 'Medium' | 'Low' {
  if (claims.length === 0 || evidence.length === 0) {
    return 'Low';
  }
  const highClaims = claims.filter((c) => c.confidence === 'High').length;
  const strongEvidence = evidence.filter((e) => e.strength === 'Strong').length;

  const claimRatio = highClaims / claims.length;
  const evRatio = strongEvidence / evidence.length;

  if (claimRatio >= 0.6 && evRatio >= 0.5) {
    return 'High';
  }
  if (claimRatio >= 0.3 && evRatio >= 0.2) {
    return 'Medium';
  }
  return 'Low';
}
