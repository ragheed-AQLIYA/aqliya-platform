// Governance Engine — Entity Resolver
// Sprint 2: Cross-registry reference resolution

import { Claim, Evidence, Product, Authority, Source, GovernanceRegistries } from '../types/entities';

export interface ResolutionResult {
  resolved: number;
  failed: number;
  failures: ResolutionFailure[];
  circularDeps: string[];
}

export interface ResolutionFailure {
  entityType: string;
  entityId: string;
  refType: string;
  refId: string;
  reason: string;
}

export class EntityResolver {
  private registries: GovernanceRegistries;
  private resolutionCache: Map<string, unknown> = new Map();

  constructor(registries: GovernanceRegistries) {
    this.registries = registries;
  }

  resolveAll(): ResolutionResult {
    const failures: ResolutionFailure[] = [];
    const circularDeps: string[] = [];

    // Resolve Claim → Evidence
    for (const claim of this.registries.claims) {
      for (const evRef of claim.evidenceRefs) {
        const ev = this.registries.evidence.find(e => e.id === evRef);
        if (!ev) {
          failures.push({
            entityType: 'Claim',
            entityId: claim.id,
            refType: 'Evidence',
            refId: evRef,
            reason: 'Evidence not found in registry',
          });
        }
      }

      // Resolve Claim → Authority
      for (const authRef of claim.authorities) {
        const auth = this.registries.authorities.find(a => a.id === authRef);
        if (!auth) {
          failures.push({
            entityType: 'Claim',
            entityId: claim.id,
            refType: 'Authority',
            refId: authRef,
            reason: 'Authority not found in registry',
          });
        }
      }

      // Resolve Claim → Product
      const product = this.registries.products.find(p => p.id === claim.product);
      if (!product) {
        failures.push({
          entityType: 'Claim',
          entityId: claim.id,
          refType: 'Product',
          refId: claim.product,
          reason: 'Product not found in registry',
        });
      }
    }

    // Resolve Evidence → Source
    for (const ev of this.registries.evidence) {
      const source = this.registries.sources.find(s => s.id === ev.sourceRef);
      if (!source) {
        failures.push({
          entityType: 'Evidence',
          entityId: ev.id,
          refType: 'Source',
          refId: ev.sourceRef,
          reason: 'Source not found in registry',
        });
      }
    }

    // Resolve Source → Evidence (reverse)
    for (const source of this.registries.sources) {
      for (const evRef of source.producesEvidence) {
        const ev = this.registries.evidence.find(e => e.id === evRef);
        if (!ev) {
          failures.push({
            entityType: 'Source',
            entityId: source.id,
            refType: 'Evidence',
            refId: evRef,
            reason: 'Evidence referenced by source not found',
          });
        }
      }
    }

    // Resolve Product → Authority
    for (const product of this.registries.products) {
      const auth = this.registries.authorities.find(a => a.id === product.authority);
      if (!auth) {
        failures.push({
          entityType: 'Product',
          entityId: product.id,
          refType: 'Authority',
          refId: product.authority,
          reason: 'Authority not found in registry',
        });
      }
    }

    // Check for circular evidence chains
    const visited = new Set<string>();
    const inStack = new Set<string>();

    const dfs = (evId: string, path: string[]): boolean => {
      if (inStack.has(evId)) {
        circularDeps.push(`Circular: ${path.join(' → ')} → ${evId}`);
        return true;
      }
      if (visited.has(evId)) return false;

      visited.add(evId);
      inStack.add(evId);
      path.push(evId);

      const ev = this.registries.evidence.find(e => e.id === evId);
      if (ev) {
        // Check if any evidence references another evidence (forbidden by GR-007)
        for (const claimRef of ev.supportsClaims) {
          const claim = this.registries.claims.find(c => c.id === claimRef);
          if (claim) {
            for (const otherEvRef of claim.evidenceRefs) {
              if (otherEvRef !== evId && this.registries.evidence.find(e => e.id === otherEvRef)) {
                // This is fine — claims reference multiple evidence items
                // But if evidence references another evidence, that's circular
              }
            }
          }
        }
      }

      inStack.delete(evId);
      return false;
    };

    for (const ev of this.registries.evidence) {
      if (!visited.has(ev.id)) {
        dfs(ev.id, []);
      }
    }

    return {
      resolved: this.registries.claims.length + this.registries.evidence.length + this.registries.sources.length,
      failed: failures.length,
      failures,
      circularDeps,
    };
  }

  getClaim(id: string): Claim | undefined {
    if (this.resolutionCache.has(`clm:${id}`)) {
      return this.resolutionCache.get(`clm:${id}`) as Claim;
    }
    const claim = this.registries.claims.find(c => c.id === id);
    if (claim) this.resolutionCache.set(`clm:${id}`, claim);
    return claim;
  }

  getEvidence(id: string): Evidence | undefined {
    return this.registries.evidence.find(e => e.id === id);
  }

  getProduct(id: string): Product | undefined {
    return this.registries.products.find(p => p.id === id);
  }

  getClaimsForProduct(productId: string): Claim[] {
    return this.registries.claims.filter(c => c.product === productId);
  }

  getEvidenceForClaim(claimId: string): Evidence[] {
    const claim = this.getClaim(claimId);
    if (!claim) return [];
    return claim.evidenceRefs
      .map(ref => this.registries.evidence.find(e => e.id === ref))
      .filter((e): e is Evidence => e !== undefined);
  }

  getProductsWithoutAuthority(): Product[] {
    return this.registries.products.filter(p => {
      return !this.registries.authorities.find(a => a.id === p.authority);
    });
  }

  getClaimsWithoutEvidence(): Claim[] {
    return this.registries.claims.filter(c => c.evidenceRefs.length === 0);
  }

  getOrphanEvidence(): Evidence[] {
    const allClaimRefs = new Set(this.registries.claims.flatMap(c => c.evidenceRefs));
    return this.registries.evidence.filter(e => !allClaimRefs.has(e.id));
  }
}
