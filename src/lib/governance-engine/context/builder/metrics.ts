import { Claim, Evidence, Product, Decision, Authority, Source } from '../../types/entities';
import { GovernanceMetrics, ChainMap } from '../execution-context';

export function computeMetrics(
  claims: Claim[], evidence: Evidence[], products: Product[],
  decisions: Decision[], authorities: Authority[], sources: Source[],
  chains: ChainMap,
): GovernanceMetrics {
  const sharedEv = evidence.filter(e => e.reusable).length;
  const totalEv = evidence.length;
  const highConf = claims.filter(c => c.confidence === 'High').length;
  const strongEv = evidence.filter(e => e.strength === 'Strong').length;
  const canonicalEv = evidence.filter(e => e.reusable).length;
  const reusedCanonical = canonicalEv; // simplified

  return {
    totalClaims: claims.length,
    totalEvidence: evidence.length,
    totalProducts: products.length,
    totalDecisions: decisions.length,
    totalAuthorities: authorities.length,
    totalSources: sources.length,
    reuseRatio: totalEv > 0 ? Math.round((sharedEv / totalEv) * 10000) / 100 : 0,
    evidenceYield: totalEv > 0 ? Math.round((claims.length / totalEv) * 100) / 100 : 0,
    canonicalLeverage: canonicalEv > 0 ? Math.round((reusedCanonical / canonicalEv) * 10000) / 100 : 0,
    avgCompleteness: claims.length > 0 ? Math.round(claims.reduce((s, c) => s + c.completeness, 0) / claims.length * 100) / 100 : 0,
    avgConfidence: claims.length > 0 ? Math.round((highConf / claims.length) * 10000) / 100 : 0,
    integrityScore: claims.length > 0 ? Math.round((chains.complete / claims.length) * 10000) / 100 : 0,
    coverageQualityIndex: claims.length > 0 && totalEv > 0
      ? Math.round(((chains.complete / claims.length) * (strongEv / totalEv) * (highConf / claims.length)) * 10000) / 100
      : 0,
  };
}
