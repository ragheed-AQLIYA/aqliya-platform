import { Claim, Evidence, Product, Decision, Authority, Source } from '../../types/entities';
import { isExpired, daysUntilExpiry } from '../../shared/date';
import {
  EntityIndex, EvidenceIndex, ProductIndex, DecisionIndex, AuthorityIndex, SourceIndex,
} from '../execution-context';

export function buildEntityIndex(claims: Claim[], evidence: Evidence[], products: Product[]): EntityIndex {
  const byId = new Map<string, Claim>();
  const byProduct = new Map<string, Claim[]>();
  const byDimension = new Map<string, Claim[]>();
  const byAuthority = new Map<string, Claim[]>();
  const withoutEvidence: Claim[] = [];

  for (const c of claims) {
    byId.set(c.id, c);

    const prod = byProduct.get(c.product) || [];
    prod.push(c);
    byProduct.set(c.product, prod);

    const dim = byDimension.get(c.dimension) || [];
    dim.push(c);
    byDimension.set(c.dimension, dim);

    for (const a of c.authorities) {
      const auth = byAuthority.get(a) || [];
      auth.push(c);
      byAuthority.set(a, auth);
    }

    if (c.evidenceRefs.length === 0) withoutEvidence.push(c);
  }

  const at100 = claims.filter(c => c.completeness >= 100).length;
  const above80 = claims.filter(c => c.completeness >= 80).length;
  const avg = claims.length > 0 ? claims.reduce((s, c) => s + c.completeness, 0) / claims.length : 0;

  return {
    byId, byProduct, byDimension, byAuthority, withoutEvidence,
    completenessStats: { total: claims.length, above80, at100, avg: Math.round(avg * 100) / 100 },
  };
}

export function buildEvidenceIndex(evidence: Evidence[], claims: Claim[]): EvidenceIndex {
  const byId = new Map<string, Evidence>();
  const byProduct = new Map<string, Evidence[]>();
  const byTier = new Map<string, Evidence[]>();
  const bySource = new Map<string, Evidence[]>();
  const orphaned: Evidence[] = [];

  const allClaimRefs = new Set(claims.flatMap(c => c.evidenceRefs));

  for (const e of evidence) {
    byId.set(e.id, e);

    const tier = byTier.get(e.tier) || [];
    tier.push(e);
    byTier.set(e.tier, tier);

    const src = bySource.get(e.sourceRef) || [];
    src.push(e);
    bySource.set(e.sourceRef, src);

    if (!allClaimRefs.has(e.id)) orphaned.push(e);
  }

  // Map evidence to products via claims
  for (const claim of claims) {
    for (const evRef of claim.evidenceRefs) {
      const ev = byId.get(evRef);
      if (ev) {
        const prod = byProduct.get(claim.product) || [];
        if (!prod.find(p => p.id === ev.id)) {
          prod.push(ev);
          byProduct.set(claim.product, prod);
        }
      }
    }
  }

  let fresh = 0, expiring = 0, expired = 0;
  for (const e of evidence) {
    if (isExpired(e.freshness.expires)) expired++;
    else if (daysUntilExpiry(e.freshness.expires) <= 30) expiring++;
    else fresh++;
  }

  return { byId, byProduct, byTier, bySource, orphaned, freshnessStats: { total: evidence.length, fresh, expiring, expired } };
}

export function buildProductIndex(products: Product[]): ProductIndex {
  const byId = new Map<string, Product>();
  const byType = new Map<string, Product[]>();
  const byKA = new Map<string, Product[]>();
  const withoutKA: Product[] = [];
  const withoutAUTH: Product[] = [];
  const disputed: Product[] = [];

  for (const p of products) {
    byId.set(p.id, p);

    const type = byType.get(p.entityType) || [];
    type.push(p);
    byType.set(p.entityType, type);

    const ka = byKA.get(p.knowledgeArea) || [];
    ka.push(p);
    byKA.set(p.knowledgeArea, ka);

    if (!p.knowledgeArea) withoutKA.push(p);
    if (!p.authority) withoutAUTH.push(p);
    if (p.lLevelStatus === 'Disputed') disputed.push(p);
  }

  return { byId, byType, byKA, withoutKA, withoutAUTH, disputed };
}

export function buildDecisionIndex(decisions: Decision[]): DecisionIndex {
  const byId = new Map<string, Decision>();
  const byProduct = new Map<string, Decision[]>();
  const byType = new Map<string, Decision[]>();
  const activeMAT: Decision[] = [];
  const stale: Decision[] = [];

  for (const d of decisions) {
    byId.set(d.id, d);

    const t = byType.get(d.type) || [];
    t.push(d);
    byType.set(d.type, t);

    if (d.type === 'MAT' && d.status === 'Active') activeMAT.push(d);

    if (d.reviewDate) {
      try {
        const review = new Date(d.reviewDate);
        if (review < new Date()) stale.push(d);
      } catch { /* skip unparseable dates */ }
    }

    for (const claimRef of d.affectedClaims) {
      const prod = byProduct.get(claimRef) || [];
      prod.push(d);
      byProduct.set(claimRef, prod);
    }
  }

  return { byId, byProduct, byType, activeMAT, stale };
}

export function buildAuthorityIndex(authorities: Authority[]): AuthorityIndex {
  const byId = new Map<string, Authority>();
  const byKA = new Map<string, Authority[]>();
  const chain = new Map<string, Authority>();

  for (const a of authorities) {
    byId.set(a.id, a);

    const ka = byKA.get(a.knowledgeArea) || [];
    ka.push(a);
    byKA.set(a.knowledgeArea, ka);

    if (a.supersedes) chain.set(a.supersedes, a);
  }

  return { byId, byKA, chain };
}

export function buildSourceIndex(sources: Source[]): SourceIndex {
  const byId = new Map<string, Source>();
  const byType = new Map<string, Source[]>();
  const byDocument = new Map<string, Source[]>();

  for (const s of sources) {
    byId.set(s.id, s);

    const t = byType.get(s.type) || [];
    t.push(s);
    byType.set(s.type, t);

    for (const doc of s.containedIn) {
      const d = byDocument.get(doc) || [];
      d.push(s);
      byDocument.set(doc, d);
    }
  }

  return { byId, byType, byDocument };
}
