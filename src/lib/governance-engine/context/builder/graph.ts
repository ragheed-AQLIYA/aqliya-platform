import { Claim, Evidence, Product, Authority } from '../../types/entities';
import { RelationshipGraph } from '../execution-context';

export function buildGraph(claims: Claim[], evidence: Evidence[], products: Product[], authorities: Authority[]): RelationshipGraph {
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
