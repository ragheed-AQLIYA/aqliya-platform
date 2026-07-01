// Governance Engine — Execution Context Builder
// CR-01: Builds centralized, immutable, indexed context once
// All downstream modules consume context, not raw registries

import { GovernanceRegistries, Claim, Evidence, Product, Decision, Authority, Source } from '../types/entities';
import { isExpired, daysUntilExpiry } from '../shared/date';
import {
  ExecutionContext,
  EntityIndex, EvidenceIndex, ProductIndex, DecisionIndex,
  AuthorityIndex, SourceIndex, ChainMap, RelationshipGraph, GovernanceMetrics,
} from './execution-context';

function buildEntityIndex(claims: Claim[], evidence: Evidence[], products: Product[]): EntityIndex {
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

function buildEvidenceIndex(evidence: Evidence[], claims: Claim[]): EvidenceIndex {
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

function buildProductIndex(products: Product[]): ProductIndex {
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

function buildDecisionIndex(decisions: Decision[]): DecisionIndex {
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

function buildAuthorityIndex(authorities: Authority[]): AuthorityIndex {
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

function buildSourceIndex(sources: Source[]): SourceIndex {
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

function buildChains(claims: Claim[], evidence: Evidence[], sources: Source[]): ChainMap {
  const byClaim = new Map<string, { depth: number; complete: boolean; brokenAt?: string }>();
  let complete = 0, broken = 0, totalDepth = 0;
  let maxDepth = 0;
  const brokenChains: string[] = [];
  const orphanChains: string[] = [];
  const depthBuckets = new Map<number, string[]>(); // depth → claim IDs

  for (const claim of claims) {
    let depth = 1;
    let isComplete = true;
    let brokenAt: string | undefined;

    // No evidence refs = orphaned claim
    if (claim.evidenceRefs.length === 0) {
      orphanChains.push(claim.id);
      byClaim.set(claim.id, { depth: 0, complete: true, brokenAt: undefined });
      totalDepth += 0;
      complete++;
      continue;
    }

    for (const evRef of claim.evidenceRefs) {
      depth = 2;
      const ev = evidence.find(e => e.id === evRef);
      if (!ev) { isComplete = false; brokenAt = `Missing: ${evRef}`; break; }

      depth = 3;
      const src = sources.find(s => s.id === ev.sourceRef);
      if (!src) { isComplete = false; brokenAt = `Missing source for: ${evRef}`; break; }
    }

    byClaim.set(claim.id, { depth, complete: isComplete, brokenAt });
    if (isComplete) complete++; else { broken++; brokenChains.push(claim.id); }

    totalDepth += depth;
    if (depth > maxDepth) maxDepth = depth;

    const bucket = depthBuckets.get(depth) || [];
    bucket.push(claim.id);
    depthBuckets.set(depth, bucket);
  }

  // Determine longest chains (all claims at maxDepth)
  const longestChain = depthBuckets.get(maxDepth) || [];

  return {
    byClaim,
    complete,
    broken,
    avgDepth: claims.length > 0 ? Math.round((totalDepth / claims.length) * 100) / 100 : 0,
    maxDepth,
    brokenChains,
    longestChain,
    orphanChains,
  };
}

function buildGraph(claims: Claim[], evidence: Evidence[], products: Product[], authorities: Authority[]): RelationshipGraph {
  const adjacency = new Map<string, string[]>();
  const claimsToEvidence = new Map<string, string[]>();
  const evidenceToSource = new Map<string, string>();
  const claimToProduct = new Map<string, string>();
  const claimToAuthority = new Map<string, string[]>();

  for (const claim of claims) {
    claimsToEvidence.set(claim.id, [...claim.evidenceRefs]);
    claimToProduct.set(claim.id, claim.product);
    claimToAuthority.set(claim.id, [...claim.authorities]);

    const neighbors = adjacency.get(claim.id) || [];
    for (const ev of claim.evidenceRefs) {
      if (!neighbors.includes(ev)) neighbors.push(ev);
    }
    adjacency.set(claim.id, neighbors);
  }

  for (const ev of evidence) {
    if (ev.sourceRef) {
      evidenceToSource.set(ev.id, ev.sourceRef);
      const neighbors = adjacency.get(ev.id) || [];
      if (!neighbors.includes(ev.sourceRef)) neighbors.push(ev.sourceRef);
      adjacency.set(ev.id, neighbors);
    }
  }

  return { adjacency, claimsToEvidence, evidenceToSource, claimToProduct, claimToAuthority };
}

function computeMetrics(
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

function sortIds<T extends { id: string }>(items: T[]): string[] {
  return items.map(i => i.id).sort((a, b) => a.localeCompare(b));
}

// ─── Public Builder ─────────────────────────────────────────┐

export class ExecutionContextBuilder {
  static build(registries: GovernanceRegistries): ExecutionContext {
    const frozenRegistries = Object.freeze({ ...registries, frozen: true }) as GovernanceRegistries;

    const claims = buildEntityIndex(registries.claims, registries.evidence, registries.products);
    const evidence = buildEvidenceIndex(registries.evidence, registries.claims);
    const products = buildProductIndex(registries.products);
    const decisions = buildDecisionIndex(registries.decisions);
    const authorities = buildAuthorityIndex(registries.authorities);
    const sources = buildSourceIndex(registries.sources);
    const chains = buildChains(registries.claims, registries.evidence, registries.sources);
    const graph = buildGraph(registries.claims, registries.evidence, registries.products, registries.authorities);
    const metrics = computeMetrics(
      registries.claims, registries.evidence, registries.products,
      registries.decisions, registries.authorities, registries.sources, chains,
    );

    return {
      registries: frozenRegistries as Readonly<GovernanceRegistries>,
      frozen: true,
      claims, evidence, products, decisions, authorities, sources,
      chains, graph, metrics,
      sortedClaimIds: sortIds(registries.claims),
      sortedEvidenceIds: sortIds(registries.evidence),
      sortedProductIds: sortIds(registries.products),
      sortedDecisionIds: sortIds(registries.decisions),
    };
  }
}
