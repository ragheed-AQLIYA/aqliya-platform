import {
  type Claim,
  type Evidence,
  type GovernanceRegistries,
  type Product,
} from '../../types/entities';
import { ExecutionContext } from '../../context/execution-context';
import { type IntegrityScores, TIERS } from './common';

function computeClaimCoverage(claims: Claim[]): number {
  if (claims.length === 0) {
    return 0;
  }
  const withEvidence = claims.filter((c) => c.evidenceRefs.length > 0).length;
  return withEvidence / claims.length;
}

function computeEvidenceCoverage(evidence: Evidence[]): number {
  const tierMap = new Map(TIERS.map((t) => [t, 0]));
  for (const ev of evidence) {
    tierMap.set(ev.tier, (tierMap.get(ev.tier) ?? 0) + 1);
  }
  let populatedTiers = 0;
  for (const tier of TIERS) {
    if ((tierMap.get(tier) ?? 0) > 0) {
      populatedTiers++;
    }
  }
  return populatedTiers / TIERS.length;
}

function computeAuthorityCoverage(product: Product, registries: GovernanceRegistries, ctx: ExecutionContext): number {
  const productClaims = ctx.claims.byProduct.get(product.id) ?? registries.claims.filter((c) => c.product === product.id);
  if (productClaims.length === 0) {
    return 0;
  }
  const authIds = new Set<string>();
  for (const c of productClaims) {
    for (const a of c.authorities) {
      authIds.add(a);
    }
  }
  let found = 0;
  for (const authId of authIds) {
    if (ctx.authorities.byId.has(authId) || registries.authorities.some((a) => a.id === authId)) {
      found++;
    }
  }
  return authIds.size > 0 ? found / authIds.size : 0;
}

function computeSourceCoverage(evidence: Evidence[], registries: GovernanceRegistries, ctx: ExecutionContext): number {
  if (evidence.length === 0) {
    return 0;
  }
  const validSource = evidence.filter((ev) =>
    ctx.sources.byId.has(ev.sourceRef) || registries.sources.some((s) => s.id === ev.sourceRef),
  ).length;
  return validSource / evidence.length;
}

function isEvidenceFresh(evidence: Evidence): boolean {
  if (!evidence.freshness?.expires) {
    return false;
  }
  const expiry = new Date(evidence.freshness.expires);
  const now = new Date();
  return now < expiry;
}

function computeFreshnessScore(evidence: Evidence[]): number {
  if (evidence.length === 0) {
    return 0;
  }
  let freshCount = 0;
  for (const ev of evidence) {
    if (isEvidenceFresh(ev)) {
      freshCount++;
    }
  }
  return freshCount / evidence.length;
}

function computeProvenanceScore(
  claims: Claim[],
  evidence: Evidence[],
  registries: GovernanceRegistries,
  ctx: ExecutionContext,
): number {
  if (claims.length === 0 || evidence.length === 0) {
    return 0;
  }
  const sourceIds = new Set(evidence.map((ev) => ev.sourceRef));
  let withDeepChain = 0;
  for (const srcId of sourceIds) {
    const source = ctx.sources.byId.get(srcId) ?? registries.sources.find((s) => s.id === srcId);
    if (source && source.containedIn.length > 0) {
      withDeepChain++;
    }
  }
  return sourceIds.size > 0 ? withDeepChain / sourceIds.size : 0;
}

export function computeIntegrityScores(
  product: Product,
  claims: Claim[],
  evidence: Evidence[],
  registries: GovernanceRegistries,
  ctx: ExecutionContext,
): IntegrityScores {
  const claimCoverage = computeClaimCoverage(claims);
  const evidenceCoverage = computeEvidenceCoverage(evidence);
  const authorityCoverage = computeAuthorityCoverage(product, registries, ctx);
  const sourceCoverage = computeSourceCoverage(evidence, registries, ctx);
  const freshness = computeFreshnessScore(evidence);
  const provenance = computeProvenanceScore(claims, evidence, registries, ctx);

  return { claimCoverage, evidenceCoverage, authorityCoverage, sourceCoverage, freshness, provenance };
}

export function buildIntegrityScoreSection(scores: IntegrityScores): string {
  const lines: string[] = [];
  lines.push('## Integrity Score');
  lines.push('');
  lines.push('| Dimension | Score |');
  lines.push('|-----------|-------|');
  lines.push(`| Claim Coverage | ${scores.claimCoverage.toFixed(2)} |`);
  lines.push(`| Evidence Coverage | ${scores.evidenceCoverage.toFixed(2)} |`);
  lines.push(`| Authority Coverage | ${scores.authorityCoverage.toFixed(2)} |`);
  lines.push(`| Source Coverage | ${scores.sourceCoverage.toFixed(2)} |`);
  lines.push(`| Freshness | ${scores.freshness.toFixed(2)} |`);
  lines.push(`| Provenance | ${scores.provenance.toFixed(2)} |`);

  const average =
    (scores.claimCoverage +
      scores.evidenceCoverage +
      scores.authorityCoverage +
      scores.sourceCoverage +
      scores.freshness +
      scores.provenance) /
    6;

  lines.push('');
  lines.push(`**Overall Integrity:** ${average.toFixed(2)}`);

  const quality =
    average >= 0.8
      ? 'Strong'
      : average >= 0.5
        ? 'Moderate'
        : 'Weak';
  lines.push(`**Quality Classification:** ${quality}`);

  return lines.join('\n');
}
